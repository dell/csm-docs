---
title: Unity
description: >
  Installing CSI Driver for Unity via Operator
---



## CSI Driver for Unity
### Pre-requisites
#### Create secret to store Unity credentials
Create a namespace called unity (it can be any user-defined name; But commands in this section assumes that the namespace is unity)
Prepare the secret.yaml for driver configuration.
The following table lists driver configuration parameters for multiple storage arrays.

| Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| username | Username for accessing Unity system  | true | - |
| password | Password for accessing Unity system  | true | - |
| restGateway | REST API gateway HTTPS endpoint Unity system| true | - |
| arrayId | ArrayID for Unity system | true | - |
| isDefaultArray | An array having isDefaultArray=true is for backward compatibility. This parameter should occur once in the list. | false | false |

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

`kubectl create secret generic unity-creds -n unity --from-file=config=secret.secret`

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

   | Parameter                                       | Description                                                  | Required | Default               |
   | ----------------------------------------------- | ------------------------------------------------------------ | -------- | --------------------- |
   | ***Common parameters for node and controller*** |                                                              |          |                       |
   | CSI_ENDPOINT                                    | Specifies the HTTP endpoint for Unity.                       | No       | /var/run/csi/csi.sock |
   | X_CSI_UNITY_ALLOW_MULTI_POD_ACCESS | Flag to enable multiple pods use the same pvc on the same node with RWO access mode | No | false |
   | ***Controller parameters***                     |                                                              |          |                       |
   | X_CSI_MODE                                      | Driver starting mode                                         | No       | controller            |
   | X_CSI_UNITY_AUTOPROBE                           | To enable auto probing for driver                            | No       | true                  |
   | ***Node parameters***                           |                                                              |          |                       |
   | X_CSI_MODE                                      | Driver starting mode                                         | No       | node                  |
   | X_CSI_ISCSI_CHROOT                              | Path to which the driver will chroot before running any iscsi commands. | No       | /noderoot             |

### Example CR for Unity
Refer samples from [here](https://github.com/dell/dell-csi-operator/tree/master/samples). Below is an example CR:
```yaml
apiVersion: storage.dell.com/v1
kind: CSIUnity
metadata:
  name: test-unity
  namespace: test-unity
spec:
  driver:
    configVersion: v2.0.0
    replicas: 2
    dnsPolicy: ClusterFirstWithHostNet
    forceUpdate: false
    common:
      image: "dellemc/csi-unity:v2.0.0"
      imagePullPolicy: IfNotPresent
    sideCars:
      - name: provisioner
        args: ["--volume-name-prefix=csiunity","--default-fstype=ext4"]
      - name: snapshotter
        args: ["--snapshot-name-prefix=csiunitysnap"]
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
    SYNC_NODE_INFO_TIME_INTERVAL: "0"
```

## Dynamic Logging Configuration

This feature is introduced in CSI Driver for unity version 2.0.0. 

### Operator based installation
As part of driver installation, a ConfigMap with the name `unity-config-params` is created using the manifest located in the sample file. This ConfigMap contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver. To set the default/initial log level user can set this field during driver installation.

To update the log level dynamically user has to edit the ConfigMap `unity-config-params` and update `CSI_LOG_LEVEL` to the desired log level.
```
kubectl edit configmap -n unity unity-config-params
```  

**Note** : 
  1. Prior to CSI Driver for unity version 2.0.0, the log level was allowed to be updated dynamically through `logLevel` attribute in the secret object.
  2. "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
  3. Also, snapshotter and resizer sidecars are not optional to choose, it comes default with Driver installation. 
