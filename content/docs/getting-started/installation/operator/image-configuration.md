---
title: "ConfigMap And CustomRegistry Configuration"
linktitle: "ConfigMap And CustomRegistry Configuration"
no_list: true
description:
toc_hide: true
weight: 2
---
> Starting from **CSM version 1.16**, users can utilize the **`spec.version`** parameter (as defined in the `sample.yaml` file) for both installation and upgrade. When using this parameter, there are two approaches:
>
- **ConfigMap Approach:**
Create a ConfigMap specifying the required images and apply it to the operator’s namespace prior applying the CR. The operator will pull and apply the images defined in the ConfigMap.

>NOTE: When a ConfigMap is applied, it takes precedence over all other settings. Any alternative image source configuration, such as custom registry, will be ignored.

   **Sample ConfigMap Configuration:**
   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
    name: csm-images
    namespace: dell-csm-operator
   data:
     versions.yaml: |
       - version: v1.16.1
         images:
           powerstore: quay.io/dell/container-storage-modules/csi-powerstore:v2.16.0
           powerflex: quay.io/dell/container-storage-modules/csi-vxflexos:v2.16.0
           isilon: quay.io/dell/container-storage-modules/csi-isilon:v2.16.0
           powermax: quay.io/dell/container-storage-modules/csi-powermax:v2.16.0
           karavi-authorization-proxy: quay.io/dell/container-storage-modules/csm-authorization-sidecar:v2.4.0
           podmon: quay.io/dell/container-storage-modules/podmon:v1.15.0
           otel-collector: ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:0.143.1
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
           registrar: registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.15.0
           resizer: registry.k8s.io/sig-storage/csi-resizer:v2.0.0
           snapshotter: registry.k8s.io/sig-storage/csi-snapshotter:v8.4.0
           csi-metadata-retriever: quay.io/dell/container-storage-modules/csi-metadata-retriever:v1.13.0
           external-health-monitor: registry.k8s.io/sig-storage/csi-external-health-monitor-controller:v0.16.0
           cert-manager-cainjector: quay.io/jetstack/cert-manager-cainjector:v1.11.0
           cert-manager-controller: quay.io/jetstack/cert-manager-controller:v1.11.0
           cert-manager-webhook: quay.io/jetstack/cert-manager-webhook:v1.11.0
           proxy-service: quay.io/dell/container-storage-modules/csm-authorization-proxy:v2.4.0
           tenant-service: quay.io/dell/container-storage-modules/csm-authorization-tenant:v2.4.0
           role-service: quay.io/dell/container-storage-modules/csm-authorization-role:v2.4.0
           storage-service: quay.io/dell/container-storage-modules/csm-authorization-storage:v2.4.0
           opa: docker.io/openpolicyagent/opa:0.70.0
           opa-kube-mgmt: docker.io/openpolicyagent/kube-mgmt:9.2.1
           authorization-controller: quay.io/dell/container-storage-modules/csm-authorization-controller:v2.4.0
           redis: redis:8.4.0-alpine
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
          When set to true, the full original image path under the registry is retained. For example, with customRegistry=my.artifactory-registry.example, the same image will be pulled from `my.artifactory-registry.example/dell/container-storage-modules/csi-vxflexos:v2.16.0`.

>NOTE: The custom registry value must be Fully Qualified Domain Name (FQDN) and must not include any nested path or folder structure.
>For example: my.artifactory-registry.example

   **Sample CustomRegistry Configuration:**
   ```yaml
   apiVersion: storage.dell.com/v1
   kind: ContainerStorageModule
   metadata:
     name: powerflex
     namespace: vxflexos
   spec:
     version: v1.16.1
     customRegistry: my.artifactory-registry.example
     retainImageRegistryPath: false
     # Add fields here
     driver:
       ....
   ```
**If neither method is configured, the operator automatically falls back to using the default image set associated with the corresponding drivers and modules. In case the environment is offline, the user should use either a ConfigMap or customRegistry.**

>NOTE: If the upgrade using the version field fails, consult the [Operator Troubleshooting Guide](../troubleshooting/csmoperator/). If the issue persists, uninstall the existing resources and proceed with a fresh installation.