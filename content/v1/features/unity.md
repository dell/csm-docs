---
title: Unity
Description: Code features for Unity Driver
---

## Creating volumes and consuming them

Create a file `simple.yaml` using sample yaml files located at tests/sample.yaml

The following command creates a statefulset that consumes three volumes of default storage classes:

```bash
kubectl create -f tests/sample.yaml
```

After executing this command 3 PVC and statefulset are created in the `test-unity` namespace.
You can check created PVCs by running `kubectl get pvc -n test-unity` and check statefulset's pods by running `kubectl get pods -n test-unity`command.
Pod should be `Ready` and `Running`.

> If Pod is in CrashLoopback or PVCs is in Pending state then driver installation is not successful, check logs of node and controller.

## Deleting volumes

To delete volumes, pod and statefulset run the command

```bash
kubectl delete -f tests/sample.yaml
```

## Consuming existing volumes with static provisioning

You can use existent volumes from Unity array as Persistent Volumes in your Kubernetes, to do that you must perform the following steps:

1. Open your volume in Unity Management UI (unisphere), and take a note of volume-id. The `volume-id` looks like `csiunity-xxxxx` and CLI ID looks like `sv_xxxx`.
2. Create PersistentVolume and use this volume-id as a volumeHandle in the manifest. Modify other parameters according to your needs.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
    name: static-1
    annotations:
       pv.kubernetes.io/provisioned-by: csi-unity.dellemc.com
spec:
    accessModes:
      - ReadWriteOnce
    capacity:
        storage: 5Gi
    csi:
        driver: csi-unity.dellemc.com
        volumeHandle: existingvol-<protocol>-<array_id>-<volume-id>
    persistentVolumeReclaimPolicy: Retain
    claimRef:
      namespace: default
      name: static-pvc1
    storageClassName: unity
    volumeMode: Filesystem
```

3. Create PersistentVolumeClaim to use this PersistentVolume.

```yaml
kind: PersistentVolumeClaim                
apiVersion: v1                             
metadata:                                  
  name: static-pvc1                        
spec:                                      
  accessModes:                             
    - ReadWriteMany                        
  resources:                               
    requests:                              
      storage: 5Gi                         
  volumeName: static-1                     
  storageClassName: unity            
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
            claimName: static-pvc1
```

5. After the pod becomes `Ready` and `Running`, you can start to use this pod and volume.

## Volume Snapshot Feature

The Volume Snapshot feature was introduced in alpha (v1alpha1) in Kubernetes 1.13 and then moved to beta (v1beta1) in Kubernetes version 1.17 and generally available (v1) in Kubernetes version 1.20. 

The CSI Unity driver version 1.5 supports v1beta1 snapshots on Kubernetes 1.18/1.19 and v1 snapshots on Kubernetes 1.20.

In order to use Volume Snapshots, ensure the following components have been deployed to your cluster:
- Kubernetes Volume Snaphshot CRDs
- Volume Snapshot Controller

### Volume Snapshot Class

During the installation of CSI Unity 1.5 driver, a Volume Snapshot Class is created. This is the only Volume Snapshot Class required and there is no need to create any other Volume Snapshot Class.

Following is the manifest for a Volume Snapshot Class created during installation:

```yaml
apiVersion: snapshot.storage.k8s.io/v1 #For beta snapshots the apiVersion will be snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshotClass
metadata:
  name: unity-snapclass
driver: csi-unity.dellemc.com
deletionPolicy: Delete
```

### Create Volume Snapshot

The following is a sample manifest for creating a Volume Snapshot using the **v1** snapshot APIs:

```yaml
apiVersion: snapshot.storage.k8s.io/v1 #For beta snapshots the apiVersion will be snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshot
metadata:
  name: pvol0-snap
  namespace: test-unity
spec:
  volumeSnapshotClassName: unity-snapclass
  source:
    persistentVolumeClaimName: pvol
