---
title: Resiliency
linkTitle: "Resiliency"
description: >
  Installing Resiliency via Container Storage Module  Operator
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

The Container Storage Module Operator installs the Resiliency module for supported Dell CSI Drivers, deploying the Resiliency sidecar.

## Prerequisite

When using the Container Storage Module for Resiliency module, it only acts on pods with a specific label matching the configuration. At startup, it logs the label key and value. Apply this label to the StatefulSet you want monitored

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
```
 ```bash
 podmon.dellemc.com/driver:csi-unity
```
 ```bash
  podmon.dellemc.com/driver:csi-powerstore
```
 ```bash
 podmon.dellemc.com/driver:csi-powermax
```

 User must follow all the prerequisites of the respective drivers before enabling this module.

### Storage Array Upgrades

To avoid application pods getting stuck in a Pending state, Container Storage Module for Resiliency should be disabled for storage array upgrades; even if the storage array upgrade is advertised as non-distruptive. If the container orchestrator platform nodes lose connectivity with the array, which is more likely during an upgrade, then Resiliency will delete the application pods on the affected nodes and attempt to move them to a healthy node. If all of the nodes are affected, then the application pods will be stuck in a Pending state.

## How to enable this module

<!--To enable this module, user should choose the sample file for the respective driver for specific version. By default, the module is disabled but this can be enabled by setting the enabled flag to `true` in the sample file.
--> 
Resiliency can be enabled by following sample file 

a. **Minimal Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/minimal-samples/{{Var}}_v2130.yam) for default settings.

```yaml
  - name: resiliency
      enabled: false
```

[OR]

b. **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_{{Var}}_v2130.yaml) for detailed settings.
