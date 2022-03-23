---
title: PowerMax
description: Release notes for PowerMax CSI driver
---

## Release Notes - CSI PowerMax v2.0.0

### New Features/Changes
- Added support for Kubernetes v1.22.
- Added support for OpenShift v4.8.
- Added support for RKE v1.2.8.
- Added support for consistent config parameters across CSI drivers.
- Added the ability to change log level and log format of CSI driver and change them dynamically.
- Added the ability to configure kubelet directory path.
- Added the ability to enable/disable installation of resizer sidecar with driver installation.
- Added the ability to enable/disable installation of snapshotter sidecar with driver installation.

### Fixed Issues
There are no fixed issues in this release.

### Known Issues

| Issue | Workaround |
|-------|------------|
| Delete Volume fails with the error message: volume is part of masking view | This issue is due to limitations in Unisphere and occurs when Unisphere is overloaded. Currently, there is no workaround for this but it can be avoided by ensuring that Unisphere is not overloaded during such operations. The Unisphere team is assessing a fix for this in a future Unisphere release|
| Getting initiators list fails with context deadline error |  The following error can occur during the driver installation if a large number of initiators are present on the array. There is no workaround for this but it can be avoided by deleting stale initiators on the array|
| Unable to update Host: A problem occurred modifying the host resource | This issue occurs when the nodes do not have unique hostnames or when an IP address/FQDN with same sub-domains are used as hostnames. The workaround is to use unique hostnames or FQDN with unique sub-domains|



