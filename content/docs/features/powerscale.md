---
title: PowerScale
Description: Code features for PowerScale Driver
---

## Consuming existing volumes with static provisioning

You can use existent volumes from PowerScale array as Persistent Volumes in your Kubernetes, perform the following steps:

1. Open your volume in One FS, and take a note of volume-id.
2. Create PersistentVolume and use this volume-id as a volumeHandle in the manifest. Modify other parameters according to your needs.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: isilonstaticpv
  namespace: default
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  storageClassName: isilon
  csi:
    driver: csi-isilon.dellemc.com
    volumeAttributes:
        Path: "/ifs/data/csi/isilonvol"
        Name: "isilonvol"
        AzServiceIP: 'XX.XX.XX.XX'
    volumeHandle: isilonvol=_=_=652=_=_=System
  claimRef:
    name: isilonstaticpvc
    namespace: default
```

3. Create PersistentVolumeClaim to use this PersistentVolume.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: isilonstaticpvc
  namespace: default
spec:
  accessModes:
  - ReadWriteMany
  resources:
        requests:
          storage: 5Gi
  volumeName: isilonstaticpv
  storageClassName: isilon           
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
        image: docker.io/centos:latest
        command: [ "/bin/sleep", "3600" ]
        volumeMounts:
          - mountPath: "/data0"
            name: pvol
    volumes:
      - name: pvol
        persistentVolumeClaim:
            claimName: isilonstaticpvc
```

5. After the pod becomes `Ready` and `Running`, you can start to use this pod and volume.

## Volume Snapshot Feature

The CSI PowerScale driver version 1.3 and later supports managing beta snapshots. 

In order to use Volume Snapshots, ensure the following components have been deployed to your cluster:

- Kubernetes Volume Snaphshot CRDs
- Volume Snapshot Controller

> For general use, update the snapshot controller YAMLs with an appropriate namespace before installing. For
> example, on a Vanilla Kubernetes cluster, update the namespace from default to kube-system before issuing the
> kubectl create command.

### Volume Snapshot Class

During the installation of CSI PowerScale driver version 1.3 and later, a Volume Snapshot Class is created using the new v1beta1 snapshot APIs. This is the only Volume Snapshot Class required and there is no need to create any other Volume Snapshot Class.

Following is the manifest for the Volume Snapshot Class created during installation:

```yaml
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshotClass
metadata:
  name: isilon-snapclass
driver: csi-isilon.dellemc.com
deletionPolicy: Delete
```

### Create Volume Snapshot

The following is a sample manifest for creating a Volume Snapshot using the **v1beta1** snapshot APIs:

```yaml  
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshot
metadata:
  name: pvcsnap
  namespace: default
spec:
  volumeSnapshotClassName: isilon-snapclass
  source:
    persistentVolumeClaimName: autotestvolume
```

Once the VolumeSnapshot has been successfully created by the CSI PowerScale driver, a VolumeSnapshotContent object is automatically created. Once the status of the VolumeSnapshot object has the _readyToUse_ field set to _true_ , it is available for use.

Following is the relevant section of VolumeSnapshot object status:

```yaml
status:
  boundVolumeSnapshotContentName: snapcontent-xxxxxxxxxxxxx
  creationTime: "2020-07-16T08:42:12Z"
  readyToUse: true
```

### Creating PVCs with Volume Snapshots as Source

The following is a sample manifest for creating a PVC with a VolumeSnapshot as a source:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: createfromsnap
  namespace: default
spec:
  storageClassName: isilon
  dataSource:
    name: newsnap
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 5Gi
```

## Volume Expansion

The CSI PowerScale driver version 1.3 and later supports the expansion of Persistent Volumes (PVs). This expansion can be done either online (for example, when a PVC is attached to a node) or offline (for example, when a PVC is not attached to any node).

To use this feature, the storage class that is used to create the PVC must have the attribute `allowVolumeExpansion` set to true. The storage classes created during the installation (both using Helm or dell-csi-operator) have the `allowVolumeExpansion` set to true by default.

If you are creating more storage classes, ensure that this attribute is set to true to expand any PVs created using these new storage classes.

The following is a sample manifest for a storage class which allows for Volume Expansion:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: isilon-expand-sc
  annotations:
    storageclass.beta.kubernetes.io/is-default-class: "false"
provisioner: "csi-isilon.dellemc.com"
reclaimPolicy: Delete
parameters:
  AccessZone: System
  isiPath: "/ifs/data/csi"
  AzServiceIP : 'XX.XX.XX.XX'
  rootClientEnabled: "true"
allowVolumeExpansion: true
volumeBindingMode: Immediate
```

To resize a PVC, edit the existing PVC spec and set spec.resources.requests.storage to the intended size. For example, if you have a PVC isilon-pvc-demo of size 3Gi, then you can resize it to 30Gi by updating the PVC.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
    name: isilon-pvc-demo
spec:
    accessModes:
      - ReadWriteOnce
    resources:
        requests:
            storage: 30Gi # Updated size from 3Gi to 30Gi
    storageClassName: isilon-expand-sc
