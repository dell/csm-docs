---
title: Authorization v2.0 Tech Preview
linkTitle: "Authorization v2.0 Tech Preview"
description: >
  Installing Authorization v2.0 Tech Preview via Dell CSM Operator
---

{{% pageinfo color="primary" %}}
The CSM Authorization karavictl CLI is no longer actively maintained or supported. It will be deprecated in CSM 2.0.
{{% /pageinfo %}}

## Install CSM Authorization via Dell CSM Operator

The CSM Authorization module for supported Dell CSI Drivers can be installed via the Dell CSM Operator.
To deploy the Operator, follow the instructions available [here](../../#installation).

### Prerequisite

1. [Install Vault or configure an existing Vault](#vault-server-installation).

2. Execute `kubectl create namespace authorization` to create the authorization namespace (if not already present). Note that the namespace can be any user-defined name, in this example, we assume that the namespace is 'authorization'. 

3. Install cert-manager CRDs 
    ```bash
    kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.11.0/cert-manager.crds.yaml
    ```

4. Prepare [samples/authorization/config.yaml](https://github.com/dell/csm-operator/blob/main/samples/authorization/config.yaml) which contains the JWT signing secret. The following table lists the configuration parameters.

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


>__Note__:  
> - If you are installing CSM Authorization in a different namespace than `authorization`, edit the `namespace` field in this file to your namespace.


### Install CSM Authorization Proxy Server

1. Follow all the [prerequisites](#prerequisite).

2. Create a CR (Custom Resource) for Authorization from a [sample manifest](https://github.com/dell/csm-operator/blob/main/samples/authorization/csm_authorization_proxy_server_v200-alpha.yaml). This file can be modified to use custom parameters if needed.

3. Users should configure the parameters in the CR. This table lists the primary configurable parameters of the Authorization Proxy Server and their default values:

   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
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

    **Additional v2.0 Technical Preview Parameters:**
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | **redis** | This section configures the Redis components. | - | - |
   | redisName | The prefix of the redis pods. The number of pods is determined by the number of replicas. | Yes | redis-csm |
   | redisCommander | The prefix of the redis commander pod. | Yes | rediscommander |
   | sentinel | The prefix of the redis sentinel pods. The number of pods is determined by the number of replicas. | Yes | sentinel |
   | redisReplicas | The number of replicas for the sentinel and redis pods. | Yes | 5 |
   | storageclass | The storage class for Redis to use for persistence. If not supplied, a locally provisioned volume is used. | No | - |
   | **vault** | This section configures the vault components. | - | - |
   | vaultAddress | The address where vault is hosted with the credentials to the array (`https://10.0.0.1:<port>`). | Yes | - |
   | vaultRole | The configured authentication role in vault. | Yes | csm-authorization |
   | kvEnginePath | The vault path where the credentials are stored. | Yes | secret |
   | certificate | The base64-encoded certificate for the certificate/private-key pair to connect to Vault. Leave empty to use self-signed certificate. | No | - |
   | privateKey | The base64-encoded private key for the certificate/private-key pair to connect to Vault. Leave empty to use self-signed certificate. | No | - |
   | certificateAuthority | The base64-encoded certificate authority for validating the Vault server. | No | - |

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

### Install dellctl

Follow the instructions for [Installing dellctl](../../../../support/cli/#installation-instructions).

### Configure the CSM Authorization Proxy Server

Follow the instructions available in CSM Authorization for [Configuring the CSM Authorization Proxy Server](../../../../authorization/v2.0-tech-preview/configuration/proxy-server/).

### Configure a Dell CSI Driver with CSM Authorization

Follow the instructions available in CSM Authorization for [Configuring PowerFlex with Authorization](../../../../authorization/v2.0-tech-preview/configuration/powerflex).

## Vault Server Installation

If there is already a Vault server available, skip to [Minimum Server Configuration](#minimum-server-configuration).

If there is no Vault server available to use with CSM Authorization, it can be installed in many ways following [Hashicorp Vault documentation](https://www.vaultproject.io/docs).

For testing environment, however, a simple deployment suggested in this section may suffice. 
It creates a standalone server with in-memory (non-persistent) storage, running in a Docker container.

> **NOTE**: With in-memory storage, the data in Vault is permanently destroyed upon the server's termination.

### Generate TLS certificates for server and client

Create server CA private key and certificate:

```shell
openssl req -x509 -sha256 -days 365 -newkey rsa:2048 -nodes \
	-subj "/CN=Vault Root CA" \
	-keyout server-ca.key \
	-out server-ca.crt
```

Create server private key and CSR:

```shell
openssl req -newkey rsa:2048 -nodes \
	-subj "/CN=vault-demo-server" \
	-keyout server.key \
	-out server.csr
```

Create server certificate signed by the CA:

> Replace `<external IP>` with an IP address by which CSM Authorization can reach the Vault server. 
This may be the address of the Docker host where the Vault server will be running. 

```shell
cat > cert.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
subjectAltName = @alt_names
[alt_names]
DNS.1 = vault-demo-server
IP.1 = 127.0.0.1
IP.2 = <external IP>
EOF

openssl x509 -req \
	-CA server-ca.crt -CAkey server-ca.key \
	-in server.csr \
	-out server.crt \
	-days 365 \
	-extfile cert.ext \
	-CAcreateserial

cat server-ca.crt >> server.crt
```

Create client CA private key and certificate:

```shell
openssl req -x509 -sha256 -days 365 -newkey rsa:2048 -nodes \
	-subj "/CN=Client Root CA" \
	-keyout client-ca.key \
	-out client-ca.crt
```

Create client private key and CSR:

```shell
openssl req -newkey rsa:2048 -nodes \
	-subj "/CN=vault-client" \
	-keyout client.key \
	-out client.csr
```

Create client certificate signed by the CA:
// todo check ip?
```shell
cat > cert.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
subjectAltName = @alt_names
[alt_names]
DNS.1 = vault-client
IP.1 = 127.0.0.1
EOF

openssl x509 -req \
	-CA client-ca.crt -CAkey client-ca.key \
	-in client.csr \
	-out client.crt \
	-days 365 \
	-extfile cert.ext \
	-CAcreateserial

cat client-ca.crt >> client.crt
```

### Create server hcl file

```shell
cat >server.hcl <<EOF
storage "inmem" {}

listener "tcp" {
	address = "0.0.0.0:8400"
	tls_disable = "false"
	tls_cipher_suites = "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"
	tls_min_version = "tls12"
	tls_cert_file = "/var/vault/server.crt"
	tls_key_file  = "/var/vault/server.key"
	tls_client_ca_file = "/var/vault/client-ca.crt"
	tls_require_and_verify_client_cert = "true"
}

disable_mlock = true
api_addr = "http://127.0.0.1:8200"
ui = true
EOF
```

### Start Vault Server

> Variable `CONF_DIR` below refers to the directory containing files *server.crt*, *server.key*, *client-ca.crt* and *server.hcl*.
```shell
VOL_DIR="$CONF_DIR"
VOL_DIR_D="/var/vault"
ROOT_TOKEN="DemoRootToken"
VAULT_IMG="vault:1.13.3"

docker run --rm -d \
	--name="vault-server" \
	-p 8200:8200 -p 8400:8400 \
	-v $VOL_DIR:$VOL_DIR_D -w $VOL_DIR_D \
	-e VAULT_DEV_ROOT_TOKEN_ID=$ROOT_TOKEN \
	-e VAULT_ADDR="http://127.0.0.1:8200" \
	-e VAULT_TOKEN=$ROOT_TOKEN \
	$VAULT_IMG \
	sh -c 'vault server -dev -dev-listen-address 0.0.0.0:8200 -config=server.hcl'
```

## Minimum Server Configuration

> **NOTE:** this configuration is a bare minimum to support CSM Authorization and is not intended for use in production environment. 
Refer to the [Hashicorp Vault documentation](https://www.vaultproject.io/docs) for recommended configuration options.

> If a [test instance of Vault](#vault-server-installation) is used, the `vault` commands below can be executed in the Vault server container shell.
> To enter the shell, run `docker exec -it vault-server sh`. After completing the configuration process, exit the shell by typing `exit`.
>
> Alternatively, you can [download the vault binary](https://www.vaultproject.io/downloads) and run it anywhere. 
> It will require two environment variables to communicate with the Vault server:
> - `VAULT_ADDR` - URL similar to `http://127.0.0.1:8200`. You may need to change the address in the URL to the address of 
the Docker host where the server is running.
> - `VAULT_TOKEN` - Authentication token, e.g. the root token `DemoRootToken` used in the [test instance of Vault](#vault-server-installation).

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
  bound_service_account_names=storage-service \
  bound_service_account_namespaces=authorization \
  policies=csm-authorization
```

The role needs to be:
- bound to the `storage-service` service account
- bound to the namespace where CSM Authorization will be deployed
- reference the policy that has read access to the storage credentials.

### Write a secret

```shell
vault kv put -mount=csm-authorization /storage/powerflex/systemid1 username=user password=pass
```

The username must use the key `username` and the password must use the key `password`.

## Token TTL Considerations

Effective client token TTL is determined by the Vault server based on multiple factors which are described in the [Vault documentation](https://www.vaultproject.io/docs/concepts/tokens#token-time-to-live-periodic-tokens-and-explicit-max-ttls).

With the default server settings, role level values control TTL in this way:

`token_explicit_max_ttl=2h` - limits the client token TTL to 2 hours since it was originally issues as a result of login. This is a hard limit.

`token_ttl=30m` - sets the default client token TTL to 30 minutes. 30 minutes are counted from the login time and from any following token renewal. 
The client token will only be able to renew 3 times before reaching it total allowed TTL of 2 hours.

Existing role values can be changed using `vault write auth/kubernetes/role/csm-authorization token_ttl=30m token_explicit_max_ttl=2h`.
