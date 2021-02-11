---
title: PowerFlex
linktitle: PowerFlex
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerFlex CSI driver
---

You can upgrade the CSI Driver for Dell EMC PowerFlex using Helm or Dell CSI Operator.

## Update Driver from v1.2 to v1.3 using Helm 

**Steps**
1. Run `git clone https://github.com/dell/csi-powerflex.git` to clone the git repository and get the v1.3 driver.
2. Update values file as needed.
2. Run the `csi-install` script with the option _\-\-upgrade_ by running: `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace vxflexos --values ./myvalues.yaml --upgrade`.

## Update Driver from pre-v1.2 to v1.3 using Helm
A direct upgrade of the driver from an older version pre-v1.2 to version 1.3 is not supported because of breaking changes in Kubernetes APIs in the migration from alpha snapshots to beta snapshots. In order to update the driver in this situation you need to remove alpha snapshot related artifacts.

**Steps**
1. Before deleting the alpha snapshot CRDs, ensure that their version is v1alpha1 by examining the output of the `kubectl get crd` command.
2. Delete any VolumeSnapshotClass present in the cluster.
3. Delete all the alpha snapshot CRDs from the cluster by running the following commands:
   ```bash
   kubectl delete crd volumesnapshotclasses.snapshot.storage.k8s.io
   kubectl delete crd volumesnapshotcontents.snapshot.storage.k8s.io
   kubectl delete crd volumesnapshots.snapshot.storage.k8s.io
   ```
4. Uninstall the driver using the `csi-uninstall.sh` script by running the command: `./csi-uninstall.sh --namespace vxflexos`.
5. Install the driver using the steps described in the Installation Using Helm section for the CSI PowerFlex driver.

*NOTE:*
- If you are upgrading from a driver version which was installed using Helm v2, ensure that you install Helm3 before installing the driver.
- Installation of the CSI Driver for Dell EMC PowerFlex version 1.3 driver is not supported on Kubernetes upstream clusters running version 1.16. You must upgrade your cluster to 1.17, 1.18, or 1.19 before attempting to install the new version of the driver.
- To update any installation parameter after the driver has been installed, change the `myvalues.yaml` file and run the install script with the option _\-\-upgrade_, for example: `./csi-install.sh --namespace vxflexos --values ./myvalues.yaml --upgrade`.

## Upgrade using Dell CSI Operator:

Follow the instructions for upgrade on the Dell CSI Operator [GitHub](https://github.com/dell/dell-csi-operator) page.
