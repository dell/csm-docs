---
title: Authorization v1.x
linktitle: "Authorization v1.x"
description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization Helm deployment
---
{{% pageinfo color="primary" %}}
1. <span><span/>{{< message text="1" >}}

2. <span><span/>{{< message text="5" >}}
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
1. Create a namespace where you want to install CSM Authorization.
   ```bash
   kubectl create namespace authorization
   ```

2. Add the Dell Helm Charts repo
   ```bash
     helm repo add dell https://dell.github.io/helm-charts
   ```

3. Prepare `samples/csm-authorization/config.yaml` which contains the JWT signing secret. The following table lists the configuration parameters.

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

4. Copy the default values.yaml file `cp charts/csm-authorization/values.yaml myvalues.yaml`

5. Look over all the fields in `myvalues.yaml` and fill in/adjust any as needed.

| Parameter                                         | Description                                                                                                                  | Required | Default                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------- |
| **ingress-nginx**                                 | This section configures the enablement of the NGINX Ingress Controller.                                                      | -        | -                                         |
| enabled                                           | Enable/Disable deployment of the NGINX Ingress Controller. Set to false if you already have an Ingress Controller installed. | No       | true                                      |
| **cert-manager**                                  | This section configures the enablement of cert-manager.                                                                      | -        | -                                         |
| enabled                                           | Enable/Disable deployment of cert-manager. Set to false if you already have cert-manager installed.                          | No       | true                                      |
| **authorization**                                 | This section configures the CSM-Authorization components.                                                                    | -        | -                                         |
| authorization.images.proxyService                 | The image to use for the proxy-service.                                                                                      | Yes      | quay.io/dell/container-storage-modules/csm-authorization-proxy:nightly   |
| authorization.images.tenantService                | The image to use for the tenant-service.                                                                                     | Yes      | quay.io/dell/container-storage-modules/csm-authorization-tenant:nightly  |
| authorization.images.roleService                  | The image to use for the role-service.                                                                                       | Yes      | quay.io/dell/container-storage-modules/csm-authorization-proxy:nightly   |
| authorization.images.storageService               | The image to use for the storage-service.                                                                                    | Yes      | quay.io/dell/container-storage-modules/csm-authorization-storage:nightly |
| authorization.images.opa                          | The image to use for Open Policy Agent.                                                                                      | Yes      | openpolicyagent/opa                       |
| authorization.images.opaKubeMgmt                  | The image to use for Open Policy Agent be-mgmt.                                                                              | Yes      | openpolicyagent/kube-mgmt:8.5.8           |
| authorization.hostname                            | The hostname to configure the self-signed certificate (if applicable) and the proxy Ingress.                                 | Yes      | csm-authorization.com                     |
| authorization.logLevel                            | CSM Authorization log level. Allowed values: “error”, “warn”/“warning”, “info”, “debug”.                                     | Yes      | debug                                     |
| concurrentPowerFlexRequests                       | Number of concurrent requests to PowerFlex. Used with dellctl to list tenant volumes.                                        | Yes      | 10                                        |
| authorization.zipkin.collectoruri                 | The URI of the Zipkin instance to export traces.                                                                             | No       | -                                         |
| authorization.zipkin.probability                  | The ratio of traces to export.                                                                                               | No       | -                                         |
| authorization.proxyServerIngress.ingressClassName | The ingressClassName of the proxy-service Ingress.                                                                           | Yes      | -                                         |
| authorization.proxyServerIngress.hosts            | Additional host rules to be applied to the proxy-service Ingress.                                                            | No       | -                                         |
| authorization.proxyServerIngress.annotations      | Additional annotations for the proxy-service Ingress.                                                                        | No       | -                                         |
| **redis**                                         | This section configures Redis.                                                                                               | -        | -                                         |
| redis.images.redis                                | The image to use for Redis.                                                                                                  | Yes      | redis:7.4.0-alpine                        |
| redis.images.commander                            | The image to use for Redis Commander.                                                                                        | Yes      | rediscommander/redis-commander:latest     |
| redis.storageClass                                | The storage class for Redis to use for persistence. If not supplied, a locally provisioned volume is used.                   | No       | -                                         |

