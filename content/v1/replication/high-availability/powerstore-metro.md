---
title: PowerStore Metro
linktitle: PowerStore Metro
weight: 2
description: >
  High Availability support for CSI PowerStore
---

## PowerStore Metro Architecture

![metro architecture diagram](../../powerstore-metro.png)

In PowerStore Metro configurations:
* The application host can write data to both sides of the Metro volume.
* The devices in the Metro volume are configured with the same external device identity, including the geometry and device WWN.
* When Metro is configured on the volume, the PowerStore system from which the metro source is configured is automatically set as preferred and the other is configured as non-preferred.

With respect to Kubernetes, the PowerStore Metro mode works in single cluster scenarios. When utilizing Metro, both the arrays—[arrays with metro link setup between them](../../../deployment/helm/modules/installation/replication/powerstore/#on-storage-array)—involved in the replication are managed by the same `csi-powerstore` driver. The replication is triggered by creating a volume using a `StorageClass` with metro-related parameters.
The driver on receiving the metro-related parameters in the `CreateVolume` call creates a metro replicated volume and the details about both the volumes are returned in the volume context to the Kubernetes cluster. The Persistent Volume (PV) created in the process represents a pair of metro replicated volumes. When a `PV`, representing a pair of metro replicated volumes, is claimed by a pod, the host treats each of the volumes represented by the single `PV` as a separate data path. The switching between the paths, to read and write the data, is managed by the multipath driver. The switching happens automatically, as configured by the user—in round-robin fashion or otherwise—or when one of the paths goes down. For details on Linux multipath driver setup, [click here](../../../deployment/helm/drivers/installation/powerstore#linux-multipathing-requirements).

The creation of volumes in metro mode doesn't involve the replication sidecar or the common replication controller, nor does it cause the creation of any replication related custom resources. It just needs the `csi-powerstore` driver that implements the `CreateVolume` gRPC endpoint with metro capability for it to work.

### Usage
The Metro replicated volumes are created just like the normal volumes, but the `StorageClass` contains some
extra parameters related to metro replication. A `StorageClass` to create metro replicated volumes may look as follows:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: powerstore-metro
parameters:
  arrayID: PS000000000001
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/mode: METRO
  replication.storage.dell.com/remoteSystem: RT-D0002
allowVolumeExpansion: true
provisioner: csi-powerstore.dellemc.com
reclaimPolicy: Delete
volumeBindingMode: Immediate
```

> _**NOTE**_: Metro at volume group is not supported by the PowerStore driver.

When a Metro `PV` is created, the volumeHandle will have the format `<volumeID/globalID/protocol:remote-volumeID/remote-globalID>`.

### PowerStore Metro volume expansion
When a request is made to increase the size of a Metro `PV`, the metro replication session must be temporarily paused prior to the editing of Kubernetes resources. This can be done from the PowerStore Web UI or CLI. The size of the local/preferred volume is then increased. The metro session must then be manually resumed. It is important to note that the paths for the remote/non-preferred volume will not become active until the metro session is resumed and the remote/non-preferred volume reflects the updated size.

### Snapshots on PowerStore Metro volumes
When a VolumeSnapshot object is created for the Metro `PV`, snapshots are created on each side of the Metro session on the PowerStore systems. However, the VolumeSnapshot object only refers to the local/preferred side of the Metro volume. When a Metro `PV` is deleted, the remote/non-preferred volume, along with any snapshots associated with it, is also automatically deleted.

### Limitations
- PowerStore driver only supports uniform host configuration for Metro volume where the host has active paths to both PowerStore systems.
- Metro volume only supports FC and iSCSI protocols for host access.
- VolumeGroup Metro support is not currently available for uniform host configuration.
- Each Kubernetes node is automatically registered as a host object on both PowerStore systems when the node pods are running. However, the connectivity type of the host is set to 'Local Connectivity' by default. It needs to be updated manually with the correct 'Metro connectivity' option on both PowerStore systems using the PowerStore Manager UI.
- Actions that need to be performed on the Metro session, such as pausing, resuming, or changing the preferred side, can only be done through the PowerStore Manager UI.
- Some CSI Driver Capabilities, such as snapshot or clone, are not supported on the remote/non-preferred side of the Metro volume.
- The following [volume attributes](../../../csidriver/features/powerstore/#configurable-volume-attributes-optional) on PersistentVolumeClaims (PVCs) are not supported for Metro volumes: `csi.dell.com/volume_group_id`, `csi.dell.com/protection_policy_id` if the policy has replication rule.