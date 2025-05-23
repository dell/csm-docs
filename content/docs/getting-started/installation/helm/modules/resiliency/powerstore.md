--- 
--- 

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