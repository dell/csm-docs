---
title: Offline Installer for Observability
linktitle: Observability
weight: 3
description: >
  Dell Container Storage Modules (CSM) for Observability Offline Installer
---
{{% pageinfo color="primary" %}}
{{< message text="3" >}}
{{% /pageinfo %}}
The following instructions can be followed when a Helm chart will be installed in an environment that does not have an Internet connection and will be unable to download the Helm chart and related Docker images.

## Prerequisites

- Helm 3.x
- The deployment of one or more Dell CSI drivers

### Dependencies

Multiple Linux-based systems may be required to create and process an offline bundle for use.

* One Linux-based system, with Internet access, will be used to create the bundle. This involves the user invoking a script that utilizes `docker` to pull and save container images to file.
* One Linux-based system, with access to an image registry, to invoke a script that uses `docker` to restore container images from file and push them to a registry

If one Linux system has both Internet access and access to an internal registry, that system can be used for both steps.

Preparing an offline bundle requires the following utilities:

| Dependency | Usage                                                                                                                                                                                                                                                                |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `docker`   | `docker` will be used to pull images from public image registries, tag them, and push them to a private registry.<br>Required on both the system building the offline bundle as well as the system preparing for installation. <br>Tested version is `docker` 18.09+ |

### Executing the Installer

To perform an offline installation of a Helm chart, the following steps should be performed:

1. Build an offline bundle.
2. Unpack the offline bundle and prepare for installation.
3. Perform a Helm installation.

### Build the Offline Bundle

1. Copy the `offline-installer.sh` script to a local Linux system using `curl` or `wget`:

    ```bash

    curl https://raw.githubusercontent.com/dell/karavi-observability/main/installer/offline-installer.sh --output offline-installer.sh
    ```

    or

    ```bash

    wget -O offline-installer.sh https://raw.githubusercontent.com/dell/karavi-observability/main/installer/offline-installer.sh
    ```

2. Set the file as executable.

    ```bash
    chmod +x offline-installer.sh
    ```

3. Build the bundle by providing the Helm chart name as the argument. Below is a sample output that may be different on your machine.

    ```bash
    ./offline-installer.sh -c dell/karavi-observability
    ```
    ```
    *
    * Adding Helm repository https://dell.github.io/helm-charts


    *
    * Downloading Helm chart dell/karavi-observability to directory /home/user/offline-karavi-observability-bundle/helm-original


    *
    * Downloading and saving Docker images

      quay.io/dell/container-storage-modules/csm-topology:{{< version-docs key="Observability_csm_topology_image" >}}
      quay.io/dell/container-storage-modules/csm-metrics-powerflex:{{< version-docs key="Observability_csm_metrics_PFlex_image" >}}
      quay.io/dell/container-storage-modules/csm-metrics-powerstore:{{< version-docs key="Observability_csm_metrics_PStore_image" >}}
      quay.io/dell/container-storage-modules/csm-metrics-powerscale:{{< version-docs key="Observability_csm_metrics_PScale_image" >}}
      quay.io/dell/container-storage-modules/csm-metrics-powermax:{{< version-docs key="Observability_csm_metrics_PMax_image" >}}
      ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:{{< version-docs key="opentelemetry_collector_latest_version" >}}
      nginxinc/nginx-unprivileged:1.27

    *
    * Compressing offline-karavi-observability-bundle.tar.gz
    ```

### Unpack the Offline Bundle

1. Copy the bundle file to another Linux system that has access to the internal Docker registry and that can install the Helm chart. From that Linux system, unpack the bundle.

    ```bash
    tar -xzf offline-karavi-observability-bundle.tar.gz
    ```

2. Change directory into the new directory created from unpacking the bundle:

    ```bash
    cd offline-karavi-observability-bundle
    ```

