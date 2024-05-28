---
title: Unity XT
Description: Code features for Unity XT Driver
weight: 1
---

## Creating volumes and consuming them

Create a file `sample.yaml` using sample yaml files located at test/sample.yaml

The following command creates a statefulset that consumes three volumes of default storage classes:

```bash
kubectl create -f test/sample.yaml
```

After executing this command 3 PVC and statefulset are created in the `unity` namespace.
You can check created PVCs by running `kubectl get pvc -n unity` and check statefulset's pods by running `kubectl get pods -n unity` command.
The pod should be `Ready` and `Running`.

> If Pod is in CrashLoopback or PVCs is in a Pending state then driver installation is not successful, check logs of node and controller.

## Deleting volumes

To delete volumes, pod and statefulset run the command

```bash
kubectl delete -f test/sample.yaml
```

## Consuming existing volumes with static provisioning

You can use existent volumes from Unity XT array as Persistent Volumes in your Kubernetes, to do that you must perform the following steps:

1. Open your volume in Unity XT Management UI (Unisphere), and take a note of volume-id. The `volume-id` looks like `csiunity-xxxxx` and CLI ID looks like `sv_xxxx`.
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

In order to use Volume Snapshots, ensure the following components have been deployed to your cluster:
- Kubernetes Volume Snapshot CRDs
- Volume Snapshot Controller

### Volume Snapshot Class

Following is the manifest to create Volume Snapshot Class :

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: unity-snapclass
driver: csi-unity.dellemc.com
deletionPolicy: Delete
```

### Create Volume Snapshot

The following is a sample manifest for creating a Volume Snapshot using the **v1** snapshot APIs:

```yaml
apiVersion: snapshot.storage.k8s.io/v1 
kind: VolumeSnapshot
metadata:
  name: pvol0-snap
  namespace: unity
spec:
  volumeSnapshotClassName: unity-snapclass
  source:
    persistentVolumeClaimName: pvol
```

Once the status of the VolumeSnapshot object has the _readyToUse_ field set to _true_, it is available for use.

Following is the relevant section of VolumeSnapshot object status:

```yaml
status:
  boundVolumeSnapshotContentName: snapcontent-xxxxxxxxxxxxx
  creationTime: "2020-07-16T08:42:12Z"
  readyToUse: true
```
Note : 
A  set of annotated volume snapshot class manifests have been provided in the  [csi-unity/samples/volumesnapshotclass/](https://github.com/dell/csi-unity/tree/main/samples/volumesnapshotclass) folder. Use these samples to create new Volume Snapshot to provision storage.

### Creating PVCs with Volume Snapshots as Source

The following is a sample manifest for creating a PVC with a VolumeSnapshot as a source:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: restorepvc
  namespace: unity
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

The CSI Unity XT driver supports the expansion of Persistent Volumes (PVs). This expansion can be done either online (for example, when a PVC is attached to a node) or offline (for example, when a PVC is not attached to any node).

To use this feature, the storage class that is used to create the PVC must have the attribute `allowVolumeExpansion` set to true.

The following is a sample manifest for a storage class that allows for Volume Expansion:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
    name: unity-expand-sc
    annotations:
        storageclass.kubernetes.io/is-default-class: false
provisioner: csi-unity.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true # Set this attribute to true if you plan to expand any PVCs created using this storage class
parameters:
    csi.storage.k8s.io/fstype: "xfs"
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


## Snapshot Ingestion procedure

The Snapshot Ingestion procedure outlines the steps required to effectively integrate existing snapshots from Unity XT into your Kubernetes cluster. This procedure ensures the seamless acquisition, processing, and utilization of snapshots.
Below are the key steps involved 

1. Create a snapshot for existing volume using Unisphere

2. Create a VolumeSnapshotContent as explained below

  ```yaml
  apiVersion: snapshot.storage.k8s.io/v1
  kind: VolumeSnapshotContent
  metadata:
    name: snap1-content
  spec:
    deletionPolicy: Delete
    driver: csi-unity.dellemc.com
    volumeSnapshotClassName: unity-snapclass
    source:
      snapshotHandle: snap1-<protocol>-<array_id>-<snapshot_id>
    volumeSnapshotRef:
      name: snap1
      namespace: unity
  ```
>Example snapshot handle format: snap1-FC-apm00123456789-3865491234567

3. Create a VolumeSnapshot as explained below

 ```yaml
  apiVersion: snapshot.storage.k8s.io/v1
  kind: VolumeSnapshot
  metadata:
    name: snap1
    namespace: unity
  spec:
    volumeSnapshotClassName: unity-snapclass
    source:
      volumeSnapshotContentName: snap1-content
 ```

4. Create a PersistentVolumeClaim as explained below
```yaml
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: restore-pvc-from-snap
  spec:
    storageClassName: unity-nfs
    dataSource:
      name: snap1
      kind: VolumeSnapshot
      apiGroup: snapshot.storage.k8s.io
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 5Gi
```

## Raw block support

The CSI Unity XT driver supports Raw Block Volumes.
	Raw Block volumes are created using the volumeDevices list in the pod template spec with each entry accessing a volumeClaimTemplate specifying a volumeMode: Block. The following is an example configuration:
	
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

Raw Block volumes support online Volume Expansion, but it is up to the application to manage and reconfigure the file system (if any) to the new size. Access mode ReadOnlyMany is not supported with raw block since we cannot restrict volumes to be readonly from Unity XT.

For additional information, see the [kubernetes](https://kubernetes.io/DOCS/CONCEPTS/STORAGE/PERSISTENT-VOLUMES/#volume-mode) website.


## Volume Cloning Feature

The CSI Unity XT driver supports volume cloning. This allows specifying existing PVCs in the _dataSource_ field to indicate a user would like to clone a Volume.

Source and destination PVC must be in the same namespace and have the same Storage Class.

To clone a volume, you should first have an existing PVC, example: vol0:

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: vol0
  namespace: unity
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
  namespace: unity
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

The CSI Unity XT driver supports ephemeral inline CSI volumes. This feature allows CSI volumes to be specified directly in the pod specification. 

At runtime, nested inline volumes follow the ephemeral lifecycle of their associated pods where the driver handles all phases of volume operations as pods are created and destroyed.

The following is a sample manifest for creating ephemeral volume in pod manifest with CSI Unity XT driver.

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
        arrayId: APM************
        protocol: iSCSI
        thinProvisioned: "true"
        isDataReductionEnabled: "false"
        tieringPolicy: "1"
        storagePool: pool_2
```

