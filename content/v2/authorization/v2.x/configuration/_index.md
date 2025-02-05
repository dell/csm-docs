---
title: Configuration
linktitle: Configuration
weight: 2
description: Configure CSM Authorization Proxy Server
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}
This section provides the details and instructions on how to configure CSM Authorization.

## Configuring the CSM for Authorization Proxy Server

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
authorization-cert-manager-webhook                 ClusterIP      00.000.000.000    <none>        000/TCP                     27s
authorization-ingress-nginx-controller             LoadBalancer   00.000.000.000    <pending>     00:00000/TCP,000:00000/TCP  27s
authorization-ingress-nginx-controller-admission   ClusterIP      00.000.000.000    <none>        000/TCP                     27s
proxy-server                                       ClusterIP      00.000.000.000    <none>        000/TCP                     28s
redis-csm                                          ClusterIP      00.000.000.000    <none>        000/TCP                     28s
rediscommander                                     ClusterIP      00.000.000.000    <none>        000/TCP                     27s
role-service                                       ClusterIP      00.000.000.000    <none>        000/TCP                     27s
sentinel                                           ClusterIP      00.000.000.000    <none>        000/TCP                     27s
storage-service                                    ClusterIP      00.000.000.000    <none>        000/TCP                     27s
tenant-service                                     ClusterIP      00.000.000.000    <none>        000/TCP                     28s
```

On the machine running `dellctl`, if the Ingress host is left default (`csm-authorization.com`) during installation or any of the hostnames don't resolve, the hostnames needs to be add to the `/etc/hosts` file. For example:

```bash
<master_node_ip> csm-authorization.com
```

Afterwards, the storage administrator can configure Authorization with the following via Customer Resources (CRs):
- Storage systems
- Tenants
- Roles

### Configuring Storage

The storage types supported are `powerflex`, `powermax`, and `powerscale`. During the creation of a storage system and role, the storage type must be one of the supported types.

A `storage` entity in CSM Authorization consists of the storage type (`powerflex`, `powermax` or `powerscale`), the system ID, the API endpoint, and the vault credentials path. Edit these parameters in the manifest:

   | Parameter                 | Description                                                                          | Required | Default |
   | ------------------------- | ------------------------------------------------------------------------------------ | -------- | ------- |
   | type                      | The type of the storage array.                                                        | Yes      | -       |
   | endpoint                  | HTTPS REST API endpoint of the backend storage array.                                | Yes      | -       |
   | systemID                  | System ID of the backend storage array.                                              | Yes      | -       |
   | vault.identifier          | The identifier of the Vault to be used that was configured in the Authorization CR.  | Yes      | -       |
   | vault.kvEngine            | The path to the KV secrets engine.                                                   | Yes      | secret  |
   | vault.path                | The location within the store that the credentials for the array are stored.         | Yes      | -       |
   | skipCertificateValidation | A boolean that enables/disables certificate validation of the backend storage array. | No       | true    |
   | pollInterval              | PollInterval is the polling frequency to test the storage connectivity.              | No       | 30s     |

For example, to create PowerFlex storage:

```yaml
apiVersion: csm-authorization.storage.dell.com/v1
kind: Storage
metadata:
  name: powerflex
spec:
  type: powerflex
  endpoint: https://10.0.0.1
  systemID: 1000000000000000
  vault:
    identifier: vault0
    kvEngine: secret
    path: csm-authorization/powerflex/1000000000000000
  skipCertificateValidation: true
  pollInterval: 30s
```

>__Note__:
> - The `systemID` can vary from storage type to storage type. Please contact the storage administrator for more details on how to obtain it.

### Configuring Roles

A `role` consists of a name, the storage array to use, and the quota limit for the storage pool to be used. Edit these parameters in the manifest:

   | Parameter  | Description                                                     | Required | Default |
   | ---------- | --------------------------------------------------------------- | -------- | ------- |
   | name       | The name of the role that will be used to bind with the tenant. | Yes      | -       |
   | quota      | The amount of allocated space for the specified role.           | Yes      | -       |
   | systemID   | System ID of the backend storage array.                         | Yes      | -       |
   | systemType | The type of the storage array.                                   | Yes      | -       |
   | pool       | The storage pool name.                                          | Yes      | -       |

For example, to create a role named `role1` using the PowerFlex storage created above with a quota limit of 128iB in storage pool `myStoragePool`:

```yaml
apiVersion: csm-authorization.storage.dell.com/v1
kind: CSMRole
metadata:
  labels:
    app.kubernetes.io/name: role
    app.kubernetes.io/instance: role-sample
    app.kubernetes.io/part-of: csm-authorization
    app.kubernetes.io/managed-by: kustomize
    app.kubernetes.io/created-by: csm-authorization
  name: role1
