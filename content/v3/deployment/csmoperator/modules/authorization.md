---
title: Authorization
linkTitle: "Authorization"
description: >
  Installing Authorization via Dell CSM Operator
---

## Installing Authorization via Dell CSM Operator

The Authorization module for supported Dell CSI Drivers can be installed via the Dell CSM Operator.

To deploy the Dell CSM Operator, follow the instructions available [here](../../#installation).

There are [sample manifests](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerscale.yaml) provided which can be edited to do an easy installation of the driver along with the module.

### Install Authorization

1. Create the required Secrets as documented in the [Helm chart procedure](../../../../authorization/deployment/#configuring-a-dell-csi-driver).

2. Follow the instructions available [here](../../drivers/powerscale/#install-driver) to install the Dell CSI Driver via the CSM Operator. The module section in the ContainerStorageModule CR should be updated to enable Authorization.