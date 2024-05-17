---
title: "Encryption"
linkTitle: "Encryption"
weight: 1
Description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Encryption Helm deployment
---
Encryption for Dell Container Storage Modules is enabled via the Dell CSI driver installation. The drivers can be installed either by a Helm chart or by the Dell CSM Operator. 
In the tech preview release, Encryption can only be enabled via Helm chart installation.

Except for additional Encryption related configuration outlined on this page, 
the rest of the deployment process is described in the correspondent [CSI driver documentation](../../../drivers/installation/).

## Vault Server

Hashicorp Vault must be [pre-configured](vault) to support Encryption. The Vault server's IP address and port must be accessible 
from the Kubernetes cluster where the CSI driver is to be deployed.

## Rekey Controller

The Encryption Rekey CRD Controller is an optional component that, if installed, allows encrypted volumes rekeying in a
Kubernetes cluster. Please refer to [Rekey Configuration](rekey) for the Rekey Controller installation details.

## Helm Chart Values

The drivers that support Encryption via Helm chart have an `encryption` block in their *values.yaml* file that looks like this:

```yaml
encryption:
  # enabled: Enable/disable volume encryption feature.
  enabled: false

  # pluginName: The name of the provisioner to use for encrypted volumes.
  pluginName: "sec-isilon.dellemc.com"

  # logLevel: Log level of the encryption driver.
  # Allowed values: "error", "warning", "info", "debug", "trace".
  logLevel: "error"

  # apiPort: TCP port number used by the REST API server.
  apiPort: 3838

  # logLevel: Log level of the encryption driver.
  # Allowed values: "error", "warning", "info", "debug", "trace".
  logLevel: "debug"

  # livenessPort: HTTP liveness probe port number. 
  # Leave empty to disable the liveness probe.
  # Example: 8080
  livenessPort:

  # ocp: Enable when running on OpenShift Container Platform with CoreOS worker nodes.
  ocp: false

  # ocpCoreID: User ID and group ID of user core on CoreOS worker nodes.
  # Ignored when ocp is set to false.
  ocpCoreID: "1000:1000"
 
  # extraArgs: Extra command line parameters to pass to the encryption driver.
  # Allowed values:
  # --sharedStorage - may be required by some applications to work properly.
  # When set, performance is reduced and hard links cannot be created.
  # See the gocryptfs documentation for more details.
  extraArgs: []
```

