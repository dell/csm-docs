---
title: PowerStore
description: Release notes for PowerStore CSI driver
---

## Release Notes - CSI PowerStore v2.6.0

### New Features/Changes

- [Added support for Resiliency](https://github.com/dell/csm/issues/587)
- [Added support for Kubernetes 1.26](https://github.com/dell/csm/issues/597)
- [Added support for MKE 3.6.x](https://github.com/dell/csm/issues/672)
- [Added support for RKE 1.4.1](https://github.com/dell/csm/issues/670)

### Fixed Issues

- [Multiple iSCSI network support](https://github.com/dell/csm/issues/668)
- [Create volume successful but unable to map volumes to a hosts](https://github.com/dell/csm/issues/599)
- [Can't find IP in X_CSI_POWERSTORE_EXTERNAL_ACCESS for NFS provisioning](https://github.com/dell/csm/issues/689)

### Known Issues

| Issue                                                                                                                                      | Resolution or workaround, if known                                                                                                                                                                                                                                                                                                      |
|--------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation | Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100 <br> |
| fsGroupPolicy may not work as expected without root privileges for NFS only<br/>https://github.com/kubernetes/examples/issues/260          | To get the desired behavior set "allowRoot: "true" in the storage class parameter                                                                                                                                                                                                                                                       |
| If the NVMeFC pod is not getting created and the host looses the ssh connection, causing the driver pods to go to error state              | remove the nvme_tcp module from the host incase of NVMeFC connection                                                                                                                                                                                                                                                                    |
| When a node goes down, the block volumes attached to the node cannot be attached to another node                                           | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node.                   |

### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.