This manifest creates a pod and attaches a newly created ephemeral inline CSI volume to it. 

To create `NFS` volume you need to provide `nasName:` parameters that point to the name of your NAS Server in pod manifest like so

```yaml
  volumes:
  - name: volume
    csi:
      driver: csi-unity.dellemc.com
      csi.storage.k8s.io/fstype: "nfs"
      volumeAttributes:
        size: "20Gi"
        nasName: "csi-nas-name"
```

## Controller HA

The CSI Unity XT driver supports controller HA feature. Instead of StatefulSet controller pods deployed as a Deployment.

By default, the number of replicas is set to 2. You can set the controllerCount parameter to 1 in myvalues.yaml if you want to disable controller HA for your installation. When installing via Operator, you can change the replicas parameter in the spec.driver section in your Unity XT Custom Resource.

When multiple replicas of controller pods are in a cluster each sidecar (Attacher, Provisioner, Resizer, and Snapshotter) tries to get a lease so only one instance of each sidecar is active in the cluster at a time. 

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

As said before you can configure where node driver pods would be assigned in a similar way in the `node` section of `myvalues.yaml`

## Topology

The CSI Unity XT driver supports Topology which forces volumes to be placed on worker nodes that have connectivity to the backend storage. This covers use cases where users have chosen to restrict the nodes on which the CSI driver is deployed.

This Topology support does not include customer-defined topology, users cannot create their own labels for nodes, they should use whatever labels are returned by the driver and applied automatically by Kubernetes on its nodes.

### Topology Usage

User can create custom storage classes on their own by specifying the valid topology keys and binding mode.

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

This example matches all nodes where the driver has a connection to the Unity XT array with array ID mentioned via Fiber Channel. Similarly, by replacing `fc` with `iscsi` in the key checks for iSCSI connectivity with the node.

You can check what labels your nodes contain by running `kubectl get nodes --show-labels` command.

>Note that `volumeBindingMode:` is set to `WaitForFirstConsumer` this is required for the topology feature to work properly.

