---
title: Use Cases
linktitle: Use Cases
weight: 1
description: >
  Use cases for Stateless Authorization
---

After Authorization is installed and the PowerFlex driver has been configured with a valid tenant, similar to the the previous architecture, all volume creations will be verified to ensure that the volume fits within the tenants quota. In addition, the support of snapshots is introduced within this version of Authorization. This means that all snapshots created from a volume from the tenant will go through similar verification.

## Snapshot Support

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

This will take a snapshot of the `persistent volume claim` named `vol1`. CSM Authorization will verify ownership with Redis to ensure that the tenant who is attempting to create the snapshot owns the `vol1` volume. If the tenant does own the volume, authorization will proceed to check to see if the snapshot fits within the allotted quota and add a record if it does.

## Backend Storage Polling

A configurable polling mechanism has been introduced to ensure that the tenant and Redis are always in sync with the backend storage configured. This is determined by the [volumePrefix](../configuration/proxy-server/#configuring-tenants) specified for the `tenant`. During polling, for each of the tenants and roles, the storage service will ensure that nothing has been removed or added by the storage admin which would lead to Redis being out of sync.

If a volume is created with the matching `volumePrefix`, the new entry will be added to Redis and the available quota will be consumed accordingly. Similarly, if a snapshot is created from a volume that is owned by the tenant in the backend storage array, that will be added to Redis.

Lastly, if there is any deletion on the backend storage array of a volume or snapshot that is owned by the tenant, that entry will be deleted from Redis and the available capacity will reflect accordingly.