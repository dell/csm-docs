--- 
--- 

## Uninstall the CSM for Observability Helm Chart

The command below removes all the Kubernetes components associated with the chart.

```console
helm delete karavi-observability --namespace [CSM_NAMESPACE]
```

You may also want to uninstall the CRDs created for cert-manager.

```console
kubectl delete -f https://github.com/jetstack/cert-manager/releases/download/v1.10.0/cert-manager.crds.yaml
```
