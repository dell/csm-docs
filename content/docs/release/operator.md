---
title: Operator
description: Release notes for Dell CSI Operator
---

## Release Notes - Dell CSI Operator 1.3.0

>**Note:** There will be a delay in certification of Dell CSI Operator 1.3.0 and it will not be available for download from the Red Hat OpenShift certified catalog. The operator will still be available for download from the Red Hat OpenShift Community Catalog soon after the 1.3.0 release.

### New Features/Changes
- Added support for OpenShift 4.6, 4.7 with RHEL and CoreOS worker nodes
- Added support for Upstream Kubernetes cluster v1.18, v1.19, v1.20
- Migrated to Operator SDK 1.0
- Added support for CSI Ephemeral Inline Volumes
- Changed driver controller installation from _StatefulSet_ to _Deployment_
- Added Support for multiple replicas for driver controller _Deployment_
- Added Support for setting volumeBindingMode for Storage Classes
- Added Support for setting topology keys for Storage Classes

### Fixed Issues
There are no fixed issues in this release.

### Known Issues
| Issue | Workaround |
|-------|------------|
| A warning message will be listed in the events for StorageClasses if the driver is not upgraded after an operator upgrade. This happens because of the fix provided by Kubernetes in 1.20 for one of the known [issue](https://github.com/kubernetes/kubernetes/issues/65200). | StorageClasses will get updated automatically after 45 mins if there is no driver upgrade, after an operator upgrade. |

### Support
The Dell CSI Operator image is available on Dockerhub and is officially supported by Dell EMC.
For any CSI operator and driver issues, questions or feedback, join the [Dell EMC Container community](https://www.dell.com/community/Containers/bd-p/Containers).
