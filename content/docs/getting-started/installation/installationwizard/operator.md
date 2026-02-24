---
title: "Installation Wizard Operator"
linkTitle: "Installation Wizard Operator"
description: Container Storage Modules Installation Wizard
weight: 1 
toc_hide: true
---

## Installation Wizard Overview

The Container Storage Modules Installation Wizard is a webpage that helps you create a manifest file to install Dell CSI Drivers and CSM Modules. Users can enable or disable modules through the UI, and it generates a single manifest file, eliminating the need to download individual Helm charts for drivers and modules.

## Complete Installation Flow

### Step 1: Generate Manifest File

1. **Open the [Installation Wizard](/csm-docs/docs/getting-started/installation/installationwizard/src/index.html)**
2. **Select Installation Type**: Choose `Helm` or `Operator`
3. **Select Your Array**: PowerStore, PowerMax, PowerFlex, PowerScale, or Unity
4. **Enter Image Repository**: Default is `dellemc` (or custom registry)
5. **Select CSM Version**: Choose your desired version
6. **Configure Modules**: Enable/disable modules and enter module-specific values
7. **Set Pod Configuration**: Adjust controller pod count and placement if needed
8. **Enter Namespace**: Default is `csi-<array>` (customize if desired)
9. **Generate YAML**: Click to create your manifest file
10. **Download values.yaml**: The wizard will download the generated file
11. **Copy Installation Commands**: The wizard displays commands to run

### Step 2: Prerequisites Setup

> **IMPORTANT**: Before proceeding, ensure you have:
- CSM Operator installed.
- Make sure all required namespaces, secrets, and the `config.yaml` file (if needed) are set up prior to driver installation.

### Step 3: Configure Your Manifest

1. **Review the downloaded `values.yaml` file**
2. **Fill in array-specific details** (endpoints, credentials, etc.)
3. **Adjust configuration parameters** as needed for your environment

> Note: Starting from **CSM version 1.16**, users can utilize the `spec.version` parameter for automatic image management. **No ConfigMap or custom registry configuration needed**. Images are automatically selected based on your version choice. For more details click on Advanced Image Configuration Options.

{{< collapse id="1" title="Advanced Image Configuration Options">}}

### Advanced Configuration.

Use these options only if you need to override standard behavior:

#### ConfigMap Approach
Create a `ConfigMap` that defines **all container images** for the CSM version being deployed, and apply it **before** creating the CR.

**Important**: ConfigMap takes precedence over all other settings.

**Certified OCP Example**: [OCP Example](https://github.com/dell/csm-operator/blob/main/samples/ocp/1.11.2/ocp_configmap.yaml)

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
           powermax: quay.io/dell/container-storage-modules/csi-powermax:v2.16.1
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
           csipowermax-reverseproxy: quay.io/dell/container-storage-modules/csipowermax-reverseproxy:v2.15.1
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
  Image `csi-vxflexos:v2.16.1` → `my.artifactory-registry.example/csi-vxflexos:v2.16.1`

- **true** - Preserve the full original image path  
  *Example*: `customRegistry=my.artifactory-registry.example`  
  Image `csi-vxflexos:v2.16.1` → `my.artifactory-registry.example/dell/container-storage-modules/csi-vxflexos:v2.16.1`

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

If upgrading via the version field fails, refer to the [Troubleshooting Guide](../../../../troubleshooting/csmoperator/). Should the problem continue, remove the existing resources and perform a fresh installation.

{{< /collapse >}}

### Step 4: Install CSM

1. **Apply the manifest**:
   ```bash
   kubectl create -f values.yaml
   ```

2. **Verify installation**:
   ```bash
   kubectl get csm -n <namespace>
   kubectl get pods -n <namespace>
   ```

{{< hide id="1" >}}
#### If Observability Module Enabled
- [Configure Prometheus metrics export](../../csmoperator/csm-modules/observability)
- [Load Grafana dashboards](../../csmoperator/csm-modules/observability)
{{< /hide >}}

{{< hide id="2" >}}
#### If Authorization Module Enabled
- [Install CSM Authorization Proxy Server](../../csmoperator/csm-modules/authorizationv2-0)
- [Configure authentication policies](../../csmoperator/csm-modules/authorizationv2-0)
{{< /hide >}}

{{< hide id="3" >}}
#### If Replication Module Enabled
- [Configure replication prerequisites](../../csmoperator/csm-modules/replication)
- [Set up disaster recovery](../../csmoperator/csm-modules/replication)
{{< /hide >}}

## Quick Reference

| Action | Command | Description |
|--------|---------|-------------|
| **Check CSM Status** | `kubectl get csm -n <namespace>` | Verify installation status |
| **Check Pods** | `kubectl get pods -n <namespace>` | Verify all pods are running |
| **Check Storage Classes** | `kubectl get sc` | Verify storage classes created |
| **View Logs** | `kubectl logs -n <namespace> <pod-name>` | Troubleshoot issues |

## Need Help?

- **[Troubleshooting Guide](../../../../troubleshooting/csmoperator/)** - Common issues and solutions
- **[Support Matrix](../../../../docs/supportmatrix/#installation-wizard-compatibility)** - Version compatibility
