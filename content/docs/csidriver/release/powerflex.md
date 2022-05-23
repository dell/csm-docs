---
title: PowerFlex
description: Release notes for PowerFlex CSI driver
---

## Release Notes - CSI PowerFlex v2.3.0

### New Features/Changes

- Removed beta volumesnapshotclass sample files.
- Added support for Kubernetes 1.24.
- Added support for OpenShift 4.10.

### Fixed Issues

There are no fixed issues in this release.

### Known Issues

| Issue | Workaround |
|-------|------------|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.| Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100|

### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
