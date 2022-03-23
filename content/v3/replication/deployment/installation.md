---
title: Installation
linktitle: Installation
weight: 2
description: >
  Installation of CSM for Replication
---

The installation process consists of three steps:

1. Install repctl
2. Install Container Storage Modules (CSM) for Replication Controller
3. Install CSI driver after enabling replication

### Before you begin
Please read this [document](../configmap-secrets) before proceeding with the installation. It provides detailed steps on how to set up communication between multiple
clusters which will be required during or after the installation.

### Install repctl
You can download pre-built repctl binary from our [Releases](https://github.com/dell/csm-replication/releases) page.
Alternately, if you want to build the binary yourself, you can follow these steps:
```shell
git clone github.com/dell/csm-replication
cd csm-replication/repctl
make build
```

### Installing CSM Replication Controller
You can use one of the following methods to install CSM Replication Controller
* Using repctl
* Installation script

We recommend using repctl for the installation as it simplifies the installation workflow. This process also helps configure `repctl`
for future use during management operations.

#### Using repctl
Please follow the steps [here](../install-repctl) to install & configure Dell Replication Controller

#### Using the installation script
Repeat the following steps on all clusters where you want to configure replication

```shell
git clone github.com/dell/csm-replication
cd csm-replication
# Modify deploy/config.yaml as per your cluster configuration (optional)
bash scripts/install.sh
```

This script will do the following:
1. Install `DellCSIReplicationGroup` CRD in your cluster
2. Create a namespace `dell-replication-controller`
3. Install `dell-replication-controller`

During the installation process, you will be prompted to create secrets to connect to
other clusters. You can choose to create secrets at this time or even postpone this activity for later.

If you choose to update the configuration post installation, then do the following:
* Update the configuration in `deploy/config.yaml` after going through the guide [here](../configmap-secrets)
* Run the following commands to update and complete the installation
```shell
    cd csm-replication
    kubectl create configmap dell-replication-controller-config --namespace dell-replication-controller --from-file deploy/config.yaml -o yaml --dry-run | kubectl apply -f -
```

### Install CSI driver
The following CSI drivers support replication:
1. CSI driver for PowerMax
2. CSI driver for PowerStore

Please follow the steps outlined [here](../powermax) for enabling replication for PowerMax & [here](../powerstore) for PowerStore during
the driver installation.

>Note: Please ensure that replication CRDs are installed in the clusters where you are installing the CSI drivers. These CRDs are generally installed as part of the CSM Replication controller installation process.

### Dynamic Log Level Change
CSM Replication Controller can dynamically change its logs' verbosity level.
To set log level in runtime you need to edit the controllers ConfigMap:
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