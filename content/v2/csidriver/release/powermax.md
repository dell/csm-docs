---
title: PowerMax
description: Release notes for PowerMax CSI driver
---

## Release Notes - CSI PowerMax v2.12.0

>Note: Auto SRDF group creation is currently not supported in PowerMaxOS 10.1 (6079) Arrays.

> Note: Starting from CSI v2.4.0, Only Unisphere 10.0 REST endpoints are supported. It is mandatory that Unisphere should be updated to 10.0. Please find the instructions [here.](https://dl.dell.com/content/manual34878027-dell-unisphere-for-powermax-10-0-0-installation-guide.pdf?language=en-us&ps=true)

>Note: File Replication for PowerMax is currently not supported 








### New Features/Changes

- [#1410 - [FEATURE]: Adding support for PowerMax Magnolia](https://github.com/dell/csm/issues/1410)
- [#1472 - [FEATURE]: Support for Kubernetes 1.31](https://github.com/dell/csm/issues/1472)
- [#1473 - [FEATURE]: Add Support for OpenShift Container Platform (OCP) 4.17](https://github.com/dell/csm/issues/1473)
- [#1508 - [FEATURE]:  Add Support for KubeVirt](https://github.com/dell/csm/issues/1508)

### Fixed Issues

- [#1416 - [BUG]:  Dell CSM Installation Issues](https://github.com/dell/csm/issues/1416)
- [#1418 - [BUG]: csi-powermax crashed when attempting to unmount volume from node](https://github.com/dell/csm/issues/1418)
- [#1425 - [BUG]: Incorrect Volume Creation Due to Idempotency in CreateVolume](https://github.com/dell/csm/issues/1425)
- [#1447 - [BUG]: Gobrick does not clean wwids from /etc/multipath/wwids after removing multipath devices ](https://github.com/dell/csm/issues/1447)
- [#1448 - [BUG]: CSM-operator build fails from disk space issue](https://github.com/dell/csm/issues/1448)
- [#1453 - [BUG]: Improve Documentation - Multipath configuration for FC and FC-NVMe attached arrays ](https://github.com/dell/csm/issues/1453)
- [#1499 - [BUG]: Fix Gosec error in service.go](https://github.com/dell/csm/issues/1499)
- [#1519 - [BUG]: Powermax Integration test failing](https://github.com/dell/csm/issues/1519)
- [#1534 - [BUG]: CSI PowerStore unable to resize NVMe block PVC, even though volume on the array gets resized](https://github.com/dell/csm/issues/1534)

### Known Issues

| Issue | Workaround |
|-------|------------|
| Unable to update Host: A problem occurred modifying the host resource | This issue occurs when the nodes do not have unique hostnames or when an IP address/FQDN with same sub-domains are used as hostnames. The workaround is to use unique hostnames or FQDN with unique sub-domains|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with kubernetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
| Automatic SRDF group creation is failing with "Unable to get Remote Port on SAN for Auto SRDF" for PowerMaxOS 10.1 arrays | Create the SRDF Group and add it to the storage class |
| [Node stage is failing with error "wwn for FC device not found"](https://github.com/dell/csm/issues/1070)| This is an intermittent issue, rebooting the node will resolve this issue |
| When the driver is installed using CSM Operator , few times, pods created using block volume are getting stuck in containercreating/terminating state or devices are not available inside the pod. | Update the daemonset with parameter `mountPropagation: "Bidirectional"` for volumedevices-path under volumeMounts section.|
| When running CSI-PowerMax with Replication in a multi-cluster configuration, the driver on the target cluster fails and the following error is seen in logs: `error="CSI reverseproxy service host or port not found, CSI reverseproxy not installed properly"` | The reverseproxy service needs to be created manually on the target cluster. Follow [the instructions here](../../../deployment/csmoperator/modules/replication#configuration-steps) to create it.|
### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
