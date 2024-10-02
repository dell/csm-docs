---
title: Authorization - v2 Migration guide
linktitle: Migration guide from v1 to v2
weight: 1
description: >
  CSM for Authorization v1 to v2 Migration guide
---

CSM for Authorization v2 has significant architectural changes that prevent a user from upgradng CSM for Authorization v1 to CSM for Authorization v2. This page provide a reference guide for migating v1 deployment to v2.

**Before migration please note following points**
  - CSM for Authorization v2 calculates the actual usage of capacity provisioned by syncing with array.
  - Volumes belonging to a tenant are identified using **Volume Prefix** configured in tenant CR.
  - Volumes without **Volume Prefix** will not be accounted in usage capacity calculation as ownership of volume is unknown without the volume prefix.
  - User should rename all volumes that are needed to be accounted with **Volume Prefix** before migration to v2.

## Storage Systems

In CSM for Authorization v1 setup, list the storage to get all the storages configured in the environment.
Example: :

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
In CSM for Authorization v2 Storage are created using CRDs. For each Storage in a v1 environment, create using the CRD, example:

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
path: csm-authorization/powerflex/1a99aa999999aa9a
# SkipCertificateValidation is the flag to skip certificate validation
skipCertificateValidation: true
# PollInterval is the polling frequency to test the storage connectivity
pollInterval: 30s
```


## Role and Role Binding

In CSM for Authorization v2, role creation is simpler. User will not be required to bind the role, only thing user needs to do is create roles that they needed.

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
For each role in v1 setup, create roles using csmrole CRD.
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
# The quota must be set with iB (TiB/GiB etc) / Ex. 10 TiB or 512 GiB
# If it is not, the quota enforcement will be inaccurate
quota: 1600GiB
# System ID of the backend storage array
systemID: 3000000000011111
# The type of the stoage array. Example: powerflex, powermax, powerscale
systemType: powerflex
pool: mypool
```
All corresponding v1 setup roles should be created in v2 setup too. In v2 user don't have to bind the role, this will be taken care during CRD reconciliation.

## Tenant
List all the tenants in v1 setup and all those tenants should be created in v2 setup.
List tenants in v1 setup example:
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
For each Tenant in a v1 environment, create a new CSMTenant using the Tenant CRD Role binding will be handled automatically.
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
