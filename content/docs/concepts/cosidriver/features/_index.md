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
| Provisioning      | _Create Bucket_        | Minimum Viable Product  |      Done        | Bucket is created using default settings.                                                   |
|                   |                        | Brownfield provisioning |     Done         | Bucket is created based on existing bucket in Object Storage Provisioner.                   |
|                   |                        |  Advanced provisioning  |  Design draft    | Extra (non-default) parameters for bucket provisioning are controlled from the BucketClass. |
|                   | _Delete Bucket_        | Minimum Viable Product  |     Done         | Bucket is deleted.                                                                                  |
| Access Management | _Grant Bucket Access_  | Minimum Viable Product  |     Done         | Full access is granted for given bucket.                                                    |
|                   |                        |  Advanced permissions   |  Design draft    | More control over permission is done through BucketAccessClass.                             |
|                   | _Revoke Bucket Access_ | Minimum Viable Product  |     Done         | Access is revoked.                                                                                  |
{{</table>}}
