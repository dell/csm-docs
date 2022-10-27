---
title: High Availability
linktitle: High Availability
weight: 5
description: >
  High Availability support for CSI PowerMax
---
One of the goals of high availability is to eliminate single points of failure in a storage system. In Kubernetes, this can mean that a single PV represents multiple read/write enabled volumes on different arrays, located at reasonable distances with both the volumes in sync with each other. If one of the volumes goes down, there will still be another volume available for read and write. This kind of high availability can be achieved by using SRDF Metro replication mode supported only by Powermax arrays.

## SRDF Metro Architecture

![metro architecture diagram](../metro.png)

In SRDF metro configurations:
* R2 devices are Read/Write accessible to application hosts.
* Application host can write to both the R1 and R2 sides of the device pair.
* R2 devices assume the same external device identity(geometry, device WWN) as the R1 devices.
  All the above characteristic makes SRDF metro best suited for the scenarios in which high availability of data is desired.

With respect to Kubernetes, the SRDF metro mode works in single cluster scenarios. In the metro, both the arrays—[arrays with SRDF metro link setup between them](../deployment/powermax/#on-storage-array)—involved in the replication are managed by the same `csi-powermax` driver. The replication is triggered by creating a volume using a `StorageClass` with metro-related parameters.
The driver on receiving the metro-related parameters in the `CreateVolume` call creates a metro replicated volume and the details about both the volumes are returned in the volume context to the Kubernetes cluster. So, the `PV` created in the process represents a pair of metro replicated volumes. When a `PV`, representing a pair of metro replicated volumes, is claimed by a pod, the host treats each of the volumes represented by the single `PV` as a separate data path. The switching between the paths, to read and write the data, is managed by the multipath driver. The switching happens automatically, as configured by the user—in round-robin fashion or otherwise—or it can happen if one of the paths goes down. For details on Linux multipath driver setup, [click here](../../csidriver/installation/helm/powermax/#linux-multipathing-requirements).

The creation of volumes in SRDF metro mode doesn't involve the replication sidecar or the common controller, nor does it cause the creation of any replication related custom resources; it just needs a `csi-powermax` driver that implements the `CreateVolume` grpc endpoint with SRDF metro capability for it to work.

### Usage
The metro replicated volumes are created just like the normal volumes, but the `StorageClass` contains some
extra parameters related to metro replication. A `StorageClass` to create metro replicated volumes may look as follows:

```yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: storage-class-metro
provisioner: driver.dellemc.com
parameters:
  SRP: 'SRP_1'
  SYMID: '000000000001'
  ServiceLevel: 'Bronze'
  replication.storage.dell.com/IsReplicationEnabled: 'true'
  replication.storage.dell.com/RdfGroup: '7' # Optional for Auto SRDF group 
  replication.storage.dell.com/RdfMode: 'METRO'
  replication.storage.dell.com/RemoteRDFGroup: '7' # Optional for Auto SRDF group
  replication.storage.dell.com/RemoteSYMID: '000000000002'
  replication.storage.dell.com/RemoteServiceLevel: 'Bronze'
reclaimPolicy: Delete
volumeBindingMode: Immediate
```

> Note: Different namespaces can share the same RDF group for creating volumes.


### Snapshots on SRDF Metro volumes
A snapshot can be created on either of the volumes in the metro volume pair depending on the parameters in the `VolumeSnapshotClass`.
The snapshots are by default created on the volumes on the R1 side of the SRDF metro pair, but if a Symmetrix id is specified in the `VolumeSnapshotClass` parameters, the driver creates the snapshot on the specified array; the specified array can either be the R1 or the R2 array. A `VolumeSnapshotClass` with symmetrix id specified in parameters may look as follows:

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: sample-snapclass
driver: driver.dellemc.com
deletionPolicy: Delete
parameters:
  SYMID: '000000000001'
```

>Note: Restoring Snapshots on metro volumes is currently not supported
