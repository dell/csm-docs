---
title: Unity
linktitle: Unity
weight: 7
description: >
  Enabling Replication feature for CSI Unity
---
## Enabling Replication in CSI Unity

Container Storage Modules (CSM) Replication sidecar is a helper container that is installed alongside a CSI driver to facilitate replication functionality. Such CSI drivers must implement `dell-csi-extensions` calls.

CSI driver for Dell Unity supports necessary extension calls from `dell-csi-extensions`. To be able to provision replicated volumes you would need to do the steps described in these sections.

### Before Installation

#### On Storage Array
Be sure to configure replication between multiple Unity instances using instructions provided by
Unity storage.


#### In Kubernetes
Ensure you installed CRDs and replication controller in your clusters.

To verify you have everything in order you can execute these commands:

* Check controller pods
    ```shell
    kubectl get pods -n dell-replication-controller
    ```
  Pods should be `READY` and `RUNNING`
* Check that controller config map is properly populated
    ```shell
    kubectl get cm -n dell-replication-controller dell-replication-controller-config -o yaml
    ```
  `data` field should be properly populated with cluster-id of your choosing and, if using multi-cluster
  installation, your `targets:` parameter should be populated by a list of target clusters IDs.


If you don't have something installed or something is out-of-place, please refer to installation instructions in [installation-repctl](../install-repctl) or [installation](../installation).

### Installing Driver With Replication Module

To install the driver with replication enabled, you need to ensure you have set
helm parameter `controller.replication.enabled` in your copy of example `values.yaml` file
(usually called `my-unity-settings.yaml`, `myvalues.yaml` etc.).

Here is an example of what that would look like:
```yaml
...
# controller: configure controller specific parameters
controller:
  ...
  # replication: allows to configure replication
  replication:
    enabled: true
    image: dellemc/dell-csi-replicator:v1.2.0
    replicationContextPrefix: "unity"
    replicationPrefix: "replication.storage.dell.com"
...
```
You can leave other parameters like `image`, `replicationContextPrefix`, and `replicationPrefix` as they are.

After enabling the replication module, you can continue to install the CSI driver for Unity following the usual installation procedure. Just ensure you've added the necessary array connection information to secret.

> **_NOTE:_** you need to install your driver on ALL clusters where you want to use replication. Both arrays must be accessible from each cluster. 


### Creating Storage Classes

To provision replicated volumes, you need to create adequately configured storage classes on both the source and target clusters.

A pair of storage classes on the source, and target clusters would be essentially `mirrored` copies of one another.
You can create them manually or with the help of `repctl`.

#### Manual Storage Class Creation

You can find a sample replication enabled storage class in the driver repository [here](https://github.com/dell/csi-unity/blob/main/samples/storageclass/unity-replication.yaml).

It will look like this:
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: unity-replication
provisioner: csi-unity.dellemc.com
reclaimPolicy: Delete
volumeBindingMode: Immediate
parameters:
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/remoteStorageClassName: "unity-replication"
  replication.storage.dell.com/remoteClusterID: "target"
  replication.storage.dell.com/remoteSystem: "APM000000002"
  replication.storage.dell.com/rpo: "5"
  replication.storage.dell.com/ignoreNamespaces: "false"
  replication.storage.dell.com/volumeGroupPrefix: "csi"
  replication.storage.dell.com/remoteStoragePool: pool_002
  replication.storage.dell.com/remoteNasServer: nas_124
  arrayId: "APM000000001"
  protocol: "NFS"
  storagePool: pool_001
  nasServer: nas_123
```

Let's go through each parameter and what it means:
* `replication.storage.dell.com/isReplicationEnabled` if set to `true`, will mark this storage class as replication enabled,
  just leave it as `true`.
* `replication.storage.dell.com/remoteStorageClassName` points to the name of the remote storage class. If you are using replication with the multi-cluster configuration you can make it the same as the current storage class name.
* `replication.storage.dell.com/remoteClusterID` represents the ID of a remote cluster. It is the same id you put in the replication controller config map.
* `replication.storage.dell.com/remoteSystem` is the name of the remote system that should match whatever `clusterName` you called it in `unity-creds` secret.
* `replication.storage.dell.com/rpo` is an acceptable amount of data, which is measured in units of time, that may be lost due to a failure.
* `replication.storage.dell.com/ignoreNamespaces`, if set to `true` Unity driver, it will ignore in what namespace volumes are created and put every volume created using this storage class into a single volume group.
* `replication.storage.dell.com/volumeGroupPrefix` represents what string would be appended to the volume group name to differentiate them.
>NOTE: Please configure the VolumeGroupPrefix carefully. The Name format of \'\<volumeGroupPrefix\>-\<namespace\>-\<System IP Address OR FQDN\>-\<rpo\>' cannot be more than 63 characters.
* `arrayId` is a unique identifier of the storage array you specified in array connection secret.
* `nasServer` id of the Nas server of local array to which the allocated volume will belong.
* `storagePool` is the storage pool of the local array.

After figuring out how storage classes would look, you just need to go and apply them to your Kubernetes clusters with `kubectl`.

#### Storage Class creation with `repctl`

`repctl` can simplify storage class creation by creating a pair of mirrored storage classes in both clusters
(using a single storage class configuration) in one command.

To create storage classes with `repctl` you need to fill up the config with necessary information.
You can find an example [here](https://github.com/dell/csm-replication/blob/main/repctl/examples/unity_example_values.yaml), copy it, and modify it to your needs.

If you open this example you can see a lot of similar fields and parameters you can modify in the storage class.

Let's use the same example from manual installation and see what config would look like:
```yaml
targetClusterID: "cluster-2"
sourceClusterID: "cluster-1"
name: "unity-replication"
driver: "unity"
reclaimPolicy: "Retain"
replicationPrefix: "replication.storage.dell.com"
remoteRetentionPolicy:
  RG: "Retain"
  PV: "Retain"
parameters:
  arrayId: 
    source: "APM000000001"
    target: "APM000000002"
  storagePool:
    source: pool_123
    target: pool_124
  rpo: "0"
  ignoreNamespaces: "false"
  volumeGroupPrefix: "prefix"  
  protocol: "NFS"
  nasServer:
    source: nas_123
    target: nas_123
```

After preparing the config, you can apply it to both clusters with `repctl`. Before you do this, ensure you've added your clusters to `repctl` via the `add` command.

To create storage classes just run `./repctl create sc --from-config <config-file>` and storage classes would be applied to both clusters.

After creating storage classes you can make sure they are in place by using `./repctl get storageclasses` command.

### Provisioning Replicated Volumes

After installing the driver and creating storage classes, you are good to create volumes using newly
created storage classes.

On your source cluster, create a PersistentVolumeClaim using one of the replication-enabled Storage Classes.
The CSI Unity driver will create a volume on the array, add it to a VolumeGroup and configure replication
using the parameters provided in the replication enabled Storage Class.

### Supported Replication Actions
The CSI Unity driver supports the following list of replication actions:
- FAILOVER_REMOTE
- UNPLANNED_FAILOVER_LOCAL
- REPROTECT_LOCAL
- SUSPEND
- RESUME
- SYNC
