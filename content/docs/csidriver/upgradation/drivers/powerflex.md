---
title: PowerFlex
linktitle: PowerFlex
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerFlex CSI driver
---

You can upgrade the CSI Driver for Dell EMC PowerFlex using Helm or Dell CSI Operator.

## Update Driver from v2.0 to v2.1 using Helm 
**Steps**
1. Run `git clone -b v2.1.0 https://github.com/dell/csi-powerflex.git` to clone the git repository and get the v2.0 driver.
2. You need to create config.yaml with the configuration of your system.
   Check this section in installation documentation:  [Install the Driver](../../../installation/helm/powerflex#install-the-driver)
   You must set the only system managed in v1.5/v2.0 driver as default in config.json in v2.1 so that the driver knows the existing volumes belong to that system.
3. Update values file as needed.
4. Run the `csi-install` script with the option _\-\-upgrade_ by running: `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace vxflexos --values ./myvalues.yaml --upgrade`.

*NOTE:*
- If you are upgrading from a driver version that was installed using Helm v2, ensure that you install Helm3 before installing the driver.
- To update any installation parameter after the driver has been installed, change the `myvalues.yaml` file and run the install script with the option _\-\-upgrade_, for example: `./csi-install.sh --namespace vxflexos --values ./myvalues.yaml --upgrade`.
- The logging configuration from v1.5 will not work in v2.1, since the log configuration parameters are now set in the values.yaml file located at helm/csi-vxflexos/values.yaml. Please set the logging configuration parameters in the values.yaml file.

## Upgrade using Dell CSI Operator:
1. Clone the [Dell CSI Operator repository](https://github.com/dell/dell-csi-operator). 

2. Execute `bash scripts/install.sh --upgrade`
This command will install the latest version of the operator.
>Note: Dell CSI Operator version 1.4.0 and higher would install to the 'dell-csi-operator' namespace by default.

3. To upgrade the driver, refer [here](./../../../installation/operator/#update-csi-drivers).
