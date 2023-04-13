---
title: "Release notes"
linkTitle: "Release notes"
weight: 9
Description: >
  Dell Container Storage Modules (CSM) release notes for replication
---

## Release Notes - CSM Replication 1.4.0

### New Features/Changes

 - [PowerScale - Implement Failback functionality](https://github.com/dell/csm/issues/558)
 - [PowerScale - Implement Reprotect functionality](https://github.com/dell/csm/issues/532)
 - [PowerScale - SyncIQ policy improvements](https://github.com/dell/csm/issues/573)
 - [PowerFlex - Initial Replication Support](https://github.com/dell/csm/issues/618)
 - [Replication APIs to be moved from alpha phase](https://github.com/dell/csm/issues/432)

### Fixed Issues

| Github ID                                     | Description                                                        |
| --------------------------------------------- | ------------------------------------------------------------------ |
| [523](https://github.com/dell/csm/issues/523) | **PowerScale:** Artifacts are not properly cleaned after deletion. |

### Known Issues

| Github ID                                     | Description                                                        |
| --------------------------------------------- | ------------------------------------------------------------------ |
| [753](https://github.com/dell/csm/issues/753) | **PowerScale:** When Persistent Volumes (PVs) are created with quota enabled on CSM versions 1.6.0 and before, an incorrect quota gets set for the target side read-only PVs/directories based on the consumed non-zero source size instead of the assigned quota of the source. This can create issues when the user performs failover and wants to write data to the failed over site. If lower quota limit was set, no new writes can be performed on the target side post failover. Refer to the KB article xxx for workaround. |
