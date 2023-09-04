---
title: PowerFlex
description: Release notes for PowerFlex CSI driver
---

## Release Notes - CSI PowerFlex v2.8.0


### New Features/Changes

- [#724 - [FEATURE]: CSM support for Openshift 4.13](https://github.com/dell/csm/issues/724)
- [#763 - [FEATURE]: CSI-PowerFlex 4.0 NFS support](https://github.com/dell/csm/issues/763)
- [#876 - [FEATURE]: CSI 1.5 spec support -StorageCapacityTracking](https://github.com/dell/csm/issues/876)
- [#926 - [FEATURE]: Set up golangci-lint for all CSM repositories](https://github.com/dell/csm/issues/926)
- [#947 - [FEATURE]: K8S 1.28 support in CSM 1.8](https://github.com/dell/csm/issues/947)
- [#878 - [FEATURE]: CSI 1.5 spec support : Implement Volume Limits](https://github.com/dell/csm/issues/878)
- [#885 - [FEATURE]: SDC 3.6.1 support](https://github.com/dell/csm/issues/885)

### Fixed Issues

- [#916 - [BUG]: Remove refs to deprecated io/ioutil](https://github.com/dell/csm/issues/916)

### Known Issues

| Issue | Workaround |
|-------|------------|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.| Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100|
| When a node goes down, the block volumes attached to the node cannot be attached to another node                                           | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node.                   |
| sdc:3.6.0.6 is causing issues while installing the csi-powerflex driver on ubuntu,RHEL8.3                                           |  Workaround: <br /> Change the powerflexSdc to sdc:3.6 in values.yaml https://github.com/dell/csi-powerflex/blob/72b27acee7553006cc09df97f85405f58478d2e4/helm/csi-vxflexos/values.yaml#L13 <br />|
| sdc:3.6.1 is causing issues while installing the csi-powerflex driver on ubuntu.3                                           |  Workaround: <br /> Change the powerflexSdc to sdc:3.6 in values.yaml https://github.com/dell/csi-powerflex/blob/72b27acee7553006cc09df97f85405f58478d2e4/helm/csi-vxflexos/values.yaml#L13 <br />|
A CSI ephemeral pod may not get created in OpenShift 4.13 and fail with the error `"error when creating pod: the pod uses an inline volume provided by CSIDriver csi-unity.dellemc.com, and the namespace has a pod security enforcement level that is lower than privileged."` | This issue occurs because OpenShift 4.13 introduced the CSI Volume Admission plugin to restrict the use of a CSI driver capable of provisioning CSI ephemeral volumes during pod admission. Therefore, an additional label `security.openshift.io/csi-ephemeral-volume-profile` in [csidriver.yaml](https://github.com/dell/helm-charts/blob/csi-unity-2.8.0/charts/csi-unity/templates/csidriver.yaml) file with the required security profile value should be provided. Follow [OpenShift 4.13 documentation for CSI Ephemeral Volumes](https://docs.openshift.com/container-platform/4.13/storage/container_storage_interface/ephemeral-storage-csi-inline.html) for more information. |

### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.

- CSI-PowerFlex v2.7.1 is applicable only for helm based installations.
