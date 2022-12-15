---
title: PowerScale
linktitle: PowerScale
weight: 7
description: >
  Enabling Replication feature for CSI PowerScale
---
## Enabling Replication in CSI PowerScale

Container Storage Modules (CSM) Replication sidecar is a helper container that is installed alongside a CSI driver to facilitate replication functionality. Such CSI drivers must implement `dell-csi-extensions` calls.

CSI driver for Dell PowerScale supports necessary extension calls from `dell-csi-extensions`. To be able to provision replicated volumes you would need to do the steps described in the following sections.

### Before Installation

#### On Storage Array
Ensure that SyncIQ service is enabled on both arrays, you can do that by navigating to `SyncIQ` section under `Data protection` tab. 

The current implementation supports one-to-one replication so you need to ensure that one array can reach another and vice versa. 

##### SyncIQ encryption

If you wish to use `SyncIQ` encryption you should ensure that you've added a server certificate first by navigating to `Data protection->SyncIQ->Settings`. 

After adding the certificate, you can choose to use it by checking `Encrypt SyncIQ connection` from the dropdown. 

After that, you can add similar certificates of other arrays in `SyncIQ-> Certificates`, and ensure you've added the certificate of the array you want to replicate to. 

Similar steps should be done in the reverse direction, so `array-1` has the `array-2` certificate visible in `SyncIQ-> Certificates` tab and `array-2` has the `array-1` certificate visible in its own `SyncIQ->Certificates` tab. 

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
  `data` field should be properly populated with cluster-id of your choosing and, if using multi-cluster
  installation, your `targets:` parameter should be populated by a list of target clusters IDs.


If you don't have something installed or something is out-of-place, please refer to installation instructions in [installation-repctl](../install-repctl) or [installation](../installation).

### Installing Driver With Replication Module

To install the driver with replication enabled, you need to ensure you have set
helm parameter `controller.replication.enabled` in your copy of example `values.yaml` file
(usually called `my-isilon-settings.yaml`, `myvalues.yaml` etc.).

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
    replicationContextPrefix: "powerscale"
    replicationPrefix: "replication.storage.dell.com"
...
```
You can leave other parameters like `image`, `replicationContextPrefix`, and `replicationPrefix` as they are.

After enabling the replication module, you can continue to install the CSI driver for PowerScale following the usual installation procedure. Just ensure you've added the necessary array connection information to secret.

##### SyncIQ encryption

If you plan to use encryption, you need to set `replicationCertificateID` in the array connection secret. To check the ID of the certificate for the cluster, you can navigate to `Data protection->SyncIQ->Settings,` find your certificate in the `Server Certificates` section and then push the `View/Edit` button. It will open a dialog that should contain the  `Id` field. Use the value of that field to set `replicationCertificateID`.

> **_NOTE:_** you need to install your driver on ALL clusters where you want to use replication. Both arrays must be accessible from each cluster. 


### Creating Storage Classes

To provision replicated volumes, you need to create adequately configured storage classes on both the source and target clusters.

A pair of storage classes on the source, and target clusters would be essentially `mirrored` copies of one another.
You can create them manually or with the help of `repctl`.

#### Manual Storage Class Creation

You can find a sample replication enabled storage class in the driver repository [here](https://github.com/dell/csi-powerscale/blob/main/samples/storageclass/isilon-replication.yaml).

It will look like this:
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: isilon-replication
provisioner: csi-isilon.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: Immediate
parameters:
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/remoteStorageClassName: "isilon-replication"
  replication.storage.dell.com/remoteClusterID: "target"
  replication.storage.dell.com/remoteSystem: "cluster-2"
  replication.storage.dell.com/remoteAccessZone: System
  replication.storage.dell.com/remoteAzServiceIP: 192.168.1.2
  replication.storage.dell.com/remoteRootClientEnabled: "false"
  replication.storage.dell.com/rpo: Five_Minutes
  replication.storage.dell.com/ignoreNamespaces: "false"
  replication.storage.dell.com/volumeGroupPrefix: "csi"
  AccessZone: System
  AzServiceIP: 192.168.1.1
  IsiPath: /ifs/data/csi
  RootClientEnabled: "false"
  ClusterName: cluster-1
```

Let's go through each parameter and what it means:
* `replication.storage.dell.com/isReplicationEnabled` if set to `true`, will mark this storage class as replication enabled,
  just leave it as `true`.
