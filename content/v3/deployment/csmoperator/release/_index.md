---
title: "Release notes"
linkTitle: "Release notes"
weight: 5
Description: >
  Release notes for Dell Container Storage Modules Operator
---
{{% pageinfo color="primary" %}}
CSM 1.7.1 is applicable to helm based installations of PowerFlex driver.
{{% /pageinfo %}}

## Release Notes - Container Storage Modules Operator v1.2.0

### New Features/Changes
- [Added support for CSI Unity XT Driver](https://github.com/dell/csm/issues/756)
- [Added support for PowerMax Driver](https://github.com/dell/csm/issues/769)
- [Added Replication Support for PowerFlex driver](https://github.com/dell/csm/issues/821)
- [CSM Operator: Support install of Resiliency module](https://github.com/dell/csm/issues/739)
- [Migrated image registry from k8s.gcr.io to registry.k8s.io](https://github.com/dell/csm/issues/744)
- [Added support for OpenShift 4.12](https://github.com/dell/csm/issues/571)
- [Added support for Kubernetes 1.27](https://github.com/dell/csm/issues/761)


### Fixed Issues
- [CSM object goes into failed state when deployments are getting scaled down/up](https://github.com/dell/csm/issues/816)
- [Install issues of the Replication module have been fixed](https://github.com/dell/csm/issues/788)


### Known Issues
There are no known issues in this release.