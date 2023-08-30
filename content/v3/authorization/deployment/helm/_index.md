---
title: Helm
linktitle: Helm
description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization Helm deployment
---

{{% pageinfo color="primary" %}}
The CSM Authorization karavictl CLI is no longer actively maintained or supported. It will be deprecated in CSM 1.9.
{{% /pageinfo %}}

CSM Authorization can be installed by using the provided Helm v3 charts on Kubernetes platforms. 

The following CSM Authorization components are installed in the specified namespace:
- proxy-service, which forwards requests from the CSI Driver to the backend storage array
- tenant-service, which configures tenants, role bindings, and generates JSON Web Tokens
- role-service, which configures roles for tenants to be bound to
- storage-service, which configures backend storage arrays for the proxy-server to foward requests to

The following third-party components are installed in the specified namespace:
- redis, which stores data regarding tenants and their volume ownership, quota, and revokation status
- redis-commander, a web management tool for Redis

The following third-party components are optionally installed in the specified namespace:
- cert-manager, which optionally provides a self-signed certificate to configure the CSM Authorization Ingresses
- nginx-ingress-controller, which fulfills the CSM Authorization Ingresses

## Install CSM Authorization

**Steps**
1. Run `git clone https://github.com/dell/helm-charts.git` to clone the git repository.

2. Ensure that you have created a namespace where you want to install CSM Authorization. You can run `kubectl create namespace authorization` to create a new one.

3. Prepare `samples/csm-authorization/config.yaml` which contains the JWT signing secret. The following table lists the configuration parameters.

    | Parameter | Description                                                  | Required | Default |
    | --------- | ------------------------------------------------------------ | -------- | ------- |
    | web.jwtsigningsecret  | String used to sign JSON Web Tokens                       | true     | secret       |.

    Example:

    ```yaml
    web:
      jwtsigningsecret: randomString123
    ```

    After editing the file, run the following command to create a secret called `karavi-config-secret`:
    
    `kubectl create secret generic karavi-config-secret -n authorization --from-file=config.yaml=samples/csm-authorization/config.yaml`

    Use the following command to replace or update the secret:

    `kubectl create secret generic karavi-config-secret -n authorization --from-file=config.yaml=samples/csm-authorization/config.yaml -o yaml --dry-run=client | kubectl replace -f -`
   
4. Copy the default values.yaml file `cp charts/csm-authorization/values.yaml myvalues.yaml`

5. Look over all the fields in `myvalues.yaml` and fill in/adjust any as needed.

| Parameter                | Description                                                                                                                                                                                                                                                                                                                                                                                                    | Required | Default |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| **ingress-nginx**           | This section configures the enablement of the NGINX Ingress Controller.              | -        | -       |
| enabled | Enable/Disable deployment of the NGINX Ingress Controller. Set to false if you already have an Ingress Controller installed. | No | true |
| **cert-manager**           | This section configures the enablement of cert-manager.              | -        | -       |
| enabled | Enable/Disable deployment of cert-manager. Set to false if you already have cert-manager installed. | No | true |
| **authorization**           | This section configures the CSM-Authorization components.              | -        | -       |
| authorization.images.proxyService | The image to use for the proxy-service. | Yes | dellemc/csm-authorization-proxy:nightly |
| authorization.images.tenantService | The image to use for the tenant-service. | Yes | dellemc/csm-authorization-tenant:nightly |
| authorization.images.roleService | The image to use for the role-service. | Yes | dellemc/csm-authorization-proxy:nightly |
| authorization.images.storageService | The image to use for the storage-service. | Yes | dellemc/csm-authorization-storage:nightly |
| authorization.images.opa | The image to use for Open Policy Agent. | Yes | openpolicyagent/opa |
| authorization.images.opaKubeMgmt | The image to use for Open Policy Agent kube-mgmt. | Yes | openpolicyagent/kube-mgmt:0.11 |
| authorization.hostname | The hostname to configure the self-signed certificate (if applicable) and the proxy, tenant, role, and storage service Ingresses. | Yes | csm-authorization.com |
| authorization.logLevel | CSM Authorization log level. Allowed values: “error”, “warn”/“warning”, “info”, “debug”. | Yes | debug |
| authorization.zipkin.collectoruri | The URI of the Zipkin instance to export traces. | No | - |
| authorization.zipkin.probability | The ratio of traces to export. | No | - |
| authorization.proxyServerIngress.ingressClassName | The ingressClassName of the proxy-service Ingress. | Yes | - |
| authorization.proxyServerIngress.hosts | Additional host rules to be applied to the proxy-service Ingress.  | No | - |
| authorization.proxyServerIngress.annotations | Additional annotations for the proxy-service Ingress. | No | - |
| authorization.tenantServiceIngress.ingressClassName | The ingressClassName of the tenant-service Ingress. | Yes | - |
| authorization.tenantServiceIngress.hosts | Additional host rules to be applied to the tenant-service Ingress.  | No | - |
| authorization.tenantServiceIngress.annotations | Additional annotations for the tenant-service Ingress. | No | - |
| authorization.roleServiceIngress.ingressClassName | The ingressClassName of the role-service Ingress. | Yes | - |
| authorization.roleServiceIngress.hosts | Additional host rules to be applied to the role-service Ingress.  | No | - |
| authorization.roleServiceIngress.annotations | Additional annotations for the role-service Ingress. | No | - |
| authorization.storageServiceIngress.ingressClassName | The ingressClassName of the storage-service Ingress. | Yes | - |
| authorization.storageServiceIngress.hosts | Additional host rules to be applied to the storage-service Ingress.  | No | - |
| authorization.storageServiceIngress.annotations | Additional annotations for the storage-service Ingress. | No | - |
| **redis**           | This section configures Redis.              | -        | -       |
| redis.images.redis | The image to use for Redis. | Yes | redis:6.0.8-alpine |
| redis.images.commander | The image to use for Redis Commander. | Yes | rediscommander/redis-commander:latest |
| redis.storageClass | The storage class for Redis to use for persistence. If not supplied, the default storage class is used. | No | - |

 *NOTE*: 
