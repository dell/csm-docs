---
title: PowerFlex
linktitle: PowerFlex 
Description: Code features for PowerFlex Driver
---

## Volume Snapshot Feature

The Volume Snapshot feature was introduced in alpha (v1alpha1) in Kubernetes 1.13 and then moved to beta (v1beta1) in Kubernetes 1.17 and is generally available (v1) in Kubernetes version >=1.20. 

The CSI PowerFlex driver version 1.5 supports v1beta1 snapshots on Kubernetes 1.19 and v1 snapshots on Kubernetes 1.20 and 1.21.

In order to use Volume Snapshots, ensure the following components are deployed to your cluster:
- Kubernetes Volume Snaphshot CRDs
- Volume Snapshot Controller

### Volume Snapshot Class

Before PowerFlex driver v1.5, the installation of the driver created default instance of VolumeSnapshotClass. 
API version of this VolumeSnapshotClass instance was defined based on Kubernetes version, as below: 

Following is the manifest for the Volume Snapshot Class created during installation, prior to PowerFlex driver v1.5: 
```
{{- if eq .Values.kubeversion  "v1.20" }}
apiVersion: snapshot.storage.k8s.io/v1
{{- else }}
apiVersion: snapshot.storage.k8s.io/v1beta1
{{- end}}
kind: VolumeSnapshotClass
metadata:
  name: vxflexos-snapclass
driver: csi-vxflexos.dellemc.com
deletionPolicy: Delete

```
Installation of PowerFlex driver v1.5 does not create VolumeSnapshotClass. You can find samples of default v1beta1 and v1
VolumeSnapshotClass instances in `helm/samples/volumesnapshotclass` directory. There are two samples, one for v1beta1 version and
the other for v1 snapshot version. If needed, install appropriate default sample, based on the version of snapshot CRDs in your cluster.

### Create Volume Snapshot

The following is a sample manifest for creating a Volume Snapshot using the **v1beta1** snapshot APIs:
```
apiVersion: snapshot.storage.k8s.io/v1beta1
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

This feature extends CSI specification to add the capability to create crash-consistent snapshots of a group of volumes. 
PowerFlex driver implements this extension in v1.5. 
This feature is currently in Technical Preview. To use this feature users have to deploy csi-volumegroupsnapshotter side-car as part of the PowerFlex driver.  
More details can be found here: [dell-csi-volumegroup-snapshotter](https://github.com/dell/csi-volumegroup-snapshotter).

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

The CSI PowerFlex driver version 1.5 supports additional mkfs format options. A user is able to specify additional format options as needed for the driver. Format options are specified in storageclass yaml under _mkfsFormatOption_ as in the following example:

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
    storageclass.beta.kubernetes.io/is-default-class: "true"
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
in your driver yaml in config/samples/   

If you want to specify where controller pods get assigned, make the following edits to your values file (helm install):    

To assign controller pods to worker nodes only (Default):   
```
# "controller" allows to configure controller specific parameters
controller:

  #"controller.nodeSelector" defines what nodes would be selected for pods of controller deployment
  # Leave as blank to use all nodes
  nodeSelector:
  #   node-role.kubernetes.io/master: ""

  # "controller.tolerations" defines tolerations that would be applied to controller deployment
  # Leave as blank to install the controller on worker nodes
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
  nodeSelector:
  #   node-role.kubernetes.io/master: ""

  # "controller.tolerations" defines tolerations that would be applied to controller deployment
  # Leave as blank to install the controller on worker nodes
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
  nodeSelector:
     node-role.kubernetes.io/master: ""

  # "controller.tolerations" defines tolerations that would be applied to controller deployment
  # Leave as blank to install controller on worker nodes
  tolerations:
   - key: "node-role.kubernetes.io/master"
     operator: "Exists"
     effect: "NoSchedule"
