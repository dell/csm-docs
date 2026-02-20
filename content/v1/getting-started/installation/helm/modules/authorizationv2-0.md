---
title: Authorization v2.0
linktitle: "Authorization v2.0"
description: >
 Container Storage Modules (CSM) for Authorization v2.0 Helm deployment
---

{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

Authorization can be installed by using the provided Helm v3 charts on Kubernetes platforms.

The following Authorization components are installed in the specified namespace:
- proxy-service, which forwards requests from the CSI Driver to the backend storage array
- tenant-service, which configures tenants, role bindings, and generates JSON Web Tokens
- role-service, which configures roles for tenants to be bound to
- storage-service, which configures backend storage arrays for the proxy-server to forward requests to

The following third-party components are installed in the specified namespace:
- redis, which stores data regarding tenants and their volume ownership, quota, and revokation status
- redis-commander, a web management tool for Redis

The following third-party components are optionally installed in the specified namespace:
- cert-manager, which optionally provides a self-signed certificate to configure the Authorization Ingresses
- nginx-ingress-controller, which fulfills the Authorization Ingresses

Storage system credentials can be provided in one of two ways:
1. Using a SecretProviderClass (for dynamic secrets from external providers)
2. Using a Kubernetes Secret (for static credentials)

## Install Container Storage Modules Authorization

1. Create the Authorization namespace.
   ```bash
   kubectl create namespace authorization
   ```

2. Add the Dell Helm Charts repo
   ```bash
   helm repo add dell https://dell.github.io/helm-charts
   ```

3. Configure Storage Credentials

{{< tabpane Ordinal="1" text=true lang="en" >}}
{{% tab header="SecretProviderClass" lang="en" %}}

- Ensure the Secrets Store CSI Driver is installed and configured with an External Secret Provider. For guidance refer to our [installation and configuration guide](v1/getting-started/installation/helm/modules/authorizationv2-0#installing-and-configuring-the-secrets-store-csi-driver-with-an-external-secret-provider).

- Create your own [SecretProviderClass Object](https://secrets-store-csi-driver.sigs.k8s.io/getting-started/usage#create-your-own-secretproviderclass-object) based on your external secret provider. You also have the option to create your own Redis secret in the SecretProviderClass.

<br>
  {{< collapse id="1" title="Minimal SecretProviderClass configuration: includes only array-based credentials" card="false" >}}

  <br>
  {{< tabpane Ordinal="2" name="secret-provider-class-no-redis" lang="bash">}}
  {{<tab header="Vault" >}}
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: vault-db-creds
spec:
  # Vault CSI Provider
  provider: vault
  parameters:
    # Vault role name to use during login
    roleName: 'csm-authorization'
    # Vault's hostname
    vaultAddress: 'https://vault:8200'
    # TLS CA certification for validation
    vaultCACertPath: '/vault/tls/ca.crt'
    objects: |
      - objectName: "dbUsername"
        secretPath: "database/creds/db-app"
        secretKey: "username"
      - objectName: "dbPassword"
        secretPath: "database/creds/db-app"
        secretKey: "password"
    # "objectName" is an alias used within the SecretProviderClass to reference
    # that specific secret. This will also be the filename containing the secret.
    # "secretPath" is the path in Vault where the secret should be retrieved.
    # "secretKey" is the key within the Vault secret response to extract a value from.
  {{</tab >}}
  {{<tab header="Conjur" >}}
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: conjur-db-creds
spec:
  provider: conjur
  parameters:
    conjur.org/configurationVersion: 0.2.0
    account: replace-me-account
    applianceUrl: 'https://conjur-conjur-oss.default.svc.cluster.local'
    authnId: authn-jwt/kube
    sslCertificate: |
      -----BEGIN CERTIFICATE-----
      ...
      -----END CERTIFICATE-----
  {{</tab >}}
  {{< /tabpane >}}
  {{< /collapse >}}

  {{< collapse id="2" title="SecretProviderClass configuration with array-based and Redis credentials" card="false" >}}

  <br>
  {{< tabpane Ordinal="3" name="secret-provider-class-with-redis" lang="bash">}}
  {{<tab header="Vault" >}}
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: vault-db-creds
spec:
  # Vault CSI Provider
  provider: vault
  secretObjects:
  # Name of the Kubernetes Secret object
  # This name will be used during deployment
  - secretName: redis-secret-vault
    type: kubernetes.io/basic-auth
    data:
      # Name of the mounted content to sync
      # This could be the object name or the object alias
      - objectName: dbRedisUsername
        # Data field to populate
        key: username
      - objectName: dbRedisPassword
        key: password
  parameters:
    # Vault role name to use during login
    roleName: 'csm-authorization'
    # Vault's hostname
    vaultAddress: 'https://vault:8200'
    # TLS CA certification for validation
    vaultCACertPath: '/vault/tls/ca.crt'
    objects: |
      - objectName: "dbUsername"
        secretPath: "database/creds/db-app"
        secretKey: "username"
      - objectName: "dbPassword"
        secretPath: "database/creds/db-app"
        secretKey: "password"
      - objectName: "dbRedisUsername"
        secretPath: "database/creds/redis"
        secretKey: "username"
      - objectName: "dbRedisPassword"
        secretPath: "database/creds/redis"
        secretKey: "password"
    # "objectName" is an alias used within the SecretProviderClass to reference
    # that specific secret. This will also be the filename containing the secret.
    # "secretPath" is the path in Vault where the secret should be retrieved.
    # "secretKey" is the key within the Vault secret response to extract a value from.
  {{</tab >}}
  {{<tab header="Conjur" >}}
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: conjur-db-creds
spec:
  provider: conjur
  secretObjects:
  # Name of the Kubernetes Secret object
  # This name will be used during deployment
  - secretName: redis-secret-conjur
    type: kubernetes.io/basic-auth
    data:
      # Name of the mounted content to sync
      # This could be the object name or the object alias
      - objectName: secrets/redis-username
        # Data field to populate
        key: username
      - objectName: secrets/redis-password
        key: password
  parameters:
    conjur.org/configurationVersion: 0.2.0
    account: replace-me-account
    applianceUrl: 'https://conjur-conjur-oss.default.svc.cluster.local'
    authnId: authn-jwt/kube
    sslCertificate: |
      -----BEGIN CERTIFICATE-----
      ...
      -----END CERTIFICATE-----
  {{</tab >}}
  {{< /tabpane >}}
  {{< /collapse >}}
{{% /tab %}}
{{% tab header="Secret" lang="en" %}}
- Create a YAML file (in this example, `storage-secret.yaml`) containing the credentials:

  ```bash
  # Username and password for accessing storage system
  username: "username"
  password: "password"
  ```
<br>

- Create the Secret:

  ```bash
  kubectl create secret generic storage-secret -n authorization --from-file=storage-secret.yaml
  ```
{{% /tab %}}
{{< /tabpane >}}

>__Note__: Only one of SecretProviderClass or Secret can be used at a time.

<br>

4. Prepare [samples/authorization/config.yaml](https://github.com/dell/helm-charts/blob/main/samples/csm-authorization/config.yaml) which contains the JWT signing secret and other configuration parameters. The following table lists the configuration parameters.

    | Parameter            | Description                                                                 | Required | Default |
    | -------------------- | --------------------------------------------------------------------------- | -------- | ------- |
    | web.jwtsigningsecret | String used to sign JSON Web Tokens                                         | true     | secret  |
    | web.showdebughttp    | Enable debug logging for HTTP requests                                      | No       | false   |
    | proxy.readtimeout    | Proxy server read timeout. Increase if storage operations take longer.      | No       | 120s    |
    | proxy.writetimeout   | Proxy server write timeout. Increase if storage operations take longer.     | No       | 120s    |
    | zipkin.collectoruri  | Zipkin collector URI for trace data (e.g., `http://<ZIPKIN_ADDRESS>:9411/api/v2/spans`) | No | - |
    | zipkin.probability   | Probability of a trace being sampled (0.0 to 1.0)                          | No       | -       |

    Example:

    ```yaml
    web:
      jwtsigningsecret: randomString123
      showdebughttp: true
    proxy:
      readtimeout: 120s
      writetimeout: 120s
    zipkin:
      collectoruri: "http://ZIPKIN_ADDRESS:9411/api/v2/spans"
      probability: "1.0"
    ```

{{< tabpane Ordinal="4" text=true lang="en" >}}
{{% tab header="SecretProviderClass " lang="en" %}}

- Ensure the Secrets Store CSI Driver is installed and configured with an External Secret Provider. For guidance refer to our [installation and configuration guide](v1/getting-started/installation/helm/modules/authorizationv2-0#installing-and-configuring-the-secrets-store-csi-driver-with-an-external-secret-provider).

- Create your JWT signing secret within your chosen External Secret Provider. Paste the contents of this file as the secret content.

- Create your own [SecretProviderClass Object](https://secrets-store-csi-driver.sigs.k8s.io/getting-started/usage#create-your-own-secretproviderclass-object) based on your external secret provider. You also have the option to create your own Redis secret in the SecretProviderClass.

<br>
{{< collapse id="3" title="SecretProviderClass configuration with array-based, Redis, and config credentials" card="false" >}}

  <br>
  {{< tabpane Ordinal="5" name="secret-provider-class-with-redis-and-config" lang="bash">}}
  {{<tab header="Vault" >}}
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: vault-db-creds
spec:
  # Vault CSI Provider
  provider: vault
  secretObjects:
  # Name of the Kubernetes Secret object
  # This name will be used during deployment
  - secretName: redis-secret-vault
    type: kubernetes.io/basic-auth
    data:
      # Name of the mounted content to sync
      # This could be the object name or the object alias
      - objectName: dbRedisUsername
        # Data field to populate
        key: username
      - objectName: dbRedisPassword
        key: password
  - secretName: config-secret-vault
    type: Opaque
    data:
      - objectName: config-object
        # The key must be config.yaml for this secret
        key: config.yaml
  parameters:
    # Vault role name to use during login
    roleName: 'csm-authorization'
    # Vault's hostname
    vaultAddress: 'https://vault:8200'
    # TLS CA certification for validation
    vaultCACertPath: '/vault/tls/ca.crt'
    objects: |
      - objectName: "dbUsername"
        secretPath: "database/creds/db-app"
        secretKey: "username"
      - objectName: "dbPassword"
        secretPath: "database/creds/db-app"
        secretKey: "password"
      - objectName: "dbRedisUsername"
        secretPath: "database/creds/redis"
        secretKey: "username"
      - objectName: "dbRedisPassword"
        secretPath: "database/creds/redis"
        secretKey: "password"
      - objectName: "config-object"
        secretPath: "database/creds/config"
        secretKey: "configkey"
    # "objectName" is an alias used within the SecretProviderClass to reference
    # that specific secret. This will also be the filename containing the secret.
    # "secretPath" is the path in Vault where the secret should be retrieved.
    # "secretKey" is the key within the Vault secret response to extract a value from.
  {{</tab >}}
  {{<tab header="Conjur" >}}
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: conjur-db-creds
spec:
  provider: conjur
  secretObjects:
  # Name of the Kubernetes Secret object
  # This name will be used during deployment
  - secretName: redis-secret-conjur
    type: kubernetes.io/basic-auth
    data:
      # Name of the mounted content to sync
      # This could be the object name or the object alias
      - objectName: secrets/redis-username
        # Data field to populate
        key: username
      - objectName: secrets/redis-password
        key: password
  - secretName: config-secret-conjur
    type: Opaque
    data:
      - objectName: secrets/config-object
        # The key must be config.yaml for this secret
        key: config.yaml
  parameters:
    conjur.org/configurationVersion: 0.2.0
    account: replace-me-account
    applianceUrl: 'https://conjur-conjur-oss.default.svc.cluster.local'
    authnId: authn-jwt/kube
    sslCertificate: |
      -----BEGIN CERTIFICATE-----
      ...
      -----END CERTIFICATE-----
  {{</tab >}}
  {{< /tabpane >}}
  {{< /collapse >}}
{{% /tab %}}
{{% tab header="Secret " lang="en" %}}
  After editing the file, run the following command to create a secret called `karavi-config-secret`:

  ```bash

  kubectl create secret generic karavi-config-secret -n authorization --from-file=config.yaml=samples/csm-authorization/config.yaml
  ```

  Use the following command to replace or update the secret:

  ```bash

  kubectl create secret generic karavi-config-secret -n authorization --from-file=config.yaml=samples/csm-authorization/config.yaml -o yaml --dry-run=client | kubectl replace -f -
  ```
{{% /tab %}}
{{< /tabpane >}}

>__Note__: Only one of SecretProviderClass or Secret can be used at a time.

<br>

5. Copy the default values.yaml file `cp charts/csm-authorization-v2.0/values.yaml myvalues.yaml`

6. Look over all the fields in `myvalues.yaml` and fill in/adjust any as needed.

<ul>

{{< collapse id="4" title="Parameter" >}}

| Parameter                           | Description                                                                                                            | Required | Default                                                                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| openshift                           | Enable/Disable deployment of the OpenShift Ingress Operator. Set to false if you have an Ingress Controller installed. | No       | true                                                                                                                         |
| **nginx**                           | This section configures the enablement of the NGINX Ingress Controller.                                                | -        | -                                                                                                                            |
| enabled                             | Enable/Disable deployment of the NGINX Ingress Controller. Set to false if you have an Ingress Controller installed.   | No       | true                                                                                                                         |
| **cert-manager**                    | This section configures the enablement of cert-manager.                                                                | -        | -                                                                                                                            |
| enabled                             | Enable/Disable deployment of cert-manager. Set to false if you already have cert-manager installed.                    | No       | true                                                                                                                         |
| **authorization**                   | This section configures the Authorization components.                                                                  | -        | -                                                                                                                            |
| images.proxyService                 | The image to use for the proxy-service.                                                                                | Yes      | quay.io/dell/container-storage-modules/csm-authorization-proxy:{{< version-v1 key="Authv2_csm_authorization_proxy" >}}     |
| images.tenantService                | The image to use for the tenant-service.                                                                               | Yes      | quay.io/dell/container-storage-modules/csm-authorization-tenant:{{< version-v1 key="Authv2_csm_authorization_tenant" >}}   |
| images.roleService                  | The image to use for the role-service.                                                                                 | Yes      | quay.io/dell/container-storage-modules/csm-authorization-proxy:{{< version-v1 key="Authv2_csm_authorization_role" >}}      |
| images.storageService               | The image to use for the storage-service.                                                                              | Yes      | quay.io/dell/container-storage-modules/csm-authorization-storage:{{< version-v1 key="Authv2_csm_authorization_storage" >}} |
| images.authorizationController      | The image to use for the controller.                                                                                   | Yes      | quay.io/dell/container-storage-modules/csm-authorization-controller                                                          |
| images.opa                          | The image to use for Open Policy Agent.                                                                                | Yes      | openpolicyagent/opa                                                                                                          |
| images.opaKubeMgmt                  | The image to use for Open Policy Agent kube-mgmt.                                                                      | Yes      | openpolicyagent/kube-mgmt:8.5.8                                                                                              |
| hostname                            | The hostname to configure the self-signed certificate (if applicable) and the proxy Ingress.                           | Yes      | csm-authorization.com                                                                                                        |
| logLevel                            | Authorization log level. Allowed values: “error”, “warn”/“warning”, “info”, “debug”.                                   | Yes      | debug                                                                                                                        |
| concurrentPowerFlexRequests         | Number of concurrent requests to PowerFlex. Used with dellctl to list tenant volumes.                                  | Yes      | 10                                                                                                                           |
| concurrentPowerScaleRequests        | Number of concurrent requests to PowerScale. Used with dellctl to list tenant volumes.                                 | Yes      | 10                                                                                                                           |
| zipkin.collectoruri                 | The URI of the Zipkin instance to export traces.                                                                       | No       | -                                                                                                                            |
| zipkin.probability                  | The ratio of traces to export.                                                                                         | No       | -                                                                                                                            |
| proxyServerIngress.ingressClassName | The ingressClassName of the proxy-service Ingress.                                                                     | Yes      | -                                                                                                                            |
| proxyServerIngress.hosts            | Additional host rules to be applied to the proxy-service Ingress.                                                      | No       | -                                                                                                                            |
| proxyServerIngress.annotations      | Additional annotations for the proxy-service Ingress.                                                                  | No       | -                                                                                                                            |
| storageCapacityPollInterval         | Interval the storage-service uses to poll the backend array for tenant capacity.                                       | Yes      | 5m                                                                                                                           |
| **redis**                           | This section configures Redis.                                                                                         | -        | -                                                                                                                            |
| name                                | The prefix of the redis pods. The number of pods is determined by the number of replicas.                              | Yes      | redis-csm                                                                                                                    |
| **redisSecretProviderClass**        | This section configures the Redis credentials.                                                                         | -        | -                                                                                                                            |
| secretProviderClassName             | The name of the SecretProviderClass that holds the Redis secretObject.                                                 | No       | -                                                                                                                            |
| redisSecretName                     | The name of the Kubernetes secret created by the Secrets Store CSI driver.                                             | No       | -                                                                                                                            |
| redisUsernameKey                    | The key in the secret that stores the Redis username.                                                                  | No       | -                                                                                                                            |
| redisPasswordKey                    | The key in the secret that stores the Redis password.                                                                  | No       | -                                                                                                                            |
| conjur                              | A secretProviderClass object when using Conjur.                                                                        | No       | -                                                                                                                            |
| conjur.passwordPath                 | The secret path of the Conjur secretProviderClass redis password object.                                                             | No       | -                                                                                                                            |
| conjur.usernamePath                 | The secret path of the Conjur secretProviderClass redis username object.                                                             | No       | -                                                                                                                            |
| sentinel                            | The prefix of the redis sentinel pods. The number of pods is determined by the number of replicas.                     | Yes      | sentinel                                                                                                                     |
| redisCommander                      | The prefix of the redis commander pod.                                                                                 | Yes      | rediscommander                                                                                                               |
| replicas                            | The number of replicas for the sentinel and redis pods.                                                                | Yes      | 5                                                                                                                            |
| images.redis                        | The image to use for Redis.                                                                                            | Yes      | redis:7.4.0-alpine                                                                                                           |
| images.commander                    | The image to use for Redis Commander.                                                                                  | Yes      | rediscommander/redis-commander:latest                                                                                        |
| **config**                          | This section configures the config secret.                                                                  | -        | -                                                                                                                            |
| secretProviderClassName             | The name of the SecretProviderClass that holds the config secretObject.                                                 | No       | -                                                                                                                            |
| configSecretName                     | The name of the Kubernetes secret created by the Secrets Store CSI driver.                                             | No       | -                                                                                
| conjur                              | A secretProviderClass object when using Conjur.                                                                        | No       | -                                                                                                                            |
| conjur.secretPath                   | The secret path of the Conjur secretProviderClass config secret object.                                                             | No       |                                             |-                                                                                                                            |
| **storageSystemCredentials**        | This section configures the storageSystemCredentials.                                                                  | -        | -                                                                                                                            |
| **secretProviderClasses**           | This section configures secretProviderClass objects.                                                                   | Yes      | -                                                                                                                            |
| vault                               | A list of secretProviderClass objects when using Vault.                                                                | Yes      | -                                                                                                                            |
| conjur                              | A list of secretProviderClass objects when using Conjur.                                                               | No       | -                                                                                                                            |
| conjur.name                         | The name of a Conjur secretProviderClass object.                                                                       | No       | -                                                                                                                            |
| conjur.paths                        | The secret paths of a Conjur secretProviderClass object.                                                               | No       | -                                                                                                                            |
| **secrets**                         | This section configures Kubernetes secrets with their names.                                                          | No      | -                                                                                                                            |
{{< /collapse >}}
</ul>

7. Install the module using `helm`:

To install Authorization with the service Ingresses using your own certificate, run:

```bash
helm -n authorization install authorization -f myvalues.yaml charts/csm-authorization-v2.0 \
--set-file authorization.certificate=<location-of-certificate-file> \
--set-file authorization.privateKey=<location-of-private-key-file>
```

To install Authorization with the service Ingresses using a self-signed certificate generated via cert-manager, run:

```bash
helm -n authorization install authorization -f myvalues.yaml charts/csm-authorization-v2.0
```

## Install Dellctl

>__Note__: Karavictl will not work with Authorization v2.x. Please use dellctl instead.

Follow the instructions for [Installing dellctl](v1/tooling/cli/#installation-instructions).

## Installing and configuring the Secrets Store CSI Driver with an External Secret Provider

- Install a supported [External Secret Provider](https://secrets-store-csi-driver.sigs.k8s.io/getting-started/installation#install-external-secret-providers) to integrate with the Secrets Store CSI Driver. For guidance on setting up Vault, refer to our [Vault installation guide](v1/getting-started/installation/operator/modules/authorizationv2-0#vault-csi-provider-installation). For Conjur, refer to our [Conjur installation guide](v1/getting-started/installation/operator/modules/authorizationv2-0#conjur-csi-provider-installation).

- Install the [Secrets Store CSI Driver](https://secrets-store-csi-driver.sigs.k8s.io/getting-started/installation) enabling the [`Sync as Kubernetes Secret`](https://secrets-store-csi-driver.sigs.k8s.io/topics/sync-as-kubernetes-secret) and [`Secret Auto Rotation`](https://secrets-store-csi-driver.sigs.k8s.io/topics/secret-auto-rotation) features.
   >__Note__: If you are using Conjur with the Secrets Store CSI Driver, be sure to configure `--set 'tokenRequests[0].audience=conjur'` when installing the Secrets Store CSI Driver.

- For OpenShift environments, label the namespace:

   ```sh
   kubectl label namespace authorization \
    pod-security.kubernetes.io/enforce=privileged \
    security.openshift.io/MinimallySufficientPodSecurityStandard=privileged \
    --overwrite
   ```

## Configuring the Authorization Proxy Server

Follow the instructions available in Authorization for [Configuring the Authorization Proxy Server](v1/concepts/authorization/v2.x/configuration/).

## Configuring a Dell CSI Driver with Container Storage Modules for Authorization

Follow the instructions available in Authorization for

{{< hide id="1" >}} - [Configuring PowerFlex with Authorization](v1/concepts/authorization/v2.x/configuration/powerflex). {{< /hide >}}

{{< hide id="2" >}} - [Configuring PowerMax with Authorization](v1/concepts/authorization/v2.x/configuration/powermax).{{< /hide >}}

{{< hide id="3" >}} - [Configuring PowerScale with Authorization](v1/concepts/authorization/v2.x/configuration/powerscale).{{< /hide >}}

{{< hide id="4" >}} - [Configuring PowerStore with Authorization](v1/concepts/authorization/v2.x/configuration/powerstore).{{< /hide >}}

## Updating Container Storage Modules for Authorization Proxy Server Configuration

Authorization has a subset of configuration parameters that can be updated dynamically:

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

Replace the data in `config.yaml` under the `data` field with your new, encoded data. Save the changes and Authorization will read the changed secret.

>__Note__: If you are updating the signing secret, the tenants need to be updated with new tokens via the `dellctl generate token` command.

## CSM for Authorization Proxy Server Dynamic Configuration Settings

Some settings are not stored in the `karavi-config-secret` but in the csm-config-params ConfigMap, such as LOG_LEVEL and LOG_FORMAT. To update the Authorization logging settings during runtime, run the below command, make your changes, and save the updated configMap data.

```bash
kubectl -n authorization edit configmap/csm-config-params
```

This edit will not update the logging level for the sidecar-proxy containers running in the CSI Driver pods. To update the sidecar-proxy logging levels, you must update the associated CSI Driver ConfigMap in a similar fashion:

```bash

kubectl -n [CSM_CSI_DRIVER_NAMESPACE] edit configmap/<release_name>-config-params
```

Using PowerFlex as an example, `kubectl -n vxflexos edit configmap/vxflexos-config-params` can be used to update the logging level of the sidecar-proxy and the driver.
