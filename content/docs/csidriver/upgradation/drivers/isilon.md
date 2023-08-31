---
title: "PowerScale"
tags: 
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerScale CSI driver
---
You can upgrade the CSI Driver for Dell PowerScale using Helm or Dell CSI Operator.

## Upgrade Driver from version 2.7.0 to 2.8.0 using Helm


**Note:** While upgrading the driver via helm, controllerCount variable in myvalues.yaml can be at most one less than the number of worker nodes.

**Steps**

1. Clone the repository using `git clone -b v2.8.0 https://github.com/dell/csi-powerscale.git`

2. Change to directory dell-csi-helm-installer to install the Dell PowerScale `cd dell-csi-helm-installer`
3. Upgrade the CSI Driver for Dell PowerScale using following command:

   ```bash
   wget -O my-isilon-settings.yaml -b csi-isilon-2.8.0  https://raw.githubusercontent.com/dell/helm-charts/main/charts/csi-isilon/values.yaml 
 
   ```
   Edit the _my-isilon-settings.yaml_ as per the requirements.

    ```bash
      ./csi-install.sh --namespace isilon --values ./my-isilon-settings.yaml   --upgrade
      ```
      OR 

      To upgrade particular version 
      ```bash
      ./csi-install.sh --namespace isilon --values ./my-isilon-settings.yaml  --helm-charts-version <version> --upgrade
      ```
