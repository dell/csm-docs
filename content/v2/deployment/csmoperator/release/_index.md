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
## Release Notes - Container Storage Modules Operator v1.8.1
















### New Features/Changes

- [#1560 - [FEATURE]: CSM support for OpenShift 4.18](https://github.com/dell/csm/issues/1560)
- [#1561 - [FEATURE]: Added support for Kubernetes 1.32 ](https://github.com/dell/csm/issues/1561)
- [#1610 - [FEATURE]: Added support for PowerStore 4.1 ](https://github.com/dell/csm/issues/1610)
- [#1611 - [FEATURE]: Added support for PowerScale 9.10](https://github.com/dell/csm/issues/1611)

### Fixed Issues

- [#1566 - [BUG]: Inconsistent naming convention of secret is misleading in Installation of PowerMax ](https://github.com/dell/csm/issues/1566)
- [#1567 - [BUG]: Mode is mentioned incorrectly in the configMap of PowerMax even when it is deployed as a sidecar ](https://github.com/dell/csm/issues/1567)
- [#1570 - [BUG]: Stale entries in CSM operator samples and helm-charts for PowerMax ](https://github.com/dell/csm/issues/1570)
- [#1574 - [BUG]: Operator offline bundle doesn't prepare registries correctly](https://github.com/dell/csm/issues/1574)
- [#1581 - [BUG]: Offline bundle doesn't include Authorization Server images](https://github.com/dell/csm/issues/1581)
- [#1585 - [BUG]: Stale entries in CSI PowerMax Samples of CSM operator ](https://github.com/dell/csm/issues/1585)
- [#1591 - [BUG]: Operator e2e scenario for powerflex driver with second set of alternate values is failing in OpenShift cluster](https://github.com/dell/csm/issues/1591)
- [#1594 - [BUG]: Remove extra fields from the driver specs when using minimal sample](https://github.com/dell/csm/issues/1594)
- [#1600 - [BUG]: Operator e2e scenario for powerscale driver with second set of alternate values is failing in OpenShift cluster](https://github.com/dell/csm/issues/1600)
- [#1601 - [BUG]: "make install" command is failing for csm-operator](https://github.com/dell/csm/issues/1601)
- [#1603 - [BUG]: CSM Operator Crashing](https://github.com/dell/csm/issues/1603)
- [#1604 - [BUG]: CSM Operator not deleting the deployment and daemon sets after deleting the CSM](https://github.com/dell/csm/issues/1604)
- [#1605 - [BUG]: Not able to create CSM using the minimal file, if the Operator deployed from the Operator Hub](https://github.com/dell/csm/issues/1605)
- [#1638 - [BUG]: CSM Docs Multiple fixes for CSI-Powermax installation](https://github.com/dell/csm/issues/1638)
- [#1642 - [BUG]: E2E and cert-csi tets are failing](https://github.com/dell/csm/issues/1642)
- [#1648 - [BUG]: CSM-Operator: E2E Tests are running with 1 replica count](https://github.com/dell/csm/issues/1648)
- [#1667 - [BUG]: Labels versions and maintainer update for CSM images ](https://github.com/dell/csm/issues/1667)
- [#1668 - [BUG]: CSM-Operator is reconciling non CSM pods](https://github.com/dell/csm/issues/1668)
- [#1633 - [BUG]: CSM deployment minimal file - pulling from quay after updating the image registry](https://github.com/dell/csm/issues/1633)
- [#1671 - [BUG]: Minimal CR for Powerflex is failing in Csm-operator](https://github.com/dell/csm/issues/1671)
- [#1782 - [BUG]: Pods Stuck in Terminating State After PowerFlex CSI Node Pod Restart When Deployments Share Same Node](https://github.com/dell/csm/issues/1782)

### Known Issues
| Issue | Workaround |
|-------|------------|
| When CSM Operator creates a deployment that includes secrets (e.g., application-mobility, observability, cert-manager, velero), these secrets are not deleted on uninstall and will be left behind. For example, the `karavi-topology-tls`, `otel-collector-tls`, and `cert-manager-webhook-ca` secrets will not be deleted. | This should not cause any issues on the system, but all secrets present on the cluster can be found with `kubectl get secrets -A`, and any unwanted secrets can be deleted with `kubectl delete secret -n <secret-namespace> <secret-name>`|
| In certain environments, users have encountered difficulties in installing drivers using the CSM Operator due to the 'OOM Killed' issue. This issue is attributed to the default resource requests and limits configured in the CSM Operator, which fail to meet the resource requirements of the user environments. OOM error occurs when a process in the container tries to consume more memory than the limit specified in resource configuration.| Before deploying the CSM Operator, it is crucial to adjust the memory and CPU requests and limits in the files [config/manager.yaml](https://github.com/dell/csm-operator/blob/main/config/manager/manager.yaml#L100), [deploy/operator.yaml](https://github.com/dell/csm-operator/blob/main/deploy/operator.yaml#L1330) to align with the user's environment requirements. If the containers running on the pod exceed the specified CPU and memory limits, the pod may get evicted. Currently CSM Operator do not support updating this configuration dynamically. CSM Operator needs to be redeployed for these updates to take effect in case it is already installed. Steps to manually update the resource configuration and then redeploy CSM Operator are available [here](https://dell.github.io/csm-docs/docs/deployment/csmoperator/#installation)|
