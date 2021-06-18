---
title: Unity
description: Release notes for Unity CSI driver
---

## Release Notes - CSI Unity v1.6.0

### New Features/Changes
- Added support for Kubernetes v1.21
- Added support for Red Hat Enterprise Linux (RHEL) 8.4
- Added support for MKE 3.4.0
- Added support for RKE v1.2.8
- Added support for VMware Tanzu
- Added support for CSI Spec 1.3
- Added Volume limit feature
- Added support for secret in YAML format
- Added support for Dynamic log level changes

### Fixed Issues
- The flag allowRWOMultiPodAccess: false is not applicable for Raw Block volumes and the driver allows the creation of multiple pods on the same node with RWO access mode.

### Known Issues

| Issue                                                        | Workaround                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| Topology-related node labels are not removed automatically.  | Currently, when the driver is uninstalled, topology-related node labels are not getting removed automatically. There is an open issue in the Kubernetes to fix this. Until the fix is released, remove the labels manually after the driver un-installation using command **kubectl label node <node_name> <label1>- <label2>- ...** Example: **kubectl label node <hostname> csi-unity.dellemc.com/array123-iscsi-** Note: there must be - at the end of each label to remove it.|
| Dynamic array detection will not work in Topology based environment | Whenever a new array is added or removed, then the driver controller and node pod should be restarted with command **kubectl get pods -n unity --no-headers=true \| awk '/unity-/{print $1}'\| xargs kubectl delete -n unity pod** when **topology-based storage classes are used**. Otherwise, the driver will detect the newly added or removed arrays automatically|
| If source PVC is deleted when cloned PVC exists, then source PVC will be deleted in the cluster but on array, it will still be present and marked for deletion. | All the cloned PVC should be deleted in order to delete the source PVC from the array. |
| PVC creation fails on a fresh cluster with **iSCSI** and **NFS** protocols alone enabled with error **failed to provision volume with StorageClass "unity-iscsi": error generating accessibility requirements: no available topology found**. | This is because iSCSI initiator login takes longer than the node pod startup time. This can be overcome by bouncing the node pods in the cluster using the below command the driver pods with **kubectl get pods -n unity --no-headers=true \| awk '/unity-/{print $1}'\| xargs kubectl delete -n unity pod** |
| On deleting pods sometimes the corresponding 'volumeattachment' will not get removed. This issue is intermittent and happens with one specific protocol (FC, iSCSI, or NFS) based storageclasses. This issue occurs in Kubernetes versions 1.19 and both versions of OpenShift (4.5/4.6).| On deleting the stale volumeattachment manually, Controller Unpublish gets invoked and then the corresponding PVCs can be deleted.|

