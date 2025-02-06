---
title: PowerStore
Description: Code features for PowerStore Driver
weight: 1
---

## Creating volumes and consuming them

Create a file `simple.yaml` using sample yaml files located at tests/simple/

This command creates a statefulset that consumes three volumes of default storage classes
```bash
kubectl create -f tests/simple/simple.yaml
```
After executing this command 3 PVC and statefulset are created in the `testpowerstore` namespace.
You can check created PVCs by running `kubectl get pvc -n testpowerstore` and check statefulset's pods by running `kubectl get pods -n testpowerstore`

The pod must be `Ready` and `Running`
> If Pod is in CrashLoopback or PVCs is in a Pending state then driver installation is not successful, check logs of node and controller.

## Deleting volumes

To delete volumes, pod and statefulset run, use the command:
```bash
kubectl delete -f tests/simple/simple.yaml
```

## Consuming existing volumes with static provisioning
You can use existent volumes from PowerStore array as Persistent Volumes in your Kubernetes, perform the following steps:

1. Open your volume in PowerStore Management UI, and take a note of volume-id. The volume link must look similar to `https://<powerstore.api.ip>/#/storage/volumes/0055558c-5ae1-4ed1-b421-6f5a9475c19f/capacity`, where the `volume-id` is `0055558c-5ae1-4ed1-b421-6f5a9475c19f`.
2. Create PersistentVolume and use this volume-id in volumeHandle in format <volume-id/globalID/protocol> in the manifest. Modify other parameters according to your needs.
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
    name: existingvol
spec:
    accessModes:
      - ReadWriteOnce
    capacity:
        storage: 30Gi
    csi:
        driver: csi-powerstore.dellemc.com
        volumeHandle: 0055558c-5ae1-4ed1-b421-6f5a9475c19f/unique/scsi
    persistentVolumeReclaimPolicy: Retain
    storageClassName: powerstore
    volumeMode: Filesystem
```
3. Create PersistentVolumeClaim to use this PersistentVolume.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
    name: pvol
spec:
    accessModes:
      - ReadWriteOnce
    volumeMode: Filesystem
    resources:
        requests:
            storage: 30Gi
    storageClassName: powerstore
```
4. Then use this PVC as a volume in a pod.

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: static-prov-pod
spec:
    containers:
      - name: test
        image: quay.io/centos/centos:latest
        command: [ "/bin/sleep", "3600" ]
        volumeMounts:
          - mountPath: "/data0"
            name: pvol
    volumes:
      - name: pvol
        persistentVolumeClaim:
            claimName: pvol
```
5. After the pod is `Ready` and `Running`, you can start to use this pod and volume.

## Volume Snapshot Feature

The CSI PowerStore driver version 2.0.0 and higher supports v1 snapshots.

In order to use Volume Snapshots, ensure the following components have been deployed to your cluster:
- Kubernetes Volume Snapshot CRDs
- Volume Snapshot Controller
- Volume Snapshot Class

>Note: From v1.4, the CSI PowerStore driver installation process will no longer create VolumeSnapshotClass. 
> If you want to create VolumeSnapshots, then create a VolumeSnapshotClass using the sample provided in the _samples_ folder

### Creating Volume Snapshots
The following is a sample manifest for creating a Volume Snapshot using the **v1** snapshot APIs:
```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: pvol0-snap1
spec:
  volumeSnapshotClassName: powerstore-snapclass
  source:
    persistentVolumeClaimName: pvol0

```

After the VolumeSnapshot has been successfully created by the CSI PowerStore driver, a VolumeSnapshotContent object is automatically created. When the status of the VolumeSnapshot object has the _readyToUse_ field set to _true_, it is available for use.

The following is the relevant section of VolumeSnapshot object status:
```yaml
status:
  boundVolumeSnapshotContentName: snapcontent-5a8334d2-eb40-4917-83a2-98f238c4bda
  creationTime: "2020-07-16T08:42:12Z"
  readyToUse: true
```

### Snapshot feature is optional for the installation

CSI PowerStore driver version 1.4 makes the snapshot feature optional for the installation.

To enable or disable this feature, change values.snapshot.enable parameter to true or false, specify the following in `values.yaml` to enable this feature
```yaml
snapshot:
  enable: true
