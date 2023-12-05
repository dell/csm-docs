---
title: Troubleshooting
linktitle: Troubleshooting
description: Troubleshooting COSI Driver
weight: 5
---

## Troubleshooting COSI Driver with logs

For logs use:

```bash
kubectl logs <driver pod> -n dell-cosi
```

Additionaly check kubernetes resources:

```bash
kubectl get buckets
```
```bash
kubectl get bucketclaim -n dell-cosi
```