3. Prepare the bundle by providing the internal Docker registry URL. Below is a sample output that may be different on your machine.

    ```bash
    ./offline-installer.sh -p <my-registry>:5000
    ```

    ```bash
    *
    * Loading, tagging, and pushing Docker images to registry <my-registry>:5000/

      quay.io/dell/container-storage-modules/csm-topology:{{< version-docs key="Observability_csm_topology_image" >}} -> <my-registry>:5000/csm-topology:{{< version-docs key="Observability_csm_topology_image" >}}
      quay.io/dell/container-storage-modules/csm-metrics-powerflex:{{< version-docs key="Observability_csm_metrics_PFlex_image" >}} -> <my-registry>:5000/csm-metrics-powerflex:{{< version-docs key="Observability_csm_metrics_PFlex_image" >}}
      quay.io/dell/container-storage-modules/csm-metrics-powerstore:{{< version-docs key="Observability_csm_metrics_PStore_image" >}} -> <my-registry>:5000/csm-metrics-powerstore:{{< version-docs key="Observability_csm_metrics_PStore_image" >}}
      quay.io/dell/container-storage-modules/csm-metrics-powerscale:{{< version-docs key="Observability_csm_metrics_PScale_image" >}} -> <my-registry>:5000/csm-metrics-powerscale:{{< version-docs key="Observability_csm_metrics_PScale_image" >}}
      quay.io/dell/container-storage-modules/csm-metrics-powermax:{{< version-docs key="Observability_csm_metrics_PMax_image" >}} -> <my-registry>:5000/csm-metrics-powermax:{{< version-docs key="Observability_csm_metrics_PMax_image" >}}
      ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:{{< version-docs key="opentelemetry_collector_latest_version" >}} -> <my-registry>:5000/opentelemetry-collector:{{< version-docs key="opentelemetry_collector_latest_version" >}}
      nginxinc/nginx-unprivileged:1.27 -> <my-registry>:5000/nginx-unprivileged:1.27
    ```

### Perform Helm installation

1. Change directory to `helm` which contains the updated Helm chart directory:
    ```bash
    cd helm
    ```

2. Install necessary cert-manager CustomResourceDefinitions provided:
    ```bash
    kubectl apply --validate=false -f cert-manager.crds.yaml
    ```

3. Copy the CSI Driver Secret(s)

    Copy the CSI Driver Secret from the namespace where CSI Driver is installed to the namespace where CSM for Observability is to be installed.

{{< hide id="1">}}
__CSI Driver for PowerFlex:__
```bash

kubectl get secret vxflexos-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

If the CSI driver secret name is not the default `vxflexos-config`, please use the following command to copy secret:

```bash

kubectl get secret [VXFLEXOS-CONFIG] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [VXFLEXOS-CONFIG]/name: vxflexos-config/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

