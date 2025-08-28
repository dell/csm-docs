---
title: Authorization
linktitle: Authorization
weight: 3
description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization Upgrade
---
{{% pageinfo color="primary" %}}
{{< message text="2" >}}
{{% /pageinfo %}}
This section outlines the upgrade steps for Container Storage Modules (CSM) for Authorization. The upgrade of CSM for Authorization is handled in 2 parts:

- Helm Chart Upgrade
- Upgrading the Dell CSI drivers with CSM for Authorization enabled

## Upgrade Notice: CSM v1.14 → CSM v1.15 (Authorization v2.2.0 → v2.3.0)

Starting with CSM 1.15, CSM Authorization (v2.3.0) requires users to configure storage credentials prior to deployment. This is a mandatory step to ensure proper access to external storage systems.

You can configure storage credentials using one of the following methods:

1. Dynamic Secrets via SecretProviderClass

    Use this method if you are integrating with external secret management systems (e.g., HashiCorp Vault, CyberArk Conjur) through the Secrets Store CSI Driver.

2. Static Credentials via Kubernetes Secret

    Use this method if you prefer to manually manage credentials within Kubernetes.

>__Note__: Only one of SecretProviderClass or Secret can be used at a time.

{{< tabpane text=true lang="en" >}}
{{% tab header="SecretProviderClass" lang="en" %}}
<br>

- Install a supported [External Secret Provider](https://secrets-store-csi-driver.sigs.k8s.io/getting-started/installation#install-external-secret-providers) to integrate with the Secrets Store CSI Driver. For guidance on setting up Vault, refer to our [Vault installation guide](docs/getting-started/installation/operator/modules/authorizationv2-0#vault-csi-provider-installation). For Conjur, refer to our [Conjur installation guide](docs/getting-started/installation/operator/modules/authorizationv2-0#conjur-csi-provider-installation).

- Install the [Secrets Store CSI Driver](https://secrets-store-csi-driver.sigs.k8s.io/getting-started/installation) enabling the [`Sync as Kubernetes Secret`](https://secrets-store-csi-driver.sigs.k8s.io/topics/sync-as-kubernetes-secret) and [`Secret Auto Rotation`](https://secrets-store-csi-driver.sigs.k8s.io/topics/secret-auto-rotation) features.
   >__Note__: If you are using Conjur with the Secrets Store CSI Driver, be sure to configure `--set 'tokenRequests[0].audience=conjur'` when installing the Secrets Store CSI Driver.
- Create your own [SecretProviderClass Object](https://secrets-store-csi-driver.sigs.k8s.io/getting-started/usage#create-your-own-secretproviderclass-object) based on your external secret provider. You also have the option to create your own Redis secret in the SecretProviderClass.

- For OpenShift environments, label the namespace:

   ```sh
   kubectl label namespace authorization \
    pod-security.kubernetes.io/enforce=privileged \
    security.openshift.io/MinimallySufficientPodSecurityStandard=privileged \
    --overwrite
   ```

  {{< collapse id="2" title="Minimal SecretProviderClass configuration: includes only array-based credentials" card="false" >}}

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

  {{< collapse id="3" title="SecretProviderClass configuration with array-based and Redis credentials" card="false" >}}

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
<br>

## Helm Chart Upgrade

1. To upgrade an existing Helm installation of CSM for Authorization to the latest release, download the latest Helm charts.

    ```bash
    helm repo update
    ```

2. Check if the latest Helm chart version is available:

    ```bash
    helm search repo dell
    ```

    ```bash
    NAME                            CHART VERSION   APP VERSION     DESCRIPTION
    dell/csm-authorization          1.14.0          1.14.0          CSM for Authorization is part of the [Container...
    ```

3. Ensure your myvalues.yaml file is updated to align with the latest configuration changes—this includes adding new parameters, removing deprecated ones, and adjusting any modified values introduced in the upgrade.

4. Upgrade to the latest CSM for Authorization release:

    ```bash
    helm upgrade --version $latest_chart_version -f myvalues.yaml authorization dell/csm-authorization -n authorization
    ```

## Upgrading Dell CSI Driver(s) with CSM for Authorization enabled

Given a setup where the CSM for Authorization proxy server is already upgraded to the latest version, follow the upgrade instructions for the applicable CSI Driver(s) to upgrade the driver and the CSM for Authorization sidecar

- [Upgrade CSI driver](../../../helm)
