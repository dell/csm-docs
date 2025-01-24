---
title: "Release notes"
linkTitle: "Release notes"
weight: 5
Description: >
  Release notes for Dell Container Storage Modules Operator
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}
## Release Notes - Container Storage Modules Operator v1.6.1














### New Features/Changes

- [#1449 - [FEATURE]: Simplify the CSM Operator deployment](https://github.com/dell/csm/issues/1449)
- [#1473 - [FEATURE]: Add Support for OpenShift Container Platform (OCP) 4.17](https://github.com/dell/csm/issues/1473)
- [#1508 - [FEATURE]:  Add Support for KubeVirt](https://github.com/dell/csm/issues/1508)
- [#1484 - [FEATURE]: Remove ACC Support](https://github.com/dell/csm/issues/1484)

### Fixed Issues

- [#1427 - [BUG]: CSM Operator e2e tests: Error in test 3](https://github.com/dell/csm/issues/1427)
- [#1448 - [BUG]: CSM-operator build fails from disk space issue](https://github.com/dell/csm/issues/1448)
- [#1475 - [BUG]: CSM Operator - Changes to csiDriverSpec does not reflect in CSM state or csidrivers.storage.k8s.io object](https://github.com/dell/csm/issues/1475)
- [#1507 - [BUG]: CSM Operator E2E tests are not passing](https://github.com/dell/csm/issues/1507)
- [#1510 - [BUG]: Missing Node tolerations for resiliency module](https://github.com/dell/csm/issues/1510)
- [#1531 - [BUG]: CSM-Operator resets dell-replication-controller-config configmap](https://github.com/dell/csm/issues/1531)
- [#1533 - [BUG]: CSM Operator Will Continually Add Components to Observability](https://github.com/dell/csm/issues/1533)

### Known Issues
| Issue | Workaround |
|-------|------------|
| When CSM Operator creates a deployment that includes secrets (e.g., application-mobility, observability, cert-manager, velero), these secrets are not deleted on uninstall and will be left behind. For example, the `karavi-topology-tls`, `otel-collector-tls`, and `cert-manager-webhook-ca` secrets will not be deleted. | This should not cause any issues on the system, but all secrets present on the cluster can be found with `kubectl get secrets -A`, and any unwanted secrets can be deleted with `kubectl delete secret -n <secret-namespace> <secret-name>`|
| In certain environments, users have encountered difficulties in installing drivers using the CSM Operator due to the 'OOM Killed' issue. This issue is attributed to the default resource requests and limits configured in the CSM Operator, which fail to meet the resource requirements of the user environments. OOM error occurs when a process in the container tries to consume more memory than the limit specified in resource configuration.| Before deploying the CSM Operator, it is crucial to adjust the memory and CPU requests and limits in the files [config/manager.yaml](https://github.com/dell/csm-operator/blob/main/config/manager/manager.yaml#L100), [deploy/operator.yaml](https://github.com/dell/csm-operator/blob/main/deploy/operator.yaml#L1330) to align with the user's environment requirements. If the containers running on the pod exceed the specified CPU and memory limits, the pod may get evicted. Currently CSM Operator do not support updating this configuration dynamically. CSM Operator needs to be redeployed for these updates to take effect in case it is already installed. Steps to manually update the resource configuration and then redeploy CSM Operator are available [here](https://dell.github.io/csm-docs/docs/deployment/csmoperator/#installation)|