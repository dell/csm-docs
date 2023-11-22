---
title: "Red Hat OpenShift"
linkTitle: "Red Hat OpenShift"
weight: 3
description: >
  Installing the certified Dell CSM Operator on OpenShift
---
The Dell CSI Drivers support Red Hat OpenShift.  Please see the [Supported Platforms](../../#features-and-capabilities) table for more details. 

The CSI drivers can be installed via Helm charts or Dell CSM Operator.  The Dell CSM Operator allows for easy installation of the driver via the Openshift UI. The process to install the Operator via the OpenShift UI can be found below.

## Install Operator via the OpenShift UI

**Steps**

1. Type "Dell" in the OperatorHub section under Operators, to get the list of available Dell CSM Operators.

![](../oc1CSM.PNG)

2. Check the version you want to install from the list, you can check the details by clicking it.

![](../oc2CSM.PNG)

3. Once selected, click "Install" to proceed with the installation process.

![](../oc3CSM.PNG)

4. You can verify the list of available operators by selecting the "Installed Operator" section.

![](../oc4CSM.PNG)

5. Select the Dell CSM Operator for further details.

![](../oc5CSM.PNG)

## Install CSI Drivers via Operator

**Steps**

1. Select "Create ContinerStorageModule" under the Container Storage Module menu.

![](../driver1CSM.PNG)

2. Set relevant parameters in your yaml file, as shown below. In this example, CSI Unity is being created. Refer to the [driver install pages for the Dell CSM Operator](../../../deployment/csmoperator/drivers/#installing-csi-driver-via-operator) for information on the parameters.

![](../driver2CSM.PNG)

3. You can check that the driver is installed, and that node and controller pods are running, in the Pods section under Workloads.

![](../driver3CSM.PNG)
