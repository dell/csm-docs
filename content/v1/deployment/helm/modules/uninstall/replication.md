---
title: Replication
linktitle: Replication 
weight: 10
description: >
  Dell Container Storage Modules (CSM) for Replication Uninstallation
---

This section outlines the uninstallation steps for Container Storage Modules (CSM) for Replication. 

## Uninstalling replication controller

To uninstall the replication controller, you can use the script `uninstall.sh` located in the `scripts` folder:
```shell
./uninstall.sh 
```

This script will automatically detect how the current version was installed (repctl or Helm) and use the correct method to delete it. 

You can also manually uninstall the replication controller using a method that depends on how you installed it.

If replication controller was installed using `helm`, use this command:

```shell
helm delete -n dell-replication-controller replication
```

If you used `controller.yaml` manifest with either `kubectl` or `repctl`, use this:

```shell
kubectl delete -f deploy/controller.yaml
```

To delete the replication group CRD, you can run the command:

```shell
kubectl delete crd dellcsireplicationgroups.replication.storage.dell.com
```

All replication groups should be deleted before deleting the replication group CRD.

> _**NOTE**_: Be sure to run the chosen command on all clusters where you want to uninstall the replication controller/CRD.

## Uninstalling the replication sidecar

To uninstall the replication sidecar, you need to uninstall the CSI Driver. Please view the [uninstall](../../../drivers/uninstall) page for the driver itself.
