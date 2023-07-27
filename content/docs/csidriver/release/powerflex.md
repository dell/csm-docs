---
title: PowerFlex
description: Release notes for PowerFlex CSI driver
---

## Release Notes - CSI PowerFlex v2.7.1

### New Features/Changes
- [K8 1.27 support added.](https://github.com/dell/csm/issues/743)
- [OCP 4.12 support added](https://github.com/dell/csm/issues/743)
- [CSM Operator: Support install of Resiliency module](https://github.com/dell/csm/issues/739)

### Fixed Issues
- [Fix the offline helm installation failure](https://github.com/dell/csm/issues/868)
### Known Issues

| Issue | Workaround |
|-------|------------|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.| Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100|
| When a node goes down, the block volumes attached to the node cannot be attached to another node                                           | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node.                   |
| sdc:3.6.0.6 is causing issues while installing the csi-powerflex driver on ubuntu,RHEL8.3                                           |  Workaround: <br /> Change the powerflexSdc to sdc:3.6 in values.yaml https://github.com/dell/csi-powerflex/blob/72b27acee7553006cc09df97f85405f58478d2e4/helm/csi-vxflexos/values.yaml#L13 <br />|


### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
