---
title: "Dell CSI Operator"
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade Dell CSI Operator
---
To upgrade Dell CSI Operator from v1.2.0/v1.3.0 to v1.4.0/v1.5.0/v1.6.0/v1.7.0, perform the following steps.
Dell CSI Operator can be upgraded based on the supported platforms in one of the 2 ways:
1.	Using script (for non-OLM based installation)
2.	Using Operator Lifecycle Manager (OLM)


### Using Installation Script
1. Clone the [Dell CSI Operator repository](https://github.com/dell/dell-csi-operator).
2. cd ./dell-csi-operator
3. git checkout dell-csi-operator-<your-version>
4. Execute `bash scripts/install.sh --upgrade`  . This command will install the latest version of the operator.
>Note: Dell CSI Operator version 1.4.0 and higher would install to the 'dell-csi-operator' namespace by default.

### Using OLM
The upgrade of the Dell CSI Operator is done via Operator Lifecycle Manager.

The `Update approval` (**`InstallPlan`** in OLM terms) strategy plays a role while upgrading dell-csi-operator on OpenShift. This option can be set during installation of dell-csi-operator on OpenShift via the console and can be either set to `Manual` or `Automatic`.
  - If the **`Update approval`** is set to `Automatic`, OpenShift automatically detects whenever the latest version of dell-csi-operator is available in the **`Operator hub`**, and upgrades it to the latest available version.
  - If the upgrade policy is set to `Manual`, OpenShift notifies of an available upgrade. This notification can be viewed by the user in the **`Installed Operators`** section of the OpenShift console. Clicking on the hyperlink to `Approve` the installation would trigger the dell-csi-operator upgrade process.

**NOTE**: The recommended version of OLM for Upstream Kubernetes is **`v0.18.3`** when upgrading operator to `v1.5.0`.

