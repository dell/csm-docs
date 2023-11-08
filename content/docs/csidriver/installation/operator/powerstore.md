---
title: PowerStore
description: >
  Installing CSI Driver for PowerStore via Operator
---
{{% pageinfo color="primary" %}}
The Dell CSI Operator is no longer actively maintained or supported. It will be deprecated in CSM 1.9. It is highly recommended that you use [CSM Operator](../../../../deployment/csmoperator) going forward.

Please follow the steps below to migrate from Dell CSI Operator to CSM Operator
* Step1: Backup the CRD to save the settings used
* Step2: Map and update the settings in CRD in step1 to the relevant CRD in CSM Operator
* Step3: Keep the secret and namespace for the driver
* Step4: Keep the Storage Class and Volume Snapshot Class
* Step5: Uninstall the CRD from the CSI Operator
* Step6: Uninstall the CSI Operator itself
* Step7: Install the CSM Operator
* Step8: Install the CRD updated in Step 2

{{% /pageinfo %}}

## Installing CSI Driver for PowerStore via Operator

The CSI Driver for Dell PowerStore can be installed via the Dell CSI Operator.

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
        blockProtocol: "auto"                     # what SCSI transport protocol use on node side (FC, ISCSI, NVMeTCP, NVMeFC, None, or auto)
        nasName: "nas-server"                     # what NAS should be used for NFS volumes
        nfsAcls: "0777"                           # (Optional) defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory.
                                                  # NFSv4 ACls are supported for NFSv4 shares on NFSv4 enabled NAS servers only. POSIX ACLs are not supported and only POSIX mode bits are supported for NFSv3 shares.
   ```
   Change the parameters with relevant values for your PowerStore array.  
   Add more blocks similar to above for each PowerStore array if necessary.
   ### User Privileges
   The username specified in `config.yaml` must be from the authentication providers of PowerStore. The user must have the correct user role to perform the actions. The minimum requirement is **Storage Operator**.

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

Below is a sample CR:

```yaml
apiVersion: storage.dell.com/v1
kind: CSIPowerStore
metadata:
  name: test-powerstore
  namespace: test-powerstore
spec:
  driver:
    configVersion: v2.7.0
    replicas: 2
    dnsPolicy: ClusterFirstWithHostNet
    forceUpdate: false
    fsGroupPolicy: ReadWriteOnceWithFSType
    storageCapacity: true
    common:
      image: "dellemc/csi-powerstore:v2.7.0"
      imagePullPolicy: IfNotPresent
      envs:
        - name: X_CSI_POWERSTORE_NODE_NAME_PREFIX
          value: "csi"
        - name: X_CSI_FC_PORTS_FILTER_FILE_PATH
          value: "/etc/fc-ports-filter"
    sideCars:
      - name: external-health-monitor
        args: ["--monitor-interval=60s"]
      - name: provisioner
        args: ["--capacity-poll-interval=5m"]

    controller:
      envs:
        - name: X_CSI_HEALTH_MONITOR_ENABLED
          value: "false"
        - name: X_CSI_NFS_ACLS
          value: "0777"
      nodeSelector:
        node-role.kubernetes.io/master: ""
      tolerations:
        - key: "node-role.kubernetes.io/master"
          operator: "Exists"
          effect: "NoSchedule"

    node:
      envs:
        - name: "X_CSI_POWERSTORE_ENABLE_CHAP"
          value: "true"
        - name: X_CSI_HEALTH_MONITOR_ENABLED
          value: "false"
        - name: X_CSI_POWERSTORE_MAX_VOLUMES_PER_NODE
          value: "0"
      nodeSelector:
        node-role.kubernetes.io/worker: ""

      tolerations:
        - key: "node-role.kubernetes.io/worker"
          operator: "Exists"
          effect: "NoSchedule"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: powerstore-config-params
  namespace: test-powerstore
data:
  driver-config-params.yaml: |
    CSI_LOG_LEVEL: "debug"
    CSI_LOG_FORMAT: "JSON"
