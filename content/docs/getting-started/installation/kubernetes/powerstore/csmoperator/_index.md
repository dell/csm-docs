---
title: Operator
linkTitle: Operator
weight: 2
description: >
  Installing the CSI Driver for PowerStore via CSM Operator
no_list: true
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

## Operator Installation
To deploy the Operator, follow the instructions available [here](../../../operator/operatorinstallation_kubernetes.md).

{{< accordion id="One" title="CSM Installation Wizard" >}}
  {{< include file="content/docs/getting-started/installation/installationwizard/operator.md" hideIds="1,2,3" >}}
{{< /accordion >}}

<br>

{{< accordion id="Two" title="CSI Driver" markdown="true" >}}  

### CSI Driver Installation

<br>

1. **Create Namespace.**    
   ```bash 
      kubectl create namespace powerstore
   ```
   This command creates a namespace called `powerstore`. You can replace `powerstore` with any name you prefer.

2. **Create `secret.yaml`.** 
   
   a. Create a file called `secret.yaml` or pick a [sample](https://github.com/dell/csi-powerstore/blob/main/samples/secret/secret.yaml) that has Powerstore array connection details: 

   ```yaml
   arrays:
    - endpoint: "https://11.0.0.1/api/rest"
        globalID: "unique"
        username: "user"
        password: "password"
        skipCertificateValidation: true
        blockProtocol: "FC"
   ```
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
      configVersion: v2.13.0
      forceRemoveDriver: true
   ```
     [sample file](https://github.com/dell/csm-operator/blob/main/samples/minimal-samples/powerstore_v2130.yaml) for default settings. Modify if needed.

    [OR]                                                

    b. **Detailed Configuration:**  [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerstore_v2130.yaml) for detailed settings.

   - Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerStore driver and their default values: 
   
<ul>
{{< collapse id="1" title="Parameters">}}
  | Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be in pending state until new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
| namespace | Specifies namespace where the driver will be installed | Yes | "powerstore" |
| fsGroupPolicy | Defines which FS Group policy mode to be used. Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No |"ReadWriteOnceWithFSType"|
| storageCapacity | Enable/Disable storage capacity tracking feature | No | false |
| ***Common parameters for node and controller*** |
| X_CSI_POWERSTORE_NODE_NAME_PREFIX | Prefix to add to each node registered by the CSI driver | Yes | "csi-node"
| X_CSI_FC_PORTS_FILTER_FILE_PATH | To set path to the file which provides a list of WWPN which should be used by the driver for FC connection on this node | No | "/etc/fc-ports-filter" |
| ***Controller parameters*** |
| X_CSI_POWERSTORE_EXTERNAL_ACCESS | allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | empty |
| X_CSI_NFS_ACLS | Defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory. | No | "0777" |
| ***Node parameters*** |
| X_CSI_POWERSTORE_ENABLE_CHAP | Set to true if you want to enable iSCSI CHAP feature | No | false |
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

4. **Verify the installation** as mentioned below

    * Check if ContainerStorageModule CR is created successfully using the command below:
        ```bash
        kubectl get csm/powerstore -n powerstore -o yaml
        ```
    * Check the status of the CR to verify if the driver installation is in the `Succeed` state. If the status is not `Succeed`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.

   </br>

5. **Create Storage Class** 

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

6. **Create Volume Snapshot Class** 
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

{{< accordion id="Three" title="CSM Modules" >}}

<br>  
{{< markdownify >}}
The driver and modules versions installable with the Container Storage Module Operator [Click Here](../../../../../supportmatrix/#operator-compatibility-matrix)
{{< /markdownify >}}
<br>   
{{< cardcontainer >}}

{{< customcard link1="./csm-modules/resiliency"   image="6" title="Resiliency"  >}}

{{< /cardcontainer >}}

{{< /accordion >}}  