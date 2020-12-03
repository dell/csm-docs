---
title: PowerScale
description: >
  Installing PowerScale CSI Driver via Operator
---

## Installing PowerScale CSI Driver via Operator

The CSI Driver for Dell EMC PowerScale can be installed via the Dell CSI Operator.

To deploy the Operator, follow the instructions available [here](/content/docs/installation/operator/).

There are sample manifests provided which can be edited to do an easy installation of the driver. Note that the deployment of the driver using the operator does not use any Helm charts and the installation and configuration parameters will be slightly different from the ones specified via the Helm installer.

Kubernetes Operators make it easy to deploy and manage entire lifecycle of complex Kubernetes applications. Operators use Custom Resource Definitions (CRD) which represents the application and use custom controllers to manage them.

### Listing installed drivers with the CSI Isilon CRD
User can query for csi-powerscale driver using the following command:
`kubectl get csiisilon --all-namespaces`

### Install Driver

1. Create namespace
   Run `kubectl create namespace isilon` to create the isilon namespace.
2. Create *isilon-creds*
   Create a file called isilon-creds.yaml with the following content:
     ```yaml
    apiVersion: v1
    kind: Secret
    metadata:
      name: isilon-creds
      namespace: isilon
    type: Opaque
    data:
      # set username to the base64 encoded username
      username: <base64 username>
      # set password to the base64 encoded password
      password: <base64 password>
    ```
   Replace the values for the username and password parameters. These values can be optioned using base64 encoding as described in the following example:
   ```
   echo -n "myusername" | base64
   echo -n "mypassword" | base64
   ```
   Run `kubectl create -f isilon-creds.yaml` command to create the secret.
3. Create a CR (Custom Resource) for PowerScale using the sample files provided 
   [here](https://github.com/dell/dell-csi-operator/tree/master/samples).
4. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerScale driver and their default values:
   
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
5.  Execute the following command to create PowerScale custom resource:
    ```kubectl create -f <input_sample_file.yaml>``` .
    This command will deploy the CSI-PowerScale driver.
