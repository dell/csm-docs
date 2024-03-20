---
title: PowerStore
description: Release notes for PowerStore CSI driver
---

## Release Notes - CSI PowerStore v2.8.0



### New Features/Changes

- [#724 - [FEATURE]: CSM support for Openshift 4.13](https://github.com/dell/csm/issues/724)
- [#877 - [FEATURE]: Make standalone helm chart available from helm repository : https://dell.github.io/dell/helm-charts](https://github.com/dell/csm/issues/877)
- [#878 - [FEATURE]: CSI 1.5 spec support: Implement Volume Limits](https://github.com/dell/csm/issues/878)
- [#879 - [FEATURE]: Configurable Volume Attributes use recommended naming convention <prefix>/<name>](https://github.com/dell/csm/issues/879)
- [#922 - [FEATURE]: Use ubi9 micro as base image](https://github.com/dell/csm/issues/922)

### Fixed Issues

- [#916 - [BUG]: Remove references to deprecated io/ioutil package](https://github.com/dell/csm/issues/916)
- [#928 - [BUG]: PowerStore Replication - Delete RG request hangs](https://github.com/dell/csm/issues/928)

### Known Issues

| Issue                                                                                                                                      | Resolution or workaround, if known                                                                                                                                                                                                                                                                                                      |
|--------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation | Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100 <br> |
| fsGroupPolicy may not work as expected without root privileges for NFS only<br/>https://github.com/kubernetes/examples/issues/260          | To get the desired behavior set "allowRoot: "true" in the storage class parameter                                                                                                                                                                                                                                                       |
| If the NVMeFC pod is not getting created and the host looses the ssh connection, causing the driver pods to go to error state              | remove the nvme_tcp module from the host incase of NVMeFC connection                                                                                                                                                                                                                                                                    |
| When a node goes down, the block volumes attached to the node cannot be attached to another node                                           | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node.                   |
| When driver node pods enter CrashLoopBackOff and PVC remains in pending state with one of the following events:<br /> 1. failed to provision volume with StorageClass `<storage-class-name>`: error generating accessibility requirements: no available topology found <br /> 2. waiting for a volume to be created, either by external provisioner "csi-powerstore.dellemc.com" or manually created by system administrator.  | Check whether all array details present in the secret file are valid and remove any invalid entries if present. <br/>Redeploy the driver.  |
| If an ephemeral pod is not being created in OpenShift 4.13 and is failing with the error "error when creating pod: the pod uses an inline volume provided by CSIDriver csi-powerstore.dellemc.com, and the namespace has a pod security enforcement level that is lower than privileged." | This issue occurs because OpenShift 4.13 introduced the CSI Volume Admission plugin to restrict the use of a CSI driver capable of provisioning CSI ephemeral volumes during pod admission (https://docs.openshift.com/container-platform/4.13/storage/container_storage_interface/ephemeral-storage-csi-inline.html). Therefore, an additional label "security.openshift.io/csi-ephemeral-volume-profile" needs to be added to the CSIDriver object to support inline ephemeral volumes. |
| In OpenShift 4.13, the root user is not allowed to perform write operations on NFS shares, when root squashing is enabled. | The workaround for this issue is to disable root squashing by setting allowRoot: "true" in the NFS storage class. |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs, and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with Kubenetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |

### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
