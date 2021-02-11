---
title: "PowerStore"
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerStore CSI driver
---

You can upgrade the CSI Driver for Dell EMC PowerStore using Helm or Dell CSI Operator.

## Update Driver from v1.1 to v1.2 using Helm

**Steps**
1. Run `git clone https://github.com/dell/csi-powerstore.git` to clone the git repository and get the v1.2 driver.
2. Update values file as needed.
2. Run the `csi-install` script with the option _\-\-upgrade_ by running: `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace csi-powerstore --values ./my-powerstore-settings.yaml --upgrade`.

## Upgrade using Dell CSI Operator:

Follow the instructions for upgrade on the Dell CSI Operator [GitHub](https://github.com/dell/dell-csi-operator) page.
