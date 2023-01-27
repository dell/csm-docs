---
title: "CSM Installation Wizard"
linkTitle: "CSM Installation Wizard"
description: Container Storage Modules Installation Wizard
weight: 1
---

The [Dell Container Storage Modules Installation Wizard](index.html) is a webpage which generates a manifest file for installing Dell CSI Drivers and its supported CSM Modules, based on the inputs from the user. It generates a single manifest file to install both Dell CSI Drivers and its supported CSM Modules, thereby eliminating the need to download the individual helm charts for driver and modules. User can enable or disable the necessary modules through the UI and a manifest file is generated accordingly, without manually editing the helm charts. 

>NOTE: CSM Installation Wizard currently supports Helm based manifest file generation only. 

## Supported Dell CSI Drivers

| CSI Driver         | Version   | 
| ------------------ | --------- | 
| CSI PowerStore     | 2.4.0 +   | 
| CSI PowerMax       | 2.4.0 +   | 

## Supported Dell CSM Modules

| CSM Modules          | Version   | 
| ---------------------| --------- | 
| CSM Authorization    | 1.4.0 +   | 
| CSM Observability    | 1.3.0 +   |
| CSM Replication      | 1.3.0 +   |
| CSM Resiliency       | 1.3.0 +   |
| Application Mobility | 0.1.0 +   |

## Installation

1. Open the [CSM Installation Wizard](index.html).
2. Select the `Array`.
3. Select the `Helm` as `Installation Type`.
4. Enter the `Image Repository`. Default is `dellemc`.
5. Select the `CSM Version`. 
6. Select the modules for installation. If there are module specific inputs, enter the values. 
7. If needed, modify `Controller Pods Count`.
8. If needed, select `Install Controller Pods on Control Plane` and/or `Install Node Pods on Control Plane`.
9. If Dell CSI Driver and Modules should be installed in same namespace, select `Single Namespace`.
10. Enter `Driver Namespace`. Default is `csi-<array>`.
11. Enter `Module Namespace`. Default is `csm-module`. 
12. Click on `Generate YAML`.
13. Manifest file `values.yaml` will be generated and downloaded. 
14. Follow the steps in `Run the following commands to install` section to install Dell CSI Driver and Modules using the generated manifest file. 



