---
title: Volume Expansion
linktitle: Volume Expansion
weight: 6
description: >
  Online expansion of replicated volumes
---

Starting in v2.4.0, the CSI PowerMax driver supports the expansion of Replicated Persistent Volumes (PVs). This expansion is done online, which is when the PVC is attached to any node.

## Prerequisites
- To use this feature, enable in values.yaml.
```yaml
resizer:
  enabled: true
```
- To use this feature, the storage class that is used to create the PVC must have the attribute allowVolumeExpansion set to true.

## Basic Usage

To resize a PVC, edit the existing PVC spec and set spec.resources.requests.storage to the intended size. For example, if you have a PVC - pmax-pvc-demo of size 5 Gi, then you can resize it to 10 Gi by updating the PVC.

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: pmax-pvc-demo
  namespace: test
spec:
  accessModes:
  - ReadWriteOnce
  volumeMode: Filesystem
  resources:
    requests:
      storage: 10Gi #Updated size from 5Gi to 10Gi
  storageClassName: powermax-expand-sc
```
Update remote PVC with expanded size:

1. Update the remote PVC size with the same size as on local PVC

2. After sync with remote CSI driver, volume size will be updated to show new size. 

*NOTE*: The Kubernetes Volume Expansion feature can only be used to increase the size of the volume, it cannot be used to shrink a volume.
