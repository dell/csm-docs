---
title: PowerScale
description: Release notes for PowerScale CSI driver
---


## Release Notes - CSI Driver for PowerScale v2.12.0











### New Features/Changes

- [#1472 - [FEATURE]: Support for Kubernetes 1.31](https://github.com/dell/csm/issues/1472)
- [#1473 - [FEATURE]: Add Support for OpenShift Container Platform (OCP) 4.17](https://github.com/dell/csm/issues/1473)
- [#1508 - [FEATURE]:  Add Support for KubeVirt](https://github.com/dell/csm/issues/1508)

### Fixed Issues

- [#1438 - [BUG]: Remove mutex locks from interceptors on method calls](https://github.com/dell/csm/issues/1438)
- [#1448 - [BUG]: CSM-operator build fails from disk space issue](https://github.com/dell/csm/issues/1448)
- [#1475 - [BUG]: CSM Operator - Changes to csiDriverSpec does not reflect in CSM state or csidrivers.storage.k8s.io object](https://github.com/dell/csm/issues/1475)
- [#1531 - [BUG]: CSM-Operator resets dell-replication-controller-config configmap](https://github.com/dell/csm/issues/1531)

### Known Issues

| Issue                                                                                                                                                                                                                               | Resolution or workaround, if known                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Storage capacity tracking does not return `MaximumVolumeSize` parameter. PowerScale is purely NFS based meaning it has no actual volumes. Therefore `MaximumVolumeSize` cannot be implemented if there is no volume creation.                                                                            | CSI PowerScale 2.9.1 is compliant with CSI 1.6 specification since the field `MaximumVolumeSize` is optional.                                                                                                                                                                                                                                                                                                                                                                                           |
| If the length of the nodeID exceeds 128 characters, the driver fails to update the CSINode object and installation fails. This is due to a limitation set by CSI spec which doesn't allow nodeID to be greater than 128 characters. | The CSI PowerScale driver uses the hostname for building the nodeID which is set in the CSINode resource object, hence we recommend not having very long hostnames in order to avoid this issue. This current limitation of 128 characters is likely to be relaxed in future Kubernetes versions as per this issue in the community: https://github.com/kubernetes-sigs/gcp-compute-persistent-disk-csi-driver/issues/581 <br><br> **Note:** In kubernetes 1.22 this limit has been relaxed to 192 characters. |
| If some older NFS exports /terminated worker nodes still in NFS export client list, CSI driver tries to add a new worker node it fails (For RWX volume).                                                                            | User need to manually clean the export client list from old entries to make successful addition of new worker nodes.                                                                                                                                                                                                                                                                                                                                                                                           |
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.                                                                                         | Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100                                                                                                                                                                             |
| fsGroupPolicy may not work as expected without root privileges for NFS only<br/>https://github.com/kubernetes/examples/issues/260                                                                                                   | To get the desired behavior set "RootClientEnabled" = "true" in the storage class parameter                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Driver logs shows "VendorVersion=2.3.0+dirty"                                                                                                                                                                                       | Update the driver to csi-powerscale 2.4.0                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| PowerScale 9.5.0, Driver installation fails with session based auth, "HTTP/1.1 401 Unauthorized" | Fix is available in PowerScale >= 9.5.0.4 |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with kubernetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |

### Note

- Support for Kubernetes alpha features like Volume Health Monitoring will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