```

External Snapshotter and its CRDs are not installed even if the Snapshot feature is enabled. These have to be installed manually before the installation.

Disabling the Snapshot feature will opt out of the snapshotter sidecar from the installation.

### Creating PVCs with Volume Snapshots as Source

The following is a sample manifest for creating a PVC with a VolumeSnapshot as a source:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: restorepvc
  namespace: testpowerstore
spec:
  storageClassName: powerstore
  dataSource:
    name: pvol0-snap
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 8Gi
```

## iSCSI CHAP
The CSI PowerStore driver Version 1.3.0 and later extends Challenge Handshake Authentication Protocol (CHAP) support by adding automatic credentials generation.

This means that you no longer need to provide chapsecret/chapuser credentials, they will be automatically generated by the driver for each host. 

To enable this feature you need to set `connection.enableCHAP` to `true` when installing with **helm** or set `X_CSI_POWERSTORE_ENABLE_CHAP` to `true` in your PowerStore CustomResource when installing using **operator**. 

The driver uses the generated chapsecret to configure the iSCSI node database on each node with iSCSI access.

When creating a new host on powerstore array driver will populate host chap credentials with generated values. When reusing already existing hosts driver must override existing CHAP credentials with newly generated ones. 

## Volume Expansion

The CSI PowerStore driver version 1.1 and later supports the expansion of Persistent Volumes (PVs). This expansion can be done either online (for example, when a PV is attached to a node) or offline (for example, when a PV is not attached to any node).

To use this feature, the storage class that is used to create the PV must have the attribute `allowVolumeExpansion` set to true.

The following is a sample manifest for a storage class that allows for Volume Expansion:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
    name: powerstore-expand-sc
    annotations:
        storageclass.kubernetes.io/is-default-class: false
provisioner: csi-powerstore.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true # Set this attribute to true if you plan to expand any PVCs created using this storage class
parameters:
    csi.storage.k8s.io/fstype: xfs
```

To resize a PVC, edit the existing PVC spec and set spec.resources.requests.storage to the intended size. For example, if you have a PVC pstore-pvc-demo of size 3Gi, then you can resize it to 30Gi by updating the PVC.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
    name: pstore-pvc-demo
    namespace: test
spec:
    accessModes:
      - ReadWriteOnce
    volumeMode: Filesystem
    resources:
        requests:
            storage: 30Gi # Updated size from 3Gi to 30Gi
    storageClassName: powerstore-expand-sc
```
>The Kubernetes Volume Expansion feature can only be used to increase the size of a volume. It cannot be used to shrink a volume.

## Raw block support

CSI PowerStore driver supports managing Raw Block volumes since version 1.1

Raw Block volumes are created using the volumeDevices list in the pod template spec with each entry accessing a
`volumeClaimTemplate` specifying a `volumeMode: Block`. An example configuration is outlined here:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
    name: powerstoretest
    namespace: {{ .Values.namespace }}
spec:
    ...
        spec:
            ...
            containers:
              - name: test
                ...
                volumeDevices:
                  - devicePath: "/dev/data0"
                    name: pvol
    volumeClaimTemplates:
      - metadata:
            name: pvol
        spec:
        accessModes:
          - ReadWriteOnce
        volumeMode: Block
        storageClassName: powerstore
        resources:
            requests:
                storage: 8Gi
```
Allowable access modes are `ReadWriteOnce`, `ReadWriteMany`, and for block devices that have been previously initialized,
`ReadOnlyMany`.

Raw Block volumes are presented as a block device to the pod by using a bind mount to a block device in the node's file system.
The driver does not format or check the format of any file system on the block device. Raw Block volumes do support online
Volume Expansion, but it is up to the application to manage to reconfigure the file system (if any) to the new size.

For additional information, see the [kubernetes](https://kubernetes.io/DOCS/CONCEPTS/STORAGE/PERSISTENT-VOLUMES/#raw-block-volume-support) website.


## Volume Cloning Feature
The CSI PowerStore driver version 1.1 and later supports volume cloning. This allows specifying existing PVCs in the _dataSource_ field to indicate a user would like to clone a Volume.

Source and destination PVC must be in the same namespace and have the same Storage Class.

To clone a volume, you must first have an existing pvc, for example, pvol0:
```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: pvol0
  namespace: testpowerstore
