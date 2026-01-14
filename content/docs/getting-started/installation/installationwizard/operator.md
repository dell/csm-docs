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

> NOTE:
> Starting from **CSM version 1.16**, users can utilize the **`version`** parameter (as defined in the `values.yaml` file) for both installation and upgrade. When using this parameter, there are two approaches:  
>  
- **ConfigMap Approach:**  
Create a ConfigMap specifying the required images and apply it to the operator’s namespace. The operator will pull and apply the images defined in the ConfigMap.  

   **NOTE:** If a ConfigMap is applied, it takes the highest precedence, and any other image source configuration (such as `customRegistry`) will not be used.  

   **Sample ConfigMap Configuration:**
   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
    name: csm-images
    namespace: dell-csm-operator
   data:
     versions.yaml: |
       - version: v1.16.0
         images:
           powerstore: quay.io/dell/container-storage-modules/csi-powerstore:v2.16.0
           powerflex: quay.io/dell/container-storage-modules/csi-vxflexos:v2.16.0
           isilon: quay.io/dell/container-storage-modules/csi-isilon:v2.16.0
           powermax: quay.io/dell/container-storage-modules/csi-powermax:v2.16.0
           karavi-authorization-proxy: quay.io/dell/container-storage-modules/csm-authorization-sidecar:v2.4.0
           podmon-controller: quay.io/dell/container-storage-modules/podmon:v1.15.0
           podmon-node: quay.io/dell/container-storage-modules/podmon:v1.15.0
           otel-collector: ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:0.142.0
           metrics-powermax: quay.io/dell/container-storage-modules/csm-metrics-powermax:v1.9.0
           metrics-powerstore: quay.io/dell/container-storage-modules/csm-metrics-powerstore:v1.14.0
           metrics-powerflex: quay.io/dell/container-storage-modules/csm-metrics-powerflex:v1.14.0
           metrics-powerscale: quay.io/dell/container-storage-modules/csm-metrics-powerscale:v1.11.0
           dell-csi-replicator: quay.io/dell/container-storage-modules/dell-csi-replicator:v1.14.0
           dell-replication-controller-manager: quay.io/dell/container-storage-modules/dell-replication-controller:v1.14.0
           csipowermax-reverseproxy: quay.io/dell/container-storage-modules/csipowermax-reverseproxy:v2.15.0
           sdc: quay.io/dell/storage/powerflex/sdc:5.0
           provisioner: registry.k8s.io/sig-storage/csi-provisioner:v6.1.0
           attacher: registry.k8s.io/sig-storage/csi-attacher:v4.10.0
           registrar: registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.14.0
           resizer: registry.k8s.io/sig-storage/csi-resizer:v2.0.0
           snapshotter: registry.k8s.io/sig-storage/csi-snapshotter:v8.4.0
           csi-metadata-retriever: quay.io/dell/container-storage-modules/csi-metadata-retriever:v1.11.0
           external-health-monitor: registry.k8s.io/sig-storage/csi-external-health-monitor-controller:v0.16.0
       - version: v1.15.0
         images:
           powerstore: quay.io/dell/container-storage-modules/csi-powerstore:v2.15.0
           powerflex: quay.io/dell/container-storage-modules/csi-vxflexos:v2.15.0
           isilon: quay.io/dell/container-storage-modules/csi-isilon:v2.15.0
           ....
       - version: v1.14.0
         images:
           powerstore: quay.io/dell/container-storage-modules/csi-powerstore:v2.14.0
           powerflex: quay.io/dell/container-storage-modules/csi-vxflexos:v2.14.0
           isilon: quay.io/dell/container-storage-modules/csi-isilon:v2.14.0
           ....
   ```
 
- **Custom Registry Approach:**  
Alternatively, you can specify `customRegistry` and `retainImageRegistryPath` in the configuration. In this case, images will be pulled from the custom registry while retaining the original image path structure.  

   - **customRegistry** –  When a user wants to pull all images from their own registry, they can set the customRegistry field in the CSM CR. All images will be pulled from this registry using the default names and paths.

   - **retainImageRegistryPath** – RetainImageRegistryPath is the boolean flag used to retain image registry path. This value is only used if customRegistry is set.   
      - When set to false and customRegistry set to my.artifactory-registry.example, a sample image pull be pulled from my.artifactory-registry.example/csi-vxflexos:v2.16.0 
      - When set to true and customRegistry set to my.artifactory-registry.example, a sample image pull be pulled from my.artifactory-registry.example/dell/container-storage-modules/csi-vxflexos:v2.16.0   

   **Sample CustomRegistry Configuration:**   
   ```yaml
   apiVersion: storage.dell.com/v1
   kind: ContainerStorageModule
   metadata:
     name: powerflex
     namespace: vxflexos
   spec:
     version: v1.16.0
     customRegistry: my.artifactory-registry.example
     retainImageRegistryPath: true
     # Add fields here
     driver:
       ....
   ```
**If neither approach is used, or if any images are not specified in the above approaches, the operator will default to pulling the standard images for drivers and modules.**

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