* `replication.storage.dell.com/remoteStorageClassName` points to the name of the remote storage class. If you are using replication with the multi-cluster configuration you can make it the same as the current storage class name.
* `replication.storage.dell.com/remoteClusterID` represents the ID of a remote cluster. It is the same id you put in the replication controller config map.
* `replication.storage.dell.com/remoteSystem` is the name of the remote system that should match whatever `clusterName` you called it in `isilon-creds` secret.
* `replication.storage.dell.com/remoteAccessZone` is the name of the access zone a remote volume can be created in.
* `replication.storage.dell.com/remoteAzServiceIP` AccessZone groupnet service IP. It is optional and can be provided if different than the remote system endpoint.
* `replication.storage.dell.com/remoteRootClientEnabled` determines whether the driver should enable root squashing or not for the remote volume.
* `replication.storage.dell.com/rpo` is an acceptable amount of data, which is measured in units of time, that may be lost due to a failure.
> NOTE: Available RPO values "Five_Minutes", "Fifteen_Minutes", "Thirty_Minutes", "One_Hour", "Six_Hours", "Twelve_Hours", "One_Day"
* `replication.storage.dell.com/ignoreNamespaces`, if set to `true` PowerScale driver, it will ignore in what namespace volumes are created and put every volume created using this storage class into a single volume group.
* `replication.storage.dell.com/volumeGroupPrefix` represents what string would be appended to the volume group name to differentiate them.

> NOTE: To configure the VolumeGroupPrefix, the name format of \'\<volumeGroupPrefix\>-\<namespace\>-\<System IP Address OR FQDN\>-\<rpo\>\' cannot be more than 63 characters.

* `Accesszone` is the name of the access zone a volume can be created in.
* `AzServiceIP` AccessZone groupnet service IP. It is optional and can be provided if different than the PowerScale cluster endpoint.
* `IsiPath` is the base path for the volumes to be created on the PowerScale cluster.
* `RootClientEnabled` determines whether the driver should enable root squashing or not.
* `ClusterName` name of PowerScale cluster, where PV will be provisioned, specified as it was listed in `isilon-creds` secret.

After figuring out how storage classes would look, you just need to go and apply them to your Kubernetes clusters with `kubectl`.

#### Storage Class creation with `repctl`

`repctl` can simplify storage class creation by creating a pair of mirrored storage classes in both clusters
(using a single storage class configuration) in one command.

