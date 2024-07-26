
### New Features/Changes

- [#1359 - [FEATURE]: Add Support for OpenShift Container Platform (OCP) 4.16 ](https://github.com/dell/csm/issues/1359)

### Fixed Issues

There are no issues fixed in this release.
---
title: "Release Notes"
linkTitle: "Release Notes"
weight: 5
Description: >
  Release Notes
---

### Known Issues

The encryption module installation fails because sidecars like csi-metadata-retriever-* conflict when trying to access the same domain socket. (/var/run/csi/csi_retriever.sock). Please find the [github issue](https://github.com/dell/csm/issues/1309).