spec:
  storageClassName: powerstore
  accessModes:
  - ReadWriteOnce
  volumeMode: Filesystem
  resources:
    requests:
      storage: 8Gi
```

The following is a sample manifest for cloning pvol0:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: clonedpvc
  namespace: testpowerstore
spec:
  storageClassName: powerstore
  dataSource:
    name: pvol0
    kind: PersistentVolumeClaim
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 8Gi
```

## Ephemeral Inline Volume

The CSI PowerStore driver version 1.2 and later supports ephemeral inline CSI volumes. This feature allows CSI volumes to be specified directly in the pod specification. 

At runtime, nested inline volumes follow the ephemeral lifecycle of their associated pods where the driver handles all phases of volume operations as pods are created and destroyed.

The following is a sample manifest for creating ephemeral volume in pod manifest with CSI PowerStore driver.

```yaml
kind: Pod
apiVersion: v1
metadata:
  name: powerstore-inline-volume
spec:
  containers:
    - name: test-container
      image: quay.io/centos/centos
      command: [ "sleep", "3600" ]
      volumeMounts:
      - mountPath: "/data"
        name: volume
  volumes:
  - name: volume
    csi:
      driver: csi-powerstore.dellemc.com
      fsType: "ext4"
      volumeAttributes:
        size: "20Gi"
        arrayID: "unique"
```

This manifest creates a pod and attaches a newly created ephemeral inline CSI volume to it. 

To create `NFS` volume you need to provide `nasName:` parameters that point to the name of your NAS Server in pod manifest like so

```yaml
  volumes:
  - name: volume
    csi:
      driver: csi-powerstore.dellemc.com
      fsType: "nfs"
      volumeAttributes:
        size: "20Gi"
        nasName: "csi-nas-name"
        nfsAcls: "0777"
```

## Controller HA

 The CSI PowerStore driver version 1.2 and later introduces the controller HA feature. Instead of StatefulSet, controller pods are deployed as a Deployment.

By default number of replicas is set to 2, you can set `controller.replicas` parameter to 1 in `my-powerstore-settings.yaml` if you want to disable controller HA for your installation. When installing via Operator you can change `replicas` parameter in `spec.driver.csiDriverSpec` section in your PowerStore Custom Resource.

When multiple replicas of controller pods are in the cluster, each sidecar (attacher, provisioner, resizer, snapshotter) tries to get a lease so only one instance of each sidecar would be active in the cluster at a time. 

### Driver pod placement

You can configure where driver controller and worker pods must be placed. 
To configure use `nodeSelector` and `tolerations` mechanisms you can configure in your `my-powerstore-settings.yaml`

For example, you can specify `tolerations` to assign driver controller pods on controller nodes too:
```yaml
# "controller" allows to configure controller specific parameters
controller:
  # "controller.nodeSelector" defines what nodes would be selected for pods of controller deployment
  nodeSelector:

# "controller.tolerations" defines tolerations that would be applied to controller deployment
  tolerations:
   - key: "node-role.kubernetes.io/master"
     operator: "Exists"
     effect: "NoSchedule"
```

If you want to assign controller pods ONLY on controller nodes you need to configure `nodeSelector`:
```yaml
# "controller" allows to configure controller specific parameters
controller:
  # "controller.nodeSelector" defines what nodes would be selected for pods of controller deployment
  nodeSelector:
    node-role.kubernetes.io/master: ""

  # "controller.tolerations" defines tolerations that would be applied to controller deployment
  tolerations:
   - key: "node-role.kubernetes.io/master"
     operator: "Exists"
     effect: "NoSchedule"
```

As mentioned earlier, you can configure where node driver pods would be assigned in the similar way in `node` section of `my-powerstore-settings.yaml`

## Topology

The CSI PowerStore driver version 1.2 and later supports Topology which forces volumes to be placed on worker nodes that have connectivity to the backend storage. This covers use cases where users have chosen to restrict the nodes on which the CSI driver is deployed.

This Topology support does not include customer-defined topology, users cannot create their own labels for nodes, they must use whatever labels are returned by the driver and applied automatically by Kubernetes on its nodes.

### Topology Usage

To use the Topology features user must create their own storage classes similar to those that can be found in `samples/storageclass` folder.

