---
title: Authorization - v2 Migration guide
linktitle: Migration Guide From v1 to v2
weight: 1
description: >
  CSM for Authorization v1 to v2 Migration Guide
---
CSM for Authorization v2 has significant architectural changes that prevent a user from upgradng CSM for Authorization v1 to CSM for Authorization v2. This page provides a reference guide for migrating v1 to v2 using Powerflex as an example.

**Before migration please note following points**
  - CSM for Authorization v2 calculates the actual usage of capacity provisioned by syncing with the array.
  - Volumes belonging to a tenant are identified using the **Volume Prefix** configured in csmtenant custom resource.
  - Volumes without the **Volume Prefix** will not be accounted for in usage capacity calculation as ownership of the volume is unknown without the volume prefix.
  - User should rename all volumes that are needed to be accounted for with the **Volume Prefix** before migration to v2. See the [Prerequisites](#prerequisites).

## Prerequisites
### On the storage array, rename the volumes owned by each tenant with a tenant prefix.
Use [dellctl](../../support/cli/) to list the volumes owned by the tenant. 
```
# dellctl volume get --proxy <csm-authorization-proxy-address> --namespace <driver-namespace>
NAME             VOLUME ID          SIZE       POOL    SYSTEM ID          PV NAME          PV STATUS   STORAGE CLASS   PVC NAME                NAMESPACE            SNAPSHOT COUNT
k8s-4cfa97ba5d   c6cfdfe000000229   8.000000   pool1   3000000000011111   k8s-4cfa97ba5d   Bound       vxflexos        vol-create-test-vndq8   test                 0
k8s-519bb230c5   c6cfdfe20000022b   8.000000   pool1   3000000000011111   k8s-519bb230c5   Bound       vxflexos        vol-create-test-wc45j   test                 0
k8s-ecc8381e08   c6cfdfe300000231   8.000000   pool1   3000000000011111   k8s-ecc8381e08   Bound       vxflexos        vol-create-test-r8ptv   test                 0
k8s-cc47d7a61e   c6cfdfe10000022a   8.000000   pool1   3000000000011111   k8s-cc47d7a61e   Bound       vxflexos        vol-create-test-k8szc   test                 0
k8s-76914ae62b   c6cfdfdf00000223   8.000000   pool1   3000000000011111   k8s-76914ae62b   Bound       vxflexos        vol-create-test-8sbtl   test                 0
```

On the storage array, rename each volume with your chosen tenant prefix. For example, if you've chosen the prefix `tn1`, volume `k8s-4cfa97ba5d` should be renamed to `tn1-k8s-4cfa97ba5d`.

## Storage Systems

In CSM for Authorization v1 setup, list the storage to get all the storage systems configured in the environment.
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
In CSM for Authorization v2, storage is created using custom resources. For each Storage in a v1 environment, create using the CR, example:

```
kubectl create -f controller/config/samples/csm-authorization_v1_storage.yaml
```
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
In CSM for Authorization v2, roles are created using custom resources. For each role in a v1 environment, create using the CR, example:
```
kubectl create -f controller/config/samples/csm-authorization_v1_csmrole.yaml
```
```yaml
apiVersion: csm-authorization.storage.dell.com/v1
kind: CSMRole
metadata:
  name: CSIGold
spec:
  quota: 3200GiB
  systemID: 3000000000011111
  systemType: powerflex
  pool: pool1
```
```yaml
apiVersion: csm-authorization.storage.dell.com/v1
kind: CSMRole
metadata:
  name: CSISilver
spec:
  quota: 1600GiB
  systemID: 3000000000011111
  systemType: powerflex
  pool: pool2
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
  "roles": "CSIGold,CSISilver"
  "approvesdc": true
}
```
In CSM for Authorization v2, tenants are created using custom resources. The `spec.volumePrefix` field must be the prefix used in the prerequisite step of renaming the storage array volumes. For each tenant in a v1 environment, create using the CR, example:
```
kubectl create -f controller/config/samples/csm-authorization_v1_csmtenant.yaml
```
csm-authorization_v1_csmtenant.yaml file will look like following example:
```yaml
apiVersion: csm-authorization.storage.dell.com/v1
kind: CSMTenant
metadata:
  name: Alice
spec:
  # Roles defines a comma separated list of Roles for this tenant
  roles: CSIGold,CSISilver
  approveSdc: true
  revoke: false
  volumePrefix: tn1
```