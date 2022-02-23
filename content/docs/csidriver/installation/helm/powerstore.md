---
title: PowerStore
description: >
  Installing CSI Driver for PowerStore via Helm
---

The CSI Driver for Dell EMC PowerStore can be deployed by using the provided Helm v3 charts and installation scripts on both Kubernetes and OpenShift platforms. For more detailed information on the installation scripts, review the script [documentation](https://github.com/dell/csi-powerstore/tree/master/dell-csi-helm-installer).

The controller section of the Helm chart installs the following components in a _Deployment_ in the specified namespace:
- CSI Driver for Dell EMC PowerStore
- Kubernetes External Provisioner, which provisions the volumes
- Kubernetes External Attacher, which attaches the volumes to the containers
- (Optional) Kubernetes External Snapshotter, which provides snapshot support
- Kubernetes External Resizer, which resizes the volume

The node section of the Helm chart installs the following component in a _DaemonSet_ in the specified namespace:
- CSI Driver for Dell EMC PowerStore
- Kubernetes Node Registrar, which handles the driver registration

## Prerequisites

The following are requirements to be met before installing the CSI Driver for Dell EMC PowerStore:
- Install Kubernetes or OpenShift (see [supported versions](../../../../csidriver/#features-and-capabilities))
- Install Helm 3
- If you plan to use either the Fibre Channel, iSCSI or NVMe protocol, refer to either _Fibre Channel requirements_, _Set up the iSCSI Initiator_ or _Set up the NVMe Initiator_ sections below. You can use NFS volumes without FC or iSCSI configuration.
> You can use either the Fibre Channel or iSCSI protocol, but you do not need both.

> If you want to use preconfigured iSCSI/FC hosts be sure to check that they are not part of any host group
- Linux native multipathing requirements
- Mount propagation is enabled on container runtime that is being used
- If using Snapshot feature, satisfy all Volume Snapshot requirements
- Nonsecure registries are defined in Docker or other container runtimes, for CSI drivers that are hosted in a non-secure location.
- You can access your cluster with kubectl and helm.
- Ensure that your nodes support mounting NFS volumes. 

### Install Helm 3.0

Install Helm 3.0 on the master node before you install the CSI Driver for Dell EMC PowerStore.

**Steps**

  Run the `curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash` command to install Helm 3.0.

### Fibre Channel requirements

Dell EMC PowerStore supports Fibre Channel communication. If you use the Fibre Channel protocol, ensure that the
following requirement is met before you install the CSI Driver for Dell EMC PowerStore:
- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port must be done.


### Set up the iSCSI Initiator
The CSI Driver for Dell EMC PowerStore v1.4 and higher supports iSCSI connectivity.

If you use the iSCSI protocol, set up the iSCSI initiators as follows:
- Ensure that the iSCSI initiators are available on both Controller and Worker nodes.
- Kubernetes nodes must have access (network connectivity) to an iSCSI port on the Dell EMC PowerStore array that
has IP interfaces. Manually create IP routes for each node that connects to the Dell EMC PowerStore.
- All Kubernetes nodes must have the _iscsi-initiator-utils_ package for CentOS/RHEL or _open-iscsi_ package for Ubuntu installed, and the _iscsid_ service must be enabled and running.
To do this, run the `systemctl enable --now iscsid` command.
- Ensure that the unique initiator name is set in _/etc/iscsi/initiatorname.iscsi_.

For information about configuring iSCSI, see _Dell EMC PowerStore documentation_ on Dell EMC Support.


### Set up the NVMe Initiator
The CSI Driver for Dell EMC Powerstore 2.2 and higher support NVMe connectivity.

If you use the NVMe/TCP protocol, set up the NVMe initiators as follows:
- Ensure that the NVMe initiators are available on the controller and node pods.
- Kubernetes nodes must have access (network connectivity) to an NVMe port on the Dell EMC Powerstore array that
has NVMe/TCP IP interfaces. 
- We require the NVMe management command line interface (nvme-cli) to configure, edit, view, or start the NVMe client and target.
You can install nvme-cli by running `apt install nvme-cli` on Ubuntu and `yum install nvme-cli` on Rhel/CentOS.
- Modules including the nvme, nvme_core, nvme_fabrics, and nvme_tcp are required for using NVMe over Fabrics using TCP
The modules can be loaded using `modprobe nvme` and `modprobe nvme_tcp`.

### Linux multipathing requirements
Dell EMC PowerStore supports Linux multipathing. Configure Linux multipathing before installing the CSI Driver for Dell EMC
PowerStore.

Set up Linux multipathing as follows:
- Ensure that all nodes have the _Device Mapper Multipathing_ package installed.
> You can install it by running `yum install device-mapper-multipath` on CentOS or `apt install multipath-tools` on Ubuntu. This package should create a multipath configuration file located in `/etc/multipath.conf`.
- Enable multipathing using the `mpathconf --enable --with_multipathd y` command.
- Enable `user_friendly_names` and `find_multipaths` in the `multipath.conf` file.
- Ensure that the multipath command for `multipath.conf` is available on all Kubernetes nodes.

### (Optional) Volume Snapshot Requirements

Applicable only if you decided to enable the snapshot feature in `values.yaml`

```yaml
snapshot:
  enabled: true
```

#### Volume Snapshot CRD's
The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on Github. Use [v4.2.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.2.0/client/config/crd) for the installation.

#### Volume Snapshot Controller
The CSI external-snapshotter sidecar is split into two controllers:
- A common snapshot controller
- A CSI external-snapshotter sidecar

The common snapshot controller must be installed only once in the cluster irrespective of the number of CSI drivers installed in the cluster. On OpenShift clusters 4.4 and later, the common snapshot-controller is pre-installed. In the clusters where it is not present, it can be installed using `kubectl` and the manifests are available:
Use [v4.2.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.2.0/deploy/kubernetes/snapshot-controller) for the installation.

*NOTE:*
- The manifests available on GitHub install the snapshotter image: 
   - [quay.io/k8scsi/csi-snapshotter:v4.0.x](https://quay.io/repository/k8scsi/csi-snapshotter?tag=v4.0.0&tab=tags)
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

#### Installation example 

You can install CRDs and default snapshot controller by running following commands:
```bash
git clone https://github.com/kubernetes-csi/external-snapshotter/
cd ./external-snapshotter
git checkout release-<your-version>
kubectl create -f client/config/crd
kubectl create -f deploy/kubernetes/snapshot-controller
```

*NOTE:*
- It is recommended to use 4.2.x version of snapshotter/snapshot-controller.
- The CSI external-snapshotter sidecar is installed along with the driver and does not involve any extra configuration.

### (Optional) Replication feature Requirements

Applicable only if you decided to enable the Replication feature in `values.yaml`

```yaml
replication:
  enabled: true
```
#### Replication CRD's

The CRDs for replication can be obtained and installed from the csm-replication project on Github. Use `csm-replication/deploy/replicationcrds.all.yaml` located in csm-replication git repo for the installation.

CRDs should be configured during replication prepare stage with repctl as described in [install-repctl](../../../../replication/deployment/install-repctl)

## Install the Driver

**Steps**
1. Run `git clone -b v2.1.0 https://github.com/dell/csi-powerstore.git` to clone the git repository.
2. Ensure that you have created namespace where you want to install the driver. You can run `kubectl create namespace csi-powerstore` to create a new one. "csi-powerstore" is just an example. You can choose any name for the namespace.
   But make sure to align to the same namespace during the whole installation.
3. Check `helm/csi-powerstore/driver-image.yaml` and confirm the driver image points to new image.
4. Edit `samples/secret/secret.yaml` file and configure connection information for your PowerStore arrays changing following parameters:
    - *endpoint*: defines the full URL path to the PowerStore API.
    - *globalID*: specifies what storage cluster the driver should use  
    - *username*, *password*: defines credentials for connecting to array.
    - *skipCertificateValidation*: defines if we should use insecure connection or not.
    - *isDefault*: defines if we should treat the current array as a default.
    - *blockProtocol*: defines what SCSI transport protocol we should use (FC, ISCSI, NVMETCP, None, or auto).
    - *nasName*: defines what NAS should be used for NFS volumes.
    
    Add more blocks similar to above for each PowerStore array if necessary. 
5. Create storage classes using ones from `samples/storageclass` folder as an example and apply them to the Kubernetes cluster by running `kubectl create -f <path_to_storageclass_file>`
    > If you do not specify `arrayID` parameter in the storage class then the array that was specified as the default would be used for provisioning volumes.
6. Create the secret by running ```kubectl create secret generic powerstore-config -n csi-powerstore --from-file=config=secret.yaml```
7. Copy the default values.yaml file `cd dell-csi-helm-installer && cp ../helm/csi-powerstore/values.yaml ./my-powerstore-settings.yaml`
8. Edit the newly created values file and provide values for the following parameters `vi my-powerstore-settings.yaml`:

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| logLevel | Defines CSI driver log level | No | "debug" |
| logFormat | Defines CSI driver log format | No | "JSON" |
| externalAccess | Defines additional entries for hostAccess of NFS volumes, single IP address and subnet are valid entries | No | " " |
| kubeletConfigDir | Defines kubelet config path for cluster | Yes | "/var/lib/kubelet" |
| imagePullPolicy | Policy to determine if the image should be pulled prior to starting the container. | Yes | "IfNotPresent" |
| connection.enableCHAP   | Defines whether the driver should use CHAP for iSCSI connections or not | No | False |
| controller.controllerCount     | Defines number of replicas of controller deployment | Yes | 2 |
| controller.volumeNamePrefix | Defines the string added to each volume that the CSI driver creates | No | "csivol" |
| controller.snapshot.enabled | Allows to enable/disable snapshotter sidecar with driver installation for snapshot feature | No | "true" |
| controller.snapshot.snapNamePrefix | Defines prefix to apply to the names of a created snapshots | No | "csisnap" |
| controller.resizer.enabled | Allows to enable/disable resizer sidecar with driver installation for volume expansion feature | No | "true" |
| controller.healthMonitor.enabled | Allows to enable/disable volume health monitor | No | false |
| controller.healthMonitor.volumeHealthMonitorInterval | Interval of monitoring volume health condition | No | 60s |
| controller.nodeSelector | Defines what nodes would be selected for pods of controller deployment | Yes | " " |
| controller.tolerations  | Defines tolerations that would be applied to controller deployment | Yes | " " |
| node.nodeNamePrefix | Defines the string added to each node that the CSI driver registers | No | "csi-node" |
| node.nodeIDPath | Defines a path to file with a unique identifier identifying the node in the Kubernetes cluster| No | "/etc/machine-id" |
| node.healthMonitor.enabled | Allows to enable/disable volume health monitor | No | false |
| node.nodeSelector | Defines what nodes would be selected for pods of node daemonset | Yes | " " |
| node.tolerations  | Defines tolerations that would be applied to node daemonset | Yes | " " |

8. Install the driver using `csi-install.sh` bash script by running `./csi-install.sh --namespace csi-powerstore --values ./my-powerstore-settings.yaml` 
   - After that the driver should be installed, you can check the condition of driver pods by running `kubectl get all -n csi-powerstore` 

*NOTE:* 
- For detailed instructions on how to run the install scripts, refer to the readme document in the dell-csi-helm-installer folder.
- By default, the driver scans available SCSI adapters and tries to register them with the storage array under the SCSI hostname using `node.nodeNamePrefix` and the ID read from the file pointed to by `node.nodeIDPath`. If an adapter is already registered with the storage under a different hostname, the adapter is not used by the driver.
- A hostname the driver uses for registration of adapters is in the form `<nodeNamePrefix>-<nodeID>-<nodeIP>`. By default, these are csi-node and the machine ID read from the file `/etc/machine-id`. 
- To customize the hostname, for example if you want to make them more user friendly, adjust nodeIDPath and nodeNamePrefix accordingly. For example, you can set `nodeNamePrefix` to `k8s` and `nodeIDPath` to `/etc/hostname` to produce names such as `k8s-worker1-192.168.1.2`.
- (Optional) Enable additional Mount Options - A user is able to specify additional mount options as needed for the driver. 
   - Mount options are specified in storageclass yaml under _mountOptions_. 
   - *WARNING*: Before utilizing mount options, you must first be fully aware of the potential impact and understand your environment's requirements for the specified option.

## Storage Classes

The CSI driver for Dell EMC PowerStore version 1.3 and later, `dell-csi-helm-installer` does not create any storage classes as part of the driver installation. A wide set of annotated storage class manifests have been provided in the `samples/storageclass` folder. Use these samples to create new storage classes to provision storage.

### What happens to my existing storage classes?

Upgrading from an older version of the driver: The storage classes will be deleted if you upgrade the driver. If you wish to continue using those storage classes, you can patch them and apply the annotation “helm.sh/resource-policy”: keep before performing an upgrade.

>Note: If you continue to use the old storage classes, you may not be able to take advantage of any new storage class parameter supported by the driver.

**Steps to create storage class:**

There are samples storage class yaml files available under `samples/storageclass`.  These can be copied and modified as needed.

1. Edit the sample storage class yaml file and update following parameters: 
- *arrayID*: specifies what storage cluster the driver should use, if not specified driver will use storage cluster specified as `default` in `samples/secret/secret.yaml`
- *FsType*: specifies what filesystem type driver should use, possible variants `ext4`, `xfs`, `nfs`, if not specified driver will use `ext4` by default.
- *allowedTopologies* (Optional): If you want you can also add topology constraints.
```yaml
allowedTopologies:
  - matchLabelExpressions: 
      - key: csi-powerstore.dellemc.com/12.34.56.78-iscsi
# replace "-iscsi" with "-fc", "-nvme" or "-nfs" at the end to use FC, NVME, or NFS enabled hosts
# replace "12.34.56.78" with PowerStore endpoint IP
        values:
          - "true"
```

2. Create your storage class by using `kubectl`:
```bash
kubectl create -f <path_to_storageclass_file>
```

*NOTE:* Deleting a storage class has no impact on a running Pod with mounted PVCs. You cannot provision new PVCs until at least one storage class is newly created.

## Volume Snapshot Class

Starting CSI PowerStore v1.4, `dell-csi-helm-installer` will not create any Volume Snapshot Class during the driver installation. There is a sample Volume Snapshot Class manifest present in the _samples/volumesnapshotclass_ folder. Please use this sample to create a new Volume Snapshot Class to create Volume Snapshots.

### What happens to my existing Volume Snapshot Classes?

*Upgrading from CSI PowerStore v2.0 driver*:
The existing volume snapshot class will be retained.

*Upgrading from an older version of the driver*:
It is strongly recommended to upgrade the earlier versions of CSI PowerStore to 1.4 or higher, before upgrading to 2.1.

## Dynamically update the powerstore secrets 

Users can dynamically add delete array information from secret. Whenever an update happens the driver updates the “Host” information in an array. User can update secret using the following command:
```bash
kubectl create secret generic powerstore-config -n csi-powerstore --from-file=config=secret.yaml -o yaml --dry-run=client | kubectl replace -f -
```
## Dynamic Logging Configuration

This feature is introduced in CSI Driver for PowerStore version 2.0.0. 

### Helm based installation
As part of driver installation, a ConfigMap with the name `powerstore-config-params` is created, which contains attributes `CSI_LOG_LEVEL` which specifies the current log level of CSI driver and `CSI_LOG_FORMAT` which specifies the current log format of CSI driver. 

Users can set the default log level by specifying log level to `logLevel` and log format to `logFormat` attribute in `my-powerstore-settings.yaml` during driver installation.

To change the log level or log format dynamically to a different value user can edit the same values.yaml, and run the following command
```
cd dell-csi-helm-installer
./csi-install.sh --namespace csi-powerstore --values ./my-powerstore-settings.yaml --upgrade
```

Note: here `my-powerstore-settings.yaml` is a `values.yaml` file which user has used for driver installation.  