The following is one of example storage class manifest: 
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: powerstore-fc
provisioner: csi-powerstore.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
allowedTopologies:
  - matchLabelExpressions:
      - key: csi-powerstore.dellemc.com/127.0.0.1-fc
        values:
          - "true"
```

This example matches all nodes where the driver has a connection to PowerStore with an IP of `127.0.0.1` via FibreChannel. Similar examples can be found in mentioned folder for NFS, iSCSI and NVMe.

You can check what labels your nodes contain by running 
```bash
kubectl get nodes --show-labels
```

>Notice that `volumeBindingMode:` is set to `WaitForFirstConsumer` this is required for the topology feature to work.

For any additional information about the topology, see the [Kubernetes Topology documentation](https://kubernetes-csi.github.io/docs/topology.html).

## Volume Limits

The CSI Driver for Dell PowerStore allows users to specify the maximum number of PowerStore volumes that can be used in a node.

The user can set the volume limit for a node by creating a node label `max-powerstore-volumes-per-node` and specifying the volume limit for that node.
<br/> `kubectl label node <node_name> max-powerstore-volumes-per-node=<volume_limit>`

The user can also set the volume limit for all the nodes in the cluster by specifying the same value for the `maxPowerstoreVolumesPerNode` attribute in values.yaml during Helm installation. In the case of driver installed via the operator, this attribute can be modified in the sample yaml file for PowerStore, which is located at https://github.com/dell/csm-operator/blob/main/samples/ by editing the `X_CSI_POWERSTORE_MAX_VOLUMES_PER_NODE` parameter.

>**NOTE:** <br>The default value of `maxPowerstoreVolumesPerNode` is 0. <br>If `maxPowerstoreVolumesPerNode` is set to zero, then CO shall decide how many volumes of this type can be published by the controller to the node.<br><br>The volume limit specified in the `maxPowerstoreVolumesPerNode` attribute is applicable to all the nodes in the cluster for which the node label `max-powerstore-volumes-per-node` is not set.


## Reuse PowerStore hostname 

The CSI PowerStore driver version 1.2 and later can automatically detect if the current node was already registered as a Host on the storage array before. It will check if Host initiators and node initiators (FC, iSCSI or NVMe) match. If they do, the driver will not create a new host and will take the existing name of the Host as nodeID.

## Multiarray support 

The CSI PowerStore driver version 1.3.0 and later support managing multiple PowerStore arrays from the single driver instance. This feature is enabled by default and integrated to even single instance installations. 

To manage multiple arrays you need to create an array connection configuration that lists multiple arrays.

### Creating array configuration 

Create a file called `config.yaml` and populate it with the following content
    
```yaml
   arrays:
      - endpoint: "https://10.0.0.1/api/rest"     # full URL path to the PowerStore API
        globalID: "unique"                        # global ID to identify array
        username: "user"                          # username for connecting to API
        password: "password"                      # password for connecting to API
        skipCertificateValidation: true                            # use insecure connection or not
        default: true                             # treat current array as a default (would be used by storage classes without arrayIP parameter)
        blockProtocol: "ISCSI"                    # what transport protocol use on node side (FC, ISCSI, NVMeTCP, None, or auto)
        nasName: "nas-server"                     # what NAS must be used for NFS volumes
        nfsAcls: "0777"                           # (Optional) defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory.
                                                  # NFSv4 ACls are supported for NFSv4 shares on NFSv4 enabled NAS servers only. POSIX ACLs are not supported and only POSIX mode bits are supported for NFSv3 shares.
      - endpoint: "https://10.0.0.2/api/rest"
        globalID: "unique" 
        username: "user"                          
        password: "password"
        skipCertificateValidation: true                           
        blockProtocol: "FC"                    
```

Here we specify that we want to CSI driver to manage two arrays: one with an IP `10.0.0.1` and the other with an IP `10.0.0.2`, we want to connect to the first array with `iSCSI` protocol and with `FC` to the second array. Also, we want to be able to create NFS-based volume so we provide the name of the NAS to the first array.  

To use this config we need to create a Kubernetes secret from it, to do so create a file called `secret.yaml` in the same folder and populate it with the following content:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: powerstore-config
  namespace: <driver-namespace>
type: Opaque
data:
  config: CONFIG_YAML
```

