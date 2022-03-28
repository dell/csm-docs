---
title: "Replication"
linkTitle: "Replication"
weight: 6
Description: >
  Dell Container Storage Modules (CSM) for Replication
---
[Container Storage Modules](https://github.com/dell/csm) (CSM) for Replication is part of the  open-source suite of Kubernetes storage enablers for Dell products. 

CSM for Replication project aims to bring Replication & Disaster Recovery capabilities of Dell Storage Arrays to Kubernetes clusters.
It helps you replicate groups of volumes using the native replication technology available on the storage array and can provide you a way to restart
applications in case of both planned and unplanned migration.

## CSM for Replication Capabilities

CSM for Replication provides the following capabilities:

{{<table "table table-striped table-bordered table-sm">}}
| Capability | PowerScale | Unity | PowerStore | PowerFlex | PowerMax |
| - | :-: | :-: | :-: | :-: | :-: |
| Replicate data using native storage array based replication | yes | no | yes | no | yes |
| Create `PersistentVolume` objects in the cluster representing the replicated volume | yes |  no | yes | no | yes |
| Create `DellCSIReplicationGroup` objects in the cluster | yes |  no | yes | no | yes |
| Failover & Reprotect applications using the replicated volumes | yes |  no | yes | no | yes |
| Provides a command line utility - [repctl](tools) for configuring & managing replication related resources across multiple clusters | yes | no | yes | no | yes |
{{</table>}}

## Supported Operating Systems/Container Orchestrator Platforms

{{<table "table table-striped table-bordered table-sm">}}
| COP/OS | PowerMax | PowerStore | PowerScale |
|-|-|-|-|
| Kubernetes    | 1.21, 1.22, 1.23 | 1.21, 1.22, 1.23 | 1.21, 1.22, 1.23|
| Red Hat OpenShift | 4.8, 4.9 | 4.8, 4.9 | 4.8, 4.9 |
| RHEL          |     7.x, 8.x      |     7.x, 8.x      |  7.x, 8.x |
| CentOS        |     7.8, 7.9     |     7.8, 7.9     | 7.8, 7.9 |
| Ubuntu        |       20.04      |       20.04      | 20.04 |
| SLES          |        15SP2        |        15SP2        | 15SP2 |
{{</table>}}

## Supported Storage Platforms

{{<table "table table-striped table-bordered table-sm">}}
|               | PowerMax | PowerStore | PowerScale |
|---------------|:-------------------:|:----------------:|:----------------:|
| Storage Array | 5978.479.479, 5978.711.711, Unisphere 9.2 | 1.0.x, 2.0.x, 2.1.x | OneFS 8.1, 8.2, 9.0, 9.1, 9.2, 9.3 |
{{</table>}}

## Supported CSI Drivers

CSM for Replication supports the following CSI drivers and versions.
{{<table "table table-striped table-bordered table-sm">}}
| Storage Array | CSI Driver | Supported Versions |
| ------------- | ---------- | ------------------ |
| CSI Driver for Dell PowerMax | [csi-powermax](https://github.com/dell/csi-powermax) | v2.0 + |
| CSI Driver for Dell PowerStore | [csi-powerstore](https://github.com/dell/csi-powerstore) | v2.0 + |
| CSI Driver for Dell PowerScale | [csi-powerscale](https://github.com/dell/csi-powerscale) | v2.2 + |
{{</table>}}

## Details

As on the storage arrays, all replication related Kubernetes entities are required/created in pairs -
1. Pair of Kubernetes Clusters
2. Pair of replication enabled Storage classes
3. Pair of PersistentVolumes representing the replicated pair on the storage array
4. Pair of [DellCSIReplicationGroup](architecture/#dellcsireplicationgroup) objects representing the replicated protection groups on the storage array

You can also use a single stretched Kubernetes cluster for protecting your applications. Even in this [topology](cluster-topologies), rest of
the objects still exist in pairs.

### What it does not do
* Replicate application manifests within/across clusters.
* Stop applications before the planned/unplanned migration.
* Start applications after the migration.
* Replicate `PersistentVolumeClaim` objects within/across clusters.
* Replication with METRO mode does not need Replicator sidecar and common controller.

### CSM for Replication Module Capabilities

CSM for Replication provides the following capabilities:

{{<table "table table-striped table-bordered table-sm">}}
| Capability | PowerMax | PowerStore | PowerScale | PowerFlex | Unity |
| ---------| -------- | -------- | -------- | -------- | -------- |
| Asynchronous replication of PVs accross K8s clusters    | yes | yes | yes | no  | no  |
| Synchronous replication of PVs accross K8s clusters     | yes | no  | no  | no  | no  |
| Single cluster (stretched) mode replication             | yes | yes | yes | no  | no  |
| Replication actions (failover, reprotect)               | yes | yes | yes | no  | no  | 
{{</table>}}

### Supported Platforms

The following matrix provides a list of all supported versions for each Dell Storage product.

| Platforms | PowerMax | PowerStore | PowerScale |
| -------- | --------- | ---------- | ---------- |
| Kubernetes | 1.21, 1.22, 1.23  | 1.21, 1.22, 1.23 | 1.21, 1.22, 1.23 |
| CSI Driver | 2.x | 2.x | 2.2+ | 

| Platforms | PowerMax | PowerStore | PowerScale |
| -------- | --------- | ---------- | ---------- |
| RedHat Openshift |4.8, 4.9 | 4.8, 4.9 | 4.8, 4.9 |
| CSI Driver | 2.2+ | 2.x | 2.2+ |

For compatibility with storage arrays please refer to corresponding [CSI drivers](../csidriver/#features-and-capabilities)

### QuickStart
1. Install all required components:
  * Enable replication during CSI driver installation
  * Install CSM Replication Controller & repctl
2. Create replication enabled storage classes
3. Create `PersistentVolumeClaim` using the replication enabled storage class

### How it works
At a high level, the following happens when you create a `PersistentVolumeClaim` object using a replication enabled storage class -
1. CSI driver creates protection group on the storage array (if required)
2. CSI driver creates the volume and adds it to the protection group. There will be a corresponding group and pair on the remote storage array
3. A `DellCSIReplicationGroup` object is created in the cluster representing the protection group on the storage array
4. A replica of the `PersistentVolume` & `DellCSIReplicationGroup` is created

You can refer this [page](architecture) for more details about the architecture.

Once the `DellCSIReplicationGroup` & `PersistentVolume` objects have been replicated across clusters (or within the same cluster), you
can exercise the general Disaster Recovery workflows -
1. Planned Migration to the target cluster/array
2. Unplanned Migration to the target cluster/array
3. Reprotect volumes at the target cluster/array
4. Maintenance activities like - Suspend, Resume, Establish replication

