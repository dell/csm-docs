---
title: Operator
description: Release notes for Dell CSI Operator
---

## Release Notes - Dell CSI Operator 1.2.0

>**Note:** There is a delay in Operator 1.2.0 certification hence it will not be visible in Red Hat OpenShift certified catalogue immediately after release on GitHub.

### New Features/Changes
- Added support for OpenShift 4.5, 4.6 with RHEL and CoreOS worker nodes
- Migrated to Operator SDK 1.0
- Added support for CSI Ephemeral Inline Volumes
- Changed driver controller installation from _StatefulSet_ to _Deployment_
- Added Support for multiple replicas for driver controller _Deployment_
- Added Support for setting volumeBindingMode for Storage Classes
- Added Support for setting topology keys for Storage Classes

### Fixed Issues
There are no fixed issues in this release.

### Known Issues
There are no Known issues in this release.

### Support
The Dell CSI Operator image is available on Dockerhub and is officially supported by Dell EMC.
For any CSI operator and driver issues, questions or feedback, join the [Dell EMC Container community](https://www.dell.com/community/Containers/bd-p/Containers).
