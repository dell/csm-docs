---
title: Authorization
linkTitle: "Authorization"
description: >
  Installing Authorization via Dell CSM Operator
---

## Installing Authorization via Dell CSM Operator

The Authorization module for supported Dell CSI Drivers can be installed via the Dell CSM Operator.

### Install Authorization

1. Create the required Secrets as documented in the [Helm chart procedure](../../../../authorization/deployment/#configuring-a-dell-csi-driver).

2. Follow the instructions available [here](../../drivers/powerscale/#install-driver) to install the Dell CSI Driver via the CSM Operator. The module section in the ContainerStorageModule CR should be updated to enable Authorization.