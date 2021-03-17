---
title: PowerFlex
description: Release notes for PowerFlex CSI driver
---

## Release Notes - CSI PowerFlex v1.4.0

### New Features/Changes
- Added support for Kubernetes v1.20
- Added support for OpenShift 4.7 with RHEL and CoreOS worker nodes
- Added support for Red Hat Enterprise Linux (RHEL) 8.3
- Added support for Fedora CoreOS
- Added automatic SDC deployment on Fedora CoreOS nodes
- Added support for Ephemeral Inline Volume
- Added support multi-mount volumes
- Added support for managing multiple PowerFlex arrays from one driver
- Removed storage classes from helm template 

### Fixed Issues
There are no fixed issues in this release.

### Known Issues

| Issue | Workaround |
|-------|------------|
| Slow volume attached/detach | If your Kubernetes 1.18 cluster has a lot of VolumeAttachment objects, the attach/detach operations will be very slow. This is a known issue and affects all CSI plugins. It is tracked here: CSI VolumeAttachment slows pod startup time. To get around this problem you can upgrade to latest Kubernetes/OpenShift patches, which contains a partial fix: 1.18.5+|
