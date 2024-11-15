---
title: Operator
linkTitle: Operator
description: >
  Installing the CSI Driver for Dell PowerStore via Dell CSM Operator
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

## Installing the Operator
To deploy the Operator, follow the instructions available [here](../../operatorinstallation.md).

{{< accordion id="One" title="CSM Installation Wizard" >}}
  {{< include "content/docs/getting-started/installation/kubernetes/installationwizardoperator.md" >}}
{{< /accordion >}}
<br>

{{< accordion id="Two" title="CSI Driver" markdown="true" >}}  

## Install Driver

1. Follow all the [prerequisites](#prerequisites) above

2. Create a CR (Custom Resource) for PowerStore using the sample files provided

    a. Install the PowerStore driver using default configuration using
    the sample file provided
   [here](https://github.com/dell/csm-operator/tree/main/samples/minimal-samples). This file can be modified to use custom parameters if needed.

    b. Install the PowerStore driver using the detailed configuration using
    the sample file provided
    [here](https://github.com/dell/csm-operator/tree/main/samples).

3. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerStore driver and their default values:

  | Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be in pending state until new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
| namespace | Specifies namespace where the driver will be installed | Yes | "powerstore" |
| fsGroupPolicy | Defines which FS Group policy mode to be used. Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No |"ReadWriteOnceWithFSType"|
| storageCapacity | Enable/Disable storage capacity tracking feature | No | false |
| ***Common parameters for node and controller*** |
| X_CSI_POWERSTORE_NODE_NAME_PREFIX | Prefix to add to each node registered by the CSI driver | Yes | "csi-node"
| X_CSI_FC_PORTS_FILTER_FILE_PATH | To set path to the file which provides a list of WWPN which should be used by the driver for FC connection on this node | No | "/etc/fc-ports-filter" |
| ***Controller parameters*** |
| X_CSI_POWERSTORE_EXTERNAL_ACCESS | allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | empty |
| X_CSI_NFS_ACLS | Defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory. | No | "0777" |
| ***Node parameters*** |
| X_CSI_POWERSTORE_ENABLE_CHAP | Set to true if you want to enable iSCSI CHAP feature | No | false |

4.  Execute the following command to create PowerStore custom resource:
   ```bash
   kubectl create -f <input_sample_file.yaml>
   ```
   This command will deploy the CSI PowerStore driver in the namespace specified in the input YAML file.

   - Next, the driver should be installed, you can check the condition of driver pods by running
      ```bash
      kubectl get all -n <driver-namespace>
      ```

5.  [Verify the CSI Driver installation](../#verifying-the-driver-installation)

6. Refer https://github.com/dell/csi-powerstore/tree/main/samples for the sample files.

**Note** :
   1. "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
   2. Snapshotter and resizer sidecars are not optional. They are defaults with Driver installation.

## Dynamic secret change detection

CSI PowerStore supports the ability to dynamically modify array information within the secret, allowing users to update
<u>_credentials_</u> for the PowerStore arrays, in-flight, without restarting the driver.
> Note: Updates to the secret that include adding a new array, or modifying the endpoint, globalID, or blockProtocol parameters
> require the driver to be restarted to properly pick up and process the changes.

To do so, change the configuration file `config.yaml` and apply the update using the following command:
```bash

sed "s/CONFIG_YAML/`cat config.yaml | base64 -w0`/g" secret.yaml | kubectl apply -f -
```
{{< /accordion >}}  
<br>
{{< accordion id="Three" title="CSM Modules" >}}
<div class="container mt-5 ps-0" style="margin-left:0px;">
    <div class="row">
      <div class="col-md-6 mb-4">
          {{< customcard link1="./csm-modules/resiliency"   image="../../../../../../icons/doc-reports.svg" title="Resiliency"  >}}
        </div>  
      </div>
</div>
{{< /accordion >}}  