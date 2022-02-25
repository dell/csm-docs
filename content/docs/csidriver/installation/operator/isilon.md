---
title: PowerScale
description: >
  Installing CSI Driver for PowerScale via Operator
---

## Installing CSI Driver for PowerScale via Operator

The CSI Driver for Dell EMC PowerScale can be installed via the Dell CSI Operator.

To deploy the Operator, follow the instructions available [here](../).

There are sample manifests provided which can be edited to do an easy installation of the driver. Note that the deployment of the driver using the operator does not use any Helm charts and the installation and configuration parameters will be slightly different from the one specified via the Helm installer.

Kubernetes Operators make it easy to deploy and manage the entire lifecycle of complex Kubernetes applications. Operators use Custom Resource Definitions (CRD) which represents the application and use custom controllers to manage them.

**Note**: MKE (Mirantis Kubernetes Engine) does not support the installation of CSI-PowerScale via Operator.

### Listing installed drivers with the CSI Isilon CRD
User can query for CSI-PowerScale driver using the following command:
`kubectl get csiisilon --all-namespaces`

### Install Driver

1. Create namespace.
     
   Execute `kubectl create namespace test-isilon` to create the test-isilon namespace (if not already present). Note that the namespace can be any user-defined name, in this example, we assume that the namespace is 'test-isilon'.
2. Create *isilon-creds* secret by using secret.yaml file format only.
  
   2.1   Create a yaml file called secret.yaml with the following content:
     ```
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

   Replace the values for the given keys as per your environment. After creating the secret.yaml, the following command can be used to create the secret,  
   `kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml`

   Use the following command to replace or update the secret

   `kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml -o yaml --dry-run | kubectl replace -f -`

   **Note**: The user needs to validate the YAML syntax and array related key/values while replacing the isilon-creds secret.
   The driver will continue to use previous values in case of an error found in the YAML file.
           
3. Create isilon-certs-n secret.
      Please refer [this section](../../helm/isilon/#certificate-validation-for-onefs-rest-api-calls) for creating cert-secrets.

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

4. Create a CR (Custom Resource) for PowerScale using the sample files provided 
   [here](https://github.com/dell/dell-csi-operator/tree/master/samples).
5. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerScale driver and their default values:

   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | dnsPolicy | Determines the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
   | fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType` | No | "ReadWriteOnceWithFSType" |
   | ***Common parameters for node and controller*** |
   | CSI_ENDPOINT | The UNIX socket address for handling gRPC calls | No | /var/run/csi/csi.sock |
   | X_CSI_ISI_SKIP_CERTIFICATE_VALIDATION | Specifies whether SSL security needs to be enabled for communication between PowerScale and CSI Driver | No | true |
   | X_CSI_ISI_PATH | Base path for the volumes to be created | Yes | |
   | X_CSI_ALLOWED_NETWORKS | Custom networks for PowerScale export. List of networks that can be used for NFS I/O traffic, CIDR format should be used | No | empty |
   | X_CSI_ISI_AUTOPROBE | To enable auto probing for driver | No | true |
   | X_CSI_ISI_NO_PROBE_ON_START | Indicates whether the controller/node should probe during initialization | Yes | |
   | X_CSI_ISI_VOLUME_PATH_PERMISSIONS | The permissions for isi volume directory path | Yes | 0777 |
   | ***Controller parameters*** |
   | X_CSI_MODE   | Driver starting mode  | No | controller |
   | X_CSI_ISI_ACCESS_ZONE | Name of the access zone a volume can be created in | No | System |
   | X_CSI_ISI_QUOTA_ENABLED | To enable SmartQuotas | Yes | |
   | ***Node parameters*** |
   | X_CSI_MAX_VOLUMES_PER_NODE | Specify the default value for the maximum number of volumes that the controller can publish to the node | Yes | 0 |
   | X_CSI_MODE   | Driver starting mode  | No | node |   
6.  Execute the following command to create PowerScale custom resource:
    ```kubectl create -f <input_sample_file.yaml>``` .
    This command will deploy the CSI-PowerScale driver in the namespace specified in the input YAML file.
    
**Note** : 
   1. From CSI-PowerScale v1.6.0 and higher, Storage class and VolumeSnapshotClass will **not** be created as part of driver deployment. The user has to create Storageclass and Volume Snapshot Class.
   2. Node selector and node tolerations can be added in both controller parameters and node parameters section, based on the need.
   3. "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
   4. Also, snapshotter and resizer sidecars are not optional to choose, it comes default with Driver installation. 
