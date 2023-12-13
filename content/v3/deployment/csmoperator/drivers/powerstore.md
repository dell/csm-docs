---
title: PowerStore
linkTitle: "PowerStore"
description: >
  Installing Dell CSI Driver for PowerStore via Dell CSM Operator
---

## Installing CSI Driver for PowerStore via Dell CSM Operator

The CSI Driver for Dell PowerStore can be installed via the Dell CSM Operator.
To deploy the Operator, follow the instructions available [here](../../#installation).

Note that the deployment of the driver using the operator does not use any Helm charts and the installation and configuration parameters will be slightly different from the one specified via the Helm installer.

**Note**: MKE (Mirantis Kubernetes Engine) does not support the installation of CSI-PowerStore via Operator.

### Listing installed drivers with the ContainerStorageModule CRD
User can query for all Dell CSI drivers using the following command:
`kubectl get csm --all-namespaces`


### Prerequisite

1. Create namespace.
   Execute `kubectl create namespace test-powerstore` to create the test-powerstore namespace (if not already present). Note that the namespace can be any user-defined name, in this example, we assume that the namespace is 'test-powerstore'.

2. Create a file called `config.yaml` that has Powerstore array connection details with the following content
   ```yaml
   arrays:
      - endpoint: "https://10.0.0.1/api/rest"     # full URL path to the PowerStore API
        globalID: "unique"                        # unique id of the PowerStore array
        username: "user"                          # username for connecting to API
        password: "password"                      # password for connecting to API
        skipCertificateValidation: true           # indicates if client side validation of (management)server's certificate can be skipped
        isDefault: true                           # treat current array as a default (would be used by storage classes without arrayID parameter)
        blockProtocol: "auto"                     # what SCSI transport protocol use on node side (FC, ISCSI, NVMeTCP, NVMeFC, None, or auto)
        nasName: "nas-server"                     # what NAS should be used for NFS volumes
        nfsAcls: "0777"                           # (Optional) defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory.
                                                  # NFSv4 ACls are supported for NFSv4 shares on NFSv4 enabled NAS servers only. POSIX ACLs are not supported and only POSIX mode bits are supported for NFSv3 shares.
   ```
   Change the parameters with relevant values for your PowerStore array. 
   Add more blocks similar to above for each PowerStore array if necessary.
           
3. Create Kubernetes secret: 

   Create a file called `secret.yaml` in same folder as `config.yaml` with following content
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
      name: test-powerstore-config
      namespace: test-powerstore
   type: Opaque
   data:
      config: CONFIG_YAML
   ```

   Combine both files and create Kubernetes secret by running the following command:
   ```bash
   sed "s/CONFIG_YAML/`cat config.yaml | base64 -w0`/g" secret.yaml | kubectl apply -f -
   ```

### Install Driver

1. Follow all the [prerequisites](#prerequisite) above
   
2. Create a CR (Custom Resource) for PowerStore using the sample files provided 
   [here](https://github.com/dell/csm-operator/tree/master/samples). This file can be modified to use custom parameters if needed.

3. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerStore driver and their default values:

  | Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be in pending state until new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
| namespace | Specifies namespace where the driver will be installed | Yes | "test-powerstore" |
| fsGroupPolicy | Defines which FS Group policy mode to be used. Supported modes `None, File and ReadWriteOnceWithFSType` | No |"ReadWriteOnceWithFSType"|
| storageCapacity | Enable/Disable storage capacity tracking feature | No | false |
| ***Common parameters for node and controller*** |
| X_CSI_POWERSTORE_NODE_NAME_PREFIX | Prefix to add to each node registered by the CSI driver | Yes | "csi-node" 
| X_CSI_FC_PORTS_FILTER_FILE_PATH | To set path to the file which provides a list of WWPN which should be used by the driver for FC connection on this node | No | "/etc/fc-ports-filter" |
| ***Controller parameters*** |
| X_CSI_POWERSTORE_EXTERNAL_ACCESS | allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | empty |
| X_CSI_NFS_ACLS | Defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory. | No | "0777" |
| ***Node parameters*** |
| X_CSI_POWERSTORE_ENABLE_CHAP | Set to true if you want to enable iSCSI CHAP feature | No | false |

4.  Execute the following command to create PowerStore custom resource:`kubectl create -f <input_sample_file.yaml>`. This command will deploy the CSI PowerStore driver in the namespace specified in the input YAML file
      - Next, the driver should be installed, you can check the condition of driver pods by running `kubectl get all -n <driver-namespace>`

5.  [Verify the CSI Driver installation](../#verifying-the-driver-installation)
    
**Note** : 
   1. "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
   2. Snapshotter and resizer sidecars are not optional. They are defaults with Driver installation. 
