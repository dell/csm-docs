---
title: "PowerScale"
tags: 
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerScale CSI driver
---
You can upgrade the CSI Driver for Dell EMC Unity using Helm or Dell CSI Operator.

## Upgrade Driver from version v1.4.0 to v1.5.0

**Steps**
1. Verify that all pre-requisites to install CSI Driver for Dell EMC PowerScale v1.5.0 are fulfilled (including change in secret formats).
   
         1.1 Delete the existing secrets (isilon-creds and isilon-certs)
   
         1.2 Create new secrets (isilon-creds and isilon-certs-0) in the format specified by csi-powerscale 1.5. 
   
      Refer Installation section [here](./../../../installation/helm/isilon/#install-csi-driver-for-powerscale).
2. Clone the repository https://github.com/dell/csi-powerscale , copy the helm/csi-isilon/values.yaml into a new location with name say my-isilon-settings.yaml, to customize settings for installation. Edit my-isilon-settings.yaml as per the requirements.
3. Change to directory dell-csi-helm-installer to install the Dell EMC PowerScale `cd dell-csi-helm-installer`
4. Upgrade the CSI Driver for Dell EMC PowerScale v1.5.0 using following command:

   `./csi-install.sh --namespace isilon --values ./my-isilon-settings.yaml --upgrade`


## Upgrade using Dell CSI Operator:

To upgrade the driver from csi-PowerScale v1.4 to csi-PowerScale v1.5 (OpenShift 4.6) :

1. Clone operator version 1.3.0
2. Execute `bash scripts/install.sh --upgrade`  .This command will install latest version of operator.
3. Uninstall the existing driver by executing the command `kubectl delete -f <driver.yaml>` with appropriate yaml file used for csi-powerscale 1.4 installation.
4. Delete the existing secrets (both isilon-creds and isilon-certs)
5. Create new isilon-creds secret in the latest csi-PowerScale format. For additional information, refer [here](./../../../installation/helm/isilon/#install-csi-driver-for-powerscale) 
6. Create new isilon-certs secret. Make sure the name of new secret is isilon-certs-0. For additional information, refer [here](./../../../installation/helm/isilon/#certificate-validation-for-onefs-rest-api-calls)
7. Furnish the sample CR yaml according to your environment.
8. Install csi-PowerScale driver 1.5 by executing the following command:
   `kubectl create -f <furnished-cr.yaml>`
   
The above said steps are for Operator which was deployed in non-olm way. 

For additional information, refer Dell CSI Operator [GitHub](https://github.com/dell/dell-csi-operator) page.
