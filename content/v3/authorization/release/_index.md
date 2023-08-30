---
title: "Release notes"
linkTitle: "Release notes"
weight: 6
Description: >
  Dell Container Storage Modules (CSM) release notes for authorization
---

{{% pageinfo color="primary" %}}
The CSM Authorization karavictl CLI is no longer actively maintained or supported. It will be deprecated in CSM 1.9.
{{% /pageinfo %}}

## Release Notes - CSM Authorization 1.4.0

### New Features/Changes

- CSM 1.4 Release specific changes. ([#350](https://github.com/dell/csm/issues/350))
- CSM Authorization insecure related entities are renamed to skipCertificateValidation. ([#368](https://github.com/dell/csm/issues/368))

### Bugs 

- PowerScale volumes unable to be created with Helm deployment of CSM Authorization. ([#419](https://github.com/dell/csm/issues/419))
- Authorization CLI documentation does not mention --array-insecure flag when creating or updating storage systems. ([#416](https://github.com/dell/csm/issues/416))
- Authorization: Add documentation for backing up and restoring redis data. ([#410](https://github.com/dell/csm/issues/410))
- CSM Authorization doesn't recognize storage with capital letters. ([#398](https://github.com/dell/csm/issues/398))
- Update Authorization documentation with supported versions of k3s-selinux and container-selinux packages. ([#393](https://github.com/dell/csm/issues/393))
- Using Authorization without dependency on jq. ([#390](https://github.com/dell/csm/issues/390))
- Authorization Documentation Improvement. ([#384](https://github.com/dell/csm/issues/384))
- Unit test failing for csm-authorization. ([#382](https://github.com/dell/csm/issues/382))
- Karavictl has incorrect permissions after download. ([#360](https://github.com/dell/csm/issues/360)) 
- Helm deployment of Authorization denies a valid request path from csi-powerflex. ([#353](https://github.com/dell/csm/issues/353))