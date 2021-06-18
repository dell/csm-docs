---
title: PowerMax
linktitle: PowerMax
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerMax CSI driver
---

You can upgrade the CSI Driver for Dell EMC PowerMax using Helm or Dell CSI Operator.

## Update Driver from v1.6 to v1.7 using Helm

**Steps**
1. Run `git clone https://github.com/dell/csi-powermax.git` to clone the git repository and get the v1.7 driver.
2. Update values file as needed.
2. Run the `csi-install` script with the option _\-\-upgrade_ by running: `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace powermax --values ./my-powermax-settings.yaml --upgrade`.

*NOTE:*
- If you are upgrading from a driver version that was installed using Helm v2, ensure that you install Helm3 before installing the driver.
- To update any installation parameter after the driver has been installed, change the `my-powermax-settings.yaml` file and run the install script with the option _\-\-upgrade_, for example: `./csi-install.sh --namespace powermax --values ./my-powermax-settings.yaml –upgrade`.

## Upgrade using Dell CSI Operator:

1. Clone the [Dell CSI Operator repository](https://github.com/dell/dell-csi-operator).

2. Execute `bash scripts/install.sh --upgrade`
This command will install the latest version of the operator.
>Note: Starting with Dell CSI Operator v1.4.0 and higher, the operator would install to the 'dell-csi-operator' namespace by default.

3. To upgrade the driver, refer [here](./../../../installation/operator/#update-csi-drivers).
