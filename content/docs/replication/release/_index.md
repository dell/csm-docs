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
| [514](https://github.com/dell/csm/issues/514) | When creating a replicated PV in PowerScale, the replicated PV's AzServiceIP property has the target PowerScale endpoint instead of the one defined in the target Storage class.                            |   
| [515](https://github.com/dell/csm/issues/515) | If you failover with an application still running and having a mounted the volume, on the target site we cannot mount the PVC due to : "mount.nfs: Stale file handle".                                      |   
| [518](https://github.com/dell/csm/issues/518) | On CSM for Replication with PowerScale, after a repctl failover to a target cluster, the source directory has been removed from the PowerScale. The PersistentVolume Object is still present in Kubernetes. |   
