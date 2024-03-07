---
title: PowerStore
description: >
  Installing CSI Driver for PowerStore via Helm
---

The CSI Driver for Dell PowerStore can be deployed by using the provided Helm v3 charts and installation scripts on both Kubernetes and OpenShift platforms. For more detailed information on the installation scripts, review the script [documentation](https://github.com/dell/csi-powerstore/tree/master/dell-csi-helm-installer).

## Prerequisites

The following are requirements to be met before installing the CSI Driver for Dell PowerStore:
- Install Kubernetes or OpenShift (see [supported versions](../../../../../csidriver/#features-and-capabilities))
- Install Helm 3.x
- If you plan to use either the Fibre Channel or iSCSI or NVMe/TCP or NVMe/FC protocol, refer to either _Fibre Channel requirements_ or _Set up the iSCSI Initiator_ or _Set up the NVMe Initiator_ sections below. You can use NFS volumes without FC or iSCSI or NVMe/TCP or NVMe/FC configuration.
> You can use either the Fibre Channel or iSCSI or NVMe/TCP or NVMe/FC protocol, but you do not need all the four.

> If you want to use preconfigured iSCSI/FC hosts be sure to check that they are not part of any host group
- Linux native multipathing requirements
- Mount propagation is enabled on container runtime that is being used
- If using Snapshot feature, satisfy all Volume Snapshot requirements
- Nonsecure registries are defined in Docker or other container runtimes, for CSI drivers that are hosted in a non-secure location.
- You can access your cluster with kubectl and helm.
- Ensure that your nodes support mounting NFS volumes. 

### Install Helm 3.x

Install Helm 3.x on the master node before you install the CSI Driver for Dell PowerStore.

**Steps**

  Run the command to install Helm 3.x.
  ```bash
  curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
  ```
### Fibre Channel requirements

Dell PowerStore supports Fibre Channel communication. If you use the Fibre Channel protocol, ensure that the
following requirement is met before you install the CSI Driver for Dell PowerStore:
- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port must be done.


### Set up the iSCSI Initiator
The CSI Driver for Dell PowerStore v1.4 and higher supports iSCSI connectivity.

If you use the iSCSI protocol, set up the iSCSI initiators as follows:
- Ensure that the iSCSI initiators are available on both Controller and Worker nodes.
- Kubernetes nodes must have access (network connectivity) to an iSCSI port on the Dell PowerStore array that
has IP interfaces. Manually create IP routes for each node that connects to the Dell PowerStore.
- All Kubernetes nodes must have the _iscsi-initiator-utils_ package for CentOS/RHEL or _open-iscsi_ package for Ubuntu installed, and the _iscsid_ service must be enabled and running.
To do this, run the `systemctl enable --now iscsid` command.
- Ensure that the unique initiator name is set in _/etc/iscsi/initiatorname.iscsi_.

For information about configuring iSCSI, see _Dell PowerStore documentation_ on Dell Support.


### Set up the NVMe Initiator

If you want to use the protocol, set up the NVMe initiators as follows:
- The driver requires NVMe management command-line interface (nvme-cli) to use configure, edit, view or start the NVMe client and target. The nvme-cli utility provides a command-line and interactive shell option. The NVMe CLI tool is installed in the host using the below command.
```bash
sudo apt install nvme-cli
```

**Requirements for NVMeTCP**
- Modules including the nvme, nvme_core, nvme_fabrics, and nvme_tcp are required for using NVMe over Fabrics using TCP. Load the NVMe and NVMe-OF Modules using the below commands:
```bash
modprobe nvme
modprobe nvme_tcp
```
- The NVMe modules may not be available after a node reboot. Loading the modules at startup is recommended.

**Requirements for NVMeFC**
- NVMeFC Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port must be done.

*NOTE:*
- Do not load the nvme_tcp module for NVMeFC

### Linux multipathing requirements
Dell PowerStore supports Linux multipathing. Configure Linux multipathing before installing the CSI Driver for Dell
PowerStore.

Set up Linux multipathing as follows:
- Ensure that all nodes have the _Device Mapper Multipathing_ package installed.
> You can install it by running `yum install device-mapper-multipath` on CentOS or `apt install multipath-tools` on Ubuntu. This package should create a multipath configuration file located in `/etc/multipath.conf`.
- Enable multipathing using the `mpathconf --enable --with_multipathd y` command.
- Enable `user_friendly_names` and `find_multipaths` in the `multipath.conf` file.
- Ensure that the multipath command for `multipath.conf` is available on all Kubernetes nodes.

#### multipathd `MachineConfig`

If you are installing a CSI Driver which requires the installation of the Linux native Multipath software - _multipathd_, please follow the below instructions

To enable multipathd on RedHat CoreOS nodes you need to prepare a working configuration encoded in base64.

```bash echo 'defaults {
user_friendly_names yes
find_multipaths yes
}
blacklist {
}' | base64 -w0
```

Use the base64 encoded string output in the following `MachineConfig` yaml file (under source section)
```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: workers-multipath-conf-default
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 3.2.0
    storage:
      files:
      - contents:
          source: data:text/plain;charset=utf-8;base64,ZGVmYXVsdHMgewp1c2VyX2ZyaWVuZGx5X25hbWVzIHllcwpmaW5kX211bHRpcGF0aHMgeWVzCn0KCmJsYWNrbGlzdCB7Cn0K
          verification: {}
        filesystem: root
        mode: 400
        path: /etc/multipath.conf
```
After deploying this`MachineConfig` object, CoreOS will start multipath service automatically.
Alternatively, you can check the status of the multipath service by entering the following command in each worker nodes.
`sudo multipath -ll`

If the above command is not successful, ensure that the /etc/multipath.conf file is present and configured properly. Once the file has been configured correctly, enable the multipath service by running the following command:
`sudo /sbin/mpathconf –-enable --with_multipathd y`

Finally, you have to restart the service by providing the command
`sudo systemctl restart multipathd`

For additional information refer to official documentation of the multipath configuration.

### (Optional) Volume Snapshot Requirements
  For detailed snapshot setup procedure, [click here.](../../../../../snapshots/#optional-volume-snapshot-requirements)

### Volume Health Monitoring

Volume Health Monitoring feature is optional and by default this feature is disabled for drivers when installed via helm.
To enable this feature, add the below block to the driver manifest before installing the driver. This ensures to install external
health monitor sidecar. To get the volume health state value under controller should be set to true as seen below. To get the
volume stats value under node should be set to true.
   ```yaml
    controller:
      healthMonitor:
        # enabled: Enable/Disable health monitor of CSI volumes
        # Allowed values:
        #   true: enable checking of health condition of CSI volumes
        #   false: disable checking of health condition of CSI volumes
        # Default value: None
        enabled: false
        # interval: Interval of monitoring volume health condition
        # Allowed values: Number followed by unit (s,m,h)
        # Examples: 60s, 5m, 1h
        # Default value: 60s
        interval: 60s

    node:
      healthMonitor:
        # enabled: Enable/Disable health monitor of CSI volumes- volume usage, volume condition
        # Allowed values:
        #   true: enable checking of health condition of CSI volumes
        #   false: disable checking of health condition of CSI volumes
        # Default value: None
        enabled: false
   ```
### (Optional) Replication feature Requirements

Applicable only if you decided to enable the Replication feature in `values.yaml`

```yaml
replication:
  enabled: true
```
#### Replication CRD's

The CRDs for replication can be obtained and installed from the csm-replication project on Github. Use `csm-replication/deploy/replicationcrds.all.yaml` located in csm-replication git repo for the installation.

CRDs should be configured during replication prepare stage with repctl as described in [install-repctl](../../../../../deployment/helm/modules/installation/replication/install-repctl)

## Install the Driver

**Steps**
1. Run `git clone -b v2.10.0 https://github.com/dell/csi-powerstore.git` to clone the git repository.
2. Ensure that you have created namespace where you want to install the driver. You can run `kubectl create namespace csi-powerstore` to create a new one. "csi-powerstore" is just an example. You can choose any name for the namespace.
   But make sure to align to the same namespace during the whole installation.
3. Edit `samples/secret/secret.yaml` file and configure connection information for your PowerStore arrays changing following parameters:
    - *endpoint*: defines the full URL path to the PowerStore API.
    - *globalID*: specifies what storage cluster the driver should use  
    - *username*, *password*: defines credentials for connecting to array.
    - *skipCertificateValidation*: defines if we should use insecure connection or not.
    - *isDefault*: defines if we should treat the current array as a default.
    - *blockProtocol*: defines what transport protocol we should use (FC, ISCSI, NVMeTCP, NVMeFC, None, or auto).
    - *nasName*: defines what NAS should be used for NFS volumes.
	- *nfsAcls* (Optional): defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory.
	             NFSv4 ACls are supported for NFSv4 shares on NFSv4 enabled NAS servers only. POSIX ACLs are not supported and only POSIX mode bits are supported for NFSv3 shares.
    
    Add more blocks similar to above for each PowerStore array if necessary. If replication feature is enabled, ensure the secret includes all the PowerStore arrays involved in replication.
    ### User Privileges
    The username specified in `secret.yaml` must be from the authentication providers of PowerStore. The user must have the correct user role to perform the actions. The minimum requirement is **Storage Operator**.

4. Create the secret by running 
   ```bash
   kubectl create secret generic powerstore-config -n csi-powerstore --from-file=config=secret.yaml
   ```
5. Create storage classes using ones from `samples/storageclass` folder as an example and apply them to the Kubernetes cluster by running `kubectl create -f <path_to_storageclass_file>`
   
    > If you do not specify `arrayID` parameter in the storage class then the array that was specified as the default would be used for provisioning volumes.
6. Download the default values.yaml file 
   ```bash
   cd dell-csi-helm-installer && wget -O my-powerstore-settings.yaml https://github.com/dell/helm-charts/raw/csi-powerstore-2.10.0/charts/csi-powerstore/values.yaml
   ```
7. Edit the newly created values file and provide values for the following parameters `vi my-powerstore-settings.yaml`:

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| images | List all the images used by the CSI driver and CSM. If you use a private repository, change the registries accordingly. | Yes | "" |
| logLevel | Defines CSI driver log level | No | "debug" |
| logFormat | Defines CSI driver log format | No | "JSON" |
| externalAccess | Defines additional entries for hostAccess of NFS volumes, single IP address and subnet are valid entries | No | " " |
| kubeletConfigDir | Defines kubelet config path for cluster | Yes | "/var/lib/kubelet" |
| maxPowerstoreVolumesPerNode | Defines the default value for maximum number of volumes that the controller can publish to the node. If the value is zero, then CO shall decide how many volumes of this type can be published by the controller to the node. This limit is applicable to all the nodes in the cluster for which the node label 'max-powerstore-volumes-per-node' is not set. | No | 0 |
| imagePullPolicy | Policy to determine if the image should be pulled prior to starting the container. | Yes | "IfNotPresent" |
| nfsAcls | Defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory. | No | "0777" |
| connection.enableCHAP   | Defines whether the driver should use CHAP for iSCSI connections or not | No | False |
| controller.controllerCount     | Defines number of replicas of controller deployment | Yes | 2 |
| controller.volumeNamePrefix | Defines the string added to each volume that the CSI driver creates | No | "csivol" |
| controller.snapshot.enabled | Allows to enable/disable snapshotter sidecar with driver installation for snapshot feature | No | "true" |
| controller.snapshot.snapNamePrefix | Defines prefix to apply to the names of a created snapshots | No | "csisnap" |
| controller.resizer.enabled | Allows to enable/disable resizer sidecar with driver installation for volume expansion feature | No | "true" |
| controller.healthMonitor.enabled | Allows to enable/disable volume health monitor | No | false |
| controller.healthMonitor.interval | Interval of monitoring volume health condition | No | 60s |
| controller.nodeSelector | Defines what nodes would be selected for pods of controller deployment | Yes | " " |
| controller.tolerations  | Defines tolerations that would be applied to controller deployment | Yes | " " |
| node.nodeNamePrefix | Defines the string added to each node that the CSI driver registers | No | "csi-node" |
| node.nodeIDPath | Defines a path to file with a unique identifier identifying the node in the Kubernetes cluster| No | "/etc/machine-id" |
| node.healthMonitor.enabled | Allows to enable/disable volume health monitor | No | false |
| node.nodeSelector | Defines what nodes would be selected for pods of node daemonset | Yes | " " |
| node.tolerations  | Defines tolerations that would be applied to node daemonset | Yes | " " |
| fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType` | No | "ReadWriteOnceWithFSType" |
| controller.vgsnapshot.enabled | Allows to enable/disable the volume group snapshot feature | No | "true" |
| version | To use any driver version | No | Latest driver version |
| allowAutoRoundOffFilesystemSize | Allows the controller to round off filesystem to 3Gi which is the minimum supported value | No | false |
| storageCapacity.enabled | Allows to enable/disable storage capacity tracking feature | No | true
| storageCapacity.pollInterval | Configure how often the driver checks for changed capacity | No | 5m
| podmon.enabled | Allows to enable/disable [Resiliency](../../../../../deployment/helm/modules/installation/resiliency#powerstore-specific-recommendations) feature | No | false

8. Install the driver using `csi-install.sh` bash script by running 
   ```bash
   ./csi-install.sh --namespace csi-powerstore --values ./my-powerstore-settings.yaml
   ``` 
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

The CSI driver for Dell PowerStore version 1.3 and later, `dell-csi-helm-installer` does not create any storage classes as part of the driver installation. A wide set of annotated storage class manifests have been provided in the `samples/storageclass` folder. Use these samples to create new storage classes to provision storage.

### What happens to my existing storage classes?

Upgrading from an older version of the driver: The storage classes will be deleted if you upgrade the driver. If you wish to continue using those storage classes, you can patch them and apply the annotation “helm.sh/resource-policy”: keep before performing an upgrade.

>Note: If you continue to use the old storage classes, you may not be able to take advantage of any new storage class parameter supported by the driver.

**Steps to create storage class:**

There are samples storage class yaml files available under `samples/storageclass`.  These can be copied and modified as needed.

1. Edit the sample storage class yaml file and update following parameters: 
- *arrayID*: specifies what storage cluster the driver should use, if not specified driver will use storage cluster specified as `default` in `samples/secret/secret.yaml`
- *csi.storage.k8s.io/fstype*: specifies what filesystem type driver should use, possible variants `ext3`, `ext4`, `xfs`, `nfs`, if not specified driver will use `ext4` by default.
- *nfsAcls* (Optional): defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory.
- *allowedTopologies* (Optional): If you want you can also add topology constraints.
    ```yaml
    allowedTopologies:
      - matchLabelExpressions: 
          - key: csi-powerstore.dellemc.com/12.34.56.78-iscsi
      # replace "-iscsi" with "-fc", "-nvmetcp" or "-nvmefc" or "-nfs" at the end to use FC, NVMeTCP, NVMeFC or NFS enabled hosts
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

Starting CSI PowerStore v1.4.0, `dell-csi-helm-installer` will not create any Volume Snapshot Class during the driver installation. There is a sample Volume Snapshot Class manifest present in the _samples/volumesnapshotclass_ folder. Please use this sample to create a new Volume Snapshot Class to create Volume Snapshots.

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
```bash
cd dell-csi-helm-installer
./csi-install.sh --namespace csi-powerstore --values ./my-powerstore-settings.yaml --upgrade
```

Note: here `my-powerstore-settings.yaml` is a `values.yaml` file which user has used for driver installation.  