```

Once the VolumeSnapshot is successfully created by the CSI Unity driver, a VolumeSnapshotContent object is automatically created. Once the status of the VolumeSnapshot object has the _readyToUse_ field set to _true_ , it is available for use.

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
  name: restorepvc
  namespace: test-unity
spec:
  storageClassName: unity-iscsi
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

## Volume Expansion

The CSI Unity driver version 1.3 and later supports the expansion of Persistent Volumes (PVs). This expansion can be done either online (for example, when a PVC is attached to a node) or offline (for example, when a PVC is not attached to any node).

To use this feature, the storage class that is used to create the PVC must have the attribute `allowVolumeExpansion` set to true. The storage classes created during the installation (both using Helm or dell-csi-operator) have the `allowVolumeExpansion` set to true by default.

If you are creating more storage classes, ensure that this attribute is set to true to expand any PVs created using these new storage classes.

The following is a sample manifest for a storage class which allows for Volume Expansion:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
    name: unity-expand-sc
    annotations:
        storageclass.beta.kubernetes.io/is-default-class: false
provisioner: csi-unity.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true # Set this attribute to true if you plan to expand any PVCs created using this storage class
parameters:
    FsType: xfs
```

To resize a PVC, edit the existing PVC spec and set spec.resources.requests.storage to the intended size. For example, if you have a PVC unity-pvc-demo of size 3Gi, then you can resize it to 30Gi by updating the PVC.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
    name: unity-pvc-demo
    namespace: test
spec:
    accessModes:
      - ReadWriteOnce
    volumeMode: Filesystem
    resources:
        requests:
            storage: 30Gi # Updated size from 3Gi to 30Gi
    storageClassName: unity-expand-sc
```

>The Kubernetes Volume Expansion feature can only be used to increase the size of a volume. It cannot be used to shrink a volume.

## Raw block support

The CSI Unity driver supports Raw Block Volumes from v1.4 onwards.
	Raw Block volumes are created using the volumeDevices list in the pod template spec with each entry accessing a volumeClaimTemplate specifying a volumeMode: Block. An example configuration is outlined here:
	
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rawblockpvc
  namespace: default
spec:
  accessModes:
  - ReadWriteOnce
  volumeMode: Block  
  resources:
        requests:
          storage: 5Gi
  storageClassName: unity-iscsi
	  
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: rawblockpod
  namespace: default
spec:
  containers:
    - name: task-pv-container
      image: nginx
      ports:
        - containerPort: 80
          name: "http-server"
      volumeDevices:
        - devicePath: /usr/share/nginx/html/device
          name: nov-eleventh-1-pv-storage
  volumes:
    - name: nov-eleventh-1-pv-storage
      persistentVolumeClaim:
        claimName: rawblockpvc
    
```

Access modes allowed are ReadWriteOnce and ReadWriteMany. Raw Block volumes are presented as a block device to the pod by using a bind mount to a block device in the node's file system. The driver does not format or check the format of any file system on the block device. 
Raw Block volumes do support online Volume Expansion, but it is up to the application to manage reconfiguring the file system (if any) to the new size. Access mode ReadOnlyMany is not supported with raw block since we cannot restrict volumes to be readonly from Unity.

