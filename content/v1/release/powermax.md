---
title: PowerMax
description: Release notes for PowerMax CSI driver
---

## Release Notes - CSI PowerMax v1.7.0

### New Features/Changes
- Removed Volume Snapshotclass from helm template 
- Added support for Multi Unisphere 
- Added support for Kubernetes v1.21
- Added support for Docker MKE 3.4.0
- Added support for RHEL 8.4 

### Fixed Issues
There are no fixed issues in this release.

### Known Issues

| Issue | Workaround |
|-------|------------|
| Delete Volume fails with the error message: volume is part of masking view | This issue is due to limitations in Unisphere and occurs when Unisphere is overloaded. Currently, there is no workaround for this but can be avoided by making sure Unisphere is not overloaded during such operations. The Unisphere team is assessing a fix for this in a future Unisphere release|
| Getting initiators list fails with context deadline error |  The following error can occur during the driver installation if a large number of initiators are present on the array. There is no workaround for this but can be avoided by deleting stale initiators on the array |



