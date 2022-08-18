---
title: PowerScale
Description: Code features for PowerScale Driver
weight: 1
---

## Multicluster support

You can connect a single CSI-PowerScale driver with multiple PowerScale clusters.

**Pre-Requisites:**

1. Creation of secret.yaml with credentials related to one or more Clusters.
2. Creation of (at least) one Storage class for each cluster.
3. Creation of custom-volumesnapshot classes with proper isiPath matching corresponding storage classes.
4. Inclusion of cluster name in volume handle, if you want to provision existing static volumes.

## Consuming existing volumes with static provisioning

You can use existent volumes from the PowerScale array as Persistent Volumes in your Kubernetes, perform the following steps:

1. Open your volume in One FS, and take a note of volume-id.
2. Create PersistentVolume and use this volume-id as a volumeHandle in the manifest. Modify other parameters according to your needs.
3. In the following example, the PowerScale cluster accessZone is assumed as 'System', storage class as 'isilon', cluster name as 'pscale-cluster' and volume's internal name as 'isilonvol'. The volume-handle should be in the format of <volume_name>=_=_=<export_id>=_=_=<zone>=_=_=<cluster_name>
4. If Quotas are enabled in the driver, it is recommended to add the Quota ID to the description of the NFS export in the following format: 
`CSI_QUOTA_ID:sC-kAAEAAAAAAAAAAAAAQEpVAAAAAAAA`
5. Quota ID can be identified by quering the PowerScale system.

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

## PVC Creation Feature

Following yaml content can be used to create a PVC without referring any PV.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: testvolume
  namespace: default
spec:
  accessModes:
  - ReadWriteMany
  resources:
        requests:
          storage: 5Gi
  storageClassName: isilon           
```

## Volume Snapshot Feature

The CSI PowerScale driver version 2.0 and later supports managing v1 snapshots. 

In order to use Volume Snapshots, ensure the following components have been deployed to your cluster:

- Kubernetes Volume Snapshot CRDs
- Volume Snapshot Controller

> For general use, update the snapshot controller YAMLs with an appropriate namespace before installing. For
> example, on a Vanilla Kubernetes cluster, update the namespace from default to kube-system before issuing the
> kubectl create command.

### Volume Snapshot Class

During the installation of CSI PowerScale driver version 2.0 and higher, no default Volume Snapshot Class will get created.

Following are the manifests for the Volume Snapshot Class:

1. VolumeSnapshotClass 
```yaml

apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: "isilon-snapclass"
driver: csi-isilon.dellemc.com
#The deletionPolicy of a volume snapshot class can either be Retain or Delete
#If the deletionPolicy is Delete, then the underlying storage snapshot is deleted along with the VolumeSnapshotContent object.
#If the deletionPolicy is Retain, then both the underlying snapshot and VolumeSnapshotContent remain
deletionPolicy: Delete
parameters:
  #IsiPath should match with respective storageClass IsiPath
  IsiPath: "/ifs/data/csi"
```

The following is a sample manifest for creating a Volume Snapshot using the **v1** snapshot APIs; The following snippet assumes that the persistent volume claim name is testvolume.

```yaml  
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: pvcsnap
  namespace: default
