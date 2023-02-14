---
title: PowerFlex
linktitle: PowerFlex 
weight: 1
Description: Code features for PowerFlex Driver
---

## Volume Snapshot Feature

The CSI PowerFlex driver versions 2.0 and higher support v1 snapshots.

In order to use Volume Snapshots, ensure the following components are deployed to your cluster:
- Kubernetes Volume Snapshot CRDs
- Volume Snapshot Controller

### Volume Snapshot Class

Installation of PowerFlex driver v1.5 and later does not create VolumeSnapshotClass. You can find a sample of a default v1
VolumeSnapshotClass instance in `samples/volumesnapshotclass` directory. If needed, you can install the default sample. Following is the default sample for v1:

```
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: vxflexos-snapclass
driver: csi-vxflexos.dellemc.com
# Configure what happens to a VolumeSnapshotContent when the VolumeSnapshot object
# it is bound to is to be deleted
# Allowed values:
#   Delete: the underlying storage snapshot will be deleted along with the VolumeSnapshotContent object.
#   Retain: both the underlying snapshot and VolumeSnapshotContent remain.
deletionPolicy: Delete
```

### Create Volume Snapshot

The following is a sample manifest for creating a Volume Snapshot using the v1 snapshot APIs:

```
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: pvol0-snap1
  namespace: helmtest-vxflexos
spec:
  volumeSnapshotClassName: vxflexos-snapclass
  source:
    persistentVolumeClaimName: pvol0
```

Once the VolumeSnapshot is successfully created by the CSI PowerFlex driver, a VolumeSnapshotContent object is automatically created. Once the status of the VolumeSnapshot object has the _readyToUse_ field set to _true_, it is available for use.

Following is the relevant section of VolumeSnapshot object status:
```
status:
  boundVolumeSnapshotContentName: snapcontent-5a8334d2-eb40-4917-83a2-98f238c4bda
  creationTime: "2020-07-16T08:42:12Z"
  readyToUse: true
```

### Creating PVCs with Volume Snapshots as Source

The following is a sample manifest for creating a PVC with a VolumeSnapshot as a source:
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: restorepvc
  namespace: helmtest-vxflexos
spec:
  storageClassName: vxflexos
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

## Create Consistent Snapshot of Group of Volumes

This feature extends CSI specification to add the capability to create crash-consistent snapshots of a group of volumes. This feature is available as a technical preview. To use this feature, users have to deploy the csi-volumegroupsnapshotter side-car as part of the PowerFlex driver. Once the sidecar has been deployed, users can make snapshots by using yaml files, More information can be found here: [Volume Group Snapshotter](../../../snapshots/volume-group-snapshots/).

## Volume Expansion Feature

The CSI PowerFlex driver version 1.2 and later support expansion of Persistent Volumes. This expansion is done online, which is when PVC is attached to a node.

To use this feature, the storage class used to create the PVC must have the attribute _allowVolumeExpansion_ set to _true_.

Following is a sample manifest for a storage class that allows for Volume Expansion:
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: vxflexos-expand
  annotations:
provisioner: csi-vxflexos.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true
parameters:
  storagepool: pool
volumeBindingMode: WaitForFirstConsumer
allowedTopologies:
- matchLabelExpressions:
  - key: csi-vxflexos.dellemc.com/sample
    values:
    - csi-vxflexos.dellemc.com
```
To resize a PVC, edit the existing PVC spec and set _spec.resources.requests.storage_ to the intended size.

For example, if you have a PVC - pvol0 of size 8Gi, then you can resize it to 16 Gi by updating the PVC:
```
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 16Gi #update from 8Gi
  storageClassName: vxflexos
  volumeMode: Filesystem
  volumeName: k8s-0e50dada
status:
  accessModes:
  - ReadWriteOnce
  capacity:
    storage: 8Gi
  phase: Bound
