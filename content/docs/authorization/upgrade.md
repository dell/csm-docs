---
title: Upgrade
linktitle: Upgrade 
weight: 3
description: >
  Upgrade Dell EMC Container Storage Modules (CSM) for Authorization
---

This section outlines the upgrade steps for Container Storage Modules (CSM) for Authorization.  The upgrade of CSM for Authorization is handled in 2 parts:
- Upgrading the CSM for Authorization proxy host
- Upgrading the Dell EMC CSI drivers with CSM for Authorization enabled

### Upgrading Dell EMC CSI Driver(s) with CSM for Authorization enabled

Given a setup where the CSM for Authorization proxy host is already upgraded to the latest version, follow the [upgrade instructions](../../csidriver/upgradation/) for the applicable CSI Driver(s) to upgrade the driver and the CSM for Authorization sidecar