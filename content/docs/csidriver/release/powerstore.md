---
title: PowerStore
description: Release notes for PowerStore CSI driver
---

## Release Notes - CSI PowerStore v2.7.0

### New Features/Changes
- [CSI PowerStore - Add support for PowerStore Medusa (v3.5) array](https://github.com/dell/csm/issues/735)
- [Allow FQDN for the endpoint in CSI-PowerStore](https://github.com/dell/csm/issues/731)
- [CSM Operator: Support install of Resiliency module](https://github.com/dell/csm/issues/739)
- [Migrate image registry from k8s.gcr.io to registry.k8s.io](https://github.com/dell/csm/issues/744)
- [CSM support for Kubernetes 1.27](https://github.com/dell/csm/issues/761)
- [Add upgrade support of csi-powerstore driver in CSM-Operator](https://github.com/dell/csm/issues/805)
- [CSM support for Openshift 4.12](https://github.com/dell/csm/issues/571)
- [Update to the latest UBI/UBI Micro images for CSM](https://github.com/dell/csm/issues/843)

### Fixed Issues
- [Storage Capacity Tracking not working in CSI-PowerStore when installed using CSM Operator](https://github.com/dell/csm/issues/823)
- [CHAP is set to true in the CSI-PowerStore sample file in CSI Operator](https://github.com/dell/csm/issues/812)
- [Unable to delete application pod when CSI PowerStore is installed using CSM Operator](https://github.com/dell/csm/issues/785)

### Known Issues

| Issue                                                                                                                                      | Resolution or workaround, if known                                                                                                                                                                                                                                                                                                      |
|--------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation | Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100 <br> |
| fsGroupPolicy may not work as expected without root privileges for NFS only<br/>https://github.com/kubernetes/examples/issues/260          | To get the desired behavior set "allowRoot: "true" in the storage class parameter                                                                                                                                                                                                                                                       |
| If the NVMeFC pod is not getting created and the host looses the ssh connection, causing the driver pods to go to error state              | remove the nvme_tcp module from the host incase of NVMeFC connection                                                                                                                                                                                                                                                                    |
| When a node goes down, the block volumes attached to the node cannot be attached to another node                                           | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node.                   |
| When driver node pods enter CrashLoopBackOff and PVC remains in pending state with one of the following events:<br /> 1. failed to provision volume with StorageClass `<storage-class-name>`: error generating accessibility requirements: no available topology found <br /> 2. waiting for a volume to be created, either by external provisioner "csi-powerstore.dellemc.com" or manually created by system administrator.  | Check whether all array details present in the secret file are valid and remove any invalid entries if present. <br/>Redeploy the driver.                                                                                                                                                                                                                                                       

### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
