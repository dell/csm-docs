---
title: Unity XT
description: >
  Installing CSI Driver for Unity XT via Operator
---



## CSI Driver for Unity XT
### Pre-requisites
#### Create secret to store Unity XT credentials
Create a namespace called unity (it can be any user-defined name; But commands in this section assumes that the namespace is unity)
Prepare the secret.yaml for driver configuration.
The following table lists driver configuration parameters for multiple storage arrays.

| Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| username | Username for accessing Unity XT system  | true | - |
| password | Password for accessing Unity XT system  | true | - |
| restGateway | REST API gateway HTTPS endpoint Unity XT system| true | - |
| arrayId | ArrayID for Unity XT system | true | - |
| isDefaultArray | An array having isDefaultArray=true is for backward compatibility. This parameter should occur once in the list. | true | - |

Ex: secret.yaml

```yaml

  storageArrayList:
    - arrayId: "APM00******1"
      username: "user"
      password: "password"
      endpoint: "https://10.1.1.1/"
      skipCertificateValidation: true
      isDefault: true
      
    - arrayId: "APM00******2"
      username: "user"
      password: "password"
      endpoint: "https://10.1.1.2/"
      skipCertificateValidation: true
  
```

`kubectl create secret generic unity-creds -n unity --from-file=config=secret.yaml`

Use the following command to replace or update the secret

`kubectl create secret generic unity-creds -n unity --from-file=config=secret.yaml -o yaml --dry-run | kubectl replace -f -`

**Note**: The user needs to validate the YAML syntax and array related key/values while replacing the unity-creds secret.
The driver will continue to use previous values in case of an error found in the YAML file.

#### Create secret for client side TLS verification