For any additional information about the topology, see the [Kubernetes Topology documentation](https://kubernetes-csi.github.io/docs/topology.html).

## Volume Limit
The CSI Driver for Dell Unity XT allows users to specify the maximum number of Unity XT volumes that can be used in a node.

The user can set the volume limit for a node by creating a node label `max-unity-volumes-per-node` and specifying the volume limit for that node.
<br/> `kubectl label node <node_name> max-unity-volumes-per-node=<volume_limit>`

The user can also set the volume limit for all the nodes in the cluster by specifying the same to `maxUnityVolumesPerNode` attribute in values.yaml file.

>**NOTE:** <br>To reflect the changes after setting the value either via node label or in values.yaml file, user has to bounce the driver controller and node pods using the command `kubectl get pods -n unity --no-headers=true | awk '/unity-/{print $1}'| xargs kubectl delete -n unity pod`. <br><br> If the value is set both by node label and values.yaml file then node label value will get the precedence and user has to remove the node label in order to reflect the values.yaml value. <br><br>The default value of `maxUnityVolumesPerNode` is 0. <br><br>If `maxUnityVolumesPerNode` is set to zero, then Container Orchestration decides how many volumes of this type can be published by the controller to the node.<br><br>The volume limit specified to `maxUnityVolumesPerNode` attribute is applicable to all the nodes in the cluster for which node label `max-unity-volumes-per-node` is not set.

## NAT Support
CSI Driver for Dell Unity XT is supported in the NAT environment for NFS protocol.

The user will be able to install the driver and able to create pods.

**NOTE:** On Unity, management port does not support NAT. NAT needs to be disabled on the Unity array's management network.

## Single Pod Access Mode for PersistentVolumes- ReadWriteOncePod 

Use `ReadWriteOncePod(RWOP)` access mode if you want to ensure that only one pod across the whole cluster can read that PVC or write to it. This is only supported for CSI Driver for Unity 2.1.0+ and Kubernetes version 1.22+.

### Creating a PersistentVolumeClaim
```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
name: single-writer-only
spec:
accessModes:
- ReadWriteOncePod # Allow only a single pod to access single-writer-only.
resources:
requests:
  storage: 1Gi
```

When this feature is enabled, the existing `ReadWriteOnce(RWO)` access mode restricts volume access to a single node and allows multiple pods on the same node to read from and write to the same volume.

To migrate existing PersistentVolumes to use `ReadWriteOncePod`, please follow the instruction from [here](https://kubernetes.io/docs/tasks/administer-cluster/change-pv-access-mode-readwriteoncepod/).

## Volume Health Monitoring
CSI Driver for Unity XT supports volume health monitoring. This is an alpha feature and requires feature gate to be enabled by setting command line arguments 
```bash
--feature-gates="...,CSIVolumeHealth=true"
```  
This feature:
1. Reports on the condition of the underlying volumes via events when a volume condition is abnormal. We can watch the events on the describe of pvc 
    ```bash
    kubectl describe pvc <pvc name> -n <namespace>
    ```
2. Collects the volume stats. We can see the volume usage in the node logs 
    ```bash
    kubectl logs <nodepod> -n <namespacename> -c driver
    ```
By default this is disabled in CSI Driver for Unity XT. You will have to set the `healthMonitor.enable` flag for controller, node or for both in `values.yaml` to get the volume stats and volume condition.

## Storage Capacity Tracking
CSI for Unity XT driver version 2.8.0 and above supports Storage Capacity Tracking.

This feature helps the scheduler to make more informed choices about where to schedule pods which depends on unbound volumes with late binding (aka "wait for first consumer"). Pods will be scheduled on a node (satisfying the topology constraints) only if the requested capacity is available on the storage array.
If such a node is not available, the pods stay in Pending state. This means pods are not scheduled.

Without storage capacity tracking, pods get scheduled on a node satisfying the topology constraints. If the required capacity is not available, volume attachment to the pods fails, and pods remain in ContainerCreating state. Storage capacity tracking eliminates unnecessary scheduling of pods when there is insufficient capacity. Moreover, storage capacity tracking returns `MaximumVolumeSize` parameter, which may be used as an input to the volume creation. 

The attribute `storageCapacity.enabled` in `values.yaml` can be used to enable/disable the feature during driver installation using helm. This is by default set to true. To configure how often driver checks for changed capacity set `storageCapacity.pollInterval` attribute. In case of driver installed via operator, this interval can be configured in the sample file provided [here.](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_unity_v280.yaml) by editing the `--capacity-poll-interval` argument present in the provisioner sidecar.

## Dynamic Logging Configuration

### Helm based installation
As part of driver installation, a ConfigMap with the name `unity-config-params` is created, which contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of CSI driver. 

Users can set the default log level by specifying log level to `logLevel` attribute in values.yaml during driver installation.

To change the log level dynamically to a different value user can edit the same values.yaml, and run the following command
```bash
cd dell-csi-helm-installer
./csi-install.sh --namespace unity --values ./myvalues.yaml --upgrade
```

Note: myvalues.yaml is a values.yaml file which user has used for driver installation.  


### Operator based installation
As part of driver installation, a ConfigMap with the name `unity-config-params` is created using the manifest located in the sample file. This ConfigMap contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver. To set the default/initial log level user can set this field during driver installation.

To update the log level dynamically user has to edit the ConfigMap `unity-config-params` and update `CSI_LOG_LEVEL` to the desired log level.
```bash
kubectl edit configmap -n unity unity-config-params
```  

## Tenancy support for Unity XT NFS

The CSI Unity XT driver supports the Tenancy feature of Unity XT that allows the user to associate specific worker nodes (in the cluster) and NFS storage volumes with Tenant.

Prerequisites (to be manually created in Unity XT Array) before the driver installation:
* Create Tenants
* Create Pools
* Create NAS Servers with Tenant and Pool mapping

The following example describes the usage of Tenant in the NFS pod creation:

Install the csi driver using myvalues.yaml with the TenantName as follows:
Example *myvalues.yaml*   
```yaml
logLevel: "info"
certSecretCount: 1
kubeletConfigDir: /var/lib/kubelet
controller:
    controllerCount: 2
    volumeNamePrefix : csivol
snapshot:
    snapNamePrefix: csi-snap
tenantName: "tenant3"
```

Create storageclass with NAS-Server and the Storage-Pool associated with TenantName as follows:
Example *storageclass.yaml*   
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
    annotations:
        storageclass.kubernetes.io/is-default-class: "false"
    name: unity-nfs
parameters:
    arrayId: "APM0***XXXXXX"
    hostIoSize: "16384"
    isDataReductionEnabled: "false"
    storagePool: pool_7
    thinProvisioned: "true"
    tieringPolicy: "0"
    protocol: "NFS"
    nasServer: "nas_5"
    provisioner: csi-unity.dellemc.com
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    allowVolumeExpansion: true
```

Create the pod and pvc as follows:
Example *pvc.yaml*
```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
    name: pvcname
    namespace: nginx
spec:
    accessModes:
    - ReadWriteOnce
 	volumeMode: Filesystem
 	resources:
  		requests:
  		storage: 2Gi
  	storageClassName: unity-nfs
```

Example *pod.yaml*
```yaml
apiVersion: apps/v1
kind: Deployment
metadata: 
  name: podname
  namespace: nginx
spec: 
  replicas: 1
  selector: 
    matchLabels: 
      app: podname
  template: 
    metadata: 
      labels: 
        app: podname
    spec: 
      containers: 
        - 
          args: 
            - "-c"
            - "while true; do dd if=/dev/urandom of=/data0/foo bs=1M count=1;done"
          command: 
            - /bin/bash
          image: "docker.io/centos:latest"
          name: test
          volumeMounts: 
            - 
              mountPath: /data0
              name: pvcname
      volumes: 
        - 
          name: pvolx0
          persistentVolumeClaim: 
            claimName: pvcname
```

With the usage shown in the example, the user will be able to create an NFS pod with PVC using the NAS and the Pool associated with the added Tenants specified in SC.
>Note: Current feature supports **ONLY single Tenant** for all the nodes in the cluster.
Users may expect an error if PVC is created from the NAS server whose pool is mapped to the different tenants not associated with this SC.

For operator based installation, mention the TENANT_NAME in configmap as shown in the following example:
Example *configmap.yaml*
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: unity-config-params
  namespace: unity
data:
  driver-config-params.yaml: |
    CSI_LOG_LEVEL: "info"
    ALLOW_RWO_MULTIPOD_ACCESS: "false"
    MAX_UNITY_VOLUMES_PER_NODE: "0"
    SYNC_NODE_INFO_TIME_INTERVAL: "15"
    TENANT_NAME: ""
```
>Note: csi-unity supports Tenancy in multi-array setup, provided the TenantName is the same across Unity XT instances.

## Support custom networks for NFS I/O traffic

When `allowedNetworks` is specified for using custom networks to handle NFS traffic, and a user already
has workloads scheduled, there is a possibility that it might lead to backward compatibility issues. For example, ControllerUnPublish might not be able to completely remove clients from the NFS exports of previously created pods.

Also, the previous workload will still be using the default network and not custom networks. For previous workloads to use custom networks, the recreation of pods is required.

When csi-unity driver creates an NFS export, the traffic flows through the client specified in the export. By default, the client is the network interface for Kubernetes
communication (same IP/fqdn as k8s node) by default.

For a cluster with multiple network interfaces and if a user wants to segregate k8s traffic from NFS traffic; you can use the `allowedNetworks` option.
`allowedNetworks` takes CIDR addresses as a parameter to match the IPs to be picked up by the driver to allow and route NFS traffic.
