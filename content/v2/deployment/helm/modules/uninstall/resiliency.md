---
title: Resiliency
linktitle: Resiliency 
weight: 2
description: >
  Dell Container Storage Modules (CSM) for Resiliency Uninstallation
---

This section outlines the uninstallation steps for Container Storage Modules (CSM) for Resiliency. 

## Uninstalling the sidecar in the CSI Driver

To uninstall the sidecar in the CSI Driver, the following steps are required.

**Steps**
>NOTE: If you do not wish to uninstall the driver, please follow the steps below for Resiliency uninstallation through driver upgrade.
1. Uninstall the driver
    - [Helm](../../../drivers/uninstall/#uninstall-a-csi-driver-installed-via-helm)
    - [Operator](../../../../csmoperator/drivers/#uninstall-csi-driver)
2. Reinstall the driver with the `podmon` feature disabled
    - [Helm](../../../drivers/installation/)
    - [Operator](../../../../csmoperator/drivers/#installing-csi-driver-via-operator)

### Uninstallation through driver upgrade
1. Disable the `podmon` feature in your values file
2. Upgrade the driver
    - [Helm](../../../drivers/upgrade/)
    - [Operator](../../../../csmoperator/drivers/#update-csi-drivers)