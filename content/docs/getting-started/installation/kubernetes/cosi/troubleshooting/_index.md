---
title: Troubleshooting
linktitle: Troubleshooting
description: Troubleshooting COSI Driver
weight: 5 
toc_hide: false
---

## Troubleshooting COSI Driver with logs

For logs use:

```bash
$ kubectl logs <driver pod> -n dell-cosi
Defaulted container "objectstorage-provisioner" out of: objectstorage-provisioner, objectstorage-provisioner-sidecar
2026-01-12T15:49:03Z  [INFO]  Config successfully loaded from /cosi/config.yaml
2026-01-12T15:49:03Z  [INFO]  Log level set to info
2026-01-12T15:49:03Z  [INFO]  Log format set to TEXT
2026-01-12T15:49:03Z  [INFO]  OTEL endpoint is empty, disabling tracing
2026-01-12T15:49:03Z  [INFO]  COSI driver is starting
2026-01-12T15:49:03Z  [INFO]  ObjectScale config created
2026-01-12T15:49:03Z  [INFO]  Initializing driver
2026-01-12T15:49:03Z  [INFO]  Driver has been successfully initialized
2026-01-12T15:49:03Z  [INFO]  Validated configuration for object storage objectscale1
2026-01-12T15:49:03Z  [INFO]  New configuration successfully applied to object storage objectscale1
2026-01-12T23:15:44Z  [INFO]  Creating Bucket bucket-5220d661-448c-4dd6-b8b4-9e8e633f979d
2026-01-12T23:15:45Z  [INFO]  Successfully created bucket bucket-5220d661-448c-4dd6-b8b4-9e8e633f979d in namespace ns1
2026-01-12T23:15:55Z  [INFO]  Creating Bucket Access ba-26a77eb9-809d-46c3-a804-a91832949a73 for bucket bucket-5220d661-448c-4dd6-b8b4-9e8e633f979d
2026-01-12T23:15:55Z  [INFO]  Created ObjectScale IAM user ns1-user-ba-26a77eb9-809d-46c3-a804-a91832949a73 with ID 0xc0000a6800
2026-01-12T23:15:55Z  [INFO]  Successfully granted access to the bucket bucket-5220d661-448c-4dd6-b8b4-9e8e633f979d for user ns1-user-ba-26a77eb9-809d-46c3-a804-a91832949a73
```

Additionally check kubernetes resources:

```bash
$ kubectl get bucketclaim -A
NAMESPACE   NAME             AGE
default     my-bucketclaim   50s
```
```bash
$ kubectl get buckets
NAME                                          AGE
bucket-5220d661-448c-4dd6-b8b4-9e8e633f979d   115s
```
```bash
$ kubectl get bucketaccessclass
NAME                   AGE
my-bucketaccessclass   2m14s
```
```bash
$ kubectl get bucketclass
NAME             AGE
my-bucketclass   2m4s
```
```bash
$ kubectl get bucketaccess -A
NAMESPACE   NAME              AGE
default     my-bucketaccess   2m57s
```
