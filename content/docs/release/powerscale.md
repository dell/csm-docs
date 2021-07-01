---
title: PowerScale
description: Release notes for PowerScale CSI driver
---

## Release Notes - CSI Driver for PowerScale v1.6.0

### New Features/Changes
- Added support for Kubernetes 1.21.
- Added support for Red Hat Enterprise Linux (RHEL) 8.4.
- Added support for CSI Spec 1.3.
- Added support for Volume Limit.
- Added support for node selector functionality to helm template.
- Added support for secret in YAML format.
- Added support for Dynamic log level changes.
- Added support to make dnsPolicy of node component configurable via Helm

### Fixed Issues

There are no fixed issues in this release.

### Known Issues
| Issue                                                        | Resolution or workaround, if known                           |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| If the length of the nodeID exceeds 128 characters, the driver fails to update the CSINode object and installation fails. This is due to a limitation set by CSI spec which doesn't allow nodeID to be greater than 128 characters. | The CSI PowerScale driver uses the hostname for building the nodeID which is set in the CSINode resource object, hence we recommend not having very long hostnames in order to avoid this issue. This current limitation of 128 characters is likely to be relaxed in future Kubernetes versions as per this issue in the community: https://github.com/kubernetes-sigs/gcp-compute-persistent-disk-csi-driver/issues/581 |