---
title: PowerMax
linktitle: PowerMax 
Description: Code features for PowerMax Driver
---

## Volume Snapshot Feature


The Volume Snapshot feature was introduced in alpha (v1alpha1) in Kubernetes 1.13 and then moved to beta (v1beta1) in Kubernetes version 1.17 and was generally available (v1) in Kubernetes version 1.20.

The CSI PowerMax driver version 1.6 supports v1beta1 snapshots on Kubernetes 1.18/1.19 and v1 snapshots on Kubernetes 1.20.

In order to use Volume Snapshots, ensure the following components have been deployed to your cluster:
- Kubernetes Volume Snapshot CRDs
- Volume Snapshot Controller

### Volume Snapshot Class

During the installation of the CSI PowerMax 1.6 driver, a Volume Snapshot Class is created. This is the only Volume Snapshot Class you will need and there is no need to create any other Volume Snapshot Class. 

<TODO - update latest>
The following is the manifest for the Volume Snapshot Class created during installation (using the default driver name):
```
apiVersion: snapshot.storage.k8s.io/v1beta1
deletionPolicy: Delete
kind: VolumeSnapshotClass
metadata:
  name: powermax-snapclass
driver: csi-powermax.dellemc.com
```
### Creating Volume Snapshots
<TODO - update latest>
The following is a sample manifest for creating a Volume Snapshot using the **v1beta1** snapshot APIs:
```
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshot
metadata:
  name: pmax-snapshot-demo
  namespace: test
spec:
  volumeSnapshotClassName: powermax-snapclass
  source:
    persistentVolumeClaimName: pmax-pvc-demo
```

After the VolumeSnapshot has been successfully created by the CSI PowerMax driver, a VolumeSnapshotContent object is automatically created. When the status of the VolumeSnapshot object has the _readyToUse_ field set to _true_ , it is available for use.

The following is the relevant section of VolumeSnapshot object status:
```
status:
  boundVolumeSnapshotContentName: snapcontent-5a8334d2-eb40-4917-83a2-98f238c4bda
  creationTime: "2020-07-16T08:42:12Z"
  readyToUse: true
```

### Creating PVCs with VolumeSnapshots as Source

The following is a sample manifest for creating a PVC with a VolumeSnapshot as a source:
```
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
```
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

With version 1.3.0, support has been added for unidirectional Challenge Handshake Authentication Protocol (CHAP) for iSCSI.
To enable CHAP authentication:
1. Create secret `powermax-creds` with the key `chapsecret` set to the iSCSI CHAP secret. If the secret exists, delete and re-create the secret with this newly added key.
2. Set the parameter `enableCHAP` in `my-powermax-settings.yaml` to true.

The driver uses the provided chapsecret to configure the iSCSI node database on each node with iSCSI access.

When the driver is installed and all the node plug-ins have initialized successfully, the storage administrator must enable CHAP authentication using the following Solutions Enabler (SYMCLI) commands:

`symaccess -sid <symid> -iscsi <host iqn> set chap -cred <host IQN> -secret <CHAP secret>`

Where <host IQN> is the name of the iSCSI initiator of a host IQN, and <CHAP secret> is the chapsecret that is used at the time of the installation of the driver.

*NOTE*: The host IQN is also used as the username when setting up the CHAP credentials.

### CHAP support for PowerMax

With unidirectional CHAP, the PowerMax array challenges the host initiator during the initial link negotiation process and expects to receive a valid credential and CHAP secret in response.

When challenged, the host initiator transmits a CHAP credential and CHAP secret to the storage array. The storage array looks for this credential and CHAP secret which stored in the host initiator group. When a positive authentication occurs, the PowerMax array sends an acceptance message to the host. However, if the PowerMax array fails to find any record of the credential/secret pair, it sends a rejection message, and the link is closed.

## Custom Driver Name (experimental feature)

