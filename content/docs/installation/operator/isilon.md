---
title: PowerScale
description: >
  Installing PowerScale CSI Driver via Operator
---

## Installing PowerScale CSI Driver via Operator

The CSI Driver for Dell EMC PowerScale can be installed via the Dell CSI Operator.

To deploy the Operator, follow the instructions available [here](../).

There are sample manifests provided which can be edited to do an easy installation of the driver. Note that the deployment of the driver using the operator does not use any Helm charts and the installation and configuration parameters will be slightly different from the ones specified via the Helm installer.

Kubernetes Operators make it easy to deploy and manage entire lifecycle of complex Kubernetes applications. Operators use Custom Resource Definitions (CRD) which represents the application and use custom controllers to manage them.

### Listing installed drivers with the CSI Isilon CRD
User can query for csi-powerscale driver using the following command:
`kubectl get csiisilon --all-namespaces`

### Install Driver

1. Create namespace
   Run `kubectl create namespace isilon` to create the isilon namespace. Note that the namespace can be any user defined name , in this example, we assume that the namespace is 'isilon'.
2. Create *isilon-creds*
   Create a json file called isilon-creds.json with the following content:
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
               "isiIP": "1.2.3.5",
               "isiPort": "8080",
               "isiInsecure": true,
               "isiPath": "/ifs/data/csi"
            }
         ]
      }
    ```
   Replace the values for the given keys as per your environment. This username / password value need not be encoded. You can refer [here](../../helm/isilon/#install-csi-driver-for-powerscale) for more information about isilon secret parameters.

3. Create isilon-certs-<n> secret
      Please refer [this section](../../helm/isilon/#certificate-validation-for-onefs-rest-api-calls) for creating cert-secrets. 
   Run `kubectl create -f isilon-creds.yaml` command to create the secret.
4. Create a CR (Custom Resource) for PowerScale using the sample files provided 
   [here](https://github.com/dell/dell-csi-operator/tree/master/samples).
5. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerScale driver and their default values:
   
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | ***Common parameters for node and controller*** |
   | CSI_ENDPOINT | The UNIX socket address for handling gRPC calls | No | /var/run/csi/csi.sock |
   | X_CSI_DEBUG | To enable debug mode | No | false |
   | X_CSI_ISI_ENDPOINT | HTTPs endpoint of the PowerScale OneFS API server | Yes | |
   | X_CSI_ISI_INSECURE | Specifies whether SSL security needs to be enabled for communication between PowerScale and CSI Driver | No | true |
   | X_CSI_ISI_PATH | Base path for the volumes to be created | Yes | |
   | X_CSI_ISI_AUTOPROBE | To enable auto probing for driver | No | true |
   | X_CSI_ISILON_NO_PROBE_ON_START | Indicates whether the controller/node should probe during initialization | Yes | |
   | ***Controller parameters*** |
   | X_CSI_MODE   | Driver starting mode  | No | controller |
   | X_CSI_ISI_ACCESS_ZONE | Name of the access zone a volume can be created in | No | System |
   | X_CSI_ISI_QUOTA_ENABLED | To enable SmartQuotas | Yes | |
   | ***Node parameters*** |
   | X_CSI_ISILON_NFS_V3 | Set the version to v3 when mounting an NFS export. If the value is "false", then the default version supported will be used | Yes | |
   | X_CSI_MODE   | Driver starting mode  | No | node |
6.  Execute the following command to create PowerScale custom resource:
    ```kubectl create -f <input_sample_file.yaml>``` .
    This command will deploy the CSI-PowerScale driver in the namespace specified in input yaml file.
