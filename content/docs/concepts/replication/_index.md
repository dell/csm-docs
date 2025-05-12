---
title: 'Replication'
linkTitle: 'Replication'
weight: 6
no_list: true
Description: >
  Container Storage Modules (CSM) for Replication
---

<hr>
<br>

Replication aims to bring Replication & Disaster Recovery capabilities of Dell
Storage Arrays to Kubernetes clusters. It helps you replicate groups of volumes
using the native replication technology available on the storage array and can
provide you a way to restart applications in case of both planned and unplanned
migration.

## Replication Capabilities

Replication provides the following capabilities:

{{<table "table table-striped table-bordered table-sm">}}

| Capability                                                                                                                                                        | PowerStore | PowerScale | PowerFlex | PowerMax | Unity |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |:----------:| :--------: | :-------: |:--------:| :---: |
| <div style="text-align: left">Replicate data using native storage array based replication                                                                         |    Yes     |    Yes     |    Yes    |   Yes    |  No   |
| <div style="text-align: left">Asynchronous file volume replication                                                                                                |    Yes     |    Yes     |    No     |    No    |  No   |
| <div style="text-align: left">Asynchronous block volume replication                                                                                               |    N/A     |    N/A     |    Yes    |   Yes    |  No   |
| <div style="text-align: left">Synchronous file volume replication                                                                                                 |     No     |     No     |    No     |    No    |  No   |
| <div style="text-align: left">Synchronous block volume replication                                                                                                |    N/A     |    N/A     |    No     |   Yes    |  No   |
| <div style="text-align: left">Shared NFS Volumes                                                                                                                  |    Yes     |    N/A     |    N/A    |   N/A    |  N/A  |
| <div style="text-align: left">Active-Active (Metro) block volume replication                                                                                      |    N/A     |    N/A     |    No     |   Yes    |  No   |
| <div style="text-align: left">Active-Active (Metro) file volume replication                                                                                       |     No     |     No     |    No     |    No    |  No   |
| <div style="text-align: left">Create `PersistentVolume` objects in the cluster representing the replicated volume                                                 |    Yes     |    Yes     |    Yes    |   Yes    |  No   |
| <div style="text-align: left">Create `DellCSIReplicationGroup` objects in the cluster                                                                             |    Yes     |    Yes     |    Yes    |   Yes    |  No   |
| <div style="text-align: left">Failover & Reprotect applications using the replicated volumes                                                                      |    Yes     |    Yes     |    Yes    |   Yes    |  No   |
| <div style="text-align: left">Controller reattach failover PV to PVC automatically in a stretched cluster                                                         |    Yes     |    Yes     |    Yes    |   Yes    |  No   |
| <div style="text-align: left">Allow PVC creation on target(multi cluster), claimRef update on remote PV (both single & multi cluster)                             |    Yes     |    Yes     |    Yes    |   Yes    |  No   | 
| <div style="text-align: left">Online Volume Expansion for replicated volumes                                                                                      |     No     |     No     |    Yes    |   Yes    |  No   |
| <div style="text-align: left">Provides a command line utility - [repctl](tools) for configuring & managing replication related resources across multiple clusters |    Yes     |    Yes     |    Yes    |   Yes    |  No   |

{{</table>}}

> _**NOTE**_: To add or delete PVs on an existing SYNC Replication Group in
> PowerStore, the user needs to pause, perform the operation and then resume the
> replication group. For more details, please refer to the troubleshooting
> section.

> _**NOTE**_: To delete the last PV from a SYNC Replication Group in PowerStore,
> the user needs to first unassign the protection policy from the corresponding
> volume group on the PowerStore Manager UI. For more details, please refer to
> the troubleshooting section.

## Details

As on the storage arrays, all replication related Kubernetes entities are
required to be created in pairs -

1. Pair of Kubernetes Clusters
2. Pair of replication enabled Storage classes
3. Pair of PersistentVolumes representing the replicated pair on the storage
   array
4. Pair of [DellCSIReplicationGroup](architecture/#dellcsireplicationgroup)
   objects representing the replicated protection groups on the storage array

You can also use a single stretched Kubernetes cluster for protecting your
applications. Even in this [topology](cluster-topologies), the rest of the
objects still exist in source/target pairs.

### What it does not do

- Replicate application manifests within/across clusters.
- Stop applications before the planned/unplanned migration.
- Start applications after the migration.
- Replicate `PersistentVolumeClaim` objects within single cluster.
- Replication with METRO mode does not need replicator sidecar and common
  replication controller.
- Different namespaces cannot share the same RDF group for creating volumes with
  ASYNC mode for PowerMax.
- Same RDF group cannot be shared across different replication modes for
  PowerMax.
- Replication support for multiple drivers installed on same Kubernetes cluster.

### QuickStart

1. Install all required components:

    - Enable replication during CSI driver installation
    - Install Replication Controller & repctl

2. Create replication enabled storage classes
3. Create `PersistentVolumeClaim` using the replication enabled storage class

### How it works

At a high level, the following happens when you create a `PersistentVolumeClaim`
object using a replication enabled storage class -

1. CSI driver creates protection group on the storage array (if required)
2. CSI driver creates the volume and adds it to the protection group. There will
   be a corresponding group and pair on the remote storage array
3. A `DellCSIReplicationGroup` object is created in the cluster representing the
   protection group on the storage array
4. A replica of the `PersistentVolume` & `DellCSIReplicationGroup` is created
5. A replica of the `PersistentVolumeClaim` is created on target cluster (only in case of `multi-cluster`)


You can refer this [page](architecture) for more details about the architecture.

Once the `DellCSIReplicationGroup` & `PersistentVolume` objects have been
replicated across clusters (or within the same cluster), you can exercise the
general Disaster Recovery workflows -

1. Planned Migration to the target cluster/array
2. Unplanned Migration to the target cluster/array
3. Reprotect volumes at the target cluster/array
4. Maintenance activities like - Suspend, Resume, Establish replication