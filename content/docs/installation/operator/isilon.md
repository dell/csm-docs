---
title: PowerScale
description: >
  Installing PowerScale CSI Driver via Operator
---

## Installing PowerScale CSI Driver via Operator

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
     
   Execute `kubectl create namespace isilon` to create the isilon namespace (if not already present). Note that the namespace can be any user-defined name, in this example, we assume that the namespace is 'isilon'.
2. Create *isilon-creds* secret by first creating secret.json or secret.yaml file.
  
   2.1   Create a json file called secret.json with the following content:
     ```json
      {
         "isilonClusters": [
            {
               "clusterName": "cluster1",
               "username": "user",
               "password": "password",
               "isiIP": "1.2.3.4",
               "isDefaultCluster": true
            },
            {
               "clusterName": "cluster2",
               "username": "user",
               "password": "password",
               "endpoint": "1.2.3.5",
               "isiPort": "8080",
               "skipCertificateValidation": true,
               "isDefault": false,
               "isiPath": "/ifs/data/csi"
            }
         ]
      }
    ```
   Replace the values for the given keys as per your environment. This username/password value need not be encoded. You can refer [here](../../helm/isilon/#install-csi-driver-for-powerscale) for more information about these isilon secret parameters. After creating the secret.json, the following command can be used to create the secret,  
   `kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.json`
     
  

   2.2. Alternately user can create a secret.yaml file in the following format and replace the values for the given keys as per your environment. The command 
  
      `kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml` would be needed to create secret.
      ```
      isilonClusters:
      - clusterName: "cluster1"         # logical name of PowerScale Cluster
         username: "user"                # username for connecting to PowerScale OneFS API server
         password: "password"            # password for connecting to PowerScale OneFS API server
         endpoint: "1.2.3.4"             # HTTPS endpoint of the PowerScale OneFS API server
         isDefault: true                 # default cluster 
         skipCertificateValidation: true # indicates if client side validation of server's SSL certificate can be skipped
         isiPath: "/ifs/data/csi"        # base path for the volume(directory) to be created on PowerScale

      - clusterName: "cluster2"
         username: "user"
         password: "password"
         endpoint: "1.2.3.4"
         isiPort: "8080"

      logLevel: "debug" # CSI log level; valid log levels- "error", "warn"/"warning", "info", "debug"

      ```
      After creating the above file, the user can use the following command to create a secret object,   
      `kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml`
      
3. Create isilon-certs-n secret.
      Please refer [this section](../../helm/isilon/#certificate-validation-for-onefs-rest-api-calls) for creating cert-secrets.
4. Create a CR (Custom Resource) for PowerScale using the sample files provided 
   [here](https://github.com/dell/dell-csi-operator/tree/master/samples).
5. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerScale driver and their default values:
   
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | ***Common parameters for node and controller*** |
   | CSI_ENDPOINT | The UNIX socket address for handling gRPC calls | No | /var/run/csi/csi.sock |
   | X_CSI_ISI_INSECURE | Specifies whether SSL security needs to be enabled for communication between PowerScale and CSI Driver | No | true |
   | X_CSI_ISI_PATH | Base path for the volumes to be created | Yes | |
   | X_CSI_ALLOWED_NETWORKS | Custom networks for PowerScale export. List of networks that can be used for NFS I/O traffic, CIDR format should be used | No | empty |
   | X_CSI_ISI_AUTOPROBE | To enable auto probing for driver | No | true |
   | X_CSI_ISILON_NO_PROBE_ON_START | Indicates whether the controller/node should probe during initialization | Yes | |
   | X_CSI_MAX_VOLUMES_PER_NODE | Specify the default value for the maximum number of volumes that the controller can publish to the node | Yes | |
   | ***Controller parameters*** |
   | X_CSI_MODE   | Driver starting mode  | No | controller |
   | X_CSI_ISI_ACCESS_ZONE | Name of the access zone a volume can be created in | No | System |
   | X_CSI_ISI_QUOTA_ENABLED | To enable SmartQuotas | Yes | |
   | ***Node parameters*** |
   | X_CSI_ISILON_NFS_V3 | Set the version to v3 when mounting an NFS export. If the value is "false", then the default version supported will be used | Yes | |
   | X_CSI_MODE   | Driver starting mode  | No | node |
6.  Execute the following command to create PowerScale custom resource:
    ```kubectl create -f <input_sample_file.yaml>``` .
    This command will deploy the CSI-PowerScale driver in the namespace specified in the input YAML file.
    
**Note** : 
   1. Storage class and VolumeSnapshotClass will **not** be created as part of CSI-PowerScale 1.6 driver deployment. The user has to create Storageclass and Volume Snapshot Class.
   2. Node selector and node tolerations can be added in both controller parameters and node parameters section, based on the need.