---
title: Troubleshooting
linktitle: Troubleshooting
description: Troubleshooting COSI Driver
weight: 5 
toc_hide: true
---

## Troubleshooting COSI Driver with logs

For logs use:

```bash
kubectl logs <driver pod> -n dell-cosi
```

Additionally check kubernetes resources:

```bash
kubectl get bucketclaim -n dell-cosi
```
```bash
kubectl get buckets
```
```bash
kubectl get bucketaccessclass
```
```bash
kubectl get bucketclass
```
```bash
kubectl get bucketaccess
```
