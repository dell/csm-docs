---
title: PowerFlex
description: >
  Installing PowerFlex CSI Driver via Operator
---
## Installing PowerFlex CSI Driver via Operator

The CSI Driver for Dell EMC PowerFlex v1.4.0 can be installed via the Dell CSI Operator.

To deploy the Operator, follow the instructions available [here](../).

There are sample manifests provided which can be edited to do an easy installation of the driver. Note that the deployment of the driver using the operator does not use any Helm charts. The installation and configuration parameters will be slightly different from the ones specified via the Helm installer.

Kubernetes Operators make it easy to deploy and manage entire lifecycle of complex Kubernetes applications. Operators use Custom Resource Definitions (CRD) which represents the application and use custom controllers to manage them.

### Prerequisites:
#### Automated SDC Deployment for Operator 
- This applies to OpenShift with RHCOS Nodes and Kubernetes with Fedora CoreOS Nodes Only.
- This feature deploys the sdc kernel modules on CoreOS nodes with the help of an init container.
- **Required:** MDM value should be provided in CR file for the sdc init container to work. MDM provided in CR file will be overrided by config.json secret given below
- **Note:** To use a sdc-binary module from customer ftp site:
  - Create a secret, sdc-repo-secret.yaml to contain the credentials for the private repo. To generate the base64 encoding of a credential:
 ```yaml
      echo -n <credential>| base64 -i
``` 
   secret sample to use:
 ```yaml
      apiVersion: v1
      kind: Secret
      metadata:
        name: sdc-repo-creds
        namespace: vxflexos
      type: Opaque
      data:
        # set username to the base64 encoded username, sdc default is
          username: <username in base64>
        # set password to the base64 encoded password, sdc default is
          password: <password in base64>
```  
  - Create secret for FTP side by using the command `kubectl create -f sdc-repo-secret.yaml`.
- Optionally, enable sdc monitor by uncommenting the section for sidecar in manifest yaml.
##### Example CR:  [config/samples/vxflex_v140_ops_46.yaml](https://github.com/dell/dell-csi-operator/blob/master/samples/vxflex_v140_ops_46.yaml)
```yaml
        sideCars:
    # Uncomment the following section if you want to run the monitoring sidecar
      - name: sdc-monitor
        envs:
        - name: HOST_PID
          value: "1"
        - name: MDM
          value: "10.xx.xx.xx,10.xx.xx.xx"
    initContainers:
      - image: dellemc/sdc:3.5.1.1
        imagePullPolicy: IfNotPresent
        name: sdc
        envs:
          - name: MDM
            value: "10.xx.xx.xx,10.xx.xx.xx"
```  

### Install Driver

1. Create namespace: 
   Run `kubectl create namespace <driver-namespace>` command using the desired name to create the namespace.
2. Prepare the config.json for driver configuration. The following table lists driver configuration parameters for multiple storage arrays.

    | Parameter | Description                                                  | Required | Default |
    | --------- | ------------------------------------------------------------ | -------- | ------- |
    | username  | Username for accessing PowerFlex system                      | true     | -       |
    | password  | Password for accessing PowerFlex system                      | true     | -       |
    | systemID  | System name/ID of PowerFlex system                           | true     | -       |
    | endpoint  | REST API gateway HTTPS endpoint for PowerFlex system         | true     | -       |
    | insecure  | Determines if the driver is going to validate certs while connecting to PowerFlex REST API interface | true     | true    |
    | isDefault | An array having isDefault=true is for backward compatibility. This parameter should occur once in the list | false    | false   |
    | mdm       | mdm defines the MDM(s) that SDC should register with on start. This should be an list of MDM IP addresses or hostnames separated by comma | true     | -       |

    Example: config.json

    ```json
    [
        {
            "username": "admin",
            "password": "password",
            "systemID": "ID1",
            "endpoint": "http://127.0.0.1",
            "insecure": true,
            "isDefault": true,
            "mdm": "10.0.0.1,10.0.0.2"
        },
        {
            "username": "admin",
            "password": "password",
            "systemID": "ID2",
            "endpoint": "https://127.0.0.2",
            "insecure": true,
            "mdm": "10.0.0.3,10.0.0.4"
        }
    ]
    ```

    After editing the file, run the following command to create a secret called `vxflexos-config`
    `kubectl create secret generic vxflexos-config -n <driver-namespace> --from-file=config=config.json`

    Use the following command to replace or update the secret:

    `kubectl create secret generic vxflexos-config -n <driver-namespace> --from-file=config=config.json -o yaml --dry-run=client | kubectl replace -f -`

    *Note:* 

    - The user needs to validate the JSON syntax and array related key/values while replacing the vxflexos-creds secret.
    - If you update the secret, you must reinstall the driver.
    - System ID, MDM configuration etc. now are taken directly from config.json. MDM provided in the input_sample_file.yaml will be overided with MDM values in config.json.

3. Create a Custom Resource (CR) for PowerFlex using the sample files provided    [here](https://github.com/dell/dell-csi-operator/tree/master/samples) .
4. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerFlex driver and their default values:
   
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | replicas | Controls the amount of controller pods you deploy. If the number of controller pods are greater than number of available nodes, excess pods will become stay in a pending state. Defaults is 2 which allows for Controller high availability. | Yes | 2 |
   | ***Common parameters for node and controller*** |
   | X_CSI_VXFLEXOS_ENABLELISTVOLUMESNAPSHOT | Enable list volume operation to include snapshots (since creating a volume from a snap actually results in a new snap) | No | false |
   | X_CSI_VXFLEXOS_ENABLESNAPSHOTCGDELETE | Enable this to automatically delete all snapshots in a consistency group when a snap in the group is deleted | No | false |
   | X_CSI_DEBUG | To enable debug mode | No | false |
   | X_CSI_ALLOW_RWO_MULTI_POD_ACCESS | Setting allowRWOMultiPodAccess to "true" will allow multiple pods on the same node to access the same RWO volume. This behavior conflicts with the CSI specification version 1.3. NodePublishVolume description that requires an error to be returned in this case. However, some other CSI drivers support this behavior and some customers desire this behavior. Customers use this option at their own risk. | No | false |
   | ***StorageClass parameters*** |
   | storagePool | Defines the PowerFlex storage pool from which this driver will provision volumes. You must set this for the primary storage pool to be used | Yes | pool1 |
   | allowVolumeExpansion | Once the allowed topology is modified in storage class, pods/and volumes will always be scheduled on nodes that have access to the storage | No | true |
   | allowedTopologies:key | This is to enable topology to allow pods/and volumes to always be scheduled on nodes that have access to the storage. You need to replace the X_CSI_VXFLEXOS_SYSTEMNAME in the key with the actual systemname value | No | X_CSI_VXFLEXOS_SYSTEMNAME |
   | initContainers:value | Set the MDM IP's here if installing on CoreOS to enable automatic SDC installation | Yes (OpenShift) | "10.xx.xx.xx,10.xx.xx.xx"|
5.  Execute the `kubectl create -f <input_sample_file.yaml>` command to create PowerFlex custom resource. This command will deploy the CSI-PowerFlex driver.
