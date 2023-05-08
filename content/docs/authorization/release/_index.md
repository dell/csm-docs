---
title: "Release notes"
linkTitle: "Release notes"
weight: 6
Description: >
  Dell Container Storage Modules (CSM) release notes for authorization
---

## Release Notes - CSM Authorization 1.7.0

### New Features/Changes
- Secrets encryption enabled by default. ([#774](https://github.com/dell/csm/issues/774))


## Release Notes - CSM Authorization 1.6.0

### New Features/Changes
- Restrict the version of TLS to v1.2 for all requests to CSM authorization proxy server. ([#642](https://github.com/dell/csm/issues/642))
- PowerFlex preapproved GUIDs. ([#402](https://github.com/dell/csm/issues/402))
- CSM 1.6 release specific changes. ([#583](https://github.com/dell/csm/issues/583))

### Bugs
- CSM Authorization quota of zero should allow infinite use for PowerFlex and PowerMax. ([#654](https://github.com/dell/csm/issues/654))
- CSM Authorization CRD in the CSM Operator doesn't read custom configurations. ([#633](https://github.com/dell/csm/issues/633))