For additional information, see the [kubernetes](https://kubernetes.io/DOCS/CONCEPTS/STORAGE/PERSISTENT-VOLUMES/#RAW-BLOCK-VOLUME-SUPPORT) website.


## Volume Cloning Feature

The CSI Unity driver version 1.3 supports volume cloning. This allows specifying existing PVCs in the _dataSource_ field to indicate a user would like to clone a Volume.

Source and destination PVC must be in the same namespace and have the same Storage Class.

To clone a volume, you should first have an existing PVC, example: vol0:

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: vol0
  namespace: test-unity
spec:
  storageClassName: unity-nfs
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
  name: cloned-pvc
  namespace: test-unity
spec:
  storageClassName: unity-nfs
  dataSource:
    name: vol0
    kind: PersistentVolumeClaim
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 8Gi
```

## Ephemeral Inline Volume

The CSI Unity driver version 1.4 supports ephemeral inline CSI volumes. This feature allows CSI volumes to be specified directly in the pod specification. 

At runtime, nested inline volumes follow the ephemeral lifecycle of their associated pods where the driver handles all phases of volume operations as pods are created and destroyed.

The following is a sample manifest for creating ephemeral volume in pod manifest with CSI Unity driver.

```yaml
kind: Pod
apiVersion: v1
metadata:
  name: test-unity-ephemeral-volume
spec:
  containers:
    - name: test-container
      image: busybox
      command: [ "sleep", "3600" ]
      volumeMounts:
      - mountPath: "/data"
        name: volume
  volumes:
  - name: volume
    csi:
      driver: csi-unity.dellemc.com
      fsType: "ext4"
      volumeAttributes:
        size: "10Gi"
```

This manifest creates a pod and attach newly created ephemeral inline CSI volume to it. 

To create `NFS` volume you need to provide `nasName:` parameters that points to the name of your NAS Server in pod manifest like so

```yaml
  volumes:
  - name: volume
    csi:
      driver: csi-unity.dellemc.com
      fsType: "nfs"
      volumeAttributes:
        size: "20Gi"
        nasName: "csi-nas-name"
```

## Controller HA

The CSI Unity driver version 1.4 introduces controller HA feature. Instead of StatefulSet controller pods deployed as a Deployment.

By default number of replicas set to 2, you can set `controllerCount` parameter to 1 in `myvalues.yaml` if you want to disable controller HA for your installation. When installing via Operator you can change `replicas` parameter in `spec.driver` section in your Unity Custom Resource.

When multiple replicas of controller pods are in cluster each sidecar (Attacher, Provisioner, Resizer and Snapshotter) tries to get a lease so only one instance of each sidecar is active in the cluster at a time. 

### Driver pod placement

You can configure where driver controller and worker pods should be placed. 
To do that you will need to use `nodeSelector` and `tolerations` mechanisms you can configure in your `myvalues.yaml`

For example you can specify `tolerations` to assign driver controller pods on controller nodes too:

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

As said before you can configure where node driver pods would be assigned in the similar way in `node` section of `myvalues.yaml`

## Topology

The CSI Unity driver version 1.4 supports Topology which forces volumes to be placed on worker nodes that have connectivity to the backend storage. This covers use cases where users have chosen to restrict the nodes on which the CSI driver is deployed.

This Topology support does not include customer defined topology, users cannot create their own labels for nodes, they should use whatever labels are returned by driver and applied automatically by Kubernetes on its nodes.

### Topology Usage

To use the Topology feature, user can install driver by setting `createStorageClassesWithTopology` to true in the `myvalues.yaml` which will create default storage classes by adding topology keys (based on the arrays specified in `myvalues.yaml`) and with `WaitForFirstConsumer` binding mode. 

Another option is the user can create custom storage classes on their own by specifying the valid topology keys and binding mode.

The following is one of example storage class manifest: 

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: unity-topology-fc
provisioner: csi-unity.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
allowedTopologies:
  - matchLabelExpressions:
      - key: csi-unity.dellemc.com/<array_id>-fc
        values:
          - "true"
```

This example will match all nodes where driver has a connection to Unity array with array ID mentioned via Fiber Channel. Similarly by replacing `fc` with `iscsi` in the key will check for iSCSI connectivity with the node.

You can check what labels your nodes contain by running `kubectl get nodes --show-labels` command.

>Note that `volumeBindingMode:` is set to `WaitForFirstConsumer` this is required for topology feature to work properly.

For any additional information about topology, see the [Kubernetes Topology documentation](https://kubernetes-csi.github.io/docs/topology.html).

## Support for Docker EE

The CSI Driver for Dell EMC Unity supports Docker EE and deployment on clusters bootstrapped with UCP (Universal Control Plane).

*UCP version 3.3.3 supports Kubernetes 1.18 and CSI driver can be installed on UCP 3.3 with Helm. 

The installation process for the driver on such clusters remains the same as the installation process on upstream clusters.

On UCP based clusters, `kubectl` may not be installed by default, it is important that [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) is installed prior to the installation of the driver.

The worker nodes in UCP backed clusters may run any of the OSs which we support with upstream clusters.


## Support for SLES 15 SP2

The CSI Driver for Dell EMC Unity requires the following set of packages installed on all worker nodes that run on SLES 15 SP2.

 - open-iscsi **open-iscsi is required in order to make use of iSCSI protocol for provisioning**
 - nfs-utils **nfs-utils is required in order to make use of NFS protocol for provisioning**
 - multipath-tools **multipath-tools is required in order to make use of FC and iSCSI protocols for provisioning**

  After installing open-iscsi, ensure "iscsi" and "iscsid" services have been started and /etc/isci/initiatorname.iscsi is created and has the host initiator id. The pre-requisites are mandatory for provisioning with iSCSI protocol to work.
