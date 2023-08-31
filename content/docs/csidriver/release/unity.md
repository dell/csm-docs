---
title: Unity XT
description: Release notes for Unity XT CSI driver
---

## Release Notes - CSI Unity XT v2.8.0


### New Features/Changes

- [#724 - [FEATURE]: CSM support for Openshift 4.13](https://github.com/dell/csm/issues/724)
- [#876 - [FEATURE]: CSI 1.5 spec support -StorageCapacityTracking](https://github.com/dell/csm/issues/876)
- [#891 - [FEATURE]: Enhancing Unity XT driver to handle API requests after the sessionIdleTimeOut in STIG mode](https://github.com/dell/csm/issues/891)
- [#926 - [FEATURE]: Set up golangci-lint for all CSM repositories](https://github.com/dell/csm/issues/926)

### Fixed Issues

- [#849 - [BUG]: CSI driver does not verify iSCSI initiators on the array correctly](https://github.com/dell/csm/issues/849)
- [#901 - [BUG]: Unity XT: Volume Mount Hangs](https://github.com/dell/csm/issues/901)
- [#902 - [BUG]: Space is not reflecting right on Unity](https://github.com/dell/csm/issues/902)
- [#916 - [BUG]: Remove refs to deprecated io/ioutil](https://github.com/dell/csm/issues/916)

### Known Issues

| Issue | Workaround |
|-------|------------|
| Topology-related node labels are not removed automatically.  | Currently, when the driver is uninstalled, topology-related node labels are not getting removed automatically. There is an open issue in the Kubernetes to fix this. Until the fix is released, remove the labels manually after the driver un-installation using command **kubectl label node <node_name> <label1>- <label2>- ...** Example: **kubectl label node <hostname> csi-unity.dellemc.com/array123-iscsi-** Note: there must be - at the end of each label to remove it.|
| NFS Clone - Resize of the snapshot is not supported by Unity XT Platform, however the user should never try to resize the cloned NFS volume.| Currently, when the driver takes a clone of NFS volume, it succeeds but if the user tries to resize the NFS volumesnapshot, the driver will throw an error.|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.| Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the VolumeAttachment to the node that went down. <br /> Now the volume can be attached to the new node. |
| CSI driver does not verify iSCSI initiators on the array correctly when iSCSI initiator names are not in lowercase - After any node reboot, the driver pod on that rebooted node goes into a failed state, failing to find the iSCSI initiator on the array | Work around is to rename host iSCSI initiators to lowercase and reboot the respective worker node. The CSI driver pod will spin off successfully. Example: Rename "iqn.2000-11.com.DEMOWORKERNODE01:1a234b56cd78" to "iqn.2000-11.com.demoworkernode01:1a234b56cd78" in lowercase. 
### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
