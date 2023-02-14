---
title: Storage Class
linktitle: Storage Class
weight: 5
description: >
  Replication enabled Storage Classes
---
## Replication Enabled Storage Classes
In order to create replicated volumes & volume groups, you need to add some extra parameters to your storage class definition.
These extra parameters generally carry the prefix `replication.storage.dell.com` to differentiate them from other provisioning parameters.

Replication enabled storage classes are always created in pairs within/across clusters and are generally mirrors of each other.
Before provisioning replicated volumes, make sure that these pairs of storage classes are created properly.

### Common Parameters
There are 3 mandatory key/value pairs which should always be present in the storage class parameters -
```yaml
replication.storage.dell.com/isReplicationEnabled: 'true'
replication.storage.dell.com/remoteClusterID: <RemoteClusterId>
replication.storage.dell.com/remoteStorageClassName: <RemoteScName>
```

#### remoteClusterID
This should contain the Cluster ID of the remote cluster where the replicated volume is going to be created.
In case of a single stretched cluster, it should be always set to `self`

#### remoteStorageClassName
This should contain the name of the storage class on the remote cluster which is used to create the remote `PersistentVolume`.
>Note: You still need to create a pair of storage classes even while using a single stretched cluster

### Driver specific parameters
Please refer to the driver specific sections for [PowerMax](../powermax/#creating-storage-classes), [PowerStore](../powerstore/#creating-storage-classes), [PowerScale](../powerscale/#creating-storage-classes) or [PowerFlex](../powerflex#creating-storage-classes) for a detailed list of parameters.

### PV sync Deletion

The dell-csm-replicator supports 'sync deletion' of replicated PV resources i.e when a replication enabled PV is deleted its corresponding source or target PV can also be deleted. 

The decision to whether or not sync delete the corresponding PV depends on a Storage Class parameter which can be configured by the user. 

```
replication.storage.dell.com/remotePVRetentionPolicy: 'delete' | 'retain'
```

If the remotePVRetentionPolicy is set to 'delete', the corresponding PV would be deleted.

If the remotePVRetentionPolicy is set to 'retain', the corresponding PV would be retained. 

By default, if the remotePVRetentionPolicy is not specified in the Storage Class, replicated PV resources are retained.

### RG sync Deletion

The dell-csm-replicator supports 'sync deletion' of RG (DellCSIReplicationGroup) resources i.e when an RG is deleted its corresponding source or target RG can also be deleted. 

The decision to whether or not sync delete the corresponding RG depends on a Storage Class parameter which can be configured by the user. 

```
replication.storage.dell.com/remoteRGRetentionPolicy: 'delete' | 'retain'
```

If the remoteRGRetentionPolicy is set to 'delete', the corresponding RG would be deleted.

If the remoteRGRetentionPolicy is set to 'retain', the corresponding RG would be retained. 

By default, if the remoteRGRetentionPolicy is not specified in the Storage Class, replicated RG resources are retained.


### Example
If you are setting up replication between two clusters with ClusterID set to Cluster A & Cluster B,
then the storage class definitions in both the clusters would look like -

#### Cluster A
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rep-src
parameters:
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/remoteClusterID: ClusterB
  replication.storage.dell.com/remoteStorageClassName: rep-tgt
  # Some driver specific replication & non-replication related params
provisioner: csi-powermax.dellemc.com
reclaimPolicy: Delete
volumeBindingMode: Immediate
```
#### Cluster B
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rep-tgt
parameters:
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/remoteClusterID: ClusterA
  replication.storage.dell.com/remoteStorageClassName: rep-src
  # Some driver specific replication & non-replication related params
provisioner: csi-powermax.dellemc.com
reclaimPolicy: Delete
volumeBindingMode: Immediate
```
