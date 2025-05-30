---
title: PowerMax
description: Release notes for PowerMax CSI driver
---

## Release Notes - CSI PowerMax v2.13.0

>Note: Auto SRDF group creation is currently not supported in PowerMaxOS 10.1 (6079) Arrays.

> Note: Starting from CSI v2.4.0, Only Unisphere 10.0 REST endpoints are supported. It is mandatory that Unisphere should be updated to 10.0. Please find the instructions [here.](https://dl.dell.com/content/manual34878027-dell-unisphere-for-powermax-10-0-0-installation-guide.pdf?language=en-us&ps=true)

>Note: File Replication for PowerMax is currently not supported










### New Features/Changes

- [#1560 - [FEATURE]: CSM support for OpenShift 4.18](https://github.com/dell/csm/issues/1560)
- [#1561 - [FEATURE]: Added support for Kubernetes 1.32 ](https://github.com/dell/csm/issues/1561)

### Fixed Issues

- [#1549 - [BUG]: The NVMeCommand constant needs to use full path](https://github.com/dell/csm/issues/1549)
- [#1566 - [BUG]: Inconsistent naming convention of secret is misleading in Installation of PowerMax ](https://github.com/dell/csm/issues/1566)
- [#1568 - [BUG]: Examples provided in the secrets of install driver for the Primary Unisphere and Back up Unisphere is lacking clarity in ConfigMap](https://github.com/dell/csm/issues/1568)
- [#1569 - [BUG]: Unused variable "X_CSI_POWERMAX_ENDPOINT" resulting in driver not to start in PowerMax](https://github.com/dell/csm/issues/1569)
- [#1570 - [BUG]: Stale entries in CSM operator samples and helm-charts for PowerMax ](https://github.com/dell/csm/issues/1570)
- [#1571 - [BUG]: SubjectAltName needs to be updated in the tls.crt ](https://github.com/dell/csm/issues/1571)
- [#1584 - [BUG]: Driver should not be expecting a secret which is not used at all for PowerMax when authorization is enabled ](https://github.com/dell/csm/issues/1584)
- [#1589 - [BUG]: Automation for reverseproxy tls secret and  powermax-array-config does not present in E2E](https://github.com/dell/csm/issues/1589)
- [#1593 - [BUG]: Update the cert-manager version in Powermax Prerequisite](https://github.com/dell/csm/issues/1593)
- [#1638 - [BUG]: CSM Docs Multiple fixes for CSI-Powermax installation](https://github.com/dell/csm/issues/1638)
- [#1644 - [BUG]: Cannot create PowerMax clones](https://github.com/dell/csm/issues/1644)
- [#1650 - [BUG]: PowerMax - X_CSI_IG_MODIFY_HOSTNAME fails to rename a host with same name in different case](https://github.com/dell/csm/issues/1650)
- [#1663 - [BUG]: Pod filesystem not resized while volume gets successfully expanded](https://github.com/dell/csm/issues/1663)
- [#1667 - [BUG]: Labels versions and maintainer update for CSM images ](https://github.com/dell/csm/issues/1667)
- [#1634 - [BUG]: CSM PowerMax wrong error message](https://github.com/dell/csm/issues/1634)

### Known Issues

| Issue | Workaround |
|-------|------------|
| Unable to update Host: A problem occurred modifying the host resource | This issue occurs when the nodes do not have unique hostnames or when an IP address/FQDN with same sub-domains are used as hostnames. The workaround is to use unique hostnames or FQDN with unique sub-domains|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with kubernetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
| Automatic SRDF group creation is failing with "Unable to get Remote Port on SAN for Auto SRDF" for PowerMaxOS 10.1 arrays | Create the SRDF Group and add it to the storage class |
| [Node stage is failing with error "wwn for FC device not found"](https://github.com/dell/csm/issues/1070)| This is an intermittent issue, rebooting the node will resolve this issue |
| When the driver is installed using CSM Operator , few times, pods created using block volume are getting stuck in containercreating/terminating state or devices are not available inside the pod. | Update the daemonset with parameter `mountPropagation: "Bidirectional"` for volumedevices-path under volumeMounts section.|
| When running CSI-PowerMax with Replication in a multi-cluster configuration, the driver on the target cluster fails and the following error is seen in logs: `error="CSI reverseproxy service host or port not found, CSI reverseproxy not installed properly"` | The reverseproxy service needs to be created manually on the target cluster. Follow [the instructions here](v2/deployment/csmoperator/modules/replication#configuration-steps) to create it.|
| When using Helm charts to install the driver with multiple PowerMax arrays, the `powermax-array-config` ConfigMap is incorrectly created, resulting in multiple `X_CSI_POWERMAX_ENDPOINT` entries. This causes the driver pods to crash with the error `"mapping key "X_CSI_POWERMAX_ENDPOINT" already defined"`. | This issue has been reported at https://github.com/dell/csm/issues/1760. Workaround: <br /> 1. Edit the ConfigMap `powermax-array-config` and remove all instances of `X_CSI_POWERMAX_ENDPOINT`. <br /> `kubectl edit configmaps powermax-array-config -n <csi-powermax-namespace>` <br /> 2. Restart the driver pods.  <br /> `kubectl rollout restart deployment,daemonset -n <csi-powermax-namespace>` <br /> Note: Users may also need to delete any old ReplicaSets in order to bring the new controllers up. |
### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
