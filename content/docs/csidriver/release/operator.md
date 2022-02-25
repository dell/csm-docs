---
title: Operator
description: Release notes for Dell CSI Operator
---

## Release Notes - Dell CSI Operator 1.7.0

>**Note:** There will be a delay in certification of Dell CSI Operator 1.7.0 and it will not be available for download from the Red Hat OpenShift certified catalog right away. The operator will still be available for download from the Red Hat OpenShift Community Catalog soon after the 1.7.0 release.

### New Features/Changes

- Added support for Kubernetes v1.23

### Fixed Issues
There are no fixed issues in this release.

### Known Issues
| Issue | Workaround |
|-------|------------|
| A warning message will be listed in the events for cluster scoped objects if the driver is not upgraded after an operator upgrade. This happens because of the fix provided by Kubernetes in 1.20 for one of the known [issue](https://github.com/kubernetes/kubernetes/issues/65200). | After an operator upgrade, the objects will get updated automatically after 45 mins in case of no driver upgrade. |

### Support
The Dell CSI Operator image is available on Dockerhub and is officially supported by Dell EMC.
For any CSI operator and driver issues, questions or feedback, please follow our [support process](../../../support/).
