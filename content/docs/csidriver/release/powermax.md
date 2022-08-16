---
title: PowerMax
description: Release notes for PowerMax CSI driver
---

## Release Notes - CSI PowerMax v2.4.0

> Note: Starting from CSI v2.4.0, Only Unisphere 10.0 REST endpoints are supported. 

### New Features/Changes
- Online volume expansion for replicated volumes.
- Added support for PowerMax Juniper release
- Removed 9.x Unisphere REST endpoints support.
- Added 10.0 Unisphere REST endpoints support.
- Automatic SRDF group creation for PowerMax arrays (Juniper release and above).

### Fixed Issues
There are no fixed issues in this release.

### Known Issues

| Issue | Workaround |
|-------|------------|
| Unable to update Host: A problem occurred modifying the host resource | This issue occurs when the nodes do not have unique hostnames or when an IP address/FQDN with same sub-domains are used as hostnames. The workaround is to use unique hostnames or FQDN with unique sub-domains|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node |
| After expanding file system volume , new size is not getting reflected inside the container | This is a known issue and has been reported at https://github.com/dell/csm/issues/378 . Workaround : Remount the volumes <br/> 1. Edit the replica count as 0 in application StatefulSet <br /> 2. Change the replica count as 1 for same StatefulSet. |

### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
