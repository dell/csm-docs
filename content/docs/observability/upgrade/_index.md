---
title: Upgrade
linktitle: Upgrade 
weight: 3
description: >
  Dell EMC Container Storage Modules (CSM) for Observability Upgrade
---

CSM for Observability can only be upgraded via the Helm chart following the instructions below.

CSM for Observability Helm upgrade can be used if the initial deployment was performed using the [Helm chart](../deployment/helm) or [Online Installer](../deployment/online).

>Note: The [Offline Installer](../deployment/offline) does not support upgrade.


## Helm Chart Upgrade

To upgrade an existing Helm installation of CSM for Observability to the latest release, download the latest Helm charts.

```console
helm repo update
```

Check if the latest Helm chart version is available:

```console
helm search repo dell
NAME                            CHART VERSION   APP VERSION     DESCRIPTION
dell/karavi-observability       1.0.1           1.0.0           CSM for Observability is part of the [Container...
```

>Note: If using cert-manager CustomResourceDefinitions older than v1.5.3, delete the old CRDs and install v1.5.3 of the CRDs prior to upgrade. See [Prerequisites](#prerequisites) for location of CRDs.

Upgrade to the latest CSM for Observability release:

```console
$ helm upgrade --version $latest_chart_version --values values.yaml karavi-observability dell/karavi-observability -n $namespace
```

The [configuration](#configuration) section above lists all the parameters that can be configured using the values.yaml file.