---
title: PowerScale
Description: Code features for PowerScale Driver
---

## Multicluster support

You can connect single CSI-PowerScale driver with multiple PowerScale clusters.
Pre-Requisistes:

1. Creation of secret.json with credentials related to one or more Clusters.
2. Creation of (at least) one Custom Storage classes for each non-default clusters.
3. Creation of custom-volumesnapshot classes, if corresponding isiPaths differ in custom storage classes.
4. Inclusion of cluster name in volume handle, if you want to provision existing static volumes.

## Consuming existing volumes with static provisioning

You can use existent volumes from PowerScale array as Persistent Volumes in your Kubernetes, perform the following steps:

1. Open your volume in One FS, and take a note of volume-id.
2. Create PersistentVolume and use this volume-id as a volumeHandle in the manifest. Modify other parameters according to your needs.
3. In the following example, the PowerScale cluster accessZone is assumed as 'System', cluster name is assumed as 'pscale-cluster' and volume's internal name as 'isilonvol'. The volume-handle shoulb be in the format of <volume_name>=_=_=<export_id>=_=_=<zone>=_=_=<cluster_name>

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
    volumeHandle: isilonvol=_=_=652=_=_=System=_=_=pscale-cluster
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

During the installation of CSI PowerScale driver version 1.3 and later, a Volume Snapshot Class is created using the new recommended snapshot APIs (depends upon Kubernetes version). This is the Volume Snapshot Class created for the default isiPath provided in my-isilon-settings.yaml (which is created based on values.yaml). For additional custom storage classes, separate custom volume snapshot class should be created (only if the isiPath is different from default storage class).

Following are the manifests for the Volume Snapshot Class created during installation:

1. VolumeSnapshotClass - v1
```yaml
# For kubernetes version 20 (v1 snaps)
# This is a sample manifest for creating snapshotclass with IsiPath other than default
# pvc is created with sc which has some different IsiPath e.g. /ifs/custom
# to create a snapshot for this pvc volumesnapshotclass must also be initilized with same IsiPath (i.e. /ifs/custom ) to work snapshot feature
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: "isilon-snapclass-custom"
driver: csi-isilon.dellemc.com
#The deletionPolicy of a volume snapshot class can either be Retain or Delete
#If the deletionPolicy is Delete, then the underlying storage snapshot is deleted along with the VolumeSnapshotContent object.
#If the deletionPolicy is Retain, then both the underlying snapshot and VolumeSnapshotContent remain
deletionPolicy: Delete
parameters:
  #IsiPath should match with respective storageClass IsiPath
  IsiPath: "/ifs/custom"
```
2. VolumeSnapshotClass - beta
```yaml
# For kubernetes version 18 and 19 (beta snaps)
# This is a sample manifest for creating snapshotclass with IsiPath other than default
# pvc is created with sc which has some different IsiPath e.g. /ifs/custom
# to create a snapshot for this pvc volumesnapshotclass must also be initilized with same IsiPath (i.e. /ifs/custom ) to work snapshot feature
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshotClass
metadata:
name: "isilon-snapclass-custom"
driver: csi-isilon.dellemc.com
#The deletionPolicy of a volume snapshot class can either be Retain or Delete
#If the deletionPolicy is Delete, then the underlying storage snapshot is deleted along with the VolumeSnapshotContent object.
#If the deletionPolicy is Retain, then both the underlying snapshot and VolumeSnapshotContent remain
deletionPolicy: Delete
parameters:
#IsiPath should match with respective storageClass IsiPath
IsiPath: "/ifs/custom"
### Create Volume Snapshot
```

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
  ClusterName: <clusterName specified in secret.json>
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
          ClusterName: "cluster1"
