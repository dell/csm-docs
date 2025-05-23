---
title: PowerMax
linktitle: PowerMax
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerMax CSI driver
---
{{% pageinfo color="primary" %}}
{{< message text="2" >}}
{{% /pageinfo %}}
Upgrades to the CSI Driver for Dell PowerMax can be made using Helm or Dell CSM Operator.

**Note:** CSI Driver for PowerMax v2.4.0 and later requires Unisphere version 10.0, or later.

### Updating the CSI Driver to use 10.0 Unisphere

1. Upgrade the Unisphere to have 10.0 endpoint support. Please find the instructions [here.](https://dl.dell.com/content/manual34878027-dell-unisphere-for-powermax-10-0-0-installation-guide.pdf?language=en-us&ps=true)
2. Update the powermax-creds secret to specify endpoints with Unisphere version 10.0 support.

## Update Driver from {{< version-v1 key="PMax_preVersion" >}} to {{< version-v1 key="PMax_latestVersion" >}} using Helm

**Steps**

1. Clone the csi-powermax repository, using the latest release branch. This will include the Helm charts and dell-csi-helm-installer scripts.
   ```bash
   git clone -b {{< version-v1 key="PMax_latestVersion" >}} https://github.com/dell/csi-powermax.git
   cd ./csi-powermax
   ```
2. As of CSI PowerMax v2.14.0, the csi reverse proxy configuration and connectivity information has been migrated from a ConfigMap to a Secret. If the `powermax-creds` secret format was not previously updated, reference **Step 2** in [CSI Driver installation steps](../../../../installation/kubernetes/powermax/helm/#install-driver).

> Note: The `powermax-reverseproxy-config` remains for backward compatibility only. Use of the `powermax-creds` Secret, as outlined above, is recommended.
> If you would like to continue using the `powemax-reverseproxy-config` ConfigMap, set `global.useSecret: false` in your helm values file, and skip the creation of this Secret.

3. Download the latest helm values file and update as needed. Reference the [CSI Driver installation steps](../../../../installation/kubernetes/powermax/helm/#install-driver) for more details on the available options.
   ```bash
   cd ./dell-csi-helm-installer
   wget -O my-powermax-settings.yaml https://github.com/dell/helm-charts/raw/csi-powermax-2.14.0/charts/csi-powermax/values.yaml
   ```

4. Confirm the value of `global.useSecret` is set to `true` if electing to use the new secret format, and `false` otherwise.

5. Run the `csi-install` script with the option _\-\-upgrade_ by running:
   ```bash
   ./csi-install.sh --namespace powermax --values ./my-powermax-settings.yaml --upgrade --helm-charts-version <version>
   ```
> Note: Powermax-array-config is deprecated and remains for backward compatibility only.

> Notes:
> - The parameter `--helm-charts-version` is optional and if you do not specify the flag, by default the `csi-install.sh` script will clone the version of the helm chart that is specified in the driver's [csi-install.sh](https://github.com/dell/csi-powermax/blob/main/dell-csi-helm-installer/csi-install.sh#L52) file. If you wish to install the driver using a different version of the helm chart, you need to include this flag. Also, remember to delete the `helm-charts` repository present in the `csi-powermax` directory if it was cloned before.
> - If you are upgrading from a driver version that was installed using Helm v2, ensure that you install Helm3 before installing the driver.
> - To update any installation parameter after the driver has been installed, change the `my-powermax-settings.yaml` file and run the install script with the option _\-\-upgrade_, for example:
>   ```bash
>   ./csi-install.sh --namespace powermax --values ./my-powermax-settings.yaml –upgrade
>   ```
> - You cannot upgrade between drivers with different fsGroupPolicies. To check the current driver's fsGroupPolicy, use this command:
>   ```bash
>   kubectl describe csidriver csi-powermax
>   ```
>   and check the "Spec" section:
>
>    ```yaml
>    ...
>    Spec:
>      Attach Required:     true
>      Fs Group Policy:     ReadWriteOnceWithFSType
>      Pod Info On Mount:   false
>      Requires Republish:  false
>      Storage Capacity:    false
>    ...
>
>    ```
