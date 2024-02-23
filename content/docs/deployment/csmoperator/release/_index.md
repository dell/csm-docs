---
title: "Release notes"
linkTitle: "Release notes"
weight: 5
Description: >
  Release notes for Dell Container Storage Modules Operator
---

## Release Notes - Container Storage Modules Operator v1.4.0










### New Features/Changes

- [#926 - [FEATURE]: Fixing the linting, formatting and vetting issues](https://github.com/dell/csm/issues/926)

### Fixed Issues

- [#1094 - [BUG]: CSM Operator offline install powerflex csi driver sidecar trying to pull from registry.k8s.io](https://github.com/dell/csm/issues/1094)
- [#1103 - [BUG]: CSM Operator doesn't apply `fSGroupPolicy` value to `CSIDriver` Object](https://github.com/dell/csm/issues/1103)

### Known Issues
- When CSM-Operator creates a deployment that includes secrets (e.g., application-mobility, observability, cert-manager, velero, these secrets are not necessarily deleted on uninstall and may be left behind. For example, the `karavi-topology-tls`, `otel-collector-tls`, and `cert-manager-webhook-ca` secrets will not be deleted. This should not cause any issues on the system, but any unwanted secrets can be deleted with `kubectl delete secret -n <secret-namespace> <secret-name>
