---
title: PowerMax
description: Release notes for PowerMax CSI driver
---

## Release Notes - CSI PowerMax v2.7.0

{{% pageinfo color="primary" %}} Linked Proxy mode for CSI reverse proxy is no longer actively maintained or supported. It will be deprecated in CSM 1.9 (Driver Version 2.9.0). It is highly recommended that you use stand alone mode going forward. {{% /pageinfo %}}

> Note: Starting from CSI v2.4.0, Only Unisphere 10.0 REST endpoints are supported. It is mandatory that Unisphere should be updated to 10.0. Please find the instructions [here.](https://dl.dell.com/content/manual34878027-dell-unisphere-for-powermax-10-0-0-installation-guide.pdf?language=en-us&ps=true)

### New Features/Changes
- [Added support for OpenShift 4.12](https://github.com/dell/csm/issues/571)
- [Added support for PowerMax v10.0.1 array](https://github.com/dell/csm/issues/760)
- [Migrated image registry from k8s.gcr.io to registry.k8s.io](https://github.com/dell/csm/issues/744)
- [Added support for Amazom EKS](https://github.com/dell/csm/issues/825)
- [Added support for Kubernetes 1.27](https://github.com/dell/csm/issues/761)
- [Added support for read only mount option for block volumes](https://github.com/dell/csm/issues/792)
- [Added support for host groups for vSphere environment](https://github.com/dell/csm/issues/746)
- [Added support to delete volumes on target array when it is set to Delete in storage class](https://github.com/dell/csm/issues/801)
- [Added support for setting up QoS parameters for throttling performance and bandwidth at Storage Group level](https://github.com/dell/csm/issues/726)
- [Added support for CSM Operator for PowerMax Driver](https://github.com/dell/csm/issues/769)
- [Added support to create reverseproxy certs automatically](https://github.com/dell/csm/issues/819)

### Fixed Issues
There are no fixed issues in this release.

### Known Issues

| Issue | Workaround |
|-------|------------|
| Unable to update Host: A problem occurred modifying the host resource | This issue occurs when the nodes do not have unique hostnames or when an IP address/FQDN with same sub-domains are used as hostnames. The workaround is to use unique hostnames or FQDN with unique sub-domains|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node |

### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
