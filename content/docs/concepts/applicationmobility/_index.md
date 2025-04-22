---
title: "Application Mobility"
linkTitle: "Application Mobility"
weight: 9
Description: >
  Application Mobility
---

{{% pageinfo color="primary" %}}
{{< message text="10" >}} 
{{% /pageinfo %}}

Container Storage Modules for Application Mobility provide Kubernetes administrators the ability to clone their stateful application workloads and application data to other clusters, either on-premise or in the cloud.
 
Application Mobility uses object storage to copy application metadata and data. When a backup is requested, it uses these options:
 
- **[Volume Snapshots](../snapshots/)** : If enabled and supported by the CSI driver, individual snapshots are used for each Persistent Volume.
- **Full Copies**: If no snapshot options are enabled, full copies of each Persistent Volume are used.
 
After a backup is created, it can be restored on the same or any other cluster(s) if:
 
- Application Mobility is installed on the target cluster(s).
- The target cluster(s) has access to the object store bucket. For example, if backing up and restoring an application from an on-premise Kubernetes cluster to AWS EKS, an S3 bucket can be used if both the on-premise and EKS cluster have access to it.
- Storage Class is defined on the target cluster(s) to support creating the required Persistent Volumes.
## Supported Data Movers
{{<table "table table-striped table-bordered table-sm">}}
| Data Mover | Description |
|-|-|
| Restic           | Persistent Volume data will be stored in the provided object store bucket |
{{</table>}}