If [CSM for Authorization is enabled](docs/getting-started/installation/kubernetes/{{Var}}/helm/csm-modules/authorizationv2-0/#configuring-a-dell-csi-driver-with-container-storage-module-for-authorization)  for CSI PowerFlex, perform these steps:

```bash

kubectl get configmap vxflexos-config-params -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

If the CSI driver configmap name is not the default `vxflexos-config-params`, please use the following command to copy configmap:

```bash

kubectl get configmap [VXFLEXOS-CONFIG-PARAMS] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [VXFLEXOS-CONFIG-PARAMS]/name: vxflexos-config-params/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

```bash

kubectl get secret karavi-authorization-config proxy-server-root-certificate proxy-authz-tokens -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```
{{< /hide >}}

{{< hide id="2">}}

__CSI Driver for PowerStore:__
```bash

kubectl get secret powerstore-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

If the CSI driver secret name is not the default `powerstore-config`, please use the following command to copy secret:
```bash

kubectl get secret [POWERSTORE-CONFIG] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [POWERSTORE-CONFIG]/name: powerstore-config/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```
    {{< /hide >}}

    {{< hide id="3">}}
__CSI Driver for PowerScale:__
```bash

kubectl get secret isilon-creds -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

If the CSI driver secret name is not the default `isilon-creds`, please use the following command to copy secret:
```bash

kubectl get secret [ISILON-CREDS] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [ISILON-CREDS]/name: isilon-creds/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

If [CSM for Authorization is enabled](docs/getting-started/installation/kubernetes/{{Var}}/helm/csm-modules/authorizationv2-0/#configuring-a-dell-csi-driver-with-container-storage-module-for-authorization) for CSI PowerScale, perform these steps:

```bash

kubectl get configmap isilon-config-params -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

If the CSI driver configmap name is not the default `isilon-config-params`, please use the following command to copy configmap:

```bash

kubectl get configmap [ISILON-CONFIG-PARAMS] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [ISILON-CONFIG-PARAMS]/name: isilon-config-params/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

```bash

kubectl get secret karavi-authorization-config proxy-server-root-certificate proxy-authz-tokens -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | sed 's/name: karavi-authorization-config/name: isilon-karavi-authorization-config/' | sed 's/name: proxy-server-root-certificate/name: isilon-proxy-server-root-certificate/' | sed 's/name: proxy-authz-tokens/name: isilon-proxy-authz-tokens/' | kubectl create -f -
```
{{< /hide >}}
{{< hide id="4">}}

__CSI Driver for PowerMax:__

Copy the configmap from the CSI Driver for Dell PowerMax namespace to the CSM namespace.
```bash

kubectl get configmap powermax-reverseproxy-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

If the CSI driver configmap name is not the default `powermax-reverseproxy-config`, please use the following command to copy configmap:
```bash

kubectl get configmap [POWERMAX-REVERSEPROXY-CONFIG] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [POWERMAX-REVERSEPROXY-CONFIG]/name: powermax-reverseproxy-config/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

Copy the secrets from the CSI Driver for Dell PowerMax namespace to the CSM namespace.
```bash

for secret in $(kubectl get configmap powermax-reverseproxy-config -n [CSI_DRIVER_NAMESPACE] -o jsonpath="{.data.config\.yaml}" | grep arrayCredentialSecret | awk 'BEGIN{FS=":"}{print $2}' | uniq)
do
    kubectl get secret $secret -n [CSI_DRIVER_NAMESPACE] -o yaml | sed "s/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/" | kubectl create -f -
done
```

If the CSI driver configmap name is not the default `powermax-reverseproxy-config`, please use the following command to copy secrets:
```console

for secret in $(kubectl get configmap [POWERMAX-REVERSEPROXY-CONFIG] -n [CSI_DRIVER_NAMESPACE] -o jsonpath="{.data.config\.yaml}" | grep arrayCredentialSecret | awk 'BEGIN{FS=":"}{print $2}' | uniq)
do
    kubectl get secret $secret -n [CSI_DRIVER_NAMESPACE] -o yaml | sed "s/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/" | kubectl create -f -
done
```

If [CSM for Authorization is enabled](docs/getting-started/installation/kubernetes/{{Var}}/helm/csm-modules/authorizationv2-0/#configuring-a-dell-csi-driver-with-container-storage-module-for-authorization) for CSI PowerMax, perform these steps:

```bash

kubectl get configmap powermax-config-params -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

If the CSI driver configmap name is not the default `powermax-config-params`, use the following command to copy the configmap:

```bash

kubectl get configmap [POWERMAX-CONFIG-PARAMS] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [POWERMAX-CONFIG-PARAMS]/name: powermax-config-params/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

```bash

kubectl get secret karavi-authorization-config proxy-server-root-certificate proxy-authz-tokens -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | sed 's/name: karavi-authorization-config/name: powermax-karavi-authorization-config/' | sed 's/name: proxy-server-root-certificate/name: powermax-proxy-server-root-certificate/' | sed 's/name: proxy-authz-tokens/name: powermax-proxy-authz-tokens/' | kubectl create -f -
```
{{< /hide >}}

4. After the images have been made available and the Helm chart configuration is updated, follow the instructions within the Helm chart's repository to complete the installation.

    **Note:**
    - Optionally, you could provide your own configurations. A sample values.yaml file is located [here](https://github.com/dell/helm-charts/blob/main/charts/karavi-observability/values.yaml).
  {{< hide id="0" >}}- The default `values.yaml` is configured to deploy the CSM for Observability Topology service on install.{{< /hide >}}
  {{< hide id="5" >}}- If CSM for Authorization is enabled for CSI PowerFlex, the `karaviMetricsPowerflex.authorization` parameters must be properly configured.{{< /hide >}}
  {{< hide id="6" >}}- If CSM for Authorization is enabled for CSI PowerScale, the `karaviMetricsPowerscale.authorization` parameters must be properly configured.{{< /hide >}}
  {{< hide id="7" >}}- If CSM for Authorization is enabled for CSI PowerMax, the `karaviMetricsPowerMax.authorization` parameters must be properly configured.{{< /hide >}}

    ```bash
    helm install -n install-namespace app-name karavi-observability

    NAME: app-name
    LAST DEPLOYED: Fri Nov  6 08:48:13 2020
    NAMESPACE: install-namespace
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    ```
