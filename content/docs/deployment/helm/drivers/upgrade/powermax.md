---
title: PowerMax
linktitle: PowerMax
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerMax CSI driver
---

You can upgrade CSI Driver for Dell PowerMax using Helm or Dell CSM Operator.

**Note:** CSI Driver for PowerMax v2.4.0 requires 10.0 REST endpoint support of Unisphere.
### Updating the CSI Driver to use 10.0 Unisphere

1. Upgrade the Unisphere to have 10.0 endpoint support.Please find the instructions [here.](https://dl.dell.com/content/manual34878027-dell-unisphere-for-powermax-10-0-0-installation-guide.pdf?language=en-us&ps=true)
2. Update the `my-powermax-settings.yaml` to have endpoint with 10.0 support.

## Update Driver from v2.9 to v2.10 using Helm

**Steps**
1. Run `git clone -b v2.10.0 https://github.com/dell/csi-powermax.git` to clone the git repository and get the driver.
2. Update the values file as needed.
3. Run the `csi-install` script with the option _\-\-upgrade_ by running: 
   ```bash

   cd ../dell-csi-helm-installer && ./csi-install.sh --namespace powermax --values ./my-powermax-settings.yaml --upgrade --helm-charts-version <version>
   ```

*NOTE:*
- The parameter `--helm-charts-version` is optional and if you do not specify the flag, by default the `csi-install.sh` script will clone the version of the helm chart that is specified in the driver's [csi-install.sh](https://github.com/dell/csi-powermax/blob/main/dell-csi-helm-installer/csi-install.sh#L52) file. If you wish to install the driver using a different version of the helm chart, you need to include this flag. Also, remember to delete the `helm-charts` repository present in the `csi-powermax` directory if it was cloned before.
- If you are upgrading from a driver version that was installed using Helm v2, ensure that you install Helm3 before installing the driver.
- To update any installation parameter after the driver has been installed, change the `my-powermax-settings.yaml` file and run the install script with the option _\-\-upgrade_, for example: 
   ```bash

   ./csi-install.sh --namespace powermax --values ./my-powermax-settings.yaml –upgrade
   ```
- You cannot upgrade between drivers with different fsGroupPolicies. To check the current driver's fsGroupPolicy, use this command:
   ```bash
   kubectl describe csidriver csi-powermax
   ``` 
   and check the "Spec" section:

    ```yaml
    ...
    Spec:
      Attach Required:     true
      Fs Group Policy:     ReadWriteOnceWithFSType
      Pod Info On Mount:   false
      Requires Republish:  false
      Storage Capacity:    false
    ...

    ```

## Upgrade using Dell CSM Operator:
**Note:** Upgrading the Operator does not upgrade the CSI Driver.

1. Upgrade the Dell CSM Operator by following [here](../../../../../deployment/csmoperator/#to-upgrade-dell-csm-operator-perform-the-following-steps)
2. Once the operator is upgraded, to upgrade the driver, refer [here](../../../../../deployment/csmoperator/#upgrade-driver-using-dell-csm-operator)
