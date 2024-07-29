---
title: "Release notes"
linkTitle: "Release notes"
weight: 6
Description: >
  Dell Container Storage Modules (CSM) release notes for authorization
---

## Release Notes - CSM Authorization 1.8.0



### New Features/Changes

- [#922 - [FEATURE]: Use ubi9 micro as base image](https://github.com/dell/csm/issues/922)

### Fixed Issues

- [#895 - [BUG]: Update CSM Authorization karavictl CLI flag descriptions](https://github.com/dell/csm/issues/895)
- [#916 - [BUG]: Remove references to deprecated io/ioutil package](https://github.com/dell/csm/issues/916)

### Known Issues
| Issue | Workaround |
|-------|------------|
| CSM Operator does not support dynamic namespaces for Authorization. Despite successful installation in a namespace other than "authorization", errors may arise during volume creation. | Use the default namespace "authorization" for installing Authorization using CSM Operator|
