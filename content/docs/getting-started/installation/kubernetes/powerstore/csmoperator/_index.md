---
title: Installation Guide
linkTitle: Operator
weight: 2
description: >
  Installing the CSI Driver for PowerStore via CSM Operator
no_list: true
---

1. Set up a Kubernetes cluster following the official documentation.
2. Proceed to the [Prerequisite](../prerequisite/_index.md).
3. Complete the base installation.
4. Proceed with module installation.

## Operator Installation
To deploy the Operator, follow the instructions available [here](../../../operator/operatorinstallation_kubernetes.md).



<br>

{{< accordion id="Two" title="Base Install" markdown="true" >}}

### CSI Driver Installation

<br>

1. **Create Namespace.**
   ```bash
      kubectl create namespace powerstore
   ```
   This command creates a namespace called `powerstore`. You can replace `powerstore` with any name you prefer.

2. **Create `secret.yaml`.**

   a. Create a file called `secret.yaml` or pick a [sample](https://github.com/dell/csi-powerstore/blob/main/samples/secret/secret.yaml) that has PowerStore array connection details:

   ```yaml
   arrays:
    - endpoint: "https://11.0.0.1/api/rest"
        globalID: "unique"
        username: "user"
        password: "password"
        skipCertificateValidation: true
        blockProtocol: "auto"
   ```
   **Note** :
    skipCertificateValidation flag is currently unsupported. Please refrain from changing its value.
    
      - **Update Parameters:** Replace placeholders with actual values for your PowerStore array.
      - **Add Blocks:** If you have multiple PowerStore arrays, add similar blocks for each one.
      - **Replication:** If replication is enabled, make sure the `config.yaml` includes all involved PowerStore arrays.
  </br>
  </br>

   **User Privileges**

   The username in `secret.yaml` must be from PowerStore’s authentication providers and have at least the **Storage Operator** role.

   b. After editing the file, **run this command to create a `secret.yaml`** called `powerstore-config`.

   ```bash
   kubectl create secret generic -n powerstore powerstore-config --from-file=config=secret.yaml
   ```

3. **Install Driver**

   i. **Create a CR (Custom Resource)** for PowerStore using the sample files provided

   a. **Minimal Configuration:**

   ```yaml
   apiVersion: storage.dell.com/v1
   kind: ContainerStorageModule
   metadata:
   name: powerstore
   namespace: powerstore
   spec:
   driver:
      csiDriverType: "powerstore"
      configVersion: {{< version-docs key="PStore_latestVersion" >}}
      forceRemoveDriver: true
   ```
     [sample file](https://github.com/dell/csm-operator/blob/main/samples/{{< version-docs key="csm-operator_latest_samples_dir" >}}/minimal-samples/powerstore_{{< version-docs key="Min_sample_operator_pstore" >}}.yaml) for default settings. Modify if needed.

    [OR]

    b. **Detailed Configuration:**  [sample file](https://github.com/dell/csm-operator/blob/main/samples/{{< version-docs key="csm-operator_latest_samples_dir" >}}/storage_csm_powerstore_{{< version-docs key="Det_sample_operator_pstore" >}}.yaml) for detailed settings or use [Wizard](./installationwizard#generate-manifest-file) to generate the sample file.

   - Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerStore driver and their default values:

<ul>
{{< collapse id="1" title="Parameters">}}
  | Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
|<div style="text-align: left"> replicas </div>| <div style="text-align: left">Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be in pending state until new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
|<div style="text-align: left"> namespace | <div style="text-align: left">Specifies namespace where the driver will be installed | Yes | "powerstore" |
| <div style="text-align: left">fsGroupPolicy |<div style="text-align: left"> Defines which FS Group policy mode to be used. Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No |"ReadWriteOnceWithFSType"|
|<div style="text-align: left"> storageCapacity | <div style="text-align: left"> Enable/Disable storage capacity tracking feature | No | false |
|<div style="text-align: left"> ***Common parameters for node and controller*** |
|<div style="text-align: left"> X_CSI_POWERSTORE_NODE_NAME_PREFIX |<div style="text-align: left"> Prefix to add to each node registered by the CSI driver | Yes | "csi-node"
|<div style="text-align: left"> X_CSI_FC_PORTS_FILTER_FILE_PATH | <div style="text-align: left">To set path to the file which provides a list of WWPN which should be used by the driver for FC connection on this node | No | "/etc/fc-ports-filter" |
|<div style="text-align: left"> GOPOWERSTORE_DEBUG | <div style="text-align: left"> Enable/Disable gopowerstore library-level debugging. | No | false |
|<div style="text-align: left"> ***Controller parameters*** |
|<div style="text-align: left"> X_CSI_POWERSTORE_EXTERNAL_ACCESS |<div style="text-align: left"> allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | empty |
|<div style="text-align: left"> X_CSI_NFS_ACLS | <div style="text-align: left"> Defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory. | No | "0777" |
|<div style="text-align: left"> X_CSI_MULTI_NAS_FAILURE_THRESHOLD | <div style="text-align: left"> Number of consecutive FS creation failures after which a NAS is put into cooldown. Please refer [Multi NAS Support](../../../../../concepts/csidriver/features/powerstore#multi-nas-support) for more details. | No | "5" |
|<div style="text-align: left"> X_CSI_MULTI_NAS_COOLDOWN_PERIOD | <div style="text-align: left"> Duration for which a NAS remains in cooldown once the threshold is reached. Please refer [Multi NAS Support](../../../../../concepts/csidriver/features/powerstore#multi-nas-support) for more details. | No | "5m" |
|<div style="text-align: left"> ***Node parameters*** |
|<div style="text-align: left"> X_CSI_POWERSTORE_ENABLE_CHAP |<div style="text-align: left"> Set to true if you want to enable iSCSI CHAP feature | No | false |
{{< /collapse >}}


   ii. **Create PowerStore custom resource**:

   ```bash
   kubectl create -f <input_sample_file.yaml>
   ```
   This command will deploy the CSI PowerStore driver in the namespace specified in the input YAML file.

   - Check driver pods **status** by running the appropriate command
      ```bash
      kubectl get all -n powerstore
      ```
</ul>

1. **Verify the installation** as mentioned below

    * Check if ContainerStorageModule CR is created successfully using the command below:
        ```bash
        kubectl get csm/powerstore -n powerstore -o yaml
        ```
    * Check the status of the CR to verify if the driver installation is in the `Succeed` state. If the status is not `Succeed`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.

   </br>

2. **Create Storage Class** 

   ```yaml
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
   name: "powerstore-ext4"
   provisioner: "csi-powerstore.dellemc.com"
   parameters:
   csi.storage.k8s.io/fstype: "ext4"
   reclaimPolicy: Delete
   allowVolumeExpansion: true
   volumeBindingMode: Immediate
   ````

   Refer [Storage Class](https://github.com/dell/csi-powerstore/tree/main/samples/storageclass) for different sample files.

   **Run this command to create** a storage class

   ```bash
     kubectl create -f < storage-class.yaml >
   ```

3. **Create Volume Snapshot Class** 
   ```yaml 
   apiVersion: snapshot.storage.k8s.io/v1
   kind: VolumeSnapshotClass
   metadata:
     name: powerstore-snapshot
   driver: "csi-powerstore.dellemc.com"
   deletionPolicy: Delete
   ````
   Refer [Volume Snapshot Class](https://github.com/dell/csi-powerstore/tree/main/samples/volumesnapshotclass) for the sample files.

   **Run this command to create** a volume snapshot class
   ```bash
      kubectl create -f < volume-snapshot-class.yaml >
   ```

**Note** :
   - "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
   - Snapshotter and resizer sidecars are not optional. They are defaults with Driver installation.

{{< /accordion >}}
<br>

{{< accordion id="Three" title="Modules" >}}

<br>
{{< markdownify >}}
The driver and modules versions installable with the Container Storage Modules Operator [Click Here](../../../../../supportmatrix/#operator-compatibility-matrix)
{{< /markdownify >}}
<br>
{{< cardcontainer >}}

{{< customcard link1="./csm-modules/authorizationv2-0"   image="6" title="Authorization v2.0"  >}}

{{< customcard link1="./csm-modules/resiliency"   image="6" title="Resiliency"  >}}

{{< customcard link1="./csm-modules/replication"   image="6" title="Replication"  >}}

{{< customcard link1="./csm-modules/observability"   image="6" title="Observability"  >}}

{{< /cardcontainer >}}

{{< /accordion >}}
