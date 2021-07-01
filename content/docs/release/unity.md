---
title: Unity
description: Release notes for Unity CSI driver
---

## Release Notes - CSI Unity v1.6.0

### New Features/Changes
- Added support for Kubernetes v1.21
- Added support for Red Hat Enterprise Linux (RHEL) 8.4
- Added support for MKE 3.4.0
- Added support for RKE v1.2.8
- Added support for VMware Tanzu
- Added support for CSI Spec 1.3
- Added Volume limit feature
- Added support for secret in YAML format
- Added support for Dynamic log level changes

### Fixed Issues
- The flag allowRWOMultiPodAccess: false is not applicable for Raw Block volumes and the driver allows the creation of multiple pods on the same node with RWO access mode.


### Known Issues

| Issue | Workaround |
|-------|------------|
| Topology-related node labels are not removed automatically.  | Currently, when the driver is uninstalled, topology-related node labels are not getting removed automatically. There is an open issue in the Kubernetes to fix this. Until the fix is released, remove the labels manually after the driver un-installation using command **kubectl label node <node_name> <label1>- <label2>- ...** Example: **kubectl label node <hostname> csi-unity.dellemc.com/array123-iscsi-** Note: there must be - at the end of each label to remove it.|

