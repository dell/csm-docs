---
title: PowerStore
description: >
  Installing PowerStore CSI Driver via Operator
---
## Installing PowerStore CSI Driver via Operator

The CSI Driver for Dell EMC PowerStore can be installed via the Dell CSI Operator.

To deploy the Operator, follow the instructions available [here](../).

There are sample manifests provided which can be edited to do an easy installation of the driver. Please note that the deployment of the driver using the operator doesn’t use any Helm charts and the installation & configuration parameters will be slightly different from the ones specified via the Helm installer.

Kubernetes Operators make it easy to deploy and manage entire lifecycle of complex Kubernetes applications. Operators use Custom Resource Definitions (CRD) which represents the application and use custom controllers to manage them.

### Install Driver

1. Create namespace:
   Run `kubectl create namespace <driver-namespace>` using the desired name to create the namespace.
2. Create PowerStore credentials:
   Create a file called powerstore-creds.yaml with the following content
     ```yaml
        apiVersion: v1
	      kind: Secret
	      metadata:
          name: powerstore-creds
	        # Replace driver-namespace with the namespace where driver is being deployed
	        namespace: <driver-namespace>
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
   Run `kubectl create -f powerstore-creds.yaml` command to create the secret.
3. Create a Custom Resource (CR) for PowerStore using the sample files provided    [here](https://github.com/dell/dell-csi-operator/tree/master/samples). 
4. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerStore driver and their default values:
   
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | replicas | Controls the amount of controller pods you deploy. If controller pods is greater than number of available nodes, excess pods will become stuck in pending. Defaults is 2 which allows for Controller high availability. | Yes | 2 |
   | ***Common parameters for node and controller*** |
   | X_CSI_POWERSTORE_ENDPOINT | Must provide a PowerStore HTTPS API url | Yes | https://127.0.0.1/api/rest |
   | X_CSI_TRANSPORT_PROTOCOL | Choose what transport protocol to use (ISCSI, FC, auto or None)	| Yes | auto |
   | X_CSI_POWERSTORE_NODE_NAME_PREFIX | Prefix to add to each node registered by the CSI driver | Yes | "csi-node" 
   | X_CSI_FC_PORTS_FILTER_FILE_PATH | To set path to the file which provide list of WWPN which should be used by the driver for FC connection on this node | No | "/etc/fc-ports-filter" |
   | ***StorageClass parameters***
   | allowedTopologies:key | This is to enable topology to allow pods/and volumes to always be scheduled on nodes that have access to the storage. You need to replace the "127.0.0.1-nfs" portion in the key with PowerStore endpoint IP with its value and append -nfs, -fc or -iscsi at the end of it | No | "127.0.0.1-nfs" | 
5.  Execute the following command to create PowerStore custom resource:`kubectl create -f <input_sample_file.yaml>`. The above command will deploy the CSI-PowerStore driver.
