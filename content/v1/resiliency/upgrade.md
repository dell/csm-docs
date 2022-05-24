---
title: Upgrade
linktitle: Upgrade 
weight: 3
description: >
  Dell Container Storage Modules (CSM) for Resiliency upgrade
---

CSM for Resiliency can be upgraded as part of the Dell CSI driver upgrade process. The drivers can be upgraded either by a _helm chart_ or by the _Dell CSI Operator_. Currently, only _Helm chart_ upgrade is supported for CSM for Resiliency.

For information on the PowerFlex CSI driver upgrade process, see [PowerFlex CSI Driver](../../csidriver/upgradation/drivers/powerflex).

For information on the Unity CSI driver upgrade process, see [Unity CSI Driver](../../csidriver/upgradation/drivers/unity).

## Helm Chart Upgrade

To upgrade CSM for Resiliency with the driver, the following steps are required. 

>Note: These steps refer to the values file and `csi-install.sh` script that were used during initial installation of the Dell CSI driver.

**Steps**

1. Update the podmon.image value in the values files to reference the new podmon image.
2. Run the csi-install script with the option --upgrade by running: `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace vxflexos --values ./myvalues.yaml --upgrade`.
