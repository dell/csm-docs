---
title: Unity
description: Release notes for Unity CSI driver
---

## Release Notes - CSI Unity v2.0.0

### New Features/Changes

- Added support for Kubernetes v1.22.
- Added support for Openshift 4.8.
- Added the ability to change log level and log format of CSI driver and change them dynamically.
- Added the ability to configure kubelet directory path.
- Added the ability to enable/disable installation of resizer sidecar with driver installation.
- Added the ability to enable/disable installation of snapshotter sidecar with driver installation.
- Added support for consistent config parameters across CSI drivers.

### Fixed Issues


### Known Issues

| Issue | Workaround |
|-------|------------|
| Topology-related node labels are not removed automatically.  | Currently, when the driver is uninstalled, topology-related node labels are not getting removed automatically. There is an open issue in the Kubernetes to fix this. Until the fix is released, remove the labels manually after the driver un-installation using command **kubectl label node <node_name> <label1>- <label2>- ...** Example: **kubectl label node <hostname> csi-unity.dellemc.com/array123-iscsi-** Note: there must be - at the end of each label to remove it.|
| NFS Clone - Resize of the snapshot is not supported by Unity Platform.| Currently, when the driver takes a clone of NFS volume, it succeeds. But when the user tries to resize the NFS volumesnapshot, the driver will throw an error. The user should never try to resize the cloned NFS volume.|
