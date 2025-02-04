---
title: Authorization v2.0
linktitle: "Authorization v2.0"
description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization v2.0 Helm deployment
---

{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

CSM Authorization can be installed by using the provided Helm v3 charts on Kubernetes platforms.

The following CSM Authorization components are installed in the specified namespace:
- proxy-service, which forwards requests from the CSI Driver to the backend storage array
- tenant-service, which configures tenants, role bindings, and generates JSON Web Tokens
- role-service, which configures roles for tenants to be bound to
- storage-service, which configures backend storage arrays for the proxy-server to forward requests to

The following third-party components are installed in the specified namespace:
- redis, which stores data regarding tenants and their volume ownership, quota, and revokation status
- redis-commander, a web management tool for Redis

The following third-party components are optionally installed in the specified namespace:
- cert-manager, which optionally provides a self-signed certificate to configure the CSM Authorization Ingresses
- nginx-ingress-controller, which fulfills the CSM Authorization Ingresses

## Install CSM Authorization

**Steps**
1. [Install Vault or configure an existing Vault](../../../../csmoperator/modules/authorization-v2.0#vault-server-installation).
2. Create a namespace where you want to install CSM Authorization.
   ```bash
   kubectl create namespace authorization
   ```

3. Add the Dell Helm Charts repo
   ```bash
     helm repo add dell https://dell.github.io/helm-charts
   ```

4. Prepare `samples/csm-authorization/config.yaml` which contains the JWT signing secret. The following table lists the configuration parameters.

    | Parameter            | Description                         | Required | Default |
    | -------------------- | ----------------------------------- | -------- | ------- |
    | web.jwtsigningsecret | String used to sign JSON Web Tokens | true     | secret  | . |

    Example:

    ```yaml
    web:
      jwtsigningsecret: randomString123
    ```

    After editing the file, run the following command to create a secret called `karavi-config-secret`:

    ```bash

    kubectl create secret generic karavi-config-secret -n authorization --from-file=config.yaml=samples/csm-authorization/config.yaml
    ```

    Use the following command to replace or update the secret:

    ```bash

    kubectl create secret generic karavi-config-secret -n authorization --from-file=config.yaml=samples/csm-authorization/config.yaml -o yaml --dry-run=client | kubectl replace -f -
    ```

5. Copy the default values.yaml file `cp charts/csm-authorization-v2.0/values.yaml myvalues.yaml`

6. Look over all the fields in `myvalues.yaml` and fill in/adjust any as needed.

| Parameter                           | Description                                                                                                                          | Required | Default                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------- |
| openshift                           | Enable/Disable deployment of the OpenShift Ingress Operator. Set to false if you have an Ingress Controller installed.               | No       | true                                      |
| **nginx**                           | This section configures the enablement of the NGINX Ingress Controller.                                                              | -        | -                                         |
| enabled                             | Enable/Disable deployment of the NGINX Ingress Controller. Set to false if you have an Ingress Controller installed.                 | No       | true                                      |
| **cert-manager**                    | This section configures the enablement of cert-manager.                                                                              | -        | -                                         |
| enabled                             | Enable/Disable deployment of cert-manager. Set to false if you already have cert-manager installed.                                  | No       | true                                      |
| **authorization**                   | This section configures the CSM-Authorization components.                                                                            | -        | -                                         |
| images.proxyService                 | The image to use for the proxy-service.                                                                                              | Yes      | quay.io/dell/container-storage-modules/csm-authorization-proxy:nightly   |
| images.tenantService                | The image to use for the tenant-service.                                                                                             | Yes      | quay.io/dell/container-storage-modules/csm-authorization-tenant:nightly  |
| images.roleService                  | The image to use for the role-service.                                                                                               | Yes      | quay.io/dell/container-storage-modules/csm-authorization-proxy:nightly   |
| images.storageService               | The image to use for the storage-service.                                                                                            | Yes      | quay.io/dell/container-storage-modules/csm-authorization-storage:nightly |
| images.authorizationController      | The image to use for the controller.                                                                                                 | Yes      | quay.io/dell/container-storage-modules/csm-authorization-controller      |
| images.opa                          | The image to use for Open Policy Agent.                                                                                              | Yes      | openpolicyagent/opa                       |
| images.opaKubeMgmt                  | The image to use for Open Policy Agent kube-mgmt.                                                                                    | Yes      | openpolicyagent/kube-mgmt:8.5.8           |
| hostname                            | The hostname to configure the self-signed certificate (if applicable) and the proxy Ingress.                                         | Yes      | csm-authorization.com                     |
| logLevel                            | CSM Authorization log level. Allowed values: “error”, “warn”/“warning”, “info”, “debug”.                                             | Yes      | debug                                     |
| concurrentPowerFlexRequests         | Number of concurrent requests to PowerFlex. Used with dellctl to list tenant volumes.                                                | Yes      | 10                                        |
| concurrentPowerScaleRequests        | Number of concurrent requests to PowerScale. Used with dellctl to list tenant volumes.                                               | Yes      | 10                                        |
| zipkin.collectoruri                 | The URI of the Zipkin instance to export traces.                                                                                     | No       | -                                         |
| zipkin.probability                  | The ratio of traces to export.                                                                                                       | No       | -                                         |
| proxyServerIngress.ingressClassName | The ingressClassName of the proxy-service Ingress.                                                                                   | Yes      | -                                         |
| proxyServerIngress.hosts            | Additional host rules to be applied to the proxy-service Ingress.                                                                    | No       | -                                         |
| proxyServerIngress.annotations      | Additional annotations for the proxy-service Ingress.                                                                                | No       | -                                         |
| storageCapacityPollInterval         | Interval the storage-service uses to poll the backend array for tenant capacity.                                                     | Yes      | 5m                                        |
| **redis**                           | This section configures Redis.                                                                                                       | -        | -                                         |
| name                                | The prefix of the redis pods. The number of pods is determined by the number of replicas.                                            | Yes      | redis-csm                                 |
| sentinel                            | The prefix of the redis sentinel pods. The number of pods is determined by the number of replicas.                                   | Yes      | sentinel                                  |
| redisCommander                      | The prefix of the redis commander pod.                                                                                               | Yes      | rediscommander                            |
| replicas                            | The number of replicas for the sentinel and redis pods.                                                                              | Yes      | 5                                         |
| images.redis                        | The image to use for Redis.                                                                                                          | Yes      | redis:7.4.0-alpine                        |
| images.commander                    | The image to use for Redis Commander.                                                                                                | Yes      | rediscommander/redis-commander:latest     |
| **vault**                           | This section configures the vault components.                                                                                        | -        | -                                         |
| identifier                          | A name that is used to identify a vault instance.                                                                                    | Yes      | vault0                                    |
| address                             | The address where vault is hosted with the credentials to the array (`https://10.0.0.1:<port>`).                                     | Yes      | -                                         |
| role                                | The configured authentication role in vault.                                                                                         | Yes      | csm-authorization                         |
| skipCertificateValidation           | A boolean that enables/disables certificate validation to vault.                                                                     | Yes      | true                                      |
| clientCertificate                   | The base64-encoded certificate for the certificate/private-key pair to connect to Vault. Leave empty to use self-signed certificate. | No       | -                                         |
| clientKey                           | The base64-encoded private key for the certificate/private-key pair to connect to Vault. Leave empty to use self-signed certificate. | No       | -                                         |
| certificateAuthority                | The base64-encoded certificate authority for validating the Vault server.                                                            | No       | -                                         |


7. Install the driver using `helm`:

To install CSM Authorization with the service Ingresses using your own certificate, run:

```bash
helm -n authorization install authorization -f myvalues.yaml charts/csm-authorization-v2.0 \
--set-file authorization.certificate=<location-of-certificate-file> \
--set-file authorization.privateKey=<location-of-private-key-file>
```

To install CSM Authorization with the service Ingresses using a self-signed certificate generated via cert-manager, run:

```bash
helm -n authorization install authorization -f myvalues.yaml charts/csm-authorization-v2.0
```

## Install Dellctl

>__Note__: Karavictl will not work with Authorization v2.x. Please use dellctl instead.

Follow the instructions for [Installing dellctl](../../../../../support/cli/#installation-instructions).

## Configuring the CSM Authorization Proxy Server

Follow the instructions available in CSM Authorization for [Configuring the CSM Authorization Proxy Server](../../../../../authorization/v2.x/configuration/).

## Configuring a Dell CSI Driver with CSM for Authorization

Follow the instructions available in CSM Authorization for
- [Configuring PowerFlex with Authorization](../../../../../authorization/v2.x/configuration/powerflex).
- [Configuring PowerMax with Authorization](../../../../../authorization/v2.x/configuration/powermax).
- [Configuring PowerScale with Authorization](../../../../../authorization/v2.x/configuration/powerscale).

## Updating CSM for Authorization Proxy Server Configuration

CSM for Authorization has a subset of configuration parameters that can be updated dynamically:

| Parameter            | Type   | Default  | Description                        |
| -------------------- | ------ | -------- | ---------------------------------- |
| web.jwtsigningsecret | String | "secret" | The secret used to sign JWT tokens |

Updating configuration parameters can be done by editing the `karavi-config-secret`. The secret can be queried using k3s and kubectl like so:

```bash
kubectl -n authorization get secret/karavi-config-secret
```

To update parameters, you must edit the base64 encoded data in the secret. The` karavi-config-secret` data can be decoded like so:

```bash

kubectl -n authorization get secret/karavi-config-secret -o yaml | grep config.yaml | head -n 1 | awk '{print $2}' | base64 -d
```

Save the output to a file or copy it to an editor to make changes. Once you are done with the changes, you must encode the data to base64. If your changes are in a file, you can encode it like so:

```bash
cat <file> | base64
```

Copy the new, encoded data and edit the `karavi-config-secret` with the new data. Run this command to edit the secret:

```bash
kubectl -n karavi edit secret/karavi-config-secret
```

Replace the data in `config.yaml` under the `data` field with your new, encoded data. Save the changes and CSM Authorization will read the changed secret.

>__Note__: If you are updating the signing secret, the tenants need to be updated with new tokens via the `dellctl generate token` command.

## CSM for Authorization Proxy Server Dynamic Configuration Settings

Some settings are not stored in the `karavi-config-secret` but in the csm-config-params ConfigMap, such as LOG_LEVEL and LOG_FORMAT. To update the CSM Authorization logging settings during runtime, run the below command, make your changes, and save the updated configMap data.

```bash
kubectl -n authorization edit configmap/csm-config-params
```

This edit will not update the logging level for the sidecar-proxy containers running in the CSI Driver pods. To update the sidecar-proxy logging levels, you must update the associated CSI Driver ConfigMap in a similar fashion:

```bash

kubectl -n [CSM_CSI_DRVIER_NAMESPACE] edit configmap/<release_name>-config-params
```

Using PowerFlex as an example, `kubectl -n vxflexos edit configmap/vxflexos-config-params` can be used to update the logging level of the sidecar-proxy and the driver.
