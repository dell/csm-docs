---
title: PowerScale
description: Release notes for PowerScale CSI driver
---

## Release Notes - CSI Driver for PowerScale v2.0.0

### New Features/Changes
- Added support for Kubernetes v1.22.
- Added support for OpenShift v4.8.
- Added support for CSI Spec v1.4. 
- Added support for session-based authentication.
- Added support for consistent config parameters across CSI drivers.
- Added support for configurable security permissions for volume.
- Added the ability to enable/disable installation of resizer sidecar with driver installation.
- Added the ability to enable/disable installation of snapshotter sidecar with driver installation.
- Added support to make dnsPolicy of node component configurable via Operator as well.
- Added the ability to configure kubelet directory path.
- Updated support for dynamic logging configuration.

### Fixed Issues

There are no fixed issues in this release.

### Known Issues
| Issue                                                        | Resolution or workaround, if known                           |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| If the length of the nodeID exceeds 128 characters, the driver fails to update the CSINode object and installation fails. This is due to a limitation set by CSI spec which doesn't allow nodeID to be greater than 128 characters. | The CSI PowerScale driver uses the hostname for building the nodeID which is set in the CSINode resource object, hence we recommend not having very long hostnames in order to avoid this issue. This current limitation of 128 characters is likely to be relaxed in future Kubernetes versions as per this issue in the community: https://github.com/kubernetes-sigs/gcp-compute-persistent-disk-csi-driver/issues/581 <br><br> **Note:** In kubernetes 1.22 this limit has been relaxed to 192 characters.|
| If some older NFS exports /terminated worker nodes still in NFS export client list, CSI driver tries to add a new worker node it fails (For RWX volume). | User need to manually clean the export client list from old entries to make successful additon of new worker nodes.
