---
title: Uninstallation
linktitle: Uninstallation 
weight: 2
description: >
  Dell Container Storage Modules (CSM) for Resiliency Uninstallation
---

This section outlines the uninstallation steps for Container Storage Modules (CSM) for Resiliency. 

## Uninstalling the sidecar in the CSI Driver

To uninstall the sidecar in the CSI Driver, the following steps are required.

**Steps**
1. Uninstall the driver
    - [Helm](../../deployment/helm/drivers/uninstall/#uninstall-a-csi-driver-installed-via-helm)
    - [Operator](../../deployment/csmoperator/drivers/#uninstall-csi-driver)
2. [Reinstall](../../deployment) the driver with the `podmon` feature disabled.