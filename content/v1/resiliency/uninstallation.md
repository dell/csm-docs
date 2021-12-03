---
title: Uninstallation
linktitle: Uninstallation 
weight: 2
description: >
  Dell EMC Container Storage Modules (CSM) for Resiliency Uninstallation
---

This section outlines the uninstallation steps for Container Storage Modules (CSM) for Resiliency. 

## Uninstalling the sidecar in the CSI Driver

To uninstall the sidecar in the CSI Driver, [uninstall](../../csidriver/uninstall) the driver and [reinstall](../../deployment) the driver with the `podmon` feature disabled.