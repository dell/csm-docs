---
title: "PowerScale"
tags: 
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerScale CSI driver
---
You can upgrade the CSI Driver for Dell PowerScale using Helm or Dell CSM Operator.

## Upgrade Driver from version 2.9.0 to 2.10.0 using Helm

**Note:** While upgrading the driver via helm, controllerCount variable in myvalues.yaml can be at most one less than the number of worker nodes.

### Steps

1. Clone the repository using `git clone -b v2.10.0 https://github.com/dell/csi-powerscale.git`

2. Change to directory dell-csi-helm-installer to install the Dell PowerScale `cd dell-csi-helm-installer`
3. Download the default values.yaml using following command:

   ```bash
   wget -O my-isilon-settings.yaml https://raw.githubusercontent.com/dell/helm-charts/csi-isilon-2.10.0/charts/csi-isilon/values.yaml
   ```

   Edit the _my-isilon-settings.yaml_ as per the requirements.
4. Upgrade the CSI Driver for Dell PowerScale using following command:

    ```bash
    ./csi-install.sh --namespace isilon --values ./my-isilon-settings.yaml --upgrade
    ```

## Upgrade using Dell CSM Operator

**Note:** Upgrading the Operator does not upgrade the CSI Driver.

1. Please upgrade the Dell CSM Operator by following [here](../../../../deployment/csmoperator/#upgrade)
2. Once the operator is upgraded, to upgrade the driver, refer [here](../../../../deployment/csmoperator/#upgrade-driver-using-dell-csm-operator)
