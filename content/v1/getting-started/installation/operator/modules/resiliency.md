---
title: Resiliency
linkTitle: "Resiliency"
description: >
  Installing Resiliency via Container Storage Modules  Operator
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

The Container Storage Modules Operator installs the Resiliency module for supported Dell CSI Drivers, deploying the Resiliency sidecar.

## Prerequisite

The Resiliency module only acts on pods with a specific label. At startup, it logs the label key and value. Apply this label to the StatefulSet you want monitored

 ```yaml
 labelSelector: {map[podmon.dellemc.com/driver:csi-{{labels}}]}
 ```

 The above message indicates the key is: `podmon.dellemc.com/driver` and the label value is `{{labels}}`. To search for the pods that would be monitored, try this:

 ```bash
 kubectl get pods -A -l podmon.dellemc.com/driver=csi-{{labels}}
 ```

 User must follow all the prerequisites of the respective drivers before enabling this module.

## How to enable this module

<!--To enable this module, user should choose the sample file for the respective driver for specific version. By default, the module is disabled but this can be enabled by setting the enabled flag to `true` in the sample file.
--> 
Resiliency can be enabled by following sample file 
```yaml
  - name: resiliency
      enabled: true
```

**Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_{{Var}}_{{< version-v1 key="sample_sc_pmax" >}}.yaml) for detailed settings.

### Storage Array Upgrades

- Disable the Resiliency module during storage array upgrades, even if advertised as non-disruptive.
- This prevents application pods from getting stuck in a Pending state.
- If nodes lose connectivity with the array, Resiliency deletes pods on affected nodes and tries to move them to healthy nodes.
- If all nodes are affected, pods will remain in a Pending state.