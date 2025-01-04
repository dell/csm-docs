--- 
--- 

{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}
CSM for Resiliency is installed as part of the Dell CSI driver installation.

{{< hide id="1" >}}For information on the PowerFlex CSI driver, see [PowerFlex CSI Driver](https://github.com/dell/csi-powerflex).{{< /hide >}} 

{{< hide id="2" >}}For information on the Unity XT CSI driver, see [Unity XT CSI Driver](https://github.com/dell/csi-unity).{{< /hide >}} 

{{< hide id="3" >}}For information on the PowerScale CSI driver, see [PowerScale CSI Driver](https://github.com/dell/csi-powerscale).{{< /hide >}}

{{< hide id="4" >}}For information on the PowerStore CSI driver, see [PowerStore CSI Driver](https://github.com/dell/csi-powerstore).{{< /hide >}} 

{{< hide id="5" >}}For information on the PowerStore CSI driver, see [PowerMax CSI Driver](https://github.com/dell/csi-powermax). {{< /hide >}}

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