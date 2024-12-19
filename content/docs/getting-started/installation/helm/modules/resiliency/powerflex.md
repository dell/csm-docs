--- 
--- 

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
