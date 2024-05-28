---
title: "Release notes"
linkTitle: "Release notes"
weight: 6
Description: >
  Dell Container Storage Modules (CSM) release notes for authorization
---

## Release Notes - CSM Authorization 1.11.0








### New Features/Changes

- [#926 - [FEATURE]: Fixing the linting, formatting and vetting issues](https://github.com/dell/csm/issues/926)

### Fixed Issues


### Known Issues
| Issue | Workaround |
|-------|------------|
| CSM Operator does not support dynamic namespaces for Authorization. Despite successful installation in a namespace other than "authorization", errors may arise during volume creation. | Use the default namespace "authorization" for installing Authorization using CSM Operator|
