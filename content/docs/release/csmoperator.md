---
title: "Release notes"
linkTitle: "Release notes" 
toc_hide: true
weight: 5
Description: >
  Release notes for Container Storage Modules Operator
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}
## Container Storage Modules Operator v1.9.0

### New Features/Changes

- [#1749 - [FEATURE]: CSM Operator - CSM Operator must manage the CRD only on the K8S cluster where the Operator is deployed](https://github.com/dell/csm/issues/1749)
- [#1751 - [FEATURE]: CSM RBAC rules](https://github.com/dell/csm/issues/1751)
- [#1752 - [FEATURE]: CSM PowerFlex - Expose the SFTP settings to automatically pull the scini.ko kernel module](https://github.com/dell/csm/issues/1752)

### Fixed Issues

- [#1689 - [BUG]: Auto select protocol makes the node driver to crash](https://github.com/dell/csm/issues/1689)
- [#1762 - [BUG]: CSM Operator samples are incomplete](https://github.com/dell/csm/issues/1762)
- [#1861 - [BUG]: Update the OTEL image version in operator and helm sample files](https://github.com/dell/csm/issues/1861)
- [#1775 - [BUG]: CSI+Rep using Operator for PMAX failing during deployment.](https://github.com/dell/csm/issues/1775)

### Known Issues
| Issue | Workaround |
|-------|------------|
| When CSM Operator creates a deployment that includes secrets (e.g., application-mobility, observability, cert-manager, velero), these secrets are not deleted on uninstall and will be left behind. For example, the `karavi-topology-tls`, `otel-collector-tls`, and `cert-manager-webhook-ca` secrets will not be deleted. | This should not cause any issues on the system, but all secrets present on the cluster can be found with `kubectl get secrets -A`, and any unwanted secrets can be deleted with `kubectl delete secret -n <secret-namespace> <secret-name>`|
| In certain environments, users have encountered difficulties in installing drivers using the CSM Operator due to the 'OOM Killed' issue. This issue is attributed to the default resource requests and limits configured in the CSM Operator, which fail to meet the resource requirements of the user environments. OOM error occurs when a process in the container tries to consume more memory than the limit specified in resource configuration.| Before deploying the CSM Operator, it is crucial to adjust the memory and CPU requests and limits in the files [config/manager.yaml](https://github.com/dell/csm-operator/blob/main/config/manager/manager.yaml#L100), [deploy/operator.yaml](https://github.com/dell/csm-operator/blob/main/deploy/operator.yaml#L1330) to align with the user's environment requirements. If the containers running on the pod exceed the specified CPU and memory limits, the pod may get evicted. Currently CSM Operator do not support updating this configuration dynamically. CSM Operator needs to be redeployed for these updates to take effect in case it is already installed. Steps to manually update the resource configuration and then redeploy CSM Operator are available [here](https://dell.github.io/csm-docs/docs/deployment/csmoperator/#installation)|
