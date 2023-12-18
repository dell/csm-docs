---
title: PowerMax
linktitle: PowerMax 
weight: 1
Description: Code features for PowerMax Driver
---

## Multi Unisphere Support 

Starting with v1.7, the CSI PowerMax driver can communicate with multiple Unisphere for PowerMax servers to manage multiple PowerMax arrays.
In order to use this feature, you must install CSI PowerMax ReverseProxy in `StandAlone` mode with the driver. For more details on how
to configure the driver and ReverseProxy, see the relevant section [here](../../installation/helm/powermax/#sample-values-file)

## Volume Snapshot Feature

The CSI PowerMax driver version 1.7 and later supports v1 snapshots.

In order to use Volume Snapshots, ensure the following components have been deployed to your cluster:
- Kubernetes Volume Snapshot CRDs
- Volume Snapshot Controller
- Volume Snapshot Class

To use this feature, enable it in `values.yaml`

```yaml
snapshot:
  enabled: true
```

>Note: From v1.7, the CSI PowerMax driver installation process will no longer create VolumeSnapshotClass. 
> If you want to create VolumeSnapshots, then create a VolumeSnapshotClass using the sample provided in the _csi-powermax/samples/volumesnapshotclass_ folder

>Note: Snapshots for File in PowerMax is currently not supported. 

### Creating Volume Snapshots
The following is a sample manifest for creating a Volume Snapshot using the **v1** snapshot APIs:
```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: pvol0-snap1
spec:
  volumeSnapshotClassName: powermax-snapclass
  source:
    persistentVolumeClaimName: pvol0

```

After the VolumeSnapshot has been successfully created by the CSI PowerMax driver, a VolumeSnapshotContent object is automatically created. When the status of the VolumeSnapshot object has the _readyToUse_ field set to _true_, it is available for use.

The following is the relevant section of VolumeSnapshot object status:
```yaml
status:
  boundVolumeSnapshotContentName: snapcontent-5a8334d2-eb40-4917-83a2-98f238c4bda
  creationTime: "2020-07-16T08:42:12Z"
  readyToUse: true
```

### Creating PVCs with VolumeSnapshots as Source

The following is a sample manifest for creating a PVC with a VolumeSnapshot as a source:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pmax-restore-pvc-demo
  namespace: test
spec:
  storageClassName: powermax
  dataSource:
    name: pmax-snapshot-demo
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 8Gi
```

### Creating PVCs with PVCs as source

This is a sample manifest for creating a PVC with another PVC as a source:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pmax-clone-pvc-demo
  namespace: test
spec:
  storageClassName: powermax
  dataSource:
    name: pmax-pvc-demo
    kind: PersistentVolumeClaim
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 8Gi
```

## iSCSI CHAP

Starting from version 1.3.0, the unidirectional Challenge Handshake Authentication Protocol (CHAP) for iSCSI has been supported.
To enable CHAP authentication:
1. Create secret `powermax-creds` with the key `chapsecret` set to the iSCSI CHAP secret. If the secret exists, delete and re-create the secret with this newly added key.
2. Set the parameter `enableCHAP` in `my-powermax-settings.yaml` to true.

The driver uses the provided chapsecret to configure the iSCSI node database on each node with iSCSI access.

When the driver is installed and all the node plug-ins have initialized successfully, the storage administrator must enable CHAP authentication using the following Solutions Enabler (SYMCLI) commands:

```bash

symaccess -sid <symid> -iscsi <host iqn> set chap -cred <host IQN> -secret <CHAP secret>
```

Where `host IQN` is the name of the iSCSI initiator of a host IQN, and `CHAP secret` is the chapsecret that is used at the time of the installation of the driver.

*NOTE*: The host IQN is also used as the username when setting up the CHAP credentials.

### CHAP support for PowerMax

With unidirectional CHAP, the PowerMax array challenges the host initiator during the initial link negotiation process and expects to receive a valid credential and CHAP secret in response.

When challenged, the host initiator transmits a CHAP credential and CHAP secret to the storage array. The storage array looks for this credential and CHAP secret which is stored in the host initiator group. When a positive authentication occurs, the PowerMax array sends an acceptance message to the host. However, if the PowerMax array fails to find any record of the credential/secret pair, it sends a rejection message, and the link is closed.

## Custom Driver Name

Starting from version 1.3.0 of the driver, a custom name can be assigned to the driver at the time of installation. This enables installation of the CSI driver in a different namespace and installation of multiple CSI drivers for Dell PowerMax in the same Kubernetes/OpenShift cluster.

To use this feature, set the following values under `customDriverName` in `my-powermax-settings.yaml`.
- Value: Set this to the custom name of the driver.
- Enabled: Set this to true in case you want to enable this feature.
The driver helm chart installation uses the values above to:
- Configure the driver name which is used for communication with other Kubernetes components.
- Configure the provisioner value in the storage class template.
- Configure the snapshotter value in the snapshot class template.

If enabled, the driver name is in the following format: `<namespace>.<driver name>.dellemc.com`

For example, if the driver name is set to _driver_ and it is installed in the namespace _powermax_, then the name that is used for the driver (and the provisioner/snapshotter) is `powermax.driver.dellemc.com`

*NOTE*: If not enabled, the name is set to `csi-powermax.dellemc.com` by default (without any namespace prefix).

### Install multiple drivers

To install multiple CSI Drivers for Dell PowerMax in a single Kubernetes cluster, you can take advantage of the custom driver name feature. There are a few important restrictions that should be strictly adhered to:
- Only one driver can be installed in a single namespace
- Different drivers should not connect to a single Unisphere server
- Different drivers should not be used to manage a single PowerMax array
- Storage class and snapshot class names must be unique across installations

To install multiple CSI drivers, follow these steps:
1. Create (or use) a new namespace.
2. Ensure that all the pre-requisites are met:
    - `powermax-creds` secret is created in this namespace
    - (Optional) `powermax-certs` secret is created in this namespace
3. Update `my-powermax-settings.yaml` with the required values.
4. Run the `csi-install.sh` script to install the driver.

## Volume expansion

Starting in v1.4, the CSI PowerMax driver supports the expansion of Persistent Volumes (PVs). This expansion is done online, which is when the PVC is attached to any node.

To use this feature, enable in `values.yaml`

```yaml
resizer:
  enabled: true
```

To use this feature, the storage class that is used to create the PVC must have the attribute `allowVolumeExpansion` set to `true`.


This is a sample manifest for a storage class that allows for Volume Expansion.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: powermax-expand-sc
  annotations:
    storageclass.kubernetes.io/is-default-class: false
provisioner: csi-powermax.dellemc.com
reclaimPolicy: Delete
allowVolumeExpansion: true #Set this attribute to true if you plan to expand any PVCs
created using this storage class
parameters:
  SYMID: "000000000001"
  SRP: "DEFAULT_SRP"
  ServiceLevel: "Bronze"
```

To resize a PVC, edit the existing PVC spec and set `spec.resources.requests.storage` to the intended size. For example, if you have a PVC - pmax-pvc-demo of size 5 Gi, then you can resize it to 10 Gi by updating the PVC.

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: pmax-pvc-demo
  namespace: test
spec:
  accessModes:
  - ReadWriteOnce
  volumeMode: Filesystem
  resources:
    requests:
      storage: 10Gi #Updated size from 5Gi to 10Gi
  storageClassName: powermax-expand-sc
```
*NOTE*: The Kubernetes Volume Expansion feature can only be used to increase the size of the volume, it cannot be used to shrink a volume.

## Raw block support

Starting in v1.4, the CSI PowerMax driver supports raw block volumes.

Raw Block volumes are created using the volumeDevices list in the Pod template spec with each entry accessing a volumeClaimTemplate specifying a volumeMode: Block. An example configuration is outlined here:

```yaml
kind: StatefulSet
apiVersion: apps/v1
metadata:
  name: powermaxtest
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
        storageClassName: powermax
        resources:
          requests:
            storage: 8Gi
```

Allowable access modes are `ReadWriteOnce`, `ReadWriteMany`, and for block devices that have been previously initialized, `ReadOnlyMany`.

Raw Block volumes are presented as a block device to the Pod by using a bind mount to a block device in the node's file system. The driver does not format or check the format of any file system on the block device. Raw Block volumes support online Volume Expansion, but it is up to the application to manage to reconfigure the file system (if any) to the new size.

For additional information, see the website: [Kubernetes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#raw-block-volume-support)

## CSI PowerMax Reverse Proxy

CSI PowerMax Reverse Proxy application is deployed along with the driver to get the maximum performance out of the CSI driver for PowerMax and Unisphere for PowerMax REST APIs.

CSI PowerMax Reverse Proxy is a (go) HTTPS server that acts as a reverse proxy for the Unisphere for PowerMax RESTAPI interface. Any RESTAPI request sent from the driver to the reverse proxy is forwarded to the Unisphere server and the response is routed back to the driver.

The Reverse Proxy application helps regulate the maximum number of requests which can be sent to the Unisphere RESTAPI at a given time across all driver controller and node Pods. This helps with better queuing of CSI requests and the performance of the CSI PowerMax driver.

Optionally, you can specify an alternate (backup) Unisphere server and if the primary Unisphere server is not reachable or does not respond, the proxy will redirect the calls to this alternate Unisphere.

### Installation

The CSI PowerMax Reverse Proxy can be installed in two ways:
1. It can be installed as a Kubernetes deployment in the same namespace as the driver.
2. It can be installed as a sidecar to the driver's controller Pod.

It is also configured as a Kubernetes "NodePort" service. If the CSI PowerMax driver has been configured to use this service, then it will connect to the IP address and port exposed by the Kubernetes service instead of directly connecting to the Unisphere server.

### Prerequisite

CSI PowerMax Reverse Proxy is an HTTPS server and has to be configured with an SSL certificate and a private key.

The certificate and key are provided to the proxy via a Kubernetes TLS secret (in the same namespace). The SSL certificate must be an X.509 certificate encoded in PEM format. The certificates can be obtained via a Certificate Authority or can be self-signed and generated by a tool such as openssl.

Starting from v2.7.0 , the secrets for proxy will be created automatically using the below tls.key and tls.cert contents provided in values.yaml file.
For this , we need to install cert-manager using below command which manages the certs and secrets  .

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.11.0/cert-manager.yaml
```
Here is an example showing how to generate a private key and use that to sign an SSL certificate using the openssl tool:

```bash
openssl genrsa -out tls.key 2048
openssl req -new -x509 -sha256 -key tls.key -out tls.crt -days 3650
```

### Using Helm installer

In the `my-powermax-settings.yaml` file, the csireverseproxy section can be used to configure the CSI PowerMax Reverse Proxy.

The new Helm chart is configured as a sub chart for the CSI PowerMax helm chart. The install script automatically installs the CSI PowerMax Reverse Proxy and configures the CSI PowerMax driver to use this service.

### Using Dell CSM Operator

For complete installation instructions for the CSI PowerMax driver and the CSI PowerMax Reverse Proxy, see the [Dell CSM Operator documentation](../../../deployment/csmoperator/drivers/powermax/) for PowerMax.

## User-friendly hostnames

Users can set a value for the `nodeNameTemplate` in `my-powermax-settings.yaml` during the installation of the driver so that the driver can use this value to decide the name format of hosts to create or update in the PowerMax array for the nodes in a Kubernetes cluster. The hostname value in nodeNameTemplate should always be contained between two '%' characters. String prefixing first '%' and string suffixing second '%' is used as is before and after every node identifier.

Also, a new setting, `modifyHostName`, can be set to `true` if you want the driver to rename the existing Hosts/IG for the host initiators on the PowerMax array. The new name uses the default naming convention (`csi-<ClusterPrefix>-<HostName>*`) or the `nodeNameTemplate` if it was specified.

For example, if `nodeNameTemplate` is _abc-%foo%-hostname_ and nodename is _worker1_, then the host ID is created or updated as _abc-worker1-hostname_. This change will happen for all nodes in a cluster with the respective node name.

*NOTE*: `nodeNameTemplate` can contain alphanumeric characters [a - z, A - Z, 0 - 9], '-' and '_', other characters are not allowed.

## Controller HA

Starting with version 1.5, the CSI PowerMax driver supports running multiple replicas of the controller Pod. At any time, only one controller Pod is active(leader), and the rest are on standby. In case of a failure, one of the standby Pods becomes active and takes the position of leader. This is achieved by using native leader election mechanisms utilizing `kubernetes leases`. Additionally by leveraging `pod anti-affinity`, no two-controller Pods are ever scheduled on the same node.

To increase or decrease the number of controller Pods, edit the following value in `values.yaml` file:
```yaml
controllerCount: 2
```  
> *NOTE:* The default value for controllerCount is 2. We recommend not changing this unless it is really necessary.
> Also, if the controller count is greater than the number of available nodes (where the Pods can be scheduled), some controller Pods will remain in the Pending state  
   
If you are using the Dell CSM Operator, the value to adjust is: 
```yaml
replicas: 2  
```

For more details about configuring Controller HA using the Dell CSM Operator, see the [Dell CSM Operator documentation](../../../deployment/csmoperator/#custom-resource-specification).

## NodeSelectors and Tolerations

Starting with version 1.5, the CSI PowerMax driver helm installer allows you to specify a set of `nodeSelectors` and `tolerations` which can be applied on the driver controller `Deployment` and driver node `Daemonset`. There are two new sections in the `values` file - `controller` and `node` - where you can specify these values separately for the controller and node Pods. 

### controller

If you want to apply `nodeSelectors` and `tolerations` for the controller Pods, edit the  `controller` section in the `values` file.  

Here are some examples:   
* To schedule controller Pods to worker nodes only (Default):
```yaml
controller:
  nodeSelector:
  tolerations:
```  
* Set the following values for controller Pods to tolerate the taint `NoSchedule` on master nodes:
```yaml
controller:
  nodeSelector:
  tolerations:
   - key: "node-role.kubernetes.io/master"
     operator: "Exists"
     effect: "NoSchedule"
```  
* Set the following values for controller Pods to be scheduled only on nodes labelled `master` (*node-role.kubernetes.io/master*):
```yaml
controller:
  nodeSelector:
     node-role.kubernetes.io/master: ""
  tolerations:
   - key: "node-role.kubernetes.io/master"
     operator: "Exists"
     effect: "NoSchedule"
```
### node
If you want to apply `nodeSelectors` and `tolerations` for the node Pods, edit the  `node` section in the `values` file.  
The `values` file already includes a set of default `tolerations` and you can add and remove tolerations to this list

```yaml
# "node" allows to configure node specific parameters
node:
  # "node.nodeSelector" defines what nodes would be selected for Pods of node daemonset
  # Leave as blank to use all nodes
  nodeSelector:
  #   node-role.kubernetes.io/master: ""

  # "node.tolerations" defines tolerations that would be applied to node daemonset
  # Add/Remove tolerations as per requirement
  # Leave as blank if you wish to not apply any tolerations
  tolerations:
    - key: "node.kubernetes.io/memory-pressure"
      operator: "Exists"
      effect: "NoExecute"
    - key: "node.kubernetes.io/disk-pressure"
      operator: "Exists"
      effect: "NoExecute"
    - key: "node.kubernetes.io/network-unavailable"
      operator: "Exists"
      effect: "NoExecute"
```

## Topology Support

Starting from version 1.5, the CSI PowerMax driver supports topology-aware volume provisioning which helps the Kubernetes scheduler place PVCs on worker nodes that have access to the backend storage. When used with `nodeSelectors` which can be specified for the driver node Pods, it provides an effective way to provision applications on nodes that have access to the PowerMax array.

After a successful installation of the driver, if a node Pod is running successfully on a worker node, the following topology keys are created for a specific PowerMax array:
* `csi-powermax.dellemc.com/\<array-id\>`
* If the worker node has Fibre Channel connectivity to the PowerMax array -
`csi-powermax.dellemc.com/\<array-id\>.fc`
* If the worker node has ISCSI connectivity to the PowerMax array -
`csi-powermax.dellemc.com/\<array-id\>.iscsi`

The values for all these keys are always set to the name of the provisioner which is usually `csi-powermax.dellemc.com`.

Starting from version 2.3.0, topology keys have been enhanced to filter out arrays, associated transport protocol available to each node and create topology keys based on any such user input.

### Topology Usage
To use the Topology feature, the storage classes must be modified as follows:  
* _volumeBindingMode_ must be set to `WaitForFirstConsumer`
* _allowedTopologies_ should be set to one or more topology keys described in the previous section

For example, a PVC created using the following storage class will **always** be scheduled on nodes which have FC connectivity to the PowerMax array `000000000001`
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: powermax-fc
parameters:
  SRP: "SRP_1"
  SYMID: "000000000001"
  ServiceLevel: <Service Level> #Insert Service Level Name
provisioner: csi-powermax.dellemc.com 
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
allowedTopologies:
- matchLabelExpressions:
  - key: csi-powermax.dellemc.com/000000000001
    values:
    - csi-powermax.dellemc.com
  - key: csi-powermax.dellemc.com/000000000001.fc
    values:
    - csi-powermax.dellemc.com
```

In the above example, if you remove the entry for the key `csi-powermax.dellemc.com/000000000001.fc`, then the PVCs created using this storage class will be scheduled
on any worker node with access to the PowerMax array `000000000001` irrespective of the transport protocol

> A set of sample storage class definitions to enable topology-aware volume provisioning has been provided in the `csi-powermax/samples/storageclass` folder 

For additional information on how to use _Topology aware Volume Provisioning_, see the [Kubernetes Topology documentation](https://kubernetes-csi.github.io/docs/topology.html).

### Custom Topology keys
To use the enhanced topology keys:
1. To use this feature, set node.topologyControl.enabled to true.
2. Edit the config file [topologyConfig.yaml](https://github.com/dell/csi-powermax/blob/main/samples/configmap/topologyConfig.yaml) in `csi-powermax/samples/configmap` folder and provide values for the following parameters.

| Parameter | Description  |  
|-----------|--------------|
| allowedConnections | List of node, array and protocol info for user allowed configuration |  
| allowedConnections.nodeName | Name of the node on which user wants to apply given rules |
| allowedConnections.rules | List of StorageArrayID:TransportProtocol pair |
| deniedConnections | List of node, array and protocol info for user denied configuration |  
| deniedConnections.nodeName | Name of the node on which user wants to apply given rules  |
| deniedConnections.rules | List of StorageArrayID:TransportProtocol pair |

<br>

**Sample config file:** 

```yaml
# allowedConnections contains a list of (node, array and protocol) info for user allowed configuration
# For any given storage array ID and protocol on a Node, topology keys will be created for just those pair and
# every other configuration is ignored
# Please refer to the doc website about a detailed explanation of each configuration parameter
# and the various possible inputs
allowedConnections:
  # nodeName: Name of the node on which user wants to apply given rules
  # Allowed values:
  # nodeName - name of a specific node
  # * -  all the nodes
  # Examples: "node1", "*"
  - nodeName: "node1"
    # rules is a list of 'StorageArrayID:TransportProtocol' pair. ':' is required between both value
    # Allowed values:
    # StorageArrayID:
    #   - SymmetrixID : for specific storage array
    #   - "*" :- for all the arrays connected to the node
    # TransportProtocol:
    #   - FC : Fibre Channel protocol
    #   - ISCSI : iSCSI protocol
    #   - "*" - for all the possible Transport Protocol
    # Examples: "000000000001:FC", "000000000002:*", "*:FC", "*:*"
    rules:
      - "000000000001:FC"
      - "000000000002:FC"
  - nodeName: "*"
    rules:
      - "000000000002:FC"
# deniedConnections contains a list of (node, array and protocol) info for denied configurations by user
# For any given storage array ID and protocol on a Node, topology keys will be created for every other configuration but
# not these input pairs
deniedConnections:
  - nodeName: "node2"
    rules:
      - "000000000002:*"
  - nodeName: "node3"
    rules:
      - "*:*"
```

3. Use the below command to create ConfigMap with configmap name as `node-topology-config` in the namespace powermax,  

  ```bash
  
  kubectl create configmap node-topology-config --from-file=topologyConfig.yaml -n powermax
  ```

For example, let there be 3 nodes and 2 arrays, so based on the sample config file above, topology keys will be created as below:

New Topology keys
N1: csi-driver/000000000001.FC:csi-driver, csi-driver/000000000002.FC:csi-driver
<br>
N2 and N3: None 


>Note: Name of the configmap should always be `node-topology-config`.


## Dynamic Logging Configuration

This feature is introduced in CSI Driver for PowerMax version 2.0.0. 

### Helm based installation
As part of driver installation, a ConfigMap with the name `powermax-config-params` is created, which contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of CSI driver. 

Users can set the default log level by specifying log level to `logLevel` attribute in my-powermax-settings.yaml during driver installation.

To change the log level dynamically to a different value, the user can edit the same my-powermax-settings.yaml, and run the following command
```bash
cd dell-csi-helm-installer
./csi-install.sh --namespace powermax --values ./my-powermax-settings.yaml --upgrade
```

Note: my-powermax-settings.yaml is a values.yaml file which the user has used for driver installation.  


### Operator based installation
As part of driver installation, a ConfigMap with the name `powermax-config-params` is created using the manifest located in the sample file. This ConfigMap contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver. To set the default/initial log level the user can set this field during driver installation.

To update the log level dynamically, the user has to edit the ConfigMap `powermax-config-params` and update `CSI_LOG_LEVEL` to the desired log level.
```bash
kubectl edit configmap -n powermax powermax-config-params
```  

## Volume Health Monitoring

CSI Driver for Dell PowerMax 2.2.0 and above supports volume health monitoring. To enable Volume Health Monitoring from the node side, the alpha feature gate CSIVolumeHealth needs to be enabled. To use this feature, set controller.healthMonitor.enabled and node.healthMonitor.enabled to true. To change the monitor interval, set controller.healthMonitor.interval parameter.

## Single Pod Access Mode for PersistentVolumes- ReadWriteOncePod (ALPHA FEATURE)

Use `ReadWriteOncePod(RWOP)` access mode if you want to ensure that only one pod across the whole cluster can read that PVC or write to it. This is only supported for CSI Driver for PowerMax 2.2.0+ and Kubernetes version 1.22+.

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
  
## Support for auto RDM for vSphere over FC
  
CSI Driver for Dell PowerMax 2.5.0 and above supports auto RDM for vSphere over FC.

This feature supports volume provisioning on Kubernetes clusters running on vSphere (VMware hypervisor) via RDM mechanism. This feature enables the users to use PMAX CSI drivers with VMs on vSphere Hypervisor with the same feature and functionality as there with bare metal servers when they have only FC ports in PMAX storage.

It will be supported only on new/freshly installed clusters where the cluster is exclusively deployed in a virtualized vSphere environment. Having hybrid topologies like ISCSI or FC (in pass-through) is not supported.  

To use this feature
- Set `vSphere.enabled` to true.
- Create a secret which contains vCenter privileges. Follow the steps [here](../../installation/helm/powermax/#auto-rdm-for-vsphere-over-fc-requirements) to create it. Update `vCenterCredSecret` with the secret name created.
  
```yaml
 VMware/vSphere virtualization support
# set enable to true, if you to enable VMware virtualized environment support via RDM
# Allowed Values:
#   "true" - vSphere volumes are enabled
#   "false" - vSphere volumes are disabled
# Default value: "false"
vSphere:
  enabled: false
  # fcPortGroup: an existing portGroup that driver will use for vSphere
  # recommended format: csi-x-VC-PG, x can be anything of user choice
  fcPortGroup: "csi-vsphere-VC-PG"
  # fcHostGroup: an existing host(initiator group) that driver will use for vSphere
  # this hostGroup should contain initiators from all the ESXs/ESXi host
  # where the cluster is deployed
  # recommended format: csi-x-VC-HG, x can be anything of user choice
  fcHostGroup: "csi-vsphere-VC-HG"
  # vCenterHost: URL/endpoint of the vCenter where all the ESX are present
  vCenterHost: "00.000.000.01"
  # vCenterCredSecret: secret name for the vCenter credentials
  vCenterCredSecret: vcenter-creds  
```
  
>Note: Replication is not supported with this feature.
>Limitations of RDM can be referred [here.](https://configmax.esp.vmware.com/home)  
>Supported number of RDM Volumes per VM is 60 as per the limitations.
>RDMs should not be added/removed manually from vCenter on any of the cluster VMs.

## Storage Capacity Tracking

CSI PowerMax driver version 2.8.0 and above supports Storage Capacity Tracking.

This feature helps the scheduler to make more informed choices about where to start pods that depend on unbound volumes with late binding (aka “wait for first consumer”). Nodes satisfying the topology constraints, and with the requested capacity that is present on the storage array, will be available for scheduling the pods, Otherwise, the pods stay in pending state. External-provisioner makes one GetCapacity() call per storage class that is present on the cluster to get the AvailableCapacity for the array specified in the storage class that matches with the array mentioned during driver deployment.

Without storage capacity tracking, pods get scheduled on a node satisfying the topology constraints. If the required capacity is not available, volume attachment to the pods fails, and pods remain in the ContainerCreating state. Storage capacity tracking eliminates unnecessary scheduling of pods when there is insufficient capacity.

Storage capacity can be tracked by setting the attribute `storageCapacity.enabled` to true in values.yaml (set to true by default) during driver installation. To configure how often driver checks for changed capacity, set the `storageCapacity.pollInterval` attribute (set to 5m by default). In case of driver installed via operator, this interval can be configured in the sample file provided [here.](https://github.com/dell/csm-operator/blob/main/samples) by editing the `--capacity-poll-interval` argument present in the provisioner sidecar.



## Volume Limits

The CSI Driver for Dell PowerMax allows users to specify the maximum number of PowerMax volumes that can be created on a node.

The user can set the volume limit for a node by creating a node label `max-powermax-volumes-per-node` and specifying the volume limit for that node.
<br/> `kubectl label node <node_name> max-powermax-volumes-per-node=<volume_limit>`

The user can also set the volume limit for all the nodes in the cluster by specifying the same to `maxPowerMaxVolumesPerNode` attribute in values.yaml. In case of driver installed via operator, this attribute can be modified in the sample file provided [here](https://github.com/dell/csm-operator/blob/main/samples) by editing the `X_CSI_MAX_VOLUMES_PER_NODE` parameter. 

This feature is also supported for limiting the volume provisioning on Kubernetes clusters running on vSphere (VMware hypervisor) via RDM mechanism. User can set `vSphere.enabled` to true and also set volume limits to positive values less than or equal 60 via labels or in Values.yaml file.


>**NOTE:** <br>The default value of `maxPowerMaxVolumesPerNode` is 0. <br>If `maxPowerMaxVolumesPerNode` is set to zero, then CO shall decide how many volumes of this type can be published by the controller to the node.<br><br>The volume limit specified to `maxPowerMaxVolumesPerNode` attribute is applicable to all the nodes in the cluster for which node label `max-powermax-volumes-per-node` is not set.
<br>Supported maximum number of RDM Volumes per VM is 60 as per the limitations. <br>If the value is set both by node label and values.yaml file then node label value will get the precedence and user has to remove the node label in order to reflect the values.yaml value. 

