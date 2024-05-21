---
title: Proxy Server
linktitle: Proxy Server
description: >
  Configuring the CSM for Authorization Proxy Server
---

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

On the machine running `dellctl`, the `/etc/hosts` file needs to be updated with the Ingress hosts for the proxy, storage, and role services. For example:

```bash
<master_node_ip> csm-authorization.com
```

Afterwards, the storage administrator can configure Authorization with the following via Customer Resources (CRs):
- Storage systems
- Tenants
- Roles

## Configuring Storage

A `storage` entity in CSM Authorization consists of the storage type (PowerFlex), the system ID, the API endpoint, and the vault credentials. For example, to create PowerFlex storage:

```yaml
apiVersion: csm-authorization.storage.dell.com/v1alpha1
kind: Storage
metadata:
  name: powerflex
spec:
  type: powerflex
  endpoint: https://10.0.0.1
  systemID: 1000000000000000
  credentialStore: vault
  credentialPath: storage/powerflex
  skipCertificateValidation: true
  pollInterval: 30s
```

>__Note__:
> - The `credentialStore` is the way that credentials for the storage array are stored.
> - The `credentialPath` is the location within the store that the credentials for the array are stored.

## Configuring Roles

A `role` consists of a name, the storage to use, and the quota limit for the storage pool to be used. For example, to create a role named `rol1` using the PowerFlex storage created above with a quota limit of 128GB in storage pool `myStoragePool`:

```yaml
apiVersion: csm-authorization.storage.dell.com/v1alpha1
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
  quota: 128GB
  systemID: 1000000000000000
  systemType: powerflex
  pool: myStoragePool
```

>__Note__: 
> - The `name` is the name of the role that will be used to bind with the tenant.
> - The `quota` is the amount of allocated space for the specified role.

## Configuring Tenants

A `tenant` is a Kubernetes cluster that a role will be bound to. For example, to create a tenant named `csmtenant-sample`:

```yaml
apiVersion: csm-authorization.storage.dell.com/v1alpha1
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
  # This prefix is added for each new volume provisioned by the tenant. 
  # It should not exceed 3 characters. Example: tn1
  volumePrefix: tn1

```

>__Note__: 
> - The `roles` are a comma seperate list of roles that the tenant can be associated with.
> - The `volumePrefix` is the prefix that all volumes and snapshots will contain to show association with the tenant.
> - By creating a tenant, it will automatically bind with the roles for usage.
