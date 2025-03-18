---
title: Authorization - v2.x
linktitle: v2.x
weight: 4
no_list: true 
Description: >
  Container Storage Modules (CSM) for Authorization v2.x.
tags:
 - csm-authorization
---

The following diagram shows a high-level overview of Container Storage Modules for Authorization with a `tenant-app` that is using a CSI driver to perform storage operations through the CSM for Authorization `proxy-server` to access the a Dell storage system. All requests from the CSI driver will contain the token for the given tenant that was granted by the Storage Administrator.

![Alt text](../../../../images/authorization/v2.x/image.png)

This is the introduction to a Stateless Architecture for Authorization. The creation of storage, roles, and tenants is done through Custom Resources (CRs) which are tracked and contained within CSM Authorization. The underlying communication is consistent with the previous architecture which makes the creation of volumes and snapshots seamless.

## Container Storage Modules for Authorization Capabilities
{{<table "table table-striped table-bordered table-sm">}}
| Feature                                                                                                                        | PowerScale | PowerFlex | PowerMax |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------- | --------- | -------- |
|  <div style="text-align: left"> Ability to set storage quota limits to ensure k8s tenants are not overconsuming storage                                        | No         | Yes       | Yes      |
|  <div style="text-align: left"> Ability to create access control policies to ensure k8s tenant clusters are not accessing storage that does not belong to them | No         | Yes       | Yes      |
|  <div style="text-align: left"> Ability to shield storage credentials from Kubernetes administrators by storing them in vault                                  | Yes        | Yes       | Yes      |
|  <div style="text-align: left"> Ability to create snapshots from owned volumes that consume the storage quota                                                  | Yes        | Yes       | Yes      |
|  <div style="text-align: left"> Ability to periodically query storage array to keep quota consumption in sync                                                  | No         | Yes       | Yes      |
{{</table>}}

### Snapshot Support

As stated above, all snapshot requests that are associated with a volume that has been approved and created will go through a similar authorization processes ensuring that the snapshot fits within the allotted quota.

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: vol1-snapshot
spec:
  volumeSnapshotClassName: vxflexos-snapclass
  source:
    persistentVolumeClaimName: vol1
```

This will take a snapshot of the `persistent volume claim` named `vol1`. Container Storage Modules Authorization will verify ownership with Redis to ensure that the tenant who is attempting to create the snapshot owns the `vol1` volume. If the tenant does own the volume, authorization will proceed to check to see if the snapshot fits within the allotted quota and add a record if it does.

### Backend Storage Polling

A configurable polling mechanism has been introduced to ensure that the tenant and Redis are always in sync with the backend storage configured. This is determined by the [volumePrefix](configuration#configuring-tenants) specified for the `tenant`. During polling, for each of the tenants and roles, the storage service will ensure that nothing has been removed or added by the storage admin which would lead to Redis being out of sync.

If a volume is created with the matching `volumePrefix`, the new entry will be added to Redis and the available quota will be consumed accordingly. Similarly, if a snapshot is created from a volume that is owned by the tenant in the backend storage array, that will be added to Redis.

Lastly, if there is any deletion on the backend storage array of a volume or snapshot that is owned by the tenant, that entry will be deleted from Redis and the available capacity will reflect accordingly.

## Roles and Responsibilities

The Stateless Container Storage Modules Authorization contains the following roles:
- Storage Administrators
- Kubernetes Tenant Administrators

### Storage Administrators

Storage Administrators perform the following:

- Storage System Management (create, get, delete)
- Role Management (create, get, delete)
- Tenant Management (create, get, delete)
- Token Management (create, revoke)

For more information on the configuration of the above, see the configuration of the [Proxy Server](../v2.x/configuration/#configuring-the-container-storage-module-for-authorization-proxy-server).

### Tenant Administrators

Tenants of Authorization can use the token provided by the Storage Administrators in their storage requests.

For more information on how to use the token and configuration, see configuration for the [PowerFlex driver](../v2.x/configuration/powerflex), [PowerMax driver](../v2.x/configuration/powermax), or the [PowerScale driver](../v2.x/configuration/powerscale).