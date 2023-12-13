---
title: Installation
linktitle: Installation
weight: 2
description: >
  Installation of CSM for Replication
---

The installation process consists of two steps:

1. Install Container Storage Modules (CSM) for Replication Controller
2. Install CSI driver after enabling replication

### Before you begin
Please read this [document](../configmap-secrets) before proceeding with the installation. It provides detailed steps on how to set up communication between multiple
clusters which will be required during or after the installation.

### Install CSM Replication Controller
You can use one of the following methods to install CSM Replication Controller:
* Using repctl
* Installation script (Helm chart)

We recommend using repctl for the installation, as it simplifies the installation workflow. This process also helps configure `repctl`
for future use during management operations.

#### Using repctl
Please follow the steps [here](../install-repctl) to install & configure Dell Replication Controller using repctl.

#### Using the installation script
Please follow the steps [here](../install-script) to install & configure Dell Replication Controller using script.

### Install CSI driver
The following CSI drivers support replication:
1. CSI driver for PowerMax
2. CSI driver for PowerStore
3. CSI driver for PowerScale
4. CSI driver for PowerFlex

Please follow the steps outlined in [PowerMax](../powermax), [PowerStore](../powerstore), [PowerScale](../powerscale), or [PowerFlex](../powerflex) pages during the driver installation.


>Note: Please ensure that replication CRDs are installed in the clusters where you are installing the CSI drivers. These CRDs are generally installed as part of the CSM Replication controller installation process.

### Dynamic Log Level Change
CSM Replication Controller can dynamically change its logs' verbosity level.
To set log level in runtime, you need to edit the controllers ConfigMap:
```shell
    kubectl edit cm dell-replication-controller-config -n dell-replication-controller
```
And set the *CSI_LOG_LEVEL* field to the level of your choosing.
CSM Replication controller supports following log levels:
- "PANIC"
- "FATAL"
- "ERROR"
- "WARN"
- "INFO"
- "DEBUG"
- "TRACE"

>Note: CSI-Replicator sidecar utilizes the same log level as CSI driver. To change the sidecars log level refer to corresponding csi drivers documentation.