---
title: PowerScale
description: Release notes for PowerScale CSI driver
---

## Release Notes - CSI Driver for PowerScale v2.2.0

### New Features/Changes

- Added support for Kubernetes 1.23.
- Added support for fsGroupPolicy.
- Added support for session based authentication along with basic authentication for PowerScale.

### Fixed Issues

There are no fixed issues in this release.

### Known Issues
| Issue                                                        | Resolution or workaround, if known                           |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| If the length of the nodeID exceeds 128 characters, the driver fails to update the CSINode object and installation fails. This is due to a limitation set by CSI spec which doesn't allow nodeID to be greater than 128 characters. | The CSI PowerScale driver uses the hostname for building the nodeID which is set in the CSINode resource object, hence we recommend not having very long hostnames in order to avoid this issue. This current limitation of 128 characters is likely to be relaxed in future Kubernetes versions as per this issue in the community: https://github.com/kubernetes-sigs/gcp-compute-persistent-disk-csi-driver/issues/581 <br><br> **Note:** In kubernetes 1.22 this limit has been relaxed to 192 characters.|
| If some older NFS exports /terminated worker nodes still in NFS export client list, CSI driver tries to add a new worker node it fails (For RWX volume). | User need to manually clean the export client list from old entries to make successful additon of new worker nodes.
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.| Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100|
| fsGroupPolicy may not work as expected with "root_squash". | To get the desired behavior "no_root_squash" has to be enabled. |

### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode introduced in the release will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
