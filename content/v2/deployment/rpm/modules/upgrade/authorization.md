---
title: Authorization
linktitle: Authorization
weight: 3
description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization Upgrade
---

{{% pageinfo color="primary" %}}
1. <span></span>{{< message text="4" >}}

2. <span></span>{{< message text="5" >}}
{{% /pageinfo %}}

This section outlines the upgrade steps for Container Storage Modules (CSM) for Authorization.  The upgrade of CSM for Authorization RPM is handled in 2 parts:
- Upgrading the CSM for Authorization proxy server
- Upgrading the Dell CSI drivers with CSM for Authorization enabled

## Upgrading CSM for Authorization proxy server

Obtain the latest single binary installer RPM by following one of our two options [here](../../installation/authorization-v1.x/authorizationv1-x#shell-script-installer).

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

## Upgrading Dell CSI Driver(s) with CSM for Authorization enabled

Given a setup where the CSM for Authorization proxy server is already upgraded to the latest version, follow the upgrade instructions for the applicable CSI Driver(s) to upgrade the driver and the CSM for Authorization sidecar

- [Upgrade PowerFlex CSI driver](../../../../helm/drivers/upgrade/powerflex/)
- [Upgrade PowerMax CSI driver](../../../../helm/drivers/upgrade/powermax/)
- [Upgrade PowerScale CSI driver](../../../../helm/drivers/upgrade/isilon/)

## Rollback

This section outlines the rollback steps for Container Storage Modules (CSM) for Authorization.
### Rollback CSM for Authorization proxy server

To rollback the rpm package on the system, run the below command:

```bash

rpm -Uvh --oldpackage karavi-authorization-<old_version>.x86_64.rpm --nopreun --nopostun
```
