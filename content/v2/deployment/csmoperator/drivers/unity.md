---
title: Unity XT
linkTitle: "Unity XT"
description: >
  Installing Dell CSI Driver for Unity XT via Dell CSM Operator
---

## Installing CSI Driver for Unity XT via Dell CSM Operator

The CSI Driver for Dell Unity XT can be installed via the Dell CSM Operator.
To deploy the Operator, follow the instructions available [here](../../#installation).

Note that the deployment of the driver using the operator does not use any Helm charts and the installation and configuration parameters will be slightly different from the one specified via the Helm installer.

### Listing installed drivers with the ContainerStorageModule CRD
User can query for all Dell CSI drivers using the following command:
```bash
kubectl get csm --all-namespaces
```


### Prerequisite

1. Create namespace.
   Execute `kubectl create namespace unity` to create the unity namespace (if not already present). Note that the namespace can be any user-defined name, in this example, we assume that the namespace is 'unity'.

2. Create a file called `secret.yaml` that has Unity XT array connection details with the following content
   ```yaml
      storageArrayList:
      - arrayId: "APM00******1"                 # unique array id of the Unisphere array
        username: "user"                        # username for connecting to API
        password: "password"                    # password for connecting to API
        endpoint: "https://10.1.1.1/"           # full URL path to the Unity XT API
        skipCertificateValidation: true         # indicates if client side validation of (management)server's certificate can be skipped
        isDefault: true                         # treat current array as a default (would be used by storage classes without arrayID parameter)
   ```
   Change the parameters with relevant values for your Unity XT array.
   Add more blocks similar to above for each Unity XT array if necessary.

3. Use the following command to create a new secret unity-creds from `secret.yaml` file.

    `kubectl create secret generic unity-creds -n unity --from-file=config=secret.yaml`

   Use the following command to replace or update the secret:

    `kubectl create secret generic unity-creds -n unity --from-file=config=secret.yaml -o yaml --dry-run | kubectl replace -f -`

### Install Driver

1. Follow all the [prerequisites](#prerequisite) above

2. Create a CR (Custom Resource) for Unity XT using the sample files provided
   [here](https://github.com/dell/csm-operator/tree/master/samples). This file can be modified to use custom parameters if needed.

3. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the Unity XT driver and their default values:

| Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be in pending state until new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
| namespace | Specifies namespace where the driver will be installed | Yes | "unity" |
| fsGroupPolicy | Defines which FS Group policy mode to be used. Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No |"ReadWriteOnceWithFSType"|
| storageCapacity.enabled | Enable/Disable storage capacity tracking | No | true |
| storageCapacity.pollInterval | Configure how often the driver checks for changed capacity | No | 5m |
| ***Common parameters for node and controller*** |
| X_CSI_UNITY_ALLOW_MULTI_POD_ACCESS | To enable sharing of volumes across multiple pods within the same node in RWO access mode | No | false |
| X_CSI_UNITY_SYNC_NODEINFO_INTERVAL | Time interval to add node info to array. Default 15 minutes. Minimum value should be 1 | No | 15 |
| CSI_LOG_LEVEL | Sets the logging level of the driver | true | info |
| TENANT_NAME | Tenant name added while adding host entry to the array | No |  |
| CERT_SECRET_COUNT | Represents the number of certificate secrets, which the user is going to create for SSL authentication. (unity-cert-0..unity-cert-n). The minimum value should be 1. | false | 1 |
| X_CSI_UNITY_SKIP_CERTIFICATE_VALIDATION | Specifies if the driver is going to validate unisphere certs while connecting to the Unisphere REST API interface.If it is set to false, then a secret unity-certs has to be created with an X.509 certificate of CA which signed the Unisphere certificate | No | true |
| ***Controller parameters*** |
| X_CSI_HEALTH_MONITOR_ENABLED | Enable/Disable health monitor of CSI volumes from Controller plugin - volume condition | No | false |
| ***Node parameters*** |
| X_CSI_HEALTH_MONITOR_ENABLED | Enable/Disable health monitor of CSI volumes from Controller plugin - volume condition | No | false |
| X_CSI_ALLOWED_NETWORKS | Custom networks for Unity export. List of networks that can be used for NFS I/O traffic, CIDR format should be used "ip/prefix, ip/prefix" | No | empty |

4.  Execute the following command to create Unity XT custom resource:
   ```bash
   kubectl create -f <input_sample_file.yaml>
   ```
   This command will deploy the CSI Unity XT driver in the namespace specified in the input YAML file.

   - Next, the driver should be installed, you can check the condition of driver pods by running
      ```bash
      kubectl get all -n <driver-namespace>
      ```

5.  [Verify the CSI Driver installation](../#verifying-the-driver-installation)

6. Refer https://github.com/dell/csi-unity/tree/main/samples for the sample files.

**Note** :
   1. "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
   2. Snapshotter and resizer sidecars are not optional. They are defaults with Driver installation.
