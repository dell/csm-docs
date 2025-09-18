--- 
--- 
### Uninstall CSI Driver and CSM Modules

The CSI Drivers and CSM Modules can be uninstalled by deleting the Custom Resource.

For e.g.

```bash
kubectl delete csm/<csm-object> -n <driver-namespace>
```

By default, the `forceRemoveDriver` option is set to `true` which will uninstall the CSI Driver and CSM Modules when the Custom Resource is deleted. Setting this option to `false` is not recommended.