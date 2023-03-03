---
title: "Release notes"
linkTitle: "Release notes"
weight: 5
Description: >
  Release notes for Dell Container Storage Modules Operator
---

## Release Notes - Container Storage Modules Operator v1.1.0

### New Features/Changes
- [Added support for CSI PowerStore Driver](https://github.com/dell/csm/issues/613)
- [Added support for Kubernetes 1.26](https://github.com/dell/csm/issues/597)


### Fixed Issues
[Fix for CSM Authorization CRD in the CSM Operator not able to custom configurations](https://github.com/dell/csm/issues/633)

### Known Issues
CSM object does not track available deployment count when down scaling to n-1 , where n is number of nodes.