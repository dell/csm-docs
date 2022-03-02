---
title: Uninstallation
linktitle: Uninstallation 
weight: 2
description: >
  Dell Container Storage Modules (CSM) for Authorization Uninstallation
---

This section outlines the uninstallation steps for Container Storage Modules (CSM) for Authorization. 

## Uninstalling the RPM

To uninstall the rpm package on the system, run the below command:

```
rpm -e <rpm_file_name>
```

## Uninstalling the sidecar-proxy in the CSI Driver

To uninstall the sidecar-proxy in the CSI Driver, [uninstall](../../csidriver/uninstall) the driver and [reinstall](../../deployment) the driver using the original configuration secret.