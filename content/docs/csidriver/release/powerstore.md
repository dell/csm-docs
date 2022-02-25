---
title: PowerStore
description: Release notes for PowerStore CSI driver
---

## Release Notes - CSI PowerStore v2.2.0

### New Features/Changes

- Added support for Kubernetes 1.23.
- Added support to configure FSGroupPolicy

### Fixed Issues

There are no fixed issues in this release.

### Known Issues

| Issue                                                                                                                                      | Resolution or workaround, if known                                                                                                                                                                                                                                                                                                      |
|--------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation | Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100 <br> |
| FSGroupPolicy may not work as expected without root privileges for NFS only<br/>https://github.com/kubernetes/examples/issues/260          | To get the desired behavior set "allowRoot: "true" in the storage class parameter                                                                                                                                                                                                                                                       |

### Note:

- Support for kurbernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode introduced in the release will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
