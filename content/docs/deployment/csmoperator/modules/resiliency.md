---
title: Resiliency
linkTitle: "Resiliency"
description: >
  Pre-requisite for Installing Resiliency via Dell CSM Operator
---

The CSM Resiliency module for supported Dell CSI Drivers can be installed via the Dell CSM Operator. Dell CSM Operator will deploy CSM Resiliency sidecar.

## Prerequisite

When utilizing CSM for Resiliency module, it is crucial to note that it will solely act upon pods that have been assigned a designated label. This label must have both a key and a value that match what has been set in the resiliency module configuration. Upon startup, CSM for Resiliency generates a log message that displays the label key and value being used to monitor pods.:

 ```
 labelSelector: {map[podmon.dellemc.com/driver:csi-vxflexos]
 ```
 The above message indicates the key is: podmon.dellemc.com/driver and the label value is csi-vxflexos. To search for the pods that would be monitored, try this:
 ```
[root@lglbx209 podmontest]# kubectl get pods -A -l podmon.dellemc.com/driver=csi-vxflexos
NAMESPACE   NAME           READY   STATUS    RESTARTS   AGE
pmtu1       podmontest-0   1/1     Running   0          3m7s
pmtu2       podmontest-0   1/1     Running   0          3m8s
pmtu3       podmontest-0   1/1     Running   0          3m6s
 ```

 User must follow all the prerequisites of the respective drivers before enabling this module.

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
      configVersion: v1.6.0
      components:
      - name: podmon
        # image: Image to use for podmon. This shouldn't be changed
        # Allowed values: string
        # Default value: None
        image: dellemc/podmon:v1.6.0
        envs:
          # podmonAPIPort: Defines the port to be used within the kubernetes cluster
          # Allowed values: Any valid and free port (string)
          # Default value: 8083
          - name: "X_CSI_PODMON_API_PORT"
            value: "8083"
          # arrayConnectivityPollRate: indicates the polling frequency to check array connectivity
          # Allowed values: string
          # Default value: 60
          - name: "X_CSI_PODMON_ARRAY_CONNECTIVITY_POLL_RATE"
            value: "60"
```



