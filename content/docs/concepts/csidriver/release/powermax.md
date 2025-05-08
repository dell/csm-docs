---
title: PowerMax
toc_hide: true
description: Release notes for PowerMax CSI driver
---

## CSI PowerMax v2.14.0

> ℹ️ **NOTE:** Auto SRDF group creation is currently not supported in PowerMaxOS 10.1 (6079) Arrays.

{{< alert color="warning" >}}
Starting from CSI v2.4.0, only Unisphere 10.0 REST endpoints are supported. It is mandatory to update Unisphere to 10.0. Please find the instructions [here](https://dl.dell.com/content/manual34878027-dell-unisphere-for-powermax-10-0-0-installation-guide.pdf?language=en-us&ps=true).
{{< /alert >}}

> ℹ️ **NOTE:**  File Replication for PowerMax is currently not supported

### New Features/Changes

- [#1614 - [FEATURE]: CSI-PowerMax - Mount credentials secret to the reverse-proxy (Customer Ask)](https://github.com/dell/csm/issues/1614)
- [#1748 - [FEATURE]: CSM PowerMax - Multi-Availability Zone (AZ) support with multiple storage systems - dedicated storage systems in each AZ](https://github.com/dell/csm/issues/1748)
- [#1750 - [FEATURE]: Kubernetes 1.33 Qualification](https://github.com/dell/csm/issues/1750)
- [#1754 - [FEATURE]: Add support for Powermax 10.2](https://github.com/dell/csm/issues/1754)

### Fixed Issues

- [#1689 - [BUG]: Auto select protocol makes the node driver to crash](https://github.com/dell/csm/issues/1689)
- [#1698 - [BUG]: 1.13 documentation | PowerMax | CSI PowerMax Reverse Proxy](https://github.com/dell/csm/issues/1698)
- [#1711 - [BUG]: Unable to provision PowerMax Metro volumes with replication module not enabled](https://github.com/dell/csm/issues/1711)
- [#1725 - [BUG]: Scale test fails with powermax nvmetcp protocol when X_CSI_TRANSPORT_PROTOCOL= ""](https://github.com/dell/csm/issues/1725)
- [#1760 - [BUG]: [csi-powermax]: Yaml error in configmap generation](https://github.com/dell/csm/issues/1760)
- [#1769 - [BUG]: PowerMax node pods are crashing even though the second array is reachable](https://github.com/dell/csm/issues/1769)
- [#1826 - [BUG]: PowerMax CSI Driver attempts to create Port Group with Mixed FC and NVMe/FC Ports](https://github.com/dell/csm/issues/1826)
- [#1858 - [BUG]: Resiliency Tests Fail on GOARCH=386 Due to Type Mismatch in gofsutil (statfs.Bsize)](https://github.com/dell/csm/issues/1858)
- [#1870 - [BUG]: PowerMax Resiliency E2E Tests Failing Due to Incorrect Image Patch in Driver Node Pod](https://github.com/dell/csm/issues/1870)
- [#1775 - [BUG]: CSI+Rep using Operator for PMAX failing during deployment.](https://github.com/dell/csm/issues/1775)

### Known Issues

| Issue | Workaround |
|-------|------------|
| Unable to update Host: A problem occurred modifying the host resource | This issue occurs when the nodes do not have unique hostnames or when an IP address/FQDN with same sub-domains are used as hostnames. The workaround is to use unique hostnames or FQDN with unique sub-domains|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with kubernetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
| Automatic SRDF group creation is failing with "Unable to get Remote Port on SAN for Auto SRDF" for PowerMaxOS 10.1 arrays | Create the SRDF Group and add it to the storage class |
| [Node stage is failing with error "wwn for FC device not found"](https://github.com/dell/csm/issues/1070)| This is an intermittent issue, rebooting the node will resolve this issue |
| When the driver is installed using CSM Operator , few times, pods created using block volume are getting stuck in containercreating/terminating state or devices are not available inside the pod. | Update the daemonset with parameter `mountPropagation: "Bidirectional"` for volumedevices-path under volumeMounts section.|
| When running CSI-PowerMax with Replication in a multi-cluster configuration, the driver on the target cluster fails and the following error is seen in logs: `error="CSI reverseproxy service host or port not found, CSI reverseproxy not installed properly"` | The reverseproxy service needs to be created manually on the target cluster. Follow [the instructions here](docs/getting-started/installation/kubernetes/powermax/csmoperator/csm-modules/replication/#configuration-steps) to create it.|
### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