spec:
  quota: 128GiB
  systemID: 1000000000000000
  systemType: powerflex
  pool: myStoragePool
```

>__Note__:
> - The `quota` must be set with iB (TiB/GiB etc). Example: 10 TiB or 512 GiB. If it is not, the quota enforcement will be inaccurate

### Configuring Tenants

A `tenant` is a Kubernetes cluster that a role will be bound to. Edit these parameters in the manifest:

   | Parameter    | Description                                                                                                                    | Required | Default |
   | ------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------- | ------- |
   | roles        | A comma separate list of roles that the tenant can be associated with.                                                         | Yes      | -       |
   | approveSdc   | ApproveSdc is used to enable an SDC to access the MDM while the SDC is in restricted access mode.                              | Yes      | false   |
   | revoke       | Revoke is a boolean to indicate whether tenant is revoked. Set to `true` to revoke the tenant but keep it in CSM Auth.         | Yes      | false   |
   | volumePrefix | The prefix that all volumes and snapshots will contain to show association with the tenant. It should not exceed 3 characters. | Yes      | -       |

For example, to create a tenant named `csmtenant-sample`:

```yaml
apiVersion: csm-authorization.storage.dell.com/v1
kind: CSMTenant
metadata:
  labels:
    app.kubernetes.io/name: csmtenant
    app.kubernetes.io/instance: csmtenant-sample
    app.kubernetes.io/part-of: csm-authorization
    app.kubernetes.io/managed-by: kustomize
    app.kubernetes.io/created-by: csm-authorization
  name: csmtenant-sample
spec:
  roles: role1
  approveSdc: false
  revoke: false
  volumePrefix: tn1

```

### Generate a Token

Once the tenant is created, an access/refresh token pair can be created for the tenant. The storage admin is responsible for generating and sending the token to the Kubernetes tenant admin.

Generate an administrator token:

```bash
dellctl admin token  -n <administrator-name> --access-token-expiration 1m30s --refresh-token-expiration 720h --jwt-signing-secret <secret> > admin.yaml
```

You can also pass in the `jwt-signing-secret` via terminal prompt by not supplying the `--jwt-signing-secret` argument:

```bash
dellctl admin token  -n <administrator-name> --access-token-expiration 1m30s --refresh-token-expiration 720h > admin.yaml
```

```bash
  dellctl generate token --admin-token admin.yaml --addr csm-authorization.com:<ingress-controller-port> --insecure true --tenant <tenant> --access-token-expiration 30m0s --refresh-token-expiration 1480h0m0s > token.yaml
```

`token.yaml` will have a Kubernetes secret manifest that looks like this:

```yaml
apiVersion: v1
data:
  access: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKamMyMGlMQ0psZUhBaU9qRTNNVFkwTURRd016UXNJbWR5YjNWd0lqb2lZM050ZEdWdVlXNTBMWE5oYlhCc1pTSXNJbWx6Y3lJNkltTnZiUzVrWld4c0xtTnpiU0lzSW5KdmJHVnpJam9pY205c1pURWlMQ0p6ZFdJaU9pSmpjMjB0ZEdWdVlXNTBJbjAuRmtVTGotT01mSW9rN3ZWNmFKQURXR1dva1Bsd1huT2tZeWxSclZjN2F5Zw==
  refresh: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKamMyMGlMQ0psZUhBaU9qRTNNakUzTXpBeU16UXNJbWR5YjNWd0lqb2lZM050ZEdWdVlXNTBMWE5oYlhCc1pTSXNJbWx6Y3lJNkltTnZiUzVrWld4c0xtTnpiU0lzSW5KdmJHVnpJam9pY205c1pURWlMQ0p6ZFdJaU9pSmpjMjB0ZEdWdVlXNTBJbjAudWRYSFZ3MGg1dTdoTjZaVGJlNHgyYXRMWWhIamQta1ZtTFBVUHpXOHNIaw==
kind: Secret
metadata:
  creationTimestamp: null
  name: proxy-authz-tokens
type: Opaque
```

This secret must be applied in the driver namespace.

>__Note__:
> - The `insecure` flag specifies to skip certificate validation when connecting to the Authorization proxy-server.
> - The `addr` flag is the address of the Authorization proxy-server.
> - The `tenant` flag specifies which tenant to generate the token for.
