---
title: PowerFlex
linktitle: PowerFlex
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerFlex CSI driver
---

You can upgrade the CSI Driver for Dell PowerFlex using Helm or Dell CSM Operator.

## Update Driver from v2.9.2 to v2.10.0 using Helm
**Steps**
1. Run `git clone -b v2.10.0 https://github.com/dell/csi-powerflex.git` to clone the git repository and get the v2.10.0 driver.
2. You need to create secret.yaml with the configuration of your system.
3. Update myvalues file as needed.
4. Run the `csi-install` script with the option _\-\-upgrade_ by running: 
   ```bash
  
   cd ../dell-csi-helm-installer && ./csi-install.sh --namespace vxflexos --values ./myvalues.yaml --helm-charts-version csi-vxflexos-2.10.1 --upgrade
   ```

*NOTE:*
- If you do not specify the `--helm-charts-version` argument, by default the `csi-install.sh` script will clone the version of the helm chart that is specified in the driver's [csi-install.sh](https://github.com/dell/csi-powerflex/blob/main/dell-csi-helm-installer/csi-install.sh#L24) file. If you wish to upgrade the driver using a different version of the helm chart, you need to include this argument. Also, remember to delete the `helm-charts` repository present in the `csi-powerflex` directory if it was cloned before.
- If you are upgrading from a driver version that was installed using Helm v2, ensure that you install Helm3 before installing the driver.
- To update any installation parameter after the driver has been installed, change the `myvalues.yaml` file and run the install script with the option _\-\-upgrade_, for example: 
  ```bash

  ./csi-install.sh --namespace vxflexos --values ./myvalues.yaml --helm-charts-version csi-vxflexos-2.10.1 --upgrade
  ```
- The logging configuration from v1.5 will not work in v2.1, since the log configuration parameters are now set in the myvalues.yaml file located at dell-csi-helm-installer/myvalues.yaml. Please set the logging configuration parameters in the myvalues.yaml file.

- You cannot upgrade between drivers with different fsGroupPolicies. To check the current driver's fsGroupPolicy, use this command:  
  ```bash
   kubectl describe csidriver csi-vxflexos.dellemc.com
  ```   
  and check the "Spec" section:    
  ```yaml
  ...
  Spec:
    Attach Required:     true
    Fs Group Policy:     ReadWriteOnceWithFSType
    Pod Info On Mount:   true
    Requires Republish:  false
    Storage Capacity:    false
  ...
  ```

## Upgrade using Dell CSM Operator:
**Note:** Upgrading the Operator does not upgrade the CSI Driver.
1. Upgrade the Dell CSM Operator by following [here](../../../../../deployment/csmoperator/#to-upgrade-dell-csm-operator-perform-the-following-steps)
2. Once the operator is upgraded, to upgrade the driver, refer [here](../../../../../deployment/csmoperator/#upgrade-driver-using-dell-csm-operator)
