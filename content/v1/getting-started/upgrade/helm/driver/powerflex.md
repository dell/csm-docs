---
title: PowerFlex
linktitle: PowerFlex
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerFlex CSI driver
---
{{% pageinfo color="primary" %}}
{{< message text="2" >}}
{{% /pageinfo %}}
You can upgrade the CSI Driver for Dell PowerFlex using Helm or Dell CSM Operator.

## Update Driver from {{< version-v1 key="PFlex_preVersion" >}} to {{< version-v1 key="PFlex_latestVersion" >}} using Helm

**Steps**
1. Run `git clone -b {{< version-v1 key="PFlex_latestVersion" >}} https://github.com/dell/csi-powerflex.git` to clone the git repository and get the {{< version-v1 key="PFlex_latestVersion" >}} driver.
2. You need to create secret.yaml with the configuration of your system.
3. Update myvalues file as needed.
4. Run the `csi-install` script with the option _\-\-upgrade_ by running:
   ```bash
   cd ../dell-csi-helm-installer && ./csi-install.sh --namespace vxflexos --values ./myvalues.yaml --helm-charts-version <version> --upgrade
   ```

*NOTE:*
- The parameter `--helm-charts-version` is optional and if you do not specify the flag, by default the `csi-install.sh` script will clone the version of the helm chart that is specified in the driver's [csi-install.sh](https://github.com/dell/csi-powerflex/blob/main/dell-csi-helm-installer/csi-install.sh#L24) file. If you wish to install the driver using a different version of the helm chart, you need to include this flag. Also, remember to delete the `helm-charts` repository present in the `csi-powerflex` directory if it was cloned before.
- If you are upgrading from a driver version that was installed using Helm v2, ensure that you install Helm3 before installing the driver.
- To update any installation parameter after the driver has been installed, change the `myvalues.yaml` file and run the install script with the option _\-\-upgrade_, for example:
  ```bash
  ./csi-install.sh --namespace vxflexos --values ./myvalues.yaml --helm-charts-version <version> --upgrade
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
