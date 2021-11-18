---
title: "Unity"
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade Unity CSI driver
---

You can upgrade the CSI Driver for Dell EMC Unity using Helm or Dell CSI Operator.

### Using Helm

**Note:** While upgrading the driver via helm, controllerCount variable in myvalues.yaml can be at most one less than the number of worker nodes.

Preparing myvalues.yaml is the same as explained in the install section.

To upgrade the driver from csi-unity v2.0 to csi-unity 2.1 

1. Get the latest csi-unity 2.1 code from Github using using `git clone -b v2.1.0 https://github.com/dell/csi-unity.git`.
2. Create myvalues.yaml.
3. Copy the helm/csi-unity/values.yaml to the new location csi-unity/dell-csi-helm-installer with name say myvalues.yaml, to customize settings for installation edit myvalues.yaml as per the requirements.
4. Navigate to common-helm-installer folder and execute the following command:
   `./csi-install.sh --namespace unity --values ./myvalues.yaml --upgrade`
   
**Note:** 
1. User has to re-create existing custom-storage classes (if any) according to the latest (v2.0) format.
2. User has to create Volumesnapshotclass after upgrade for taking Snapshots.
3. Secret.yaml files can be updated according to Multiarray Normalization parameters only after upgrading the driver.  

### Using Operator

**Note:** While upgrading the driver via operator, replicas count in sample CR yaml can be at most one less than the number of worker nodes.  

To upgrade the driver from csi-unity v2.0 to csi-unity v2.1 :   

1. Clone the [Dell CSI Operator repository](https://github.com/dell/dell-csi-operator).

2. Execute `bash scripts/install.sh --upgrade`
This command will install the latest version of the operator.
>Note: Dell CSI Operator version 1.4.0 and higher would install to the 'dell-csi-operator' namespace by default.

3. To upgrade the driver, refer [here](./../../../installation/operator/#update-csi-drivers).
