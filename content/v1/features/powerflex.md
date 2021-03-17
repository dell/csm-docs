---
title: PowerFlex
linktitle: PowerFlex 
Description: Code features for PowerFlex Driver
---

## Volume Snapshot Feature

The CSI PowerFlex driver version 1.2 and later support beta snapshots. Earlier versions of the driver supported alpha snapshots.

Volume Snapshots feature in Kubernetes has moved to beta in Kubernetes version 1.17. It was an alpha feature in earlier releases (1.13 onwards). The snapshot API version has changed from v1alpha1 to v1beta1 with this migration.

In order to use Volume Snapshots, ensure the following components are deployed to your cluster:
- Kubernetes Volume Snaphshot CRDs
- Volume Snapshot Controller

### Volume Snapshot Class

During the installation of CSI PowerFlex 1.3 driver, a Volume Snapshot Class is created using the new v1beta1 snapshot APIs. This is the only Volume Snapshot Class required and there is no need to create any other Volume Snapshot Class.

Following is the manifest for the Volume Snapshot Class created during installation:
```
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshotClass
metadata:
  name: vxflexos-snapclass
driver: csi-vxflexos.dellemc.com
deletionPolicy: Delete
```
### Create Volume Snapshot

The following is a sample manifest for creating a Volume Snapshot using the **v1beta1** snapshot APIs:
```
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshot
metadata:
  name: pvol0-snap
  namespace: helmtest-vxflexos
spec:
  volumeSnapshotClassName: vxflexos-snapclass
  source:
    persistentVolumeClaimName: pvol
```
Once the VolumeSnapshot is successfully created by the CSI PowerFlex driver, a VolumeSnapshotContent object is automatically created. Once the status of the VolumeSnapshot object has the _readyToUse_ field set to _true_ , it is available for use.

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

## Volume Expansion Feature

The CSI PowerFlex driver version 1.2 and later support expansion of Persistent Volumes. This expansion is done online, that is, when PVC is attached to a node.

To use this feature, the storage class used to create the PVC must have the attribute _allowVolumeExpansion_ set to _true_. The storage classes created during the installation (both using Helm or dell-csi-operator) have the _allowVolumeExpansion_ set to _true_ by default.

In case you are creating more storage classes, make sure that this attribute is set to _true_ if you wish to expand any Persistent Volumes created using these new storage classes.

Following is a sample manifest for a storage class which allows for Volume Expansion:
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
*NOTE:* Kubernetes Volume Expansion feature cannot be used to shrink a volume and volumes cannot be expanded to a value that is not a multiple of 8. If attempted, the driver will round up. For example, if the above PVC was edited to have a size of 20 Gb, the size would actually be expanded to 24 Gb, the closest multiple of 8.

## Volume Cloning Feature
The CSI PowerFlex driver version 1.3 and later support volume cloning. This feature allows specifying existing PVCs in the _dataSource_ field to indicate a user would like to clone a Volume.

The source PVC must be bound and available (not in use). Source and destination PVC must be in the same namespace and have the same Storage Class.

To clone a volume, you should first have an existing pvc, for example, pvol0:
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
Allowable access modes are _ReadWriteOnce_ , _ReadWriteMany_ , and for block devices that have been previously initialized, _ReadOnlyMany_.

Raw Block volumes are presented as a block device to the pod by using a bind mount to a block device in the node's file system. The driver does not format or check the format of any file system on the block device. Raw Block volumes do support online Volume Expansion, but it is up to the application to manage reconfiguring the file system (if any) to the new size.

For additional information, see the [Kubernetes Raw Block Volume Support documentation](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#raw-block-volume-support).

## Topology Support

The CSI PowerFlex driver version 1.2 and later support Topology which forces volumes to be placed on worker nodes that have connectivity to the backend storage. This covers use cases where:
- The PowerFlex SDC may not be installed or running on some nodes.
- Users have chosen to restrict the nodes on which the CSI driver is deployed.

This Topology support does not include customer defined topology, users cannot create their own labels for nodes and storage classed and expect the labels to be honored by the driver.

### Topology Usage

To utilize the Topology feature, the storage classes are modified to specify the _volumeBindingMode_ as _WaitForFirstConsumer_ and to specify the desired topology labels within _allowedTopologies_. This ensures that pod scheduling takes advantage of the topology and be guaranteed that the node selected has access to provisioned volumes.

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

*NOTE* In the manifest file of the Dell CSI operator, topology can be enabled by specifying the system name or _systemid_ in the allowed topologies field. _Volumebindingmode_ is also set to _WaitForFirstConsumer_ by default.

## Controller HA   

The CSI PowerFlex driver version 1.3 and later support multiple controller pods. A Controller pod can be assigned to a worker node or a master node, as long as no other controller pod is currently assigned to the node. To control the number of controller pods, edit:
```
controllerCount: 2
```  
in your values file to the desired number of controller pods. By default, the driver will deploy with two controller pods, each   assigned to a different worker node. 

> *NOTE:* If controller count is greater than the number of available nodes, excess controller pods will be stuck in pending state. 

If you're using the Dell CSI Operator, the value to adjust is:  
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
  # Leave as blank to install controller on worker nodes
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
  # Leave as blank to install controller on worker nodes
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


## Automated SDC Deployment

The CSI PowerFlex driver version 1.3 and later support the automatic deployment of the PowerFlex SDC on Red Hat CoreOS (RHCOS) nodes in an OpenShift cluster. Only RHCOS is supported at this time. The deployment of the SDC kernel module on RHCOS nodes is done via an init container. Automated installation is supported in both via Helm and Dell CSI Operator based installs. The following describes further details of this feature:

- On RHCOS nodes, the SDC init container runs prior to the driver being installed. It installs the SDC kernel module on the node. If there is a SDC kernel module installed then the version is checked and updated.
- Optionally, if the SDC monitor is enabled, another container is started and runs as the monitor. Follow PowerFlex SDC documentation to get monitor metrics.
- On non-RHCOS nodes, the SDC init container skips installing and you can see this mentioned in the logs by running `kubectl logs` on the node for SDC
- There is no automated uninstall of SDC kernel module. Follow PowerFlex SDC documentation to manually uninstall the SDC driver from node. 




