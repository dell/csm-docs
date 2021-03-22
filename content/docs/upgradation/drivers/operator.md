---
title: "Dell CSI Operator"
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade Dell CSI Operator
---

If you are upgrading the Dell CSI Operator from v1.1.0 or v1.2.0 to v1.3.0, then follow the instructions below. If you are trying to upgrade the Operator from an older version, please refer the instructions [here](#upgrade-operator-from-version-older-than-v110-to-v130)

### Using Installation Script
Run the following command to upgrade the operator from v1.2.0 release
```
$ bash scripts/install.sh --upgrade
```

### Using OLM
The upgrade of the Dell CSI Operator is done via Operator Lifecycle Manager.
If the `InstallPlan` for the Operator subscription is set to `Automatic`, the operator will be automatically upgraded to the new version. If the `InstallPlan` is set to `Manual`, then a Cluster Administrator would need to approve the upgrade.

### Upgrade Operator from version older than v1.1.0 to v1.3.0

* Uninstall the old version of the Operator
* If required, upgrade your cluster to a supported version
* Follow the installation instructions to install the v1.3.0 of the Operator [here](../../../installation/operator)
