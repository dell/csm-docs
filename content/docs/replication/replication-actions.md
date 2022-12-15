---
title: Replication Actions
linktitle: Replication Actions
weight: 6
description: >
  DellCSIReplicationGroup Actions
---

You can exercise native replication control operations from Dell storage arrays by performing "Actions" on the replicated group of volumes using the DellCSIReplicationGroup object. 

You can patch the DellCSIReplicationGroup Custom Resource and set the action field in the spec to one of the allowed values (refer to tables in this document).

When you set the action field in the Custom Resource object, the following happens:

* State of the RG CR is set to `action_in_progress`. For e.g. if you set the action field to SYNC, then the state will change to SYNC_IN_PROGRESS, action field will reset to empty
* dell-csi-replicator sidecar issues the command to the CSI driver to perform the appropriate action
* Once the CSI driver has completed the operation, State of the RG CR goes back to Ready

While the action is in progress, you shouldn't update the action field. Any attempt to change the action field will be rejected and it will be reset to empty.
There are certain pre-requisites that have to be fulfilled before any action can be done on the RG CR. For e.g. - you can't perform a Reprotect without doing a Failover first. There are some "Workflows" defined in Section 2 of this document which provide a sequence of operations for some common use-cases. An important exception to these rules is the action UNPLANNED_FAILOVER which can be run at any time.

>Note - Throughout this document, we are going to refer to "Hopkinton" as the original source site & "Durham" as the original target site.

### Site Specific Actions
These actions can be run at any site, but they have some site-specific context included.

Any action with the __LOCAL__ suffix means, do this action for the local site. Any action with the __REMOTE__ suffix means do this action for the remote site.

For e.g. - 
* If the CR at `Hopkinton` is patched with action FAILOVER_REMOTE, it means that the driver will attempt to `Fail Over` to __Durham__ which is the remote site. 
* If the CR at `Durham` is patched with action FAILOVER_LOCAL, it means that the driver will attempt to `Fail Over` to __Durham__ which is the local site.
* If the CR at `Durham` is patched with REPROTECT_LOCAL, it means that the driver will `Re-protect` the volumes at __Durham__ which is the local site.

The following table lists details of what actions should be used in different Disaster Recovery workflows & the equivalent operation done on the storage array:

{{<table "table table-striped table-bordered table-sm">}}
| Workflow            | Actions                                               | PowerMax               | PowerStore                             | PowerScale                                       | Unity                                  |
| ------------------- | ----------------------------------------------------- | ---------------------- | -------------------------------------- | ------------------------------------------------ | -------------------------------------- |
| Planned Migration   | FAILOVER_LOCAL<br>FAILOVER_REMOTE                     | symrdf failover -swap  | FAILOVER (no REPROTECT after FAILOVER) | allow_writes on target, disable local policy     | FAILOVER (no REPROTECT after FAILOVER) |
| Reprotect           | REPROTECT_LOCAL<br>REPROTECT_REMOTE                   | symrdf resume/est      | REPROTECT                              | Delete policy on source, create policy on target | REPROTECT                              |
| Unplanned Migration | UNPLANNED_FAILOVER_LOCAL<br>UNPLANNED_FAILOVER_REMOTE | symrdf failover -force | FAILOVER (at target site)              | allow_writes on target                           | FAILOVER (at target site)              |
{{</table>}}

### Maintenance Actions
These actions can be run at any site and are used to change the replication link state for maintenance activities.
The following table lists the supported maintenance actions and the equivalent operation done on the storage arrays

{{<table "table table-striped table-bordered table-sm">}}
| Action  | Description                                        | PowerMax         | PowerStore      | PowerScale           | Unity  |
| ------- | -------------------------------------------------- | ---------------- | --------------- | -------------------- | ------ |
| SUSPEND | Temporarily suspend <br> replication               | symrdf suspend   | PAUSE           | disable local policy | PAUSE  |
| RESUME  | Resume replication                                 | symrdf resume    | RESUME          | enable local policy  | RESUME |
| SYNC    | Synchronize all changes <br> from source to target | symrdf establish | SYNCHRONIZE NOW | start syncIQ job     | SYNC   |
{{</table>}}

### How to perform actions
We strongly recommend using `repctl` to perform any actions on `DellCSIReplicationGroup` objects. You can find detailed steps [here](../tools/#executing-actions)

If you wish to use `kubectl` to perform actions, then use kubectl edit/patch operations and set the `action` field in the Custom Resource.
While performing site-specific actions, please consult each driver's documentation to get an exhaustive list of all the supported actions.

For a brief guide on using actions for various DR workflows, please refer to this [document](../disaster-recovery) 

