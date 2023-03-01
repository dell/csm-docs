---
title: Installer
linktitle: Installer
weight: 3
description: >
  Dell Container Storage Modules (CSM) for Observability Installer
---

<!--
Copyright (c) 2020 Dell Inc., or its subsidiaries. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
-->

The Container Storage Modules (CSM) for Observability installer bootstraps Helm to create a more simplified and robust deployment option that does the following:
- Verifies CSM for Observability is not yet installed
- Verifies the Kubernetes/Openshift versions are supported
- Verifies the Helm version is supported
- Adds the Dell Helm chart repository
- Refreshes the Helm chart repositories to download any recent changes
- Creates the CSM namespace (if not already created)
- Copies the secrets from the CSI driver namespaces into the CSM namespace (if not already copied)
- Installs the CertManager CRDs (if not already installed)
- Installs the CSM for Observability Helm chart
- Waits for the CSM for Observability pods to become ready

If the Authorization module is enabled for the CSI drivers installed in the same Kubernetes cluster, the installer will perform the current steps to enable CSM for Observability to use the same Authorization instance:
- Verifies the `karavictl` binary is available.
- Verifies the appropriate Secrets and ConfigMap exist in the CSI driver namespace.
- Updates the CSM for Observability deployment to use the existing Authorization instance if not already enabled during the initial installation of CSM for Observability.

## Prerequisites 

- Helm 3.3
- The deployment of one or more [supported](../#supported-csi-drivers) Dell CSI drivers

## Online Installer

The following instructions can be followed to install CSM for Observability in an environment that has an internet connection and is capable of downloading the required Helm chart and Docker images.  
The installer expects CSI drivers are using the default secret and configmap names.

### Dependencies

A Linux-based system, with internet access, will be used to execute the script to install CSM for Observability into a Kubernetes/Openshift environment that also has internet access.

| Dependency            | Usage |
| --------------------- | ----- |
| `kubectl`   | `kubectl` will be used to verify the Kubernetes/OpenShift environment|
| `helm`   | `helm` will be used to install the CSM for Observability helm chart|
| `jq`     | `jq` will be used to parse the CSM for Authorization configuration file during installation|


### Installer Usage
```
[user@system /home/user/karavi-observability/installer]# ./karavi-observability-install.sh --help

Help for ./karavi-observability-install.sh

Usage: ./karavi-observability-install.sh mode options...
Mode:
  install                                                     Installs Karavi Observability and enables Karavi Authorization if already installed
  enable-authorization                                        Updates existing installation of Karavi Observability with Karavi Authorization
  upgrade                                                     Upgrades existing installation of Karavi Observability to the latest release
Options:
  Required
  --namespace[=]<namespace>                                   Namespace where Karavi Observability will be installed
  Optional
  --csi-powerflex-namespace[=]<csi powerflex namespace>       Namespace where CSI PowerFlex is installed, default is 'vxflexos'
  --csi-powerstore-namespace[=]<csi powerstore namespace>     Namespace where CSI PowerStore is installed, default is 'csi-powerstore'
  --csi-powerscale-namespace[=]<csi powerscale namespace>     Namespace where CSI PowerScale is installed, default is 'isilon'
  --csi-powermax-namespace[=]<csi powermax namespace>         Namespace where CSI PowerMax is installed, default is 'powermax'
  --set-file                                                  Set values from files used during helm installation (can be specified multiple times)
  --skip-verify                                               Skip verification of the environment
  --values[=]<values.yaml>                                    Values file, which defines configuration values
  --verbose                                                   Display verbose logging
  --version[=]<helm chart version>                            Helm chart version to install, default value will be latest
  --help                                                      Help
```

__Note:__ CSM for Authorization currently does not support the Observability module for PowerStore. Therefore setting `enable-authorization` is not supported in this case.

### Executing the Installer

To perform an online installation of CSM for Observability, the following steps should be performed:

1. Clone the GitHub repository:
    ```
    [user@system /home/user]# git clone https://github.com/dell/karavi-observability.git
    ```

2. Change to the installer directory:
    ```
    [user@system /home/user]# cd karavi-observability/installer
    ```

3. Execute the installation script.
    The following example will install CSM for Observability into the CSM namespace.

    A sample values.yaml file is located [here](https://github.com/dell/helm-charts/blob/main/charts/karavi-observability/values.yaml). This can be copied into a file named `myvalues.yaml` and modified accordingly for the installer command below. Configuration options are outlined in the [Helm chart deployment section](../helm#configuration).

    __Note:__ 
    - The default `values.yaml` is configured to deploy the CSM for Observability Topology service on install.
    - If CSM for Authorization is enabled for CSI PowerFlex, the `karaviMetricsPowerflex.authorization` parameters must be properly configured in `myvalues.yaml` for CSM Observability. 
    - If CSM for Authorization is enabled for CSI PowerScale, the `karaviMetricsPowerscale.authorization` parameters must be properly configured in `myvalues.yaml` for CSM Observability.
    - If CSM for Authorization is enabled for CSI PowerMax, the `karaviMetricsPowermax.authorization` parameters must be properly configured in `myvalues.yaml` for CSM Observability.

    ```
    [user@system /home/user/karavi-observability/installer]# ./karavi-observability-install.sh install --namespace [CSM_NAMESPACE] --values myvalues.yaml
    ---------------------------------------------------------------------------------
    > Installing Karavi Observability in namespace karavi on 1.21
    ---------------------------------------------------------------------------------
    |
    |- Karavi Observability is not installed                            Success
    |
    |- Karavi Authorization will be enabled during installation
    |
    |- Verifying Kubernetes versions
      |
      |--> Verifying minimum Kubernetes version                         Success
      |
      |--> Verifying maximum Kubernetes version                         Success
    |
    |- Verifying helm version                                           Success
    |
    |- Configure helm chart repository
      |
      |--> Adding helm repository https://dell.github.io/helm-charts    Success
      |
      |--> Updating helm repositories                                   Success
    |
    |- Creating namespace karavi                                        Success
    |
    |- CSI Driver for PowerFlex is installed                            Success
    |
    |- Copying Secret from vxflexos to karavi                           Success
    |
    |- CSI Driver for PowerStore is installed                           Success
    |
    |- Copying Secret from powerstore to karavi                         Success
    |
    |- CSI Driver for PowerScale is installed                           Success
    |
    |- Copying Secret from isilon to karavi                             Success
    |
    |- CSI Driver for PowerMax is installed                             Success
    |
    |- Copying ConfigMap from powermax to karavi                        Success
    |
    |- Copying Secret from powermax to karavi                           Success
    |
    |- Installing CertManager CRDs                                      Success
    |
    |- Enabling Karavi Authorization for Karavi Observability
      |
      |--> Copying ConfigMap from vxflexos to karavi                    Success
      |
      |--> Copying Karavi Authorization Secrets from vxflexos to karavi Success
      |
      |--> Copying ConfigMap from isilon to karavi                      Success
      |
      |--> Copying Karavi Authorization Secrets from isilon to karavi   Success
      |
      |--> Copying ConfigMap from powermax to karavi                    Success
      |
      |--> Copying Karavi Authorization Secrets from powermax to karavi Success
    |
    |- Installing Karavi Observability helm chart                       Success
    |
    |- Waiting for pods in namespace karavi to be ready                 Success
    ```
