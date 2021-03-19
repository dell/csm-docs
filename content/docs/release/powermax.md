---
title: PowerMax
description: Release notes for PowerMax CSI driver
---

## Release Notes - CSI PowerMax v1.6.0

### New Features/Changes
- Added support for Kubernetes v1.20
- Added support for OpenShift 4.7 with RHEL and CoreOS worker nodes
- Added support for Red Hat Enterprise Linux (RHEL) 8.3
- Removed storage classes from helm template 

### Fixed Issues
There are no fixed issues in this release.

### Known Issues

| Issue | Workaround |
|-------|------------|
| Slow volume attached/detach | If your Kubernetes 1.18 cluster has a lot of VolumeAttachment objects, the attach/detach operations will be very slow. This is a known issue and affects all CSI plugins. It is tracked here: CSI VolumeAttachment slows pod startup time. To get around this problem you can upgrade to latest Kubernetes/OpenShift patches, which contains a partial fix: 1.18.5+|
| Delete Volume fails with error message: volume is part of masking view | This issue is due to limitations in Unisphere and occurs when Unisphere is overloaded. Currently, there is no workaround for this but can be avoided by making sure Unisphere is not overloaded during such operations. The Unisphere team is assessing a fix for this in a future Unisphere release|
