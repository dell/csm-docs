---
title: "Features"
linkTitle: "Features" 
weight: 4
description: Description of COSI Driver features 
no_list: true
---

## ObjectScale

{{<table "table table-striped table-bordered table-sm">}}
| Area              | Core Features          |  Implementation level   |     Status      | Details                                                                                     |
|:------------------|:-----------------------|:-----------------------:|:---------------:|---------------------------------------------------------------------------------------------|
| Provisioning      | _Create Bucket_        | <div style="text-align: left"> Minimum Viable Product  |      Done        | <div style="text-align: left"> Bucket is created using default settings.                                                   |
|                   |                        | <div style="text-align: left"> Brownfield provisioning |     Done         | <div style="text-align: left"> Bucket is created based on existing bucket in Object Storage Provisioner.                   |
|                   |                        |  <div style="text-align: left"> Advanced provisioning  |  Design draft    | <div style="text-align: left"> Extra (non-default) parameters for bucket provisioning are controlled from the BucketClass. |
|                   | _Delete Bucket_        | <div style="text-align: left"> Minimum Viable Product  |     Done         | <div style="text-align: left"> Bucket is deleted.                                                                                  |
| Access Management | _Grant Bucket Access_  | <div style="text-align: left"> Minimum Viable Product  |     Done         | <div style="text-align: left"> Full access is granted for given bucket.                                                    |
|                   |                        |  <div style="text-align: left"> Advanced permissions   |  Design draft    | <div style="text-align: left"> More control over permission is done through BucketAccessClass.                             |
|                   | _Revoke Bucket Access_ | <div style="text-align: left"> Minimum Viable Product  |     Done         | <div style="text-align: left"> Access is revoked.                                                                                  |
{{</table>}}
