---
title: PowerFlex
linktitle: PowerFlex
weight: 6
description: Enabling Replication feature for CSI PowerFlex
---
## Enabling Replication In CSI PowerFlex

Container Storage Modules (CSM) Replication sidecar is a helper container that
is installed alongside a CSI driver to facilitate replication functionality.
Such CSI drivers must implement `dell-csi-extensions` calls.

CSI driver for Dell PowerFlex supports necessary extension calls from
`dell-csi-extensions`. To be able to provision replicated volumes you would need
to do the steps described in the following sections.

### Before Installation

#### On Storage Array

Be sure to configure replication between multiple PowerFlex instances using instructions provided by PowerFlex storage.

Ensure that the remote systems are configured by navigating to the `Protection` tab and choosing `Peer Systems` in the UI of the PowerFlex instance.

There should be a list of remote systems with the `State` fields set to `Connected`.

#### In Kubernetes
Ensure you installed CRDs and replication controller in your clusters.

Run the following commands to verify that everything is installed correctly:

* Check controller pods
    ```shell
    kubectl get pods -n dell-replication-controller
    ```
  Pods should be `READY` and `RUNNING`
* Check that the controller config map is properly populated
    ```shell
    kubectl get cm -n dell-replication-controller dell-replication-controller-config -o yaml
    ```
  `data` field should be properly populated with cluster-id of your choosing
  and, if using multi-cluster installation, your `targets:` parameter should be
  populated by a list of target cluster IDs.


If you don't have something installed or something is out-of-place, please refer
to installation instructions [here](../installation).

### Installing Driver With Replication Module

To install the driver with replication enabled, you need to ensure you have set
helm parameter `replication.enabled` in your copy of example `values.yaml` file
(usually called `my-powerflex-settings.yaml`, `myvalues.yaml` etc.).

Here is an example of how that would look:
```yaml
...
# Set this to true to enable replication
replication:
  enabled: true
  image: dellemc/dell-csi-replicator:v1.6.0
  replicationContextPrefix: "powerflex"
  replicationPrefix: "replication.storage.dell.com"
...
```
You can leave other parameters like `image`, `replicationContextPrefix`, and
`replicationPrefix` as they are.

