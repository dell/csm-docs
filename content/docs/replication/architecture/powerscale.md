---
title: PowerScale
linktitle: PowerScale
weight: 2
description: >
  Platform-Specific Architecture for CSI PowerScale
---

### SyncIQ Policy Architecture
When creating `DellCSIReplicationGroup` (RG) objects on the Kubernetes cluster(s) used for replication, a SyncIQ policy to facilitate this replication is created *only* on the source PowerScale storage array. 

This singular SyncIQ policy on the source storage array and its matching Local Target policy on the target storage array provide information for the RGs to determine their status. Upon creation, the SyncIQ policy is set to a schedule of `When source is modified`. The SyncIQ policy is `Enabled` when the RG is created. The directory that is being replicated is *read-write accessible* on the source storage array, and is restricted to *read-only* on the target. 

### Replication Group Deletion 
When deleting `DellCSIReplicationGroup` (RG) objects on the Kubernetes cluster(s) used for replication, deletion should only be performed on an empty RG. If there is any user-created or Kubernetes PV-generated data left inside of the replication group, the RG object will be held in a `Deleting` state until all user data has been cleared out. 

If the RG's folder on both source and target storage arrays is empty and the RG is given a delete command, it will perform a sync, then remove its SyncIQ policy from the source storage array, then delete the RG object on both source and target Kubernetes clusters. 

If irregular cluster/array behavior causes the RG to become stuck (ex: RG cannot verify that source and target are synced before deletion because one of the sides is down), the RG will also become stuck. If forced removal of the RG is necessary, the finalizers can be removed manually to allow for deletion, but data and SyncIQ policies may remain on the storage arrays and require manual deletion. See [this Knowledge Base Article](https://www.dell.com/support/kbdoc/en-us/000206294/dell-csm-replication-powerscale-replication-artifacts-remain-after-deletion) for further information on manual deletion. 

### Performing Failover/Failback/Reprotect on PowerScale

Failover, Failback, and Reprotect one-step operations are not natively supported on PowerScale, and are performed as a series of steps in CSM replication. When any of these operations are triggered, through the use of `repctl` or by editing the RG, the steps below are performed on the PowerScale storage arrays.

#### Failover - Halt Replication and Allow Writes on Target

Steps for performing Failover can be found in the Tools page under [Executing Actions.](https://dell.github.io/csm-docs/docs/replication/tools/#executing-actions) There are some PowerScale-specific considerations to keep in mind: 
- Failover on PowerScale does NOT halt writes on the source side. It is recommended that the storage administrator or end user manually **stop writes** to ensure no data is lost on the source side in the event of future failback. 
- In the case of unplanned failover, the SyncIQ policy on the source PowerScale array will be left enabled and set to its previously defined `When source is modified` sync schedule. Storage admins **must** manually disable this SyncIQ policy when bringing the failed-over source array back online, or unexpected behavior may occur.

The below steps are performed by CSM replication to perform a failover.

1. Syncing data from source to target one final time before transition. *(planned failover only)*
2. Disabling the SyncIQ policy on the source PowerScale storage array. *(planned failover only)*
3. Enabling writes on the target PowerScale array's Local Target policy.  

#### Failback - Discard Target

Performing failback and discarding changes made to the target is to simply resume synchronization from the source. The steps CSM replication is following to perform this operation are as follows:

1. Editing the SyncIQ policy on the source PowerScale array's schedule from `When source is modified` to `Manual`. 
2. Performing `Actions > Disallow writes` on the target PowerScale array's Local Target policy that matches the SyncIQ policy undergoing failback. 
3. Editing the SyncIQ policy's schedule from `Manual` to `When source is modified` and setting the time delay for synchronization as appropriate.
4. Enabling the source PowerScale array's SyncIQ policy. 

   
#### Failback - Discard Source

Information on the methodology for performing a failback while taking changes made to the original target can be found in relevant PowerScale SyncIQ documentation. The steps CSM replication is following to perform this operation are as follows:

1. Editing the SyncIQ policy on the source PowerScale array's schedule from `When source is modified` to `Manual`. 
2. Enabling the SyncIQ policy that is undergoing failback, if it isn't already enabled. 
3. Performing the `Resync-prep` action on the SyncIQ policy. This will create a new SyncIQ policy on the target PowerScale array, matching the original SyncIQ policy with an appended *_mirror* to its name. 
4. Starting a synchronization job on the target PowerScale array's newly created *_mirror* policy.
5. Running the `Allow writes` operation on the Local Target on the source PowerScale array that was created by the *_mirror* policy. 
6. Performing the `Resync-prep` action on the target PowerScale array's *_mirror* policy. 
7. Deleting the *_mirror* SyncIQ policy. 
8. Editing the SyncIQ policy on the source PowerScale array's schedule from `Manual` to `When source is modified` and setting the time delay for synchronization as appropriate.

#### Reprotect - Set Original Target as New Source 

A reprotect operation is, in essence, doing away with the original source-target relationship and establishing a new one in the reverse direction. This is done **only after** failing over to the original target array is complete, and the original source array is up and ready to be made into a new replication destination. To accomplish this, CSM replication performs the following steps:

1. Deleting the SyncIQ policy on the original source PowerScale array. 
2. Creating a new SyncIQ policy on the original target PowerScale array. This policy establishes the original target as a new *source*, and sets its replication destination to the original source (which can be considered the new *target*.)