---
title: Unity
description: Release notes for Unity CSI driver
---

## Release Notes - CSI Unity v2.1.0

### New Features/Changes

- Added support for OpenShift v4.9.
- Added support for CSI spec 1.5.
- Added support for new access modes in CSI Spec 1.5.
- Added support for PV/PVC metrics.
- Added NFS support for PVC metrics in controller.
- Added ability to associate a tenant with storage volumes. - 
- Added support for volume health monitoring.

### Fixed Issues


### Known Issues

| Issue | Workaround |
|-------|------------|
| Topology-related node labels are not removed automatically.  | Currently, when the driver is uninstalled, topology-related node labels are not getting removed automatically. There is an open issue in the Kubernetes to fix this. Until the fix is released, remove the labels manually after the driver un-installation using command **kubectl label node <node_name> <label1>- <label2>- ...** Example: **kubectl label node <hostname> csi-unity.dellemc.com/array123-iscsi-** Note: there must be - at the end of each label to remove it.|
| NFS Clone - Resize of the snapshot is not supported by Unity Platform.| Currently, when the driver takes a clone of NFS volume, it succeeds. But when the user tries to resize the NFS volumesnapshot, the driver will throw an error. The user should never try to resize the cloned NFS volume.|
