---
title: "Uninstallation"
linkTitle: "Uninstallation"
weight: 3
description: Methods to uninstall Dell CSI driver
---

## Uninstall a Dell CSI driver installed via Helm

To uninstall a driver, the `csi-uninstall.sh` script provides a handy wrapper around the `helm` utility. The only required argument for uninstallation is the namespace name. For example, to uninstall the driver:

```
./csi-uninstall.sh --namespace <driver-namespace>
```

For usage information:
```
[dell-csi-helm-installer]# ./csi-uninstall.sh -h
Help for ./csi-uninstall.sh

Usage: ./csi-uninstall.sh options...
Options:
  Required
  --namespace[=]<namespace>  Kubernetes namespace to uninstall the CSI driver from
  Optional
  --release[=]<helm release> Name to register with helm, default value will match the driver name
  -h                         Help
```

## Uninstall a Dell CSI driver installed via Dell CSI Operator

For uninstalling any CSI drivers deployed the Dell CSI Operator, just delete the respective Custom Resources.  
This can be done using OperatorHub GUI by deleting the CR or via kubectl.
    
For example - To uninstall the driver installed via the operator, delete the Custom Resource(CR)

```
# Replace driver-name and driver-namespace with their respective values
$ kubectl delete <driver-name> -n <driver-namespace>
```