- The tenant, role, and storage services use GRPC. If the Ingress Controller requires annotations to support GRPC, they must be supplied.

6. Install the driver using `helm`:

To install CSM Authorization with the service Ingresses using your own certificate, run:

```
helm -n authorization install authorization -f myvalues.yaml charts/csm-authorization \
--set-file authorization.certificate=<location-of-certificate-file> \
--set-file authorization.privateKey=<location-of-private-key-file>
```

To install CSM Authorization with the service Ingresses using a self-signed certificate generated via cert-manager, run:

```
helm -n authorization install authorization -f myvalues.yaml charts/csm-authorization
```

## Install Karavictl

1. Download the latest release of karavictl

```
curl -LO https://github.com/dell/karavi-authorization/releases/latest/download/karavictl
```

2. Install karavictl

```
sudo install -o root -g root -m 0755 karavictl /usr/local/bin/karavictl
```

If you do not have root access on the target system, you can still install karavictl to the ~/.local/bin directory:

```
chmod +x karavictl
mkdir -p ~/.local/bin
mv ./karavictl ~/.local/bin/karavictl
# and then append (or prepend) ~/.local/bin to $PATH
```

Karavictl commands and intended use can be found [here](../../cli/). 

## Configuring the CSM Authorization Proxy Server

The storage administrator must first configure the proxy server with the following:
- Storage systems
- Tenants
- Roles
- Role bindings

This is done using `karavictl` to connect to the storage, tenant, and role services. In this example, we will be referencing an installation using `csm-authorization.com` as the authorization.hostname value and the NGINX Ingress Controller accessed via the cluster's master node.

Run `kubectl -n authorization get ingress` and `kubectl -n authorization get service` to see the Ingress rules for these services and the exposed port for accessing these services via the LoadBalancer. For example:

