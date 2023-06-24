---
title: Operator
description: Release notes for Dell CSI Operator
---

## Release Notes - Dell CSI Operator 1.12.0
{{% pageinfo color="primary" %}}
The Dell CSI Operator is no longer actively maintained or supported. It will be deprecated in CSM 1.9. It is highly recommended that you use [CSM Operator](../../../deployment/csmoperator) going forward.
{{% /pageinfo %}}

### New Features/Changes

- [Added support to Kubernetes 1.27](https://github.com/dell/csm/issues/761)
- [Added support to Openshift 4.12](https://github.com/dell/csm/issues/571)
- [Added Storage Capacity Tracking support for CSI-PowerScale](https://github.com/dell/csm/issues/824)
- [Migrated image registry from k8s.gcr.io to registry.k8s.io](https://github.com/dell/csm/issues/744)
- [Allow user to set Quota limit parameters from the PVC request in CSI PowerScale](https://github.com/dell/csm/issues/742)

>**Note:** There will be a delay in certification of Dell CSI Operator 1.12.0 and it will not be available for download from the Red Hat OpenShift certified catalog right away. The operator will still be available for download from the Red Hat OpenShift Community Catalog soon after the 1.12.0 release.

### Fixed Issues

- [CHAP is set to true in the CSI-PowerStore sample file in CSI Operator](https://github.com/dell/csm/issues/812)
- [Vsphere credentials for vsphere secrets is expected when vsphere enable is set to false in CSI PowerMax](https://github.com/dell/csm/issues/799)

### Known Issues
There are no known issues in this release.

### Support
The Dell CSI Operator image is available on Docker Hub and is officially supported by Dell.
For any CSI operator and driver issues, questions or feedback, please follow our [support process](../../../support/).
