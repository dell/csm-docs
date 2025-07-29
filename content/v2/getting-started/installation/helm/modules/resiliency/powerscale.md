--- 
--- 

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
