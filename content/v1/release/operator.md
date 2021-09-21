---
title: Operator
description: Release notes for Dell CSI Operator
---

## Release Notes - Dell CSI Operator 1.4.0

>**Note:** There will be a delay in certification of Dell CSI Operator 1.4.0 and it will not be available for download from the Red Hat OpenShift certified catalog. The operator will still be available for download from the Red Hat OpenShift Community Catalog soon after the 1.4.0 release.

### New Features/Changes

- Added support for Kubernetes v1.21
- Deprecated support for Kubernetes v1.18
- Migrated to Operator SDK v1.5.0
- Deprecated Storage Class Creation and Support
- Deprecated Volume Snapshot Class Creation and Support

### Fixed Issues
There are no fixed issues in this release.

### Known Issues
| Issue | Workaround |
|-------|------------|
| A warning message will be listed in the events for cluster scoped objects if the driver is not upgraded after an operator upgrade. This happens because of the fix provided by Kubernetes in 1.20 for one of the known [issue](https://github.com/kubernetes/kubernetes/issues/65200). | After an operator upgrade, the objects will get updated automatically after 45 mins in case of no driver upgrade. |

### Support
The Dell CSI Operator image is available on Dockerhub and is officially supported by Dell EMC.
For any CSI operator and driver issues, questions or feedback, join the [Dell EMC Container community](https://www.dell.com/community/Containers/bd-p/Containers).
