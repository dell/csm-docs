---
title: Uninstall
linktitle: Uninstall 
weight: 10
description: >
  Dell Container Storage Modules (CSM) for Replication Uninstallation
---

This section outlines the uninstallation steps for Container Storage Modules (CSM) for Replication. 


## Uninstalling common replication controller

To uninstall the common replication controller you can use script `uninstall.sh` located in `scripts` folder:
```shell
./uninstall.sh 
```

This script will automatically detect how current version is installed (with repctl or with helm) and use the correct method to delete it. 

You can also manually uninstall replication controller using method that depends on how you installed replication controller.

If replication controller was installed using `helm` use this command:
```shell
helm delete -n dell-replication-controller replication
```

If you used `controller.yaml` manifest with either `kubectl` or `repctl` use this:
```shell
kubectl delete -f deploy/controller.yaml
```

> NOTE: Be sure to run chosen command on all clusters where you want to uninstall replication controller.

## Uninstalling the replication sidecar


To uninstall the replication sidecar you need to uninstall the CSI Driver, please view the [uninstall](../../csidriver/uninstall) page of the driver.
