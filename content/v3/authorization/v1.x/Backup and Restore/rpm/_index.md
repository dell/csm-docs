---
title: RPM
linktitle: RPM 
description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization RPM backup and restore
---

{{% pageinfo color="primary" %}}
{{< message text="5" >}}
{{% /pageinfo %}}

## Roles

Role data is stored in the `common` Config Map in the underlying `k3s` deployment.

### Steps to execute in the existing Authorization deployment

1. Save the role data by saving the `common` configMap to a file.

```bash
k3s kubectl -n karavi get configMap common -o yaml > roles.yaml
```

### Steps to execute in the Authorization deployment to restore

1. Delete the existing `common` configMap.

```bash
k3s kubectl -n karavi delete configMap common
```

2. Apply the file containing the role data created in step 1.

```bash
k3s kubectl apply -f roles.yaml
```

3. Restart the `proxy-server` deployment.

```bash
k3s kubectl -n karavi rollout restart deploy/proxy-server
deployment.apps/proxy-server restarted
```

## Storage

Storage data is stored in the `karavi-storage-secret` Secret in the underlying `k3s` deployment.

### Steps to execute in the existing Authorization deployment

1. Save the storage data by saving the `karavi-storage-secret` secret to a file.

```bash
k3s kubectl -n karavi get secret karavi-storage-secret -o yaml > storage.yaml
```

### Steps to execute in the Authorization deployment to restore

1. Delete the existing `karavi-storage-secret` secret.

```bash
k3s kubectl -n karavi delete secret karavi-storage-secret
```

2. Apply the file containing the storage data created in step 1.

```bash
k3s kubectl apply -f storage.yaml
```

3. Restart the `proxy-server` deployment.

```bash
k3s kubectl -n karavi rollout restart deploy/proxy-server
deployment.apps/proxy-server restarted
```

## Tenants, Quota, and Volume ownership

Redis is used to store application data regarding [tenants, quota, and volume ownership](../../design#quota--volume-ownership). This data is stored on the system under `/var/lib/rancher/k3s/storage/<redis-primary-pv-claim-volume-name>/appendonly.aof`. 

`appendonly.aof` can be copied and used to restore this application data in Authorization deployments. See the example.

### Steps to execute in the existing Authorization deployment

1. Determine the Persistent Volume related to the `redis-primary-pv-claim` Persistent Volume Claim.

```bash
k3s kubectl -n karavi get pvc
```
```
NAME                     STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
redis-primary-pv-claim   Bound    pvc-12d8cc05-910d-45bd-9f30-f6807b287a69   8Gi        RWO            local-path     65m
```

The Persistent Volume related to the `redis-primary-pv-claim` Persistent Volume Claim is `pvc-12d8cc05-910d-45bd-9f30-f6807b287a69`.

2. Copy `appendonly.aof` from the appropriate path to another location.

```bash

cp /var/lib/rancher/k3s/storage/pvc-12d8cc05-910d-45bd-9f30-f6807b287a69/appendonly.aof /path/to/copy/appendonly.aof
```

### Steps to execute in the Authorization deployment to restore

1. Determine the Persistent Volume related to the `redis-primary-pv-claim` Persistent Volume Claim.

```bash
k3s kubectl -n karavi get pvc
```
```
NAME                     STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
redis-primary-pv-claim   Bound    pvc-e7ea31bf-3d79-41fc-88d8-50ba356a298b   8Gi        RWO            local-path     65m
```

The Persistent Volume related to the `redis-primary-pv-claim` Persistent Volume Claim is `pvc-e7ea31bf-3d79-41fc-88d8-50ba356a298b`.

2. Copy/Overwrite the `appendonly.aof` in the appropriate path using the file copied in step 2.

```bash

cp /path/to/copy/appendonly.aof /var/lib/rancher/k3s/storage/pvc-e7ea31bf-3d79-41fc-88d8-50ba356a298b/appendonly.aof
```

3. Restart the `redis-primary` deployment.

```bash
k3s kubectl -n karavi rollout restart deploy/redis-primary
deployment.apps/redis-primary restarted
```
