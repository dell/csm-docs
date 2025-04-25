--- 
--- 

This section outlines the uninstallation steps for Container Storage Modules (CSM) for Authorization.

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

To uninstall the sidecar-proxy in the CSI Driver, [uninstall](../../../helm/#uninstall-a-csi-driver-installed-via-helm) the driver and [reinstall](../../../../../../installation/kubernetes/{{Var}}/helm/#install-driver) the driver using the original configuration secret.
