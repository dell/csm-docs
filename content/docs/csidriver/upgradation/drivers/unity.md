---
title: "Unity XT"
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade Unity XT CSI driver
---

You can upgrade the CSI Driver for Dell Unity XT using Helm or Dell CSM Operator.

**Note:**
1. User has to re-create existing custom-storage classes (if any) according to the latest format.
2. User has to create Volumesnapshotclass after upgrade for taking Snapshots.
3. Secret.yaml files can be updated according to Multiarray normalization parameters only after upgrading the driver.
 
### Using Helm

**Note:** While upgrading the driver via helm, controllerCount variable in myvalues.yaml can be at most one less than the number of worker nodes.

Preparing myvalues.yaml is the same as explained in the install section.

To upgrade the driver from csi-unity v2.8.0 to csi-unity v2.9.0

1. Get the latest csi-unity v2.9.0 code from Github using `git clone -b v2.9.0 https://github.com/dell/csi-unity.git`.
2. Copy the helm/csi-unity/values.yaml to the new location csi-unity/dell-csi-helm-installer and rename it to myvalues.yaml. Customize settings for installation by editing myvalues.yaml as needed.
3. Navigate to csi-unity/dell-csi-hem-installer folder and execute this command:
   ```bash
   
   ./csi-install.sh --namespace unity --values ./myvalues.yaml --upgrade
   ```

### Upgrade using Dell CSM Operator:
**Note:**
Upgrading the Operator does not upgrade the CSI Driver.

1. Upgrade the Dell CSM Operator by following [here](../../../../deployment/csmoperator/#to-upgrade-dell-csm-operator-perform-the-following-steps)
2. Once the operator is upgraded, to upgrade the driver, refer [here](../../../../deployment/csmoperator/#upgrade-driver-using-dell-csm-operator)