Apply the secret by running following command: 
```bash

sed "s/CONFIG_YAML/`cat config.yaml | base64 -w0`/g" secret.yaml | kubectl apply -f -
```

### Creating storage classes

To be able to provision Kubernetes volumes using a specific array we need to create corresponding storage classes. 

Create file `storageclass.yaml` and populate it with the following content:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: powerstore-1
provisioner: csi-powerstore.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
parameters:
  arrayID: "GlobalUniqueID"
  csi.storage.k8s.io/fstype: "ext4"
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: powerstore-2
provisioner: csi-powerstore.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
parameters:
  arrayID: "GlobalUniqueID"
  csi.storage.k8s.io/fstype: "xfs"
```

Here we specify two storage classes: one of them uses the first array and `ext4` filesystem, and the other uses the second array and `xfs` filesystem. 

Then we need to apply storage classes to Kubernetes using `kubectl`:
```bash
kubectl create -f storageclass.yaml
```

After that, you can use `powerstore-1` storage class to create volumes on the first array and `powerstore-2` storage class to create volumes on the second array. 

## Dynamic secret change detection

CSI PowerStore supports the ability to dynamically modify array information within the secret, allowing users to update
<u>_credentials_</u> for the PowerStore arrays, in-flight, without restarting the driver.
> Note: Updates to the secret that include adding a new array, or modifying the endpoint, globalID, or blockProtocol parameters
> require the driver to be restarted to properly pick up and process the changes.

To do so, change the configuration file `config.yaml` and apply the update using the following command:
```bash

sed "s/CONFIG_YAML/`cat config.yaml | base64 -w0`/g" secret.yaml | kubectl apply -f -
```

After Kubernetes remounts the secret to the driver containers (this usually takes around one minute), the driver will detect the change and start using
the new configuration information.

## Configuring custom access to NFS exports

CSI PowerStore driver Version 1.3.0 and later supports the ability to configure NFS access to nodes that use dedicated storage networks. 

To enable this feature you need to specify `externalAccess` parameter in your helm `values.yaml` file or `X_CSI_POWERSTORE_EXTERNAL_ACCESS` variable when creating CustomResource using an operator. 

The value of that parameter is added as an additional entry to NFS Export host access. 

For example the following notation:
```yaml
externalAccess: "10.0.0.0/24"
```

This means that we allow for NFS Export created by driver to be consumed by address range `10.0.0.0-10.0.0.255`.


## Array identification based on GlobalID

CSI PowerStore driver version 1.4.0 onwards slightly changes the way arrays are being identified in runtime.
In previous versions of the driver, a management IP address was used to identify an array. The address change could lead to an invalid state of PV.
From version 1.4.0 a unique GlobalID string is used for an array identification.
It has to be specified in `config.yaml` and in Storage Classes. 

The change provides backward compatibility with previously created PVs. 
However, to provision new volumes, make sure to delete old Storage Classes and create new ones with `arrayID` instead of `arrayIP` specified.

> NOTE: It is recommended to migrate the PVs to new identifiers before changing management IPs of storage systems. The recommended way to do it is to clone the existing volume and delete the old one. The cloned volume will automatically switch to using globalID instead of management IP.

## Root squashing 

CSI PowerStore driver version 1.4.0 and later allows users to enable root squashing for NFS volumes provisioned by the driver. 

Root squashing rule prevents root users on NFS clients from exercising root privileges on the NFS server.

To enable this rule, you need to set parameter `allowRoot` to `false` in your NFS storage class. 

Your storage class definition must look similar to this:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
...
parameters:
  ...
  allowRoot: "false"  # enables or disables root squashing
```

> The 1.4 version and later of the driver also enables any container user, to have full access to provisioned NFS volume, in earlier versions only `root` user had access

## Dynamic Logging Configuration

This feature is introduced in CSI Driver for PowerStore version 2.0.0. 

### Helm based installation
As part of driver installation, a ConfigMap with the name `powerstore-config-params` is created, which contains attributes `CSI_LOG_LEVEL` which specifies the current log level of CSI driver and `CSI_LOG_FORMAT` which specifies the current log format of CSI driver. 

Users can set the default log level by specifying log level to `logLevel` and log format to `logFormat` attribute in `my-powerstore-settings.yaml` during driver installation.

