---
title: "Release notes"
linkTitle: "Release notes"
weight: 9
Description: >
  Dell Container Storage Modules (CSM) release notes for replication
---

## Release Notes - CSM Replication 1.3.1

### New Features/Changes
There are no new features in this release.

### Fixed Issues
- [PowerScale Replication - Replicated PV has the wrong AzServiceIP](https://github.com/dell/csm/issues/514)
- ["repctl cluster inject --use-sa" doesn't work for Kubernetes 1.24 and above](https://github.com/dell/csm/issues/463)

### Known Issues
| Github ID                                     | Description                                                                             |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| [523](https://github.com/dell/csm/issues/523) | **PowerScale:** Artifacts are not properly cleaned after deletion.                      |
| [753](https://github.com/dell/csm/issues/753) | **PowerScale:** When Persistent Volumes (PVs) are created with quota enabled on CSM versions 1.6.0 and before, an incorrect quota gets set for the target side read-only PVs/directories based on the consumed non-zero source size instead of the assigned quota of the source. This can create issues when the user performs failover and wants to write data to the failed over site. If lower quota limit was set, no new writes can be performed on the target side post failover. Refer to the KB article xxx for workaround. |
