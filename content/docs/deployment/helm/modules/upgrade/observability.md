---
title: Observability
linktitle: Observability
weight: 3
description: >
  Dell Container Storage Modules (CSM) for Observability Upgrade
---

This section outlines the upgrade steps for Container Storage Modules (CSM) for Observability. CSM for Observability upgrade can be achieved in one of two ways:

- Helm Chart Upgrade
- Online Installer Upgrade

## Helm Chart Upgrade

CSM for Observability Helm upgrade supports [Helm](../../installation/observability/deployment), [Online Installer](../../installation/observability/installer/), and [Offline Installer](../../../../offline/modules) deployments.

To upgrade an existing Helm installation of CSM for Observability to the latest release, download the latest Helm charts.

```bash
helm repo update
```

Check if the latest Helm chart version is available:

```bash
helm search repo dell
```
```
NAME                            CHART VERSION   APP VERSION     DESCRIPTION
dell/karavi-observability       1.8.0           1.8.0           CSM for Observability is part of the [Container...
```

>Note: If using cert-manager CustomResourceDefinitions older than v1.5.3, delete the old CRDs and install v1.5.3 of the CRDs prior to upgrade. See [Prerequisites](../../installation/observability/deployment#prerequisites) for location of CRDs.

Upgrade to the latest CSM for Observability release:


Upgrade Helm and Online Installer deployments:
```bash

helm upgrade --version $latest_chart_version --values values.yaml karavi-observability dell/karavi-observability -n $namespace
```
Upgrade Offline Installer deployment:
```bash

helm upgrade --version $latest_chart_version karavi-observability dell/karavi-observability -n $namespace
```

The [configuration](../../installation/observability/deployment#configuration) section lists all the parameters that can be configured using the `values.yaml` file.

## Online Installer Upgrade

CSM for Observability online installer upgrade can be used if the initial deployment was performed using the [Online Installer](../../installation/observability/installer) or [Helm](../../installation/observability/deployment).

1. Change to the installer directory:
    ```bash
    cd karavi-observability/installer
    ```
2. Update `values.yaml` file as needed. Configuration options are outlined in the [Helm chart deployment section](../../installation/observability/deployment#configuration).

3. Execute the `./karavi-observability-install.sh` script:
    ```bash

    ./karavi-observability-install.sh upgrade --namespace $namespace --values myvalues.yaml --version $latest_chart_version
    ```
    ```
    ---------------------------------------------------------------------------------
    >  Upgrading Karavi Observability in namespace karavi on 1.27
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

## Offline Installer Upgrade

Assuming that you have already installed the Karavi Observability Helm Chart by offline installer and meet its installation requirement.
These instructions can be followed when a Helm chart was installed and will be upgraded in an environment that does not have an Internet connection and will be unable to download the Helm chart and related Docker images.

1. Build the Offline Bundle
    Follow [Offline Karavi Observability Helm Chart Installer](../../../../offline/modules) to build the latest bundle.

2. Unpack the Offline Bundle
   Follow [Offline Karavi Observability Helm Chart Installer](../../../../offline/modules), copy and unpack the Offline Bundle to another Linux system, and push Docker images to the internal Docker registry.

3. Perform Helm upgrade
   1. Change directory to `helm` which contains the updated Helm chart directory:
      ```bash
      cd helm
      ```
   2. Install necessary cert-manager CustomResourceDefinitions provided.
      ```bash

      kubectl apply --validate=false -f cert-manager.crds.yaml
      ```
   3. (Optional) Enable Karavi Observability for PowerFlex/PowerScale to use an existing instance of Karavi Authorization for accessing the REST API for the given storage systems.
      **Note**: Assuming that if the Karavi Observability's Authorization has been enabled in the phase of [Offline Karavi Observability Helm Chart Installer](../../../../offline/modules), the Authorization Secrets/Configmap have been copied to the Karavi Observability namespace.
      A sample configuration values.yaml file is located [here](https://github.com/dell/helm-charts/blob/main/charts/karavi-observability/values.yaml).
      In your own configuration values.yaml, you need to enable PowerFlex/PowerScale Authorization, and provide the location of the sidecar-proxy Docker image and URL of the Karavi Authorization proxyHost address.

   4. After the images have been made available and the Helm chart configuration is updated, follow the instructions within the Helm chart's repository to complete the installation.
      **Note**: Assuming that Your Secrets from CSI Drivers have been copied to the Karavi Observability namespace during the steps of [Offline Karavi Observability Helm Chart Installer](../../../../offline/modules)
      Optionally, you could provide your own [configurations](../../installation/observability/#configuration). A sample values.yaml file is located [here](https://github.com/dell/helm-charts/blob/main/charts/karavi-observability/values.yaml).
      ```bash

        helm upgrade -n install-namespace app-name karavi-observability
      ```
      ```
        NAME: app-name
        LAST DEPLOYED: Wed Aug 17 14:44:04 2022
        NAMESPACE: install-namespace
        STATUS: deployed
        REVISION: 1
        TEST SUITE: None
      ```