```
> *NOTE:* Kubernetes Volume Expansion feature cannot be used to shrink a volume and volumes cannot be expanded to a value that is not a multiple of 8. If attempted, the driver will round up. For example, if the above PVC was edited to have a size of 20 Gb, the size would actually be expanded to 24 Gb, the next highest multiple of 8.

## Volume Cloning Feature
The CSI PowerFlex driver version 1.3 and later support volume cloning. This feature allows specifying existing PVCs in the _dataSource_ field to indicate a user would like to clone a Volume.

The source PVC must be bound and available (not in use). Source and destination PVC must be in the same namespace and have the same Storage Class.

To clone a volume, you must first have an existing pvc, for example, pvol0:
```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: pvol0
  namespace: helmtest-vxflexos
spec:
  storageClassName: vxflexos
  accessModes:
  - ReadWriteOnce
  volumeMode: Filesystem
  resources:
    requests:
      storage: 8Gi
```

The following is a sample manifest for cloning pvol0:
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: clonedpvc
  namespace: helmtest-vxflexos
spec:
  storageClassName: vxflexos
  dataSource:
    name: pvol0
    kind: PersistentVolumeClaim
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 8Gi
```

## Raw Block Support

The CSI PowerFlex driver version 1.2 and later support Raw Block volumes, which are created using the _volumeDevices_ list in the pod template spec with each entry accessing a volumeClaimTemplate specifying a _volumeMode: Block_.

Following is an example configuration of **Raw Block Outline**:

```
kind: StatefulSet
apiVersion: apps/v1
metadata:
    name: powerflextest
    namespace: helmtest-vxflexos
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
        storageClassName: vxflexos
        resources:
          requests:
          storage: 8Gi
```
Allowable access modes are _ReadWriteOnce_, _ReadWriteMany_, and for block devices that have been previously initialized, _ReadOnlyMany_.

Raw Block volumes are presented as a block device to the pod by using a bind mount to a block device in the node's file system. The driver does not format or check the format of any file system on the block device. Raw Block volumes do support online Volume Expansion, but it is up to the application to manage to reconfigure the file system (if any) to the new size.

