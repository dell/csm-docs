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

2. Create a CR (Custom Resource) for PowerFlex using the sample files provided

    a. Install the PowerFlex driver using default configuration using
    the sample file provided
   [here](https://github.com/dell/csm-operator/tree/main/samples/minimal-samples). This file can be modified to use custom parameters if needed.

    b. Install the PowerFlex driver using the detailed configuration using the sample file provided
    [here](https://github.com/dell/csm-operator/tree/main/samples).

3. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerFlex driver and their default values:

   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | dnsPolicy | Determines the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
   | fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No | "ReadWriteOnceWithFSType" |
   | replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, excess pods will become stay in a pending state. Defaults are 2 which allows for Controller high availability. | Yes | 2 |
   | storageCapacity.enabled | Enable/Disable storage capacity tracking | No | true |
   | storageCapacity.pollInterval | Configure how often the driver checks for changed capacity | No | 5m |
   | enableQuota | a boolean that, when enabled, will set quota limit for a newly provisioned NFS volume | No | none |
   | maxVxflexosVolumesPerNode | Specify default value for maximum number of volumes that controller can publish to the node.If value is zero CO SHALL decide how many volumes of this type can be published by the controller to the node | Yes | 0 |
   | ***Common parameters for node and controller*** |
   | X_CSI_VXFLEXOS_ENABLELISTVOLUMESNAPSHOT | Enable list volume operation to include snapshots (since creating a volume from a snap actually results in a new snap) | No | false |
   | X_CSI_VXFLEXOS_ENABLESNAPSHOTCGDELETE | Enable this to automatically delete all snapshots in a consistency group when a snap in the group is deleted | No | false |
   | X_CSI_DEBUG | To enable debug mode | No | true |
   | X_CSI_ALLOW_RWO_MULTI_POD_ACCESS | Setting allowRWOMultiPodAccess to "true" will allow multiple pods on the same node to access the same RWO volume. This behavior conflicts with the CSI specification version 1.3. NodePublishVolume description that requires an error to be returned in this case. However, some other CSI drivers support this behavior and some customers desire this behavior. Customers use this option at their own risk. | No | false |
   | INTERFACE_NAMES | A mapping of node names to interface names. Only necessary when SDC is disabled. | No | none |
   | ***Controller parameters*** |
   | X_CSI_POWERFLEX_EXTERNAL_ACCESS | allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | empty |
   | X_CSI_HEALTH_MONITOR_ENABLED | Enable/Disable health monitor of CSI volumes from Controller plugin - volume condition | No | false |
   | ***Node parameters*** |
   | X_CSI_RENAME_SDC_ENABLED | Enable this to rename the SDC with the given prefix. The new name will be ("prefix" + "worker_node_hostname") and it should not exceed 31 chars. | Yes | false |
   | X_CSI_APPROVE_SDC_ENABLED | Enable this to to approve restricted SDC by GUID during setup | Yes | false |
   | X_CSI_HEALTH_MONITOR_ENABLED | Enable/Disable health monitor of CSI volumes from Node plugin - volume condition | No | false |
   | X_CSI_SDC_ENABLED | Enable/Disable installation of the SDC. | Yes | true |

4.  Execute this command to create PowerFlex custom resource:
    ```bash
    kubectl create -f <input_sample_file.yaml>
    ```
    This command will deploy the CSI-PowerFlex driver in the namespace specified in the input YAML file.

5.  [Verify the CSI Driver installation](../#verifying-the-driver-installation)

6.  Refer https://github.com/dell/csi-powerflex/tree/main/samples for the sample files.

**Note** :
   1. Snapshotter and resizer sidecars are installed by default.
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