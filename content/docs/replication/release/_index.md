---
title: "Release notes"
linkTitle: "Release notes"
weight: 9
Description: >
  Dell Container Storage Modules (CSM) release notes for authorization
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

There are no known issues in this release.
