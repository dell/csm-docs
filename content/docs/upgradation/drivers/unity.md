---
title: "Unity"
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade Unity CSI driver
---

You can upgrade the CSI Driver for Dell EMC Unity using Helm or Dell CSI Operator.
### Using Helm:

Preparing myvalues.yaml is the same as explained in install section.

To upgrade the driver from csi-unity v1.4 to csi-unity 1.5 (across K8S 1.18, K8S 1.19, K8S 1.20).

1. Get the latest csi-unity 1.4 code from Github.
2. Create myvalues.yaml according to csi-unity 1.4 .
3. Delete the existing default storage classes of csi-unity 1.4 .
4. Navigate to common-helm-installer folder and copy the myvalues.yaml file here and execute the following command:
   `./csi-install.sh --namespace unity --values ./myvalues.yaml --upgrade`
6. If the value of 'createStorageClassesWithTopology' is set to "true" in myvalues.yaml , then 

   - Check the default storage classes of iSCSI and FC protocols , VolumeBindingMode should be 'WaitForFirstConsumer' .

**Note:** User has to re-create existing custom-storage classes (if any) according to latest (v1.5) format.

**Note:** While upgrading the driver, controllerCount variable in myvalues.yaml can be at most one less than the number of worker nodes.


### Using Operator:
   To upgrade the driver from csi-unity v1.4 to csi-unity v1.5 (OpenShift 4.6) :   

1. Clone operator version 1.3.0

2. Execute `bash scripts/install.sh --upgrade`
This command will install latest version of operator.

3. Furnish the sample CR yaml according to your environment. 

4. For upgrading the csi-unity driver execute the following command:

   `kubectl apply -f <furnished-cr.yaml>`
