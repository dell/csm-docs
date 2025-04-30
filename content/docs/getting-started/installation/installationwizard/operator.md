---
title: "Installation Wizard Operator"
linkTitle: "Installation Wizard Operator"
description: Container Storage Modules Installation Wizard
weight: 1 
toc_hide: true
---
<br>

CSM Installation Wizard Support Matrix [Click Here](../../../../../../supportmatrix/#installation-wizard-compatibility-matrix)

<br>

The Container Storage Modules Installation Wizard is a webpage that helps you create a manifest file to install Dell CSI Drivers and CSM Modules. Users can enable or disable modules through the UI, and it generates a single manifest file, eliminating the need to download individual Helm charts for drivers and modules.

## Generate Manifest File

1. Open the [Installation Wizard](/csm-docs/docs/getting-started/installation/installationwizard/src/index.html).
2. Select the `Installation Type` as `Helm`/`Operator`.
3. Select the `Array`.
4. Enter the `Image Repository`. The default value is `dellemc`.
5. Select the `CSM Version`.
6. Select the modules for installation. If there are module specific inputs, enter their values.
7. If needed, modify the `Controller Pods Count`.
8. If needed, select `Install Controller Pods on Control Plane` and/or `Install Node Pods on Control Plane`.
9. Enter the `Namespace`. The default value is `csi-<array>`.
10. Click on `Generate YAML`.
11. A manifest file, `values.yaml` will be generated and downloaded.
12. A section `Run the following commands to install` will be displayed.
13. Run the commands displayed to install Dell CSI Driver and Modules using the generated manifest file.

## Installation Using Operator

**Steps**

>NOTE: Ensure that the csm-operator is installed and that the namespace, secrets, and `config.yaml` are created as prerequisites.

- Copy the downloaded `values.yaml` file.

- Look over all the fields in the generated `values.yaml` and fill in/adjust any as needed.

>NOTE: The CSM Installation Wizard generates `values.yaml` with the minimal inputs required to install the CSM. To configure additional parameters in values.yaml, you can follow the steps outlined in [CSI Driver](../../csmoperator#install-driver), [Resiliency](../../csmoperator/csm-modules/resiliency).

{{< hide id="1" >}}
- If Observability is checked in the wizard, refer to [Observability](../../csmoperator/csm-modules/observability) to export metrics to Prometheus and load the Grafana dashboards. 
{{< /hide >}}

{{< hide id="2" >}}
- If Authorization is checked in the wizard, only the sidecar is enabled. Refer to [Authorization](../../csmoperator/csm-modules/authorizationv2-0) to install and configure the CSM Authorization Proxy Server. 
{{< /hide >}}

{{< hide id="3">}}
- If Replication is checked in the wizard, refer to [Replication](../../csmoperator/csm-modules/replication) for the necessary prerequisites required for this module.
{{< /hide >}}

- Install the Operator.

On your terminal, run this command:

```bash
    kubectl create -f values.yaml
```
