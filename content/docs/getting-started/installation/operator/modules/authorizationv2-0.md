---
title: Authorization v2.0
linkTitle: "Authorization v2.0"
description: >
  Installing Authorization v2.0 via Container Storage Modules Operator
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

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

2. Configure Storage Credentials

{{< tabpane text=true lang="en" >}}
{{% tab header="SecretProviderClass" lang="en" %}}

- Install a supported [External Secret Provider](https://secrets-store-csi-driver.sigs.k8s.io/getting-started/installation#install-external-secret-providers) to integrate with the Secrets Store CSI Driver. For guidance on setting up Vault, refer to our [Vault installation guide](docs/getting-started/installation/operator/modules/authorizationv2-0#vault-csi-provider-installation).

- Install the [Secrets Store CSI Driver](https://secrets-store-csi-driver.sigs.k8s.io/getting-started/installation) enabling the [`Sync as Kubernetes Secret`](https://secrets-store-csi-driver.sigs.k8s.io/topics/sync-as-kubernetes-secret) and [`Secret Auto Rotation`](https://secrets-store-csi-driver.sigs.k8s.io/topics/secret-auto-rotation) features.

- Create your own [SecretProviderClass Object](https://secrets-store-csi-driver.sigs.k8s.io/getting-started/usage#create-your-own-secretproviderclass-object) based on your external secret provider. You also have the option to create your own Redis secret in the SecretProviderClass.

- For OpenShift environments, label the namespace:

   ```bash
   kubectl label namespace authorization \
    pod-security.kubernetes.io/enforce=privileged \
    security.openshift.io/MinimallySufficientPodSecurityStandard=privileged \
    --overwrite
   ```

  {{< collapse id="2" title="SecretProviderClass without Redis" card="false" >}}

  Example SecretProviderClass using Vault Provider:

  ```bash
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
  ```

  {{< /collapse >}}

  {{< collapse id="2" title="SecretProviderClass with Redis" card="false" >}}

  Example SecretProviderClass using Vault Provider:

  ```bash
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
    - secretName: vault-db-creds
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
  ```

  {{< /collapse >}}
  {{% /tab %}}

{{% tab header="Secret" lang="en" %}}
- Create a YAML file (in this example, `storage-secret.yaml`) containing the credentials:

  ```bash
  # Username and password for accessing storage system
  username: "username"
  password: "password"
  ```
</br>

- Create the Secret:

  ```bash
  kubectl create secret generic storage-secret -n authorization --from-file=storage-secret.yaml
  ```
{{% /tab %}}
{{< /tabpane >}}

>__Note__: Only one of SecretProviderClass or Secret can be used at a time.

<br>

3. Install cert-manager CRDs
    ```bash
    kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.11.0/cert-manager.crds.yaml
    ```

4. Prepare [samples/authorization/config.yaml](https://github.com/dell/csm-operator/blob/main/samples/authorization/config.yaml) which contains the JWT signing secret. The following table lists the configuration parameters.

    | Parameter            | Description                         | Required | Default |
    | -------------------- | ----------------------------------- | -------- | ------- |
    | web.jwtsigningsecret | String used to sign JSON Web Tokens | true     | secret  | . |

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


>__Note__:
> - If you are installing Authorization in a different namespace than `authorization`, edit the `namespace` field in this file to your namespace.


### Install Container Storage Modules Authorization Proxy Server

1. Create a CR (Custom Resource) for Authorization from a [sample manifest](https://github.com/dell/csm-operator/blob/main/samples/authorization/csm_authorization_proxy_server_v230.yaml). This file can be modified to use custom parameters if needed.

2. Users should configure the parameters in the CR. This table lists the primary configurable parameters of the Authorization Proxy Server and their default values:

<ul>
{{< collapse title="Parameters" id="1">}}
   | Parameter                           | Description                                                                                                                                                          | Required | Default               |
   | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------- |
   | **nginx**                           | This section configures the enablement of the NGINX Ingress Controller.                                                                                              | -        | -                     |
   | enabled                             | For Kubernetes Container Platform only: Enable/Disable deployment of the NGINX Ingress Controller. Set to false if you already have an Ingress Controller installed. | No       | true                  |
   | **cert-manager**                    | This section configures the enablement of cert-manager.                                                                                                              | -        | -                     |
   | enabled                             | Enable/Disable deployment of cert-manager. Set to false if you already have cert-manager installed.                                                                  | No       | true                  |
   | **authorization**                   | This section configures the CSM-Authorization components.                                                                                                            | -        | -                     |
   | certificate                         | The base64-encoded certificate for the certificate/private-key to configure the proxy-service Ingress. Leave empty to use self-signed certificate.                   | No       | -                     |
   | privateKey                          | The base64-encoded private key for the certificate/private-key to configure the proxy-service Ingress. Leave empty to use self-signed certificate.                   | No       | -                     |
   | hostname                            | The hostname to configure the self-signed certificate (if applicable), and the proxy service Ingress.                                                                | No       | csm-authorization.com |
   | proxyServerIngress.ingressClassName | The ingressClassName of the proxy-service Ingress.                                                                                                                   | Yes      | nginx                 |
   | proxyServerIngress.hosts            | Additional host rules to be applied to the proxy-service Ingress.                                                                                                    | No       | -                     |
   | proxyServerIngress.annotations      | Additional annotations for the proxy-service Ingress.                                                                                                                | No       | -                     |
{{< /collapse >}}
{{< collapse title="Additional v2.0 Parameters" >}}
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | **redis** | This section configures the Redis components. | - | - |
   | redisName | The prefix of the redis pods. The number of pods is determined by the number of replicas. | Yes | redis-csm |
   | **redisSecretProviderClass** | This section configures the Redis credentials. | - | - |
   | redisSecretName | The name of the Kubernetes secret created by the CSI driver. | No | - |
   | redisUsernameKey | The key in the secret that stores the Redis username. | Yes | username |
   | redisPasswordKey | The key in the secret that stores the Redis password. | Yes | password |
   | redisCommander | The prefix of the redis commander pod. | Yes | rediscommander |
   | sentinel | The prefix of the redis sentinel pods. The number of pods is determined by the number of replicas. | Yes | sentinel |
   | redisReplicas | The number of replicas for the sentinel and redis pods. | Yes | 5 |
   | storageclass | The storage class for Redis to use for persistence. If not supplied, a locally provisioned volume is used. | No | - |
   | **storageSystemCredentials** | This section configures the storageSystemCredentials. | - | - |
   | secretProviderClasses | A name that is used to identify a secretProviderClass object. | Yes | - |
   | secrets | A name that is used to identify a Kubernetes Secret. | No | - |
{{< /collapse >}}


>__Note__:
> - If you are installing Authorization in a different namespace than `authorization`, edit the `namespace` fields in this file to your namespace.
> - If you specify `storageclass`, the storage class must NOT be provisioned by the Dell CSI Driver to be configured with this installation of Authorization.

**Optional:**
To enable reporting of trace data with [Zipkin](https://zipkin.io/), use the `csm-config-params` configMap in the sample CR or dynamically by editing the configMap.

  Add the Zipkin values to the configMap where `ZIPKIN_ADDRESS` is the IP address or hostname of the Zipkin server.
  ```bash
  ZIPKIN_URI: "http://ZIPKIN_ADDRESS:9411/api/v2/spans"
  ZIPKIN_PROBABILITY: "1.0"
  ```

</ul>

3. Execute this command to create the Authorization CR:

    ```bash
    kubectl create -f <SAMPLE FILE>
    ```

  >__Note__:
  > - This command will deploy the Authorization Proxy Server in the namespace specified in the input YAML file.

### Verify Installation of the Container Storage Modules Authorization Proxy Server
Once the Authorization CR is created, you can verify the installation as mentioned below:

  ```bash
  kubectl describe csm/<name-of-custom-resource> -n authorization
  ```

### Install dellctl

>__Note__: Karavictl will not work with Authorization v2.x. Please use dellctl instead.

Follow the instructions for [Installing dellctl](docs/tooling/cli/#installation-instructions).

### Configure the Container Storage Modules Authorization Proxy Server

Follow the instructions available in Authorization for [Configuring the Authorization Proxy Server](docs/concepts/authorization/v2.x/configuration/).

### Configure a Dell CSI Driver with Container Storage Modules Authorization

Follow the instructions available in Authorization for

{{< hide id="1" >}}- [Configuring PowerFlex with Authorization](docs/concepts/authorization/v2.x/configuration/powerflex).{{< /hide >}}

{{< hide id="2" >}}- [Configuring PowerMax with Authorization](docs/concepts/authorization/v2.x/configuration/powermax).{{< /hide >}}

{{< hide id="3" >}}- [Configuring PowerScale with Authorization](docs/concepts/authorization/v2.x/configuration/powerscale).{{< /hide >}}

## Vault CSI Provider Installation

If there is already a Vault CSI provider install available, skip to [Minimum Server Configuration](#minimum-server-configuration).

If there is no Vault CSI provider available to use with CSM Authorization, it can be installed following [Hashicorp Vault documentation](https://www.vaultproject.io/docs).

For a testing environment, however, a simple deployment suggested in this section may suffice.
> **NOTE**: It creates a standalone server with in-memory (non-persistent) storage. It is insecure and will lose data on every restart. It is only made for development or experimentation.

### Start Vault CSI Provider

```shell
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install vault hashicorp/vault \
    --set "server.dev.enabled=true" \
    --set "injector.enabled=false" \
    --set "csi.enabled=true"
```
This is the recommended installation method for [Vault Provider for Secrets Store CSI Driver](https://github.com/hashicorp/vault-csi-provider?tab=readme-ov-file#hashicorp-vault-provider-for-secrets-store-csi-driver).

## Minimum Server Configuration

> **NOTE:** This configuration is a bare minimum to support CSM Authorization.
Refer to the [Hashicorp Vault documentation](https://www.vaultproject.io/docs) for recommended configuration options.

> To start an interactive shell session, run `kubectl exec -it vault-0 -- /bin/sh`. After completing the configuration process, exit the shell by typing `exit`.

### Enable Key/Value secret engine

```shell
vault secrets enable -version=2 -path=csm-authorization/ kv
```

Key/Value secret engine is used to store array credentials.

### Enable Kubernetes authentication

```shell
vault auth enable kubernetes
```

### Configure Kubernetes authentication

```shell
vault write auth/kubernetes/config kubernetes_host="$KUBERNETES_HOST" kubernetes_ca_cert="$KUBERNETES_CA_CERT"
```

### Create a policy

```shell
vault policy write csm-authorization - <<EOF
path "csm-authorization/*" {
	capabilities = ["read"]
}
EOF
```
The policy needs read access to the path(s) containing the storage credentials.

### Create a role

```shell
vault write auth/kubernetes/role/csm-authorization \
	token_ttl=1h \
	token_max_ttl=1h \
	token_explicit_max_ttl=10d \
  bound_service_account_names=storage-service,tenant-service,proxy-server,sentinel,redis \
  bound_service_account_namespaces=authorization \
  policies=csm-authorization
```

The role needs to be:
- bound to the `storage-service` service account
- bound to the namespace where Authorization will be deployed
- reference the policy that has read access to the storage credentials.

### Write a secret

Given an example below for writing a secret to vault for PowerFlex,
```shell
vault kv put -mount=secret /storage/powerflex/systemid1 username=user password=pass
```

The username must use the key `username` and the password must use the key `password`.

## Token TTL Considerations

Effective client token TTL is determined by the Vault server based on multiple factors which are described in the [Vault documentation](https://www.vaultproject.io/docs/concepts/tokens#token-time-to-live-periodic-tokens-and-explicit-max-ttls).

With the default server settings, role level values control TTL in this way:

`token_explicit_max_ttl=2h` - limits the client token TTL to 2 hours since it was originally issues as a result of login. This is a hard limit.

`token_ttl=30m` - sets the default client token TTL to 30 minutes. 30 minutes are counted from the login time and from any following token renewal.
The client token will only be able to renew 3 times before reaching it total allowed TTL of 2 hours.

Existing role values can be changed using `vault write auth/kubernetes/role/csm-authorization token_ttl=30m token_explicit_max_ttl=2h`.

## Conjur CSI Provider Installation

If there is already a Conjur CSI provider install available, skip to [Minimum Server Configuration](#conjur-minimum-server-configuration).

If there is no Conjur CSI provider available to use with CSM Authorization, it can be installed following [Conjur K8S CSI Provider documentation](https://github.com/cyberark/conjur-k8s-csi-provider).

For a testing environment, however, a simple deployment suggested in this section may suffice.

### Start Conjur CSI Provider

```shell
helm repo add cyberark https://cyberark.github.io/helm-charts
helm install conjur-csi-provider \
  cyberark/conjur-k8s-csi-provider \
  --set provider.name="conjur" \
  --set securityContext.privileged=true \
  --set securityContext.allowPrivilegeEscalation=true
```

### Conjur Minimum Server Configuration
> **NOTE:** This configuration is a bare minimum to support CSM Authorization.

#### Load Host Policy
Load the following policy file using `conjur-cli`. In this example, the yaml below is saved in `$HOME/.conjur-cli/config.yaml`. 

> **NOTE:** This example uses `public-keys` of the Service Account Issuer Discovery service in Kubernetes. `jwks-uri` is also available to set and configure.

```yaml
# Define the policy branch
- !policy
  id: csm-authorization
  body:
    - !host
      id: system:serviceaccount:authorization:storage-service
      annotations:
        authn-jwt/kube/kubernetes.io/namespace: "authorization"
        authn-jwt/kube/kubernetes.io/serviceaccount/name: "storage-service"

# Define the webservice and its variables
- !webservice
  id: conjur/authn-jwt/kube

- !variable
  id: conjur/authn-jwt/kube/issuer

- !variable
  id: conjur/authn-jwt/kube/public-keys

- !variable
  id: conjur/authn-jwt/kube/audience

- !variable
  id: conjur/authn-jwt/kube/token-app-property

- !variable
  id: conjur/authn-jwt/kube/identity-path

# Permit the nested host access to the webservice
- !permit
  role: !host csm-authorization/system:serviceaccount:authorization:storage-service
  privilege: [ read, authenticate ]
  resource: !webservice conjur/authn-jwt/kube

```

```shell
podman run --rm -it -v ~/.conjur-cli:/home/cli docker.io/cyberark/conjur-cli:8 policy load -b root -f /home/cli/config.yaml
```

#### Configure JWT Authentication

Save your cluster's JWKS information.

```shell
kubectl get --raw /openid/v1/jwks > $HOME/.conjur-cli/jwks.json
```

Configure the `public-keys`, `issuer`, `token-app-property`, `identity-path`, and `audience` variables.

If your cluster is OpenShift, the `issuer` is `https://kubernetes.default.svc`. For standard Kubernetes, it is `https://kubernetes.default.svc.cluster.local`. In this example, the cluster is OpenShift.

```shell
ISSUER="https://kubernetes.default.svc"

podman run --rm -v ~/.conjur-cli:/home/cli docker.io/cyberark/conjur-cli:8 variable set -i conjur/authn-jwt/kube/public-keys -v "{\"type\":\"jwks\", \"value\":$(cat ~/.conjur-cli/jwks.json | jq -c .)}" && \
podman run --rm -v ~/.conjur-cli:/home/cli docker.io/cyberark/conjur-cli:8 variable set -i conjur/authn-jwt/kube/issuer -v "$ISSUER && \
podman run --rm -v ~/.conjur-cli:/home/cli docker.io/cyberark/conjur-cli:8 variable set -i conjur/authn-jwt/kube/token-app-property -v "sub" && \
podman run --rm -v ~/.conjur-cli:/home/cli docker.io/cyberark/conjur-cli:8 variable set -i conjur/authn-jwt/kube/identity-path -v csm-authorization && \
podman run --rm -v ~/.conjur-cli:/home/cli docker.io/cyberark/conjur-cli:8 variable set -i conjur/authn-jwt/kube/audience -v "conjur"
```

#### Load and Configure a Secret

In this example, the following yaml is saved in `$HOME/.conjur-cli/app-secret.yaml`.

```yaml
- !policy
  id: secrets
  body:
    - &variables
      - !variable username
      - !variable password
    - !permit
      role: !host /csm-authorization/system:serviceaccount:authorization:storage-service
      privilege: [ read, execute ]
      resource: *variables
```

```shell
podman run --rm -it -v ~/.conjur-cli:/home/cli docker.io/cyberark/conjur-cli:8 policy load -b root -f /home/cli/app-secret.yaml
```

Set the variable with values. In this example, `usr` and `pwd` are the values.

```shell
podman run --rm -it -v ~/.conjur-cli:/home/cli docker.io/cyberark/conjur-cli:8 variable set -i secrets/username -v usr && \
podman run --rm -it -v ~/.conjur-cli:/home/cli docker.io/cyberark/conjur-cli:8 variable set -i secrets/password -v pwd
```