---
title: PowerStore
description: >
  Installing CSI Driver for PowerStore via Operator
---
## Installing CSI Driver for PowerStore via Operator

The CSI Driver for Dell EMC PowerStore can be installed via the Dell CSI Operator.

To deploy the Operator, follow the instructions available [here](../).

There are sample manifests provided which can be edited to do an easy installation of the driver. 
Note: The deployment of the driver using the operator does not use any Helm charts. The installation and configuration parameters will be slightly different from the ones specified via the Helm installer.

Kubernetes Operators make it easy to deploy and manage the entire lifecycle of complex Kubernetes applications. Operators use Custom Resource Definitions (CRD) which represents the application and use custom controllers to manage them.

### Install Driver

1. Create namespace:

   Run `kubectl create namespace <driver-namespace>` using the desired name to create the namespace.
2. Create PowerStore array connection config:

   Create a file called `config.yaml` with the following content
   ```yaml
   arrays:
      - endpoint: "https://10.0.0.1/api/rest"     # full URL path to the PowerStore API
        globalID: "unique"                        # unique id of the PowerStore array
        username: "user"                          # username for connecting to API
        password: "password"                      # password for connecting to API
        skipCertificateValidation: true           # indicates if client side validation of (management)server's certificate can be skipped
        isDefault: true                           # treat current array as a default (would be used by storage classes without arrayID parameter)
        blockProtocol: "auto"                     # what SCSI transport protocol use on node side (FC, ISCSI, None, or auto)
        nasName: "nas-server"                     # what NAS should be used for NFS volumes
   ```
   Change the parameters with relevant values for your PowerStore array. 

   Add more blocks similar to above for each PowerStore array if necessary.
3. Create Kubernetes secret: 

   Create a file called `secret.yaml` in same folder as `config.yaml` with following content
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
      name: powerstore-config
      namespace: <driver-namespace>
   type: Opaque
   data:
      config: CONFIG_YAML
   ```

   Combine both files and create Kubernetes secret by running the following command:
   ```bash
   sed "s/CONFIG_YAML/`cat config.yaml | base64 -w0`/g" secret.yaml | kubectl apply -f -
   ```
   
4. Create a Custom Resource (CR) for PowerStore using the sample files provided    [here](https://github.com/dell/dell-csi-operator/tree/master/samples). 
5. Users must configure the parameters in CR. The following table lists the primary configurable parameters of the PowerStore driver and their default values:
   
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be pending state till new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
   | namespace | Specifies namespace where the drive will be installed | Yes | "test-powerstore" |
   | fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType` | No | "ReadWriteOnceWithFSType" |
   | ***Common parameters for node and controller*** |
   | X_CSI_POWERSTORE_NODE_NAME_PREFIX | Prefix to add to each node registered by the CSI driver | Yes | "csi-node" 
   | X_CSI_FC_PORTS_FILTER_FILE_PATH | To set path to the file which provides a list of WWPN which should be used by the driver for FC connection on this node | No | "/etc/fc-ports-filter" |
   | ***Controller parameters*** |
   | X_CSI_POWERSTORE_EXTERNAL_ACCESS | allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | " "|
   | X_CSI_NFS_ACLS | Defines permissions - POSIX or NFSv4 ACLs, to be set on NFS target mount directory. | No | "0777" |
   | ***Node parameters*** |
   | X_CSI_POWERSTORE_ENABLE_CHAP | Set to true if you want to enable iSCSI CHAP feature | No | false | 
6.  Execute the following command to create PowerStore custom resource:`kubectl create -f <input_sample_file.yaml>`. The above command will deploy the CSI-PowerStore driver.
      - After that the driver should be installed, you can check the condition of driver pods by running `kubectl get all -n <driver-namespace>`

## Dynamic Logging Configuration

This feature is introduced in CSI Driver for unity version 2.0.0. 

### Operator based installation
As part of driver installation, a ConfigMap with the name `powerstore-config-params` is created using the manifest located in the sample file. This ConfigMap contains attributes `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver and `CSI_LOG_FORMAT` which specifies the current log format of the CSI driver. To set the default/initial log level user can set this field during driver installation.

To update the log level dynamically user has to edit the ConfigMap `powerstore-config-params` and update `CSI_LOG_LEVEL` to the desired log level and `CSI_LOG_FORMAT` to the desired log format.
```
kubectl edit configmap -n csi-powerstore powerstore-config-params
```
**Note** : 
  1. "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
  2. Also, snapshotter and resizer sidecars are not optional to choose, it comes default with Driver installation. 
