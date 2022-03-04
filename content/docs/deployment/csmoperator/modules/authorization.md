---
title: Authorization
description: >
  Installing Authorization via Operator
---

## Installing Authorization via Operator

The Authorization module can be installed via the Dell CSM Operator for supported Dell CSI Drivers.

To deploy the Operator, follow the instructions available [here](../).

There are sample manifests provided which can be edited to do an easy installation of the driver. Note that the deployment of the driver using the operator does not use any Helm charts and the installation and configuration parameters will be slightly different from the one specified via the Helm installer.

Kubernetes Operators make it easy to deploy and manage the entire lifecycle of complex Kubernetes applications. Operators use Custom Resource Definitions (CRD) which represents the application and use custom controllers to manage them.

### Install Authorization

1. TODO: Create secret for the Authorization sidecar and detail how to use it in step 2 below when deploying the driver+authorization

2. Follow the steps to install a Dell CSI Driver. If Authorization is supported, the module section in the ContainerStorageModule CR can be updated to enable Authorization.

