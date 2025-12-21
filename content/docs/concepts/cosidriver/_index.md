---
title: "Container Storage Modules with COSI"
linkTitle: "Container Storage Modules with COSI"
description: About Dell Technologies (Dell) Container Storage Modules with COSI
no_list: true 
weight: 10
---

The COSI Driver by Dell connects a COSI-enabled Container Orchestrator with Dell Storage Arrays. It is a Kubernetes plug-in that provides object storage using Dell storage systems.

Dell COSI Driver is a multi-backend driver, meaning that it can connect to multiple Object Storage Platform (OSP) Instances and provide access to them using the same COSI interface.

## Features and capabilities

### Supported Container Orchestrator Platforms


{{<table "table table-striped table-bordered table-sm">}}
|            |    COSI    |
|------------|:----------:|
|  <div style="text-align: left"> Kubernetes |    TODO    |
{{</table>}}

### COSI Driver Capabilities

{{<table "table table-striped table-bordered table-sm">}}
| Features               | ObjectScale |
|------------------------|:-----------:|
|  <div style="text-align: left"> Bucket Creation        |     Yes     |
|  <div style="text-align: left"> Bucket Deletion        |     Yes     |
|  <div style="text-align: left"> Bucket Access Granting |     Yes     |
|  <div style="text-align: left"> Bucket Access Revoking |     Yes     |
{{</table>}}

## Backend Storage Details

{{<table "table table-striped table-bordered table-sm">}}
| Protocol   | ObjectScale |
|------------|:-----------:|
|  <div style="text-align: left"> AWS S3     |     Yes     |
{{</table>}}

## Supported Storage Platforms

{{<table "table table-striped table-bordered table-sm">}}
| Storage Platform | Versions |
|------------------|:--------:|
| <div style="text-align: left">  ObjectScale      |  4.0   |
{{</table>}}

## Bucket Lifecycle Workflow

1. Create Bucket &rarr; Delete Bucket
1. Create Bucket &rarr; Grant Access &rarr; Revoke Access &rarr; Delete Bucket
