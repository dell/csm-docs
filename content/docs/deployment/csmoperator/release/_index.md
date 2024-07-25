---
title: "Release notes"
linkTitle: "Release notes"
weight: 5
Description: >
  Release notes for Dell Container Storage Modules Operator
---

## Release Notes - Container Storage Modules Operator v1.6.0












### New Features/Changes

- [#1277 - [FEATURE]: Add Authorization upgrade is supported in CSM Operator](https://github.com/dell/csm/issues/1277)
- [#1396 - [FEATURE]: DCM and DN client upgrade is supported in CSM operator ](https://github.com/dell/csm/issues/1396)

### Fixed Issues

- [#1200 - [BUG]: CrashLoopBackOff and OOMKilled issue in pod : Dell CSM Operator Manager POD](https://github.com/dell/csm/issues/1200)
- [#1205 - [BUG]: Operator doesn't support non-authorization namespace](https://github.com/dell/csm/issues/1205)
- [#1220 - [BUG]: Issue while Configuring Authorization module with Powermax CSI Driver using Operator](https://github.com/dell/csm/issues/1220)
- [#1238 - [BUG]: Missing mountPropagation param for Powermax node template in CSM-Operator](https://github.com/dell/csm/issues/1238)
- [#1291 - [BUG]: Fix linter errors in csm-operator](https://github.com/dell/csm/issues/1291)

### Known Issues
| Issue | Workaround |
|-------|------------|
| When CSM Operator creates a deployment that includes secrets (e.g., application-mobility, observability, cert-manager, velero), these secrets are not deleted on uninstall and will be left behind. For example, the `karavi-topology-tls`, `otel-collector-tls`, and `cert-manager-webhook-ca` secrets will not be deleted. | This should not cause any issues on the system, but all secrets present on the cluster can be found with `kubectl get secrets -A`, and any unwanted secrets can be deleted with `kubectl delete secret -n <secret-namespace> <secret-name>`|
| In certain environments, users have encountered difficulties in installing drivers using the CSM Operator due to the 'OOM Killed' issue. This issue is attributed to the default resource requests and limits configured in the CSM Operator, which fail to meet the resource requirements of the user environments. OOM error occurs when a process in the container tries to consume more memory than the limit specified in resource configuration.| Before deploying the CSM Operator, it is crucial to adjust the memory and CPU requests and limits in the files [config/manager.yaml](https://github.com/dell/csm-operator/blob/main/config/manager/manager.yaml#L100), [deploy/operator.yaml](https://github.com/dell/csm-operator/blob/main/deploy/operator.yaml#L1330) to align with the user's environment requirements. If the containers running on the pod exceed the specified CPU and memory limits, the pod may get evicted. Currently CSM Operator do not support updating this configuration dynamically. CSM Operator needs to be redeployed for these updates to take effect in case it is already installed. Steps to manually update the resource configuration and then redeploy CSM Operator are available [here](https://dell.github.io/csm-docs/docs/deployment/csmoperator/#installation)|