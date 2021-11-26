---
title: PowerFlex
description: Release notes for PowerFlex CSI driver
---

## Release Notes - CSI PowerFlex v2.1.0

### New Features/Changes
- Added support for OpenShift v4.9.
- Added support for CSI spec 1.5.
- Added support for new access modes in CSI Spec 1.5.
- Added support for PV/PVC metrics.
- Added support for CSM Authorization sidecar via Helm.
- Added v1 extensions to vg snaphot from v1alpha2.
- Added support to update helm charts to do a helm install without shell scripts.
- Added support for volume health monitoring.

### Fixed Issues

There are no fixed issues in this release.

### Known Issues

| Issue | Workaround |
|-------|------------|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.| Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100|

### Note:

- This release we have added support for kurbernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode, however, these features will not be available in Openshift environment as Openshift doesn't allow enabling of alpha features through feature-gates for Production Grade clusters.
