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

```yaml
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

```yaml
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
```yaml
status:
  boundVolumeSnapshotContentName: snapcontent-5a8334d2-eb40-4917-83a2-98f238c4bda
  creationTime: "2020-07-16T08:42:12Z"
  readyToUse: true
```

### Creating PVCs with Volume Snapshots as Source

The following is a sample manifest for creating a PVC with a VolumeSnapshot as a source:
```yaml
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

## Volume Expansion Feature

The CSI PowerFlex driver version 1.2 and later support expansion of Persistent Volumes. This expansion is done online, which is when PVC is attached to a node.

To use this feature, the storage class used to create the PVC must have the attribute _allowVolumeExpansion_ set to _true_.

Following is a sample manifest for a storage class that allows for Volume Expansion:
```yaml
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
```yaml
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

```yaml
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

```yaml
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

```yaml
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

```yaml
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

**Note** : 
- From CSM 1.15 onwards, the CSI driver adds NFS labels to the CSI nodes only after verifying that NFS is enabled on the storage array. This ensures that node labeling accurately reflects the capabilities of the backend storage system.
- It is assumed that the required NFS dependencies are already present on the node, as these are typically included in standard Linux OS packages by default.

You can check what labels your nodes contain by running
```bash
kubectl get nodes --show-labels
```

Here's an example of how the labels look after describing the nodes:
csi-vxflexos.dellemc.com/<system-id>-nfs=true

For additional information, see the [Kubernetes Topology documentation](https://kubernetes-csi.github.io/docs/topology.html).

> *NOTE*: In the manifest file of the Container Storage Modules operator, topology can be enabled by specifying the system name or _systemid_ in the allowed topologies field. _Volumebindingmode_ is also set to _WaitForFirstConsumer_ by default.

## Controller HA

The CSI PowerFlex driver version 1.3 and later support multiple controller pods. A Controller pod can be assigned to a worker node or a master node, as long as no other controller pod is currently assigned to the node. To control the number of controller pods, edit:

```yaml
controllerCount: 2
```

in your values file to the desired number of controller pods. By default, the driver will deploy with two controller pods, each assigned to a different worker node.

> *NOTE:* If the controller count is greater than the number of available nodes, excess controller pods will be stuck in a pending state.

If you are using the Container Storage Modules Operator, the value to adjust is:

```yaml
replicas: 1  
```

in your driver yaml in `config/samples/`

If you want to specify where controller pods get assigned, make the following edits to your values file at `csi-vxflexos/helm/csi-vxflexos/values.yaml`:

To assign controller pods to worker nodes only (Default):

```yaml
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

```yaml
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

```yaml
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