With version 1.3.0 of the driver, a custom name can be assigned to the driver at the time of installation. This enables installation of the CSI driver in a different namespace and installation of multiple CSI drivers for Dell EMC PowerMax in the same Kubernetes/OpenShift cluster.

To use this experimental feature, set the following values under `customDriverName` in `my-powermax-settings.yaml`.
- Value: Set this to the custom name of the driver.
- Enabled: Set this to true in case you want to enable this feature.
The driver helm chart installation uses the values above to:
- Configure the driver name which is used for communication with other Kubernetes components.
- Configure the provisioner value in the storage class template.
- Configure the snapshotter value in the snapshot class template.

If enabled, the driver name is in the following format: `<namespace>.<driver name>.dellemc.com`

For example, if the driver name is set to _driver_ and it is installed in the namespace _powermax_ , then the name that is used for the driver (and the provisioner/snapshotter) is `powermax.driver.dellemc.com`

*NOTE*: If not enabled, the name is set to `csi-powermax.dellemc.com` by default (without any namespace prefix).

### Install multiple drivers

*NOTE*: This is an experimental feature and should be used with extreme caution after consulting with Dell EMC Support.

To install multiple CSI Drivers for Dell EMC PowerMax in a single Kubernetes cluster, you can take advantage of the custom driver name feature. There are a few important restrictions which should be strictly adhered to:
- Only one driver can be installed in a single namespace
- Different drivers should not connect to a single Unisphere server
- Different drivers should not be used to manage a single PowerMax array
- Storage class and snapshot class names must be unique across installations

To install multiple CSI drivers, follow these steps:
1. Create (or use) a new namespace.
2. Ensure that all the pre-requisites are met:
    - `powermax-creds` secret is created in this namespace
    - Optional) `powermax-certs` secret is created in this namespace
3. Update `my-powermax-settings.yaml` with the required values.
4. Run the `csi-install.sh` script to install the driver.

## Volume expansion

Starting in v1.4, the CSI PowerMax driver supports expansion of Persistent Volumes (PVs). This expansion is done online, that is, when the PVC is attached to any node.

To use this feature, the storage class that is used to create the PVC must have the attribute `allowVolumeExpansion` set to `true`. The storage classes created during the installation (both using Helm or dell-csi-operator) have the `allowVolumeExpansion` set to `true` by default.

If you are creating more storage classes, ensure that this attribute is set to `true` to expand any PVs created using these new storage classes.

This is a sample manifest for a storage class which allows for Volume Expansion.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: powermax-expand-sc
  annotations:
    storageclass.beta.kubernetes.io/is-default-class: false
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

```
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
*NOTE*: The Kubernetes Volume Expansion feature can only be used to increase the size of volume, it cannot be used to shrink a volume.

## Raw block support

Starting in v1.4, CSI PowerMax driver supports raw block volumes.

Raw Block volumes are created using the volumeDevices list in the Pod template spec with each entry accessing a volumeClaimTemplate specifying a volumeMode: Block. An example configuration is outlined here:

```
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

Raw Block volumes are presented as a block device to the Pod by using a bind mount to a block device in the node's file system. The driver does not format or check the format of any file system on the block device. Raw Block volumes support online Volume Expansion, but it is up to the application to manage reconfiguring the file system (if any) to the new size.

