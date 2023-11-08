---
title: "Dell CSI Operator"
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade Dell CSI Operator
---

{{% pageinfo color="primary" %}}
The Dell CSI Operator is no longer actively maintained or supported. It will be deprecated in CSM 1.9. It is highly recommended that you use [CSM Operator](../../../../deployment/csmoperator) going forward.

Please follow the steps below to migrate from Dell CSI Operator to CSM Operator
* Step1: Backup the CRD to save the settings used
* Step2: Map and update the settings in CRD in step1 to the relevant CRD in CSM Operator
* Step3: Keep the secret and namespace for the driver
* Step4: Keep the Storage Class and Volume Snapshot Class
* Step5: Uninstall the CRD from the CSI Operator
* Step6: Uninstall the CSI Operator itself
* Step7: Install the CSM Operator
* Step8: Install the CRD updated in Step 2

{{% /pageinfo %}}

To upgrade Dell CSI Operator, perform the following steps.
Dell CSI Operator can be upgraded based on the supported platforms in one of the 2 ways:
1.	Using script (for non-OLM based installation)
2.	Using Operator Lifecycle Manager (OLM)


### Using Installation Script
1. Clone and checkout the required dell-csi-operator version using `git clone -b v1.12.0 https://github.com/dell/dell-csi-operator.git`.
2. cd dell-csi-operator
3. Execute `bash scripts/install.sh --upgrade`. This command will install the latest version of the operator.

### Using OLM
The upgrade of the Dell CSI Operator is done via Operator Lifecycle Manager.

The `Update approval` (**`InstallPlan`** in OLM terms) strategy plays a role while upgrading dell-csi-operator on OpenShift. This option can be set during installation of dell-csi-operator on OpenShift via the console and can be either set to `Manual` or `Automatic`.
  - If the **`Update approval`** is set to `Automatic`, OpenShift automatically detects whenever the latest version of dell-csi-operator is available in the **`Operator hub`**, and upgrades it to the latest available version.
  - If the upgrade policy is set to `Manual`, OpenShift notifies of an available upgrade. This notification can be viewed by the user in the **`Installed Operators`** section of the OpenShift console. Clicking on the hyperlink to `Approve` the installation would trigger the dell-csi-operator upgrade process.

**NOTE**: The recommended version of OLM for Upstream Kubernetes is **`v0.18.3`** when upgrading operator to `v1.12.0`.

