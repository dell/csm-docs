---
title: Authorization
linktitle: Authorization 
weight: 2
description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization Uninstallation
---

{{% pageinfo color="primary" %}}
{{< message text="5" >}}
{{% /pageinfo %}}

This section outlines the uninstallation steps for Container Storage Modules (CSM) for Authorization. 

## Uninstalling the RPM

To uninstall the rpm package on the system, you must first uninstall the K3s SELinux package if SELinux is enabled. To uninstall the K3s SELinux package, run: 

```bash
rpm -e k3s-selinux
```

To uninstall the CSM Authorization rpm package on the system, run:

```bash
rpm -e <rpm_file_name>
```

## Uninstalling the sidecar-proxy in the CSI Driver

To uninstall the sidecar-proxy in the CSI Driver, [uninstall](../../../../helm/drivers/uninstall) the driver and [reinstall](../../../../helm/drivers/installation) the driver using the original configuration secret.
