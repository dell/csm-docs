---
title: Unity XT
description: Release notes for Unity XT CSI driver
---

## Release Notes - CSI Unity XT v2.11.0








### New Features/Changes

- [#1284 - [FEATURE]: Support for Openshift 4.15](https://github.com/dell/csm/issues/1284)
- [#1285 - [FEATURE]: Remove checks in code for non-supported installs of CSM](https://github.com/dell/csm/issues/1285)
- [#926 - [FEATURE]: Fixing the linting, formatting and vetting issues](https://github.com/dell/csm/issues/926)

### Fixed Issues

- [#1081 - [BUG]: CSM driver repositories reference CSI Operator](https://github.com/dell/csm/issues/1081)
- [#1140 - [BUG]: Cert-csi tests are not reporting the passed testcases in K8S E2E tests ](https://github.com/dell/csm/issues/1140)
- [#1174 - [BUG]: Kubelet Configuration Directory setting should not have a comment about default value being None](https://github.com/dell/csm/issues/1174)

### Known Issues

| Issue | Workaround |
|-------|------------|
| Nodes not getting registered on Unity XT. | Creating wrapper around `hostname` command inside the node pod's driver container, that fails when `-I` flag is used. This will triggrer fallback behaviour in driver and should fix the issue. |
| Topology-related node labels are not removed automatically.  | Currently, when the driver is uninstalled, topology-related node labels are not getting removed automatically. There is an open issue in the Kubernetes to fix this. Until the fix is released, remove the labels manually after the driver un-installation using command **kubectl label node <node_name> <label1>- <label2>- ...** Example: **kubectl label node <hostname> csi-unity.dellemc.com/array123-iscsi-** Note: there must be - at the end of each label to remove it.|
| NFS Clone - Resize of the snapshot is not supported by Unity XT Platform, however, the user should never try to resize the cloned NFS volume.| Currently, when the driver takes a clone of NFS volume, it succeeds but if the user tries to resize the NFS volumesnapshot, the driver will throw an error.|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.| Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the VolumeAttachment to the node that went down. <br /> Now the volume can be attached to the new node. |
| A CSI ephemeral pod may not get created in OpenShift 4.13 and fail with the error `"error when creating pod: the pod uses an inline volume provided by CSIDriver csi-unity.dellemc.com, and the namespace has a pod security enforcement level that is lower than privileged."` | This issue occurs because OpenShift 4.13 introduced the CSI Volume Admission plugin to restrict the use of a CSI driver capable of provisioning CSI ephemeral volumes during pod admission. Therefore, an additional label `security.openshift.io/csi-ephemeral-volume-profile` in [csidriver.yaml](https://github.com/dell/helm-charts/blob/csi-unity-2.8.0/charts/csi-unity/templates/csidriver.yaml) file with the required security profile value should be provided. Follow [OpenShift 4.13 documentation for CSI Ephemeral Volumes](https://docs.openshift.com/container-platform/4.13/storage/container_storage_interface/ephemeral-storage-csi-inline.html) for more information. |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with Kubernetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
| fsGroupPolicy may not work as expected without root privileges for NFS only [https://github.com/kubernetes/examples/issues/260](https://github.com/kubernetes/examples/issues/260) | To get the desired behavior set “RootClientEnabled” = “true” in the storage class parameter |
| Controller publish is taking too long to complete/ Health monitoring is causing Unity array to panic by opening multiple sessions | Disable volume health monitoring on the node and keep it only at the controller level. Refer [here](https://dell.github.io/csm-docs/docs/csidriver/features/unity/#volume-health-monitoring) for more information about enabling/disabling volume health monitoring|
### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring will not be available in the Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
