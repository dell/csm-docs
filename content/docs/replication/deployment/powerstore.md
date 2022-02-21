---
title: PowerStore
linktitle: PowerStore
weight: 7
description: >
  Enabling Replication feature for CSI PowerStore
---
## Enabling Replication In CSI PowerStore

For the Container Storage Modules (CSM) for Replication sidecar container to work properly it needs to be installed
alongside CSI driver that supports replication `dell-csi-extensions` calls.

CSI driver for Dell EMC PowerStore supports necessary extension calls from `dell-csi-extensions` and to be able to
provision replicated volumes you would need to do the steps described in the following sections.

### Before Installation

#### On Storage Array
Be sure to configure replication between multiple PowerStore instances using instructions provided by
PowerStore storage.

You can ensure that you configured remote systems by navigating to the `Protection` tab and choosing `Remote System`
in UI of your PowerStore instance.

You should see a list of remote systems with both `Management State` and `Data Connection` fields set to `OK`.

#### In Kubernetes
Ensure you installed CRDs and replication controller in your clusters.

To verify you have everything in order you can execute the following commands:

* Check controller pods
    ```shell
    kubectl get pods -n dell-replication-controller
    ```
  Pods should be `READY` and `RUNNING`
* Check that controller config map is properly populated
    ```shell
    kubectl get cm -n dell-replication-controller dell-replication-controller-config -o yaml
    ```
  `data` field should be properly populated with cluster id of your choosing and, if using multi-cluster
  installation, your `targets:` parameter should be populated by list of target clusters IDs.


If you don't have something installed or something is out-of-place, please refer to installation instructions in [installation-repctl](../install-repctl) or [installation](../installation).

### Installing Driver With Replication Module

To install the driver with replication enabled you need to ensure you have set
helm parameter `controller.replication.enabled` in your copy of example `values.yaml` file
(usually called `my-powerstore-settings.yaml`, `myvalues.yaml` etc.).

Here is an example of what that would look like
```yaml
...
# controller: configure controller specific parameters
controller:
  ...
  # replication: allows to configure replication
  replication:
    enabled: true
    image: dellemc/dell-csi-replicator:v1.0.0
    replicationContextPrefix: "powerstore"
    replicationPrefix: "replication.storage.dell.com"
...
```
You can leave other parameters like `image`, `replicationContextPrefix`, and `replicationPrefix` as they are.

After enabling the replication module you can continue to install the CSI driver for PowerStore following
usual installation procedure, just ensure you've added necessary array connection information to secret.

> **_NOTE:_** you need to install your driver at least on the source cluster, but it is recommended to install
> drivers on all clusters you will use for replication.


### Creating Storage Classes

To be able to provision replicated volumes you need to create properly configured storage
classes on both source and target clusters.

A pair of storage classes on the source and target clusters would be essentially `mirrored` copies of one another.
You can create them manually or with help from `repctl`.

#### Manual Storage Class Creation

