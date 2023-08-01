---
title: "PowerScale"
tags: 
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerScale CSI driver
---
You can upgrade the CSI Driver for Dell PowerScale using Helm or Dell CSI Operator.

## Upgrade Driver from version 2.6.1 to 2.7.0 using Helm


**Note:** While upgrading the driver via helm, controllerCount variable in myvalues.yaml can be at most one less than the number of worker nodes.

**Steps**

1. Clone the repository using `git clone -b v2.7.0 https://github.com/dell/csi-powerscale.git`, copy the helm/csi-isilon/values.yaml into a new location with a custom name say _my-isilon-settings.yaml_, to customize settings for installation. Edit _my-isilon-settings.yaml_ as per the requirements.
2. Change to directory dell-csi-helm-installer to install the Dell PowerScale `cd dell-csi-helm-installer`
3. Upgrade the CSI Driver for Dell PowerScale using following command:

   ```bash
   wget -O my-isilon-settings.yaml  https://raw.githubusercontent.com/dell/helm-charts/main/charts/csi-isilon/values.yaml

   ./csi-install.sh --namespace isilon --values my-isilon-settings.yaml --upgrade
   ```


## Upgrade using Dell CSI Operator:
**Notes:**
1. While upgrading the driver via operator, replicas count in sample CR yaml can be at most one less than the number of worker nodes.
2. Upgrading the Operator does not upgrade the CSI Driver.

To upgrade the driver:

1. Please upgrade the Dell CSI Operator by following [here](./../operator).
2. Once the operator is upgraded, to upgrade the driver, refer [here](./../../../installation/operator/#update-csi-drivers).

