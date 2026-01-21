---
title: Prerequisites
linkTitle: Prerequisites
weight: 1
description: >
  Prerequisites for installing the COSI Driver
---

To use the COSI Driver, you must deploy the following components to your cluster:

- Kubernetes Container Object Storage Interface CRDs
- Container Object Storage Interface Controller

*Note*: The following `kubectl patch` command is required as the current installation procedure for v0.2.1 will use a previous image version.
```bash
kubectl create -k 'https://github.com/kubernetes-sigs/container-object-storage-interface//?ref=v0.2.1'
kubectl patch deployment container-object-storage-controller -n container-object-storage-system -p '{"spec":{"template":{"spec":{"containers":[{"name":"objectstorage-controller","image":"gcr.io/k8s-staging-sig-storage/objectstorage-controller:release-0.2"}]}}}}'
```
