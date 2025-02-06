--- 
--- 

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