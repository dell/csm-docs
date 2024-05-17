---
title: Proxy Server
linktitle: Proxy Server
description: >
  Configuring the CSM for Authorization Proxy Server
---

## Configuring the CSM for Authorization Proxy Server

The storage administrator must first configure Authorization with the following via Customer Resources (CRs):
- Storage systems
- Tenants
- Roles

### Configuring Storage

A `storage` entity in CSM Authorization consists of the storage type (PowerFlex), the system ID, the API endpoint, and the vault credentials. For example, to create PowerFlex storage:

#### Helm/Operator Deployment
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

### Configuring Roles

A `role` consists of a name, the storage to use, and the quota limit for the storage pool to be used. For example, to create a role named `rol1` using the PowerFlex storage created above with a quota limit of 128GB in storage pool `myStoragePool`:

#### Helm/Operator Deployment
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

### Configuring Tenants

A `tenant` is a Kubernetes cluster that a role will be bound to. For example, to create a tenant named `csmtenant-sample`:
#### Helm/Operator Deployment
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
