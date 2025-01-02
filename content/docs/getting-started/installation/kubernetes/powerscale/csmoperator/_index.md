---
title: "Operator"
linktitle: "Operator"
no_list: true
description: CSM Operator Installation
weight: 2
---

## Installing the Operator
To deploy the Operator, follow the instructions available [here](../../../operator/operatorinstallation_kubernetes.md).

{{< accordion id="One" title="CSM Installation Wizard" >}}
  {{< include "content/docs/getting-started/installation/installationwizard/operator.md" >}}
{{< /accordion >}}
<br>

{{< accordion id="Two" title="CSI Driver" markdown="true" >}}  
### Prerequisite

1. **Create namespace:**

   ```bash 
      kubectl create namespace isilon
   ```
   This command creates a namespace called `isilon`. You can replace `isilon` with any name you prefer.

2. **Create or Use Sample `secret.yaml` File.** 

   Create a file called `secret.yaml` or pick a [sample](https://github.com/dell/csi-powerscale/blob/main/samples/secret/secret.yaml) that has Powerscale array connection details: 

   {{< collapse id="2" title="secret.yaml" card="false">}} 
   ```yaml
   isilonClusters:
      # logical name of PowerScale Cluster
      - clusterName: "cluster1"

         # username for connecting to PowerScale OneFS API server
         # Default value: None
         username: "user"

         # password for connecting to PowerScale OneFS API server
         password: "password"

         # HTTPS endpoint of the PowerScale OneFS API server
         # Default value: None
         # Examples: "1.2.3.4", "https://1.2.3.4", "https://abc.myonefs.com"
         endpoint: "1.2.3.4"

         # Is this a default cluster (would be used by storage classes without ClusterName parameter)
         # Allowed values:
         #   true: mark this cluster config as default
         #   false: mark this cluster config as not default
         # Default value: false
         isDefault: true

         # Specify whether the PowerScale OneFS API server's certificate chain and host name should be verified.
         # Allowed values:
         #   true: skip OneFS API server's certificate verification
         #   false: verify OneFS API server's certificates
         # Default value: default value specified in values.yaml
         # skipCertificateValidation: true

         # The base path for the volumes to be created on PowerScale cluster
         # This will be used if a storage class does not have the IsiPath parameter specified.
         # Ensure that this path exists on PowerScale cluster.
         # Allowed values: unix absolute path
         # Default value: default value specified in values.yaml
         # Examples: "/ifs/data/csi", "/ifs/engineering"
         # isiPath: "/ifs/data/csi"

         # The permissions for isi volume directory path
         # This will be used if a storage class does not have the IsiVolumePathPermissions parameter specified.
         # Allowed values: valid octal mode number
         # Default value: "0777"
         # Examples: "0777", "777", "0755"
         # isiVolumePathPermissions: "0777"

      - clusterName: "cluster2"
         username: "user"
         password: "password"
         endpoint: "1.2.3.4"
         endpointPort: "8080"
   ``` 


    
   {{< /collapse >}}

   Replace the values for the given keys as per your environment.

   If replication feature is enabled, ensure the secret includes all the PowerScale clusters involved in replication.

3. **Create Kubernetes secret:**
   
   After creating the secret.yaml, the following command can be used to create the secret,

   ```bash
   kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml
   ```

   Use the following command to replace or update the secret

   ```bash
   kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml -o yaml --dry-run | kubectl replace -f -
   ```

   **Note**: The user needs to validate the YAML syntax and array related key/values while replacing the isilon-creds secret.
   The driver will continue to use previous values in case of an error found in the YAML file.

4. **Create isilon-certs-n secret.**

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

      Execute command: ```kubectl create -f empty-secret.yaml```

### Install Driver


1.  Create a CR (Custom Resource) for PowerFlex using the sample files provided

    a. **Default Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/minimal-samples/powerscale_v2130.yaml) for default settings. Modify if needed.

    [OR]                                                

    b. **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerscale_v2130.yaml) for detailed settings.

2. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerScale driver and their default values:
   {{< collapse id="1" title="Parameters">}}
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | dnsPolicy | Determines the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
   | fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No | "ReadWriteOnceWithFSType" |
   | storageCapacity | Enable/Disable storage capacity tracking feature | No | false |
   | ***Common parameters for node and controller*** |
   | CSI_ENDPOINT | The UNIX socket address for handling gRPC calls | No | /var/run/csi/csi.sock |
   | X_CSI_ISI_SKIP_CERTIFICATE_VALIDATION | Specifies whether SSL security needs to be enabled for communication between PowerScale and CSI Driver | No | true |
   | X_CSI_ISI_PATH | Base path for the volumes to be created | Yes | |
   | X_CSI_ALLOWED_NETWORKS | Custom networks for PowerScale export. List of networks that can be used for NFS I/O traffic, CIDR format should be used | No | empty |
   | X_CSI_ISI_AUTOPROBE | To enable auto probing for driver | No | true |
   | X_CSI_ISI_NO_PROBE_ON_START | Indicates whether the controller/node should probe during initialization | Yes | |
   | X_CSI_ISI_VOLUME_PATH_PERMISSIONS | The permissions for isi volume directory path | Yes | 0777 |
   | X_CSI_ISI_AUTH_TYPE | Indicates the authentication method to be used. If set to 1 then it follows as session-based authentication else basic authentication. If CSM Authorization is enabled, this value must be set to 1. | No | 0 |
   | ***Controller parameters*** |
   | X_CSI_MODE   | Driver starting mode  | No | controller |
   | X_CSI_ISI_ACCESS_ZONE | Name of the access zone a volume can be created in | No | System |
   | X_CSI_ISI_QUOTA_ENABLED | To enable SmartQuotas | Yes | |
   | ***Node parameters*** |
   | X_CSI_MAX_VOLUMES_PER_NODE | Specify the default value for the maximum number of volumes that the controller can publish to the node | Yes | 0 |
   | X_CSI_MODE   | Driver starting mode  | No | node |
   {{< /collapse >}}
3. Execute the following command to create PowerScale custom resource:

    ```bash
    kubectl create -f <input_sample_file.yaml>
    ```

    This command will deploy the CSI-PowerScale driver in the namespace specified in the input YAML file.

4. Once the driver `Custom Resource (CR)` is created, you can verify the installation as mentioned below

    * Check if ContainerStorageModule CR is created successfully using the command below:
        ```bash
        kubectl get csm/<name-of-custom-resource> -n <driver-namespace> -o yaml
        ```
    * Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.

5. Refer [Volume Snapshot Class](https://github.com/dell/csi-powerscale/tree/main/samples/volumesnapshotclass) and [Storage Class](https://github.com/dell/csi-powerscale/tree/main/samples/storageclass) for the sample files. 

**Note** :

   1. "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
   2. Also, snapshotter and resizer sidecars are not optional to choose, it comes default with Driver installation.

{{< /accordion >}}  
<br>
{{< accordion id="Three" title="CSM Modules" >}}
<br>  
{{< markdownify >}}
The driver and modules versions installable with the Container Storage Module Operator [Click Here](../../../../../supportmatrix/#operator-compatibility-matrix)
{{< /markdownify >}}
<br>   
{{< cardcontainer >}}
    {{< customcard link1="./csm-modules/authorizationv1.x"  image="1" title="Authorization v1.x" >}}

    {{< customcard link1="./csm-modules/authorizationv2.0"   image="1" title="Authorization v2.0"  >}}

    {{< customcard  link1="./csm-modules/observability"   image="1" title="Observability"  >}}

    {{< customcard  link1="./csm-modules/replication"  image="1" title="Replication"  >}} 

    {{< customcard link1="./csm-modules/resiliency"   image="1" title="Resiliency"  >}}

{{< /cardcontainer >}}
{{< /accordion >}}  