You can find sample replication enabled storage class in the driver repository
[here](https://github.com/dell/csi-powerstore/blob/main/samples/storageclass/powerstore-replication.yaml).

It will look like this:
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: "powerstore-replication"
provisioner: "csi-powerstore.dellemc.com"
reclaimPolicy: Retain
volumeBindingMode: Immediate
parameters:
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/remoteStorageClassName: "powerstore-replication"
  replication.storage.dell.com/remoteClusterID: "tgt-cluster-id"
  replication.storage.dell.com/remoteSystem: "RT-0000"
  replication.storage.dell.com/rpo: Five_Minutes
  replication.storage.dell.com/ignoreNamespaces: "false"
  replication.storage.dell.com/volumeGroupPrefix: "csi"
  arrayID: "Unique"
```

Let's go through each parameter and what it means:
* `replication.storage.dell.com/isReplicationEnabled` if set to `true` will mark this storage class as replication enabled,
  just leave it as `true`.
* `replication.storage.dell.com/remoteStorageClassName` points to the name of the remote storage class. If you are using replication with the multi-cluster configuration you can make it the same as the current storage class name.
* `replication.storage.dell.com/remoteClusterID` represents ID of a remote cluster. It is the same id you put in the replication controller config map.
* `replication.storage.dell.com/remoteSystem` is the name of the remote system as seen from the current PowerStore instance.
* `replication.storage.dell.com/rpo` is an acceptable amount of data, which is measured in units of time,
  that may be lost due to a failure.
* `replication.storage.dell.com/ignoreNamespaces`, if set to `true` PowerStore driver, it will ignore in what namespace volumes are created and put every volume created using this storage class into a single volume group.
* `replication.storage.dell.com/volumeGroupPrefix` represents what string would be appended to the volume group name
  to differentiate them.
* `arrayID` is a unique identifier of the storage array you specified in array connection secret.

Let's follow up that with an example. Let's assume you have two Kubernetes clusters and two PowerStore
storage arrays:
* Clusters have IDs of `cluster-1` and `cluster-2`
* Storage arrays connected between each other and show up as remote systems with names `RT-0001` and `RT-0002`
* Cluster `cluster-1` connected to array `RT-0001`
* Cluster `cluster-2` connected to array `RT-0002`
* Storage array `RT-0001` has a unique ID of `PS000000001`
* Storage array `RT-0002` has a unique ID of `PS000000002`

And this is what our pair of storage classes would look like:

StorageClass to be created in `cluster-1`:
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: "powerstore-replication"
provisioner: "csi-powerstore.dellemc.com"
reclaimPolicy: Retain
volumeBindingMode: Immediate
parameters:
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/remoteStorageClassName: "powerstore-replication"
  replication.storage.dell.com/remoteClusterID: "cluster-2"
  replication.storage.dell.com/remoteSystem: "RT-0002"
  replication.storage.dell.com/rpo: Five_Minutes
  replication.storage.dell.com/ignoreNamespaces: "false"
  replication.storage.dell.com/volumeGroupPrefix: "csi"
  arrayID: "PS000000001"
```

StorageClass to be created in `cluster-2`:
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: "powerstore-replication"
provisioner: "csi-powerstore.dellemc.com"
reclaimPolicy: Retain
volumeBindingMode: Immediate
parameters:
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/remoteStorageClassName: "powerstore-replication"
  replication.storage.dell.com/remoteClusterID: "cluster-1"
  replication.storage.dell.com/remoteSystem: "RT-0001"
  replication.storage.dell.com/rpo: Five_Minutes
  replication.storage.dell.com/ignoreNamespaces: "false"
  replication.storage.dell.com/volumeGroupPrefix: "csi"
  arrayID: "PS000000002"
```

After figuring out how storage classes would look, you just need to go and apply them to
your Kubernetes clusters with `kubectl`.

#### Storage Class Creation With repctl

`repctl` can simplify storage class creation by creating a pair of mirrored storage classes in both clusters
(using a single storage class configuration) in one command.

To create storage classes with `repctl` you need to fill up the config with necessary information.
You can find an example in [here](https://github.com/dell/csm-replication/blob/main/repctl/examples/powerstore_example_values.yaml), copy it, and modify it to your needs.

If you open this example you can see a lot of similar fields and parameters you can modify in the storage class.

Let's use the same example from manual installation and see how config would look like
```yaml
sourceClusterID: "cluster-1"
targetClusterID: "cluster-2"
name: "powerstore-replication"
driver: "powerstore"
reclaimPolicy: "Retain"
replicationPrefix: "replication.storage.dell.com"
parameters:
  arrayID:
    source: "PS000000001"
    target: "PS000000002"
  remoteSystem:
    source: "RT-0002"
    target: "RT-0001"
  rpo: "Five_Minutes"
  ignoreNamespaces: "false"
  volumeGroupPrefix: "csi"
```

After preparing the config you can apply it to both clusters with repctl. Just make sure you've
added your clusters to repctl via the `add` command before.

To create storage classes just run `./repctl create sc --from-config <config-file>` and storage classes
would be applied to both clusters.

After creating storage classes you can make sure they are in place by using `./repctl list storageclasses` command.

### Provisioning Replicated Volumes

After installing the driver and creating storage classes you are good to create volumes using newly
created storage classes.

On your source cluster, create a PersistentVolumeClaim using one of the replication enabled Storage Classes.
The CSI PowerStore driver will create a volume on the array, add it to a VolumeGroup and configure replication
using the parameters provided in the replication enabled Storage Class.

### Supported Replication Actions
The CSI PowerStore driver supports the following list of replication actions:
- FAILOVER_REMOTE
- UNPLANNED_FAILOVER_LOCAL
- REPROTECT_LOCAL
- SUSPEND
- RESUME
- SYNC
