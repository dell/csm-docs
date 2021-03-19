---
title: PowerMax
linktitle: PowerMax
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerMax CSI driver
---

You can upgrade the CSI Driver for Dell EMC PowerMax using Helm or Dell CSI Operator.

## Update Driver from v1.5 to v1.6 using Helm

**Steps**
1. Run `git clone https://github.com/dell/csi-powermax.git` to clone the git repository and get the v1.6 driver.
2. Update values file as needed.
2. Run the `csi-install` script with the option _\-\-upgrade_ by running: `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace powermax --values ./my-powermax-settings.yaml --upgrade`.

## Update Driver from pre-v1.4 to v1.6 using Helm

A rolling upgrade of the driver from an older version to v1.4 is not supported because of breaking changes in Kubernetes APIs in the migration from alpha snapshots to beta snapshots. In order to update the driver in this situation you need to remove alpha snapshot related artifacts.

**Steps**
1. Delete any alpha VolumeSnapshot or VolumeSnapshotContent in the cluster.
2. Before deleting the alpha snapshot CRDs, ensure that their version is v1alpha1 by examining the output of the `kubectl get crd` command.
3. Delete any VolumeSnapshotClass present in the cluster.
4. Delete all the alpha snapshot CRDs from the cluster by running the following commands:
   ```bash
   kubectl delete crd volumesnapshotclasses.snapshot.storage.k8s.io
   kubectl delete crd volumesnapshotcontents.snapshot.storage.k8s.io
   kubectl delete crd volumesnapshots.snapshot.storage.k8s.io
   ```
5. Uninstall the driver using the `csi-uninstall.sh` script by running the command: `./csi-uninstall.sh --namespace <driver-namespace>` where _driver-namespace_ is the namespace where driver is installed.

6. Install the driver using the steps described in the Installation Using Helm section for the CSI PowerMax driver.

*NOTE:*
- If you are upgrading from a driver version which was installed using Helm v2, ensure that you install Helm3 before installing the driver.
- Installation of the CSI Driver for Dell EMC PowerMax version 1.6 driver is not supported on Kubernetes upstream clusters running Kubernetes version 1.17 or lower. You must upgrade your cluster to 1.18, 1.19, or 1.20 before attempting to install the new version of the driver.
- To update any installation parameter after the driver has been installed, change the `my-powermax-settings.yaml` file and run the install script with the option _\-\-upgrade_, for example: `./csi-install.sh --namespace powermax --values ./my-powermax-settings.yaml –upgrade`.

## Upgrade using Dell CSI Operator:

Follow the instructions for upgrade on the Dell CSI Operator [GitHub](https://github.com/dell/dell-csi-operator) page.