>__Note__:
> - If you specify `redis.storageClass`, the storage class must NOT be provisioned by the Dell CSI Driver to be configured with this installation of CSM Authorization.

1. Install the driver using `helm`:

To install CSM Authorization with the service Ingresses using your own certificate, run:

```bash

helm -n authorization install authorization -f myvalues.yaml charts/csm-authorization \
--set-file authorization.certificate=<location-of-certificate-file> \
--set-file authorization.privateKey=<location-of-private-key-file>
```

To install CSM Authorization with the service Ingresses using a self-signed certificate generated via cert-manager, run:

```bash

helm -n authorization install authorization -f myvalues.yaml charts/csm-authorization
```

## Install Karavictl

1. Download the latest release of karavictl

```bash

curl -LO https://github.com/dell/karavi-authorization/releases/latest/download/karavictl
```

2. Install karavictl

```bash
sudo install -o root -g root -m 0755 karavictl /usr/local/bin/karavictl
```

If you do not have root access on the target system, you can still install karavictl to the ~/.local/bin directory:

```bash
chmod +x karavictl
mkdir -p ~/.local/bin
mv ./karavictl ~/.local/bin/karavictl
# and then append (or prepend) ~/.local/bin to $PATH
```

Karavictl commands and intended use can be found [here](../../../../../authorization/v1.x/cli/).

## Configuring the CSM Authorization Proxy Server

The first part of CSM for Authorization deployment is to configure the proxy server. This is controlled by the Storage Administrator.

Configuration is achieved by using `karavictl` to connect to the proxy service. In this example, we will be referencing an installation using `csm-authorization.com` as the authorization.hostname value and the NGINX Ingress Controller accessed via the cluster's master node.

Run `kubectl -n authorization get ingress` and `kubectl -n authorization get service` to see the Ingress rules for these services and the exposed port for accessing these services via the LoadBalancer. For example:

```bash
kubectl -n authorization get ingress
```
```
NAME              CLASS   HOSTS                           ADDRESS   PORTS     AGE
proxy-server      nginx   csm-authorization.com                     00, 000   86s
```
```bash
kubectl -n authorization get service
```
```
NAME                                               TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
authorization-cert-manager                         ClusterIP      00.000.000.000    <none>        000/TCP                     28s
authorization-cert-manager-webhook                 ClusterIP      00.000.000.000    <none>        000/TCP                      27s
authorization-ingress-nginx-controller             LoadBalancer   00.000.000.000    <pending>     00:00000/TCP,000:00000/TCP   27s
authorization-ingress-nginx-controller-admission   ClusterIP      00.000.000.000    <none>        000/TCP                      27s
proxy-server                                       ClusterIP      00.000.000.000    <none>        000/TCP                     28s
redis                                              ClusterIP      00.000.000.000    <none>        000/TCP                     28s
redis-commander                                    ClusterIP      00.000.000.000    <none>        000/TCP                     27s
role-service                                       ClusterIP      00.000.000.000    <none>        000/TCP                    27s
storage-service                                    ClusterIP      00.000.000.000    <none>        000/TCP                    27s
tenant-service                                     ClusterIP      00.000.000.000    <none>        000/TCP                    28s
```

On the machine running `karavictl`, the `/etc/hosts` file needs to be updated with the Ingress hosts for the proxy, storage, and role services. For example:

```bash
<master_node_ip> csm-authorization.com
```

Please continue following the steps outlined in the [proxy server](../../../../../authorization/v1.x/configuration/proxy-server) configuration.

## Configuring a Dell CSI Driver with CSM for Authorization

The second part of CSM for Authorization deployment is to configure one or more of the [supported](../../../../../authorization#supported-csi-drivers) CSI drivers. This is controlled by the Kubernetes tenant admin.

Please continue following the configuration steps for a specific CSI Driver [here](../../../../../authorization/v1.x/configuration/).

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

>__Note__: If you are updating the signing secret, the tenants need to be updated with new tokens via the `karavictl generate token` command.

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
