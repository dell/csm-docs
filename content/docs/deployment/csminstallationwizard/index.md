---
title: "CSM Installation Wizard"
linkTitle: "CSM Installation Wizard"
description: Container Storage Modules Installation Wizard
weight: 1
---

The [Dell Container Storage Modules Installation Wizard](./src/index.html) is a webpage that generates a manifest file for installing Dell CSI Drivers and its supported CSM Modules, based on input from the user. It generates a single manifest file to install both Dell CSI Drivers and its supported CSM Modules, thereby eliminating the need to download individual Helm charts for drivers and modules. The user can enable or disable the necessary modules through the UI, and a manifest file is generated accordingly without manually editing the helm charts.

>NOTE: The CSM Installation Wizard currently supports Helm based manifest file generation only.

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

1. Open the [CSM Installation Wizard](./src/index.html).
2. Select the `Array`.
3. Select the `Installation Type` as `Helm`.
4. Enter the `Image Repository`. The default value is `dellemc`.
5. Select the `CSM Version`. 
6. Select the modules for installation. If there are module specific inputs, enter their values. 
7. If needed, modify the `Controller Pods Count`.
8. If needed, select `Install Controller Pods on Control Plane` and/or `Install Node Pods on Control Plane`.
9. Select `Single Namespace` if the Dell CSI Driver and Modules should be installed in the same namespace.
10. Enter the `Driver Namespace`. The default value is `csi-<array>`.
11. Enter the `Module Namespace`. The default value is `csm-module`. 
12. Click on `Generate YAML`.
13. A manifest file, `values.yaml` will be generated and downloaded. 
14. Follow the steps in `Run the following commands to install` section to install Dell CSI Driver and Modules using the generated manifest file. 

## Install Helm Chart

**Steps**

>> NOTE: Ensure that the namespaces and secrets are created before installing the Helm chart.

1. Add the Dell Helm Charts repository.

    On your terminal, run each of the commands below:

    ```terminal
    helm repo add dell https://dell.github.io/helm-charts
    helm repo update
    ```

2. Copy the downloaded values.yaml file. 

3. Look over all the fields in the generated `values.yaml` and fill in/adjust any as needed.

4. For the Observability module, please refer [Observability](../../observability/deployment/#post-installation-dependencies) to install the post installation dependencies.

5. If Authorization is enabled , please refer to [Authorization](../../authorization/deployment/helm/) for the installation and configuration of the Proxy Server.

>> NOTE: Only the Authorization sidecar is enabled by the CSM Installation Wizard. The Proxy Server has to be installed and configured separately.

6. If the Volume Snapshot feature is enabled, please refer to [Volume Snapshot for PowerStore](../../csidriver/installation/helm/powerstore/#optional-volume-snapshot-requirements) and [Volume Snapshot for PowerMax](../../csidriver/installation/helm/powermax/#optional-volume-snapshot-requirements) to install the Volume Snapshot CRDs and the default snapshot controller.

>> NOTE: The CSM Installation Wizard generates values.yaml with the minimal inputs required to install the CSM. To configure additional parameters in values.yaml, please follow the steps outlined in [PowerStore](../../csidriver/installation/helm/powerstore/#install-the-driver), [PowerMax](../../csidriver/installation/helm/powermax/#install-the-driver), [Observability](../../observability/), [Replication](../../replication/), [Resiliency](../../resiliency/), and [Application Mobility](../../applicationmobility/).

7. Install the Helm chart.

    On your terminal, run this command:

    ```terminal
    helm install container-storage-modules dell/container-storage-modules -f <values.yaml location>
    ```
