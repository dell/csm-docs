---
title: Authorization
linktitle: Authorization 
weight: 3
description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization Upgrade
---

This section outlines the upgrade steps for Container Storage Modules (CSM) for Authorization.  The upgrade of CSM for Authorization is handled in 2 parts:
- Helm Chart Upgrade
- Upgrading the Dell CSI drivers with CSM for Authorization enabled

## Helm Chart Upgrade

1. To upgrade an existing Helm installation of CSM for Authorization to the latest release, download the latest Helm charts.
    ```bash
    helm repo update
    ```

2. Check if the latest Helm chart version is available:
    ```bash
    helm search repo dell
    ```

    ```
    NAME                            CHART VERSION   APP VERSION     DESCRIPTION
    dell/csm-authorization          1.10.0          1.10.0          CSM for Authorization is part of the [Container...
    ```

3. Upgrade to the latest CSM for Authorization release:
    ```bash
    helm upgrade --version $latest_chart_version -f myvalues.yaml authorization dell/csm-authorization -n authorization
    ```

## Upgrading Dell CSI Driver(s) with CSM for Authorization enabled

Given a setup where the CSM for Authorization proxy server is already upgraded to the latest version, follow the upgrade instructions for the applicable CSI Driver(s) to upgrade the driver and the CSM for Authorization sidecar

- [Upgrade PowerFlex CSI driver](../../../drivers/upgrade/powerflex/)
- [Upgrade PowerMax CSI driver](../../../drivers/upgrade/powermax/)
- [Upgrade PowerScale CSI driver](../../../drivers/upgrade/isilon/)
