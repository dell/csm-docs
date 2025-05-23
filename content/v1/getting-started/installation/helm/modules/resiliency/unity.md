--- 
--- 
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