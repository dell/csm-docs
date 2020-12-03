---
title: "PowerScale"
tags: 
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerScale CSI driver
---
You can upgrade the CSI Driver for Dell EMC Unity using Helm or Dell CSI Operator.

## Upgrade Driver from version v1.3.0.1 to v1.4
**Steps**
1. Upgrade the Kubernetes to Kubernetes 1.17.x version first before upgrading CSI driver.
2. Uninstall CSI Driver for DELL EMC PowerScale v1.3.0.
3. Verify that all pre-requisites to install CSI Driver for DELL EMC PowerScale v1.4.0 are fulfilled.
4. Clone the repository https://github.com/dell/csi-powerscale , copy the helm/csi-isilon/values.yaml into a new location with name say my-isilon-settings.yaml, to customize settings for installation. Edit my-isilon-settings.yaml as per the requirements.
5. Change to directory dell-csi-helm-installer to install the DELL EMC PowerScale `cd dell-csi-helm-installer`
6. Install the CSI Driver for DELL EMC PowerScale v1.4.0 using following command:

   `./csi-install.sh --namespace isilon --values ./my-isilon-settings.yaml `

## Upgrade using Dell CSI Operator:

Follow the instructions for upgrade on the Dell CSI Operator [GitHub](https://github.com/dell/dell-csi-operator) page.