To change the log level or log format dynamically to a different value user can edit the same values.yaml, and run the following command
```bash
cd dell-csi-helm-installer
./csi-install.sh --namespace csi-powerstore --values ./my-powerstore-settings.yaml --upgrade
```

Note: here `my-powerstore-settings.yaml` is a `values.yaml` file which user has used for driver installation.  


### Operator based installation
As part of driver installation, a ConfigMap with the name `powerstore-config-params` is created using the manifest located in the sample file. This ConfigMap contains attributes `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver and `CSI_LOG_FORMAT` which specifies the current log format of the CSI driver. To set the default/initial log level user can set this field during driver installation.

To update the log level dynamically user has to edit the ConfigMap `powerstore-config-params` and update `CSI_LOG_LEVEL` to the desired log level and `CSI_LOG_FORMAT` to the desired log format.
```bash
kubectl edit configmap -n csi-powerstore powerstore-config-params
```

## NAT Support

CSI Driver for Dell Powerstore is supported in the NAT environment for NFS protocol.

The user will be able to install the driver and able to create pods.


## PV/PVC Metrics

CSI Driver for Dell Powerstore 2.1.0 and above supports volume health monitoring. Alpha feature gate `CSIVolumeHealth` needs to be enabled for the node side monitoring to take effect. For more information, please refer to the [Kubernetes GitHub repository](https://github.com/kubernetes-csi/external-health-monitor/blob/master/README.md). To use this feature, set controller.healthMonitor.enabled and node.healthMonitor.enabled to true. To change the monitor interval, set controller.healthMonitor.interval parameter.


## Single Pod Access Mode for PersistentVolumes- ReadWriteOncePod 

Use `ReadWriteOncePod(RWOP)` access mode if you want to ensure that only one pod across the whole cluster can read that PVC or write to it. This is supported for CSI Driver for PowerStore 2.1.0+ and Kubernetes version 1.22+.

### Creating a PersistentVolumeClaim
```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: single-node-single-writer
spec:
  accessModes:
  - ReadWriteOncePod # Allow only a single pod to access single-node-single-writer
  resources:
    requests:
      storage: 5Gi
```

>Note: The access mode ReadWriteOnce allows multiple pods to access a single volume within a single worker node and the behavior is consistent across all supported Kubernetes versions.

When this feature is enabled, the existing `ReadWriteOnce(RWO)` access mode restricts volume access to a single node and allows multiple pods on the same node to read from and write to the same volume.

To migrate existing PersistentVolumes to use `ReadWriteOncePod`, please follow the instruction from [here](https://kubernetes.io/docs/tasks/administer-cluster/change-pv-access-mode-readwriteoncepod/).

## POSIX mode bits and NFSv4 ACLs

CSI PowerStore driver version 2.2.0 and later allows users to set user-defined permissions on NFS target mount directory using POSIX mode bits or NFSv4 ACLs.

NFSv4 ACLs are supported for NFSv4 shares on NFSv4 enabled NAS servers only. Please ensure the order when providing the NFSv4 ACLs.

To use this feature, provide permissions in `nfsAcls` parameter in values.yaml, secrets or NFS storage class.

For example:

1. POSIX mode bits

```yaml
nfsAcls: "0755"
```

2. NFSv4 ACLs

```yaml
nfsAcls: "A::OWNER@:rwatTnNcCy,A::GROUP@:rxtncy,A::EVERYONE@:rxtncy,A::user@domain.com:rxtncy"
```

>Note: If no values are specified, default value of "0777" will be set.
>POSIX ACLs are not supported and only POSIX mode bits are supported for NFSv3 shares.


## NVMe Support

**NVMeTCP Support**
CSI Driver for Dell Powerstore 2.2.0 and above supports NVMe/TCP provisioning. To enable NVMe/TCP provisioning, blockProtocol on secret should be specified as `NVMeTCP`.
>Note: NVMe/TCP is not supported on RHEL 7.x versions and CoreOS. 
>NVMe/TCP is supported with Powerstore 2.1 and above.

**NVMeFC Support**
CSI Driver for Dell Powerstore 2.3.0 and above supports NVMe/FC provisioning. To enable NVMe/FC provisioning, blockProtocol on secret should be specified as `NVMeFC`.
>NVMe/FC is supported with Powerstore 3.0 and above.

>NVMe-FC feature is supported with Helm.

>Note: 
>   In case blockProtocol is specified as `auto`, the driver will be able to find the initiators on the host and choose the protocol accordingly. If the host has multiple protocols enabled, then NVMeFC gets the highest priority followed by NVMeTCP, followed by FC and then iSCSI.

## Volume group snapshot Support

CSI Driver for Dell Powerstore 2.3.0 and above supports creating volume groups and take snapshot of them by making use of CRD (Custom Resource Definition). More information can be found here: [Volume Group Snapshotter](../../../snapshots/volume-group-snapshots/).

## Configurable Volume Attributes (Optional)

The CSI PowerStore driver version 2.3.0 and above supports Configurable volume attributes. 

PowerStore array provides a set of optional volume creation attributes. These attributes can be configured for the volume (block and NFS) at the time of creation through PowerStore CSI driver. 
These attributes can be specified as labels in PVC yaml file. The following is a sample manifest for creating volume with some of the configurable volume attributes. 

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc1
  namespace: default
  labels:
    csi.dell.com/description: DB-volume
    csi.dell.com/appliance_id: A1
    csi.dell.com/volume_group_id: f5f9dbbd-d12f-463e-becb-2e6d0a85405e
spec:
  accessModes:
  - ReadWriteOnce
  resources:
        requests:
          storage: 8Gi
  storageClassName: powerstore-ext4

```

