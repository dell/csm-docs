---
title: PowerFlex
description: Release notes for PowerFlex CSI driver
---

## Release Notes - CSI PowerFlex v2.5.0

### New Features/Changes
- [Read Only Block support](https://github.com/dell/csm/issues/509)
- [Added support for setting QoS limits by CSI-PowerFLex driver](https://github.com/dell/csm/issues/533)
- [Added support for standardizing helm installation for CSI-PowerFlex driver](https://github.com/dell/csm/issues/494)
- [Automated SDC deployment on RHEL 7.9 and 8.x](https://github.com/dell/csm/issues/494)
- [SLES 15 SP4 support added](https://github.com/dell/csm/issues/539)
- [OCP 4.11 support added](https://github.com/dell/csm/issues/480)
- [K8 1.25 support added](https://github.com/dell/csm/issues/478)
- [Added support for PowerFlex storage system v4.0](https://github.com/dell/csm/issues/476)

### Fixed Issues 
- [Fix for volume RO mount option](https://github.com/dell/csm/issues/503)

### Known Issues

| Issue | Workaround |
|-------|------------|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.| Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100|
| When a node goes down, the block volumes attached to the node cannot be attached to another node                                           | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node.                   |
| CSI-Powerflex driver installtion is failing with the offline helm installer.                             | This is a known issue and has been reported at https://github.com/dell/csm/issues/868. Workaround: Remove the 'v' from the following lines https://github.com/dell/csi-powerflex/blob/v2.5.0/dell-csi-helm-installer/csi-offline-bundle.sh#LL94C1-L95C92, Now there will not be any issue in CSI-Powerflex driver offline helm installtion.                   | 

### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
