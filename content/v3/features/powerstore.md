---
title: PowerStore
Description: Code features for PowerStore Driver
---

## Creating volumes and consuming them

Create a file `simple.yaml` using sample yaml files located at tests/simple/

This command will create a statefulset that consumes three volumes of default storage classes
```bash
kubectl create -f tests/simple/simple.yaml
```
After executing this command 3 PVC and statefulset will be created in the `testpowerstore` namespace.
You can check created PVCs by running `kubectl get pvc -n testpowerstore` and check statefulset's pods by running `kubectl get pods -n testpowerstore`
Pod should be `Ready` and `Running`
> If Pod is in CrashLoopback or PVCs is in Pending state then driver installation is not successful, check logs of node and controller

## Deleting volumes

To delete volumes, pod and statefulset run
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
        image: docker.io/centos:latest
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

The CSI PowerStore driver version 1.1 and later supports managing beta snapshots. 
 
To use Volume Snapshots, ensure the following components have been deployed to your cluster:
- Kubernetes Volume Snaphshot CRDs
- Volume Snapshot Controller

You can install them by running following commands: 
```bash
git clone https://github.com/kubernetes-csi/external-snapshotter/
cd ./external-snapshotter
git checkout release-3.0
kubectl create -f client/config/crd
kubectl create -f deploy/kubernetes/snapshot-controller
```

> For general use, update the snapshot controller YAMLs with an appropriate namespace before installing. For
example, on a Vanilla Kubernetes cluster, update the namespace from default to kube-system before issuing the
kubectl create command.

### Volume Snapshot Class

During the installation of CSI PowerStore driver version 1.1 and later, a Volume Snapshot Class is created using the new v1beta1 snapshot APIs. This is the only Volume Snapshot Class required and there is no need to create any other Volume Snapshot Class.

Following is the manifest for the Volume Snapshot Class created during installation:
```yaml
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshotClass
metadata:
  name: powerstore-snapshot
driver: csi-powerstore.dellemc.com
deletionPolicy: Delete
```

### Create Volume Snapshot

The following is a sample manifest for creating a Volume Snapshot using the **v1beta1** snapshot APIs:
```yaml
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshot
metadata:
  name: pvol0-snap
  namespace: testpowerstore
spec:
  volumeSnapshotClassName: powerstore-snapshot
  source:
    persistentVolumeClaimName: pvol
```
Once the VolumeSnapshot has been successfully created by the CSI PowerStore driver, a VolumeSnapshotContent object is automatically created. Once the status of the VolumeSnapshot object has the _readyToUse_ field set to _true_ , it is available for use.

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

The CSI PowerStore driver Version 1.2.0 adds support for unidirectional Challenge Handshake Authentication Protocol (CHAP) for iSCSI protocol.

To enable CHAP authentication:
1. Create secret `powerstore-creds` with the key `chapsecret` and `chapuser` set to base64 values. `chapsecret` must be between 12 and 60 symbols. If the secret exists, delete and re-create the secret with this newly added key.
2. Set the parameter `connection.enableCHAP` in `my-powerstore-settings.yaml` to true.

The driver uses the provided chapsecret to configure the iSCSI node database on each node with iSCSI access.

When creating new host on powerstore array driver will populate host chap credentials with provided values. When re-using already existing hosts be sure to check that provided credentials in `powerstore-creds` match earlier preconfigured host credentials. 

## Volume Expansion

The CSI PowerStore driver version 1.1 and later supports the expansion of Persistent Volumes (PVs). This expansion can be done either online (for example, when a PV is attached to a node) or offline (for example, when a PV is not attached to any node).

To use this feature, the storage class that is used to create the PV must have the attribute `allowVolumeExpansion` set to true. The storage classes created during the installation (both using Helm or dell-csi-operator) have the `allowVolumeExpansion` set to true by default.

If you are creating more storage classes, ensure that this attribute is set to true to expand any PVs created using these new storage classes.

The following is a sample manifest for a storage class which allows for Volume Expansion:

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
Volume Expansion, but it is up to the application to manage reconfiguring the file system (if any) to the new size.

For additional information, see the [kubernetes](https://kubernetes.io/DOCS/CONCEPTS/STORAGE/PERSISTENT-VOLUMES/#RAW-BLOCK-VOLUME-SUPPORT) website.


## Volume Cloning Feature
The CSI PowerStore driver version 1.1 and later supports volume cloning. This allows specifying existing PVCs in the _dataSource_ field to indicate a user would like to clone a Volume.

Source and destination PVC must be in the same namespace and have the same Storage Class.

To clone a volume, you should first have an existing pvc, for example, pvol0:
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

The CSI PowerStore driver version 1.2 supports ephemeral inline CSI volumes. This feature allows CSI volumes to be specified directly in the pod specification. 

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
      image: busybox
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

This manifest will create a pod and attach newly created ephemeral inline csi volume to it. 

To create `NFS` volume you need to provide `nasName:` parameters that points to the name of your NAS Server in pod manifest like so

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

 The CSI PowerStore driver version 1.2 introduces controller HA feature. Instead of StatefulSet controller pods deployed as a Deployment.

By default number of replicas set to 2, you can set `controller.replicas` parameter to 1 in `my-powerstore-settings.yaml` if you want to disable controller HA for your installation. When installing via Operator you can change `replicas` parameter in `spec.driver` section in your PowerStore Custom Resource.

When multiple replicas of controller pods are in cluster each sidecar (attacher, provisioner, resizer, snapshotter) tries to get a lease so only one instance of each sidecar would be active in the cluster at a time. 

### Driver pod placement

You can configure where driver controller and worker pods should be placed. 
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

As mentioned earlier, you can configure where node driver pods would be assinged in the similar way in `node` section of `my-powerstore-settings.yaml`

## Topology

The CSI PowerStore driver version 1.2 and later supports Topology which forces volumes to be placed on worker nodes that have connectivity to the backend storage. This covers use cases where users have chosen to restrict the nodes on which the CSI driver is deployed.

This Topology support does not include customer defined topology, users cannot create their own labels for nodes, they should use whatever labels are returned by driver and applied automatically by Kubernetes on its nodes.

### Topology Usage

To use the Topology feaure user needs to create their own storage classes similar to those that can be found in `helm/samples/storageclass` folder.

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

This example will match all nodes where driver has a connection to PowerStore with IP of `127.0.0.1` via FibreChannel. Similar examples can be found in mentioned folder for NFS and iSCSI.

You can check what labels your nodes contain by running `kubectl get nodes --show-labels`

>Notice that `volumeBindingMode:` is set to `WaitForFirstConsumer` this is required for topology feature to work.

For any additional information about topology, see the [Kubernetes Topology documentation](https://kubernetes-csi.github.io/docs/topology.html).


## Reuse PowerStore hostname 

The CSI PowerStore driver version 1.2 and later can automatically detect if the current node was already registered as Host on storage array before. It will check if Host initiators and node initiators (FC or iSCSI) match. If they do, the driver will not create a new storage class and will take the existing name of the Host as nodeID.
