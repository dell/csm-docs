---
title: PowerStore
linkTitle: PowerStore
description: >
  Installing the CSI Driver for Dell PowerStore via Helm
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

The CSI Driver for Dell PowerStore can be deployed by using the provided Helm v3 charts and installation scripts on both Kubernetes and OpenShift platforms. For more detailed information on the installation scripts, review the script [documentation](https://github.com/dell/csi-powerstore/tree/master/dell-csi-helm-installer).

## Prerequisites

The following requirements must be met before installing the CSI Driver for Dell PowerStore:

- A Kubernetes or OpenShift cluster (see [supported versions](../../../../../csidriver/#features-and-capabilities))
- Install Helm 3.x
- Refer to the sections below for protocol specific requirements.
- If you want to use pre-configured iSCSI/FC hosts be sure to check that they are not part of any host group.
- Linux multipathing requirements (described later).
- Mount propagation is enabled on the container runtime that is being used.
- If using Snapshot feature, satisfy all Volume Snapshot requirements.
- Insecure registries are defined in Docker or other container runtime for CSI drivers that are hosted in a non-secure location.
- Ensure that your nodes support mounting NFS volumes if using NFS.
- For NVMe support the preferred multipath solution is NVMe native multipathing. The [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) describes the details of each configuration option.

### Install Helm 3.x

Install Helm 3.x on the master node before you install the CSI Driver for Dell PowerStore.

**Steps**

  Run the command to install Helm 3.x.

  ```bash
  curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
  ```

### Fibre Channel requirements

The following requirements must be fulfilled in order to successfully use the Fiber Channel protocol with the CSI PowerStore driver:

- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel ports on the PowerStore arrays must be done.
- If the number of volumes that will be published to nodes is high, then configure the maximum number of LUNs for your HBAs on each node. See the appropriate HBA document to configure the maximum number of LUNs.

### iSCSI Requirements

The following requirements must be fulfilled in order to successfully use the iSCSI protocol with the CSI PowerStore driver:

- All Kubernetes nodes must have the _iscsi-initiator-utils_ package installed. On Debian based distributions the package name is  _open-iscsi_.
- The _iscsid_ service must be enabled and running. You can enable the service by running the following command on all worker nodes: `systemctl enable --now iscsid`
- To configure iSCSI in Red Hat OpenShift clusters, you can create a `MachineConfig` object using the console or `oc` to ensure that the iSCSI daemon starts on all the Red Hat CoreOS nodes. Here is an example of a `MachineConfig` object:

```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: 99-iscsid
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 3.2.0
    systemd:
      units:
      - name: "iscsid.service"
        enabled: true
```

Once the `MachineConfig` object has been deployed, CoreOS will ensure that the `iscsid.service` starts automatically. You can check the status of the iSCSI service by entering the following command on each worker node in the cluster: `sudo systemctl status iscsid`.

- Ensure that the iSCSI initiators are available on all the nodes where the driver node plugin will be installed.
- Ensure that the unique initiator name is set in _/etc/iscsi/initiatorname.iscsi_.
- Kubernetes nodes must have network connectivity to an iSCSI port on the Dell PowerStore array that
has IP interfaces.
- Ensure that the iSCSI initiators on the nodes are not a part of any existing Host or Host Group on the Dell PowerStore arrays. The driver will create host entries for the iSCSI initiators which adheres to the naming conventions required by the driver.

Refer to the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for more information.

### NVMe Requirements

The following requirements must be fulfilled in order to successfully use the NVMe protocols with the CSI PowerStore driver:

- All OpenShift or Kubernetes nodes connecting to Dell storage arrays must use unique host NQNs.
- The driver requires the NVMe command-line interface (nvme-cli) to manage the NVMe clients and targets. The NVMe CLI tool is installed in the host using the following command on RPM oriented Linux distributions.

```bash
sudo dnf -y install nvme-cli
```

- Support for NVMe requires native NVMe multipathing to be configured on each worker node in the cluster. Please refer to the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for more details on NVMe multipathing requirements. To determine if the worker nodes are configured for native NVMe multipathing run the following command on each worker node:

```bash
cat /sys/module/nvme_core/parameters/multipath
```

 >If the result of the command displays Y then NVMe native multipathing is enabled in the kernel. If the output is N then native NVMe multipating is disabled. Consult the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for Linux to enable native NVMe multipathing.

**Configure the IO policy**

- The default NVMeTCP native multipathing policy is "numa". The preferred IO policy for NVMe devices used for PowerStore is round-robin. You can use udev rules to enable the round robin policy on all worker nodes. To view the IO policy you can use the following command:

```bash
nvme list-subsys
```

To change the IO policy to round-robin you can add a udev rule on each worker node. Place a config file in /etc/udev/rules.d with the name 71-nvme-io-policy.rules with the following contents:

```text
ACTION=="add|change", SUBSYSTEM=="nvme-subsystem", ATTR{iopolicy}="round-robin"
```

In order to change the rules on a running kernel you can run the following commands:

```bash
/sbin/udevadm control --reload-rules
/sbin/udevadm trigger --type=devices --action=change
```

On OCP clusters you can add a MachineConfig to enable this rule on all worker nodes:

```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: 99-workers-multipath-round-robin
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 3.2.0
    storage:
      files:
      - contents:
          source: data:text/plain;charset=utf-8;base64,QUNUSU9OPT0iYWRkfGNoYW5nZSIsIFNVQlNZU1RFTT09Im52bWUtc3Vic3lzdGVtIiwgQVRUUntpb3BvbGljeX09InJvdW5kLXJvYmluIg==
          verification: {}
        filesystem: root
        mode: 420
        path: /etc/udev/rules.d/71-nvme-io-policy.rules
```

**Configure the control loss timeout**

To reduce the impact of PowerStore non disruptive software upgrades you must set the control loss timeout. This can be done using udev rules on each worker node. More information can be found in the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf). To configure the control loss timeout place a config file in /etc/udev/rules.d with the name 72-nvmf-ctrl_loss_tmo.rules with the following contents:

```text
ACTION=="add|change", SUBSYSTEM=="nvme", KERNEL=="nvme*", ATTR{ctrl_loss_tmo}="-1"
```
In order to change the rules on a running kernel you can run the following commands:

```bash
/sbin/udevadm control --reload-rules
/sbin/udevadm trigger --type=devices --action=change
```

On OCP clusters you can add a MachineConfig to enable this rule on all worker nodes:

```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: 99-nvmf-ctrl-loss-tmo
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 3.2.0
    storage:
      files:
      - contents:
          source: data:text/plain;charset=utf-8;base64,QUNUSU9OPT0iYWRkfGNoYW5nZSIsIFNVQlNZU1RFTT09Im52bWUiLCBLRVJORUw9PSJudm1lKiIsIEFUVFJ7Y3RybF9sb3NzX3Rtb309Ii0xIgo=
          verification: {}
        filesystem: root
        mode: 420
        path: /etc/udev/rules.d/72-nvmf-ctrl_loss_tmo.rules
```

**Requirements for NVMeTCP**

> Starting with OCP 4.14 NVMe/TCP is enabled by default on RCOS nodes.

- Modules including the nvme, nvme_core, nvme_fabrics, and nvme_tcp are required for using NVMe over Fabrics using TCP. Load the NVMe and NVMe-OF Modules using the below commands:
```bash
modprobe nvme
modprobe nvme_tcp
```
- The NVMe modules may not be available after a node reboot. Loading the modules at startup is recommended.

**Requirements for NVMeFC**
- NVMeFC Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port must be done.

> Do not load the nvme_tcp module for NVMeFC

### Linux multipathing requirements

Dell PowerStore supports Linux multipathing (DM-MPIO) and NVMe native multipathing. Configure Linux multipathing before installing the CSI Driver.

> For NVMe connectivity native NVMe multipathing is used. The following sections apply only for iSCSI and Fiber Channel connectivity.

Configure Linux multipathing as follows:
- Ensure that all nodes have the _Device Mapper Multipathing_ package installed.
  You can install it by running `dnf install device-mapper-multipath` or `apt install multipath-tools` based on your Linux distribution.
- Enable multipathing using the `mpathconf --enable --with_multipathd y` command.  A default configuration file, `/etc/multipath.conf` is created.
- Enable `user_friendly_names` and `find_multipaths` in the `multipath.conf` file.
- Ensure that the `multipath` command for `multipath.conf` is available on all Kubernetes nodes.

The following is a sample multipath.conf file:

```text
defaults {
  user_friendly_names yes
  find_multipaths yes
}
  blacklist {
}
```

On some distributions the multipathd service for changes to the configuration and dynamically reconfigures itself. If you need to manually trigger a reload you can run the following command:
`sudo systemctl reload multipathd`

On OCP clusters you can add a MachineConfig to configure multipathing on the worker nodes.

You will need to first base64 encode the multipath.conf and add it to the MachineConfig definition.

```bash
echo 'defaults {
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

After deploying this`MachineConfig` object, CoreOS will start the multipath service automatically.
Alternatively, you can check the status of the multipath service by running the following command on each worker node.
`sudo multipath -ll`

Refer to the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for more information.

### Volume Snapshot Requirements (Optional)
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
### Replication feature Requirements (Optional)

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
1. Run `git clone -b v2.12.0 https://github.com/dell/csi-powerstore.git` to clone the git repository.
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
   cd dell-csi-helm-installer && wget -O my-powerstore-settings.yaml https://github.com/dell/helm-charts/raw/csi-powerstore-2.12.0/charts/csi-powerstore/values.yaml
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
   ./csi-install.sh --namespace csi-powerstore --values ./my-powerstore-settings.yaml --helm-charts-version <version>
   ```
   - After that the driver should be installed, you can check the condition of driver pods by running `kubectl get all -n csi-powerstore`

*NOTE:*
- The parameter `--helm-charts-version` is optional and if you do not specify the flag, by default the `csi-install.sh` script will clone the version of the helm chart that is specified in the driver's [csi-install.sh](https://github.com/dell/csi-powerstore/blob/main/dell-csi-helm-installer/csi-install.sh#L13) file. If you wish to install the driver using a different version of the helm chart, you need to include this flag. Also, remember to delete the `helm-charts` repository present in the `csi-powerstore` directory if it was cloned before.
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

Starting with CSI PowerStore v1.4.0, `dell-csi-helm-installer` will not create any Volume Snapshot Class during the driver installation. There is a sample Volume Snapshot Class manifest present in the _samples/volumesnapshotclass_ folder. Please use this sample to create a new Volume Snapshot Class to create Volume Snapshots.

## Dynamically update the powerstore secrets

CSI PowerStore supports the ability to dynamically modify array information within the secret, allowing users to update
<u>_credentials_</u> for the PowerStore arrays, in-flight, without restarting the driver.
> Note: Updates to the secret that include adding a new array, or modifying the endpoint, globalID, or blockProtocol parameters
> require the driver to be restarted to properly pick up and process the changes.

User can update the secret using the following commands:
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
