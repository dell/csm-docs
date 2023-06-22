---
title: PowerMax
description: Release notes for PowerMax CSI driver
---

## Release Notes - CSI PowerMax v2.6.0

> Note: Starting from CSI v2.4.0, Only Unisphere 10.0 REST endpoints are supported. It is mandatory that Unisphere should be updated to 10.0. Please find the instructions [here.](https://dl.dell.com/content/manual34878027-dell-unisphere-for-powermax-10-0-0-installation-guide.pdf?language=en-us&ps=true)

### New Features/Changes
- [Added support for RKE 1.4.2.](https://github.com/dell/csm/issues/670)
- [Added support to cleanup powerpath dead paths](https://github.com/dell/csm/issues/669)
- [Added support for Kubernetes 1.26](https://github.com/dell/csm/issues/597)
- [Added support to clone the replicated volumes](https://github.com/dell/csm/issues/646)
- [Added support to restore the snapshot of metro volumes](https://github.com/dell/csm/issues/652)
- [Added support for MKE 3.6.1](https://github.com/dell/csm/issues/672)
- [Added support for user array migration between arrays](https://github.com/dell/csm/issues/267)
- [Added support for Observability](https://github.com/dell/csm/issues/586)
- [Added support for generating manifest file via CSM Installation wizard](https://github.com/dell/csm/issues/591)

### Fixed Issues
There are no fixed issues in this release.

### Known Issues

| Issue | Workaround |
|-------|------------|
| Unable to update Host: A problem occurred modifying the host resource | This issue occurs when the nodes do not have unique hostnames or when an IP address/FQDN with same sub-domains are used as hostnames. The workaround is to use unique hostnames or FQDN with unique sub-domains|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node |

### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
