---
title: "Unity XT"
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade Unity XT CSI driver
---

You can upgrade the CSI Driver for Dell Unity XT using Helm or Dell CSI Operator.

**Note:**
1. User has to re-create existing custom-storage classes (if any) according to the latest format.
2. User has to create Volumesnapshotclass after upgrade for taking Snapshots.
3. Secret.yaml files can be updated according to Multiarray normalization parameters only after upgrading the driver.
 
### Using Helm

**Note:** While upgrading the driver via helm, controllerCount variable in myvalues.yaml can be at most one less than the number of worker nodes.

Preparing myvalues.yaml is the same as explained in the install section.

To upgrade the driver from csi-unity v2.4.0 to csi-unity v2.5.0

1. Get the latest csi-unity v2.5.0 code from Github using `git clone -b v2.5.0 https://github.com/dell/csi-unity.git`.
2. Copy the helm/csi-unity/values.yaml to the new location csi-unity/dell-csi-helm-installer and rename it to myvalues.yaml. Customize settings for installation by editing myvalues.yaml as needed.
3. Navigate to csi-unity/dell-csi-hem-installer folder and execute this command:
  `./csi-install.sh --namespace unity --values ./myvalues.yaml --upgrade`

### Using Operator

**Notes:**
1. While upgrading the driver via operator, replicas count in sample CR yaml can be at most one less than the number of worker nodes.
2. Upgrading the Operator does not upgrade the CSI Driver.

To upgrade the driver:   

1. Please upgrade the Dell CSI Operator by following [here](./../operator).
2. Once the operator is upgraded, to upgrade the driver, refer [here](./../../../installation/operator/#update-csi-drivers).

