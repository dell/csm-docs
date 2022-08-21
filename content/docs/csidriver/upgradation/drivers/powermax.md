---
title: PowerMax
linktitle: PowerMax
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerMax CSI driver
---

You can upgrade CSI Driver for Dell PowerMax using Helm or Dell CSI Operator.

## Update Driver from v2.2 to v2.3 using Helm

**Steps**
1. Run `git clone -b v2.3.0 https://github.com/dell/csi-powermax.git` to clone the git repository and get the v2.3 driver.
2. Update the values file as needed.
2. Run the `csi-install` script with the option _\-\-upgrade_ by running: `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace powermax --values ./my-powermax-settings.yaml --upgrade`.

*NOTE:*
- If you are upgrading from a driver version that was installed using Helm v2, ensure that you install Helm3 before installing the driver.
- To update any installation parameter after the driver has been installed, change the `my-powermax-settings.yaml` file and run the install script with the option _\-\-upgrade_, for example: `./csi-install.sh --namespace powermax --values ./my-powermax-settings.yaml –upgrade`.
- You cannot upgrade between drivers with different fsGroupPolicies. To check the current driver's fsGroupPolicy, use this command:
``` kubectl describe csidriver csi-powermax``` 
and check the "Spec" section:

```
...
Spec:
  Attach Required:     true
  Fs Group Policy:     ReadWriteOnceWithFSType
  Pod Info On Mount:   false
  Requires Republish:  false
  Storage Capacity:    false
...

```

## Upgrade using Dell CSI Operator:
**Note:** Upgrading the Operator does not upgrade the CSI Driver.

1. Please upgrade the Dell CSI Operator by following [here](./../operator).
2. Once the operator is upgraded, to upgrade the driver, refer [here](./../../../installation/operator/#update-csi-drivers).

