---
title: "Release notes"
linkTitle: "Release notes"
weight: 1
Description: >
  Dell Container Storage Modules (CSM) release notes for resiliency
---

## Release Notes - CSM Resiliency 1.2.0

- Added support for PowerScale CSI Driver.
- Support for node taint when driver pod is unhealthy

### New Features/Changes

- Resiliency protection on driver node pods, see [CSI node failure protection](https://github.com/dell/csm/issues/145).
- Resiliency support for CSI Driver PowerScale, see [Support for CSI Driver PowerScale](https://github.com/dell/csm/issues/262).

### Fixed Issues

- Occasional failure unmounting Unity volume for raw block devices via iSCSI, see [unmounting Unity volume](https://github.com/dell/csm/issues/237).

### Known Issues