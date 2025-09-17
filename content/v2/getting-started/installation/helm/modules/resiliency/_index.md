---
title: Resiliency
linktitle: Resiliency 
weight: 3
description: >
  Dell Container Storage Modules (CSM) for Resiliency installation
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}
CSM for Resiliency is installed as part of the Dell CSI driver installation.

{{< hide class="1" >}}For information on the PowerFlex CSI driver, see [PowerFlex CSI Driver](https://github.com/dell/csi-powerflex).{{< /hide >}} 
<br>
{{< hide class="2" >}}For information on the Unity XT CSI driver, see [Unity XT CSI Driver](https://github.com/dell/csi-unity).{{< /hide >}} 
<br>
{{< hide class="3" >}}For information on the PowerScale CSI driver, see [PowerScale CSI Driver](https://github.com/dell/csi-powerscale).{{< /hide >}}
<br>
{{< hide class="4" >}}For information on the PowerStore CSI driver, see [PowerStore CSI Driver](https://github.com/dell/csi-powerstore).{{< /hide >}} 
<br>
{{< hide class="5" >}}For information on the PowerStore CSI driver, see [PowerMax CSI Driver](https://github.com/dell/csi-powermax). {{< /hide >}}

## Prerequisite

- The CSM for Resiliency module only acts on pods with a specific label. 
- This label must match the key and value set in the module’s configuration.
- On startup, CSM for Resiliency logs the label key and value it uses to monitor pods. 
- Apply this label to the Statefulset you want monitored by CSM for Resiliency.

 ```yaml
 labelSelector: {map[podmon.dellemc.com/driver:csi-<driver>]}
 ```
 The above message indicates the key is: podmon.dellemc.com/driver and the label value is `csi-<driver>`. To search for the pods that would be monitored, try this:
 ```bash
 kubectl get pods -A -l podmon.dellemc.com/driver=csi-<driver>
```
>Note: `<driver>` should be replaced with respective driver name 

 User must follow all the prerequisites of the respective drivers before enabling this module.

### Storage Array Upgrades
- Disable CSM for Resiliency during storage array upgrades to prevent application pods from getting stuck in a Pending state, even if the upgrade is advertised as non-disruptive.
- If nodes lose connectivity with the array, Resiliency will delete the pods on affected nodes and attempt to move them to a healthy node.
- If all nodes are affected, the pods will be stuck in a Pending state.
Configure all the helm chart parameters described below before installing the drivers.

## Helm Chart Installation

The drivers that support Helm chart installation allow CSM for Resiliency to be _optionally_ installed by variables in the chart. There is a _podmon_ block specified in the _values.yaml_ file of the chart that will look similar to the text below by default:

```yaml
# Enable this feature only after contact support for additional information
podmon:
  enabled: true
  controller:
    args:
      - "--csisock=unix:/var/run/csi/csi.sock"
      - "--labelvalue=csi-<driver>"
      - "--mode=controller"
      - "--skipArrayConnectionValidation=false"
      - "--driver-config-params=/<driver>-config-params/driver-config-params.yaml"
      - "--driverPodLabelValue=dell-storage"
      - "--ignoreVolumelessPods=false"
  node:
    args:
      - "--csisock=unix:/var/lib/kubelet/plugins/<driver>.emc.dell.com/csi_sock"
      - "--labelvalue=csi-<driver>"
      - "--mode=node"
      - "--leaderelection=false"
      - "--driver-config-params=/<driver>-config-params/driver-config-params.yaml"
      - "--driverPodLabelValue=dell-storage"
      - "--ignoreVolumelessPods=false"

```
>Note: `<driver>` should be replaced with respective driver name 


To install CSM for Resiliency with the driver:
1. Enable CSM for Resiliency by setting `podmon.enabled` to `true` (enables both controller-podmon and node-podmon).
2. If you need to change the registry, specify the podmon image to be used in `images.podmon`
3. Provide arguments for controller-podmon in `podmon.controller.args` (some arguments are required and differ from node-podmon). See “Podmon Arguments” below.
4. Provide arguments for node-podmon in `podmon.node.args` (some arguments are required and differ from controller-podmon). See “Podmon Arguments” below.

## Podmon Arguments
{{< collapse id="1" title="Arguments">}}
| Argument | Required | Description | Applicability |
|-|-|-|-|
| enabled | Required | Boolean "true" enables CSM for Resiliency installation with the driver in a helm installation. | top level |
| mode | Required | Must be set to "controller" for controller-podmon and "node" for node-podmon. | controller & node |
| csisock | Required | This should be left as set in the helm template for the driver. For controller: <br> `-csisock=unix:/var/run/csi/csi.sock` <br> For node it will vary depending on the driver's identity: <br> `-csisock=unix:/var/lib/kubelet/plugins`<br>`/vxflexos.emc.dell.com/csi_sock` | controller & node |
| leaderelection | Required | Boolean value that should be set true for controller and false for node. The default value is true. | controller & node |
| skipArrayConnectionValidation | Optional | Boolean value that if set to true will cause controllerPodCleanup to skip the validation that no I/O is ongoing before cleaning up the pod. If set to true will cause controllerPodCleanup on K8S Control Plane failure (kubelet service down). | controller |
| labelKey | Optional | String value that sets the label key used to denote pods to be monitored by CSM for Resiliency. It will make life easier if this key is the same for all driver types, and drivers are differentiated by different labelValues (see below). If the label keys are the same across all drivers you can do `kubectl get pods -A -l labelKey` to find all the CSM for Resiliency protected pods. labelKey defaults to "podmon.dellemc.com/driver". | controller & node |
| labelValue | Required | String that sets the value that denotes pods to be monitored by CSM for Resiliency. This must be specific for each driver. Defaults to "csi-vxflexos" for CSI Driver for Dell PowerFlex and "csi-unity" for CSI Driver for Dell Unity XT | controller & node |
| arrayConnectivityPollRate | Optional | The minimum polling rate in seconds to determine if the array has connectivity to a node. Should not be set to less than 5 seconds. See the specific section for each array type for additional guidance. | controller & node |
| arrayConnectivityConnectionLossThreshold | Optional | Gives the number of failed connection polls that will be deemed to indicate array connectivity loss. Should not be set to less than 3. See the specific section for each array type for additional guidance. | controller |
| driver-config-params | Required | String that set the path to a file containing configuration parameter(for instance, Log levels) for a driver.  | controller & node |
| ignoreVolumelessPods | Optional | Boolean value that if set to true will enable CSM for Resiliency to ignore pods without persistent volume attached to the pod. | controller & node |
{{< /collapse >}}
<br> 

{{< hide class="1" >}}

## PowerFlex Specific Recommendations

PowerFlex supports a very robust array connection validation mechanism that can detect changes in connectivity in about two seconds and can detect whether I/O has occurred over a five-second sample. For that reason it is recommended to set "skipArrayConnectionValidation=false" (which is the default) and to set "arrayConnectivityPollRate=5" (5 seconds) and "arrayConnectivityConnectionLossThreshold=3" to 3 or more.

Here is a typical installation used for testing:

```yaml
podmon:
  enabled: true
  controller:
    args:
      - "--csisock=unix:/var/run/csi/csi.sock"
      - "--labelvalue=csi-vxflexos"
      - "--mode=controller"
      - "--arrayConnectivityPollRate=5"
      - "--arrayConnectivityConnectionLossThreshold=3"
      - "--skipArrayConnectionValidation=false"
      - "--driver-config-params=/vxflexos-config-params/driver-config-params.yaml"
      - "--driverPodLabelValue=dell-storage"
      - "--ignoreVolumelessPods=false"
  node:
    args:
      - "--csisock=unix:/var/lib/kubelet/plugins/vxflexos.emc.dell.com/csi_sock"
      - "--labelvalue=csi-vxflexos"
      - "--mode=node"
      - "--leaderelection=false"
      - "--driver-config-params=/vxflexos-config-params/driver-config-params.yaml"
      - "--driverPodLabelValue=dell-storage"
      - "--ignoreVolumelessPods=false"

```
{{< /hide >}}

{{< hide class="2" >}}

## Unity XT Specific Recommendations

Here is a typical installation used for testing:

```yaml
podmon:
   enabled: true
   controller:
     args:
       - "--csisock=unix:/var/run/csi/csi.sock"
       - "--labelvalue=csi-unity"
       - "--driverPath=csi-unity.dellemc.com"
       - "--mode=controller"
       - "--skipArrayConnectionValidation=false"
       - "--driver-config-params=/unity-config/driver-config-params.yaml"
       - "--driverPodLabelValue=dell-storage"
       - "--ignoreVolumelessPods=false"
   node:
     args:
       - "--csisock=unix:/var/lib/kubelet/plugins/unity.emc.dell.com/csi_sock"
       - "--labelvalue=csi-unity"
       - "--driverPath=csi-unity.dellemc.com"
       - "--mode=node"
       - "--leaderelection=false"
       - "--driver-config-params=/unity-config/driver-config-params.yaml"
       - "--driverPodLabelValue=dell-storage"
       - "--ignoreVolumelessPods=false"

``` 
{{< /hide >}}

{{< hide class="3" >}}

## PowerScale Specific Recommendations

Here is a typical installation used for testing:

```yaml
podmon:
  enabled: true
  controller:
    args:
      - "--csisock=unix:/var/run/csi/csi.sock"
      - "--labelvalue=csi-isilon"
      - "--arrayConnectivityPollRate=60"
      - "--driverPath=csi-isilon.dellemc.com"
      - "--mode=controller"
      - "--skipArrayConnectionValidation=false"
      - "--driver-config-params=/csi-isilon-config-params/driver-config-params.yaml"
      - "--driverPodLabelValue=dell-storage"
      - "--ignoreVolumelessPods=false"
  node:
    args:
      - "--csisock=unix:/var/lib/kubelet/plugins/csi-isilon/csi_sock"
      - "--labelvalue=csi-isilon"
      - "--arrayConnectivityPollRate=60"
      - "--driverPath=csi-isilon.dellemc.com"
      - "--mode=node"
      - "--leaderelection=false"
      - "--driver-config-params=/csi-isilon-config-params/driver-config-params.yaml"
      - "--driverPodLabelValue=dell-storage"
      - "--ignoreVolumelessPods=false"
``` 
{{< /hide >}} 

{{< hide class="4" >}}


## PowerStore Specific Recommendations

Here is a typical installation used for testing:

```yaml
podmon:
  enabled: true
  controller:
    args:
      - "--csisock=unix:/var/run/csi/csi.sock"
      - "--labelvalue=csi-powerstore"
      - "--arrayConnectivityPollRate=60"
      - "--driverPath=csi-powerstore.dellemc.com"
      - "--mode=controller"
      - "--skipArrayConnectionValidation=false"
      - "--driver-config-params=/powerstore-config-params/driver-config-params.yaml"
      - "--driverPodLabelValue=dell-storage"
      - "--ignoreVolumelessPods=false"

  node:
    args:
      - "--csisock=unix:/var/lib/kubelet/plugins/csi-powerstore.dellemc.com/csi_sock"
      - "--labelvalue=csi-powerstore"
      - "--arrayConnectivityPollRate=60"
      - "--driverPath=csi-powerstore.dellemc.com"
      - "--mode=node"
      - "--leaderelection=false"
      - "--driver-config-params=/powerstore-config-params/driver-config-params.yaml"
      - "--driverPodLabelValue=dell-storage"
      - "--ignoreVolumelessPods=false"
```
{{< /hide >}}

{{< hide class="5" >}}

## PowerMax Specific Recommendations

Here is a typical installation used for testing:

```yaml
podmon:
  enabled: false
  controller:
    args:
      - "--csisock=unix:/var/run/csi/csi.sock"
      - "--labelvalue=csi-powermax"
      - "--arrayConnectivityPollRate=60"
      - "--driverPath=csi-powermax.dellemc.com"
      - "--mode=controller"
      - "--skipArrayConnectionValidation=false"
      - "--driver-config-params=/powermax-config-params/driver-config-params.yaml"
      - "--driverPodLabelValue=dell-storage"
      - "--ignoreVolumelessPods=false"

  node:
    args:
      - "--csisock=unix:/var/lib/kubelet/plugins/powermax.emc.dell.com/csi_sock"
      - "--labelvalue=csi-powermax"
      - "--arrayConnectivityPollRate=60"
      - "--driverPath=csi-powermax.dellemc.com"
      - "--mode=node"
      - "--leaderelection=false"
      - "--driver-config-params=/powermax-config-params/driver-config-params.yaml"
      - "--driverPodLabelValue=dell-storage"
      - "--ignoreVolumelessPods=false"
``` 
{{< /hide >}}


## Dynamic parameters

CSM for Resiliency has configuration parameters that can be updated dynamically, such as the logging level and format. This can be 
done by editing the Dell CSI Driver's parameters ConfigMap. The ConfigMap can be queried using kubectl. 
For example, the Dell Powerflex CSI Driver ConfigMaps can be found using this command: `kubectl get -n vxflexos configmap`. 
The ConfigMap to edit will have this pattern: <storage>-config-params (e.g., `vxflexos-config-params`).

To update or add parameters, you can use the `kubectl edit` command. For example, `kubectl edit -n vxflexos configmap vxflexos-config-params`.

This is a list of parameters that can be adjusted for CSM for Resiliency:

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| PODMON_CONTROLLER_LOG_FORMAT | String | "text" |Logging format output for the controller podmon sidecar. Should be "text" or "json" |
| PODMON_CONTROLLER_LOG_LEVEL | String | "debug" |Logging level for the controller podmon sidecar. Standard values: 'info', 'error', 'warning', 'debug', 'trace' |
| PODMON_NODE_LOG_FORMAT | String | "text" |Logging format output for the node podmon sidecar. Should be "text" or "json" |
| PODMON_NODE_LOG_LEVEL | String | "debug" |Logging level for the node podmon sidecar. Standard values: 'info', 'error', 'warning', 'debug', 'trace' |
| PODMON_ARRAY_CONNECTIVITY_POLL_RATE | Integer (>0) | 15 |An interval in seconds to poll the underlying array | 
| PODMON_ARRAY_CONNECTIVITY_CONNECTION_LOSS_THRESHOLD | Integer (>0) | 3 |A value representing the number of failed connection poll intervals before marking the array connectivity as lost |
| PODMON_SKIP_ARRAY_CONNECTION_VALIDATION | Boolean | false |Flag to disable the array connectivity check, set to true for NoSchedule or NoExecute taint due to K8S Control Plane failure (kubelet failure) |

Here is an example of the parameters:

```yaml
    PODMON_CONTROLLER_LOG_FORMAT: "text"
    PODMON_CONTROLLER_LOG_LEVEL: "info"
    PODMON_NODE_LOG_FORMAT: "text"
    PODMON_NODE_LOG_LEVEL: "info"
    PODMON_ARRAY_CONNECTIVITY_POLL_RATE: 20
    PODMON_ARRAY_CONNECTIVITY_CONNECTION_LOSS_THRESHOLD: 2
    PODMON_SKIP_ARRAY_CONNECTION_VALIDATION: true
```