To create storage classes with `repctl` you need to fill up the config with necessary information.
You can find an example [here](https://github.com/dell/csm-replication/blob/main/repctl/examples/powerscale_example_values.yaml), copy it, and modify it to your needs.

If you open this example you can see a lot of similar fields and parameters you can modify in the storage class.

Let's use the same example from manual installation and see what config would look like:
```yaml
sourceClusterID: "source"
targetClusterID: "target"
name: "isilon-replication"
driver: "isilon"
reclaimPolicy: "Delete"
replicationPrefix: "replication.storage.dell.com"
remoteRetentionPolicy:
  RG: "Retain"
  PV: "Retain"
parameters:
  rpo: "Five_Minutes"
  ignoreNamespaces: "false"
  volumeGroupPrefix: "csi"
  isiPath: "/ifs/data/csi"
  clusterName:
    source: "cluster-1"
    target: "cluster-2"
  rootClientEnabled:
    source: "false"
    target: "false"
  accessZone:
    source: "System"
    target: "System"
  azServiceIP:
    source: "192.168.1.1"
    target: "192.168.1.2"
```

After preparing the config, you can apply it to both clusters with `repctl`. Before you do this, ensure you've added your clusters to `repctl` via the `add` command.

To create storage classes just run `./repctl create sc --from-config <config-file>` and storage classes would be applied to both clusters.

After creating storage classes you can make sure they are in place by using `./repctl get storageclasses` command.

### Provisioning Replicated Volumes

After installing the driver and creating storage classes, you are good to create volumes using newly
created storage classes.

On your source cluster, create a PersistentVolumeClaim using one of the replication-enabled Storage Classes.
The CSI PowerScale driver will create a volume on the array, add it to a VolumeGroup and configure replication
using the parameters provided in the replication enabled Storage Class.

### SyncIQ Policy Architecture
When creating `DellCSIReplicationGroup` (RG) objects on the Kubernetes cluster(s) used for replication, a SyncIQ policy to facilitate this replication is created *only* on the source PowerScale storage array. 

This singular SyncIQ policy on the source storage array and its matching Local Target policy on the target storage array provide information for the RGs to determine their status. Upon creation, the SyncIQ policy is set to a schedule of `When source is modified`. The SyncIQ policy is `Enabled` when the RG is created. The directory that is being replicated is *read-write accessible* on the source storage array, and is restricted to *read-only* on the target. 

### Performing Failover/Failback/Reprotect on PowerScale

Failover, Failback, and Reprotect one-step operations are not natively supported on PowerScale, and are performed as a series of steps in CSM replication. When any of these operations are triggered, through the use of `repctl` or by editing the RG, the steps below are performed on the PowerScale storage arrays.

#### Failover - Halt Replication and Allow Writes on Target

Steps for performing Failover can be found in the Tools page under [Executing Actions.](https://dell.github.io/csm-docs/docs/replication/tools/#executing-actions) There are some PowerScale-specific considerations to keep in mind: 
- Failover on PowerScale does NOT halt writes on the source side. It is recommended that the storage administrator or end user manually **stop writes** to ensure no data is lost on the source side in the event of future failback. 
- In the case of unplanned failover, the SyncIQ policy on the source PowerScale array will be left enabled and set to its previously defined `When source is modified` sync schedule. Storage admins **must** manually disable this SyncIQ policy when bringing the failed-over source array back online, or unexpected behavior may occur.

The below steps are performed by CSM replication to perform a failover.

1. Syncing data from source to target one final time before transition. *(planned failover only)*
2. Disabling the SyncIQ policy on the source PowerScale storage array. *(planned failover only)*
3. Enabling writes on the target PowerScale array's Local Target policy.  

#### Failback - Discard Target

Performing failback and discarding changes made to the target is to simply resume synchronization from the source. The steps CSM replication is following to perform this operation are as follows:

1. Editing the SyncIQ policy on the source PowerScale array's schedule from `When source is modified` to `Manual`. 
2. Performing `Actions > Disallow writes` on the target PowerScale array's Local Target policy that matches the SyncIQ policy undergoing failback. 
3. Editing the SyncIQ policy's schedule from `Manual` to `When source is modified` and setting the time delay for synchronization as appropriate.
4. Enabling the source PowerScale array's SyncIQ policy. 

   
#### Failback - Discard Source

Information on the methodology for performing a failback while taking changes made to the original target can be found in relevant PowerScale SyncIQ documentation. The steps CSM replication is following to perform this operation are as follows:

1. Editing the SyncIQ policy on the source PowerScale array's schedule from `When source is modified` to `Manual`. 
2. Enabling the SyncIQ policy that is undergoing failback, if it isn't already enabled. 
3. Performing the `Resync-prep` action on the SyncIQ policy. This will create a new SyncIQ policy on the target PowerScale array, matching the original SyncIQ policy with an appended *_mirror* to its name. 
4. Starting a synchronization job on the target PowerScale array's newly created *_mirror* policy.
5. Running the `Allow writes` operation on the Local Target on the source PowerScale array that was created by the *_mirror* policy. 
6. Performing the `Resync-prep` action on the target PowerScale array's *_mirror* policy. 
7. Deleting the *_mirror* SyncIQ policy. 
8. Editing the SyncIQ policy on the source PowerScale array's schedule from `Manual` to `When source is modified` and setting the time delay for synchronization as appropriate.

#### Reprotect - Set Original Target as New Source 

A reprotect operation is, in essence, doing away with the original source-target relationship and establishing a new one in the reverse direction. This is done **only after** failing over to the original target array is complete, and the original source array is up and ready to be made into a new replication destination. To accomplish this, CSM replication performs the following steps:

1. Deleting the SyncIQ policy on the original source PowerScale array. 
2. Creating a new SyncIQ policy on the original target PowerScale array. This policy establishes the original target as a new *source*, and sets its replication destination to the original source (which can be considered the new *target*.)

### Supported Replication Actions
The CSI PowerScale driver supports the following list of replication actions:
- FAILOVER_REMOTE
- UNPLANNED_FAILOVER_LOCAL
- FAILBACK_LOCAL
- ACTION_FAILBACK_DISCARD_CHANGES_LOCAL
- REPROTECT_LOCAL
- SUSPEND
- RESUME
- SYNC