For additional information, see the [Kubernetes Raw Block Volume Support documentation](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#volume-mode).

## Custom File System Format Options

The CSI PowerFlex driver version 1.5 and later support additional mkfs format options. A user is able to specify additional format options as needed for the driver. Format options are specified in storageclass yaml under _mkfsFormatOption_ as in the following example:

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: vxflexos
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: csi-vxflexos.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true
parameters:
  storagepool: <STORAGE_POOL> # Insert Storage pool
  systemID: <SYSTEM_ID> # Insert System ID
  mkfsFormatOption: "<mkfs_format_option>" # Insert file system format option
volumeBindingMode: WaitForFirstConsumer
allowedTopologies:
- matchLabelExpressions:
  - key: csi-vxflexos.dellemc.com/<SYSTEM_ID> # Insert System ID
    values:
    - csi-vxflexos.dellemc.com

```
- *WARNING*: Before utilizing format options, you must first be fully aware of the potential impact and understand your environment's requirements for the specified option.



## Topology Support

The CSI PowerFlex driver version 1.2 and later supports Topology which forces volumes to be placed on worker nodes that have connectivity to the backend storage. This covers use cases where:
- The PowerFlex SDC may not be installed or running on some nodes.
- Users have chosen to restrict the nodes on which the CSI driver is deployed.

This Topology support does not include customer-defined topology, users cannot create their own labels for nodes and storage classes and expect the labels to be honored by the driver.

### Topology Usage

To utilize the Topology feature, the storage classes are modified to specify the _volumeBindingMode_ as _WaitForFirstConsumer_ and to specify the desired topology labels within _allowedTopologies_. This ensures that the pod schedule takes advantage of the topology and be guaranteed that the node selected has access to provisioned volumes.

Storage Class Example with Topology Support:
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    meta.helm.sh/release-name: vxflexos
    meta.helm.sh/release-namespace: vxflexos
    storageclass.kubernetes.io/is-default-class: "true"
  creationTimestamp: "2020-05-27T13:24:55Z"
  labels:
    app.kubernetes.io/managed-by: Helm
  name: vxflexos
  resourceVersion: "170198"
  selfLink: /apis/storage.k8s.io/v1/storageclasses/vxflexos
  uid: abb094e6-2c25-42c1-b82e-bd80372e78b
parameters:
  storagepool: pool
provisioner: csi-vxflexos.dellemc.com
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowedTopologies:
- matchLabelExpressions:
  - key: csi-vxflexos.dellemc.com/6c29fd07674c
    values:
    - csi-vxflexos.dellemc.com
```
For additional information, see the [Kubernetes Topology documentation](https://kubernetes-csi.github.io/docs/topology.html).

> *NOTE*: In the manifest file of the Dell CSI operator, topology can be enabled by specifying the system name or _systemid_ in the allowed topologies field. _Volumebindingmode_ is also set to _WaitForFirstConsumer_ by default.

## Controller HA   

The CSI PowerFlex driver version 1.3 and later support multiple controller pods. A Controller pod can be assigned to a worker node or a master node, as long as no other controller pod is currently assigned to the node. To control the number of controller pods, edit:
```
controllerCount: 2
```
in your values file to the desired number of controller pods. By default, the driver will deploy with two controller pods, each assigned to a different worker node. 

> *NOTE:* If the controller count is greater than the number of available nodes, excess controller pods will be stuck in a pending state. 

If you are using the Dell CSI Operator, the value to adjust is:  
```  
replicas: 1  
```
in your driver yaml in `config/samples/`

If you want to specify where controller pods get assigned, make the following edits to your values file at `csi-vxflexos/helm/csi-vxflexos/values.yaml`:    

To assign controller pods to worker nodes only (Default):   
```
# "controller" allows to configure controller specific parameters
controller:

  #"controller.nodeSelector" defines what nodes would be selected for pods of controller deployment
  # Leave as blank to use all nodes
  # Allowed values: map of key-value pairs
  # Default value: None
  # Examples:
  #   node-role.kubernetes.io/master: ""
  nodeSelector:
  #   node-role.kubernetes.io/master: ""
  
  # "controller.tolerations" defines tolerations that would be applied to controller deployment
  # Leave as blank to install controller on worker nodes
  # Default value: None
  tolerations:
  # - key: "node-role.kubernetes.io/master"
  #   operator: "Exists"
  #   effect: "NoSchedule"

```
To assign controller pods to master and worker nodes:  
```
# "controller" allows to configure controller specific parameters
controller:

  #"controller.nodeSelector" defines what nodes would be selected for pods of controller deployment
  # Leave as blank to use all nodes
  # Allowed values: map of key-value pairs
  # Default value: None
  # Examples:
  #   node-role.kubernetes.io/master: ""
  nodeSelector:
  #   node-role.kubernetes.io/master: ""
  
  # "controller.tolerations" defines tolerations that would be applied to controller deployment
  # Leave as blank to install controller on worker nodes
  # Default value: None
  tolerations:
   - key: "node-role.kubernetes.io/master"
     operator: "Exists"
     effect: "NoSchedule"
```

To assign controller pods to master nodes only:  
```  
# "controller" allows to configure controller specific parameters
controller:

  #"controller.nodeSelector" defines what nodes would be selected for pods of controller deployment
  # Leave as blank to use all nodes
  # Allowed values: map of key-value pairs
  # Default value: None
  # Examples:
  #   node-role.kubernetes.io/master: ""
  nodeSelector:
     node-role.kubernetes.io/master: ""
  
  # "controller.tolerations" defines tolerations that would be applied to controller deployment
  # Leave as blank to install controller on worker nodes
  # Default value: None
  tolerations:
   - key: "node-role.kubernetes.io/master"
     operator: "Exists"
     effect: "NoSchedule"
```
> *NOTE:* Tolerations/selectors work the same way for node pods.   

For configuring Controller HA on the Dell CSI Operator, please refer to the [Dell CSI Operator documentation](../../installation/operator/#custom-resource-specification).  

## SDC Deployment

The CSI PowerFlex driver version 1.3 and later support the automatic deployment of the PowerFlex SDC on Kubernetes nodes which run the node portion of the CSI driver. The deployment of the SDC kernel module occurs on these nodes with OS platforms which support automatic SDC deployment: currently Red Hat CoreOS (RHCOS), RHEL8.x,RHEL 7.9 are the only supported OS platforms. On Kubernetes nodes with OS version not supported by automatic install, you must perform the Manual SDC Deployment steps below. Refer https://hub.docker.com/r/dellemc/sdc for your OS versions.

- On Kubernetes nodes which run the node portion of the CSI driver, the SDC init container runs prior to the driver being installed. It installs the SDC kernel module on the nodes with OS version which supports automatic SDC deployment. If there is an SDC kernel module installed then the version is checked and updated.
- Optionally, if the SDC monitor is enabled, another container is started and runs as the monitor. Follow PowerFlex SDC documentation to get monitor metrics.
- On nodes that do not support automatic SDC deployment by SDC init container, manual installation steps must be followed. The SDC init container skips installing and you can see this mentioned in the logs by running kubectl logs on the node for SDC.
  Refer to https://hub.docker.com/r/dellemc/sdc for supported OS versions.
- There is no automated uninstallation of the SDC kernel module. Follow PowerFlex SDC documentation to manually uninstall the SDC driver from the node. 

## Multiarray Support

The CSI PowerFlex driver version 1.4 added support for managing multiple PowerFlex arrays from the single driver instance. This feature is enabled by default and integrated to even single instance installations.

To manage multiple arrays you need to create an array connection configuration that lists multiple arrays.

### Creating array configuration

There is a sample yaml file in the samples folder under the top-level directory called `config.yaml` with the following content:
 ```yaml
  # Username for accessing PowerFlex system.	
- username: "admin"
  # Password for accessing PowerFlex system.	
  password: "password"
  # System name/ID of PowerFlex system.	
  systemID: "ID1"
  # REST API gateway HTTPS endpoint for PowerFlex system.
  endpoint: "https://127.0.0.1"
  # Determines if the driver is going to validate certs while connecting to PowerFlex REST API interface.
  # Allowed values: true or false
  # Default value: true
  skipCertificateValidation: true 
  # indicates if this array is the default array
  # needed for backwards compatibility
  # only one array is allowed to have this set to true 
  # Default value: false
  isDefault: true
  # defines the MDM(s) that SDC should register with on start.
  # Allowed values:  a list of IP addresses or hostnames separated by comma.
  # Default value: none 
  mdm: "10.0.0.1,10.0.0.2"
- username: "admin"
  password: "Password123"
  systemID: "ID2"
  endpoint: "https://127.0.0.2"
  skipCertificateValidation: true 
  mdm: "10.0.0.3,10.0.0.4"
 ```
Here we specify that we want the CSI driver to manage two arrays: one with an IP `127.0.0.1` and the other with an IP `127.0.0.2`.

To use this config we need to create a Kubernetes secret from it. To do so, run the following command:

`kubectl create secret generic vxflexos-config -n vxflexos --from-file=config=config.yaml`

## Dynamic Array Configuration

To update or change any array configuration property, edit the secret. The driver will detect the change automatically and use the new values based on the Kubernetes watcher file change detection time.  You can use kubectl command to delete the current secret and create a new secret with changes. For example, refer yaml above and change only the password.
```yaml
 - username: "admin"
   password: "Password123"
```
to
```yaml
 - username: "admin"
   password: "Password456"
```
Below are sample command lines to delete a secret and create modified properties from file `secret.yaml`.
```bash
kubectl delete secret vxflexos-config  -n vxflexos
kubectl create secret generic vxflexos-config -n vxflexos --from-file=config=./secret.yaml
```
Dynamic array configuration change detection is only used for properties of an existing array, like username or password.
To add a new array to the secret, or to alter an array's mdm field, you must run `csi-install.sh` with `--upgrade` option to update the MDM key in secret and restart the node pods.
```bash
cd <DRIVER-HOME>/dell-csi-helm-installer
./csi-install.sh --upgrade --namespace vxflexos --values ../helm/csi-vxflexos/values.yaml
 kubectl delete  pods --all -n vxflexos
```

### Creating storage classes 

To be able to provision Kubernetes volumes using a specific array, we need to create corresponding storage classes.

Find the sample yaml files under `samples/storageclass`. Edit `storageclass.yaml` if you want `ext4` filesystem, and use `storageclass-xfs.yaml` if you want `xfs` filesystem. Replace `<STORAGE_POOL>` with the storage pool you have, and replace `<SYSTEM_ID>` with the system ID or system name for the array you'd like to use. 

Then we need to apply storage classes to Kubernetes using `kubectl`:

```bash
kubectl apply -f storageclass.yaml
```

After that, you can use the storage class for the corresponding array.

## Ephemeral Inline Volume

Starting from version 1.4, CSI PowerFlex driver supports ephemeral inline CSI volumes. This feature allows CSI volumes to be specified directly in the pod specification. 

At runtime, nested inline volumes follow the ephemeral lifecycle of their associated pods where the driver handles all phases of volume operations as pods are created and destroyed.

The following is a sample manifest (found in csi-vxflexos/test/helm/ephemeral) for creating ephemeral volume in pod manifest with CSI PowerFlex driver.

```yaml
kind: Pod
apiVersion: v1
metadata:
  name: my-csi-app-inline-volumes
spec:
  containers:
    - name: my-frontend
      image: busybox
      command: [ "sleep", "100000" ]
      volumeMounts:
      - mountPath: "/data0"
        name: my-csi-volume
      - mountPath: "/data1"
        name: my-csi-volume-xfs
  volumes:
  - name: my-csi-volume
    csi:
      driver: csi-vxflexos.dellemc.com
      fsType: "ext4"
      volumeAttributes:
        volumeName: "my-csi-volume"
        size: "8Gi"
        storagepool: sample
        systemID: sample
  - name: my-csi-volume-xfs
    csi:
      driver: csi-vxflexos.dellemc.com
      fsType: "xfs"
      volumeAttributes:
        volumeName: "my-csi-volume-xfs"
        size: "10Gi"
        storagepool: sample
        systemID: sample

```

This manifest creates a pod and attach two newly created ephemeral inline csi volumes to it, one ext4 and the other xfs.  
To run the corresponding helm test, go to csi-vxflexos/test/helm/ephemeral and fill in the values for storagepool and systemID in sample.yaml.  
Then run:
````
./testEphemeral.sh
````
this test deploys the pod with two ephemeral volumes, and write some data to them before deleting the pod.   
When creating ephemeral volumes, it is important to specify the following within the volumeAttributes section: volumeName, size, storagepool, and if you want to use a non-default array, systemID.  

## Consuming Existing Volumes with Static Provisioning

To use existing volumes from PowerFlex array as Peristent volumes in your Kubernetes environment, perform these steps:
1. Log into one of the MDMs of the PowerFlex cluster.
2. Execute these commands to retrieve the `systemID` and `volumeID`.
    1. `scli --mdm_ip <IPs, comma separated> --login --username <username> --password <password>`
    - **Output:** `Logged in. User role is SuperUser. System ID is <systemID>`
    2. `scli --query_volume --volume_name <volume name>`
    - **Output:** `Volume ID: <volumeID> Name: <volume name>`
3. Create PersistentVolume and use this volume ID in the volumeHandle with the format `systemID`-`volumeID` in the manifest. Modify other parameters according to your needs.
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: existingVol
spec:
  capacity:
    storage: 8Gi
  csi:
    driver: csi-vxflexos.dellemc.com
    volumeHandle: <systemID>-<volumeID>
  volumeMode: Filesystem
  accessModes:
  - ReadWriteOnce
  storageClassName: vxflexos
```
4. Create PersistentVolumeClaim to use this PersistentVolume.
```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: pvol
spec:
  accessModes:
  - ReadWriteOnce
  volumeMode: Filesystem
  resources:
    requests:
      storage: 8Gi
  storageClassName: vxflexos
```
5. Then use this PVC as a volume in a pod.
```yaml
apiVersion: v1
kind: Pod
metadata:
    name: static-prov-pod
spec:
    containers:
      - name: test
        image: busybox
        command: [ "sleep", "3600" ]
        volumeMounts:
          - mountPath: "/data0"
            name: pvol
    volumes:
      - name: pvol
        persistentVolumeClaim:
            claimName: pvol
```
6. After the pod is `Ready` and `Running`, you can start to use this pod and volume.

**Note:** Retrieval of the volume ID is possible through the UI. You must select the volume, navigate to `Details` section and click the volume in the graph. This selection will set the filter to the desired volume. At this point the volume ID can be found in the URL.

## Dynamic Logging Configuration

The dynamic logging configuration that was introduced in v1.5 of the driver was revamped for v2.0; v1.5 logging configuration is not compatible with v2.0.   
Two fields in values.yaml (located at helm/csi-vxflexos/values.yaml) are used to configure the dynamic logging: logLevel and logFormat.

```
# CSI driver log level
# Allowed values: "error", "warn"/"warning", "info", "debug"
# Default value: "debug"
logLevel: "debug"

# CSI driver log format
# Allowed values: "TEXT" or "JSON"
# Default value: "TEXT"
logFormat: "TEXT"    
```

To change the logging fields after the driver is deployed, you can use this command to edit the configmap:  
` kubectl edit configmap -n vxflexos vxflexos-config-params `  
and then make the necessary adjustments for CSI_LOG_LEVEL and CSI_LOG_FORMAT.   

If either option is set to a value outside of what is supported, the driver will use the default values of "debug" and "text" . 

## Volume Health Monitoring 

> *NOTE*: This feature requires the alpha feature gate, CSIVolumeHealth to be set to true. If the feature gate is on, and you want to use this feature,
> ensure the proper values are enabled in your values file. See the values table in the installation doc for more details. 

Starting in version 2.1, CSI Driver for PowerFlex now supports volume health monitoring. This allows Kubernetes to report on the condition of the underlying volumes via events when a volume condition is abnormal. For example, if a volume were to be deleted from the array, or unmounted outside of Kubernetes, Kubernetes will now report these abnormal conditions as events.  

To accomplish this, the driver utilizes the external-health-monitor sidecar. When driver detects a volume condition is abnormal, the sidecar will report an event to the corresponding PVC. For example, in this event from `kubectl describe pvc -n <ns>` we can see that the underlying volume was deleted from the PowerFlex array:
```
Events:
  Type     Reason                     Age                 From                                                         Message
  ----     ------                     ----                ----                                                         ------
  Warning  VolumeConditionAbnormal    32s                 csi-pv-monitor-controller-csi-vxflexos.dellemc.com           Volume is not found at 2021-11-03 20:31:04
```
Events will also be reported to pods that have abnormal volumes. In these two events from `kubectl describe pods -n <ns>`, we can see that this pod has two abnormal volumes: one volume was unmounted outside of Kubernetes, while another was deleted from PowerFlex array.
```
Events:
  Type     Reason                     Age                 From         Message
  ----     ------                     ----                ----         ------
Warning  VolumeConditionAbnormal      35s (x9 over 12m)  kubelet       Volume vol4: volPath: /var/.../rhel-705f0dcbf1/mount is not mounted: <nil>
Warning  VolumeConditionAbnormal      5s                 kubelet       Volume vol2: Volume is not found by node driver at 2021-11-11 02:04:49
```

## Set QoS Limits
Starting in version 2.5, CSI Driver for PowerFlex now supports setting the limits for the bandwidth and IOPS that one SDC generates for the specified volume. This enables the CSI driver to control the quality of service (QoS).
In this release this is supported at the StorageClass level, so once a volume is created QoS Settings can't be adjusted later.
To accomplish this, two new parameters are introduced in the storage class: bandwidthLimitInKbps and iopsLimit.
> Ensure that the proper values are enabled in your storage class yaml files. Refer to the [sample storage class yamls](https://github.com/dell/csi-powerflex/tree/main/samples/storageclass) for more details.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
    name: vxflexos
    annotations:
        storageclass.kubernetes.io/is-default-class: "true"
provisioner: csi-vxflexos.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true
parameters:
    storagepool: "pool2" # Insert Storage pool
    systemID: <SYSTEM_ID> # Insert System ID
    bandwidthLimitInKbps: "10240" # Insert bandwidth limit in Kbps
    iopsLimit: "11" # Insert iops limit
    csi.storage.k8s.io/fstype: ext4
volumeBindingMode: WaitForFirstConsumer
allowedTopologies:
  - matchLabelExpressions:
      - key: csi-vxflexos.dellemc.com/<SYSTEM_ID> # Insert System ID
        values:
          - csi-vxflexos.dellemc.com
```
Once the volume gets created, the ControllerPublishVolume will set the QoS limits for the volumes mapped to SDC.

## Rename SDC

Starting with version 2.6, the CSI driver for PowerFlex will support renaming of SDCs. To use this feature, the node section of values.yaml should have renameSDC keys enabled with a prefix value.

To enable renaming of SDC, make the following edits to [values.yaml](https://github.com/dell/csi-powerflex/blob/main/helm/csi-vxflexos/values.yaml) file:
```yaml
# "node" allows to configure node specific parameters
node:
   ...
   ...

  # "renameSDC" defines the rename operation for SDC
  # Default value: None
  renameSDC:
    # enabled: Enable/Disable rename of SDC
    # Allowed values:
    #   true: enable renaming
    #   false: disable renaming
    # Default value: "false"
    enabled: false
    # "prefix" defines a string for the new name of the SDC.
    # "prefix" + "worker_node_hostname" should not exceed 31 chars.
    # Default value: none
    # Examples: "rhel-sdc", "sdc-test"
    prefix: "sdc-test"
```
The renameSDC section is going to be used by the Node Service, it has two keys enabled and prefix:
* `enabled`: Boolean variable that specifies if the renaming for SDC is to be carried out or not. If true then the driver will perform the rename operation. By default, its value will be false.
* `prefix`: string variable that is used to set the prefix for SDC name.

Based on these two keys, there are certain scenarios on which the driver is going to perform the rename SDC operation:
* If enabled and prefix given then set the prefix+worker_node_name for SDC name.
* If enabled and prefix not given then set worker_node_name for SDC name.

> NOTE: name of the SDC cannot be more than 31 characters, hence the prefix given and the worker node hostname name taken should be such that the total length does not exceed 31 character limit. 

## Pre-approving SDC by GUID

Starting with version 2.6, the CSI Driver for PowerFlex will support pre-approving SDC by GUID.
CSI PowerFlex driver will detect the SDC mode set on the PowerFlex array and will request SDC approval from the array prior to publishing a volume. This is specific to each SDC.

To request SDC approval for GUID, make the following edits to [values.yaml](https://github.com/dell/csi-powerflex/blob/main/helm/csi-vxflexos/values.yaml) file:
```yaml
# "node" allows to configure node specific parameters
node:
  ...
  ...

  # "approveSDC" defines the approve operation for SDC
  # Default value: None
  approveSDC:
    # enabled: Enable/Disable SDC approval
    #Allowed values:
    #  true: Driver will attempt to approve restricted SDC by GUID during setup
    #  false: Driver will not attempt to approve restricted SDC by GUID during setup
    # Default value: false
    enabled: false
```
> NOTE: Currently, the CSI-PowerFlex driver only supports GUID for the restricted SDC mode.

If SDC approval is denied, then provisioning of the volume will not be attempted and an appropriate error message is reported in the logs/events so the user is informed.
