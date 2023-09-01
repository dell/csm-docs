---
title: PowerMax
linktitle: PowerMax
weight: 6
description: Enabling Replication feature for CSI PowerMax
---
## Enabling Replication In CSI PowerMax

Container Storage Modules (CSM) Replication sidecar is a helper container that is installed alongside a CSI driver to facilitate replication functionality. Such CSI drivers must implement `dell-csi-extensions` calls.

CSI driver for Dell PowerMax supports necessary extension calls from `dell-csi-extensions`. To be able to provision replicated volumes you would need to do the steps described in the following sections.

>Note: File Replication for PowerMax is currently not supported 

### Before Installation

#### On Storage Array
Configure SRDF connection between multiple PowerMax instances. Follow instructions by PowerMax storage for creating the SRDF Groups between a set of arrays.

You can ensure that you configured remote arrays by navigating to the `Data Protection` tab and choosing `SRDF Groups` on the managing Unisphere of your array. You should see a list of remote systems with the SRDF Group number that is configured and the Online field set to a green tick.

While using any SRDF groups, ensure that they are for exclusive use by the CSI PowerMax driver:
* Any SRDF group which will be used by the driver is not in use by any other application
* If an SRDF group is already in use by a CSI driver, don't use it for provisioning replicated volumes outside CSI provisioning workflows.

There are some important limitations that apply to how CSI PowerMax driver uses SRDF groups:
* One replicated storage group using Async/Sync __always__ contains volumes provisioned from a single namespace.
* While using SRDF mode Async, a single SRDF group can be used to provision volumes within a single namespace. You can still create multiple storage classes using the same SRDF group for different Service Levels.
  But all these storage classes will be restricted to provisioning volumes within a single namespace.
* When using SRDF mode Sync/Metro, a single SRDF group can be used to provision volumes from multiple namespaces.

#### Automatic creation of SRDF Groups
CSI Driver for PowerMax supports automatic creation of SRDF Groups as of **v2.4.0** with help of **10.0** REST endpoints.
To use this feature:
* Remove _replication.storage.dell.com/RemoteRDFGroup_ and _replication.storage.dell.com/RDFGroup_ params from the storage classes before creating first replicated volume.
* Driver will check next available RDF pair and use them to create volumes.
* This enables customers to use same storage class across namespace to create volume.

Limitation of Auto SRDFG:
* For Async mode, this feature is supported for namespaces with at most 7 characters. 
* RDF label used to map namespace with the RDF group has limit of 10 char. 3 char is used for cluster prefix to make RDFG unique across clusters.
* For namespace with more than 7 char, use manual entry of RDF groups in storage class.
#### In Kubernetes
Ensure you installed CRDs and replication controller in your clusters.

To verify you have everything in order you can execute the following commands:

* Check controller pods
    ```shell
    kubectl get pods -n dell-replication-controller
    ```
  Pods should be `READY` and `RUNNING`.
* Check that controller config map is properly populated:
    ```shell
    
    kubectl get cm -n dell-replication-controller dell-replication-controller-config -o yaml
    ```
  `data` field should be properly populated with cluster-id of your choosing and, if using multi-cluster
  installation, your `targets:` parameter should be populated by a list of target clusters IDs.


If you don't have something installed or something is out-of-place, please refer to installation instructions [here](../installation).


### Installing Driver With Replication Module

To install the driver with replication enabled you need to ensure you have set
Helm parameter `replication.enabled` in your copy of example `values.yaml` file
(usually called `my-powermax-settings.yaml`, `myvalues.yaml` etc.).

Here is an example of what that would look like:
```yaml
...
# Set this to true to enable replication
replication:
  enabled: true
  replicationContextPrefix: "powermax"
  replicationPrefix: "replication.storage.dell.com"
...
```
You can leave other parameters like `replicationContextPrefix`, and `replicationPrefix` as they are.

