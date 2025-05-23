---
title: Helm
linktitle: Helm
description: >
 Container Storage Modules (CSM) for Authorization Helm backup and restore
---
{{% pageinfo color="primary" %}}
{{< message text="5" >}}
{{% /pageinfo %}}

## Roles


Role data is stored in the `common` Config Map.

### Steps to execute in the existing Authorization deployment

1. Save the role data by saving the `common` configMap to a file.

```bash
kubectl -n <authorization-namespace> get configMap common -o yaml > roles.yaml
```

### Steps to execute in the Authorization deployment to restore

1. Delete the existing `common` configMap.

```bash
kubectl -n <authorization-namespace> delete configMap common
```

2. Apply the file containing the backed-up role data.

```bash
kubectl apply -f roles.yaml
```

3. Restart the `proxy-server` deployment.

```bash
kubectl -n <authorization-namespace> rollout restart deploy/proxy-server
deployment.apps/proxy-server restarted
```

## Storage

Storage data is stored in the `karavi-storage-secret` Secret.

### Steps to execute in the existing Authorization deployment

1. Save the storage data by saving the `karavi-storage-secret` Secret to a file.

```bash

kubectl -n <authorization-namespace> get secret karavi-storage-secret -o yaml > storage.yaml
```

### Steps to execute in the Authorization deployment to restore

1. Delete the existing `karavi-storage-secret` secret.

```bash
kubectl -n <authorization-namespace> delete secret karavi-storage-secret
```

2. Apply the file containing the storage data created in step 1.

```bash
kubectl apply -f storage.yaml
```

3. Restart the `proxy-server` deployment.

```bash
kubectl -n <authorization-namespace> rollout restart deploy/proxy-server
deployment.apps/proxy-server restarted
```

## Tenants, Quota, and Volume ownership

Redis is used to store application data regarding [tenants, quota, and volume ownership](../../design#quota--volume-ownership) with the Storage Class `csm-authorization-local-storage` or the one specified in the `redis.storageClass` parameter in the values file.

The Persistent Volume for Redis is provisioned by the above Storage Class with the `redis-primary-pv-claim` Persistent Volume Claim. See the example.

```bash
kubectl get persistentvolume
```
```terminal
NAME                CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS     CLAIM                                      STORAGECLASS    REASON   AGE
k8s-ab74921ab9      8Gi        RWO            Delete           Bound      authorization/redis-primary-pv-claim       <storage-class>          112m
```

### Steps to execute in the existing Authorization deployment

1. Create a backup of this volume, typically via snapshot and/or replication, and create a Persistent Volume Claim using this backup by following the Storage Class's provisioner documentation.

### Steps to execute in the Authorization deployment to restore

1. Edit the `redis-primary` Deployment to use the Persistent Volume Claim associated with the backup by running:

```bash
kubectl -n <authorization-namespace> edit deploy/redis-primary
```

The Deployment has a volumes field that must look like this:

```yaml
volumes:
- name: redis-primary-volume
  persistentVolumeClaim:
    claimName: redis-primary-pv-claim
```

Replace the value of `claimName` with the name of the Persistent Volume Claim associated with the backup. If the new Persistent Volume Claim name is `redis-backup`, you would edit the deployment to look like this:

```yaml
volumes:
- name: redis-primary-volume
  persistentVolumeClaim:
    claimName: redis-backup
```

Once saved, Redis now uses the backup volume.
