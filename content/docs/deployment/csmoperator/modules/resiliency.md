---
title: Resiliency
linkTitle: "Resiliency"
description: >
  Installing Resiliency via Dell CSM Operator
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

The CSM Resiliency module for supported Dell CSI Drivers can be installed via the Dell CSM Operator. Dell CSM Operator will deploy CSM Resiliency sidecar.

## Prerequisite

When utilizing CSM for Resiliency module, it is crucial to note that it will solely act upon pods that have been assigned a designated label. This label must have both a key and a value that match what has been set in the resiliency module configuration. Upon startup, CSM for Resiliency generates a log message that displays the label key and value being used to monitor pods. This label must be applied the Statefulset that you want to be monitored by CSM for Resiliency.

 ```yaml
 labelSelector: {map[podmon.dellemc.com/driver:csi-vxflexos]}
 ```

 The above message indicates the key is: podmon.dellemc.com/driver and the label value is csi-vxflexos. To search for the pods that would be monitored, try this:

 ```bash
 kubectl get pods -A -l podmon.dellemc.com/driver=csi-vxflexos
 ```

Similarly, labels for for csi-powerscale, csi-unity, csi-powerstore and csi-powermax would be as:

 ```bash
 podmon.dellemc.com/driver:csi-isilon
 podmon.dellemc.com/driver:csi-unity
 podmon.dellemc.com/driver:csi-powerstore
 podmon.dellemc.com/driver:csi-powermax
```

 User must follow all the prerequisites of the respective drivers before enabling this module.

### Storage Array Upgrades

To avoid application pods getting stuck in a Pending state, CSM for Resiliency should be disabled for storage array upgrades; even if the storage array upgrade is advertised as non-distruptive. If the container orchestrator platform nodes lose connectivity with the array, which is more likely during an upgrade, then Resiliency will delete the application pods on the affected nodes and attempt to move them to a healthy node. If all of the nodes are affected, then the application pods will be stuck in a Pending state.

## How to enable this module

To enable this module, user should choose the sample file for the respective driver for specific version. By default, the module is disabled but this can be enabled by setting the enabled flag to `true` in the sample file.

```yaml
  modules:
    - name: resiliency
      # enabled: Enable/Disable Resiliency feature
      # Allowed values:
      #   true: enable Resiliency feature(deploy podmon sidecar)
      #   false: disable Resiliency feature(do not deploy podmon sidecar)
      # Default value: false
      enabled: true
      configVersion: v1.12.0
      components:
        - name: podmon-controller
          args:
            - "--labelvalue=csi-powerstore"
            - "--arrayConnectivityPollRate=60"
            - "--skipArrayConnectionValidation=false"
            - "--driverPodLabelValue=dell-storage"
            - "--ignoreVolumelessPods=false"
            # Below 4 args should not be modified.
            - "--csisock=unix:/var/run/csi/csi.sock"
            - "--mode=controller"
            - "--driver-config-params=/powerstore-config-params/driver-config-params.yaml"
            - "--driverPath=csi-powerstore.dellemc.com"
        - name: podmon-node
          envs:
            # podmonAPIPort: Defines the port to be used within the kubernetes cluster
            # Allowed values: Any valid and free port (string)
            # Default value: 8083
            - name: "X_CSI_PODMON_API_PORT"
              value: "8083"
          args:
            - "--labelvalue=csi-powerstore"
            - "--arrayConnectivityPollRate=60"
            - "--leaderelection=false"
            - "--driverPodLabelValue=dell-storage"
            - "--ignoreVolumelessPods=false"
            # Below 4 args should not be modified.
            - "--csisock=unix:/var/lib/kubelet/plugins/csi-powerstore.dellemc.com/csi_sock"
            - "--mode=node"
            - "--driver-config-params=/powerstore-config-params/driver-config-params.yaml"
            - "--driverPath=csi-powerstore.dellemc.com"
```

## How to enable this module using minimal CR

To enable this module, user should choose the minimal sample file for the respective driver for specific version. By default, the module is disabled but this can be enabled by setting the enabled flag to `true` in the minimal sample file.
