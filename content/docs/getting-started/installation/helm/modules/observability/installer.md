---
title: Installer
linktitle: Installer
weight: 3
description: >
  Container Storage Modules (CSM) for Observability Installer
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}
<!--
Copyright (c) 2020-2024 Dell Inc., or its subsidiaries. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
-->

The Container Storage Modules (CSM) for Observability installer bootstraps Helm to create a more simplified and robust deployment option that does the following:
- Checking if Container Storage Modules for Observability is installed
- Verifying Kubernetes/OpenShift and Helm versions
- Adding and refreshing the Dell Helm chart repository
- Creating the CSM namespace and copying secrets
- Installing CertManager CRDs and the Container Storage Modules Helm chart
- Waiting for CSM pods to be ready

If the Authorization module is enabled for the CSI drivers installed in the same Kubernetes cluster, the installer will perform the current steps to enable Container Storage Modules Observability to use the same Authorization instance:
- Verifies the `karavictl` binary is available.
- Verifies the appropriate Secrets and ConfigMap exist in the CSI driver namespace.
- Updates the Container Storage Modules Observability deployment to use the existing Authorization instance if not already enabled during the initial installation of Container Storage Modules Observability.

## Prerequisites

- Helm 3.x
- The deployment of one or more supported Dell CSI drivers

## Online Installer

Follow the instructions below to install Container Storage Module Observability in an environment that has an Internet connection and is capable of downloading the required Helm chart and Docker images.
The installer expects CSI drivers are using the default secret and configmap names.

### Dependencies

A Linux-based system, with Internet access, will be used to execute the script to install Container Storage Modules Observability into a Kubernetes/Openshift environment that also has Internet access.

| Dependency            | Usage |
| --------------------- | ----- |
| `kubectl`   | `kubectl` will be used to verify the Kubernetes/OpenShift environment|
| `helm`   | `helm` will be used to install the Container Storage Module Observability helm chart|
| `jq`     | `jq` will be used to parse the CContainer Storage Module Authorization configuration file during installation|


### Installer Usage
```bash
./karavi-observability-install.sh --help
```
```
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

__Note:__ Container Storage Module for Authorization currently does not support the Observability module for PowerStore. Therefore setting `enable-authorization` is not supported in this case.

### Executing the Installer

To perform an online installation of Container Storage Module Observability, the following steps should be performed:

1. Clone the GitHub repository:
    ```bash
    git clone https://github.com/dell/karavi-observability.git
    ```

2. Change to the installer directory:
    ```bash
    cd karavi-observability/installer
    ```

3. Execute the installation script.
    The following example will install Container Storage Module Observability into the CSM namespace.

    A sample values.yaml file is located [here](https://github.com/dell/helm-charts/blob/main/charts/karavi-observability/values.yaml). This can be copied into a file named `myvalues.yaml` and modified accordingly for the installer command below. Configuration options are outlined in the [Helm chart deployment section](../observability#configuration).

    __Note:__
 - The default `values.yaml` deploys the CSM for Observability Topology service.
 - For CSI PowerFlex with Authorization, configure `karaviMetricsPowerflex.authorization` in `myvalues.yaml`.
 - For CSI PowerScale with Authorization, configure `karaviMetricsPowerscale.authorization` in `myvalues.yaml`.
 - For CSI PowerMax with Authorization, configure `karaviMetricsPowerMax.authorization` in `myvalues.yaml`

    ```bash

    ./karavi-observability-install.sh install --namespace [CSM_NAMESPACE] --values myvalues.yaml
    ```
    ```
    ---------------------------------------------------------------------------------
    > Installing Karavi Observability in namespace karavi on 1.27
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