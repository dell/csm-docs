---
title: PowerMax
description: Release notes for PowerMax CSI driver
---

## Release Notes - CSI PowerMax v2.8.0

{{% pageinfo color="primary" %}} Linked Proxy mode for CSI reverse proxy is no longer actively maintained or supported. It will be deprecated in CSM 1.9. It is highly recommended that you use stand alone mode going forward. {{% /pageinfo %}}

> Note: Starting from CSI v2.4.0, Only Unisphere 10.0 REST endpoints are supported. It is mandatory that Unisphere should be updated to 10.0. Please find the instructions [here.](https://dl.dell.com/content/manual34878027-dell-unisphere-for-powermax-10-0-0-installation-guide.pdf?language=en-us&ps=true)

>Note: File Replication for PowerMax is currently not supported 



### New Features/Changes

- [#724 - [FEATURE]: CSM support for Openshift 4.13](https://github.com/dell/csm/issues/724)
- [#861 - [FEATURE]: CSM for PowerMax file support ](https://github.com/dell/csm/issues/861)
- [#876 - [FEATURE]: CSI 1.5 spec support -StorageCapacityTracking](https://github.com/dell/csm/issues/876)
- [#877 - [FEATURE]: Make standalone helm chart available from helm repository : https://dell.github.io/dell/helm-charts](https://github.com/dell/csm/issues/877)
- [#878 - [FEATURE]: CSI 1.5 spec support: Implement Volume Limits](https://github.com/dell/csm/issues/878)
- [#922 - [FEATURE]: Use ubi9 micro as base image](https://github.com/dell/csm/issues/922)
- [#937 - [FEATURE]: Google Anthos 1.15 support  for PowerMax](https://github.com/dell/csm/issues/937)

### Fixed Issues

- [#916 - [BUG]: Remove references to deprecated io/ioutil package](https://github.com/dell/csm/issues/916)

### Known Issues

| Issue | Workaround |
|-------|------------|
| Unable to update Host: A problem occurred modifying the host resource | This issue occurs when the nodes do not have unique hostnames or when an IP address/FQDN with same sub-domains are used as hostnames. The workaround is to use unique hostnames or FQDN with unique sub-domains|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with kubenetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
