---
title: "Dell CSI Operator"
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade Dell CSI Operator
---
To upgrade Dell CSI Operator from v1.2.0/v1.3.0 to v1.4.0/v1.5.0/v1.6.0, perform the following steps.

### Using Installation Script
Run the following command to upgrade the operator
```
$ bash scripts/install.sh --upgrade
```

### Using OLM
The upgrade of the Dell CSI Operator is done via Operator Lifecycle Manager.
If the `InstallPlan` for the Operator subscription is set to `Automatic`, the operator will be automatically upgraded to the new version. If the `InstallPlan` is set to `Manual`, then a Cluster Administrator would need to approve the upgrade.

**NOTE**: The recommended version of OLM for Upstream Kubernetes is **`v0.18.3`** when upgrading operator to `v1.5.0`.

