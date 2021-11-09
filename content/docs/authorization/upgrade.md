---
title: Upgrade
linktitle: Upgrade 
weight: 3
description: >
  Upgrade Dell EMC Container Storage Modules (CSM) for Authorization
---

This section outlines the upgrade steps for Container Storage Modules (CSM) for Authorization.  The upgrade of CSM for Authorization is handled in 2 parts:
- Upgrading the CSM for Authorization proxy server
- Upgrading the Dell EMC CSI drivers with CSM for Authorization enabled

### Upgrading CSM for Authorization proxy server

### Upgrading Dell EMC CSI Driver(s) with CSM for Authorization enabled

Given a setup where the CSM for Authorization proxy server is already upgraded to the latest version, follow the upgrade instructions for the applicable CSI Driver(s) to upgrade the driver and the CSM for Authorization sidecar

- [Upgrade PowerFlex CSI driver](../../csidriver/upgradation/drivers/powerflex/)
- [Upgrade PowerMax CSI driver](../../csidriver/upgradation/drivers/powermax/)
- [Upgrade PowerScale CSI driver](../../csidriver/upgradation/drivers/isilon/)