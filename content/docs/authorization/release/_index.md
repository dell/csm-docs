---
title: "Release notes"
linkTitle: "Release notes"
weight: 6
Description: >
  Dell Container Storage Modules (CSM) release notes for authorization
---

## Release Notes - CSM Authorization 1.7.0

### New Features/Changes

- CSM Authorization karavictl requires an admin token. ([#725](https://github.com/dell/csm/issues/725))
- CSM support for Kubernetes 1.27. ([#761](https://github.com/dell/csm/issues/761))
- CSM 1.7 release specific changes. ([#743](https://github.com/dell/csm/issues/743))
- CSM Authorization encryption for secrets in K3S. ([#774](https://github.com/dell/csm/issues/774))

### Fixed Issues

- Authorization should have sample CRD for every supported version in csm-operator. ([#826](https://github.com/dell/csm/issues/826))
- Improve CSM Operator Authorization documentation. ([#800](https://github.com/dell/csm/issues/800))
- CSM Authorization doesn't write the status code on error for csi-powerscale. ([#787](https://github.com/dell/csm/issues/787))
- Authorization RPM installation should use nogpgcheck for k3s-selinux package. ([#772](https://github.com/dell/csm/issues/772))
- CSM Authorization - karavictl generate token should output valid yaml. ([#767](https://github.com/dell/csm/issues/767))
