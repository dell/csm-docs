---
title: "ConfigMap And CustomRegistry Configuration"
linktitle: "ConfigMap And CustomRegistry Configuration"
no_list: true
description:
toc_hide: true
weight: 2
---

> **NOTE**: Starting from **CSM version 1.16**, users can utilize the `spec.version` parameter for automatic image management. **No ConfigMap or custom registry configuration needed**.

### Advanced Configuration

Use these options only if you need to override standard behavior:

#### ConfigMap Approach
Create a `ConfigMap` that defines **all container images** for the CSM version being deployed, and apply it **before** creating the CR.

**Important**: ConfigMap takes precedence over all other settings.

**Certified OCP Example**: [OCP Example](https://github.com/dell/csm-operator/tree/main/samples/ocp/v1.11.0/ocp_configmap.yaml)

**Example for upstream k8s and OCP environments.**:
 ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
    name: csm-images
    namespace: dell-csm-operator
   data:
     versions.yaml: |
       - version: {{< version-docs key="CSM_latestVersion" >}}
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
           opa-kube-mgmt: docker.io/openpolicyagent/kube-mgmt:9.3.0
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

#### Custom Registry Approach
Add `customRegistry` and `retainImageRegistryPath` to your CR:

**Configuration Parameters**
- **customRegistry** – Override the default image registry by specifying your custom registry FQDN. When set, all images are pulled from your registry using their default image names and paths.
- **retainImageRegistryPath** – Control whether to preserve the original image path structure when using a custom registry. This parameter only applies when `customRegistry` is set.

**retainImageRegistryPath Options:**
- **false** (Default) - Only the registry hostname is replaced  
  *Example*: `customRegistry=my.artifactory-registry.example`  
  Image `csi-vxflexos:v2.16.0` → `my.artifactory-registry.example/csi-vxflexos:v2.16.0`

- **true** - Preserve the full original image path  
  *Example*: `customRegistry=my.artifactory-registry.example`  
  Image `csi-vxflexos:v2.16.0` → `my.artifactory-registry.example/dell/container-storage-modules/csi-vxflexos:v2.16.0`

**Important Requirements:**
- Custom registry must be a **Fully Qualified Domain Name (FQDN)**
- **No nested paths or folder structures** allowed
- **Mirror all required images** to your custom registry before installation

```yaml
apiVersion: storage.dell.com/v1
kind: ContainerStorageModule
metadata:
  name: powerflex
  namespace: vxflexos
spec:
  version: {{< version-docs key="CSM_latestVersion" >}}
  customRegistry: my.artifactory-registry.example
  retainImageRegistryPath: false
  driver:
    # ... driver configuration
```

**Priority Order**: ConfigMap (highest) → Custom Registry → Default Images (`spec.version`)

If neither configuration method is provided, the operator automatically defaults to the image set associated with the relevant drivers and modules. For offline environments, users must supply either a `ConfigMap` or a `customRegistry`.

>NOTE: If the upgrade using the version field fails, consult the [Operator Troubleshooting Guide](../troubleshooting/csmoperator/). If the issue persists, uninstall the existing resources and proceed with a fresh installation.