```
# kubectl -n authorization get ingress
NAME              CLASS   HOSTS                           ADDRESS   PORTS     AGE
proxy-server      nginx   csm-authorization.com                     00, 000   86s
role-service      nginx   role.csm-authorization.com                00, 000   86s
storage-service   nginx   storage.csm-authorization.com             00, 000   86s
tenant-service    nginx   tenant.csm-authorization.com              00, 000   86s

# kubectl -n auth get service
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

On the machine running `karavictl`, the `/etc/hosts` file needs to be updated with the Ingress hosts for the storage, tenant, and role services. For example:

```
<master_node_ip> tenant.csm-authorization.com
<master_node_ip> role.csm-authorization.com
<master_node_ip> storage.csm-authorization.com
```

The port that exposes these services is `30016`.


### Configure Storage

A `storage` entity in CSM Authorization consists of the storage type (PowerFlex, PowerMax, PowerScale), the system ID, the API endpoint, and the credentials. For example, to create PowerFlex storage:

```
karavictl storage create --type powerflex --endpoint https://10.0.0.1 --system-id ${systemID} --user ${user} --password ${password} --insecure --array-insecure --addr storage.csm-authorization.com:30016
```

 *NOTE*: 
- The `insecure` flag specifies to skip certificate validation when connecting to the CSM Authorization storage service. The `array-insecure` flag specifies to skip certificate validation when proxy-service connects to the backend storage array. Run `karavictl storage create --help` for help.

### Configuring Tenants

A `tenant` is a Kubernetes cluster that a role will be bound to. For example, to create a tenant named `Finance`:

```
karavictl tenant create --name Finance --insecure --addr tenant.csm-authorization.com:30016
```

 *NOTE*: 
- The `insecure` flag specifies to skip certificate validation when connecting to the tenant service. Run `karavictl tenant create --help` for help.

### Configuring Roles

A `role` consists of a name, the storage to use, and the quota limit for the storage pool to be used. For example, to create a role named `FinanceRole` using the PowerFlex storage created above with a quota limit of 100GB in storage pool `myStoragePool`:

```
karavictl role create --insecure --addr role.csm-authorization.com:30016 --role=FinanceRole=powerflex=${systemID}=myStoragePool=100GB
```

 *NOTE*: 
- The `insecure` flag specifies to skip certificate validation when connecting to the role service. Run `karavictl role create --help` for help.

### Configuring Role Bindings

A `role binding` binds a role to a tenant. For example, to bind the `FinanceRole` to the `Finance` tenant:

```
karavictl rolebinding create --tenant Finance --role FinanceRole --insecure --addr tenant.csm-authorization.com:30016
```

 *NOTE*: 
- The `insecure` flag specifies to skip certificate validation when connecting to the tenant service. Run `karavictl rolebinding create --help` for help.

### Generating a Token

Now that the tenant is bound to a role, a JSON Web Token can be generated for the tenant. For example, to generate a token for the `Finance` tenant:

```
karavictl generate token --tenant Finance --insecure --addr tenant.csm-authorization.com:30016

{
  "Token": "\napiVersion: v1\nkind: Secret\nmetadata:\n  name: proxy-authz-tokens\ntype: Opaque\ndata:\n  access: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKcllYSmhkbWtpTENKbGVIQWlPakUyTlRNek1qUXhPRFlzSW1keWIzVndJam9pWm05dklpd2lhWE56SWpvaVkyOXRMbVJsYkd3dWEyRnlZWFpwSWl3aWNtOXNaWE1pT2lKaVlYSWlMQ0p6ZFdJaU9pSnJZWEpoZG1rdGRHVnVZVzUwSW4wLmJIODN1TldmaHoxc1FVaDcweVlfMlF3N1NTVnEyRzRKeGlyVHFMWVlEMkU=\n  refresh: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKcllYSmhkbWtpTENKbGVIQWlPakUyTlRVNU1UWXhNallzSW1keWIzVndJam9pWm05dklpd2lhWE56SWpvaVkyOXRMbVJsYkd3dWEyRnlZWFpwSWl3aWNtOXNaWE1pT2lKaVlYSWlMQ0p6ZFdJaU9pSnJZWEpoZG1rdGRHVnVZVzUwSW4wLkxNbWVUSkZlX2dveXR0V0lUUDc5QWVaTy1kdmN5SHAwNUwyNXAtUm9ZZnM=\n"
}
```

Process the above response to filter the secret manifest. For example using sed you can run the following:

```
karavictl generate token --tenant Finance --insecure --addr tenant.csm-authorization.com:30016 | sed -e 's/"Token": //' -e 's/[{}"]//g' -e 's/\\n/\n/g'
apiVersion: v1
kind: Secret
metadata:
  name: proxy-authz-tokens
type: Opaque
data:
  access: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKcllYSmhkbWtpTENKbGVIQWlPakUyTlRNek1qUTFOekVzSW1keWIzVndJam9pWm05dklpd2lhWE56SWpvaVkyOXRMbVJsYkd3dWEyRnlZWFpwSWl3aWNtOXNaWE1pT2lKaVlYSWlMQ0p6ZFdJaU9pSnJZWEpoZG1rdGRHVnVZVzUwSW4wLk4tNE42Q1pPbUptcVQtRDF5ZkNGdEZqSmRDRjcxNlh1SXlNVFVyckNOS1U=
  refresh: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKcllYSmhkbWtpTENKbGVIQWlPakUyTlRVNU1UWTFNVEVzSW1keWIzVndJam9pWm05dklpd2lhWE56SWpvaVkyOXRMbVJsYkd3dWEyRnlZWFpwSWl3aWNtOXNaWE1pT2lKaVlYSWlMQ0p6ZFdJaU9pSnJZWEpoZG1rdGRHVnVZVzUwSW4wLkVxb3lXNld5ZEFLdU9mSmtkMkZaMk9TVThZMzlKUFc0YmhfNHc5R05ZNmM=
