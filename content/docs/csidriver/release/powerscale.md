---
title: PowerScale
description: Release notes for PowerScale CSI driver
---


## Release Notes - CSI Driver for PowerScale v2.7.0

### New Features/Changes

- [Allow user to set Quota limit parameters from the PVC request in CSI PowerScale](https://github.com/dell/csm/issues/742)
- [CSI Spec 1.5: Storage capacity tracking feature](https://github.com/dell/csm/issues/824)
- [Added support for Kubernetes 1.27](https://github.com/dell/csm/issues/761)
- [Added support for OpenShift 4.12](https://github.com/dell/csm/issues/571)
- [Migrated image registry from k8s.gcr.io to registry.k8s.io](https://github.com/dell/csm/issues/744)
- [CSM Operator: Support install of Resiliency module](https://github.com/dell/csm/issues/739)

### Fixed Issues


### Known Issues
| Issue                                                                                                                                                                                                                               | Resolution or workaround, if known                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| If the length of the nodeID exceeds 128 characters, the driver fails to update the CSINode object and installation fails. This is due to a limitation set by CSI spec which doesn't allow nodeID to be greater than 128 characters. | The CSI PowerScale driver uses the hostname for building the nodeID which is set in the CSINode resource object, hence we recommend not having very long hostnames in order to avoid this issue. This current limitation of 128 characters is likely to be relaxed in future Kubernetes versions as per this issue in the community: https://github.com/kubernetes-sigs/gcp-compute-persistent-disk-csi-driver/issues/581 <br><br> **Note:** In kubernetes 1.22 this limit has been relaxed to 192 characters. |
| If some older NFS exports /terminated worker nodes still in NFS export client list, CSI driver tries to add a new worker node it fails (For RWX volume).                                                                            | User need to manually clean the export client list from old entries to make successful addition of new worker nodes.                                                                                                                                                                                                                                                                                                                                                                                           |
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.                                                                                         | Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100                                                                                                                                                                             |
| fsGroupPolicy may not work as expected without root privileges for NFS only<br/>https://github.com/kubernetes/examples/issues/260                                                                                                   | To get the desired behavior set "RootClientEnabled" = "true" in the storage class parameter                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Driver logs shows "VendorVersion=2.3.0+dirty"                                                                                                                                                                                       | Update the driver to csi-powerscale 2.4.0                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| PowerScale 9.5.0, Driver installation fails with session based auth, "HTTP/1.1 401 Unauthorized" | Fix is available in PowerScale >= 9.5.0.4 |


### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
