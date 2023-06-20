---
title: Release Notes
description: Release notes for CSM Installation Wizard
---

## Release Notes - CSM Installation Wizard 1.0.0

### New Features/Changes

- [Added support for the CSI-PowerStore, CSI-PowerMax, CSI-PowerScale, CSI-PowerFlex, CSI-Unity and the supported modules for helm installation ](https://github.com/dell/csm/issues/698)

### Fixed Issues

### Known Issues

| Issue | Workaround |
|-------|------------|
| On selecting Resiliency module during the installation the generated values.yaml has the tolerations required for Resiliency  commented.| The commented tolerations in the generated values.yaml file has to be manually uncommented if Resiliency is selected. The feature request and has been created at https://github.com/dell/csm/issues/866|