```

This secret must be applied in the driver namespace. Continue reading the next section for configuring the driver to use CSM Authorization.

## Configuring a Dell CSI Driver with CSM for Authorization

The second part of CSM for Authorization deployment is to configure one or more of the [supported](../../authorization#supported-csi-drivers) CSI drivers. This is controlled by the Kubernetes tenant admin.

### Configuring a Dell CSI Driver

Given a setup where Kubernetes, a storage system, and the CSM for Authorization Proxy Server are deployed, follow the steps below to configure the CSI Drivers to work with the Authorization sidecar:

1. Apply the secret containing the token data into the driver namespace. It's assumed that the Kubernetes administrator has the token secret manifest saved in `/tmp/token.yaml`.

    ```console
    # It is assumed that array type powermax has the namespace "powermax", powerflex has the namepace "vxflexos", and powerscale has the namespace "isilon".
    kubectl apply -f /tmp/token.yaml -n powermax
    kubectl apply -f /tmp/token.yaml -n vxflexos
    kubectl apply -f /tmp/token.yaml -n isilon
   ```

2. Edit the following parameters in samples/secret/karavi-authorization-config.json file in [CSI PowerFlex](https://github.com/dell/csi-powerflex/tree/main/samples), [CSI PowerMax](https://github.com/dell/csi-powermax/tree/main/samples/secret), or [CSI PowerScale](https://github.com/dell/csi-powerscale/tree/main/samples/secret) driver and update/add connection information for one or more backend storage arrays. In an instance where multiple CSI drivers are configured on the same Kubernetes cluster, the port range in the *endpoint* parameter must be different for each driver.

  | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | username | Username for connecting to the backend storage array. This parameter is ignored. | No | - |
   | password | Password for connecting to to the backend storage array. This parameter is ignored. | No | - |
   | intendedEndpoint | HTTPS REST API endpoint of the backend storage array. | Yes | - |
   | endpoint | HTTPS localhost endpoint that the authorization sidecar will listen on. | Yes | https://localhost:9400 |
   | systemID | System ID of the backend storage array. | Yes | " " |
   | skipCertificateValidation  | A boolean that enables/disables certificate validation of the backend storage array. This parameter is not used. | No | true |
   | isDefault | A boolean that indicates if the array is the default array. This parameter is not used. | No | default value from values.yaml |


Create the karavi-authorization-config secret using the following command:

`kubectl -n [CSI_DRIVER_NAMESPACE] create secret generic karavi-authorization-config --from-file=config=samples/secret/karavi-authorization-config.json -o yaml --dry-run=client | kubectl apply -f -`

>__Note__:  
> - Create the driver secret as you would normally except update/add the connection information for communicating with the sidecar instead of the backend storage array and scrub the username and password
> - For PowerScale, the *systemID* will be the *clusterName* of the array. 
>   - The *isilon-creds* secret has a *mountEndpoint* parameter which must be set to the hostname or IP address of the PowerScale OneFS API server, for example, 10.0.0.1.
3. Create the proxy-server-root-certificate secret.

    If running in *insecure* mode, create the secret with empty data:

      `kubectl -n [CSI_DRIVER_NAMESPACE] create secret generic proxy-server-root-certificate --from-literal=rootCertificate.pem= -o yaml --dry-run=client | kubectl apply -f -`

    Otherwise, create the proxy-server-root-certificate secret with the appropriate file:

      `kubectl -n [CSI_DRIVER_NAMESPACE] create secret generic proxy-server-root-certificate --from-file=rootCertificate.pem=/path/to/rootCA -o yaml --dry-run=client | kubectl apply -f -`


>__Note__: Follow the steps below for additional configurations to one or more of the supported CSI drivers. 
#### PowerFlex

Please refer to step 5 in the [installation steps for PowerFlex](../../../csidriver/installation/helm/powerflex) to edit the parameters in samples/config.yaml file to communicate with the sidecar.

1. Update *endpoint* to match the endpoint set in samples/secret/karavi-authorization-config.json

2. Create vxflexos-config secret using the following command:

    `kubectl create secret generic vxflexos-config -n vxflexos --from-file=config=config.yaml -o yaml --dry-run=client | kubectl apply -f -`

Please refer to step 9 in the [installation steps for PowerFlex](../../../csidriver/installation/helm/powerflex) to edit the parameters in *myvalues.yaml* file to communicate with the sidecar.

3. Enable CSM for Authorization and provide *proxyHost* address 

4. Install the CSI PowerFlex driver
#### PowerMax

Please refer to step 7 in the [installation steps for PowerMax](../../../csidriver/installation/helm/powermax) to edit the parameters in *my-powermax-settings.yaml* to communicate with the sidecar. 

1. Update *endpoint* to match the endpoint set in samples/secret/karavi-authorization-config.json

2. Enable CSM for Authorization and provide *proxyHost* address

3. Install the CSI PowerMax driver

#### PowerScale

Please refer to step 5 in the [installation steps for PowerScale](../../../csidriver/installation/helm/isilon) to edit the parameters in *my-isilon-settings.yaml* to communicate with the sidecar. 

1. Update *endpointPort* to match the endpoint port number set in samples/secret/karavi-authorization-config.json

*Notes:*
> - In *my-isilon-settings.yaml*, endpointPort acts as a default value. If endpointPort is not specified in *my-isilon-settings.yaml*, then it should be specified in the *endpoint* parameter of samples/secret/secret.yaml.
> - The *isilon-creds* secret has a *mountEndpoint* parameter which must be set to the hostname or IP address of the PowerScale OneFS API server, for example, 10.0.0.1.

2. Enable CSM for Authorization and provide *proxyHost* address 

Please refer to step 6 in the [installation steps for PowerScale](../../../csidriver/installation/helm/isilon) to edit the parameters in samples/secret/secret.yaml file to communicate with the sidecar.

3. Update *endpoint* to match the endpoint set in samples/secret/karavi-authorization-config.json

>__Note__: Only add the endpoint port if it has not been set in *my-isilon-settings.yaml*.

4. Create the isilon-creds secret using the following command:

    `kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml -o yaml --dry-run=client | kubectl apply -f -`
   
5. Install the CSI PowerScale driver
## Updating CSM for Authorization Proxy Server Configuration

CSM for Authorization has a subset of configuration parameters that can be updated dynamically:

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| web.jwtsigningsecret | String | "secret" |The secret used to sign JWT tokens | 

Updating configuration parameters can be done by editing the `karavi-config-secret`. The secret can be queried using k3s and kubectl like so: 

`kubectl -n authorization get secret/karavi-config-secret`

To update parameters, you must edit the base64 encoded data in the secret. The` karavi-config-secret` data can be decoded like so:

`kubectl -n authorization get secret/karavi-config-secret -o yaml | grep config.yaml | head -n 1 | awk '{print $2}' | base64 -d`

Save the output to a file or copy it to an editor to make changes. Once you are done with the changes, you must encode the data to base64. If your changes are in a file, you can encode it like so:

`cat <file> | base64`

Copy the new, encoded data and edit the `karavi-config-secret` with the new data. Run this command to edit the secret:

`kubectl -n karavi edit secret/karavi-config-secret`

Replace the data in `config.yaml` under the `data` field with your new, encoded data. Save the changes and CSM Authorization will read the changed secret.

>__Note__: If you are updating the signing secret, the tenants need to be updated with new tokens via the `karavictl generate token` command.

## CSM for Authorization Proxy Server Dynamic Configuration Settings

Some settings are not stored in the `karavi-config-secret` but in the csm-config-params ConfigMap, such as LOG_LEVEL and LOG_FORMAT. To update the CSM Authorization logging settings during runtime, run the below command, make your changes, and save the updated configMap data.

```
kubectl -n authorization edit configmap/csm-config-params
```

This edit will not update the logging level for the sidecar-proxy containers running in the CSI Driver pods. To update the sidecar-proxy logging levels, you must update the associated CSI Driver ConfigMap in a similar fashion:

```
kubectl -n [CSM_CSI_DRVIER_NAMESPACE] edit configmap/<release_name>-config-params
```

Using PowerFlex as an example, `kubectl -n vxflexos edit configmap/vxflexos-config-params` can be used to update the logging level of the sidecar-proxy and the driver.