Please refer detailed documentation on how to create this secret [here](../../helm/unity/#certificate-validation-for-unisphere-rest-api-calls)

If certificate validation is skipped, empty secret must be created. To create an empty secret. Ex: empty-secret.yaml

```yaml
  apiVersion: v1
  kind: Secret
  metadata:
    name: unity-certs-0
    namespace: unity
  type: Opaque
  data:
    cert-0: ""
```
Execute command: ```kubectl create -f empty-secret.yaml```


### Modify/Set the following *optional* environment variables

Users should configure the parameters in CR. The following table lists the primary configurable parameters of the Unity driver and their default values:

   | Parameter                                       | Description                                                                 | Required | Default               |
   | ----------------------------------------------- | --------------------------------------------------------------------------- | -------- | --------------------- |
   | ***Common parameters for node and controller*** |                                                                             |          |                       |
   | CSI_ENDPOINT                                    | Specifies the HTTP endpoint for Unity XT.                                   | No       | /var/run/csi/csi.sock |
   | X_CSI_UNITY_ALLOW_MULTI_POD_ACCESS              | Flag to enable multiple pods use same pvc on same node with RWO access mode | No       | false                 |
   | ***Controller parameters***                     |                                                                             |          |                       |
   | X_CSI_MODE                                      | Driver starting mode                                                        | No       | controller            |
   | X_CSI_UNITY_AUTOPROBE                           | To enable auto probing for driver                                           | No       | true                  |
   | X_CSI_HEALTH_MONITOR_ENABLED                    | Enable/Disable health monitor of CSI volumes from Controller plugin         | No       |                       |
   | ***Node parameters***                           |                                                                             |          |                       |
   | X_CSI_MODE                                      | Driver starting mode                                                        | No       | node                  |
   | X_CSI_ISCSI_CHROOT                              | Path to which the driver will chroot before running any iscsi commands      | No       | /noderoot             |
   | X_CSI_HEALTH_MONITOR_ENABLED                    | Enable/Disable health monitor of CSI volumes from Node plugin               | No       |                       |

### Example CR for Unity XT
Refer samples from [here](https://github.com/dell/dell-csi-operator/tree/master/samples). Below is an example CR:
```yaml
apiVersion: storage.dell.com/v1
kind: CSIUnity
metadata:
  name: test-unity
  namespace: test-unity
spec:
  driver:
    configVersion: v2.5.0
    replicas: 2
    dnsPolicy: ClusterFirstWithHostNet
    forceUpdate: false
    common:
      image: "dellemc/csi-unity:v2.5.0"
      imagePullPolicy: IfNotPresent
    sideCars:
      - name: provisioner
        args: ["--volume-name-prefix=csiunity","--default-fstype=ext4"]
      - name: snapshotter
        args: ["--snapshot-name-prefix=csiunitysnap"]
      # Enable/Disable health monitor of CSI volumes from node plugin. Provides details of volume usage.
      # - name: external-health-monitor
      #   args: ["--monitor-interval=60s"]  

    controller:
       envs:
          # X_CSI_HEALTH_MONITOR_ENABLED: Enable/Disable health monitor  of CSI volumes from Controller plugin - volume condition.
          # Install the 'external-health-monitor' sidecar accordingly.
          # Allowed values:
          #   true: enable checking of health condition of CSI volumes
          #   false: disable checking of health condition of CSI volumes
          # Default value: false
          - name: X_CSI_HEALTH_MONITOR_ENABLED
            value: "false"

       # nodeSelector: Define node selection constraints for controller pods.
       # For the pod to be eligible to run on a node, the node must have each
       # of the indicated key-value pairs as labels.
       # Leave as blank to consider all nodes
       # Allowed values: map of key-value pairs
       # Default value: None
       nodeSelector:
       # Uncomment if nodes you wish to use have the node-role.kubernetes. io/control-plane taint
       #  node-role.kubernetes.io/control-plane: ""

       # tolerations: Define tolerations for the controllers, if required.
       # Leave as blank to install controller on worker nodes
       # Default value: None
       tolerations:
       # Uncomment if nodes you wish to use have the node-role.kubernetes.io/control-plane taint
       #  - key: "node-role.kubernetes.io/control-plane"
       #    operator: "Exists"
       #    effect: "NoSchedule"

    node:
       envs:
          # X_CSI_HEALTH_MONITOR_ENABLED: Enable/Disable health monitor of CSI volumes from node plugin - volume usage
          # Allowed values:
          #   true: enable checking of health condition of CSI volumes
          #   false: disable checking of health condition of CSI volumes
          # Default value: false
          - name: X_CSI_HEALTH_MONITOR_ENABLED
            value: "false"
       # nodeSelector: Define node selection constraints for node pods.
       # For the pod to be eligible to run on a node, the node must have each
       # of the indicated key-value pairs as labels.
       # Leave as blank to consider all nodes
       # Allowed values: map of key-value pairs
       # Default value: None
       nodeSelector:
       # Uncomment if nodes you wish to use have the node-role.kubernetes.io/control-plane taint
       #  node-role.kubernetes.io/control-plane: ""

       # tolerations: Define tolerations for the node daemonset, if required.
       # Default value: None
       tolerations:
       # Uncomment if nodes you wish to use have the node-role.kubernetes.io/control-plane taint
       #  - key: "node-role.kubernetes.io/control-plane"
       #    operator: "Exists"
       #    effect: "NoSchedule"
       #  - key: "node.kubernetes.io/memory-pressure"
       #    operator: "Exists"
       #    effect: "NoExecute"
       #  - key: "node.kubernetes.io/disk-pressure"
       #    operator: "Exists"
       #    effect: "NoExecute"
       #  - key: "node.kubernetes.io/network-unavailable"
       #    operator: "Exists"
       #    effect: "NoExecute"

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: unity-config-params
  namespace: test-unity
data:
  driver-config-params.yaml: |
    CSI_LOG_LEVEL: "info"
    ALLOW_RWO_MULTIPOD_ACCESS: "false"
    MAX_UNITY_VOLUMES_PER_NODE: "0"
    SYNC_NODE_INFO_TIME_INTERVAL: "15"
    TENANT_NAME: ""
```

## Dynamic Logging Configuration

### Operator based installation
As part of driver installation, a ConfigMap with the name `unity-config-params` is created using the manifest located in the sample file. This ConfigMap contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver. To set the default/initial log level user can set this field during driver installation.

To update the log level dynamically user has to edit the ConfigMap `unity-config-params` and update `CSI_LOG_LEVEL` to the desired log level.
```
kubectl edit configmap -n unity unity-config-params
```  

**Note** : 
  1. The log level is not allowed to be updated dynamically through `logLevel` attribute in the secret object.
  2. "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
  3. Also, snapshotter and resizer sidecars are not optional to choose, it comes default with Driver installation. 

## Volume Health Monitoring

### Operator based installation

Volume Health Monitoring feature is optional and by default this feature is disabled for drivers when installed via operator.
To enable this feature, add the below block to the driver manifest before installing the driver. This ensures to install external health monitor sidecar. To get the volume health state `value` under controller should be set to true as seen below. To get the volume stats `value` under node should be set to true.
```
      # Uncomment the following to install 'external-health-monitor' sidecar to enable health monitor of CSI volumes from Controller plugin.
      # Also set the env variable controller.envs.X_CSI_ENABLE_VOL_HEALTH_MONITOR  to "true".
      # - name: external-health-monitor
      #   args: ["--monitor-interval=60s"]

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
        # X_CSI_HEALTH_MONITOR_ENABLED: Enable/Disable health monitor of CSI volumes from node plugin - volume usage
        # Allowed values:
        #   true: enable checking of health condition of CSI volumes
        #   false: disable checking of health condition of CSI volumes
        # Default value: false
        - name: X_CSI_HEALTH_MONITOR_ENABLED
          value: "false"
```