| Parameter | Description | Required | Default |
| --------- | ----------- | -------- | ------- |  
| enabled | Enable/disable volume encryption feature. | No | false |
| pluginName | The name of the provisioner to use for encrypted volumes. | No | "sec-isilon.dellemc.com" |
| image | Encryption driver image name. | No | "dellemc/csm-encryption:v0.3.0" |
| logLevel | Log level of the encryption driver.<br/>Allowed values: "error", "warning", "info", "debug", "trace". | No | "error" |
| apiPort | TCP Port number used by the REST API Server. | No | 3838 |
| livenessPort | HTTP liveness probe port number. Leave empty to disable the liveness probe. | No | |
| ocp | Enable when running an OCP Platform with CoreOS worker nodes. | No | false |
| ocpCoreID | User ID and group ID of user core on CoreOS worker nodes. Ignored when ocp is set to false. | No | "1000:1000" |
| extraArgs | Extra command line parameters to pass to the encryption driver.<br/>Allowed values:<br/>"\-\-sharedStorage" - may be required by some applications to work properly.<br/>When set, performance is reduced and hard links cannot be created.<br/>See the [gocryptfs documentation](https://github.com/rfjakob/gocryptfs/blob/v2.2.1/Documentation/MANPAGE.md#-sharedstorage) for more details. | No | [] |

## Secrets and Config Maps

Apart from any secrets and config maps described in the CSI driver documentation, these resources should be created for Encryption:

### Secret *encryption-license*

Request a trial license following instructions on the [License page](../../../../../deployment/helm/modules/installation/encryption/). You will be provided with a YAML file similar to:

```yaml
apiVersion: v1
data:
  license: k1FXzMDZodGNnK4I12Alo4UvuhLd+ithRhuLz2eoIxlcMSfW0xJYWnBiNMvTUl8VdGmR5fsvs2L6KqPfpIJk4wOzCxQ9wfDIJuYqrwV0wi2F2lzb1Hkk7O7/4r8cblPdCRJWfbg8QFc2BVtl4PZ/pFkHZoZVCbhGDD1MsbI1CiKqva9r9TBfswSFnqv7p3QXgbqQov8/q/j2+sHcvFF3j4kx+q1PzXoRNxwuTQaP4VAvipsQNAU5yV2dos2hs4Y/Ltbtreu/vrRGUaxvPbass1vUtIOJnvKkfbp53j8PFJGGISMYvYylUiD7TpoamxT/1I6mkjgRds+tEciMvutqDpmKEtdyp3vBjt4Sgd07ptvsdBJlyRAYb8ZPX9vXr4Ws
kind: Secret
metadata:
  name: edit_name
  namespace: edit_namespace
```

Set `name` to `"encryption-license"` and `namespace` to your driver namespace and apply the file:

```shell
kubectl apply -f <license yaml file name>
```

### Secret *vault-auth*

A secret with the AppRole credentials used by Encryption to authenticate to the Vault server.

> Set `role_id` and `secret_id` to the values provided by the Vault server administrator.

> If a self-managed test Vault instance is used, generate role ID and secret ID following [these steps](vault/#set-role-id-and-secret-id-to-the-role).

```shell
cat >auth.json <<EOF
{
	"role_id": "<role ID>",
	"secret_id": "<secret ID>"
}
EOF

kubectl create secret generic vault-auth -n <driver namespace> --from-file=auth.json -o yaml --dry-run=client | kubectl apply -f -

rm -f auth.json
```
In this release, Encryption does not pick up modifications to this secret while the CSI driver is running, unless it needs to re-login which happens at:
- CSI Driver startup
- an authentication error from the Vault server
- client token expiration

In all other cases, to apply new values in the secret (e.g., to use another role), the CSI driver must be restarted.

### Secret *vault-cert*

A secret with TLS certificates used by Encryption to communicate with the Vault server.

> Files *server-ca.crt*, *client.crt* and *client.key* should be in PEM format.

```shell
kubectl create secret generic vault-cert -n <driver namespace> \
	--from-file=server-ca.crt --from-file=client.crt --from-file=client.key \
	-o yaml --dry-run=client | kubectl apply -f -
```
In this release, Encryption does not pick up modifications to this secret while the CSI driver is running. 
To apply new values in the secret (e.g., to update the client certificate), the CSI driver must be restarted.

### ConfigMap *vault-client-conf*

A config map with settings used by Encryption to communicate with the Vault server.

> Populate *client.json* with your settings.

```shell
cat >client.json <<EOF
{
	"auth_type": "approle",
	"auth_conf_file": "/etc/dea/vault/auth.json",
	"vault_addr": "https://<vault server address>:8400",
	"kv_engine_path": "/dea-keys",
	"tls_config":
	{
		"client_crt": "/etc/dea/vault/client.crt",
		"client_key": "/etc/dea/vault/client.key",
		"server_ca": "/etc/dea/vault/server-ca.crt"
	}
}
EOF

kubectl create configmap vault-client-conf -n <driver namespace> \
  --from-file=client.json -o yaml --dry-run=client | kubectl apply -f -

rm -f client.json
```

These fields are available for use in *client.json*:

| client.json field | Description | Required | Default |
| ----------------- | ----------- | -------- | ------- |
| auth_type | Authentication type used to authenticate to the Vault server. Currently, the only supported type is "approle". | Yes | |
| auth_conf_file | Set to "/etc/dea/vault/auth.json" | Yes | |
| auth_timeout | Defines in how many seconds key requests to the Vault server fail if there is no valid authentication token. | No | 5 |
| lease_duration_margin | Defines how many seconds in advance the authentication token lease will be renewed. This value should accommodate network and processing delays. | No | 15 |
| lease_increase | Defines the number of seconds used in the authentication token renew call. This value is advisory and may be disregarded by the server. | No | 3600 |
| vault_addr | URL to use for REST calls to the Vault server. It must start with "https". | Yes | |
| kv_engine_path | The path to which the Key/Value secret engine is mounted on the Vault server. | Yes | |
| tls_config.client_crt | Set to "/etc/dea/vault/client.crt" | Yes | |
| tls_config.client_key | Set to "/etc/dea/vault/client.key" | Yes | |
| tls_config.client_ca | Set to "/etc/dea/vault/server-ca.crt" | Yes  | |

