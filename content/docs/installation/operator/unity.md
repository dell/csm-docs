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
| username | Username for accessing unity system  | true | - |
| password | Password for accessing unity system  | true | - |
| restGateway | REST API gateway HTTPS endpoint Unity system| true | - |
| arrayId | ArrayID for unity system | true | - |
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

```
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
   | X_CSI_DEBUG                                     | To enable debug mode                                         | No       | false                 |
   | GOUNITY_DEBUG                                   | To enable debug mode for gounity library                     | No       | false                 |
   | X_CSI_UNITY_ALLOW_MULTI_POD_ACCESS | Flag to enable multiple pods use the same pvc on the same node with RWO access mode | No | false |
   | ***Controller parameters***                     |                                                              |          |                       |
   | X_CSI_MODE                                      | Driver starting mode                                         | No       | controller            |
   | X_CSI_UNITY_AUTOPROBE                           | To enable auto probing for driver                            | No       | true                  |
   | ***Node parameters***                           |                                                              |          |                       |
   | X_CSI_MODE                                      | Driver starting mode                                         | No       | node                  |
   | X_CSI_ISCSI_CHROOT                              | Path to which the driver will chroot before running any iscsi commands. | No       | /noderoot             |


### StorageClass Parameters

| Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| storagePool | Unity Storage Pool CLI ID to use with in the Kubernetes storage class | true | - |
| thinProvisioned | To set volume thinProvisioned | false | "true" |
| isDataReductionEnabled | To set volume data reduction | false | "false" |
| volumeTieringPolicy | To set volume tiering policy | false | 0 |
| FsType | Block volume related parameter. To set File system type. Possible values are ext3,ext4,xfs. Supported for FC/iSCSI protocol only. | false | ext4 |
| hostIOLimitName | Block volume related parameter.  To set unity host IO limit. Supported for FC/iSCSI protocol only. | false | "" |
| nasServer | NFS related parameter. NAS Server CLI ID for filesystem creation. | true | "" |
| hostIoSize | NFS related parameter. To set filesystem host IO Size. | false | "8192" |
| reclaimPolicy | What should happen when a volume is removed | false | Delete |

### SnapshotClass parameters
Following parameters are not present in values.yaml in the Helm based installer

| Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| snapshotRetentionDuration | TO set snapshot retention duration. Format:"1:23:52:50" (number of days:hours:minutes:sec)| false | "" |


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
    configVersion: v4
    replicas: 2
    common:
      image: "dellemc/csi-unity:v1.5.0"
      imagePullPolicy: IfNotPresent
      envs:
      - name: X_CSI_UNITY_DEBUG
        value: "true"
      - name: X_CSI_UNITY_ALLOW_MULTI_POD_ACCESS
        value: "false"
    sideCars:
      - name: provisioner
        args: ["--volume-name-prefix=csiunity"]
    storageClass:
    - name: virt2016****-fc
      default: true
      reclaimPolicy: "Delete"
      allowVolumeExpansion: true
      parameters:
        storagePool: pool_1
        arrayId: "VIRT2016****"
        protocol: "FC"
    - name: virt2017****-iscsi
      reclaimPolicy: "Delete"
      allowVolumeExpansion: true
      parameters:
        storagePool: pool_1
        arrayId: "VIRT2017****"
        protocol: "iSCSI"
    - name: virt2017****-nfs
      reclaimPolicy: "Delete"
      allowVolumeExpansion: true
      parameters:
        storagePool: pool_1
        arrayId: "VIRT2017****"
        protocol: "NFS"
        hostIoSize: "8192"
        nasServer: nas_1
    - name: virt2017****-iscsi-topology
      reclaimPolicy: "Delete"
      allowVolumeExpansion: true
      volumeBindingMode: WaitForFirstConsumer
      allowedTopologies:
      - matchLabelExpressions:
          - key: csi-unity.dellemc.com/virt2017****-iscsi
            values:
              - "true"
      parameters:
        storagePool: pool_1
        arrayId: "VIRT2017****"
        protocol: "iSCSI"
    snapshotClass:
      - name: test-snap
        parameters:
          retentionDuration: ""
```

