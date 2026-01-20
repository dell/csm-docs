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
Create a ConfigMap specifying the required images and apply it to the operator’s namespace prior applying the CR. The operator will pull and apply the images defined in the ConfigMap.  

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
           podmon: quay.io/dell/container-storage-modules/podmon:v1.15.0
           otel-collector: ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:0.142.0
           nginx-proxy : quay.io/nginx/nginx-unprivileged:1.27
           metrics-powermax: quay.io/dell/container-storage-modules/csm-metrics-powermax:v1.9.0
           metrics-powerstore: quay.io/dell/container-storage-modules/csm-metrics-powerstore:v1.14.0
           metrics-powerflex: quay.io/dell/container-storage-modules/csm-metrics-powerflex:v1.14.0
           metrics-powerscale: quay.io/dell/container-storage-modules/csm-metrics-powerscale:v1.11.0
           dell-csi-replicator: quay.io/dell/container-storage-modules/dell-csi-replicator:v1.14.0
           dell-replication-controller-manager: quay.io/dell/container-storage-modules/dell-replication-controller:v1.14.0
           csipowermax-reverseproxy: quay.io/dell/container-storage-modules/csipowermax-reverseproxy:v2.15.0
           sdc: quay.io/dell/storage/powerflex/sdc:5.0
           sdc-monitor: quay.io/dell/storage/powerflex/sdc:5.0
           provisioner: registry.k8s.io/sig-storage/csi-provisioner:v6.1.0
           attacher: registry.k8s.io/sig-storage/csi-attacher:v4.10.0
           registrar: registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.14.0
           resizer: registry.k8s.io/sig-storage/csi-resizer:v2.0.0
           snapshotter: registry.k8s.io/sig-storage/csi-snapshotter:v8.4.0
           csi-metadata-retriever: quay.io/dell/container-storage-modules/csi-metadata-retriever:v1.11.0
           external-health-monitor: registry.k8s.io/sig-storage/csi-external-health-monitor-controller:v0.16.0
           cert-manager-cainjector: quay.io/jetstack/cert-manager-cainjector:v1.11.0
           cert-manager-controller: quay.io/jetstack/cert-manager-controller:v1.11.0
           cert-manager-webhook: quay.io/jetstack/cert-manager-webhook:v1.11.0
           proxy-service: quay.io/dell/container-storage-modules/csm-authorization-proxy:v2.4.0
           tenant-service: quay.io/dell/container-storage-modules/csm-authorization-tenant:v2.4.0
           role-service: quay.io/dell/container-storage-modules/csm-authorization-role:v2.4.0
           storage-service: quay.io/dell/container-storage-modules/csm-authorization-storage:v2.4.0
           opa: docker.io/openpolicyagent/opa:0.70.0
           opa-kube-mgmt: docker.io/openpolicyagent/kube-mgmt:8.5.11
           authorization-controller: quay.io/dell/container-storage-modules/csm-authorization-controller:v2.4.0
           redis: redis:8.2.0-alpine
           commander: docker.io/rediscommander/redis-commander:latest
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
Alternatively, you can specify `customRegistry` and `retainImageRegistryPath` in the configuration. The custom registry approach allows you to redirect all container image pulls to a registry of your choice while optionally preserving the original image path structure. This is useful in environments where images must be sourced from a private or enterprise-approved registry. If users want to use custom registry they must mirror all required images into the custom registry prior to upgrade.

   - **customRegistry** –  The customRegistry field in the CSM Custom Resource (CR) enables administrators to override the default image registry. When specified, all images are pulled from the custom registry using their default image names and paths, unless otherwise modified by additional configuration.

   - **retainImageRegistryPath** – The retainImageRegistryPath field is a boolean flag that determines whether the original image path structure should be preserved when using a custom registry. This parameter is only evaluated when customRegistry is set.

      - retainImageRegistryPath: **false**  
          When set to false, only the registry hostname is replaced. For example, with customRegistry=my.artifactory-registry.example, an image such as csi-vxflexos:v2.16.0 will be pulled from `my.artifactory-registry.example/csi-vxflexos:v2.16.0`.
      - retainImageRegistryPath: **true**  
          When set to true, the full original image path under the registry is retained. For example, with customRegistry=my.artifactory-registry.example, the same image will be pulled from `my.artifactory-registry.example/dell/container-storage-modules/csi-vxflexos:v2.16.0`. <br><br>

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
     retainImageRegistryPath: false
     # Add fields here
     driver:
       ....
   ```
**If neither approach is used, or if any images are not specified in the above approaches, the operator will default to pulling the standard images for drivers and modules. In case the environment is offline, the user should use either a ConfigMap or customRegistry.**

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
