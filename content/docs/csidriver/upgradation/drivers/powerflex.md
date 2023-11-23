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

## Update Driver from v2.8.0 to v2.9.0 using Helm
**Steps**
1. Run `git clone -b v2.9.0 https://github.com/dell/csi-powerflex.git` to clone the git repository and get the v2.9.0 driver.
2. You need to create secret.yaml with the configuration of your system.
   Check this section in installation documentation:  [Install the Driver](../../../installation/helm/powerflex#install-the-driver)
3. Update myvalues file as needed.
4. Run the `csi-install` script with the option _\-\-upgrade_ by running: 
   ```bash
  
   cd ../dell-csi-helm-installer && ./csi-install.sh --namespace vxflexos --values ./myvalues.yaml --upgrade
   ```

*NOTE:*
- If you are upgrading from a driver version that was installed using Helm v2, ensure that you install Helm3 before installing the driver.
- To update any installation parameter after the driver has been installed, change the `myvalues.yaml` file and run the install script with the option _\-\-upgrade_, for example: 
  ```bash

  ./csi-install.sh --namespace vxflexos --values ./myvalues.yaml --upgrade
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
1. Upgrade the Dell CSM Operator by following [here](../../../../deployment/csmoperator/#to-upgrade-dell-csm-operator-perform-the-following-steps)
2. Once the operator is upgraded, to upgrade the driver, refer [here](../../../../deployment/csmoperator/#upgrade-driver-using-dell-csm-operator)
