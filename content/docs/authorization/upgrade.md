---
title: Upgrade
linktitle: Upgrade 
weight: 3
description: >
  Upgrade Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization
---

{{% pageinfo color="primary" %}}
The CSM Authorization RPM is no longer actively maintained or supported. It will be deprecated in CSM 2.0. It is highly recommended that you use CSM Authorization Helm deployment or CSM Operator going forward.
{{% /pageinfo %}}

This section outlines the upgrade steps for Container Storage Modules (CSM) for Authorization.  The upgrade of CSM for Authorization is handled in 2 parts:
- Upgrading the CSM for Authorization proxy server
- Upgrading the Dell CSI drivers with CSM for Authorization enabled

### Upgrading CSM for Authorization proxy server

Obtain the latest single binary installer RPM by following one of our two options [here](../deployment/#single-binary-installer).

To update the rpm package on the system, run the below command from within the extracted folder:

```bash
sh install_karavi_auth.sh --upgrade
```

As an option, on version 1.6.0, the Nodeports for the ingress controller can be specified:

```bash

sh install_karavi_auth.sh --upgrade  --traefik_web_port <web port number> --traefik_websecure_port <websecure port number>
```
Ex.:
```bash

sh install_karavi_auth.sh --upgrade  --traefik_web_port 30001 --traefik_websecure_port 30002
```

To verify that the new version of the rpm is installed and K3s has been updated, run the below commands:

```bash
rpm -qa | grep karavi
k3s kubectl version
``` 

>__Note__: The above steps manage install and upgrade of all dependencies that are required by the CSM for Authorization proxy server. 

### Upgrading Dell CSI Driver(s) with CSM for Authorization enabled

Given a setup where the CSM for Authorization proxy server is already upgraded to the latest version, follow the upgrade instructions for the applicable CSI Driver(s) to upgrade the driver and the CSM for Authorization sidecar

- [Upgrade PowerFlex CSI driver](../../csidriver/upgradation/drivers/powerflex/)
- [Upgrade PowerMax CSI driver](../../csidriver/upgradation/drivers/powermax/)
- [Upgrade PowerScale CSI driver](../../csidriver/upgradation/drivers/isilon/)

## Rollback

This section outlines the rollback steps for Container Storage Modules (CSM) for Authorization.
### Rollback CSM for Authorization proxy server

To rollback the rpm package on the system, run the below command:

```bash

rpm -Uvh --oldpackage karavi-authorization-<old_version>.x86_64.rpm --nopreun --nopostun
```