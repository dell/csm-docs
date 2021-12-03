---
title: "Red Hat OpenShift"
linkTitle: "Red Hat OpenShift"
weight: 3
description: >
  Installing the certified Dell CSI Operator on OpenShift
---
The Dell EMC CSI Drivers support Red Hat OpenShift.  Please see the [Supported Platforms](../../dell-csi-driver/#supported-platforms) table for more details. 

The CSI drivers can be installed via Helm charts or Dell CSI Operator.  The Dell CSI Operator allows for easy installation of the driver via the Openshift UI. The process to install the Operator via the OpenShift UI can be found below.

## Install Operator via the OpenShift UI

**Steps**

1. Type "Dell" in the OperatorHub section under Operators, to get the list of available Dell CSI Operators.
![](../oc1.PNG)

2. Check the version you want to install from the list, you can check the details by clicking it.
![](../oc2.PNG)

3. Once selected, click "Install" to proceed with installation process.
![](../oc3.PNG)

4. You can verify the list of available operators by selecting "Installed Operator" section.
![](../oc4.PNG)

5. Select the Dell CSI Operator to get further description.
![](../oc5.PNG)

## Install CSI Drivers via Operator

**Steps**

1. Select the particular CSI driver which you want to install, as seen in step 5 above. In this example, CSI Unity is selected.
![](../driver1.PNG)

2. After clicking "Create CSIUnity" option in above snippet, you can set relevant parameters in your yaml file, as shown below.  Refer to the [driver install pages for the Dell CSI Operator](../../installation/operator/#install-csi-driver) for information on the parameters.
![](../driver2.PNG)

3. You can check the driver installed and node and controller pods running in the Pods section under Workloads.
![](../driver3.png)
