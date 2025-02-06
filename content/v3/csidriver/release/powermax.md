---
title: PowerMax
description: Release notes for PowerMax CSI driver
---

## Release Notes - CSI PowerMax v2.10.1

>Note: Auto SRDF group creation is currently not supported in PowerMaxOS 10.1 (6079) Arrays.

> Note: Starting from CSI v2.4.0, Only Unisphere 10.0 REST endpoints are supported. It is mandatory that Unisphere should be updated to 10.0. Please find the instructions [here.](https://dl.dell.com/content/manual34878027-dell-unisphere-for-powermax-10-0-0-installation-guide.pdf?language=en-us&ps=true)

>Note: File Replication for PowerMax is currently not supported 





### New Features/Changes

- [#1284 - [FEATURE]: Support for Openshift 4.15](https://github.com/dell/csm/issues/1284)
- [#1285 - [FEATURE]: Remove checks in code for non-supported installs of CSM](https://github.com/dell/csm/issues/1285)
- [#926 - [FEATURE]: Fixing the linting, formatting and vetting issues](https://github.com/dell/csm/issues/926)

### Fixed Issues

- [#1081 - [BUG]: CSM driver repositories reference CSI Operator](https://github.com/dell/csm/issues/1081)
- [#1115 - [BUG]: CSI Powermax: Driver fails to restore snapshot to Metro Volumes](https://github.com/dell/csm/issues/1115)
- [#1140 - [BUG]: Cert-csi tests are not reporting the passed testcases in K8S E2E tests ](https://github.com/dell/csm/issues/1140)
- [#1174 - [BUG]: Kubelet Configuration Directory setting should not have a comment about default value being None](https://github.com/dell/csm/issues/1174)
- [#1175 - [BUG]: PowerMax : Metro: Failed to find Remote Symm WWN](https://github.com/dell/csm/issues/1175)

### Known Issues

| Issue | Workaround |
|-------|------------|
| Unable to update Host: A problem occurred modifying the host resource | This issue occurs when the nodes do not have unique hostnames or when an IP address/FQDN with same sub-domains are used as hostnames. The workaround is to use unique hostnames or FQDN with unique sub-domains|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with kubernetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
| Automatic SRDF group creation is failing with "Unable to get Remote Port on SAN for Auto SRDF" for PowerMaxOS 10.1 arrays | Create the SRDF Group and add it to the storage class |
| [Node stage is failing with error "wwn for FC device not found"](https://github.com/dell/csm/issues/1070)| This is an intermittent issue, rebooting the node will resolve this issue |
| When the driver is installed using CSM Operator , few times, pods created using block volume are getting stuck in containercreating/terminating state or devices are not available inside the pod. | Update the daemonset with parameter `mountPropagation: "Bidirectional"` for volumedevices-path under volumeMounts section.|
### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
