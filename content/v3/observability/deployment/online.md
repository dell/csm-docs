---
title: Installer
linktitle: Installer
weight: 3
description: >
  Dell EMC Container Storage Modules (CSM) for Observability Installer
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
- Verifies the appropriate Secret exists in the CSI driver namespace.
- Queries the CSI driver environment to get references to the Authorization module sidecar-proxy Docker image and URL of the proxy server.
- Updates the CSM for Observability deployment to use the existing Authorization instance.

## Online Installer

The following instructions can be followed to install CSM for Observability in an environment that has an internet connection and is capable of downloading the required Helm chart and Docker images.

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
Options:
  Required
  --namespace[=]<namespace>                                   Namespace where Karavi Observability will be installed
  Optional
  --auth-image-addr                                           Docker registry location of the Karavi Authorization sidecar proxy image
  --auth-proxy-host                                           Host address of the Karavi Authorization proxy server
  --csi-powerflex-namespace[=]<csi powerflex namespace>       Namespace where CSI PowerFlex is installed, default is 'vxflexos'
  --set-file                                                  Set values from files used during helm installation (can be specified multiple times)
  --skip-verify                                               Skip verification of the environment
  --values[=]<values.yaml>                                    Values file, which defines configuration values
  --verbose                                                   Display verbose logging
  --version[=]<helm chart version>                            Helm chart version to install, default value will be latest
  --help                                                      Help
```

__Note:__ CSM for Authorization currently does not support the Observability module for PowerStore.  Therefore setting `enable-authorization` is not supported in this case.

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
    ```
    [user@system /home/user/karavi-observability/installer]# ./karavi-observability-install.sh install --namespace [CSM_NAMESPACE] --values myvalues.yaml
    ---------------------------------------------------------------------------------
    > Installing Karavi Observability in namespace karavi on 1.19
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
    |- Copying Secret from vxflexos to karavi                           Success
    |
    |- Installing CertManager CRDs                                      Success
    |
    |- Installing Karavi Observability helm chart                       Success
    |
    |- Waiting for pods in namespace karavi to be ready                 Success
    |
    |- Copying Secret from vxflexos to karavi                           Success
    |
    |- Enabling Karavi Authorization for Karavi Observability           Success
    |
    |- Waiting for pods in namespace karavi to be ready                 Success
    ```
