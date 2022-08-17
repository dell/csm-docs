---
title: "Vault Configuration"
linkTitle: "Vault Configuration"
weight: 3
Description: >
  Configuration requirements for Vault server.
---

## Vault Server Installation

If there is already a Vault server available, skip to [Minimum Server Configuration](#minimum-server-configuration).

If there is no Vault server available to use with Encryption, it can be installed in many ways following [Hashicorp Vault documentation](https://www.vaultproject.io/docs).

For testing environment, however, a simple deployment suggested in this section may suffice. 
It creates a standalone server with in-memory (non-persistent) storage, running in a Docker container.

> **NOTE**: With in-memory storage, the encryption keys are permanently destroyed upon the server termination.

#### Generate TLS certificates for server and client

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

> Replace `<external IP>` with an IP address by which Encryption can reach the Vault server. 
This may be the address of the Docker host where the Vault server will be running. 
The same address should be used for `vault_addr` in [vault-client-conf](../deployment#configmap-vault-client-conf).

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

#### Create server hcl file

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

#### Start Vault Server

> Variable `CONF_DIR` below refers to the directory containing files *server.crt*, *server.key*, *client-ca.crt* and *server.hcl*.
```shell
VOL_DIR="$CONF_DIR"
VOL_DIR_D="/var/vault"
ROOT_TOKEN="DemoRootToken"
VAULT_IMG="vault:1.9.3"

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

> **NOTE:** this configuration is a bare minimum to support Encryption and is not intended for use in production environment. 
Refer to the [Hashicorp Vault documentation](https://www.vaultproject.io/docs) for recommended configuration options.

> If a [test instance of Vault](#vault-server-installation) is used, the `vault` commands below can be executed in the Vault server container shell.
> To enter the shell, run `docker exec -it vault-server sh`. After completing the configuration process, exit the shell by typing `exit`.
>
> Alternatively, you can [download the vault binary](https://www.vaultproject.io/downloads) and run it anywhere. 
> It will require two environment variables to communicate with the Vault server:
> - `VAULT_ADDR` - URL similar to `http://127.0.0.1:8200`. You may need to change the address in the URL to the address of 
the Docker host where the server is running.
> - `VAULT_TOKEN` - Authentication token, e.g. the root token `DemoRootToken` used in the [test instance of Vault](#vault-server-installation).

#### Enable Key/Value secret engine

```shell
vault secrets enable -version=2 -path=dea-keys/ kv
vault write /dea-keys/config cas_required=true max_versions=1 
```

Key/Value secret engine is used to store encryption keys. Each encryption key is represented by a key-value entry. 

#### Enable AppRole authentication

```shell
vault auth enable approle
```

#### Create a role

```shell
vault write auth/approle/role/dea-role \
	secret_id_ttl=28d \
	token_num_uses=0 \
	token_ttl=1h \
	token_max_ttl=1h \
	token_explicit_max_ttl=10d \
	secret_id_num_uses=0
```

TTL values here are chosen arbitrarily and can be changed to desired values.

#### Create and assign a token policy to the role

```shell
vault policy write dea-policy - <<EOF
path "dea-keys/*" {
	capabilities = ["create", "read", "update", "delete", "list"]
}
path "dea-keys/config" {
	capabilities = ["read"]
}
EOF

vault write auth/approle/role/dea-role token_policies="dea-policy"
```

The role needs full access to the Key/Value secret engine to perform encryption key operations.
The role only needs read access to the Key/Value secret engine config endpoint for configuration validation.

#### Set role ID and secret ID to the role

Role ID and secret ID are normally generated by Vault. To get the generated values, run these commands:
```shell
vault read auth/approle/role/dea-role/role-id
vault write -f auth/approle/role/dea-role/secret-id
```

In test environment, pre-defined role ID and secret ID can be set, for example `demo-role-id` and `demo-secret-id`: 
```shell
vault write auth/approle/role/dea-role/role-id role_id=demo-role-id
vault write auth/approle/role/dea-role/custom-secret-id secret_id=demo-secret-id
```

> Secret ID has an expiration time after which it becomes invalid resulting in [authorization failure](../troubleshooting#expired-approle-secret-id).
> The expiration time for new secret IDs can be set in `secret_id_ttl` parameter when [the role is created](#create-a-role) or later on using
> `vault write auth/approle/role/dea-role/secret-id-ttl secret_id_ttl=24h`.

## Token TTL Considerations

Effective client token TTL is determined by the Vault server based on multiple factors which are described in the [Vault documentation](https://www.vaultproject.io/docs/concepts/tokens#token-time-to-live-periodic-tokens-and-explicit-max-ttls).

With the default server settings, role level values control TTL in this way:

`token_explicit_max_ttl=2h` - limits the client token TTL to 2 hours since it was originally issues as a result of login. This is a hard limit.

`token_ttl=30m` - sets the default client token TTL to 30 minutes. 30 minutes are counted from the login time and from any following token renewal. 
The client token will only be able to renew 3 times before reaching it total allowed TTL of 2 hours.

Existing role values can be changed using `vault write auth/approle/role/dea-role token_ttl=30m token_explicit_max_ttl=2h`.

> Selecting too short TTL values will result in excessive overhead in Encryption to remain authenticated to the Vault server.
