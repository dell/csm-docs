---
title: "CSM Installation Wizard Operator"
linkTitle: "CSM Installation Wizard Operator"
description: Container Storage Modules Installation Wizard
weight: 1 
toc_hide: true
---
<br>

Dell CSM Installation Wizard Support Matrix [Click Here](../../../../../supportmatrix/#supported-dell-csi-drivers)

<br>

The Dell Container Storage Modules Installation Wizard is a webpage that helps you create a manifest file to install Dell CSI Drivers and CSM Modules. Users can enable or disable modules through the UI, and it generates a single manifest file, eliminating the need to download individual Helm charts for drivers and modules.

## Generate Manifest File

1. Open the [CSM Installation Wizard](./src/index.html).
2. Select the `Installation Type` as `Helm`/`Operator`.
3. Select the `Array`.
4. Enter the `Image Repository`. The default value is `dellemc`.
5. Select the `CSM Version`.
6. Select the modules for installation. If there are module specific inputs, enter their values.
7. If needed, modify the `Controller Pods Count`.
8. If needed, select `Install Controller Pods on Control Plane` and/or `Install Node Pods on Control Plane`.
9. Enter the `Namespace`. The default value is `csi-<array>`.
10. Click on `Generate YAML`.
13. A manifest file, `values.yaml` will be generated and downloaded.
14. A section `Run the following commands to install` will be displayed.
15. Run the commands displayed to install Dell CSI Driver and Modules using the generated manifest file.

## Installation Using Operator

**Steps**

>NOTE: Ensure that the csm-operator is installed and that the namespace, secrets, and `config.yaml` are created as prerequisites.

1. Copy the downloaded `values.yaml` file.

2. Look over all the fields in the generated `values.yaml` and fill in/adjust any as needed.

>NOTE: The CSM Installation Wizard generates `values.yaml` with the minimal inputs required to install the CSM. To configure additional parameters in values.yaml, you can follow the steps outlined in [PowerStore](../csmoperator/drivers/powerstore), [PowerMax](../csmoperator/drivers/powermax), [PowerScale](../csmoperator/drivers/powerscale), [Resiliency](../csmoperator/modules/resiliency).

3. If Observability is checked in the wizard, refer to [Observability](../csmoperator/modules/observability) to export metrics to Prometheus and load the Grafana dashboards.

4. If Authorization is checked in the wizard, only the sidecar is enabled. Refer to [Authorization](../csmoperator/modules/authorization-v2.0) to install and configure the CSM Authorization Proxy Server.

5. If Replication is checked in the wizard, refer to [Replication](../csmoperator/modules/replication) for the necessary prerequisites required for this module.

6. Install the Operator.

    On your terminal, run this command:

    ```terminal
    kubectl create -f values.yaml
    ```