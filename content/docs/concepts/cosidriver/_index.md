---
title: "COSI Driver"
linkTitle: "COSI Driver"
description: About Dell Technologies (Dell) COSI Driver 
no_list: true 
weight: 3
---

The COSI Driver by Dell connects a COSI-enabled Container Orchestrator with Dell Storage Arrays. It is a Kubernetes plug-in that provides object storage using Dell storage systems.

Dell COSI Driver is a multi-backend driver, meaning that it can connect to multiple Object Storage Platform (OSP) Instances and provide access to them using the same COSI interface.

## Features and capabilities

### Supported Container Orchestrator Platforms

> ℹ️ **NOTE:** during technical preview, no certification is performed. The platforms listed below were tested by developers using integration test suite.

{{<table "table table-striped table-bordered table-sm">}}
|            |    COSI    |
|------------|:----------:|
|  <div style="text-align: left"> Kubernetes |    1.27    |
| <div style="text-align: left">  K3s        |    1.27    |
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
|  <div style="text-align: left"> GCS        |     N/A     |
|  <div style="text-align: left"> Azure Blob |     N/A     |
{{</table>}}

## Supported Storage Platforms

{{<table "table table-striped table-bordered table-sm">}}
| Storage Platform | Versions |
|------------------|:--------:|
| <div style="text-align: left">  ObjectScale      |  1.2.x   |
{{</table>}}

> **NOTE:** Object Scale 1.2.x is planned for End of Standard Support on January 31st 2025. Please refer <a href="https://www.dell.com/support/kbdoc/en-uk/000185734/all-dell-emc-end-of-life-documents?lang=en">Dell Support documentation</a> for more information. We plan to support COSI driver when a new version of ObjectScale is available.

## Bucket Lifecycle Workflow

1. Create Bucket &rarr; Delete Bucket
1. Create Bucket &rarr; Grant Access &rarr; Revoke Access &rarr; Delete Bucket
