---
title: Deployment
linktitle: Deployment 
weight: 3
description: >
  Dell Container Storage Modules (CSM) for Resiliency installation
---

CSM for Resiliency is installed as part of the Dell CSI driver installation. The drivers can be installed either by a _helm chart_ or by the _Dell CSI Operator_. Currently, only _Helm chart_ installation is supported.

For information on the PowerFlex CSI driver, see [PowerFlex CSI Driver](https://github.com/dell/csi-powerflex).

For information on the Unity XT CSI driver, see [Unity XT CSI Driver](https://github.com/dell/csi-unity).

For information on the PowerScale CSI driver, see [PowerScale CSI Driver](https://github.com/dell/csi-powerscale).

Configure all the helm chart parameters described below before installing the drivers.

## Helm Chart Installation

The drivers that support Helm chart installation allow CSM for Resiliency to be _optionally_ installed by variables in the chart. There is a _podmon_ block specified in the _values.yaml_ file of the chart that will look similar to the text below by default:

```
# Enable this feature only after contact support for additional information
podmon:
  enabled: true
  image: dellemc/podmon:v1.3.0
  controller:
    args:
      - "--csisock=unix:/var/run/csi/csi.sock"
      - "--labelvalue=csi-vxflexos"
      - "--mode=controller"
      - "--skipArrayConnectionValidation=false"
      - "--driver-config-params=/vxflexos-config-params/driver-config-params.yaml"
      - "--driverPodLabelValue=dell-storage"
  node:
    args:
      - "--csisock=unix:/var/lib/kubelet/plugins/vxflexos.emc.dell.com/csi_sock"
      - "--labelvalue=csi-vxflexos"
      - "--mode=node"
      - "--leaderelection=false"
      - "--driver-config-params=/vxflexos-config-params/driver-config-params.yaml"
      - "--driverPodLabelValue=dell-storage"

```

To install CSM for Resiliency with the driver, the following changes are required:
1. Enable CSM for Resiliency by changing the podmon.enabled boolean to true. This will enable both controller-podmon and node-podmon.
2. Specify the podmon image to be used as podmon.image.
3. Specify arguments to controller-podmon in the podmon.controller.args block. See "Podmon Arguments" below. Note that some arguments are required. Note that the arguments supplied to controller-podmon are different from those supplied to node-podmon.
4. Specify arguments to node-podmon in the podmon.node.args block. See "Podmon Arguments" below. Note that some arguments are required. Note that the arguments supplied to controller-podmon are different from those supplied to node-podmon.

## Podmon Arguments
  
| Argument | Required | Description | Applicability |
|-|-|-|-|
| enabled | Required | Boolean "true" enables CSM for Resiliency installation with the driver in a helm installation. | top level |
| image | Required | Must be set to a repository where the podmon image can be pulled. | controller & node |
| mode | Required | Must be set to "controller" for controller-podmon and "node" for node-podmon. | controller & node |
| csisock | Required | This should be left as set in the helm template for the driver. For controller: <br> `-csisock=unix:/var/run/csi/csi.sock` <br> For node it will vary depending on the driver's identity: <br> `-csisock=unix:/var/lib/kubelet/plugins`<br>`/vxflexos.emc.dell.com/csi_sock` | controller & node |
| leaderelection | Required | Boolean value that should be set true for controller and false for node. The default value is true. | controller & node |
| skipArrayConnectionValidation | Optional | Boolean value that if set to true will cause controllerPodCleanup to skip the validation that no I/O is ongoing before cleaning up the pod. If set to true will cause controllerPodCleanup on K8S Control Plane failure (kubelet service down). | controller |
| labelKey | Optional | String value that sets the label key used to denote pods to be monitored by CSM for Resiliency. It will make life easier if this key is the same for all driver types, and drivers are differentiated by different labelValues (see below). If the label keys are the same across all drivers you can do `kubectl get pods -A -l labelKey` to find all the CSM for Resiliency protected pods. labelKey defaults to "podmon.dellemc.com/driver". | controller & node |
| labelValue | Required | String that sets the value that denotes pods to be monitored by CSM for Resiliency. This must be specific for each driver. Defaults to "csi-vxflexos" for CSI Driver for Dell PowerFlex and "csi-unity" for CSI Driver for Dell Unity XT | controller & node |
| arrayConnectivityPollRate | Optional | The minimum polling rate in seconds to determine if the array has connectivity to a node. Should not be set to less than 5 seconds. See the specific section for each array type for additional guidance. | controller & node |
| arrayConnectivityConnectionLossThreshold | Optional | Gives the number of failed connection polls that will be deemed to indicate array connectivity loss. Should not be set to less than 3. See the specific section for each array type for additional guidance. | controller |
| driver-config-params | Required | String that set the path to a file containing configuration parameter(for instance, Log levels) for a driver.  | controller & node |

## PowerFlex Specific Recommendations

PowerFlex supports a very robust array connection validation mechanism that can detect changes in connectivity in about two seconds and can detect whether I/O has occurred over a five-second sample. For that reason it is recommended to set "skipArrayConnectionValidation=false" (which is the default) and to set "arrayConnectivityPollRate=5" (5 seconds) and "arrayConnectivityConnectionLossThreshold=3" to 3 or more.

Here is a typical installation used for testing:

```yaml
podmon:
  image: dellemc/podmon
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
  node:
    args:
      - "--csisock=unix:/var/lib/kubelet/plugins/vxflexos.emc.dell.com/csi_sock"
      - "--labelvalue=csi-vxflexos"
      - "--mode=node"
      - "--leaderelection=false"
      - "--driver-config-params=/vxflexos-config-params/driver-config-params.yaml"
      - "--driverPodLabelValue=dell-storage"

```

## Unity XT Specific Recommendations

Here is a typical installation used for testing:

```yaml
podmon:
   image: dellemc/podmon
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
   node:
     args:
       - "--csisock=unix:/var/lib/kubelet/plugins/unity.emc.dell.com/csi_sock"
       - "--labelvalue=csi-unity"
       - "--driverPath=csi-unity.dellemc.com"
       - "--mode=node"
       - "--leaderelection=false"
       - "--driver-config-params=/unity-config/driver-config-params.yaml"
       - "--driverPodLabelValue=dell-storage"

```

## PowerScale Specific Recommendations

Here is a typical installation used for testing:

```yaml
podmon:
  image: dellemc/podmon
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
```

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
