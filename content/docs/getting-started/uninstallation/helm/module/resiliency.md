--- 
--- 
Uninstallation through driver upgrade
1. Disable the `podmon` feature in your [values file](https://github.com/dell/helm-charts/tree/main/charts/csi-{{values}}/values.yaml)

```bash  
podmon: 
  enabled: false
```

2. Upgrade the driver 
   - [Helm](../../../../../../upgrade/kubernetes/{{Var}}/helm)

