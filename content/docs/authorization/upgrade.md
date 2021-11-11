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

Obtain the latest single binary installer RPM by following one of our two options [here](../deployment/#single-binary-installer). 

To update the rpm package on the system, run the below command:

```
rpm -Uvh karavi-authorization-<new_version>.x86_64.rpm --nopreun --nopostun
```

To verify that the new version of the rpm is installed and K3s has been updated, run the below commands:

```
rpm -qa | grep karavi
k3s kubectl version
``` 

>__Note__: The above steps manage install and upgrade of all dependencies that are required by the CSM for Authorization proxy server. 

### Upgrading Dell EMC CSI Driver(s) with CSM for Authorization enabled

Given a setup where the CSM for Authorization proxy server is already upgraded to the latest version, follow the upgrade instructions for the applicable CSI Driver(s) to upgrade the driver and the CSM for Authorization sidecar

- [Upgrade PowerFlex CSI driver](../../csidriver/upgradation/drivers/powerflex/)
- [Upgrade PowerMax CSI driver](../../csidriver/upgradation/drivers/powermax/)
- [Upgrade PowerScale CSI driver](../../csidriver/upgradation/drivers/isilon/)

## Rollback

This section outlines the rollback steps for Container Storage Modules (CSM) for Authorization.
### Rollback CSM for Authorization proxy server

To rollback the rpm package on the system, run the below command:

```
rpm -Uvh --oldpackage karavi-authorization-<old_version>.x86_64.rpm --nopreun --nopostun
```