```
For configuring Controller HA on the Dell CSI Operator, please refer to the Dell CSI Operator documentation.

## SDC Deployment

The CSI PowerFlex driver version 1.3 and later support the automatic deployment of the PowerFlex SDC on Kubernetes nodes which run the node portion of the CSI driver. The deployment of the SDC kernel module occurs on these nodes with OS platform which support automatic SDC deployment, currently Fedora CoreOS (FCOS) and Red Hat CoreOS (RHCOS). On Kubernetes nodes with OS version not supported by automatic install, you must perform the Manual SDC Deployment steps below. Refer https://hub.docker.com/r/dellemc/sdc for your OS versions.

- On Kubernetes nodes which run the node portion of the CSI driver, the SDC init container runs prior to the driver being installed. It installs the SDC kernel module on the nodes with OS version which supports automatic SDC deployment. If there is an SDC kernel module installed then the version is checked and updated.
- Optionally, if the SDC monitor is enabled, another container is started and runs as the monitor. Follow PowerFlex SDC documentation to get monitor metrics.
- On nodes that do not support automatic SDC deployment by SDC init container, manual installation steps must be followed. The SDC init container skips installing and you can see this mentioned in the logs by running kubectl logs on the node for SDC.
  Refer to https://hub.docker.com/r/dellemc/sdc for supported OS versions.
- There is no automated uninstallation of the SDC kernel module. Follow PowerFlex SDC documentation to manually uninstall the SDC driver from the node. 



## Multiarray Support

The CSI PowerFlex driver version 1.5 adds support for managing multiple PowerFlex arrays from the single driver instance. This feature is enabled by default and integrated to even single instance installations.

To manage multiple arrays you need to create an array connection configuration that lists multiple arrays.

### Creating array configuration

There is a sample yaml file under the top directory named `config.yaml` with the following content:
 ```yaml
    - username: "admin"                   # username for connecting to API
      password: "password"                # password for connecting to API
      systemID: "ID1"                     # system ID for system
      endpoint: "https://127.0.0.1"       # full URL path to the PowerFlex API
      skipCertificateValidation: true     # skip array certificate validation or not
      isDefault: true                     # treat current array as default (would be used by storage class without arrayIP parameter)
      mdm: "10.0.0.1,10.0.0.2"            # MDM IPs for the system
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

### Creating storage classes 

To be able to provision Kubernetes volumes using a specific array we need to create corresponding storage classes.

Find the sample yaml files under `helm/samples/storageclass`. Edit `storageclass.yaml` if you want `ext4` filesystem, and use `storageclass-xfs.yaml` if you want `xfs` filesystem. Replace `<STORAGE_POOL>` with the storage pool you have, and replace `<SYSTEM_ID>` with the system ID you have. 

Then we need to apply storage classes to Kubernetes using `kubectl`:

```bash
kubectl create -f storageclass.yaml
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


## Dynamic Logging Configuration

This feature is introduced in version 1.5, CSI Driver for PowerFlex now supports dynamic logging configuration.

To accomplish this, we utilize two fields in logConfig.yaml: LOG_LEVEL and LOG_FORMAT.  

```
LOG_LEVEL: minimum level that the driver will log  
LOG_FORMAT: format the driver should log in, either text or JSON      
```
> *NOTE:* To see the available options for LOG_LEVEL, consult: https://github.com/sirupsen/logrus#level-logging

If the configmap does not exist yet, simply edit logConfig.yaml, changing the values for LOG_LEVEL and LOG_FORMAT as you see fit.   

If the configmap already exists, you can use this command to edit the configmap:  
`kubectl edit configmap -n vxflexos driver-config`  

or you could edit logConfig.yaml, and use this command:  
`kubectl apply -f logConfig.yaml`  

and then make the necessary adjustments for LOG_LEVEL and LOG_FORMAT.  
If LOG_LEVEL or LOG_FORMAT are set to options outside of what is supported, the driver will use the default values of "info" and "text" .   

## Volume Health Monitoring 

Starting in version 2.1, CSI Driver for PowerFlex now supports volume health monitoring. This allows Kubernetes to report on the condition of the underlying volumes via events when a volume condition is abnormal. For example, if a volume were to be deleted from the array, or unmounted outside of Kubernetes, Kubernetes will now report these abnormal conditions as events.  

To accomplish this, the driver utilizes the external-health-monitor sidecar. When driver detects a volume condition is abnormal, the sidecar will report an event to the corresponding PVC. For example, in this event from `kubectl describe pvc -n <ns>` we can see that the underlying volume was deleted from the PowerFlex array:
```
Events:
  Type     Reason                     Age                 From                                                         Message
  ----     ------                     ----                ----                                                         ------
  Warning  VolumeConditionAbnormal    32s                 csi-pv-monitor-controller-csi-vxflexos.dellemc.com           Volume is not found at 2021-11-03 20:31:04

```  
If the feature gate CSIVolumeHealth is set to true, events will also be reported to pods that have abnormal volumes. In these two events from `kubectl describe pods -n <ns>`, we can see that this pod has two abnormal volumes: one volume was unmounted outside of Kubernetes, while another was deleted from PowerFlex array.
```
Events:
  Type     Reason                     Age                 From         Message
  ----     ------                     ----                ----         ------
Warning  VolumeConditionAbnormal      35s (x9 over 12m)  kubelet       Volume vol4: volPath: /var/.../rhel-705f0dcbf1/mount is not mounted: <nil>
Warning  VolumeConditionAbnormal      5s                 kubelet       Volume vol2: Volume is not found by node driver at 2021-11-11 02:04:49

```
