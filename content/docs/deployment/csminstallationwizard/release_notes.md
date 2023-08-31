---
title: Release Notes
description: Release notes for CSM Installation Wizard
---

## Release Notes - CSM Installation Wizard 1.0.1

### New Features/Changes

- [Added support for the CSI-PowerStore, CSI-PowerMax, CSI-PowerScale, CSI-PowerFlex, CSI-Unity and the supported modules for helm installation](https://github.com/dell/csm/issues/698)

### Fixed Issues

### Known Issues

| Issue | Workaround |
|-------|------------|
| Tolerations required by the Resiliency module are commented out in the generated values.yaml file when Resiliency module is selected| If Resiliency is selected, the commented tolerations in the generated values.yaml file must be manually uncommented. The issue has been created at https://github.com/dell/csm/issues/866|