After enabling the replication module you can continue to install the CSI driver
for PowerFlex following the usual installation procedure, just ensure you've added
the array information for all of the arrays being used in the
[secret](../../../csidriver/installation/helm/powerflex#install-the-driver).

> **_NOTE:_** You need to install your driver on all clusters where you want to use
replication. Both arrays must be accessible from each cluster.

### Creating Storage Classes

To be able to provision replicated volumes you need to create properly
configured storage classes on both source and target clusters.

Pair of storage classes on the source and target clusters would be essentially
`mirrored` copies of one another. You can create them manually or with help from
`repctl`.

#### Manual Storage Class Creation

You can find a sample of a replication enabled storage class in the driver repository
[here](https://github.com/dell/csi-powerflex/blob/main/samples/storageclass/vxflexos-replication.yaml).

It will look like this:
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: vxflexos-replication
provisioner: csi-vxflexos.dellemc.com
reclaimPolicy: Retain
allowVolumeExpansion: true
volumeBindingMode: Immediate
parameters:
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/remoteStorageClassName: "vxflexos-replication"
  replication.storage.dell.com/remoteClusterID: <remoteClusterID>
  replication.storage.dell.com/remoteSystem: <remoteSystemID>
  replication.storage.dell.com/remoteStoragePool: <remoteStoragePool>
  replication.storage.dell.com/rpo: 60
  replication.storage.dell.com/volumeGroupPrefix: "csi"
  replication.storage.dell.com/consistencyGroupName: <desiredConsistencyGroupName>
  replication.storage.dell.com/protectionDomain: <remoteProtectionDomain>
  systemID: <sourceSystemID>
  storagepool: <sourceStoragePool>
  protectiondomain: <sourceProtectionDomain>
```

Let's go through each parameter and what it means:
* `replication.storage.dell.com/isReplicationEnabled` if set to `true` will mark
  this storage class as replication enabled, just leave it as `true`.
* `replication.storage.dell.com/remoteStorageClassName` points to the name of
  the remote storage class. If you are using replication with the multi-cluster
  configuration you can make it the same as the current storage class name.
* `replication.storage.dell.com/remoteClusterID` represents the ID of a remote
  Kubernetes cluster. It is the same id you put in the replication controller config map.
* `replication.storage.dell.com/remoteSystem` is the name of the remote system
  as seen from the current PowerFlex instance. This parameter is the systemID of
  the array.
* `replication.storage.dell.com/remoteStoragePool` is the name of the storage
  pool on the remote system to be used for creating the remote volumes.
* `replication.storage.dell.com/rpo` is an acceptable amount of data, which is
  measured in units of time, that may be lost due to a failure.
* `replication.storage.dell.com/volumeGroupPrefix` represents what string would
  be appended to the volume group name to differentiate it from other volume groups.
* `replication.storage.dell.com/consistencyGroupName` represents the desired
  name to give the consistency group on the PowerFlex array. If omitted, the
  driver will generate a name for the consistency group.
* `replication.storage.dell.com/protectionDomain` represents the remote array's
  protection domain to use.
* `systemID` represents the systemID of the PowerFlex array.
* `storagepool` represents the name of the storage pool to be used on the
  PowerFlex array.
* `protectiondomain` represents the array's protection domain to be used.

Let's follow up that with an example. Let's assume we have two Kubernetes
clusters and two PowerFlex storage arrays:
* Clusters have IDs of `cluster-1` and `cluster-2`
* Cluster `cluster-1` connected to array `000000000001`
* Cluster `cluster-2` connected to array `000000000002`
* For `cluster-1` we plan to use storage pool `pool1` and protection domain `domain1`
* For `cluster-2` we plan to use storage pool `pool1` and protection domain `domain1`

And this is how our pair of storage classes would look:

StorageClass to be created in `cluster-1`:
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: "vxflexos-replication"
provisioner: "csi-vxflexos.dellemc.com"
reclaimPolicy: Retain
volumeBindingMode: Immediate
allowVolumeExpansion: true
parameters:
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/remoteStorageClassName: "vxflexos-replication"
  replication.storage.dell.com/remoteClusterID: "cluster-2"
  replication.storage.dell.com/remoteSystem: "000000000002"
  replication.storage.dell.com/remoteStoragePool: pool1
  replication.storage.dell.com/protectionDomain: domain1
  replication.storage.dell.com/rpo: 60
  replication.storage.dell.com/volumeGroupPrefix: "csi"
  arrayID: "000000000001"
  storagepool: "pool1"
  protectiondomain: "domain1"
```

StorageClass to be created in `cluster-2`:
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: "vxflexos-replication"
provisioner: "csi-vxflexos.dellemc.com"
reclaimPolicy: Retain
volumeBindingMode: Immediate
allowVolumeExpansion: true
parameters:
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/remoteStorageClassName: "vxflexos-replication"
  replication.storage.dell.com/remoteClusterID: "cluster-1"
  replication.storage.dell.com/remoteSystem: "000000000001"
  replication.storage.dell.com/remoteStoragePool: pool1
  replication.storage.dell.com/protectionDomain: domain1
  replication.storage.dell.com/rpo: 60
  replication.storage.dell.com/volumeGroupPrefix: "csi"
  arrayID: "000000000002"
  storagepool: "pool1"
  protectiondomain: "domain1"
```

After figuring out how storage classes would look, you just need to go and apply
them to your Kubernetes clusters with `kubectl`.

#### Storage Class Creation With repctl

`repctl` can simplify storage class creation by creating a pair of mirrored
storage classes in both clusters (using a single storage class configuration) in
one command.

To create storage classes with `repctl` you need to fill up the config with
the necessary information. You can find an example in
[here](https://github.com/dell/csm-replication/blob/main/repctl/examples/powerflex_example_values.yaml),
copy it, and modify it to your needs.

If you open this example you can see a lot of similar fields and parameters you
can modify in the storage class.

Let's use the same example from the manual installation and see how the config would
look
```yaml
sourceClusterID: "cluster-1"
targetClusterID: "cluster-2"
name: "vxflexos-replication"
driver: "vxflexos"
reclaimPolicy: "Retain"
replicationPrefix: "replication.storage.dell.com"
parameters:
  storagePool: # populate with storage pool to use of arrays
    source: "pool1"
    target: "pool1"
  protectionDomain: # populate with protection domain to use of arrays
    source: "domain1"
    target: "domain1"
  arrayID: # populate with unique ids of storage arrays
    source: "0000000000000001"
    target: "0000000000000002"
  rpo: "60"
  volumeGroupPrefix: "csi"
  consistencyGroupName: "" # optional name to be given to the rcg
```

After preparing the config you can apply it to both clusters with repctl. Just
make sure you've added your clusters to repctl via the `add` command before.

To create storage classes, run `./repctl create sc --from-config <config-file>` and storage classes will be applied to both clusters.

After creating storage classes you can make sure they are in place by using the
`./repctl get storageclasses` command.

### Provisioning Replicated Volumes

After installing the driver and creating storage classes you are good to create
volumes using newly created storage classes.

On your source cluster, create a PersistentVolumeClaim using one of the
replication enabled Storage Classes. The CSI PowerFlex driver will create a
volume on the array, add it to a VolumeGroup and configure replication using the
parameters provided in the replication enabled Storage Class.

### Supported Replication Actions
The CSI PowerFlex driver supports the following list of replication actions:
- FAILOVER_REMOTE
- UNPLANNED_FAILOVER_LOCAL
- REPROTECT_LOCAL
- SUSPEND
- RESUME
- SYNC
