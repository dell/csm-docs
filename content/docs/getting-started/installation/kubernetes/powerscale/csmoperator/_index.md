---
title: "CSM Operator"
linkTitle: "CSM Operator"
no_list: true
description: CSM Operator Installation
weight: 2
---

## Installing the Operator
To deploy the Operator, follow the instructions available [here](../../operatorinstallation.md).

{{< accordion id="One" title="CSM Installation Wizard" >}}
  {{< include "content/docs/getting-started/installation/kubernetes/installationwizardoperator.md" >}}
{{< /accordion >}}
<br>

{{< accordion id="Two" title="CSI Driver" markdown="true" >}}  

### Install Driver

1. Follow all the [prerequisites](#prerequisite) above

2. Create a CR (Custom Resource) for PowerScale using the sample files provided

    a. Install the PowerScale driver using default configuration using
    the sample file provided
   [here](https://github.com/dell/csm-operator/tree/main/samples/minimal-samples). This file can be modified to use custom parameters if needed.

    b. Install the PowerScale driver using the detailed configuration using the sample file provided
    [here](https://github.com/dell/csm-operator/tree/main/samples).

3. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerScale driver and their default values:

   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | dnsPolicy | Determines the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
   | fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No | "ReadWriteOnceWithFSType" |
   | storageCapacity | Enable/Disable storage capacity tracking feature | No | false |
   | ***Common parameters for node and controller*** |
   | CSI_ENDPOINT | The UNIX socket address for handling gRPC calls | No | /var/run/csi/csi.sock |
   | X_CSI_ISI_SKIP_CERTIFICATE_VALIDATION | Specifies whether SSL security needs to be enabled for communication between PowerScale and CSI Driver | No | true |
   | X_CSI_ISI_PATH | Base path for the volumes to be created | Yes | |
   | X_CSI_ALLOWED_NETWORKS | Custom networks for PowerScale export. List of networks that can be used for NFS I/O traffic, CIDR format should be used | No | empty |
   | X_CSI_ISI_AUTOPROBE | To enable auto probing for driver | No | true |
   | X_CSI_ISI_NO_PROBE_ON_START | Indicates whether the controller/node should probe during initialization | Yes | |
   | X_CSI_ISI_VOLUME_PATH_PERMISSIONS | The permissions for isi volume directory path | Yes | 0777 |
   | X_CSI_ISI_AUTH_TYPE | Indicates the authentication method to be used. If set to 1 then it follows as session-based authentication else basic authentication. If CSM Authorization is enabled, this value must be set to 1. | No | 0 |
   | ***Controller parameters*** |
   | X_CSI_MODE   | Driver starting mode  | No | controller |
   | X_CSI_ISI_ACCESS_ZONE | Name of the access zone a volume can be created in | No | System |
   | X_CSI_ISI_QUOTA_ENABLED | To enable SmartQuotas | Yes | |
   | ***Node parameters*** |
   | X_CSI_MAX_VOLUMES_PER_NODE | Specify the default value for the maximum number of volumes that the controller can publish to the node | Yes | 0 |
   | X_CSI_MODE   | Driver starting mode  | No | node |

5. Execute the following command to create PowerScale custom resource:

    ```bash
    kubectl create -f <input_sample_file.yaml>
    ```

    This command will deploy the CSI-PowerScale driver in the namespace specified in the input YAML file.

6. [Verify the CSI Driver installation](../#verifying-the-driver-installation)

7. Refer https://github.com/dell/csi-powerscale/tree/main/samples for the sample files.

**Note** :

   1. "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
   2. Also, snapshotter and resizer sidecars are not optional to choose, it comes default with Driver installation.

{{< /accordion >}}  
<br>
{{< accordion id="Three" title="CSM Modules" >}}

<div class="container mt-5 ps-0" style="margin-left:0px;">
    <div class="row">
      <div class="col-md-6 mb-4">
    {{< customcard link1="./csm-modules/authorizationv1.x"  image="../../../../../../icons/doc-reports.svg" title="Authorization v1.x" >}}
      </div>
      <div class="col-md-6 mb-4">
       {{< customcard link1="./csm-modules/authorizationv2.0"   image="../../../../../../icons/doc-reports.svg" title="Authorization v2.0"  >}}
       </div>
    </div>
       <div class="row">
      <div class="col-md-6 mb-4">
      {{< customcard  link1="./csm-modules/observability"   image="../../../../../../icons/doc-reports.svg" title="Observability"  >}}
      </div>
      <div class="col-md-6 mb-4">
        {{< customcard  link1="./csm-modules/replication"  image="../../../../../../icons/doc-reports.svg" title="Replication"  >}} 
        </div>
    </div> 
    <div class="row">
      <div class="col-md-6 mb-4">
          {{< customcard link1="./csm-modules/resiliency"   image="../../../../../../icons/doc-reports.svg" title="Resiliency"  >}}
        </div>  
      </div>
</div>
{{< /accordion >}}  
