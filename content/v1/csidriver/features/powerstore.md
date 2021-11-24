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
2. Create PersistentVolume and use this volume-id as a volumeHandle in the manifest. Modify other parameters according to your needs.
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
        volumeHandle: 0055558c-5ae1-4ed1-b421-6f5a9475c19f
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

The CSI PowerStore driver version 2.0.0 supports v1 snapshots.

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

When creating a new host on powerstore array driver will populate host chap credentials with generated values. When re-using already existing hosts driver must override existing CHAP credentials with newly generated ones. 

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
        storageclass.beta.kubernetes.io/is-default-class: false
provisioner: csi-powerstore.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true # Set this attribute to true if you plan to expand any PVCs created using this storage class
parameters:
    FsType: xfs
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
```

## Controller HA

 The CSI PowerStore driver version 1.2 and later introduces the controller HA feature. Instead of StatefulSet, controller pods are deployed as a Deployment.

By default number of replicas is set to 2, you can set `controller.replicas` parameter to 1 in `my-powerstore-settings.yaml` if you want to disable controller HA for your installation. When installing via Operator you can change `replicas` parameter in `spec.driver` section in your PowerStore Custom Resource.

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

This example matches all nodes where the driver has a connection to PowerStore with an IP of `127.0.0.1` via FibreChannel. Similar examples can be found in mentioned folder for NFS and iSCSI.

You can check what labels your nodes contain by running `kubectl get nodes --show-labels`

>Notice that `volumeBindingMode:` is set to `WaitForFirstConsumer` this is required for the topology feature to work.

For any additional information about the topology, see the [Kubernetes Topology documentation](https://kubernetes-csi.github.io/docs/topology.html).


## Reuse PowerStore hostname 

The CSI PowerStore driver version 1.2 and later can automatically detect if the current node was already registered as a Host on the storage array before. It will check if Host initiators and node initiators (FC or iSCSI) match. If they do, the driver will not create a new host and will take the existing name of the Host as nodeID.

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
        blockProtocol: "ISCSI"                    # what SCSI transport protocol use on node side (FC, ISCSI, None, or auto)
        nasName: "nas-server"                    # what NAS must be used for NFS volumes
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
  FsType: "ext4"
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
  FsType: "xfs"
```

Here we specify two storage classes: one of them uses the first array and `ext4` filesystem, and the other uses the second array and `xfs` filesystem. 

Then we need to apply storage classes to Kubernetes using `kubectl`:
```bash
kubectl create -f storageclass.yaml
```

After that, you can use `powerstore-1` storage class to create volumes on the first array and `powerstore-2` storage class to create volumes on the second array. 

## Dynamic secret change detection 

CSI PowerStore driver version 1.3.0 and later supports the ability to detect changes to array configuration Kubernetes secret. This essentially means that you can change credentials for your PowerStore arrays in-flight (without restarting the driver). 

To do so just change your configuration file `config.yaml` and apply it again using the following command:
```bash
sed "s/CONFIG_YAML/`cat config.yaml | base64 -w0`/g" secret.yaml | kubectl apply -f -
```

After Kubernetes remounts secret to driver containers (this usually takes around one minute), a driver must detect the change and start using this new configuration information. 


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
```
cd dell-csi-helm-installer
./csi-install.sh --namespace csi-powerstore --values ./my-powerstore-settings.yaml --upgrade
```

Note: here `my-powerstore-settings.yaml` is a `values.yaml` file which user has used for driver installation.  


### Operator based installation
As part of driver installation, a ConfigMap with the name `powerstore-config-params` is created using the manifest located in the sample file. This ConfigMap contains attributes `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver and `CSI_LOG_FORMAT` which specifies the current log format of the CSI driver. To set the default/initial log level user can set this field during driver installation.

To update the log level dynamically user has to edit the ConfigMap `powerstore-config-params` and update `CSI_LOG_LEVEL` to the desired log level and `CSI_LOG_FORMAT` to the desired log format.
```
kubectl edit configmap -n csi-powerstore powerstore-config-params
```

## NAT Support

CSI Driver for Dell EMC Powerstore is supported in the NAT environment for NFS protocol.

The user will be able to install the driver and able to create pods.
