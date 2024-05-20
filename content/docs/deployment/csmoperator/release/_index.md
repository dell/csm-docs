---
title: "Release notes"
linkTitle: "Release notes"
weight: 5
Description: >
  Release notes for Dell Container Storage Modules Operator
---

## Release Notes - Container Storage Modules Operator v1.5.0












### New Features/Changes

There are no new features in this release.

### Fixed Issues

- [#1200 - [BUG]: CrashLoopBackOff and OOMKilled issue in pod : Dell CSM Operator Manager POD](https://github.com/dell/csm/issues/1200)
- [#1205 - [BUG]: Operator doesn't support non-authorization namespace](https://github.com/dell/csm/issues/1205)
- [#1238 - [BUG]: Missing mountPropagation param for Powermax node template in CSM-Operator](https://github.com/dell/csm/issues/1238)
- [#1291 - [BUG]: Fix linter errors in csm-operator](https://github.com/dell/csm/issues/1291)

### Known Issues
| Issue | Workaround |
|-------|------------|
| When CSM Operator creates a deployment that includes secrets (e.g., application-mobility, observability, cert-manager, velero), these secrets are not deleted on uninstall and will be left behind. For example, the `karavi-topology-tls`, `otel-collector-tls`, and `cert-manager-webhook-ca` secrets will not be deleted. | This should not cause any issues on the system, but all secrets present on the cluster can be found with `kubectl get secrets -A`, and any unwanted secrets can be deleted with `kubectl delete secret -n <secret-namespace> <secret-name>`|
