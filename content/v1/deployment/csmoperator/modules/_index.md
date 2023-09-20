---
title: "CSM Modules"
linkTitle: "CSM Modules"
description: Installation of Dell CSM Modules using Dell CSM Operator
weight: 2
---

The CSM Operator can optionally enable modules that are supported by the specific Dell CSI driver. By default, the modules are disabled but they can be enabled by setting any pre-requisite configuration options for the given module and setting the enabled flag to true  in the custom resource.
The steps include:

1. Deploy the Dell CSM Operator (if it is not already deployed). Please follow the instructions available [here](../../#installation).
2. Configure any pre-requisite for the desired module(s). See the specific module below for more information
3. Follow the instructions [here](../drivers) to install Dell CSI Drivers via the CSM Operator. The module section in the ContainerStorageModule CR should be updated to enable the desired module(s). There are [sample manifests](https://github.com/dell/csm-operator/tree/main/samples) provided which can be edited to do an easy installation of the driver along with the module.
