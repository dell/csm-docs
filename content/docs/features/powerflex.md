---
title: PowerFlex
linktitle: PowerFlex 
Description: Code features for PowerFlex Driver
---

## Volume Snapshot Feature

The Volume Snapshot feature was introduced in alpha (v1alpha1) in Kubernetes 1.13 and then moved to beta (v1beta1) in Kubernetes 1.17 and is generally available (v1) in Kubernetes version 1.20. 

The CSI PowerFlex driver version 1.4 supports v1beta1 snapshots on Kubernetes 1.18/1.19 and v1 snapshots on Kubernetes 1.20.

In order to use Volume Snapshots, ensure the following components are deployed to your cluster:
- Kubernetes Volume Snaphshot CRDs
- Volume Snapshot Controller

### Volume Snapshot Class

During the installation of CSI PowerFlex 1.4 driver, a Volume Snapshot Class is created. This is the only Volume Snapshot Class required and there is no need to create any other Volume Snapshot Class.

Following is the manifest for the Volume Snapshot Class created during installation: 
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

In case you are creating more storage classes, ensure that this attribute is set to _true_ if you wish to expand any Persistent Volumes created using these new storage classes.

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
*NOTE:* Kubernetes Volume Expansion feature cannot be used to shrink a volume and volumes cannot be expanded to a value that is not a multiple of 8. If attempted, the driver will round up. For example, if the above PVC was edited to have a size of 20 Gb, the size would actually be expanded to 24 Gb, the next highest multiple of 8.

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

This Topology support does not include customer defined topology, users cannot create their own labels for nodes and storage classes and expect the labels to be honored by the driver.

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

*NOTE*: In the manifest file of the Dell CSI operator, topology can be enabled by specifying the system name or _systemid_ in the allowed topologies field. _Volumebindingmode_ is also set to _WaitForFirstConsumer_ by default.

## Controller HA   

The CSI PowerFlex driver version 1.3 and later support multiple controller pods. A Controller pod can be assigned to a worker node or a master node, as long as no other controller pod is currently assigned to the node. To control the number of controller pods, edit:
```
controllerCount: 2
```
in your values file to the desired number of controller pods. By default, the driver will deploy with two controller pods, each   assigned to a different worker node. 

> *NOTE:* If controller count is greater than the number of available nodes, excess controller pods will be stuck in pending state. 

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

## SDC Deployment

The CSI PowerFlex driver version 1.3 and later support the automatic deployment of the PowerFlex SDC on Kubernetes nodes which run node portion of CSI driver. The deployment of the SDC kernel module occurs on these nodes with OS platform which support automatic SDC deployment, currently Fedora CoreOS (FCOS) and Red Hat CoreOS (RHCOS). On Kubernetes nodes with OS version not supported by automatic install, you must perform the Manual SDC Deployment steps below. Refer https://hub.docker.com/r/dellemc/sdc for your OS versions.

- On Kubernetes nodes which run node portion of CSI driver, the SDC init container runs prior to the driver being installed. It installs the SDC kernel module on the nodes with OS version which supports automatic SDC deployment . If there is a SDC kernel module installed then the version is checked and updated.
- Optionally, if the SDC monitor is enabled, another container is started and runs as the monitor. Follow PowerFlex SDC documentation to get monitor metrics.
- On nodes which do not support automatic SDC deployment by SDC init container, manuall installation steps must be followed. The SDC init container skips installing and you can see this mentioned in the logs by running kubectl logs on the node for SDC.
  Refer https://hub.docker.com/r/dellemc/sdc for supported OS versions.
- There is no automated uninstall of SDC kernel module. Follow PowerFlex SDC documentation to manually uninstall the SDC driver from node. 



## Multiarray Support

The CSI PowerFlex driver version 1.4 adds support for managing multiple PowerFlex arrays from the single driver instance. This feature is enabled by default and integrated to even single instance installations.

To manage multiple arrays you need to create an array connection configuration that lists multiple arrays.

### Creating array configuration

There is a sample json file under the top directory named `config.json` with the following content:

```
[
    {
        "username": "admin",				# username for connecting to API
        "password": "password",				# password for connecting to API
        "systemID": "ID1",				# system ID for system
        "endpoint": "http://127.0.0.1",		        # full URL path to the PowerFlex API
        "insecure": true,				# use insecure connection or not
        "isDefault": true,				# treat current array as default (would be used by storage class without arrayIP parameter)
        "mdm": "10.0.0.1,10.0.0.2"			# MDM IP for the system
    },
    {
        "username": "admin",
        "password": "password",
        "systemID": "ID2",
        "endpoint": "https://127.0.0.2",
        "insecure": true,
        "mdm": "10.0.0.3,10.0.0.4"
    }
]
```

Here we specify that we want CSI driver to manage two arrays: one with an IP `127.0.0.1` and the other with an IP `127.0.0.2`.

To use this config we need to create a Kubernetes secret from it. To do so run the following command:

`kubectl create secret generic vxflexos-config -n vxflexos --from-file=config=config.json`

### Creating storage classes 

To be able to provision Kubernetes volumes using a specific array we need to create corresponding storage classes.

Find the sample yaml files under `helm/samples/storageclass`. Edit `storageclass.yaml` if you want `ext4` filesystem, and use `storageclass-xfs.yaml` if you want `xfs` filesystem. Replace `<STORAGE_POOL>` with the storage pool you have, and replace `<SYSTEM_ID>` with the system ID you have. 

Then we need to apply storage classes to Kubernetes using `kubectl`:

```bash
kubectl create -f storageclass.yaml
```

After that, you can use the storage class for the corresponding array.

## Ephemeral Inline Volume

The CSI PowerFlex driver version 1.4 supports ephemeral inline CSI volumes. This feature allows CSI volumes to be specified directly in the pod specification. 

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

This manifest will create a pod and attach two newly created ephemeral inline csi volumes to it, one ext4 and the other xfs.  
To run the corresponding helm test, go to csi-vxflexos/test/helm/ephemeral and fill in the values for storagepool and systemID in sample.yaml.  
Then run:
````
./testEphemeral.sh
````  
this test will deploy the pod with two ephemeral volumes, and write some data to them before deleting the pod.   
When creating ephemeral volumes, it is important to specify the following within the volumeAttributes section: volumeName, size, storagepool, and if you want to use a non-default array, systemID.  




