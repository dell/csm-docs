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

```bash
helm repo update
```

Check if the latest Helm chart version is available:

```bash
helm search repo dell
```
```
NAME                            CHART VERSION   APP VERSION     DESCRIPTION
dell/karavi-observability       1.5.0           1.5.0           CSM for Observability is part of the [Container...
```

>Note: If using cert-manager CustomResourceDefinitions older than v1.5.3, delete the old CRDs and install v1.5.3 of the CRDs prior to upgrade. See [Prerequisites](../deployment/helm#prerequisites) for location of CRDs.

Upgrade to the latest CSM for Observability release:

```bash
Upgrade Helm and Online Installer deployments:

  $ helm upgrade --version $latest_chart_version --values values.yaml karavi-observability dell/karavi-observability -n $namespace

Upgrade Offline Installer deployment:

  $ helm upgrade --version $latest_chart_version karavi-observability dell/karavi-observability -n $namespace
```

The [configuration](../deployment/helm#configuration) section lists all the parameters that can be configured using the `values.yaml` file.

## Online Installer Upgrade

CSM for Observability online installer upgrade can be used if the initial deployment was performed using the [Online Installer](../deployment/online) or [Helm](../deployment/helm).

1. Change to the installer directory:
    ```bash
    [user@system /home/user]# cd karavi-observability/installer
    ```
2. Update `values.yaml` file as needed. Configuration options are outlined in the [Helm chart deployment section](../deployment/helm#configuration).

3. Execute the `./karavi-observability-install.sh` script:
   ```bash
   
    [user@system /home/user/karavi-observability/installer]# ./karavi-observability-install.sh upgrade --namespace $namespace --values myvalues.yaml --version $latest_chart_version
   ```
   ``` 
   ---------------------------------------------------------------------------------
    >     Upgrading Karavi Observability in namespace karavi on 1.21
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
These instructions can be followed when a Helm chart was installed and will be upgraded in an environment that does not have an internet connection and will be unable to download the Helm chart and related Docker images.

1. Build the Offline Bundle
    Follow [Offline Karavi Observability Helm Chart Installer](../deployment/offline) to build the latest bundle.

2. Unpack the Offline Bundle
   Follow [Offline Karavi Observability Helm Chart Installer](../deployment/offline), copy and unpack the Offline Bundle to another Linux system, and push Docker images to the internal Docker registry.

3. Perform Helm upgrade
   1. Change directory to `helm` which contains the updated Helm chart directory:
      ```bash
      
      [user@anothersystem /home/user/offline-karavi-observability-bundle]# cd helm
      ```
   2. Install necessary cert-manager CustomResourceDefinitions provided.
      ```bash
      
      [user@anothersystem /home/user/offline-karavi-observability-bundle/helm]# kubectl apply --validate=false -f cert-manager.crds.yaml
      ```
   3. (Optional) Enable Karavi Observability for PowerFlex/PowerScale to use an existing instance of Karavi Authorization for accessing the REST API for the given storage systems.  
      **Note**: Assuming that if the Karavi Observability's Authorization has been enabled in the phase of [Offline Karavi Observability Helm Chart Installer](../deployment/offline), the Authorization Secrets/Configmap have been copied to the Karavi Observability namespace.  
      A sample configuration values.yaml file is located [here](https://github.com/dell/helm-charts/blob/main/charts/karavi-observability/values.yaml).  
      In your own configuration values.yaml, you need to enable PowerFlex/PowerScale Authorization, and provide the location of the sidecar-proxy Docker image and URL of the Karavi Authorization proxyHost address.  
   
   4. Now that the required images have been made available and the Helm chart's configuration updated with references to the internal registry location, installation can proceed by following the instructions that are documented within the Helm chart's repository.  
      **Note**: Assuming that Your Secrets from CSI Drivers have been copied to the Karavi Observability namespace in the phase of [Offline Karavi Observability Helm Chart Installer](../deployment/offline)   
      Optionally, you could provide your own [configurations](../deployment/helm/#configuration). A sample values.yaml file is located [here](https://github.com/dell/helm-charts/blob/main/charts/karavi-observability/values.yaml).
      ```bash
      
        [user@anothersystem /home/user/offline-karavi-observability-bundle/helm]# helm upgrade -n install-namespace app-name karavi-observability
      ```
      ```  
        NAME: app-name
        LAST DEPLOYED: Wed Aug 17 14:44:04 2022
        NAMESPACE: install-namespace
        STATUS: deployed
        REVISION: 1
        TEST SUITE: None
      ``` 
        