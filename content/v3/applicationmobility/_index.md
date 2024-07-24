---
title: "Application Mobility"
linkTitle: "Application Mobility"
weight: 9
Description: >
  Application Mobility
---

>> NOTE: This tech-preview release is not intended for use in production environment.

>> NOTE: Application Mobility requires a time-based license. See [Deployment](./deployment) for instructions.

Container Storage Modules for Application Mobility provide Kubernetes administrators the ability to clone their stateful application workloads and application data to other clusters, either on-premise or in the cloud.

Application Mobility uses [Velero](https://velero.io) and its integration of [Restic](https://restic.net) to copy both application metadata and data to object storage. When a backup is requested, Application Mobility uses these options to determine how the application data is backed up:
- If [Volume Group Snapshots](../snapshots/volume-group-snapshots/) are enabled on the CSI driver backing the application's Persistent Volumes, crash consistent snapshots of all volumes are used for the backup.
- If [Volume Snapshots](../snapshots/) are enabled on the Kubernetes cluster and supported by the CSI driver, individual snapshots are used for each Persistent Volume used by the application.
- If no snapshot options are enabled, default to using full copies of each Persistent Volume used by the application.

After a backup has been created, it can be restored on the same Kubernetes cluster or any other cluster(s) if this criteria is met:
- Application Mobility is installed on the target cluster(s).
- The target cluster(s) has access to the object store bucket. For example, if backing up and restoring an application from an on-premise Kubernetes cluster to AWS EKS, an S3 bucket can be used if both the on-premise and EKS cluster have access to it.
- Storage Class is defined on the target cluster(s) to support creating the required Persistent Volumes used by the application.

## Supported Data Movers

| Data Mover | Description |
|-|-|
| Restic           | Persistent Volume data will be stored in the provided object store bucket |
{.table-sm .table-bordered .table-striped}

## Supported Operating Systems/Container Orchestrator Platforms

| COP/OS | Supported Versions |
|-|-|
| Kubernetes           |    1.23, 1.24, 1.25, 1.26 |
| Red Hat OpenShift    |    4.10, 4.11       |
| RHEL                 |     7.x, 8.x  |
| CentOS               |     7.8, 7.9  |
{.table-sm .table-bordered .table-striped}