>Note: Default description value is `pvcName-pvcNamespace`. 

This is the list of all the attributes supported by PowerStore CSI driver: 

| Block Volume | NFS Volume |
| --- | --- |
| csi.dell.com/description <br /> csi.dell.com/appliance_id <br /> csi.dell.com/volume_group_id <br /> csi.dell.com/protection_policy_id <br /> csi.dell.com/performance_policy_id <br /> csi.dell.com/app_type <br /> csi.dell.com/app_type_other <br />  <br />  <br />  <br />  <br />  <br /> | csi.dell.com/description <br /> csi.dell.com/config_type <br /> csi.dell.com/access_policy <br /> csi.dell.com/locking_policy <br /> csi.dell.com/folder_rename_policy <br /> csi.dell.com/is_async_mtime_enabled <br /> csi.dell.com/protection_policy_id <br /> csi.dell.com/file_events_publishing_mode <br /> csi.dell.com/host_io_size <br /> csi.dell.com/flr_attributes.flr_create.mode <br /> csi.dell.com/flr_attributes.flr_create.default_retention <br /> csi.dell.com/flr_attributes.flr_create.maximum_retention <br /> csi.dell.com/flr_attributes.flr_create.minimum_retention |

<br>  

**Note:**
>Refer to the PowerStore array specification for the allowed values for each attribute, at `https://<array-ip>/swaggerui/`. 
>Make sure that the attributes specified are supported by the version of PowerStore array used. 

>Configurable Volume Attributes feature is supported with Helm.

>Prefix `csi.dell.com/` has been added to the attributes from CSI PowerStore driver version 2.8.0

## Storage Capacity Tracking
CSI PowerStore driver version 2.5.0 and above supports Storage Capacity Tracking.

This feature helps the scheduler to make more informed choices about where to start pods which depend on unbound volumes with late binding (aka "wait for first consumer"). Pods will be scheduled on a node (satisfying the topology constraints) only if the requested capacity is available on the storage array.
If such a node is not available, the pods stay in Pending state. This means they are not scheduled.

Without storage capacity tracking, pods get scheduled on a node satisfying the topology constraints. If the required capacity is not available, volume attachment to the pods fails, and pods remain in ContainerCreating state. Storage capacity tracking eliminates unnecessary scheduling of pods when there is insufficient capacity.

The attribute `storageCapacity.enabled` in `my-powerstore-settings.yaml` can be used to enabled/disabled the feature during driver installation .
To configure how often driver checks for changed capacity set `storageCapacity.pollInterval` attribute. In case of driver installed via operator, this interval can be configured in the sample files provided [here](https://github.com/dell/csm-operator/tree/main/samples) by editing the `capacity-poll-interval` argument present in the `provisioner` sidecar.

