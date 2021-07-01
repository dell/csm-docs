---
title: "PowerScale"
tags: 
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerScale CSI driver
---
You can upgrade the CSI Driver for Dell EMC PowerScale using Helm or Dell CSI Operator.

## Upgrade Driver from version 1.5.0 to 1.6.0

**Steps**
1. Verify that all pre-requisites to install CSI Driver for Dell EMC PowerScale version 1.6.0 are fulfilled. Note that change in secret format should be taken care.
      - Delete the existing secret (isilon-creds and isilon-certs-0)
      - Create new secrets (isilon-creds and isilon-certs-0)
      Refer Installation section [here](./../../../installation/helm/isilon/#install-the-driver).
2. Clone the repository https://github.com/dell/csi-powerscale , copy the helm/csi-isilon/values.yaml into a new location with a custom name say _my-isilon-settings.yaml_, to customize settings for installation. Edit _my-isilon-settings.yaml_ as per the requirements.
3. Change to directory dell-csi-helm-installer to install the Dell EMC PowerScale `cd dell-csi-helm-installer`
4. Upgrade the CSI Driver for Dell EMC PowerScale version 1.6.0 using following command:

   `./csi-install.sh --namespace isilon --values ./my-isilon-settings.yaml --upgrade`


## Upgrade using Dell CSI Operator:

To upgrade the driver from version 1.5.0 to 1.6.0:

Note: It is highly recommended to take *Backup of existing storage class definition and volumesnapshot class definition, yaml files* before the upgrade.

1. Clone the [Dell CSI Operator repository](https://github.com/dell/dell-csi-operator).

2. Execute `bash scripts/install.sh --upgrade`  . This command will install the latest version of the operator.
>Note: Dell CSI Operator version 1.4.0 and higher would install to the 'dell-csi-operator' namespace by default.

3. To upgrade the driver, refer [here](./../../../installation/operator/#update-csi-drivers).

