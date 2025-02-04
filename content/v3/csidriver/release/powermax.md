---
title: PowerMax
description: Release notes for PowerMax CSI driver
---

## Release Notes - CSI PowerMax v2.11.0

>Note: Auto SRDF group creation is currently not supported in PowerMaxOS 10.1 (6079) Arrays.

> Note: Starting from CSI v2.4.0, Only Unisphere 10.0 REST endpoints are supported. It is mandatory that Unisphere should be updated to 10.0. Please find the instructions [here.](https://dl.dell.com/content/manual34878027-dell-unisphere-for-powermax-10-0-0-installation-guide.pdf?language=en-us&ps=true)

>Note: File Replication for PowerMax is currently not supported 






### New Features/Changes

- [#1308 - [FEATURE]: NVMe TCP support for PowerMax ](https://github.com/dell/csm/issues/1308)
- [#1359 - [FEATURE]: Add Support for OpenShift Container Platform (OCP) 4.16 ](https://github.com/dell/csm/issues/1359)
- [#1400 - [FEATURE]: Support for Kubernetes 1.30](https://github.com/dell/csm/issues/1400)
- [#1082 - [FEATURE]: CSM Resiliency support for PowerMax](https://github.com/dell/csm/issues/1082)
- [#1397 - [FEATURE]: Observability upgrade is supported in CSM Operator](https://github.com/dell/csm/issues/1397)

### Fixed Issues

- [#1209 - [BUG]: Doc hyper links in driver Readme is broken](https://github.com/dell/csm/issues/1209)
- [#1218 - [BUG]: Add the helm-charts-version parameter to the install command for all drivers in csm-docs](https://github.com/dell/csm/issues/1218)
- [#1238 - [BUG]: Missing mountPropagation param for Powermax node template in CSM-Operator](https://github.com/dell/csm/issues/1238)
- [#1239 - [BUG]: Changes in new release of google.golang.org/protobuf is causing compilation issues](https://github.com/dell/csm/issues/1239)
- [#1305 - [BUG]: Create volume even if the size is smaller than possible](https://github.com/dell/csm/issues/1305)
- [#1346 - [BUG]: Parsing an NVME response fails for list-subsys](https://github.com/dell/csm/issues/1346)
- [#1370 - [BUG]: API command to check filesystem is taking 20s + causing ControllerUnPublish to take 20+secs ](https://github.com/dell/csm/issues/1370)
- [#1372 - [BUG]: Make files in repositories build invalid images](https://github.com/dell/csm/issues/1372)

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
