---
title: PowerFlex
description: Release notes for PowerFlex CSI driver
---

## Release Notes - CSI PowerFlex v2.3.0

### New Features/Changes
- Added support to configure fsGroupPolicy

- Removed beta volumesnapshotclass sample files.
- Added support for Kubernetes 1.24.
- Added support for OpenShift 4.10.
- Fixed handling of idempotent snapshots.

### Fixed Issues

-  Added label to driver node pod for Resiliency protection.
-  Updated values file to use patched image of vg-snapshotter. 

### Known Issues

| Issue | Workaround |
|-------|------------|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.| Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100|
| When a node goes down, the block volumes attached to the node cannot be attached to another node                                           | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node.                   |

### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