spec:
  volumeSnapshotClassName: isilon-snapclass
  source:
    persistentVolumeClaimName: testvolume
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
    name: pvcsnap
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 5Gi
```

> Starting from CSI PowerScale driver version 2.2, it is allowed to create PersistentVolumeClaim from VolumeSnapshot with different isi paths i.e., isi paths of the new volume and the VolumeSnapshot can be different.

## Volume Expansion

The CSI PowerScale driver version 1.2 and later supports the expansion of Persistent Volumes (PVs). This expansion can be done either online (for example, when a PVC is attached to a node) or offline (for example, when a PVC is not attached to any node).

To use this feature, the storage class that is used to create the PVC must have the attribute `allowVolumeExpansion` set to true.

The following is a sample manifest for a storage class that allows for Volume Expansion:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: isilon-expand-sc
  annotations:
    storageclass.kubernetes.io/is-default-class: "false"
provisioner: "csi-isilon.dellemc.com"
reclaimPolicy: Delete
parameters:
  ClusterName: <clusterName specified in secret.yaml>
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
    name: isilon-pvc-expansion-demo
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

To clone a volume, you must first have an existing PVC:

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

Additionally by leveraging `pod anti-affinity`, no two-controller pods are ever scheduled on the same node.

To increase or decrease the number of controller pods, edit the following value in `myvalues.yaml` file:
```
controllerCount: 2
```

>**NOTE:** The default value for controllerCount is 2. It is recommended to not change this unless really required. Also, if the controller count is greater than the number of available nodes (where the pods can be scheduled), some controller pods will remain in a Pending state.

If you are using the `dell-csi-operator`, adjust the following value in your Custom Resource manifest
```
replicas: 2  
```
For more details about configuring Controller HA using the Dell CSI Operator, refer to the [Dell CSI Operator documentation](../../installation/operator/#custom-resource-specification).

## Ephemeral Inline Volume

The CSI PowerScale driver version 1.4.0 and later supports CSI ephemeral inline volumes.

This feature serves as use cases for data volumes whose content and lifecycle are tied to a pod. For example, a driver might populate a volume with dynamically created secrets that are specific to the application running in the pod. Such volumes need to be created together with a pod and can be deleted as part of pod termination (ephemeral). They get defined as part of the pod spec (inline).
 
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

This manifest creates a pod in a given cluster and attaches a newly created ephemeral inline CSI volume to it.

## Topology
### Topology Support

The CSI PowerScale driver version 1.4.0 and later supports Topology by default which forces volumes to be placed on worker nodes that have connectivity to the backend storage, as a result of which the nodes which have access to PowerScale Array are appropriately labeled. The driver leverages these labels to ensure that the driver components (controller, node) are spawned only on nodes wherein these labels exist. 
  
This covers use cases where:
 
The CSI PowerScale driver may not be installed or running on some nodes where Users have chosen to restrict the nodes on accessing the PowerScale storage array. 

We support CustomTopology which enables users to apply labels for nodes - "csi-isilon.dellemc.com/XX.XX.XX.XX=csi-isilon.dellemc.com" and expect the labels to be honored by the driver.
  
When “enableCustomTopology” is set to “true”, the CSI driver fetches custom labels “csi-isilon.dellemc.com/XX.XX.XX.XX=csi-isilon.dellemc.com” applied on worker nodes, and use them to initialize node pod with custom PowerScale FQDN/IP.

**Note:** Only a single cluster can be configured as part of secret.yaml for custom topology.


### Topology Usage
   
To utilize the Topology feature, create a custom `StorageClass` with `volumeBindingMode` set to `WaitForFirstConsumer` and specify the desired topology labels within `allowedTopologies` field of this custom storage class. This ensures that the Pod schedule takes advantage of the topology and the selected node has access to provisioned volumes. 

**Note:** Whenever a new storage cluster is being added in secret, even though it is dynamic, the new storage cluster IP address-related label is not added to worker nodes dynamically. The user has to spin off (bounce) driver-related pods (controller and node pods) in order to apply newly added information to be reflected in worker nodes.
  
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
# allowedTopologies helps scheduling pod on worker nodes which match all of below expressions
# If enableCustomTopology is set to true in helm values.yaml, then do not specify allowedTopologies
allowedTopologies:
  - matchLabelExpressions:
      - key: csi-isilon.dellemc.com/<ISILON_IP>
        values:
          - csi-isilon.dellemc.com
# specify additional mount options for when a Persistent Volume is being mounted on a node.
# To mount volume with NFSv4, specify mount option vers=4. Make sure NFSv4 is enabled on the Isilon Cluster.
mountOptions: ["<mountOption1>", "<mountOption2>", ..., "<mountOptionN>"]
```
For additional information, see the [Kubernetes Topology documentation](https://kubernetes-csi.github.io/docs/topology.html).

## Support custom networks for NFS I/O traffic

When allowedNetworks is specified for using custom networks to handle NFS traffic, and a user already
has workloads scheduled, there is a possibility that it might lead to backward compatibility issues. For example, ControllerUnPublish might not be able to completely remove clients from the NFS exports of previously created pods.

Also, the previous workload will still be using the default network and not custom networks. For previous workloads to use custom networks, the recreation of pods is required.

When csi-powerscale driver creates an NFS export, the traffic flows through the client specified in the export. By default, the client is the network interface for Kubernetes 
communication (same IP/fqdn as k8s node) by default.

For a cluster with multiple network interfaces and if a user wants to segregate k8s traffic from NFS traffic; you can use the `allowedNetworks` option.
`allowedNetworks` takes CIDR addresses as a parameter to match the IPs to be picked up by the driver to allow and route NFS traffic.


## Volume Limit
The CSI Driver for Dell PowerScale allows users to specify the maximum number of PowerScale volumes that can be used in a node.

The user can set the volume limit for a node by creating a node label `max-isilon-volumes-per-node` and specifying the volume limit for that node.
<br/> `kubectl label node <node_name> max-isilon-volumes-per-node=<volume_limit>`

The user can also set the volume limit for all the nodes in the cluster by specifying the same to `maxIsilonVolumesPerNode` attribute in values.yaml.

>**NOTE:** <br>The default value of `maxIsilonVolumesPerNode` is 0. <br>If `maxIsilonVolumesPerNode` is set to zero, then CO shall decide how many volumes of this type can be published by the controller to the node.<br><br>The volume limit specified to `maxIsilonVolumesPerNode` attribute is applicable to all the nodes in the cluster for which node label `max-isilon-volumes-per-node` is not set.

## Node selector in helm template

Now user can define in which worker node, the CSI node pod daemonset can run (just like any other pod in Kubernetes world.)For more information, refer to https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector 
  
Similarly, users can define the tolerations based on various conditions like memory pressure, disk pressure and network availability. Refer to https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/#taints-and-tolerations for more information.  

## Usage of SmartQuotas to Limit Storage Consumption

CSI driver for Dell Isilon handles capacity limiting using SmartQuotas feature.

To use the SmartQuotas feature user can specify the boolean value 'enableQuota' in myvalues.yaml or my-isilon-settings.yaml.

Let us assume the user creates a PVC with 3 Gi of storage and 'SmartQuotas' have already been enabled in PowerScale Cluster.

- When 'enableQuota' is set to 'true'
    - The driver sets the hard limit of the PVC to 3Gi.
    - The user adds data of 2Gi to the above said PVC (by logging into POD). It works as expected.
    - The user tries to add 2Gi more data.
    - Driver doesn't allow the user to enter more data as total data to be added is 4Gi and PVC limit is 3Gi.
    - The user can expand the volume from 3Gi to 6Gi. The driver allows it and sets the hard limit of PVC to 6Gi.
    - User retries adding 2Gi more data (which has been errored out previously).
    - The driver accepts the data.
    
- When 'enableQuota' is set to 'false'
    - Driver doesn't set any hard limit against the PVC created.
    - The user adds data of 2Gi to the above said PVC, which is having the size 3Gi (by logging into POD). It works as expected.
    - The user tries to add 2Gi more data. Now the total size of data is 4Gi.
    - Driver allows the user to enter more data irrespective of the initial PVC size (since no quota is set against this PVC)
    - The user can expand the volume from an initial size of 3Gi to 4Gi or more. The driver allows it.


## Dynamic Logging Configuration

This feature is introduced in CSI Driver for PowerScale version 1.6.0 and updated in version 2.0.0

### Helm based installation
As part of driver installation, a ConfigMap with the name `isilon-config-params` is created, which contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of CSI driver. 

Users can set the default log level by specifying log level to `logLevel` attribute in values.yaml during driver installation.

To change the log level dynamically to a different value user can edit the same values.yaml, and run the following command
```
cd dell-csi-helm-installer
./csi-install.sh --namespace isilon --values ./my-isilon-settings.yaml --upgrade
```

Note: here my-isilon-settings.yaml is a values.yaml file which user has used for driver installation.  


### Operator based installation
As part of driver installation, a ConfigMap with the name `isilon-config-params` is created using the manifest located in the sample file. This ConfigMap contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver. To set the default/initial log level user can set this field during driver installation.

To update the log level dynamically user has to edit the ConfigMap `isilon-config-params` and update `CSI_LOG_LEVEL` to the desired log level.
```
kubectl edit configmap -n isilon isilon-config-params
```  

>Note: Prior to CSI Driver for PowerScale version 2.0.0, the log level was allowed to be updated dynamically through `logLevel` attribute in the secret object.

## NAT Support

CSI Driver for Dell PowerScale is supported in the NAT environment.

## Configurable permissions for volume directory

This feature is introduced in CSI Driver for PowerScale version 2.0.0

### Helm based installation
The permissions for volume directory can now be configured in 3 ways:

1. Through values.yaml
2. Through secrets
3. Through storage class

```
  # isiVolumePathPermissions: The permissions for isi volume directory path
  # This value acts as a default value for isiVolumePathPermissions, if not specified for a cluster config in secret
  # Allowed values: valid octal mode number
  # Default value: "0777"
  # Examples: "0777", "777", "0755"
  isiVolumePathPermissions: "0777"
```

The permissions present in values.yaml are the default for all cluster config.

If the volume permission is not present in storage class then secrets are considered and if it is not present even in secrets then values.yaml is considered.

>**Note:** <br>For volume creation from source (volume from snapshot/volume from volume) permissions are inherited from source. <br><br>Create myvalues.yaml/my-isilon-settings.yaml and storage class accordingly.

### Operator based installation

In the case of operator-based installation, default permission for powerscale directory is present in the samples file.

Other ways of configuring powerscale volume permissions remain the same as helm-based installation.


## PV/PVC Metrics

CSI Driver for Dell PowerScale 2.1.0 and above supports volume health monitoring. This allows Kubernetes to report on the condition, status and usage of the underlying volumes. 
For example, if a volume were to be deleted from the array, or unmounted outside of Kubernetes, Kubernetes will now report these abnormal conditions as events.

### This feature can be enabled
1. For controller plugin, by setting attribute `controller.healthMonitor.enabled` to `true` in `values.yaml` file. Also health monitoring interval can be changed through attribute `controller.healthMonitor.interval` in `values.yaml` file.   
2. For node plugin, by setting attribute `node.healthMonitor.enabled` to `true` in `values.yaml` file and by enabling the alpha feature gate `CSIVolumeHealth`.

## Single Pod Access Mode for PersistentVolumes- ReadWriteOncePod (ALPHA FEATURE)

Use `ReadWriteOncePod(RWOP)` access mode if you want to ensure that only one pod across the whole cluster can read that PVC or write to it. This is supported for CSI Driver for PowerScale 2.1.0+ and Kubernetes version 1.22+.

To use this feature, enable the ReadWriteOncePod feature gate for kube-apiserver, kube-scheduler, and kubelet, by setting command line arguments:
`--feature-gates="...,ReadWriteOncePod=true"`

### Creating a PersistentVolumeClaim
```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: single-writer-only
spec:
  accessModes:
  - ReadWriteOncePod # the volume can be mounted as read-write by a single pod across the whole cluster
  resources:
    requests:
      storage: 1Gi
```

When this feature is enabled, the existing `ReadWriteOnce(RWO)` access mode restricts volume access to a single node and allows multiple pods on the same node to read from and write to the same volume.

To migrate existing PersistentVolumes to use `ReadWriteOncePod`, please follow the instruction from [here](https://kubernetes.io/blog/2021/09/13/read-write-once-pod-access-mode-alpha/#migrating-existing-persistentvolumes).

