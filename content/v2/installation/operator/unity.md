---
title: Unity
description: >
  Installing Unity CSI Driver via Operator
---



## CSI Unity
### Pre-requisites
#### Create secret to store Unity credentials
Create a namespace called unity (it can be any user-defined name; But commands in this section assumes that the namespace is unity)
Prepare the secret.json for driver configuration.
The following table lists driver configuration parameters for multiple storage arrays.

| Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| username | Username for accessing Unity system  | true | - |
| password | Password for accessing Unity system  | true | - |
| restGateway | REST API gateway HTTPS endpoint Unity system| true | - |
| arrayId | ArrayID for Unity system | true | - |
| insecure | "unityInsecure" determines if the driver is going to validate unisphere certs while connecting to the Unisphere REST API interface If it is set to false, then a secret unity-certs has to be created with a X.509 certificate of CA which signed the Unisphere certificate | true | true |
| isDefaultArray | An array having isDefaultArray=true is for backward compatibility. This parameter should occur once in the list. | false | false |

Ex: secret.json

```json5

   {
     "storageArrayList": [
       {
         "username": "user",
         "password": "password",
         "restGateway": "https://10.1.1.1",
         "arrayId": "APM00******1",
         "insecure": true,
         "isDefaultArray": true
       },
       {
         "username": "user",
         "password": "password",
         "restGateway": "https://10.1.1.2",
         "arrayId": "APM00******2",
         "insecure": true
       }
     ]
   }
  
```

`kubectl create secret generic unity-creds -n unity --from-file=config=secret.json`

Use the following command to replace or update the secret

`kubectl create secret generic unity-creds -n unity --from-file=config=secret.json -o yaml --dry-run | kubectl replace -f -`

**Note**: The user needs to validate the JSON syntax and array related key/values while replacing the unity-creds secret.
The driver will continue to use previous values in case of an error found in the JSON file.

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
    configVersion: v5
    replicas: 2
    common:
      image: "dellemc/csi-unity:v1.6.0"
      imagePullPolicy: IfNotPresent
      envs:
      - name: X_CSI_UNITY_DEBUG
        value: "true"
      - name: X_CSI_UNITY_ALLOW_MULTI_POD_ACCESS
        value: "false"
      - name: X_CSI_MAX_VOLUMES_PER_NODE
        value: "0"
    sideCars:
      - name: provisioner
        args: ["--volume-name-prefix=csiunity","--default-fstype=ext4"]
      - name: snapshotter
        args: ["--snapshot-name-prefix=csiunitysnap"]
```

