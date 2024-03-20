---
title: PowerFlex
description: Release notes for PowerFlex CSI driver
---

## Release Notes - CSI PowerFlex v2.9.2





### New Features/Changes

- [#947 - [FEATURE]: Support for Kubernetes 1.28](https://github.com/dell/csm/issues/947)
- [#1066 - [FEATURE]: Support for Openshift 4.14](https://github.com/dell/csm/issues/1066)
- [#1067 - [FEATURE]: Support For PowerFlex 4.5](https://github.com/dell/csm/issues/1067)
- [#851 - [FEATURE]: Helm Chart Enhancement - Container Images Configurable in values.yaml](https://github.com/dell/csm/issues/851)
- [#905 - [FEATURE]: Add support for CSI Spec 1.6](https://github.com/dell/csm/issues/905)
- [#996 - [FEATURE]: Dell CSI to Dell CSM Operator Migration Process](https://github.com/dell/csm/issues/996)

### Fixed Issues

- [#1011 - [BUG]: PowerFlex RWX volume no option to configure the nfs export host access ip address.](https://github.com/dell/csm/issues/1011)
- [#1014 - [BUG]: Missing error check for os.Stat call during volume publish](https://github.com/dell/csm/issues/1014)
- [#1020 - [BUG]: CSI-PowerFlex: SDC Rename fails when configuring multiple arrays in the secret](https://github.com/dell/csm/issues/1020)
- [#1030 - [BUG]: Comment out duplicate entries in the sample secret.yaml file](https://github.com/dell/csm/issues/1030)
- [#1050 - [BUG]: NFS Export gets deleted when one pod is deleted from the multiple pods consuming the same PowerFlex RWX NFS volume](https://github.com/dell/csm/issues/1050)
- [#1054 - [BUG]:  The PowerFlex Dockerfile is incorrectly labeling the version as 2.7.0 for the 2.8.0 version.](https://github.com/dell/csm/issues/1054)
- [#1057 - [BUG]: CSI Driver - issue with creation volume from 1 of the worker nodes](https://github.com/dell/csm/issues/1057)
- [#1058 - [BUG]: CSI Health monitor for Node missing for CSM PowerFlex in Operator samples](https://github.com/dell/csm/issues/1058)
- [#1061 - [BUG]: Golint is not installing with go get command](https://github.com/dell/csm/issues/1061)
- [#1110 - [BUG]: Multi Controller defect - sidecars timeout](https://github.com/dell/csm/issues/1110)
- [#1103 - [BUG]: CSM Operator doesn't apply fSGroupPolicy value to CSIDriver Object](https://github.com/dell/csm/issues/1103)
- [#1152 - [BUG]: CSI driver changes to facilitate SDC brownfield deployments](https://github.com/dell/csm/issues/1152))

### Known Issues

| Issue | Workaround |
|-------|------------|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.| Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100|
| When a node goes down, the block volumes attached to the node cannot be attached to another node                                           | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node.                   |
| sdc:3.6.0.6 is causing issues while installing the csi-powerflex driver on ubuntu,RHEL8.3                                           |  Workaround: <br /> Change the powerflexSdc to sdc:3.6 in values.yaml https://github.com/dell/csi-powerflex/blob/72b27acee7553006cc09df97f85405f58478d2e4/helm/csi-vxflexos/values.yaml#L13 <br />|
| sdc:3.6.1 is causing issues while installing the csi-powerflex driver on ubuntu.                                           |  Workaround: <br /> Change the powerflexSdc to sdc:3.6 in values.yaml https://github.com/dell/csi-powerflex/blob/72b27acee7553006cc09df97f85405f58478d2e4/helm/csi-vxflexos/values.yaml#L13 <br />|
A CSI ephemeral pod may not get created in OpenShift 4.13 and fail with the error `"error when creating pod: the pod uses an inline volume provided by CSIDriver csi-vxflexos.dellemc.com, and the namespace has a pod security enforcement level that is lower than privileged."` | This issue occurs because OpenShift 4.13 introduced the CSI Volume Admission plugin to restrict the use of a CSI driver capable of provisioning CSI ephemeral volumes during pod admission. Therefore, an additional label `security.openshift.io/csi-ephemeral-volume-profile` in [csidriver.yaml](https://github.com/dell/helm-charts/blob/csi-vxflexos-2.9.1/charts/csi-vxflexos/templates/csidriver.yaml) file with the required security profile value should be provided. Follow [OpenShift 4.13 documentation for CSI Ephemeral Volumes](https://docs.openshift.com/container-platform/4.13/storage/container_storage_interface/ephemeral-storage-csi-inline.html) for more information. |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with kubenetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
| The PowerFlex Dockerfile is incorrectly labeling the version as 2.7.0 for the 2.8.0 version. | Describe the driver pod using ```kubectl describe pod $podname -n vxflexos``` to ensure v2.8.0 is installed. |

### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
