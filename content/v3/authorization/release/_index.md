---
title: "Release notes"
linkTitle: "Release notes"
weight: 6
Description: >
  Dell Container Storage Modules (CSM) release notes for authorization
---

## Release Notes - CSM Authorization 1.9.1








### New Features/Changes

- [#947 - [FEATURE]: Support for Kubernetes 1.28](https://github.com/dell/csm/issues/947)
- [#1066 - [FEATURE]: Support for Openshift 4.14](https://github.com/dell/csm/issues/1066)
- [#996 - [FEATURE]: Dell CSI to Dell CSM Operator Migration Process](https://github.com/dell/csm/issues/996)
- [#1031 - [FEATURE]: Update to the latest UBI Micro image for CSM](https://github.com/dell/csm/issues/1031)
- [#1062 - [FEATURE]: CSM PowerMax: Support PowerMax v10.1 ](https://github.com/dell/csm/issues/1062)

### Fixed Issues


### Known Issues
| Issue | Workaround |
|-------|------------|
| CSM Operator does not support dynamic namespaces for Authorization. Despite successful installation in a namespace other than "authorization", errors may arise during volume creation. | Use the default namespace "authorization" for installing Authorization using CSM Operator|