```

5. Users must configure the parameters in CR. The following table lists the primary configurable parameters of the PowerStore driver and their default values:
   
| Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be pending state till new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
| namespace | Specifies namespace where the drive will be installed | Yes | "test-powerstore" |
| fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType` | No |"ReadWriteOnceWithFSType"|
| storageCapacity | Enable/Disable storage capacity tracking feature | No | true |
| ***Common parameters for node and controller*** |
| X_CSI_POWERSTORE_NODE_NAME_PREFIX | Prefix to add to each node registered by the CSI driver | Yes | "csi-node" 
| X_CSI_FC_PORTS_FILTER_FILE_PATH | To set path to the file which provides a list of WWPN which should be used by the driver for FC connection on this node | No | "/etc/fc-ports-filter" |
| ***Controller parameters*** |
| X_CSI_POWERSTORE_EXTERNAL_ACCESS | allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | " "|
| X_CSI_NFS_ACLS | Defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory. | No | "0777" |
| ***Node parameters*** |
| X_CSI_POWERSTORE_ENABLE_CHAP | Set to true if you want to enable iSCSI CHAP feature | No | false |
| X_CSI_POWERSTORE_MAX_VOLUMES_PER_NODE | Specify the default value for the maximum number of volumes that the controller can publish to the node | No | 0 |

6.  Execute the following command to create PowerStore custom resource:`kubectl create -f <input_sample_file.yaml>`. The above command will deploy the CSI-PowerStore driver.
      - After that the driver should be installed, you can check the condition of driver pods by running `kubectl get all -n <driver-namespace>`

## Volume Health Monitoring

Volume Health Monitoring feature is optional and by default this feature is disabled for drivers when installed via operator.
To enable this feature, add the below block to the driver manifest before installing the driver. This ensures to install external
health monitor sidecar. To get the volume health state value under controller should be set to true as seen below. To get the
volume stats value under node should be set to true.
   ```yaml
 sideCars:
   # Uncomment the following to install 'external-health-monitor' sidecar to enable health monitor of CSI volumes from Controller plugin.
   # Also set the env variable controller.envs.X_CSI_HEALTH_MONITOR_ENABLED to "true".
   - name: external-health-monitor
     args: ["--monitor-interval=60s"]
 controller:
   envs:
	 # X_CSI_HEALTH_MONITOR_ENABLED: Enable/Disable health monitor of CSI volumes from Controller plugin- volume status, volume condition.
	 # Install the 'external-health-monitor' sidecar accordingly.
	 # Allowed values:
	 #   true: enable checking of health condition of CSI volumes
	 #   false: disable checking of health condition of CSI volumes
	 # Default value: false
	 - name: X_CSI_HEALTH_MONITOR_ENABLED
	   value: "false"
 node:
   envs:
     # X_CSI_HEALTH_MONITOR_ENABLED: Enable/Disable health monitor of CSI volumes from node plugin- volume usage, volume condition
     # Allowed values:
     #   true: enable checking of health condition of CSI volumes
     #   false: disable checking of health condition of CSI volumes
     # Default value: false
     - name: X_CSI_HEALTH_MONITOR_ENABLED
       value: "false"
   ```

## Dynamic Logging Configuration

This feature is introduced in CSI Driver for PowerStore version 2.0.0. 

### Operator based installation
As part of driver installation, a ConfigMap with the name `powerstore-config-params` is created using the manifest located in the sample file. This ConfigMap contains attributes `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver and `CSI_LOG_FORMAT` which specifies the current log format of the CSI driver. To set the default/initial log level user can set this field during driver installation.

To update the log level dynamically user has to edit the ConfigMap `powerstore-config-params` and update `CSI_LOG_LEVEL` to the desired log level and `CSI_LOG_FORMAT` to the desired log format.
```bash
kubectl edit configmap -n csi-powerstore powerstore-config-params
```
**Note** : 
  1. "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
  2. Also, snapshotter and resizer sidecars are not optional to choose, it comes default with Driver installation.
