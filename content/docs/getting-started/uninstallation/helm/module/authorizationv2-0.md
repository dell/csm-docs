--- 
--- 
This section outlines the uninstallation steps for Container Storage Modules (CSM) for Authorization v2.

## Delete all Authorization Custom Resources(CRs)

The commands below will delete a Tenant, Role, and Storage system. All CRs must be deleted before Authorization is uninstalled.

```bash
kubectl delete csmtenant [csmtenant-name] --namespace authorization
kubectl delete csmrole [csmrole-name] --namespace authorization
kubectl delete storage [storage-name] --namespace authorization
```

## Uninstall the CSM for Authorization Helm Chart

The command below removes all the Kubernetes components associated with the chart.

```bash
helm uninstall authorization --namespace authorization
```

You may also want to delete the karavi-config-secret secret.

```bash
kubectl delete secret karavi-config-secret -n authorization
```

## Uninstalling the sidecar-proxy in the CSI Driver

To uninstall the sidecar-proxy in the CSI Driver, [uninstall](../../../helm/#uninstall-a-csi-driver-installed-via-helm) the driver and [reinstall](../../../../../../installation/kubernetes/{{Var}}/helm/#install-driver)the driver using the original configuration secret.
