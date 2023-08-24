---
title: "COSI Driver"
linkTitle: "COSI Driver"
description: About Dell Technologies (Dell) COSI Driver 
weight: 3
---

The COSI Driver by Dell implements an interface between [COSI (spec v1alpha1)](https://container-object-storage-interface.github.io/docs/) enabled Container Orchestrator and Dell Storage Arrays. It is a plug-in that is installed into Kubernetes to provide object storage using Dell storage systems.

Dell COSI Driver is a multi-backend driver, meaning that it can connect to multiple Object Storage Platform (OSP) Instances and provide access to them using the same COSI interface.

## Features and capabilities

### Supported Container Orchestrator Platforms

> ℹ️ **NOTE:** during technical preview, no certification is performed. The platforms listed below were tested by developers using integration test suite.

{{<table "table table-striped table-bordered table-sm">}}
|            |    COSI    |
|------------|:----------:|
| Kubernetes | 1.27, 1.28 |
| K3s        |    1.27    |
{{</table>}}

### COSI Driver Capabilities

{{<table "table table-striped table-bordered table-sm">}}
| Features               | ObjectScale |
|------------------------|:-----------:|
| Bucket Creation        |     yes     |
| Bucket Deletion        |     yes     |
| Bucket Access Granting |     yes     |
| Bucket Access Revoking |     yes     |
{{</table>}}

## Backend Storage Details

{{<table "table table-striped table-bordered table-sm">}}
| Protocol   | ObjectScale |
|------------|:-----------:|
| AWS S3     |     yes     |
| GCS        |     N/A     |
| Azure Blob |     N/A     |
{{</table>}}

## Supported Storage Platforms

{{<table "table table-striped table-bordered table-sm">}}
| Storage Platform | Versions |
|------------------|:--------:|
| ObjectScale      |  1.2.x   |
{{</table>}}

## Bucket Lifecycle Workflow

1. Create Bucket &rarr; Delete Bucket
1. Create Bucket &rarr; Grant Access &rarr; Revoke Access &rarr; Delete Bucket
