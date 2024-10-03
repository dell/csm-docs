---
title: Authorization - v2 Migration guide
linktitle: Migration guide from v1 to v2
weight: 1
description: >
  CSM for Authorization v1 to v2 Migration guide
---

CSM for Authorization v2 has significant architectural changes that prevent a user from upgradng CSM for Authorization v1 to CSM for Authorization v2. This page provides a reference guide for migrating v1 to v2.

**Before migration please note following points**
  - CSM for Authorization v2 calculates the actual usage of capacity provisioned by syncing with the array.
  - Volumes belonging to a tenant are identified using the **Volume Prefix** configured in csmtenant custom resource.
  - Volumes without the **Volume Prefix** will not be accounted for in usage capacity calculation as ownership of the volume is unknown without the volume prefix.
  - User should rename all volumes that are needed to be accounted for with the **Volume Prefix** before migration to v2.

## Storage Systems

In CSM for Authorization v1 setup, list the storage to get all the storages configured in the environment.
Example:

```
karavictl storage list --admin-token admintoken.yaml --addr csm-authorization.host.com

{
  "storage": {
    "powerflex": {
      "3000000000011111": {
        "Endpoint": "https://1.1.1.1",
        "Insecure": true,
        "Password": "(omitted)",
        "User": "admin"
      }
    }
  }
}
```
In CSM for Authorization v2 Storage are created using custom resources. For each Storage in a v1 environment, create using the CRD, example:

```
kubectl create -f controller/config/samples/csm-authorization_v1_storage.yaml
```
Content of csm-authorization_v1_storage.yaml
```yaml
apiVersion: csm-authorization.storage.dell.com/v1
kind: Storage
metadata:
  name: powerflex
spec:
  # Type of the storage system. Example: powerflex, powermax, powerscale
  type: powerflex
  endpoint: https://1.1.1.1
  # System ID of the backend storage array
  systemID: 3000000000011111
  # Vault is the credential manager for storage arrays
  vault:
    identifier: vault0
    kvEngine: secret
    path: csm-authorization/powerflex/3000000000011111
  # SkipCertificateValidation is the flag to skip certificate validation
  skipCertificateValidation: true
  # PollInterval is the polling frequency to test the storage connectivity
  pollInterval: 30s
```

## Role and Role Binding

In CSM for Authorization v2, role creation is simpler. User will not be required to bind the role, only thing user needs to do is create roles that are needed.

List all the roles that are created in CSM for Authorization v1 setup.
Example:
```
karavictl role list --admin-token admintoken.yaml --addr csm-authorization.host.com
```
```
{
  "CSIGold": [
    {
      "storage_system_id": "3000000000011111",
      "pool_quotas": [
        {
          "pool": "mypool",
          "quota": 32000000
        }
      ]
    }
  ],
  "CSISilver": [
    {
      "storage_system_id": "3000000000011111",
      "pool_quotas": [
        {
          "pool": "mypool",
          "quota": 16000000
        }
      ]
    }
  ]
}
```
For each role in v1 setup, create roles using csmrole custom resources.
Example
```
kubectl create -f controller/config/samples/csm-authorization_v1_csmrole.yaml
```
csm-authorization_v1_csmrole.yaml file for **CSIGold** role in v1 setup will look like following example file:
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
  name: CSIGold
spec:
  quota: 1600GiB
  systemID: 3000000000011111
  systemType: powerflex
  pool: mypool
```

## Tenant

List all the tenants in v1 setup and all those tenants should be created in v2 setup.
List tenants in v1 setup, example:
```
karavictl tenant list --admin-token admintoken.yaml --addr csm-authorization.host.com
```
```
{
  "tenants": [
    {
      "name": "Alice"
    }
  ]
}
```
Get detail of each tenant, example:
```
karavictl tenant get --name Alice --admin-token admintoken.yaml --addr csm-authorization.host.com
```
```
{
  "name": "Alice"
  "roles": "role-1,role-2"
}
```
For each Tenant in a v1 environment, create a new CSMTenant using the Tenant CRD. Role binding will be handled automatically.

Example:
```
kubectl create -f controller/config/samples/csm-authorization_v1_csmtenant.yaml
```
csm-authorization_v1_csmtenant.yaml file will look like following example:
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
  name: Alice
spec:
  # Roles defines a comma separated list of Roles for this tenant
  roles: role-1,role-2
  approveSdc: false
  revoke: false
  volumePrefix: tn1
```