For additional information, see the website: [Kubernetes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#raw-block-volume-support)

## CSI PowerMax Reverse Proxy

To get the maximum performance out of the CSI driver for PowerMax and Unisphere forPowerMax REST APIs, starting with v1.4 of the driver, you can deploy the optional CSI PowerMax Reverse Proxy application.

CSI PowerMax Reverse Proxy is a (go) HTTPS server which acts as a reverse proxy for the Unisphere forPowerMax RESTAPI interface. Any RESTAPI request sent from the driver to the reverse proxy is forwarded to the Unisphere server and the response is routed back to the driver.

The Reverse Proxy helps regulate the maximum number of requests which can be sent to the Unisphere RESTAPI at a given time across all driver controller and node Pods. This helps with better queuing of CSI requests and performance of the CSI PowerMax driver.

Optionally you can specify an alternate (backup) Unisphere server and if the primary Unisphere server is not reachable or does not respond, the proxy will redirect the calls to this alternate Unisphere.

### Installation

CSI PowerMax Reverse Proxy is installed as a Kubernetes deployment in the same namespace as the driver.

It is also configured as a Kubernetes "NodePort" service. If the CSI PowerMax driver has been configured to use this service, then it will connect to the IP address and port exposed by the Kubernetes service instead of directly connecting to the Unisphere server.

### Prerequisite

CSI PowerMax Reverse Proxy is a HTTPS server and has to be configured with an SSL certificate and a private key.

The certificate and key are provided to the proxy via a Kubernetes TLS secret (in the same namespace). The SSL certificate must be a X.509 certificate encoded in PEM format. The certificates can be obtained via a Certificate Authority or can be self-signed and generated by a tool such as openssl.

Here is an example to generate a private key and use that to sign an SSL certificate using the openssl tool:

```
openssl genrsa -out tls.key 2048
openssl req -new -x509 -sha256 -key tls.key -out tls.crt -days 3650
kubectl create secret -n <namespace> tls revproxy-certs --cert=tls.crt --key=tls.key
kubectl create secret -n <namespace> tls csirevproxy-tls-secret --cert=tls.crt --
key=tls.key
```

### Using Helm installer

A new section, csireverseproxy, in the `my-powermax-settings.yaml` file can be used to deploy and configure the CSI PowerMax Reverse Proxy.

The new Helm chart is configured as a sub chart for the CSI PowerMax helm chart. If it is enabled (using the `enabled` parameter in the csireverseproxy section of the `my-powermax-settings.yaml` file), the install script automatically installs the CSI PowerMax Reverse Proxy and configures the CSI PowerMax driver to use this service.

### Using Dell CSI Operator

Starting with the v1.1.0 release of the Dell CSI Operator, a new Custom Resource Definition can be used to install CSI PowerMax Reverse Proxy.

This Custom Resource has to be created in the same namespace as the CSI PowerMax driver and it has to be created before the driver Custom Resource. To use the service, the driver Custom Resource manifest must be configured with the service name "powermax-reverseproxy". For complete installation instructions for the CSI PowerMax driver and the CSI PowerMax Reverse Proxy, see the [Dell CSI Operator documentation](../../installation/operator).

## User-friendly hostnames

Users can set a value for the `nodeNameTemplate` in `my-powermax-settings.yaml` during the installation of the driver so that the driver can use this value to decide the name format of hosts to create or update in the PowerMax array for the nodes in a Kubernetes cluster. The hostname value in nodeNameTemplate should always be contained between two '%' characters. String prefixing first '%' and string suffixing second '%' is used as is before and after every node identifier.

Also, there is a new setting, `modifyHostName`, which could be set to `true` if you want the driver to rename the existing Hosts/IG for the host initiators on the PowerMax array. The new name uses the default naming convention (`csi-<ClusterPrefix>-<HostName>*`) or the `nodeNameTemplate` if it was specified.

For example, if `nodeNameTemplate` is _abc-%foo%-hostname_ and nodename is _worker1_ , then the host ID is created or updated as _abc-worker1-hostname_. This change will happen for all nodes in a cluster with the respective node name.

*NOTE*: `nodeNameTemplate` can contain alphanumeric characters [a - z, A - Z, 0 - 9], '-' and '_', other characters are not allowed.

## Controller HA

Starting with version 1.5, the CSI PowerMax driver supports running multiple replicas of controller Pod. At any time, only one controller Pod is active(leader), and the rest are on standby. In case of a failure, one of the standby Pods becomes active and takes the position of leader. This is achieved by using native leader election mechanisms utilizing `kubernetes leases`. Additionally by leveraging `pod anti-affinity`, no two controller Pods are ever scheduled on the same node.

To increase or decrease the number of controller Pods, edit the following value in `values.yaml` file:
```
controllerCount: 2
```  
> *NOTE:* The default value for controllerCount is 2. We recommend not changing this unless it is really necessary.
> Also, if the controller count is greater than the number of available nodes (where the Pods can be scheduled), some controller Pods will remain in the Pending state  
   
If you are using the `dell-csi-operator`, adjust the following value in your Custom Resource manifest
```  
replicas: 2  
```

For more details about configuring Controller HA using the Dell CSI Operator, see the Dell CSI Operator documentation.

## NodeSelectors and Tolerations

Starting with version 1.5, the CSI PowerMax driver helm installer allows you to specify a set of `nodeSelectors` and `tolerations` which can be applied on the driver controller `Deployment` and driver node `Daemonset`. There are two new sections in the `values` file - `controller` and `node` - where you can specify these values separately for the controller and node Pods. 

### controller

If you want to apply `nodeSelectors` and `tolerations` for the controller Pods, edit the  `controller` section in the `values` file.  

Here are some examples:   
* To schedule controller Pods to worker nodes only (Default):
```
controller:
  nodeSelector:
  tolerations:
```  
* Set the following values for controller Pods to tolerate the taint `NoSchedule` on master nodes:
```
controller:
  nodeSelector:
  tolerations:
   - key: "node-role.kubernetes.io/master"
     operator: "Exists"
     effect: "NoSchedule"
```  
* Set the following values for controller pods to be only scheduled on nodes labelled as `master` (*node-role.kubernetes.io/master*):
```  
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

```  
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

Starting from version 1.5, the CSI PowerMax driver supports topology-aware volume provisioning which helps Kubernetes scheduler place PVCs on worker nodes which have access to backend storage. When used with `nodeSelectors` which can be specified for the driver node Pods, it provides an effective way to provision applications on nodes which have access to the PowerMax array.

After a successful installation of the driver, if a node Pod is running successfully on a worker node, the following topology keys are created for a specific PowerMax array:
* `csi-powermax.dellemc.com/\<array-id\>`
* If the worker node has Fibre Channel connectivity to the PowerMax array -
`csi-powermax.dellemc.com/\<array-id\>.fc`
* If the worker node has ISCSI connectivity to the PowerMax array -
`csi-powermax.dellemc.com/\<array-id\>.iscsi`

The values for all these keys are always set to the name of the provisioner which is usually `csi-powermax.dellemc.com`.

> *NOTE:* The Topology support does not include any customer-defined topology, that is, users cannot create their own labels for nodes and storage classes and expect the labels to be honored by the driver.

### Topology Usage
To use the Topology feature, the storage classes must be modified as follows:  
* _volumeBindingMode_ must be set to `WaitForFirstConsumer`
* _allowedTopologies_ should be set to one or more topology keys described in the previous section

For example, a PVC created using the following storage class will **always** be scheduled on nodes which have FC connectivity to the PowerMax array `000000000001`
```
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

In the above example if you remove the entry for the key `csi-powermax.dellemc.com/000000000001.fc`, then the PVCs created using this storage class will be scheduled
on any worker node with access to the PowerMax array `000000000001` irrespective of the transport protocol

> *NOTE:* The storage classes created during the driver installation (via Helm) do not contain any topology keys and have the volumeBindingMode set to Immediate. A set of sample storage class definitions to enable topology
>-aware volume provisioning has been provided in the `csi-powermax/helm/samples/storageclass` folder 

For additional information on how to use _Topology aware Volume Provisioning_, see the [Kubernetes Topology documentation](https://kubernetes-csi.github.io/docs/topology.html).

If you are using `dell-csi-operator` to create storage classes while installing the CSI PowerMax 1.5 driver, you can set the `allowedTopologies` value appropriately. `volumeBindingMode` is set to `WaitForFirstConsumer` if not specified explicitly.

