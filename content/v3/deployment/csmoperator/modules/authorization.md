---
title: Authorization
linkTitle: "Authorization"
description: >
  Installing Authorization via Dell CSM Operator
---

{{% pageinfo color="primary" %}}
The CSM Authorization karavictl CLI is no longer actively maintained or supported. It will be deprecated in CSM 2.0.
{{% /pageinfo %}}

## Install CSM Authorization via Dell CSM Operator

The CSM Authorization module for supported Dell CSI Drivers can be installed via the Dell CSM Operator.
To deploy the Operator, follow the instructions available [here](../../#installation).

### Prerequisite

1. Execute `kubectl create namespace authorization` to create the authorization namespace (if not already present). Note that the namespace can be any user-defined name, in this example, we assume that the namespace is 'authorization'. 

2. Install cert-manager CRDs 
    ```bash
    kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.11.0/cert-manager.crds.yaml
    ```

3. Prepare [samples/authorization/config.yaml](https://github.com/dell/csm-operator/blob/main/samples/authorization/config.yaml) which contains the JWT signing secret. The following table lists the configuration parameters.

    | Parameter | Description                                                  | Required | Default |
    | --------- | ------------------------------------------------------------ | -------- | ------- |
    | web.jwtsigningsecret  | String used to sign JSON Web Tokens                       | true     | secret       |.

    Example:

    ```yaml
    web:
      jwtsigningsecret: randomString123
    ```

    After editing the file, run this command to create a secret called `karavi-config-secret`:
    
    ```bash

    kubectl create secret generic karavi-config-secret -n authorization --from-file=config.yaml=samples/authorization/config.yaml
    ```

    Use this command to replace or update the secret:

    ```bash
    
    kubectl create secret generic karavi-config-secret -n authorization --from-file=config.yaml=samples/authorization/config.yaml -o yaml --dry-run=client | kubectl replace -f -
    ```

4. Create the [karavi-storage-secret](https://github.com/dell/csm-operator/blob/main/samples/authorization/karavi-storage-secret.yaml) to store storage system credentials.

    Use this command to create the secret:

    ```bash

    kubectl create -f samples/authorization/karavi-storage-secret.yaml
    ```

>__Note__:  
> - If you are installing CSM Authorization in a different namespace than `authorization`, edit the `namespace` field in this file to your namespace.

### Install CSM Authorization Proxy Server

1. Follow all the [prerequisites](#prerequisite).

2. Create a CR (Custom Resource) for Authorization from a [sample manifest](https://github.com/dell/csm-operator/blob/main/samples/authorization/csm_authorization_proxy_server_v1110.yaml). This file can be modified to use custom parameters if needed.

3. Users should configure the parameters in the CR. This table lists the primary configurable parameters of the Authorization Proxy Server and their default values:

   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | openshift | For OpenShift Container Platform only: Enable/Disable use of the OpenShift Ingress Controller. Set to false if you already have an Ingress Controller installed. | No | False |
   | **nginx** | This section configures the enablement of the NGINX Ingress Controller. | - | - |
   | enabled | For Kubernetes Container Platform only: Enable/Disable deployment of the NGINX Ingress Controller. Set to false if you already have an Ingress Controller installed. | No | true |
   | **cert-manager** | This section configures the enablement of cert-manager. | - | - |
   | enabled | Enable/Disable deployment of cert-manager. Set to false if you already have cert-manager installed. | No | true |
   | **authorization** | This section configures the CSM-Authorization components. | - | - |
   | certificate | The base64-encoded certificate for the certificate/private-key to configure the proxy-service Ingress. Leave empty to use self-signed certificate. | No | - |
   | privateKey | The base64-encoded private key for the certificate/private-key to configure the proxy-service Ingress. Leave empty to use self-signed certificate. | No | - |
   | hostname | The hostname to configure the self-signed certificate (if applicable), and the proxy service Ingress. | No | csm-authorization.com |
   | proxyServerIngress.ingressClassName | The ingressClassName of the proxy-service Ingress. | Yes | nginx |
   | proxyServerIngress.hosts | Additional host rules to be applied to the proxy-service Ingress. | No | - |
   | proxyServerIngress.annotations | Additional annotations for the proxy-service Ingress. | No | - |
   | **redis** | This section configures the Redis components. | - | - |
   | storageclass | The storage class for Redis to use for persistence. If not supplied, a locally provisioned volume is used. | No | - |


>__Note__:  
> - If you are installing CSM Authorization in a different namespace than `authorization`, edit the `namespace` fields in this file to your namespace.
> - If you specify `storageclass`, the storage class must NOT be provisioned by the Dell CSI Driver to be configured with this installation of CSM Authorization. 

**Optional:**
To enable reporting of trace data with [Zipkin](https://zipkin.io/), use the `csm-config-params` configMap in the sample CR or dynamically by editing the configMap.

  Add the Zipkin values to the configMap where `ZIPKIN_ADDRESS` is the IP address or hostname of the Zipkin server.
  ```bash
  ZIPKIN_URI: "http://ZIPKIN_ADDRESS:9411/api/v2/spans"
  ZIPKIN_PROBABILITY: "1.0"
  ```

4. Execute this command to create the Authorization CR:

    ```bash
    
    kubectl create -f <SAMPLE FILE>
    ```

  >__Note__:  
  > - This command will deploy the Authorization Proxy Server in the namespace specified in the input YAML file.

### Verify Installation of the CSM Authorization Proxy Server
Once the Authorization CR is created, you can verify the installation as mentioned below:

  ```bash
  kubectl describe csm/<name-of-custom-resource> -n authorization
  ```

### Install Karavictl

Follow the instructions available in CSM Authorization for [Installing karavictl](../../../helm/modules/installation/authorization/#install-karavictl).

### Configure the CSM Authorization Proxy Server

**Authorization v1.x GA**

Follow the instructions available in CSM Authorization for [Configuring the CSM Authorization Proxy Server](../../../helm/modules/installation/authorization/#configuring-the-csm-authorization-proxy-server).


### Configure a Dell CSI Driver with CSM Authorization

**Authorization v1.x GA**

Follow the instructions available in CSM Authorization for [Configuring a Dell CSI Driver with CSM for Authorization](../../../helm/modules/installation/authorization/#configuring-a-dell-csi-driver-with-csm-for-authorization).

## Upgrade CSM Authorization

This section outlines the upgrade steps for Container Storage Modules (CSM) for Authorization. The upgrade of CSM for Authorization is handled in 2 parts:
1) Upgrading the Authorization proxy server
2) Upgrading CSI Driver, Authorization sidecar with Authorization module enabled


### Upgrading the Authorization Proxy Server

  1.  Modifying the existing Authorization Proxy Server installation directly via `kubectl edit`
  
      ```bash
      kubectl get csm -n <module-namespace>
      ```

      For example - If the Authorization Proxy Server is installed in authorization namespace then run this command to get the object name

      ```bash
      kubectl get csm -n authorization
      ```

      use the object name in `kubectl edit` command.

      ```bash
      kubectl edit csm <object-name> -n <module-namespace>
      ```

      For example - If the object name is authorization then use the name as authorization and if the namespace is authorization, then run this command to edit the object

      ```bash
      kubectl edit csm authorization -n authorization
      ```

  2.  Modify the installation

      - Update the CSM Authorization Proxy Server configVersion  
      - Update the images for proxyService, tenantService, roleService and storageService


### Upgrading CSI Driver, Authorization sidecar with Authorization module enabled

  1.  Modifying the existing driver and module installation directly via `kubectl edit`

      ```bash
      kubectl get csm -n <driver-namespace>
      ```

      For example - If the CSI PowerFlex driver is installed in vxflexos namespace then run this command to get the object name

      ```bash
      kubectl get csm -n vxflexos
      ```
      use the object name in `kubectl edit` command.

      ```bash
      kubectl edit csm <object-name> -n <driver-namespace>
      ```
      For example - If the object name is vxflexos then use the name as vxflexos and if the driver is installed in vxflexos namespace, then run this command to edit the object

      ```bash
      kubectl edit csm vxflexos -n vxflexos
      ```

  2.  Modify the installation

      - Update the driver config version and image tag
      - Update the Authorization config version and karavi-authorization-proxy image.

>__Note__: 
> - In Authorization module upgrade, only `n-1` to `n` upgrade is supported, e.g. if the current observability version is `v1.8.x`, it can be upgraded to `1.9.x`.

