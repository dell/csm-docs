---
title: "Installation Guide"
linktitle: "Operator"
no_list: true
description: CSM Operator Installation
weight: 2
---
1. Set up a Kubernetes cluster following the official documentation.
2. Complete the base installation.
3. Proceed with module installation.
## Operator Installation
To deploy the Operator, follow the instructions available [here](../../../operator/operatorinstallation_kubernetes.md).


<br>

{{< accordion id="Two" title="Base Install" markdown="true" >}}  
### Install CSI Driver

</br>

1. **Create namespace:**

   ```bash 
      kubectl create namespace isilon
   ```
   This command creates a namespace called `isilon`. You can replace `isilon` with any name you prefer.

2. **Create `secret` file:**.

   a. Create a file called `secret.yaml` or pick a [sample](https://github.com/dell/csi-powerscale/blob/main/samples/secret/secret.yaml) that has PowerScale array connection details:
      ```yaml
     isilonClusters:
      - clusterName: "cluster2"
         username: "user"
         password: "password"
         endpoint: "1.2.3.4"
         endpointPort: "8080"
     ```
      - **Update Parameters:** Replace placeholders with actual values for your PowerScale array.
      - **Add Blocks:** If you have multiple PowerScale arrays, add similar blocks for each one.
      - **Replication:** If replication is enabled, make sure the `secret.yaml` includes all involved PowerScale arrays.
   
   </br>
   b. After creating the secret.yaml, the following command can be used to create the secret,

   ```bash
   kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml
   ```

   Use the following command to **replace or update the secret**

   ```bash
   kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml -o yaml --dry-run | kubectl replace -f -
   ```
   **Note**: The user needs to validate the YAML syntax and array related key/values while replacing the isilon-creds secret.
   The driver will continue to use previous values in case of an error found in the YAML file.

3. **Create isilon-certs-n secret.**

      Please refer [this section](../helm#certificate-validation-for-onefs-rest-api-calls) for creating cert-secrets.

      If certificate validation is skipped, empty secret must be created. To create an empty secret. Ex: empty-secret.yaml

      ```yaml
      apiVersion: v1
      kind: Secret
      metadata:
         name: isilon-certs-0
         namespace: isilon
      type: Opaque
      data:
         cert-0: ""
      ```

      ```bash
       kubectl create -f empty-secret.yaml
      ```

4. **Install Driver**

   i. **Create a CR (Custom Resource)** for PowerFlex using the sample files provided

    a. **Minimal Configuration:**
      ```yaml
      apiVersion: storage.dell.com/v1
      kind: ContainerStorageModule
      metadata:
      name: isilon
      namespace: isilon
      spec:
      driver:
         csiDriverType: "isilon"
         configVersion: {{< version-v1 key="PScale_latestVersion" >}}
         forceRemoveDriver: true
   ```
      [sample file](https://github.com/dell/csm-operator/blob/main/samples/minimal-samples/powerscale_{{< version-v1 key="sample_sc_pflex" >}}.yaml) for default settings. Modify if needed.

    [OR]                                                

    b. **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerscale_{{< version-v1 key="sample_sc_pscale" >}}.yaml) for detailed settings or use [Wizard](./installationwizard#generate-manifest-file) to generate the sample file.

 -  Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerScale driver and their default values:
   <ul>
   {{< collapse id="1" title="Parameters">}}
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   |<div style="text-align: left"> dnsPolicy |<div style="text-align: left"> Determines the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
   |<div style="text-align: left"> fsGroupPolicy |<div style="text-align: left"> Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No | "ReadWriteOnceWithFSType" |
   |<div style="text-align: left"> storageCapacity |<div style="text-align: left"> Enable/Disable storage capacity tracking feature | No | false |
   |<div style="text-align: left"> ***Common parameters for node and controller*** |
   |<div style="text-align: left"> CSI_ENDPOINT |<div style="text-align: left"> The UNIX socket address for handling gRPC calls | No | /var/run/csi/csi.sock |
   |<div style="text-align: left"> X_CSI_ISI_SKIP_CERTIFICATE_VALIDATION |<div style="text-align: left"> Specifies whether SSL security needs to be enabled for communication between PowerScale and CSI Driver | No | true |
   |<div style="text-align: left"> X_CSI_ISI_PATH |<div style="text-align: left"> Base path for the volumes to be created | Yes | |
   |<div style="text-align: left"> X_CSI_ALLOWED_NETWORKS |<div style="text-align: left"> Custom networks for PowerScale export. List of networks that can be used for NFS I/O traffic, CIDR format should be used | No | empty |
   |<div style="text-align: left"> X_CSI_ISI_AUTOPROBE |<div style="text-align: left"> To enable auto probing for driver | No | true |
   |<div style="text-align: left"> X_CSI_ISI_NO_PROBE_ON_START |<div style="text-align: left"> Indicates whether the controller/node should probe during initialization | Yes | |
   | X_CSI_ISI_VOLUME_PATH_PERMISSIONS | The permissions for isi volume directory path | Yes | 0777 |
   |<div style="text-align: left"> X_CSI_ISI_AUTH_TYPE |<div style="text-align: left"> Indicates the authentication method to be used. If set to 1 then it follows as session-based authentication else basic authentication. If CSM Authorization is enabled, this value must be set to 1. | No | 0 |
   |<div style="text-align: left"> GOISILON_DEBUG |<div style="text-align: left"> Enable/Disable gopowerscale library-level debugging. | No | false |
   |<div style="text-align: left"> ***Controller parameters*** |
   |<div style="text-align: left"> X_CSI_MODE   |<div style="text-align: left"> Driver starting mode  | No | controller |
   |<div style="text-align: left"> X_CSI_ISI_ACCESS_ZONE |<div style="text-align: left"> Name of the access zone a volume can be created in | No | System |
   |<div style="text-align: left"> X_CSI_ISI_QUOTA_ENABLED |<div style="text-align: left"> To enable SmartQuotas | Yes | |
   |<div style="text-align: left"> ***Node parameters*** |
   |<div style="text-align: left"> X_CSI_MAX_VOLUMES_PER_NODE |<div style="text-align: left"> Specify the default value for the maximum number of volumes that the controller can publish to the node | Yes | 0 |
   |<div style="text-align: left"> X_CSI_MODE   |<div style="text-align: left"> Driver starting mode  | No | node |
   {{< /collapse >}}


ii. **Create PowerScale custom resource**:

   ```bash
   kubectl create -f <input_sample_file.yaml>
   ```
   This command will deploy the PowerScale driver in the namespace specified in the input YAML file.

   </ul>

5. **Verify the installation** as mentioned below

    * Check if ContainerStorageModule CR is created successfully using the command below:
        ```bash
        kubectl get csm/isilon -n isilon
        ```
    * Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.

</br>

6. **Create Storage Class**

    ```yaml
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
      name: isilon
   provisioner: csi-isilon.dellemc.com
   reclaimPolicy: Delete
   allowVolumeExpansion: true
   parameters:
      AccessZone: System
      IsiPath: /ifs/data/csi
      RootClientEnabled: "false"
   volumeBindingMode: Immediate
    ````
   Refer [Storage Class](https://github.com/dell/csi-powerscale/tree/main/samples/storageclass) for different sample files.

   **Run this command to create** a storage class

   ```bash
     kubectl create -f < storage-class.yaml >
   ```

 7. **Create Volume Snapshot Class**
    ```yaml
      apiVersion: snapshot.storage.k8s.io/v1
      kind: VolumeSnapshotClass
      metadata:
         name: isilon-snapclass
      driver: csi-isilon.dellemc.com
      deletionPolicy: Delete
      parameters:
         IsiPath: /ifs/data/csi
    ````

     Refer [Volume Snapshot Class](https://github.com/dell/csi-powerscale/blob/main/samples/volumesnapshotclass/) for the sample files.

     **Run this command to create** a volume snapshot class
     ```bash
       kubectl create -f < volume-snapshot-class.yaml >
     ```

**Note** :

   - "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
   - Also, snapshotter and resizer sidecars are not optional to choose, it comes default with Driver installation.

{{< /accordion >}}
<br>
{{< accordion id="Three" title="Modules" >}}
<br>  
{{< markdownify >}}
The driver and modules versions installable with the Container Storage Modules Operator [Click Here](../../../../../supportmatrix/#operator-compatibility-matrix)
{{< /markdownify >}}
<br>   
{{< cardcontainer >}}
    {{< customcard link1="./csm-modules/authorizationv1-x"  image="6" title="Authorization v1.x" >}}

    {{< customcard link1="./csm-modules/authorizationv2-0"   image="6" title="Authorization v2.0"  >}}

    {{< customcard  link1="./csm-modules/observability"   image="6" title="Observability"  >}}

    {{< customcard  link1="./csm-modules/replication"  image="6" title="Replication"  >}}

    {{< customcard link1="./csm-modules/resiliency"   image="6" title="Resiliency"  >}}

{{< /cardcontainer >}}
{{< /accordion >}}
