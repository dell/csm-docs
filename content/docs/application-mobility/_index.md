---
title: "Application Mobility"
linkTitle: "Application Mobility"
weight: 9
Description: >
  Application Mobility for Dell Container Storage Modules (CSM)
---

>> NOTE: This tech-preview release is not intended for use in production environment.

>> NOTE: Application Mobility requires a time-based license. See [Deployment](./deployment) for instructions.

Container Storage Modules for Application Mobility provide Kubernetes administrators the ability to clone their application workloads and data to other clusters, either on-premise or in the cloud.

Application Mobility uses [Velero](https://velero.io) and its integration of [Restic](https://restic.net) to copy both application metadata and data to object storage. When a backup is requested, Application Mobility uses these options to determine how the application data is backed up:
- If [Volume Group Snapshots](../snapshots/volume-group-snapshots/) are enabled on the CSI driver backing the application's Persistent Volumes, crash consistent snapshots of all volumes are used for the backup.
- If Volume Snapshots are enabled on the Kubernetes cluster and supported by the CSI driver, individual snapshots are used for each Persistent Volume used by the application.
- If no snapshot options are enabled, default to using full copies of each Persistent Volume used by the application.


## Supported Operating Systems/Container Orchestrator Platforms
{{<table "table table-striped table-bordered table-sm">}}
| COP/OS | Supported Versions |
|-|-|
| Kubernetes           |    1.23, 1.24 |
| Red Hat OpenShift    |    4.10       |
| RHEL                 |     7.x, 8.x  |
| CentOS               |     7.8, 7.9  |
{{</table>}}