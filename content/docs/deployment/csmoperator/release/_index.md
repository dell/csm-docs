---
title: "Release notes"
linkTitle: "Release notes"
weight: 5
Description: >
  Release notes for Dell Container Storage Modules Operator
---

## Release Notes - Container Storage Modules Operator v1.5.0











### New Features/Changes

- [#926 - [FEATURE]: Fixing the linting, formatting and vetting issues](https://github.com/dell/csm/issues/926)
- [#1091 - [FEATURE]: CSM 1.10 release specific changes](https://github.com/dell/csm/issues/1091)

### Fixed Issues

- [#1094 - [BUG]: CSM Operator offline install powerflex csi driver sidecar trying to pull from registry.k8s.io](https://github.com/dell/csm/issues/1094)
- [#1174 - [BUG]: Kubelet Configuration Directory setting should not have a comment about default value being None](https://github.com/dell/csm/issues/1174)

### Known Issues
| Issue | Workaround |
|-------|------------|
| When CSM Operator creates a deployment that includes secrets (e.g., application-mobility, observability, cert-manager, velero), these secrets are not deleted on uninstall and will be left behind. For example, the `karavi-topology-tls`, `otel-collector-tls`, and `cert-manager-webhook-ca` secrets will not be deleted. | This should not cause any issues on the system, but all secrets present on the cluster can be found with `kubectl get secrets -A`, and any unwanted secrets can be deleted with `kubectl delete secret -n <secret-namespace> <secret-name>`|
