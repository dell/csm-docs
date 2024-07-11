---
title: "PowerScale"
tags: 
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerScale CSI driver
---
You can upgrade the CSI Driver for Dell PowerScale using Helm or Dell CSM Operator.

## Upgrade Driver from version 2.9.0 to 2.10.1 using Helm

**Note:** While upgrading the driver via helm, controllerCount variable in myvalues.yaml can be at most one less than the number of worker nodes.

### Steps

1. Clone the repository using `git clone -b v2.10.1 https://github.com/dell/csi-powerscale.git`

2. Change to directory dell-csi-helm-installer to install the Dell PowerScale `cd dell-csi-helm-installer`
3. Download the default values.yaml using following command:

   ```bash
   wget -O my-isilon-settings.yaml https://raw.githubusercontent.com/dell/helm-charts/csi-isilon-2.10.1/charts/csi-isilon/values.yaml
   ```

   Edit the _my-isilon-settings.yaml_ as per the requirements.
4. Upgrade the CSI Driver for Dell PowerScale using following command:

    ```bash
    ./csi-install.sh --namespace isilon --values ./my-isilon-settings.yaml --helm-charts-version <version> --upgrade
    ```

*NOTE:*
- The parameter `--helm-charts-version` is optional and if you do not specify the flag, by default the `csi-install.sh` script will clone the version of the helm chart that is specified in the driver's [csi-install.sh](https://github.com/dell/csi-powerscale/blob/main/dell-csi-helm-installer/csi-install.sh#L16) file. If you wish to install the driver using a different version of the helm chart, you need to include this flag. Also, remember to delete the `helm-charts` repository present in the `csi-powerscale` directory if it was cloned before.

## Upgrade using Dell CSM Operator

**Note:** Upgrading the Operator does not upgrade the CSI Driver.

1. Please upgrade the Dell CSM Operator by following [here](../../../../../deployment/csmoperator/#upgrade)
2. Once the operator is upgraded, to upgrade the driver, refer [here](../../../../../deployment/csmoperator/#upgrade-driver-using-dell-csm-operator)
