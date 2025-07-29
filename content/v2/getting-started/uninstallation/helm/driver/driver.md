--- 
--- 
## Uninstall a CSI driver installed via Helm

To uninstall a driver, the `csi-uninstall.sh` script provides a handy wrapper around the `helm` utility. The only required argument for uninstallation is the namespace name. For example, to uninstall the driver:

```bash
./csi-uninstall.sh --namespace <driver-namespace>
```

For usage information:
```bash
./csi-uninstall.sh -h
```
```
Help for ./csi-uninstall.sh

Usage: ./csi-uninstall.sh options...
Options:
  Required
  --namespace[=]<namespace>  Kubernetes namespace to uninstall the CSI driver from
  Optional
  --release[=]<helm release> Name to register with helm, default value will match the driver name
  -h                         Help
```