```

This manifest creates a pod in given cluster and attach newly created ephemeral inline csi volume to it.

## Topology
### Topology Support

The CSI PowerScale driver version 1.4.0 and later supports Topology by default which forces volumes to be placed on worker nodes that have connectivity to the backend storage, as a result of which the nodes which have access to PowerScale Array are appropriately labelled. The driver leverages these labels to ensure that the driver components (controller, node) are spawned only on nodes wherein these labels exist. 
  
This covers use cases where:
 
The CSI PowerScale driver may not be installed or running on some nodes where Users have chosen to restrict the nodes on accessing the PowerScale storage array. 

We support CustomTopology which enables users to apply labels for nodes - "csi-isilon.dellemc.com/XX.XX.XX.XX=csi-isilon.dellemc.com" and expect the labels to be honored by the driver.
  
When “enableCustomTopology” is set to “true”, CSI driver fetches custom labels “csi-isilon.dellemc.com/XX.XX.XX.XX=csi-isilon.dellemc.com” applied on worker nodes, and use them to initialize node pod with custom PowerScale FQDN/IP.
**Note:** Only a single cluster can be configured as part of secret.json for custom topology.


### Topology Usage
   
To utilize the Topology feature, create a custom `StorageClass` with `volumeBindingMode` set to `WaitForFirstConsumer` and specify the desired topology labels within `allowedTopologies` field of this custom storage class. This ensures that Pod scheduling takes advantage of the topology and the selected node has access to provisioned volumes. 
  
**Storage Class Example with Topology Support:**
 
```yaml
# This is a sample manifest for utilizing the topology feature and mount options.
# PVCs created using this storage class will be scheduled 
# only on the nodes with access to Isilon

# Change all instances of <ISILON_IP> to the IP of the PowerScale OneFS API server

# Provide mount options through "mountOptions" attribute 
# to create PVCs with mount options.

apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: isilon
provisioner: csi-isilon.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true
parameters:
  AccessZone: System
  IsiPath: "/ifs/data/csi"
  # AccessZone groupnet service IP. Update AzServiceIP in values.yaml if different than isiIP.
  #AzServiceIP : 192.168.2.1
  # When a PVC is being created, it takes the storage class' value of "storageclass.rootClientEnabled", 
  # which  determines, when a node mounts the PVC, in NodeStageVolume, whether to add the k8s node to 
  # the "Root clients" field (when true) or "Clients" field (when false) of the NFS export 
  RootClientEnabled: "false"
  # Name of PowerScale cluster where pv will be provisioned
  # This name should match with name of one of the cluster configs in isilon-creds secret
  # If this parameter is not specified, then default cluster config in isilon-creds secret will be considered if available
  #ClusterName: "<cluster_name>"

# volumeBindingMode controls when volume binding and dynamic provisioning should occur.
# Immediate mode indicates that volume binding and dynamic provisioning occurs once the PersistentVolumeClaim is created
# WaitForFirstConsumer mode will delay the binding and provisioning of a PersistentVolume
# until a Pod using the PersistentVolumeClaim is created
volumeBindingMode: WaitForFirstConsumer
# allowedTopologies helps scheduling pod on worker nodes which matches all of below expressions
# If enableCustomTopology is set to true in helm values.yaml, then do not specify allowedTopologies
allowedTopologies:
  - matchLabelExpressions:
      - key: csi-isilon.dellemc.com/<ISILON_IP>
        values:
          - csi-isilon.dellemc.com

mountOptions: ["<mountOption1>", "<mountOption2>", ..., "<mountOptionN>"]
```
For additional information, see the [Kubernetes Topology documentation](https://kubernetes-csi.github.io/docs/topology.html).

## Support for Docker EE

The CSI Driver for Dell EMC PowerScale supports Docker EE and deployment on clusters bootstrapped with UCP (Universal Control Plane) 3.3.5.
*UCP version 3.3.5 supports kubernetes 1.20 and CSI driver can be installed on UCP 3.3.5 with Helm.

The installation process for the driver on such clusters remains the same as the installation process on upstream clusters.

On UCP based clusters, kubectl may not be installed by default, it is important that [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) is installed prior to the installation of the driver.

The worker nodes in UCP backed clusters may run any of the OSs which we support with upstream clusters.

## Support custom networks for NFS I/O traffic

When allowedNetworks is specified for using custom networks to handle NFS traffic, and a user already
has workloads scheduled, there is a possibility that it might lead to backwards compatibility issues. For example, ControllerUnPublish might not be able to completely remove clients from the NFS exports of previously created pods.
Also, previous workload will still be using default network and not custom networks, for previous workloads
to use custom networks recreation of pods required.

## Node IP ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nodeip-cfg
  namespace: isilon
data:
  entrypoint.sh.erb: |
    #!/bin/sh
    export X_CSI_NODE_IP=<%= %x@ip -4 addr show dev <custom_interface_name> | grep inet@[/inet\s+(\d+(\.\d+){3})/,1] %>
    exec "/csi-isilon"
```
