---
title: Upgrade
linktitle: Upgrade 
weight: 3
description: >
  Dell Container Storage Modules (CSM) for Observability Upgrade
---

This section outlines the upgrade steps for Container Storage Modules (CSM) for Observability. CSM for Observability upgrade can be achieved in one of two ways:

- Helm Chart Upgrade
- Online Installer Upgrade

## Helm Chart Upgrade

CSM for Observability Helm upgrade supports [Helm](../deployment/helm), [Online Installer](../deployment/online), and [Offline Installer](../deployment/offline) deployments. 

To upgrade an existing Helm installation of CSM for Observability to the latest release, download the latest Helm charts.

```
helm repo update
```

Check if the latest Helm chart version is available:

```
helm search repo dell
NAME                            CHART VERSION   APP VERSION     DESCRIPTION
dell/karavi-observability       1.0.1           1.0.0           CSM for Observability is part of the [Container...
```

>Note: If using cert-manager CustomResourceDefinitions older than v1.5.3, delete the old CRDs and install v1.5.3 of the CRDs prior to upgrade. See [Prerequisites](../deployment/helm#prerequisites) for location of CRDs.

Upgrade to the latest CSM for Observability release:

```
Upgrade Helm and Online Installer deployments:

  $ helm upgrade --version $latest_chart_version --values values.yaml karavi-observability dell/karavi-observability -n $namespace

Upgrade Offline Installer deployment:

  $ helm upgrade --version $latest_chart_version karavi-observability dell/karavi-observability -n $namespace
```

The [configuration](../deployment/helm#configuration) section lists all the parameters that can be configured using the `values.yaml` file.

## Online Installer Upgrade

CSM for Observability online installer upgrade can be used if the initial deployment was performed using the [Online Installer](../deployment/online) or [Helm](../deployment/helm).

1. Change to the installer directory:
    ```
    [user@system /home/user]# cd karavi-observability/installer
    ```
2. Update `values.yaml` file as needed. Configuration options are outlined in the [Helm chart deployment section](../deployment/helm#configuration).

2. Execute the `./karavi-observability-install.sh` script:
    ```
    [user@system /home/user/karavi-observability/installer]# ./karavi-observability-install.sh upgrade --namespace $namespace --values myvalues.yaml --version $latest_chart_version
    ---------------------------------------------------------------------------------
    >  Upgrading Karavi Observability in namespace karavi on 1.21
    ---------------------------------------------------------------------------------
    |
    |- Karavi Observability is installed. Upgrade can continue          Success
    |
    |- Verifying Kubernetes versions
      |
      |--> Verifying minimum Kubernetes version                         Success
      |
      |--> Verifying maximum Kubernetes version                         Success
    |
    |- Verifying helm version                                           Success
    |
    |- Upgrading CertManager CRDs                                       Success
    |
    |- Updating helm repositories                                       Success
    |
    |- Upgrading Karavi Observability helm chart                        Success
    |
    |- Waiting for pods in namespace karavi to be ready                 Success
    ``` 
