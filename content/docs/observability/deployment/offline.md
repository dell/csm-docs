---
title: Offline Installer
linktitle: Offline Installer
weight: 3
description: >
  Dell EMC Container Storage Modules (CSM) for Observability Offline Installer
---

The following instructions can be followed when a Helm chart will be installed in an environment that does not have an internet connection and will be unable to download the Helm chart and related Docker images.

### Dependencies

Multiple Linux-based systems may be required to create and process an offline bundle for use.

* One Linux-based system, with internet access, will be used to create the bundle. This involves the user invoking a script that utilizes `docker` to pull and save container images to file.
* One Linux-based system, with access to an image registry, to invoke a script that uses `docker` to restore container images from file and push them to a registry

If one Linux system has both internet access and access to an internal registry, that system can be used for both steps.

Preparing an offline bundle requires the following utilities:

| Dependency            | Usage |
| --------------------- | ----- |
| `docker`   | `docker` will be used to pull images from public image registries, tag them, and push them to a private registry.<br>Required on both the system building the offline bundle as well as the system preparing for installation. <br>Tested version is `docker` 18.09

### Executing the Installer

To perform an offline installation of a Helm chart, the following steps should be performed:

1. Build an offline bundle.
2. Unpack the offline bundle and prepare for installation.
3. Perform a Helm installation.

### Build the Offline Bundle

1. Copy the `offline-installer.sh` script to a local Linux system using `curl` or `wget`:

    ```
    [user@anothersystem /home/user]# curl https://raw.githubusercontent.com/dell/karavi-observability/main/installer/offline-installer.sh --output offline-installer.sh
    ```

    or

    ```
    [user@anothersystem /home/user]# wget -O offline-installer.sh https://raw.githubusercontent.com/dell/karavi-observability/main/installer/offline-installer.sh
    ```

2. Set the file as executable.

    ```
    [user@anothersystem /home/user]# chmod +x offline-installer.sh
    ```

3. Build the bundle by providing the Helm chart name as the argument:

    ```
    [user@anothersystem /home/user]# ./offline-installer.sh -c dell/karavi-observability

    *
    * Adding Helm repository https://dell.github.io/helm-charts


    *
    * Downloading Helm chart dell/karavi-observability to directory /home/user/offline-karavi-observability-bundle/helm-original


    *
    * Downloading and saving Docker images

      dellemc/csm-topology:v0.3.0
      dellemc/csm-metrics-powerflex:v0.3.0
      otel/opentelemetry-collector:0.9.0
      nginxinc/nginx-unprivileged:1.18

    *
    * Compressing offline-karavi-observability-bundle.tar.gz
    ```

### Unpack the Offline Bundle

1. Copy the bundle file to another Linux system that has access to the internal Docker registry and that can install the Helm chart. From that Linux system, unpack the bundle.

    ```
    [user@anothersystem /home/user]# tar -xzf offline-karavi-observability-bundle.tar.gz
    ```

2. Change directory into the new directory created from unpacking the bundle:

    ```
    [user@anothersystem /home/user]# cd offline-karavi-observability-bundle
    ```

3. Prepare the bundle by providing the internal Docker registry URL.

    ```
    [user@anothersystem /home/user/offline-karavi-observability-bundle]# ./offline-installer.sh -p <my-registry>:5000
      
    *
    * Loading, tagging, and pushing Docker images to registry <my-registry>:5000/

      dellemc/csm-topology:v0.3.0 -> <my-registry>:5000/csm-topology:v0.3.0
      dellemc/csm-metrics-powerflex:v0.3.0 -> <my-registry>:5000/csm-metrics-powerflex:v0.3.0
      otel/opentelemetry-collector:0.9.0 -> <my-registry>:5000/opentelemetry-collector:0.9.0
      nginxinc/nginx-unprivileged:1.18 -> <my-registry>:5000/nginx-unprivileged:1.18
    ```

### Perform Helm installation

1. Change directory to `helm` which contains the updated Helm chart directory:
    ```
    [user@anothersystem /home/user/offline-karavi-observability-bundle]# cd helm
    ```

2. Install necessary cert-manager CustomResourceDefinitions provided:
    ```
    [user@anothersystem /home/user/offline-karavi-observability-bundle/helm]# kubectl apply --validate=false -f cert-manager.crds.yaml
    ```

3. Copy the CSI Driver Secret(s) 

    Copy the CSI Driver Secret from the namespace where CSI Driver is installed to the namespace where CSM for Observability is to be installed.

    CSI Driver for PowerFlex:
    ```
    [user@anothersystem /home/user/offline-karavi-observability-bundle/helm]# kubectl get secret vxflexos-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
    ```

    If [CSM for Authorization is enabled](../../../authorization/deployment/#configuring-a-dell-emc-csi-driver-with-csm-for-authorization) for CSI PowerFlex, perform the following steps:

    ```
    [user@anothersystem /home/user/offline-karavi-observability-bundle/helm]# kubectl get configmap vxflexos-config-params -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
    ```

    ```
    [user@anothersystem /home/user/offline-karavi-observability-bundle/helm]# kubectl get secret karavi-authorization-config proxy-server-root-certificate proxy-authz-tokens -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
    ```

    CSI Driver for PowerStore
    ```
    [user@anothersystem /home/user/offline-karavi-observability-bundle/helm]# kubectl get secret powerstore-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
    ```

4. Now that the required images have been made available and the Helm chart's configuration updated with references to the internal registry location, installation can proceed by following the instructions that are documented within the Helm chart's repository.

    **Note:** 
    - Optionally, you could provide your own [configurations](../helm/#configuration). A sample values.yaml file is located [here](https://github.com/dell/helm-charts/blob/main/charts/karavi-observability/values.yaml).
    - The default `values.yaml` is configured to deploy the CSM for Observability Topology service on install.
    - If CSM for Authorization is enabled for CSI PowerFlex, the `karaviMetricsPowerflex.authorization` parameters must be properly configured. 

    ```
    [user@anothersystem /home/user/offline-karavi-observability-bundle/helm]# helm install -n install-namespace app-name karavi-observability

    NAME: app-name
    LAST DEPLOYED: Fri Nov  6 08:48:13 2020
    NAMESPACE: install-namespace
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None

    ```
    