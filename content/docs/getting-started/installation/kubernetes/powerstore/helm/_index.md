---
title: "Installation Guide"
linkTitle: "Helm"
no_list: true
description: Helm Installation
weight: 3
---
1. Set up a Kubernetes cluster following the official documentation.
2. Proceed to the [Prerequisite](../prerequisite/_index.md).
3. Complete the base installation.
4. Proceed with module installation.
### Install Helm 3.x

Install Helm 3.x on the master node before you install the CSI Driver for PowerStore.

**Steps**

  Run the command to install Helm 3.x.

  ```bash
  curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
  ```
{{< accordion id="One" title="CSM Installation Wizard" >}}
    {{<include  file="content/docs/getting-started/installation/installationwizard/helm.md" Var="powerstore" hideIds="2,4">}}
{{< /accordion >}}

<br>

{{< accordion id="Two" title="Base Install" markdown="true" >}}

### Volume Snapshot Requirements (Optional)
For detailed snapshot setup procedure, [click here.](docs/concepts/snapshots/#helm-optional-volume-snapshot-requirements)

### Volume Health Monitoring (Optional)

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

## Install Driver

**Steps**
1. Run `git clone -b {{< version-docs key="PStore_latestVersion" >}} https://github.com/dell/csi-powerstore.git` to clone the git repository.
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
   cd dell-csi-helm-installer && wget -O my-powerstore-settings.yaml https://github.com/dell/helm-charts/raw/csi-powerstore-2.14.0/charts/csi-powerstore/values.yaml
   ```
7. Edit the newly created values file and provide values for the following parameters `vi my-powerstore-settings.yaml`:
<ul>
{{< collapse id="1" title="Parameters">}}
| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
|<div style="text-align: left"> images |<div style="text-align: left"> List all the images used by the CSI driver and CSM. If you use a private repository, change the registries accordingly. | Yes | "" |
|<div style="text-align: left"> logLevel |<div style="text-align: left"> Defines CSI driver log level | No | "debug" |
|<div style="text-align: left"> logFormat |<div style="text-align: left"> Defines CSI driver log format | No | "JSON" |
|<div style="text-align: left"> externalAccess |<div style="text-align: left"> Defines additional entries for hostAccess of NFS volumes, single IP address and subnet are valid entries | No | " " |
|<div style="text-align: left"> kubeletConfigDir |<div style="text-align: left"> Defines kubelet config path for cluster | Yes | "/var/lib/kubelet" |
|<div style="text-align: left"> maxPowerstoreVolumesPerNode |<div style="text-align: left"> Defines the default value for maximum number of volumes that the controller can publish to the node. If the value is zero, then CO shall decide how many volumes of this type can be published by the controller to the node. This limit is applicable to all the nodes in the cluster for which the node label 'max-powerstore-volumes-per-node' is not set. | No | 0 |
|<div style="text-align: left"> imagePullPolicy |<div style="text-align: left"> Policy to determine if the image should be pulled prior to starting the container. | Yes | "IfNotPresent" |
|<div style="text-align: left"> nfsAcls |<div style="text-align: left"> Defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory. | No | "0777" |
|<div style="text-align: left"> nfsExportDirectory |<div style="text-align: left"> Define the file path of the underlying cluster node where Shared NFS volumes will be mounted. | No | "/var/lib/dell/nfs" |
|<div style="text-align: left"> nfsServerPort |<div style="text-align: left"> Define the port for the Shared NFS server. This value must match what port the nfs-server is configured on. See /etc/nfs.conf on the worker nodes for port information. | No | "2049" |
|<div style="text-align: left"> nfsClientPort |<div style="text-align: left"> Define the port for the Shared NFS client. | No | "2050" |
|<div style="text-align: left"> connection.enableCHAP   |<div style="text-align: left"> Defines whether the driver should use CHAP for iSCSI connections or not | No | False |
|<div style="text-align: left"> controller.controllerCount     |<div style="text-align: left"> Defines number of replicas of controller deployment | Yes | 2 |
|<div style="text-align: left"> controller.volumeNamePrefix |<div style="text-align: left"> Defines the string added to each volume that the CSI driver creates | No | "csivol" |
|<div style="text-align: left"> controller.snapshot.enabled |<div style="text-align: left"> Allows to enable/disable snapshotter sidecar with driver installation for snapshot feature | No | "true" |
|<div style="text-align: left"> controller.snapshot.snapNamePrefix |<div style="text-align: left"> Defines prefix to apply to the names of a created snapshots | No | "csisnap" |
|<div style="text-align: left"> controller.resizer.enabled |<div style="text-align: left"> Allows to enable/disable resizer sidecar with driver installation for volume expansion feature | No | "true" |
| <div style="text-align: left">controller.healthMonitor.enabled |<div style="text-align: left"> Allows to enable/disable volume health monitor | No | false |
|<div style="text-align: left"> controller.healthMonitor.interval |<div style="text-align: left"> Interval of monitoring volume health condition | No | 60s |
|<div style="text-align: left"> controller.nodeSelector |<div style="text-align: left"> Defines what nodes would be selected for pods of controller deployment | Yes | " " |
|<div style="text-align: left"> controller.tolerations  |<div style="text-align: left"> Defines tolerations that would be applied to controller deployment | Yes | " " |
|<div style="text-align: left"> node.nodeNamePrefix |<div style="text-align: left"> Defines the string added to each node that the CSI driver registers | No | "csi-node" |
|<div style="text-align: left"> node.nodeIDPath |<div style="text-align: left"> Defines a path to file with a unique identifier identifying the node in the Kubernetes cluster| No | "/etc/machine-id" |
|<div style="text-align: left"> node.healthMonitor.enabled |<div style="text-align: left"> Allows to enable/disable volume health monitor | No | false |
|<div style="text-align: left"> node.nodeSelector |<div style="text-align: left"> Defines what nodes would be selected for pods of node daemonset | Yes | " " |
|<div style="text-align: left"> node.tolerations  |<div style="text-align: left"> Defines tolerations that would be applied to node daemonset | Yes | " " |
|<div style="text-align: left"> fsGroupPolicy |<div style="text-align: left"> Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType` | No | "ReadWriteOnceWithFSType" |
|<div style="text-align: left"> version |<div style="text-align: left"> To use any driver version | No | Latest driver version |
|<div style="text-align: left"> allowAutoRoundOffFilesystemSize | <div style="text-align: left">Allows the controller to round off filesystem to 3Gi which is the minimum supported value | No | false |
|<div style="text-align: left"> storageCapacity.enabled |<div style="text-align: left"> Allows to enable/disable storage capacity tracking feature | No | true
|<div style="text-align: left"> storageCapacity.pollInterval |<div style="text-align: left"> Configure how often the driver checks for changed capacity | No | 5m
|<div style="text-align: left"> podmon.enabled |<div style="text-align: left"> Allows to enable/disable [Resiliency](./csm-modules/resiliency#powerstore-specific-recommendations) feature | No | false
{{< /collapse >}}
</ul>

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

The CSI driver for PowerStore version 1.3 and later, `dell-csi-helm-installer` does not create any storage classes as part of the driver installation. A wide set of annotated storage class manifests have been provided in the `samples/storageclass` folder. Use these samples to create new storage classes to provision storage.

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
> ℹ️ **NOTE:**: Updates to the secret that include adding a new array, or modifying the endpoint, globalID, or blockProtocol parameters
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
{{< /accordion >}}

<br>

{{< accordion id="Three" title="Modules" >}}

{{< cardcontainer >}}

    {{< customcard  link1="./csm-modules/observability"   image="1" title="Observability"  >}}

    {{< customcard  link1="./csm-modules/replication"  image="1" title="Replication"  >}}

    {{< customcard link1="./csm-modules/resiliency"   image="1" title="Resiliency"  >}}

{{< /cardcontainer >}}

{{< /accordion >}}