For configuring Controller HA on the Container Storage Modules Operator, please refer to the [Container Storage Modules Operator documentation](../../../getting-started/installation/operator/#custom-resource-definitions).  

## SDC Deployment

The CSI PowerFlex driver version 1.3 and later support the automatic deployment of the PowerFlex SDC on Kubernetes nodes which run the node portion of the CSI driver. The deployment of the SDC kernel module occurs on these nodes with OS platforms which support automatic SDC deployment: currently Red Hat CoreOS (RHCOS), RHEL8.x,RHEL 7.9 are the only supported OS platforms. On Kubernetes nodes with OS version not supported by automatic install, you must perform the Manual SDC Deployment steps below. Refer to https://quay.io/repository/dell/storage/powerflex/sdc for supported OS versions. 

- On Kubernetes nodes which run the node portion of the CSI driver, the SDC init container runs prior to the driver being installed. It installs the SDC kernel module on the nodes with OS version which supports automatic SDC deployment. If there is an SDC kernel module installed then the version is checked and updated.
- Optionally, if the SDC monitor is enabled, another container is started and runs as the monitor. Follow PowerFlex SDC documentation to get monitor metrics.
- On nodes that do not support automatic SDC deployment by SDC init container, manual installation steps must be followed. The SDC init container skips installing and you can see this mentioned in the logs by running kubectl logs on the node for SDC.
Refer to https://quay.io/repository/dell/storage/powerflex/sdc for supported OS versions. 
- There is no automated uninstallation of the SDC kernel module. Follow PowerFlex SDC documentation to manually uninstall the SDC driver from the node.

From Container Storage Modules **1.12.0**, you can disable automatic SDC deployment.

By default, SDC deployment is enabled. If you do not want to deploy `sdc` with PowerFlex, it can be disabled by setting the `sdc.enabled` field to `false`.

```yaml
node:
  ...
  sdc:
    # enabled: Enable/Disable SDC
    enabled: true
```

## Multiarray Support

The CSI PowerFlex driver version 1.4 added support for managing multiple PowerFlex arrays from the single driver instance. This feature is enabled by default and integrated to even single instance installations.

To manage multiple arrays you need to create an array connection configuration that lists multiple arrays.

### Creating array configuration

There is a sample yaml file in the samples folder called `secret.yaml` with the following content:
 ```yaml
  # Username for accessing PowerFlex system.
  # If authorization is enabled, username will be ignored.
  - username: "admin"
  # Password for accessing PowerFlex system.
  # If authorization is enabled, password will be ignored.
  password: "password"
  # PowerFlex system name or ID.	
  # Required: true
  systemID: "1a99aa999999aa9a"
  # Required: false
  # Previous names used in secret of PowerFlex system. Only needed if PowerFlex System Name has been changed by user 
  # and old resources are still based on the old name. 
  allSystemNames: "pflex-1,pflex-2"
  # REST API gateway HTTPS endpoint for PowerFlex system.
  # If authorization is enabled, endpoint should be the HTTPS localhost endpoint that 
  # the authorization sidecar will listen on
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
  # Defines all system names used to create powerflex volumes
  # Required: false
  # Default value: none
  AllSystemNames: "name1,name2"
- username: "admin"
  password: "Password123"
  systemID: "2b11bb111111bb1b"
  endpoint: "https://127.0.0.2"
  skipCertificateValidation: true 
  mdm: "10.0.0.3,10.0.0.4"
  AllSystemNames: "name1,name2"
 ```
The systemID can be found by displaying system level information, which is outlined [here](https://infohub.delltechnologies.com/l/powerflex-rest-api-introduction/system-information)

Here we specify that we want the CSI driver to manage two arrays: one with an IP `127.0.0.1` and the other with an IP `127.0.0.2`.

To use this config we need to create a Kubernetes secret from it. To do so, run the following command:

```bash
kubectl create secret generic vxflexos-config -n vxflexos --from-file=config=secret.yaml
```

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
./csi-install.sh --namespace vxflexos --values ./myvalues.yaml --upgrade
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
```bash
./testEphemeral.sh
```
this test deploys the pod with two ephemeral volumes, and write some data to them before deleting the pod.   
When creating ephemeral volumes, it is important to specify the following within the volumeAttributes section: volumeName, size, storagepool, and if you want to use a non-default array, systemID.  

## Consuming Existing Volumes with Static Provisioning

To use existing volumes from PowerFlex array as Persistent volumes in your Kubernetes environment, perform these steps:
1. Log into one of the MDMs of the PowerFlex cluster.
2. Execute these commands to retrieve the `systemID` and `volumeID`.
    1. ```bash    
        scli --mdm_ip <IPs, comma separated> --login --username <username> --password <password>
       ```
    - **Output:** `Logged in. User role is SuperUser. System ID is <systemID>`
    2. ```bash
        scli --query_volume --volume_name <volume name>
       ```
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

```yaml
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
```bash
 kubectl edit configmap -n vxflexos vxflexos-config-params 
```  
and then make the necessary adjustments for CSI_LOG_LEVEL and CSI_LOG_FORMAT.   

If either option is set to a value outside of what is supported, the driver will use the default values of "debug" and "text" . 

## Volume Health Monitoring 

> *NOTE*: Alpha feature gate `CSIVolumeHealth` needs to be enabled for the node side monitoring to take effect. For more information, please refer to the [Kubernetes GitHub repository](https://github.com/kubernetes-csi/external-health-monitor/blob/master/README.md). If the feature gate is on, and you want to use this feature,
> ensure the proper values are enabled in your values file. See the values table in the installation doc for more details. 

Starting in version 2.1, CSI Driver for PowerFlex now supports volume health monitoring. This allows Kubernetes to report on the condition of the underlying volumes via events when a volume condition is abnormal. For example, if a volume were to be deleted from the array, or unmounted outside of Kubernetes, Kubernetes will now report these abnormal conditions as events.  

To accomplish this, the driver utilizes the external-health-monitor sidecar. When driver detects a volume condition is abnormal, the sidecar will report an event to the corresponding PVC. For example, in this event from `kubectl describe pvc -n <ns>` we can see that the underlying volume was deleted from the PowerFlex array:

```text
Events:
  Type     Reason                     Age                 From                                                         Message
  ----     ------                     ----                ----                                                         ------
  Warning  VolumeConditionAbnormal    32s                 csi-pv-monitor-controller-csi-vxflexos.dellemc.com           Volume is not found at 2021-11-03 20:31:04
```

Events will also be reported to pods that have abnormal volumes. In these two events from `kubectl describe pods -n <ns>`, we can see that this pod has two abnormal volumes: one volume was unmounted outside of Kubernetes, while another was deleted from PowerFlex array.

```text
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

To enable renaming of SDC, make the following edits to [values.yaml](https://github.com/dell/helm-charts/blob/main/charts/csi-vxflexos/values.yaml) file:
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

> ℹ️ **NOTE:** : name of the SDC cannot be more than 31 characters, hence the prefix given and the worker node hostname name taken should be such that the total length does not exceed 31 character limit. 

## Pre-approving SDC

Starting with version 2.15, the CSI Driver for PowerFlex will support pre-approving SDC by either GUID or IP address.
CSI PowerFlex driver will detect the SDC mode set on the PowerFlex array and will request SDC approval from the array prior to publishing a volume. This is specific to each SDC.

To request SDC approval either by GUID or IP address, make the following edits to [values.yaml](https://github.com/dell/helm-charts/blob/main/charts/csi-vxflexos/values.yaml) file:
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
    #  true: Driver will enable SDC approval based on either GUID or IP address, depending on the restricted SDC mode configured in PowerFlex system
    #  false: Driver will disable SDC approval based on either GUID or IP address, depending on the restricted SDC mode configured in PowerFlex system
    # Default value: false
    enabled: false
```
> ℹ️ **NOTE:** : Currently, the CSI-PowerFlex driver only supports GUID for the restricted SDC mode.

If SDC approval is denied, then provisioning of the volume will not be attempted and an appropriate error message is reported in the logs/events so the user is informed.

## Volume Limit

The CSI Driver for Dell PowerFlex allows users to specify the maximum number of PowerFlex volumes that can be used in a node.

The user can set the volume limit for a node by creating a node label `max-vxflexos-volumes-per-node` and specifying the volume limit for that node.
<br/> `kubectl label node <node_name> max-vxflexos-volumes-per-node=<volume_limit>`

The user can also set the volume limit for all the nodes in the cluster by specifying the same to `maxVxflexosVolumesPerNode` attribute in values.yaml file.

>**NOTE:** <br>To reflect the changes after setting the value either via node label or in values.yaml file, user has to bounce the driver controller and node pods using the command `kubectl get pods -n vxflexos --no-headers=true | awk '/vxflexos-/{print $1}'| xargs kubectl delete -n vxflexos pod`. <br><br> If the value is set both by node label and values.yaml file then node label value will get the precedence and user has to remove the node label in order to reflect the values.yaml value. <br><br>The default value of `maxVxflexosVolumesPerNode` is 0. <br><br>If `maxVxflexosVolumesPerNode` is set to zero, then Container Orchestration decides how many volumes of this type can be published by the controller to the node.<br><br>The volume limit specified to `maxVxflexosVolumesPerNode` attribute is applicable to all the nodes in the cluster for which node label `max-vxflexos-volumes-per-node` is not set.

## NFS volume support

> ℹ️ **NOTE:** :
> * From PowerFlex CSI driver version 2.8, NFS volumes are supported on PowerFlex 4.0.x systems. This feature is not available on PowerFlex version 5.0
> * Starting from Container Storage Modules 1.11.0, the CSI-PowerFlex driver will automatically round up NFS volume sizes to a minimum of 3GB if a smaller size is requested. This change prevents backend errors and ensures compatibility.

CSI driver will support following operations for NFS volumes:

* Creation and deletion of a NFS volume with RWO/RWX/ROX access modes.
* Support of tree quotas while volume creation.
* Expand the size of a NFS volume.
* Creation and deletion of snapshot of a NFS volume while retaining file permissions.
* Create NFS volume from the snapshot.

To enable the support of NFS volumes operations from CSI driver, there are a few new keys introduced which needs to be set before performing the operations for NFS volumes.
* `nasName`: defines the NAS server name that should be used for NFS volumes.
* `enableQuota`: when enabled will set quota limit for a newly provisioned NFS volume.

> ℹ️ **NOTE:** :
> * `nasName`
>   * nasName is a mandatory parameter and has to be provided in secret yaml, else it will be an error state and will be captured in driver logs.
>   * nasName can be given at storage class level as well.
>   * If specified in both, secret and storage class, then precedence is given to storage class value.
>   * If nasName not given in secret, irrespective of it specified in SC, then it's an error state and will be captured in driver logs.
>   * If the PowerFlex storage system v4.0.x is configured with only block capabilities, then the user is required to give the default value for nasName as "none".

The user has to update the `secret.yaml`, `values.yaml` and `storageclass-nfs.yaml` with the above keys as like below:

[`samples/secret.yaml`](https://github.com/dell/csi-powerflex/blob/main/samples/secret.yaml)
```yaml
- username: "admin"
  password: "Password123"
  systemID: "2b11bb111111bb1b"
  endpoint: "https://127.0.0.2"
  skipCertificateValidation: true
  isDefault: true
  mdm: "10.0.0.3,10.0.0.4"
  nasName: "nas-server"
```

[`samples/storageclass/storageclass-nfs.yaml`](https://github.com/dell/csi-powerflex/blob/main/samples/storageclass/storageclass-nfs.yaml)
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: vxflexos-nfs
provisioner: csi-vxflexos.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true
parameters:
  storagepool: "pool2" # Insert Storage pool
  systemID: <SYSTEM_ID> # Insert System ID
  csi.storage.k8s.io/fstype: nfs
  nasName: "nas-server"
#  path: /csi
#  softLimit: "80"
#  gracePeriod: "86400"
volumeBindingMode: WaitForFirstConsumer
allowedTopologies:
- matchLabelExpressions:
  - key: csi-vxflexos.dellemc.com/<SYSTEM_ID>-nfs # Insert System ID
    values:
    - "true"
```

[`helm/csi-vxflexos/values.yaml`](https://github.com/dell/helm-charts/blob/main/charts/csi-vxflexos/values.yaml)
```yaml
...
enableQuota: false
...
```

## Volume Size and Rounding Rules
For NFS File Shares, the minimum supported volume size is 3 Gi. If request size is smaller than 3 Gi, the volume will be automatically provisioned as 3 Gi.

For Block Volumes, the minimum supported size is 8 Gi. Any size request below 8 Gi will result in a volume of 8 Gi being created. Additionally, if the requested size is not a multiple of 8, the system will round it up to the next multiple of 8 when provisioning the volume.

For example:  
A requested size of 9 Gi or 8.1 Gi will result in a 16 Gi volume being created on the backend array.
Similarly, a size of 20 Gi will be rounded up to 24 Gi.
This behavior ensures that the allocated volume sizes comply with the backend array's alignment requirements.

## Usage of Quotas to Limit Storage Consumption for NFS volumes
Starting with version 2.8, the CSI driver for PowerFlex will support enabling tree quotas for limiting capacity for NFS volumes. To use the quota feature user can specify the boolean value `enableQuota` in values.yaml.

To enable quota for NFS volumes, make the following edits to [values.yaml](https://github.com/dell/helm-charts/blob/main/charts/csi-vxflexos/values.yaml) file:
```yaml
...
...
# enableQuota: a boolean that, when enabled, will set quota limit for a newly provisioned NFS volume.
# Allowed values:
#   true: set quota for volume
#   false: do not set quota for volume
# Optional: true
# Default value: none
enableQuota: true
...
...
```

For example, if the user creates a PVC with 3 Gi of storage and quotas have already been enabled in PowerFlex system for the specified volume.

When `enableQuota` is set to `true`

* The driver sets the hard limit of the PVC to 3Gi.
* The user adds data of 2Gi to the PVC (by logging into POD). It works as expected.
* The user tries to add 2Gi more data.
* Driver doesn't allow the user to enter more data as total data to be added is 4Gi and PVC limit is 3Gi.
* The user can expand the volume from 3Gi to 6Gi. The driver allows it and sets the hard limit of PVC to 6Gi.
* User retries adding 2Gi more data (which has been errored out previously).
* The driver accepts the data.

When `enableQuota` is set to `false`

* Driver doesn't set any hard limit against the PVC created.
* The user adds 2Gi data to the PVC, which has a limit of 3Gi. It works as expected.
* The user tries to add 2Gi more data. Now the total size of data is 4Gi.
* Driver allows the user to enter more data irrespective of the initial PVC size (since no quota is set against this PVC)
* The user can expand the volume from an initial size of 3Gi to 4Gi or more. The driver allows it.

If enableQuota feature is set, user can also set other tree quota parameters such as soft limit, soft grace period and path using storage class yaml file.

* `path`: relative path to the root of the associated NFS volume.
* `softLimit`: soft limit set to quota. Specified as a percentage w.r.t. PVC size.
* `gracePeriod`: grace period of quota, must be mentioned along with softLimit, in seconds. Soft Limit can be exceeded until the grace period.

> ℹ️ **NOTE:** :
> * `hardLimit` is set to same size as that of PVC size.
> *  When a volume with quota enabled is expanded then the hardLimit and softLimit are also recalculated by driver w.r.t. to the new PVC size.
> * `sofLimit` cannot be set to unlimited value (0), otherwise it will become greater than hardLimit (PVC size).
> * `softLimit` should be lesser than 100%, since hardLimit will be set to 100% (PVC size) internally by the driver.

### Storage Class Example with Quota Limit Parameters
[`samples/storageclass/storageclass-nfs.yaml`](https://github.com/dell/csi-powerflex/blob/main/samples/storageclass/storageclass-nfs.yaml)

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: vxflexos-nfs
provisioner: csi-vxflexos.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true
parameters:
  storagepool: "pool2" # Insert Storage pool
  systemID: <SYSTEM_ID> # Insert System ID
  csi.storage.k8s.io/fstype: nfs
  nasName: "nas-server"
  path: /csi
  softLimit: "80"
  gracePeriod: "86400"
volumeBindingMode: WaitForFirstConsumer
allowedTopologies:
  - matchLabelExpressions:
    - key: csi-vxflexos.dellemc.com/<SYSTEM_ID>-nfs # Insert System ID
      values:
        - "true"
```
## Configuring custom access to NFS exports

CSI PowerFlex driver Version 2.9.0 and later supports the ability to configure NFS access to nodes that use dedicated storage networks.

To enable this feature you need to specify `externalAccess` parameter in your helm `values.yaml` file or `X_CSI_POWERFLEX_EXTERNAL_ACCESS` variable when creating CustomResource using an operator.

The value of that parameter is added as an additional entry to NFS Export host access.

For example the following notation:
```yaml
externalAccess: "10.0.0.0/24"
```

This means that we allow for NFS Export created by driver to be consumed by address range `10.0.0.0-10.0.0.255`.

## Configuring NFS independent of SDC

Starting from Container Storage Modules 1.12.0, the CSI PowerFlex driver supports configuring NFS independent of SDC. This separation is helpful in scenarios where an SDC is not available in the cluster or additional network interfaces do not need to be deployed.

To disable SDC deployment, update the values file and provide the interface names mapping for each of the nodes that are being used.

**Helm**
```yaml
node:
  ...
  sdc:
    # enabled: Enable/Disable SDC
    enabled: false
  ...

interfaceNames:
  # worker-1-jxsjoueeewabc.domain: "ens192"
  # worker-2-jxsjoueeewabc.domain: "ens192"
```

**Operator**
```yaml
common:
...
  - name: INTERFACE_NAMES: 'worker-1-jxsjoueeewabc.domain: "ens192", worker-2-jxsjoueeewabc.domain: "ens192"'
...
node:
...
  - name: X_CSI_SDC_ENABLED
    value: "false"
```

## Storage Capacity Tracking
CSI-PowerFlex driver version 2.8.0 and above supports Storage Capacity Tracking.

This feature helps the scheduler to make more informed choices about where to schedule pods which depend on unbound volumes with late binding (aka "wait for first consumer"). Pods will be scheduled on a node (satisfying the topology constraints) only if the requested capacity is available on the storage array.
If such a node is not available, the pods stay in Pending state. This means pods are not scheduled.

Without storage capacity tracking, pods get scheduled on a node satisfying the topology constraints. If the required capacity is not available, volume attachment to the pods fails, and pods remain in ContainerCreating state. Storage capacity tracking eliminates unnecessary scheduling of pods when there is insufficient capacity.

The attribute `storageCapacity.enabled` in `values.yaml` can be used to enable/disable the feature during driver installation using helm. This is by default set to true. To configure how often the driver checks for changed capacity set `storageCapacity.pollInterval` attribute. In case of driver installed via operator, this interval can be configured in the sample file provided [here](https://github.com/dell/csm-operator/blob/release/{{< version-docs key="csm-operator_latest_version">}}/samples/{{< version-docs key="csm-operator_latest_samples_dir" >}}/storage_csm_powerflex_{{< version-docs key="Det_sample_operator_pflex" >}}.yaml) by editing the `--capacity-poll-interval` argument present in the provisioner sidecar.

## Multiple Availability Zones
PowerFlex CSI driver version 2.13.0 and above supports multiple Availability Zones for Block. NFS is not supported at this time.

This feature supports the use of a StorageClass that is not associated with any specific PowerFlex system or storage pool. Each cluster node must be labeled with a zone and each PowerFlex system must be assigned to a single zone. When a Pod is scheduled on a node, the volume will be provisioned on the PowerFlex system associated with the cluster node's zone.

Requirements:
- Every cluster worker node must be labeled with a zone label.
- Every PowerFlex system in the driver Secret must be assigned to their own zone.
- The StorageClass does not contain any reference to the SystemID or storagepool.
- Use the CSM Operator to install the PowerFlex CSI driver. The CSM Operator will detect if multiple Availability Zones are enabled in the driver Secret and ensure the correct MDMs are configured on each worker node during the SDC installation.

> Note: Helm deployment currently doesn’t support multiple Availability Zones.

The example manifests below illustrate how to configure two PowerFlex systems, with each system assigned to its own zone. Zone labels can have any custom key, but it must be consistent across the StorageClass, Secret, and Node labels.

#### Labeling Worker Nodes
```bash
# Label each worker node in the cluster
kubectl label nodes worker-1 topology.kubernetes.io/zone=zone1
kubectl label nodes worker-2 topology.kubernetes.io/zone=zone1
...
kubectl label nodes worker-3 topology.kubernetes.io/zone=zone2
kubectl label nodes worker-4 topology.kubernetes.io/zone=zone2
```

#### StorageClass
For multiple Availability Zones support, the StorageClass does not require details about the PowerFlex system. Optionally, the `allowedTopologies` can be used to specify topology labels used when provisioning volumes with this StorageClass.

> Note: The StorageClass must use `volumeBindingMode: WaitForFirstConsumer`. Using `volumeBindingMode: Immediate` **will not guarantee** that the volume is provisioned in the same zone as the scheduled Pod.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
allowVolumeExpansion: true
allowedTopologies:
- matchLabelExpressions:
  - key: topology.kubernetes.io/zone
    values:
    - zone1
    - zone2
metadata:
  name: powerflex-multiaz
parameters:
  csi.storage.k8s.io/fstype: ext4
provisioner: csi-vxflexos.dellemc.com
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```

#### Secret
The Secret specifies the zone associated with each PowerFlex system along with additional details such as the protection domain and storage pool name.

> Note: The protection domain name is required if storage pool names are not unique across protection domains.

```yaml
- username: "user"
  password: "password"
  systemID: "2000000000000001"
  endpoint: "https://10.0.0.1"
  skipCertificateValidation: true
  mdm: "10.0.0.2,10.0.0.3"
  zone:
    name: "zone1"
    labelKey: "topology.kubernetes.io/zone"
    protectionDomains:
      - name: "domain1"
        pools:
          - "pool1"

- username: "user"
  password: "password"
  systemID: "2000000000000002"
  endpoint: "https://10.0.0.4"
  skipCertificateValidation: true
  mdm: "10.0.0.5,10.0.0.6"
  zone:
    name: "zone2"
    labelKey: "topology.kubernetes.io/zone"
    protectionDomains:
      - name: "domain2"
        pools:
          - "pool2"
```
## Expose the SFTP settings to automatically pull the scini.ko kernel module
PowerFlex CSI driver version 2.14.0 and above supports exposing the SFTP settings to automatically pull the scini.ko kernel module.

This feature allows the configuration of SFTP settings to automatically pull the scini.ko kernel module from a specified SFTP repository or SFTP repository of Dell. This ensures that the necessary kernel module is available and up-to-date on the cluster.

The driver will try to find the kernel modules in the following order:

- Pre-compiled Modules:

Driver will fetch pre-compiled kernel modules for various Linux kernels that are typically included in PowerFlex SDC installation packages. These modules are stored in a driver cache. 

- Automatic Fetching from SFTP repository:

Driver will fetch the necessary kernel modules from a remote SFTP repository. This is configured through environment variables and secrets in the deployment templates.

- Automatic SDC Compilation:

If a matching pre-compiled module or the kernel module from SFTP repository is not available, driver will compile the SDC driver automatically. This involves compiling the scini.ko kernel module to match the running kernel.


> <span style="font-size: 18px;"><strong>ℹ️ NOTE:</strong></span>
Before setting up or upgrading the cluster, the user must verify that the updated scini.ko tar file is available on the MFT (SFTP) server. It is essential to ensure that the tar file matches the kernel version of the cluster. Proceed with the deployment only if a matching kernel module is found.

### Configuration Steps

#### Enable SFTP Repository Settings:

Enable the SFTP repository settings by enabling the SDC SFTP Repo and configuring the SFTP repository address, username, and secret.

 *NOTE:*
- Exposing SFTP settings to automatically pull scini.ko modules is only available for SDC 3.6.5 and 4.5.4
- Ensure that sdcrepo-private-secret and sdcrepo-public-secret are created from the secrets file. 
```bash
kubectl create secret generic sdcsftprepo-private-secret -n vxflexos --from-file=user_private_rsa_key=sftp-secret-private.crt
kubectl create secret generic sdcsftprepo-public-secret -n vxflexos --from-file=repo_public_rsa_key=sftp-secret-public.crt
```
- Private key of SFTP server should be obtained and public key should be pulled from known hosts after logging in to server via private key. 
- The secrets should have permissions set to 600 to ensure security and proper access control. Setting permissions to 600 ensures that only the owner has read and write access, preventing unauthorized users from accessing or modifying the secrets.
- After creating the private SFTP server,
  scini.tar should be located in the folder structure with the format of RHEL version as the username followed by sdc kernel version. For example the format should be `RHEL9/4.5.4000.111/5.14.0-503.40.1.el9_5.x86_64/scini.tar`.
  SSH Configuration on the Server should be enabled for public key authentication and public key should be added to authorized keys. For example, in /etc/ssh/sshd_config the following config should exist
    ```ssh 
        PubkeyAuthentication yes
        AuthorizedKeysFile .ssh/authorized_keys
        Match Group sftpusers
            ChrootDirectory /home
            ForceCommand internal-sftp
            AllowTcpForwarding no
            X11Forwarding no
    ```

## OIDC Authentication Support
### Overview

The PowerFlex CSI driver supports OIDC-based authentication in addition to traditional username/password authentication.
OIDC (OpenID Connect) allows Kubernetes deployments to authenticate to PowerFlex using OAuth2 tokens, providing stronger security and centralized identity management using providers like:

- Keycloak
- Azure AD
- Okta

This means that instead of storing long‑lived PowerFlex credentials inside the Kubernetes Secret, the driver uses short‑lived, automatically refreshed access tokens obtained via the OIDC provider.
 
### Secret Configuration for OIDC
Below is the required secret structure for OIDC-enabled authentication.
  ```yaml
  - username: ""
    password: ""
    systemID: "2000000000000001"
    endpoint: "https://10.0.0.1"
    skipCertificateValidation: true
    mdm: "10.0.0.2,10.0.0.3"

    # OIDC / CIAM values
    oidcClientId: "csm"
    oidcClientSecret: ""     # base64 encoded
    issuer: "https://10.0.0.4:1010/realms/CSM"  #for keycloak format
    # https://login.microsoftonline.com/abcd/v2.0" # for azure format
    # https://<okta-domain>.okta.com/oauth2/default/.well-known/openid-configuration # for okta format
    # CIAM (optional alternative auth mode)
    ciamClientId: ""
    ciamClientSecret: ""
  ```

Enabling OIDC via CSM-Operator
```yaml
- name: X_CSI_AUTH_TYPE
  value: "OIDC"   # or "" for BasicAuth
```

Enabling OIDC via Helm
```yaml
# "authType" defines the type of authentication that is used.
# Allowed values:
#  "OIDC" - use OIDC authentication
#  "" - by default use Basic authentication
# Default value: "" <empty>
authType: "OIDC"
```

### Pre-requisites for OIDC support

To enable the support for OIDC we need to establish the connection between the ID provider and PowerFlex.

In PowerFlex, Management Virtual Machine (MVM) IP addresses are the IPs assigned to the Management Virtual Machines. MVMs host PowerFlex Manager and other management services. These IP addresses are configured during the PowerFlex deployment process and can be accessed through the PowerFlex Manager user interface by navigating to: System → Components → MVM.

Execute the below steps by logging into the MVM IP:

Env variables needed for the steps: 
SSO_IP -  This is the Cluster IP address of the SSO service in Kubernetes Cluster. 
PM_TOKEN - This is an access token (JWT) retrieved by logging into PowerFlex via its SSO REST API and can be used for subsequent API calls to PowerFlex services.
IN_IP - This is the External IP address of the rke2-ingress-nginx-controller service, which is typically the load balancer or ingress controller IP used for external traffic.

```bash
export SSO_IP=`kubectl get svc -A | grep "sso " | awk '{print $4}'`
export PM_TOKEN=`curl -k --location --request POST "https://${SSO_IP}:8080/rest/auth/login" --header 'Accept: application/json' --header 'Content-Type: application/json' --data '{"username": "user","password": "password" }' | jq -r .access_token`
export IN_IP=`kubectl get svc -A | grep -m1 rke2-ingress-nginx-controller | sort | awk '{print $5}'`
```
1. Initialize the SSO CIAM config for PowerFlex 

This API initializes the SSO CIAM configuration for PowerFlex.

```bash
curl -k -X POST https://$IN_IP/rest/v1/sso-ciam/init --header 'Accept: application/json' --header 'Content-Type: application/json' --header "Authorization: Bearer ${PM_TOKEN}"
```
>Note: The API returns a unique identifier. Record this value, as it will be required in the following steps under the name CIAM_ID.

2. Configure PowerFlex with Embedded Keycloak as the OIDC Service provider 

This API call registers and configures PowerFlex as an OIDC Service Provider with Embedded Keycloak, enabling secure SSO authentication using OpenID Connect.

```bash
curl -vvL -k --request POST \
  --url https://$IN_IP/rest/v1/oidc-sp-config \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer ${PM_TOKEN}" \
  --data "{
  \"sp_id\": \"powerflex-$IN_IP\",
  \"redirect_uri\": \"https://$IN_IP/auth/realms/powerflex/protocol/openid-connect/auth\",
  \"logout_uri\": \"https://$IN_IP/auth/realms/powerflex/protocol/openid-connect/logout\",
  \"required_claims\": [\"email\"],
  \"keycloak_settings\": {
    \"config\": {
      \"clientAuthMethod\": \"client_secret_basic\",
      \"pkceEnabled\": \"true\",
      \"useJwksUrl\": \"true\",
      \"validateSignature\": \"true\"
    },
    \"first_broker_login_flow_alias\": \"first broker login\",
    \"post_broker_login_flow_alias\": null,
    \"link_only\": null,
    \"store_token\": true,
    \"add_read_token_role_on_create\": true,
    \"trust_email\": true
  },
  \"days_to_store_state_code_verifier\": 1
}"
```
3. Add certificates to PowerFlex for CIAM services 

PowerFlex CIAM must trust the Azure/Keycloak/Okta signing certificate in order to validate RS256‑signed JWT tokens issued by ID provider. This certificate must be added to CIAM as a trusted CA.

a. For Microsoft Azure, 

We have to add the following certificates for CIAM services 

* DigiCert is a trusted Certificate Authority (CA). Azure services use SSL/TLS certificates issued by DigiCert to secure communication.
* GA2 (GlobalSign or similar root/intermediate) certificates are part of the certificate chain that validates Azure’s identity endpoints. 

They ensure:
- The OIDC metadata URL (https://login.microsoftonline.com/...) and token endpoints are trusted.
- Secure HTTPS communication between PowerFlex and Azure IdP.

b. For Keycloak,
We can obtain the Keycloak certificate using either of the following methods.

Option 1 — Download the Certificate from Browser
* Open the Keycloak URL in your browser: `https://<PFMP_IP>/auth/`
* Click the lock icon in the address bar.
* View the site certificate.
* Export or download the certificate.
* Save it locally
>Note: Ensure the file includes valid PEM headers:
-----BEGIN CERTIFICATE-----
<certificate-body>
-----END CERTIFICATE-----

Option 2 — Retrieve the Certificate from the Keycloak UI 
This option retrieves the actual RS256 signing certificate directly from Keycloak’s admin interface.
* Log in to Keycloak Admin Console - `https://<PFMP_IP>/auth/admin/`
Log in using the admin credentials obtained via:
`kubectl get secret keycloak-admin-credentials -o json -n powerflex | jq '.data | map_values(@base64d)'`
* Select the Correct Realm. Open the realm dropdown (top-left corner). Choose the realm used by PowerFlex based on the deployment
* Navigate to the Keys Tab - Go to: Realm Settings → Keys. This page lists all signing keys for the selected realm.
* Locate the RS256 Signing Key. Find the row where: Algorithm: RS256,Use: SIG, Status: Active. This is the key used to sign all Keycloak-issued JWT tokens.
* Export the Certificate. In the RS256 row, click Certificate. A dialog appears showing the Base64‑encoded certificate without PEM headers. Copy the entire certificate and add the proper PEM headers:
-----BEGIN CERTIFICATE-----
<copied-certificate-content>
-----END CERTIFICATE-----

c. For Okta, 
Option 1 — Download the Certificate from Browser
* Open the Okta URL in  browser: `https://<okta-domain-name>.okta.com`
* Click the lock icon in the address bar.
* View the site certificate.
* Export or download the certificate.
* Save it locally

Option 2 — Retrieve the Certificate from the Okta UI 
* Log in to the Okta Admin Console  and open Okta tenant (e.g., https://<okta-domain-name>.okta.com) by signing in with admin credentials.
* Navigate to Applications - From the left navigation panel, go to Applications → Applications.
* Select the  Application - Click on the application for which the certificate is needed.
* Open the Sign-On Settings - Go to the Sign On tab inside the application.
* Access the OIDC Signing Certificate
* Download the Certificate

``` bash
CA=`<PEM_FILE_OF_CERTIFICATE>`
curl -kvvL -X POST https://$IN_IP//Api/V1/CIAM/<CIAM_ID>/x509-certificates --header "Authorization: Bearer ${PM_TOKEN}" --data-raw "
{
  \"type\": \"CA\",
  \"service\": \"ALL\",
  \"certificate_format\": \"PEM\",
  \"certificate\": \"$CA\"
}"
```

4. Add Microsoft Azure/Keycloak/Okta Identity provider as the service 

It registers an external identity provider (Azure/Keycloak/Okta) with PowerFlex using OpenID Connect (OIDC). This allows PowerFlex users to authenticate through Azure/Keycloak/Okta instead of local credentials.

>Note: 
CLIENT_ID - Client id of Microsoft Azure/Keycloak/Okta 
CLIENT_SECRET - Client secret of Microsoft Azure/Keycloak/Okta
IDP - AzureEntraID/Keycloak/Okta
For Azure,
IDP_METADATA_URL - `https://login.microsoftonline.com/<Tenant_id>/v2.0/.well-known/openid-configuration` where the tenant id is Azure Active Directory tenant the identity provider belongs to.
For Keycloak,
IDP_METADATA_URL - `https://<keycloak_ip>/auth/realms/<realm_name>/.well-known/openid-configuration` where the realm name is the name of the realm where the application is created
For Okta,
IDP_METADATA_URL = `https://<okta-domain-name>.okta.com/oauth2/default/.well-known/openid-configuration` where the okta domain name is the name of the okta domain where the application is created.

``` bash
curl -kvvL --request POST \
  --url https://$IN_IP/rest/v1/oidc-services \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer ${PM_TOKEN}" \
  --data "{
  \"name\": \"azure\",
  \"is_enabled\": true,
  \"idp_metadata_url\": \"$IDP_METADATA_URL\",
  \"claims_mapper\": [
    {
      \"name\": \"email\",
      \"value\": \"email\"
    },
    {
      \"name\": \"given_name\",
      \"value\": \"firstName\"
    },
    {
      \"name\": \"preferred_username\",
      \"value\": \"username\"
    },
    {
      \"name\": \"family_name\",
      \"value\": \"lastName\"
    }
  ],
  \"client_id\": \"$CLIENT_ID\",
  \"client_secret\": \"$CLIENT_SECRET\",
  \"scopes\": [
    \"openid\",
    \"profile\",
    \"email\",
    \"offline_access\"
  ],
  \"pkce_enabled\": true,
  \"code_challenge_method\": \"S256\",
  \"idp_type\": \"$IDP\"
}"
```
>Note: An ID will be generated for the service, which will be referred to as SERVICE_ID_IDP

(Optional) Configure the service id in the ID Provider  

Since PowerFlex relies on embedded Keycloak for OIDC, a valid redirect URI must be configured for browser based SSO.

Redirect URI - `https://<PFMP_IP>/auth/realms/powerflex/broker/<SERVICE_ID_IDP>/endpoint`

In Microsoft Azure, go to the Authentication tab and update the Redirect URIs section.
Ensure that the redirect URI includes the PowerFlex Management IP (PFMP_IP); resolve the hostname as required.

In Keycloak, Login to Keycloak → Select Realm → Go to Clients → Open the client → Settings → Add URI under “Valid Redirect URIs” → Save 

In Okta, navigate to the OIDC application → General → Sign-in redirect URIs, and add the PowerFlex Keycloak broker endpoint using the PFMP IP or resolvable hostname.

5.  Configure API permissions 

In Azure, 
a. Open the application page and select API permissions.

b. Under Microsoft Graph, add:
- offline_access
- User.Read
c. Click Update permissions to apply the changes

In Keycloak,
- Add the below to Client Scopes → Default Client Scopes:
openid  
profile
email
roles
offline_access 
- Clients → keycloak_user_client -> Mappers, add mappers:
email → email
preferred_username → username
given_name → firstName
family_name → lastName

In Okta,
>Note: Okta performs strict scope validation and does not allow requesting scopes that are not explicitly defined in the Authorization Server. Hence, a custom scope must be created before it can be requested by the client.

- Navigate to: Security → API → Authorization Servers
- Select the relevant Authorization Server.
- Add a Custom Scope.
- Update access policies as needed to allow the scope for the client.

Also, Ensure the scope is allowed in Access Policies and the relevant Rule for the client application

6. Create OAuth2 client in CIAM 

This will create a new OAuth2 client in CIAM 

```bash
curl -kL --request POST \
  --url https://$IN_IP/rest/v1/oauth2-clients \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer ${PM_TOKEN}" \
  --data "{
  \"client_name\": \"idp_oidc_client\",
  \"redirect_uris\": [\"\"],
  \"authorization_code_flow\": false,
  \"client_credentials_flow\": false,
  \"token_exchange_enabled\": true,
  \"offline_access_enabled\": true,
  \"client_offline_session_idle\": 1,
  \"client_offline_session_max\": 1,
  \"client_security_level\": \"TRUSTED\"
}"
```
>Note: The ID and secret generated in this step will be referred to as CIAM_CLIENT_ID and CIAM_CLIENT_SECRET in the subsequent steps.

7. Activate the CIAM Login Client 

This step activates and synchronizes the CIAM OAuth2 client created so that it becomes a login-capable client in PowerFlex CIAM.
CIAM creates a user in Keycloak realm of embedded keycloak and assigns it the given role.

``` bash
curl -k -X PATCH https://$IN_IP/rest/v1/login-clients/$CIAM_CLIENT_ID --header 'Accept: application/json' --header 'Content-Type: application/json' --header "Authorization: Bearer ${PM_TOKEN}" --data '{}'
```
8. Add the application to CIAM 

This command will add the application to CIAM 

ROLE refers to the role assigned to all tokens exchanged for a specific Identity Provider (IdP) and Application ID, enabling access to the PowerFlex APIs.
CIAM_CLIENT_ID is the client ID issued by the CIAM system.
IDP_CLIENT_ID represents the client ID configured in the identity provider (Azure, Keycloak, or Okta).
METADATA denotes the metadata URL of the corresponding Azure, Keycloak, or Okta application.
SERVICE_ID_IDP identifies the service ID associated with the configured identity provider.

``` bash 
curl -kLvv --request POST \
  --url https://$IN_IP/rest/v1/oauth2-token-exchanges \
  --header 'Content-Type: application/json' \
  --header 'clientId: ' \
  --header "Authorization: Bearer ${PM_TOKEN}" \
  --data "{
  \"ciam_oauth2_client_id\": \"$CIAM_CLIENT_ID\",
  \"customer_client_id\": \"$IDP_CLIENT_ID\",
  \"customer_metadata_url\": \"$METADATA\",
  \"idp_service_id\": \"$SERVICE_ID_IDP\",
  \"static_roles\": [
    \"$ROLE\"
  ]}"
  ```
> Note: Record this application ID; it will be referred to as APP_ID.

9. Legacy Workaround: Configure Keycloak User Attributes for PowerFlex Block API (Pre‑PFMP 5.1)

This step configures role mapping between Azure/Keycloak/Okta and PowerFlex roles within the PowerFlex Realm inside Keycloak (the internal identity provider embedded in PowerFlex).
This mapping ensures that when a token exchange occurs, CIAM and Keycloak assign the correct PowerFlex roles (e.g., SuperUser, Monitor, Administrator) to the authenticated user.

Although CIAM handles identity federation and token exchange, PowerFlex REST APIs rely on Keycloak role mappings for authorization.

This step ensures:

- The exchanged CIAM token contains the correct PowerFlex role required for API access.
- The static role assigned during CIAM token exchange is recognized by Keycloak and mapped to the corresponding PowerFlex authorization roles.

CIAM token exchange assigns a static role (e.g., "SuperUser") that must be recognized by Keycloak

```bash
export KC_PASS=`kubectl get secret keycloak-admin-credentials -o json -n powerflex | jq '.data | map_values(@base64d)' | jq -r '.["password"]'`
export ACCESS_TOKEN=`curl -k --location --request POST 'https://keycloak-http.powerflex/auth/realms/master/protocol/openid-connect/token' -d "client_id=admin-cli" -d "username=keycloak" -d "password=$KC_PASS" -d "grant_type=password" | jq -r .access_token`
curl -X GET "https://keycloak-http.powerflex/auth/admin/realms/powerflex/users" -H "Content-Type: application/json" -H "Authorization: bearer ${ACCESS_TOKEN}" | jq
```
>Note: Capture the ID from the above command that corresponds to the username from Step 9 (i.e., APP_ID). This ID will be referred to as APP_USER.

```bash
curl -k -X POST https://$IN_IP/rest/v1/users/$APP_USER/repair --header 'Accept: application/json' --header 'Content-Type: application/json' \
 --header "Authorization: Bearer ${PM_TOKEN}"
 ```
 
Once all the steps are completed, a handshake is successfully established between the identity provider and PowerFlex.