---
title: "Release notes"
linkTitle: "Release notes"
weight: 9
Description: >
  Dell Container Storage Modules (CSM) release notes for replication
---

## Release Notes - CSM Replication 1.3.0

### New Features/Changes
- Added support for Kubernetes 1.24
- Added support for OpenShift 4.10
- Added volume upgrade/downgrade functionality for replication volumes


### Fixed Issues
- Fixed panic occuring when encountering PVC with empty StorageClass
- PV and RG retention policy checks are no longer case sensitive
- RG will now display EMPTY link state when no PV found
- [`PowerScale`] Running `reprotect` action on source cluster after failover no longer puts RG into UNKNOWN state
- [`PowerScale`] Deleting RG will break replication link before trying to delete group on array

### Known Issues

| Github ID | Description  |   
|-----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [514](https://github.com/dell/csm/issues/514) | **PowerScale:** When creating a replicated PV in PowerScale, the replicated PV's AzServiceIP property has the target PowerScale endpoint instead of the one defined in the target Storage class.                            |   
| [515](https://github.com/dell/csm/issues/515) | **PowerScale:** If you failover with an application still running and the volume mounted on the target site, then we cannot mount the PVC due to : "mount.nfs: Stale file handle".                                     |   
| [518](https://github.com/dell/csm/issues/518) | **PowerScale:** On CSM for Replication with PowerScale, after a repctl failover to a target cluster, the source directory has been removed from the PowerScale. The PersistentVolume Object is still present in Kubernetes. |   
| [753](https://github.com/dell/csm/issues/753) | **PowerScale:** When Persistent Volumes (PVs) are created with quota enabled on CSM versions 1.6.0 and before, an incorrect quota gets set for the target side read-only PVs/directories based on the consumed non-zero source size instead of the assigned quota of the source. This can create issues when the user performs failover and wants to write data to the failed over site. If lower quota limit is set, no new writes can be performed on the target side post failover. <br /> **Workaround** using PowerScale cluster CLI or UI: <br /> For each Persistent Volume on the source kubernetes cluster, <br /> 1. Get the quota assigned for the directory on the source PowerScale cluster. The path to the directory information can be obtained from the specification field of the Persistent Volume object. <br /> 2. Verify the quota of the target directory on the target PowerScale cluster. If incorrect quota is set, update the quota on the target directory with the same information as on the source. If no quota is set, create a quota for the target directory. |
