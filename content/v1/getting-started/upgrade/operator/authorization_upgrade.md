---
title: Authorization v1.x
linkTitle: "Authorization v1.x"
description: >
toc_hide: true   
---

## Upgrade CSM Authorization

This section outlines the upgrade steps for Container Storage Modules (CSM) for Authorization. The upgrade of CSM for Authorization is handled in 2 parts:
1) Upgrading the Authorization proxy server
2) Upgrading CSI Driver, Authorization sidecar with Authorization module enabled


### Upgrading the Authorization Proxy Server

  1.  Modifying the existing Authorization Proxy Server installation directly via `kubectl edit`

      ```bash
      kubectl get csm -n <module-namespace>
      ```

      For example - If the Authorization Proxy Server is installed in authorization namespace then run this command to get the object name

      ```bash
      kubectl get csm -n authorization
      ```

      use the object name in `kubectl edit` command.

      ```bash
      kubectl edit csm <object-name> -n <module-namespace>
      ```

      For example - If the object name is authorization then use the name as authorization and if the namespace is authorization, then run this command to edit the object

      ```bash
      kubectl edit csm authorization -n authorization
      ```

  2.  Modify the installation

      - Update the CSM Authorization Proxy Server configVersion
      - Update the images for proxyService, tenantService, roleService and storageService


### Upgrading CSI Driver, Authorization sidecar with Authorization module enabled

  1.  Modifying the existing driver and module installation directly via `kubectl edit`

      ```bash
      kubectl get csm -n <driver-namespace>
      ```

      For example - If the CSI PowerFlex driver is installed in vxflexos namespace then run this command to get the object name

      ```bash
      kubectl get csm -n vxflexos
      ```
      use the object name in `kubectl edit` command.

      ```bash
      kubectl edit csm <object-name> -n <driver-namespace>
      ```
      For example - If the object name is vxflexos then use the name as vxflexos and if the driver is installed in vxflexos namespace, then run this command to edit the object

      ```bash
      kubectl edit csm vxflexos -n vxflexos
      ```

  2.  Modify the installation

      - Update the driver config version and image tag
      - Update the Authorization config version and karavi-authorization-proxy image.

>__Note__:
> - In Authorization module upgrade, only `n-1` to `n` upgrade is supported, e.g. if the current authorization version is `v1.8.x`, it can be upgraded to `1.9.x`.
