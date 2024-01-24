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

kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.6.1/cert-manager.crds.yaml
```

3. Prepare `samples/authorization/config.yaml` provided [here](https://github.com/dell/csm-operator/blob/main/samples/authorization/config.yaml) which contains the JWT signing secret. The following table lists the configuration parameters.

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

4. Create the `karavi-storage-secret` using the file provided [here](https://github.com/dell/csm-operator/blob/main/samples/authorization/karavi-storage-secret.yaml) to store storage system credentials.

    Use this command to create the secret:

    ```bash

    kubectl create -f samples/authorization/karavi-storage-secret.yaml
    ```

### Install CSM Authorization Proxy Server

1. Follow all the [prerequisites](#prerequisite).

2. Create a CR (Custom Resource) for Authorization using the sample file provided [here](https://github.com/dell/csm-operator/blob/main/samples/authorization/csm_authorization_proxy_server_v170.yaml). This file can be modified to use custom parameters if needed.

3. Users should configure the parameters in the CR. This table lists the primary configurable parameters of the Authorization Proxy Server and their default values:

   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | **authorization** | This section configures the CSM-Authorization components. | - | - |
   | PROXY_HOST | The hostname to configure the self-signed certificate (if applicable), and the proxy service Ingress. | Yes | csm-authorization.com |
   | PROXY_INGRESS_CLASSNAME | The ingressClassName of the proxy-service Ingress. | Yes | nginx |
   | PROXY_INGRESS_HOSTS | Additional host rules to be applied to the proxy-service Ingress.  | No | authorization-ingress-nginx-controller.authorization.svc.cluster.local |
   | REDIS_STORAGE_CLASS | The storage class for Redis to use for persistence. If not supplied, a locally provisioned volume is used. | Yes | - |
   | **ingress-nginx** | This section configures the enablement of the NGINX Ingress Controller. | - | - |
   | enabled | Enable/Disable deployment of the NGINX Ingress Controller. Set to false if you already have an Ingress Controller installed. | No | true |
   | **cert-manager** | This section configures the enablement of cert-manager. | - | - |
   | enabled | Enable/Disable deployment of cert-manager. Set to false if you already have cert-manager installed. | No | true |

  >__Note__:  
  > - If you specify `REDIS_STORAGE_CLASS`, the storage class must NOT be provisioned by the Dell CSI Driver to be configured with this installation of CSM Authorization.

**Optional:**
To enable reporting of trace data with [Zipkin](https://zipkin.io/), use the `csm-config-params` configMap in the sample CR or dynamically by editing the configMap.

  Add the Zipkin values to the configMap where `ZIPKIN_ADDRESS` is the IP address or hostname of the Zipkin server.
  ```bash
  ZIPKIN_URI: "http://ZIPKIN_ADDRESS:9411/api/v2/spans"
  ZIPKIN_PROBABILITY: "1.0"
  ```

4. Execute this command to create the Authorization CR:

    ```bash
    
    kubectl create -f samples/authorization/csm_authorization_proxy_server_v190.yaml
    ```

  >__Note__:  
  > - This command will deploy the Authorization Proxy Server in the namespace specified in the input YAML file.

5. Create the `karavi-auth-tls` secret using your own certificate or by using a self-signed certificate generated via cert-manager. 

    If using your own certificate that is valid for each Ingress hostname, use this command to create the `karavi-auth-tls` secret:

    ```bash

    kubectl create secret tls karavi-auth-tls -n authorization --key <location-of-private-key-file> --cert <location-of-certificate-file>
    ```

    If using a self-signed certificate, prepare `samples/authorization/certificate_v190.yaml` provided [here](https://github.com/dell/csm-operator/blob/main/samples/authorization/certificate_v170.yaml). An entry for each hostname specified in the CR must be added under `dnsNames` for the certificate to be valid for each Ingress. 

    Use this command to create the `karavi-auth-tls` secret:

    ```bash
    kubectl create -f samples/authorization/certificate_v190.yaml
    ```

### Verify Installation of the CSM Authorization Proxy Server
Once the Authorization CR is created, you can verify the installation as mentioned below:

  ```bash
  kubectl describe csm/<name-of-custom-resource> -n <namespace>
  ```

### Install Karavictl

Follow the instructions available in CSM Authorization for [Installing karavictl](../../../../authorization/deployment/helm/#install-karavictl).

### Configuring the CSM Authorization Proxy Server

Follow the instructions available in CSM Authorization for [Configuring the CSM Authorization Proxy Server](../../../../authorization/configuration/proxy-server/#configuring-the-csm-authorization-proxy-server).

### Configuring a Dell CSI Driver with CSM Authorization

Follow the instructions available in CSM Authorization for [Configuring a Dell CSI Driver with CSM for Authorization](../../../../authorization/configuration/#configuring-a-dell-csi-driver-with-csm-for-authorization).
