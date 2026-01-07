---
title: PowerStore Metro
linktitle: PowerStore Metro
weight: 2
description: >
  High Availability support for CSI PowerStore
---

## Architecture

![metro architecture diagram](../../../../../images/replication/powerstore-metro.png)

### Metro Volume Behavior: Preferred Side and Witness

In PowerStore Metro configurations:

* The PowerStore Metro volume consists of two volumes on two PowerStore metro arrays with metro replication configured between them.
* When the replication session between the volumes is active, both volumes are capable of serving IOs.
* The devices in the Metro volume are configured with the same external device identity, including the geometry and device WWN.

When the replication session is broken but both arrays are still reachable, there is a possibility of split-brain where both the now disconnected volumes serve IOs and the data between them is not being synced. PowerStore Metro uses polarization to prevent this.
* The PowerStore system from which the metro source is configured is designated as "preferred" and the other as non-preferred.
* When the replication link is broken, the "preferred" side remains online and serves the IOs.
* If the preferred side is offline, non-preferred also remains offline. To handle such scenarios and add more resiliency to Metro volumes, it is recommended to configure a witness for the pair of PowerStores.

Note: For more details, especially regarding metro volume behavior during different failure scenarios, refer PowerStore Metro Volume documentation.

With respect to Kubernetes, the PowerStore Metro mode works in single cluster scenarios. When utilizing Metro, both the arrays—[arrays with metro link setup between them](../../../../getting-started/installation/kubernetes/powerstore/helm/csm-modules/replication/csi-driver/#on-storage-array)—involved in the replication are managed by the same `csi-powerstore` driver. The replication is triggered by creating a volume using a `StorageClass` with metro-related parameters.
The driver on receiving the metro-related parameters in the `CreateVolume` call creates a metro replicated volume and the details about both the volumes are returned in the volume context to the Kubernetes cluster. The Persistent Volume (PV) created in the process represents a pair of metro replicated volumes. When a `PV`, representing a pair of metro replicated volumes, is claimed by a pod, the host treats each of the volumes represented by the single `PV` as a separate data path. The switching between the paths, to read and write the data, is managed by the multipath driver. The switching happens automatically, as configured by the user—in round-robin fashion or otherwise—or when one of the paths goes down. For details on Linux multipath driver setup, [click here](../../../../getting-started/installation/kubernetes/powerstore/prerequisite/#linux-multipathing-requirements).

The creation of volumes in metro mode doesn't involve the replication sidecar or the common replication controller, nor does it cause the creation of any replication related custom resources. It just needs the `csi-powerstore` driver that implements the `CreateVolume` gRPC endpoint with metro capability for it to work.

--------------------

## Host Registration
> {{< message text="18" >}}

PowerStore optimizes metro data paths by providing configuration options to describe the host's location relative to the PowerStore system.

The csi-powerstore driver determines which optimization to use by iterating over a set of Host Connectivity options and comparing node labels against
the user-configured node selector statements (`nodeSelectorTerms`).

On driver startup, if a node's labels satisfy the selector terms for a Host Connectivity option, a host will be registered for the node. Nodes
that do not match any of the `nodeSelectorTerms` will remain unregistered.

### Secret Configuration
To utilize this feature:
- Add labels to the cluster nodes, or make note of existing node labels, that describe the topology between the cluster nodes and the PowerStore arrays.
- For each desired Host Connectivity option, create a set of `nodeSelectorTerms` to describe a set of nodes.
- Update the secret.yaml file used to generate the `powerstore-config` Secret.

Below are some examples that demonstrate what `nodeSelectorTerms` might look like for different metro topologies.

`nodeSelectorTerms` follow Kubernetes' Node Affinity format -- `requiredDuringSchedulingIgnoredDuringExecution`. For more information, see
[Assigning Pods to Nodes: Node Affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity), and for the full API
specification, see [Pod: NodeAffinity](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/#NodeAffinity).

> **Note:**
> For all Host Connectivity options, for each item under `arrays`, `nodeSelectorTerms` should be mutually exclusive in the set of nodes the selectors match.
> In other words, there should be no overlap in the nodes each `nodeSelectorTerms` matches.
> Host registration behavior is undefined for a node that matches more than one of the provided `nodeSelectorTerms`.

### Uniform Metro
Use the `hostConnectivity.metro` field to configure host connectivity for uniform metro.

**Host Connectivity Options:**
- `colocatedLocal`: Describes nodes that are located near the current PowerStore system.
- `colocatedRemote`: Describes nodes that are located near the replication target of the current PowerStore system.
- `colocatedBoth`: Describes nodes that are located near both the current PowerStore system and its replication pair.

> **Note:** If local, non-metro hosts are required alongside uniform metro hosts, use the `hostConnectivity.local` field to specify a set of label expressions
> that describe nodes whose host should be registered with this PowerStore, without optimization.

#### Examples -- Uniform Metro

##### Two Metro Zones
There are two PowerStore systems and two zones -- `zone-a` and `zone-b`
Nodes in the first zone are labeled `topology.kubernetes.io/zone: zone-a`, and Nodes in the second zone are labeled `topology.kubernetes.io/zone: zone-b`.

Using the configuration below:
- Nodes in `zone-a` will be registered as "co-located local" with PowerStore `PSbadcafef00d` and "co-located remote" with PowerStore `PSdecafc0ffee`.
- Nodes in `zone-b` will be registered as "co-located remote" with PowerStore `PSbadcafef00d` and "co-located local" with PowerStore `PSdecafc0ffee`.
```yaml
# secret.yaml
arrays:
  - endpoint: "https://11.0.0.1/api/rest"
    globalID: "PSbadcafef00d"
    username: "user"
    password: "password"
    skipCertificateValidation: true
    blockProtocol: "FC"
    hostConnectivity:
      metro:
        colocatedLocal:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-a"
        colocatedRemote:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-b"
  - endpoint: "https://11.0.0.2/api/rest"
    globalID: "PSdecafc0ffee"
    username: "user"
    password: "password"
    skipCertificateValidation: true
    blockProtocol: "FC"
    hostConnectivity:
      metro:
        colocatedLocal:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-b"
        colocatedRemote:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-a"
```

##### Three Metro Zones
There are two PowerStore systems and three zones -- `zone-a`, `zone-b`, and `zone-ab`.

Nodes in zone-a are labeled `topology.kubernetes.io/zone: zone-a`, nodes in zone-b are labeled `topology.kubernetes.io/zone: zone-b`, and
nodes in zone-ab are labeled `topology.kubernetes.io/zone: zone-ab`.

This example is similar to the example above, but adds a third zone that sits between the two existing zones. This new zone, `zone-ab`, requires access to both
PowerStore systems.

Using the configuration below, nodes in `zone-a` and `zone-b` will be registered with the PowerStore systems as described in the previous example, but
nodes in `zone-ab` will be registered as "co-located both" with both the `PSbadcafef00d` and `PSdecafc0ffee` PowerStore systems.
```yaml
# secret.yaml
arrays:
  - endpoint: "https://11.0.0.1/api/rest"
    globalID: "PSbadcafef00d"
    username: "user"
    password: "password"
    skipCertificateValidation: true
    blockProtocol: "FC"
    hostConnectivity:
      metro:
        colocatedLocal:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-a"
        colocatedRemote:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-b"
        colocatedBoth:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-ab"
  - endpoint: "https://11.0.0.2/api/rest"
    globalID: "PSdecafc0ffee"
    username: "user"
    password: "password"
    skipCertificateValidation: true
    blockProtocol: "FC"
    hostConnectivity:
      metro:
        colocatedLocal:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-b"
        colocatedRemote:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-a"
        colocatedBoth:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-ab"
```

##### Two Metro Zones and Additional Non-Metro Zones
This example demonstrates how to register additional nodes with a local-only host configuration.
Similar to the previous examples, the nodes in `zone-a` and `zone-b` will be registered with each PowerStore system using the node selector
terms listed under each optimization option.

If nodes exist that are not part of `zone-a` and `zone-b`, but should still be connected to the PowerStore systems, they can be added under the
`hostConnectivity.local` field.

The `nodeSelectorTerms` below match all nodes that do not have the `zone-a` or `zone-b` label values for the `topology.kubernetes.io/zone` label key.
```yaml
# secret.yaml
arrays:
  - endpoint: "https://11.0.0.1/api/rest"
    globalID: "PSbadcafef00d"
    username: "user"
    password: "password"
    skipCertificateValidation: true
    blockProtocol: "FC"
    hostConnectivity:
      local:
        nodeSelectorTerms:
          - matchExpressions:
              - key: "topology.kubernetes.io/zone"
                operator: "NotIn"
                values:
                  - "zone-a"
                  - "zone-b"
      metro:
        colocatedLocal:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-a"
        colocatedRemote:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-b"
  - endpoint: "https://11.0.0.2/api/rest"
    globalID: "PSdecafc0ffee"
    username: "user"
    password: "password"
    skipCertificateValidation: true
    blockProtocol: "FC"
    hostConnectivity:
      local:
        nodeSelectorTerms:
          - matchExpressions:
              - key: "topology.kubernetes.io/zone"
                operator: "NotIn"
                values:
                  - "zone-a"
                  - "zone-b"
      metro:
        colocatedLocal:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-b"
        colocatedRemote:
          nodeSelectorTerms:
            - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "In"
                  values:
                    - "zone-a"
```

### Non-Uniform Metro
Use the `hostConnectivity.local` field to configure host connectivity for non-uniform metro.

#### Examples -- Non-Uniform Metro

##### Two-Site Non-Uniform Metro
There are two PowerStore systems and two zones -- `zone-a` and `zone-b`.

Using the secret below, nodes in `zone-a` will only be registered with PowerStore `PSbadcafef00d`, and nodes in `zone-b` will
only be registered with PowerStore `PSdecafc0ffee`.

`Zone-a` nodes will have no connection to `PSdecafc0ffee` and `zone-b` nodes will have no connection to `PSbadcafef00d`.
```yaml
# secret.yaml
arrays:
  - endpoint: "https://11.0.0.1/api/rest"
    globalID: "PSbadcafef00d"
    username: "user"
    password: "password"
    skipCertificateValidation: true
    blockProtocol: "FC"
    hostConnectivity:
      local:
        nodeSelectorTerms:
          - matchExpressions:
              - key: "topology.kubernetes.io/zone"
                operator: "In"
                values:
                  - "zone-a"
  - endpoint: "https://11.0.0.2/api/rest"
    globalID: "PSdecafc0ffee"
    username: "user"
    password: "password"
    skipCertificateValidation: true
    blockProtocol: "FC"
    hostConnectivity:
      local:
        nodeSelectorTerms:
          - matchExpressions:
              - key: "topology.kubernetes.io/zone"
                operator: "In"
                values:
                  - "zone-b"
```

----------------

## StorageClass
The Metro replicated volumes are created just like the normal volumes, but the `StorageClass` contains some
extra parameters related to metro replication. A `StorageClass` to create metro replicated volumes may look as follows:

Example using `volumeBindingMode: Immediate`

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: powerstore-metro
parameters:
  arrayID: PSbadcafef00d
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/mode: METRO
  replication.storage.dell.com/remoteSystem: RT-D0002
allowVolumeExpansion: true
provisioner: csi-powerstore.dellemc.com
reclaimPolicy: Delete
volumeBindingMode: Immediate
```

Example using `volumeBindingMode: WaitForFirstConsumer`

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: powerstore-metro
parameters:
  arrayID: PSbadcafef00d
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/mode: METRO
  replication.storage.dell.com/remoteSystem: RT-D0002
allowVolumeExpansion: true
provisioner: csi-powerstore.dellemc.com
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowedTopologies:
  - matchLabelExpressions:
      - key: csi-powerstore.dellemc.com/xx.xxx.xx.xx-iscsi
        values: ["true"]
      - key: csi-powerstore.dellemc.com/xx.xx.xx.xx-iscsi
        values: ["true"]
```

> _**NOTE:**_
> - Metro support for hosts with Linux operating systems was added from [PowerStoreOS 4.0](https://infohub.delltechnologies.com/en-us/l/dell-powerstore-metro-volume-1/introduction-4503/).</br>
> - Metro volume groups are not supported by the PowerStore driver.

When a Metro `PV` is created, the volumeHandle will have the format `<volumeID/globalID/protocol:remote-volumeID/remote-globalID>`.

----------------

## PersistentVolumeClaim (PVC)
Metro-replicated volumes can be provisioned using different `accessModes`. Both ReadWriteOnce (RWO) and ReadWriteMany (RWX) are supported.
A PersistentVolumeClaim configured to create a metro replicated volume with ReadWriteMany access mode would look like this:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvol
  namespace: powerstore-metro
spec:
  accessModes:
    - ReadWriteMany
  volumeMode: Filesystem
  resources:
    requests:
      storage: 8Gi
  storageClassName: powerstore-metro-storage-class
```

----------------

## Workload Resiliency in Metro Configurations
For PowerStore Metro with csm-resiliency enabled, the workloads remain resilient against node failures, array failures, and complete site failures, provided that the preferred node has connectivity to the surviving array. This applies to both uniform and non-uniform host connectivity configurations except for complete site failures, where resiliency is supported only for uniform configurations.

Refer to [powerstore-resiliency](../../../getting-started/installation/kubernetes/powerstore/csmoperator/csm-modules/resiliency.md) for installing the CSI PowerStore Driver with resiliency enabled.

## Volume Expansion
When a request is made to increase the size of a Metro `PV`, the metro replication session must be temporarily paused prior to the editing of Kubernetes resources. This can be done from the PowerStore Manager UI or CLI. The size of the local/preferred volume is then increased. The metro session must then be manually resumed. It is important to note that the paths for the remote/non-preferred volume will not become active until the metro session is resumed and the remote/non-preferred volume reflects the updated size.

------------

## Snapshots
When a VolumeSnapshot object is created for the Metro `PV`, snapshots are created on each side of the Metro session on the PowerStore systems. However, the VolumeSnapshot object only refers to the local/preferred side of the Metro volume. When a Metro `PV` is deleted, the remote/non-preferred volume, along with any snapshots associated with it, is also automatically deleted.

--------------

## Limitations
- PowerStore driver only supports uniform host configuration for Metro volume where the host has active paths to both PowerStore systems.
- Metro configuration needs to be done by the user by adding zone keys as node labels as per the configuration requirements.
- Powerstore driver does only fresh host registration for metro configuration. To modify an existing host entry, the user will have to remove the existing host entry from the array and restart node pods to enable the Powerstore driver to create fresh host entry.
- VolumeGroup Metro support is not currently available for uniform host configuration.
- Metro volume only supports FC and iSCSI protocols for host access.
- Each Kubernetes node is automatically registered as a host object on both PowerStore systems when the node pods are running. However, the connectivity type of the host is set to 'Local Connectivity' by default. It needs to be updated manually with the correct 'Metro connectivity' option on both PowerStore systems using the PowerStore Manager UI.
- Actions that need to be performed on the Metro session, such as pausing, resuming, or changing the preferred side, can only be done through the PowerStore Manager UI.
- Some CSI Driver Capabilities, such as snapshot or clone, are not supported on the remote/non-preferred side of the Metro volume.
- While restoring a Metro snapshot or cloning a Metro volume on the local/preferred side, provide a non-Metro storage class. Configuring Metro on clones is not supported on the PowerStore.
- The following [volume attributes](../../../csidriver/features/powerstore/#configurable-volume-attributes-optional) on PersistentVolumeClaims (PVCs) are not supported for Metro volumes: `csi.dell.com/volume_group_id`, `csi.dell.com/protection_policy_id` if the policy has replication rule.
- Metro volume with resiliency enabled, does not work for non-uniform complete site failure.