After enabling the replication module you can continue to install the CSI driver for PowerMax following
usual installation procedure, just ensure you've added necessary array connection information to secret.

> **_NOTE:_** You need to install your driver at least on the source cluster, but it is recommended to install
> drivers on all clusters you will use for replication.


### Creating Storage Classes

To be able to provision replicated volumes you need to create properly configured storage
classes on both source and target clusters.

A pair of storage classes on the source and target clusters would be essentially `mirrored` copies of one another.
You can create them manually or with help from `repctl`.

#### Manual Storage Class Creation

You can find sample replication enabled storage class in the driver repository [here](https://github.com/dell/csi-powermax/blob/main/samples/storageclass/powermax_srdf.yaml).

It will look like this:
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: powermax-srdf
provisioner: csi-powermax.dellemc.com
reclaimPolicy: Delete
volumeBindingMode: Immediate
parameters:
  SRP: <SRP Name>
  SYMID: <SYMID>
  ServiceLevel: <Service Level>
  replication.storage.dell.com/RemoteSYMID: <RemoteSYMID>
  replication.storage.dell.com/RemoteSRP: <RemoteSRP>
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/RemoteServiceLevel: <Remote Service Level>
  replication.storage.dell.com/RdfMode: <RdfMode>
  replication.storage.dell.com/Bias: "false"
  replication.storage.dell.com/RdfGroup: <RdfGroup> # optional
  replication.storage.dell.com/RemoteRDFGroup: <RemoteRDFGroup> # optional
  replication.storage.dell.com/remoteStorageClassName: <RemoteStorageClassName>
  replication.storage.dell.com/remoteClusterID: <RemoteClusterID>
```

Let's go through each parameter and what it means:
* `replication.storage.dell.com/isReplicationEnabled` if set to `true`, will mark this storage class as replication enabled,
  just leave it as `true`.
* `replication.storage.dell.com/RemoteStorageClassName` points to the name of the remote storage class, if you are using replication with the multi-cluster configuration you can make it the same as the current storage class name.
* `replication.storage.dell.com/RemoteClusterID` represents the ID of a remote cluster, it is the same ID you put in the replication controller config map.
* `replication.storage.dell.com/RemoteSYMID` is the Symmetrix ID of the remote array.
* `replication.storage.dell.com/RemoteSRP` is the storage pool of the remote array.
* `replication.storage.dell.com/RemoteServiceLevel` is the service level that will be assigned to remote volumes.
* `replication.storage.dell.com/RdfMode` points to the RDF mode you want to use. It should be one out of "ASYNC", "METRO" and "SYNC". If mode is set to
  METRO, driver does not need `RemoteStorageClassName` and `RemoteClusterID` as it supports METRO with single cluster configuration.
* `replication.storage.dell.com/Bias` when the RdfMode is set to METRO, this parameter is required to indicate driver to use Bias or Witness.
  If set to true, the driver will configure METRO with Bias, if set to false, the driver will configure METRO with Witness.
* `replication.storage.dell.com/RdfGroup` is the local SRDF group number, as configured. It is optional for using Auto SRDF group by driver.
* `replication.storage.dell.com/RemoteRDFGroup` is the remote SRDF group number, as configured. It is optional for using Auto SRDF group by driver.

Let's follow up that with an example, let's assume we have two Kubernetes clusters and two PowerMax
storage arrays:
* Clusters have IDs of `cluster-1` and `cluster-2`
* There are two arrays local Symmetrix array: `000000000001` and remote Symmetrix array: `000000000002`
* Storage arrays are connected to each other via RdfGroup `1` and RemoteRDFGroup `2`
* Cluster `cluster-1` connected to array `000000000001`
* Cluster `cluster-2` connected to array `000000000002`
* RDF Mode is ASYNC

And this how would our pair of storage classes would look like:

StorageClass to be created in `cluster-1`:
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: powermax-srdf
provisioner: csi-powermax.dellemc.com
reclaimPolicy: Delete
volumeBindingMode: Immediate
parameters:
  SRP: "SRP"
  SYMID: "000000000001"
  ServiceLevel: "Optimized"
  replication.storage.dell.com/RemoteSYMID: "000000000002" 
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/RemoteSRP: "SRP"
  replication.storage.dell.com/RemoteServiceLevel: "Optimized" 
  replication.storage.dell.com/RdfMode: "ASYNC"
  replication.storage.dell.com/Bias: "false"
  replication.storage.dell.com/RdfGroup: "1"
  replication.storage.dell.com/RemoteRDFGroup: "2"
  replication.storage.dell.com/remoteStorageClassName: "powermax-srdf"
  replication.storage.dell.com/remoteClusterID: "cluster-2"
```

StorageClass to be created in `cluster-2`:
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: powermax-srdf
provisioner: csi-powermax.dellemc.com
reclaimPolicy: Delete
volumeBindingMode: Immediate
parameters:
  SRP: "SRP"
  SYMID: "000000000002"
  ServiceLevel: "Optimized"
  replication.storage.dell.com/RemoteSYMID: "000000000001"
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/RemoteServiceLevel: "Optimized"
  replication.storage.dell.com/RemoteSRP: "SRP"
  replication.storage.dell.com/Bias: "false"
  replication.storage.dell.com/RdfMode: "ASYNC"
  replication.storage.dell.com/RdfGroup: "2"
  replication.storage.dell.com/RemoteRDFGroup: "1"
  replication.storage.dell.com/remoteStorageClassName: "powermax-srdf"
  replication.storage.dell.com/remoteClusterID: "cluster-1"
```

After creating storage class YAML files, they must be applied to your Kubernetes clusters with `kubectl`.

#### Storage Class Creation With repctl

`repctl` can simplify storage class creation by creating a pair of mirrored storage classes in both clusters
(using a single storage class configuration) in one command.

To create storage classes with `repctl` you need to fill the config with necessary information.
You can find an example [here](https://github.com/dell/csm-replication/blob/main/repctl/examples/powermax_example_values.yaml), copy it, and modify it to your needs.

If you open this example you can see similar fields and parameters to what was seen in manual storage class creation.

Let's use the same example from manual installation and see what its repctl config file would look like:
```yaml
sourceClusterID: "cluster-1"
targetClusterID: "cluster-2"
name: "powermax-replication"
driver: "powermax"
reclaimPolicy: "Retain"
replicationPrefix: "replication.storage.dell.com"
parameters:
  rdfMode: "ASYNC"
  srp:
    source: "SRP_1"
    target: "SRP_1"
  symId:
    source: "000000000001"
    target: "000000000002"
  serviceLevel:
    source: "Optimized"
    target: "Optimized"
  rdfGroup:
    source: "1"
    target: "2"
```

After preparing the config you can apply it to both clusters with repctl, just make sure you've
added your clusters to repctl via the `add` command before.

To create storage classes just run `./repctl create sc --from-config <config-file>` and storage classes
will be applied to both clusters.

After creating storage classes you can make sure they are in place by using `./repctl get storageclasses` command.

### Provisioning Replicated Volumes

After installing the driver and creating storage classes you are good to create volumes using the newly
created storage classes.

On your source cluster, create a PersistentVolumeClaim using one of the replication enabled Storage Classes.
The CSI PowerMax driver will create a volume on the array, add it to a StorageProtectionGroup and configure replication
using the parameters provided in the replication-enabled Storage Class.

#### Provisioning Metro Volumes

Here is an example of a storage class configured for Metro mode:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: powermax-metro
provisioner: csi-powermax.dellemc.com
reclaimPolicy: Delete
volumeBindingMode: Immediate
parameters:
  SRP: "SRP"
  SYMID: "000000000001"
  ServiceLevel: "Optimized"
  replication.storage.dell.com/RemoteSYMID: "000000000002" 
  replication.storage.dell.com/isReplicationEnabled: "true"
  replication.storage.dell.com/RemoteSRP: "SRP"
  replication.storage.dell.com/RemoteServiceLevel: "Optimized" 
  replication.storage.dell.com/RdfMode: "Metro"
  replication.storage.dell.com/Bias: "true"
  replication.storage.dell.com/RdfGroup: "3"
  replication.storage.dell.com/RemoteRDFGroup: "3"
```

After installing the driver and creating a storage class with Metro config (as shown above) we can create volumes.
On your cluster, create a PersistentVolumeClaim using this storage class. The CSI PowerMax driver will create a volume on the array, add it to a StorageProtectionGroup and configure replication using the parameters provided in the replication-enabled Storage Class.


### Supported Replication Actions
The CSI PowerMax driver supports the following list of replication actions:

#### Basic Site Specific Actions
- FAILOVER_LOCAL
- FAILOVER_REMOTE
- UNPLANNED_FAILOVER_LOCAL
- UNPLANNED_FAILOVER_REMOTE
- REPROTECT_LOCAL
- REPROTECT_REMOTE

#### Advanced Site Specific Actions
In this section, we are going to refer to "Site A" as the original source site & "Site B" as the original target site.
Any action with the LOCAL suffix means, do this action for the local site. Any action with the REMOTE suffix means do this action for the remote site.
- FAILOVER_WITHOUT_SWAP_LOCAL
  - You can use this action to do a failover when you are at Site B, and don't want to swap the replication direction.
  - On Site B, run `kubectl edit rg <rg-name>` and edit the 'action' in `spec` with `FAILOVER_WITHOUT_SWAP_LOCAL`.
  - After receiving this request the CSI driver will attempxt to Fail over to Site B which is the local site. 
- FAILOVER_WITHOUT_SWAP_REMOTE
  - You can use this action to do a failover when you are at Site A, and don't want to swap the replication direction.
  - On Site A, run `kubectl edit rg <rg-name>` and edit the 'action' in `spec` with `FAILOVER_WITHOUT_SWAP_REMOTE`.
  - After receiving this request the CSI driver will attempt to Fail over to Site B which is the remote site.
- FAILBACK_LOCAL
  - You can use this action to do a failback, and when you are at Site A.
  - On Site A, run `kubectl edit rg <rg-name>` and edit the 'action' in `spec` with `FAILBACK_LOCAL`.
  - After receiving this request the CSI driver will attempt to Fail back from Site B to Site A which is the local site.
- FAILBACK_REMOTE
  - You can use this action to do a failback, and when you are at Site B.
  - On Site B, run `kubectl edit rg <rg-name>` and edit the 'action' in `spec` with `FAILBACK_REMOTE`.
  - After receiving this request the CSI driver will attempt to Fail back to Site A from Site B which is the local site.
- SWAP_LOCAL
  - You can use this action to swap the replication direction, and you are at Site A.
  - On Site A, run `kubectl edit rg <rg-name>` and edit the 'action' in `spec` with `SWAP_LOCAL`.
  - After receiving this request the CSI driver will attempt to do SWAP at Site A which is the local site.
- SWAP_REMOTE
  - You can use this action to swap the replication direction, and you are at Site B.
  - On Site B, run `kubectl edit rg <rg-name>` and edit the 'action' in `spec` with `SWAP_REMOTE`.
  - After receiving this request the CSI driver will attempt to do SWAP at Site B which is the remote site.

#### Maintenance Actions
- SUSPEND
- RESUME
- ESTABLISH
- SYNC

### Deletion of DellCSIReplicationGroup
The deletion of `DellCSIReplicationGroup` custom resource triggers the `DeleteStorageProtectionGroup` call on the driver.
The storage protection group on the array can be deleted only if it has no volumes associated with it. If the deletion is triggered on the storage protection group with volumes, the deletion will fail and the dell-csi-driver will return a final error to the dell-csm-replication sidecar.