```

>The Kubernetes Volume Expansion feature can only be used to increase the size of a volume. It cannot be used to shrink a volume.


## Volume Cloning Feature

The CSI PowerScale driver version 1.3 and later supports volume cloning. This allows specifying existing PVCs in the _dataSource_ field to indicate a user would like to clone a Volume.

Source and destination PVC must be in the same namespace and have the same Storage Class.

To clone a volume, you should first have an existing PVC:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: existing-pvc
spec:
  accessModes:
  - ReadWriteMany
  resources:
    requests:
      storage: 5Gi
  storageClassName: isilon
```

The following is a sample manifest for cloning:

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: volume-from-volume
  namespace: default 
spec:
  accessModes:
  - ReadWriteMany
  volumeMode: Filesystem
  resources:
    requests:
      storage: 50Gi
  storageClassName: isilon
  dataSource:
    kind: PersistentVolumeClaim
    name: existing-pvc
    apiGroup: ""
```

## Controller HA

The CSI PowerScale driver version 1.4.0 and later supports running multiple replicas of controller pod. At any time, only one controller pod is active(leader), and the rest are on standby.
In case of a failure, one of the standby pods becomes active and takes the position of leader. This is achieved by using native leader election mechanisms utilizing `kubernetes leases`.

Additionally by leveraging `pod anti-affinity`, no two controller pods are ever scheduled on the same node.

To increase or decrease the number of controller pods, edit the following value in `myvalues.yaml` file:
```
controllerCount: 2
```

>**NOTE:** The default value for controllerCount is 2. It is recommended to not change this unless really required. Also, if controller count is greater than the number of available nodes (where the pods can be scheduled), some controller pods will remain in Pending state.

If you are using the `dell-csi-operator`, adjust the following value in your Custom Resource manifest
```
replicas: 2  
```
For more details about configuring Controller HA using the Dell CSI Operator, refer to the Dell CSI Operator documentation.

## Ephemeral Inline Volume

The CSI PowerScale driver version 1.4.0 and later supports CSI ephemeral inline volumes.

This feature serves use cases for data volumes whose content and lifecycle are tied to a pod. For example, a driver might populate a volume with dynamically created secrets that are specific to the application running in the pod. Such volumes need to be created together with a pod and can be deleted as part of pod termination (ephemeral). They get defined as part of the pod spec (inline).
 
At runtime, nested inline volumes follow the lifecycle of their associated pods where the driver handles all phases of volume operations as pods are created and destroyed.
 
The following is a sample manifest for creating CSI ephemeral Inline Volume in pod manifest with CSI PowerScale driver.

```yaml
kind: Pod
apiVersion: v1
metadata:
  name: my-csi-app-inline-volume
spec:
  containers:
    - name: my-frontend
      image: busybox
      command: [ "sleep", "100000" ]
      volumeMounts:
      - mountPath: "/data"
        name: my-csi-volume
  volumes:
  - name: my-csi-volume
    csi:
      driver: csi-isilon.dellemc.com
      volumeAttributes:
        size: "2Gi"
```

This manifest will create a pod and attach newly created ephemeral inline csi volume to it.

## Topology
### Topology Support

The CSI PowerScale driver version 1.4.0 and later supports Topology by default which forces volumes to be placed on worker nodes that have connectivity to the backend storage, as a result of which the nodes which have access to PowerScale Array are appropriately labelled. The driver leverages these labels to ensure that the driver components (controller, node) are spawned only on nodes wherein these labels exist. 
  
This covers use cases where:
 
The CSI PowerScale driver may not be installed or running on some nodes where Users have chosen to restrict the nodes on accessing the PowerScale storage array. 

We support CustomTopology which enables users to apply labels for nodes - "csi-isilon.dellemc.com/XX.XX.XX.XX=csi-isilon.dellemc.com" and expect the labels to be honored by the driver.
  
When “enableCustomTopology” is set to “true”, CSI driver fetches custom labels “csi-isilon.dellemc.com/XX.XX.XX.XX=csi-isilon.dellemc.com” applied on worker nodes, and use them to initialize node pod with custom PowerScale FQDN/IP.

### Topology Usage
   
In order to utilize the Topology feature the default storage classes are modified to specify the volumeBindingMode as WaitForFirstConsumer and to specify the desired topology labels within allowedTopologies field as part of default storage class ensures that pod scheduling takes advantage of the topology and be guaranteed that the node selected has access to provisioned volumes. 
  
**Storage Class Example with Topology Support:**
 
```yaml
apiVersion: v1
items:
- allowVolumeExpansion: true
  allowedTopologies:
  - matchLabelExpressions:
    - key: csi-isilon.dellemc.com/XX.XX.XX.XX
      values:
      - csi-isilon.dellemc.com
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
    name: Isilon
  parameters:
    AccessZone: System
    AzServiceIP: XX.XX.XX.XX
    IsiPath: /ifs/data/csi
    RootClientEnabled: "false"
  provisioner: csi-isilon.dellemc.com
  reclaimPolicy: Delete
  volumeBindingMode: WaitForFirstConsumer

```
For additional information, see the [Kubernetes Topology documentation](https://kubernetes-csi.github.io/docs/topology.html).
