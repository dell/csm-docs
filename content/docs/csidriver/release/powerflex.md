---
title: PowerFlex
description: Release notes for PowerFlex CSI driver
---

## Release Notes - CSI PowerFlex v2.10.0








### New Features/Changes

- [#926 - [FEATURE]: Fixing the linting, formatting and vetting issues](https://github.com/dell/csm/issues/926)

### Fixed Issues

- [#1081 - [BUG]: CSM driver repositories reference CSI Operator](https://github.com/dell/csm/issues/1081)
- [#1086 - [BUG]: PowerFlex driver fails to start on RKE](https://github.com/dell/csm/issues/1086)
- [#1101 - [BUG]: the `nasName` parameter in the powerflex secret is now mandatory](https://github.com/dell/csm/issues/1101)
- [#1140 - [BUG]: Cert-csi tests are not reporting the passed testcases in K8S E2E tests ](https://github.com/dell/csm/issues/1140)
- [#1163 - [BUG]: Resource quota bypass](https://github.com/dell/csm/issues/1163)
- [#1174 - [BUG]: Kubelet Configuration Directory setting should not have a comment about default value being None](https://github.com/dell/csm/issues/1174)
- [#1210 - [BUG]: Helm deployment of PowerFlex driver is failing](https://github.com/dell/csm/issues/1210)

### Known Issues

| Issue | Workaround |
|-------|------------|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.| Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100 |
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node. |
| sdc:3.6.0.6 is causing issues while installing the csi-powerflex driver on ubuntu,RHEL8.3 |  Workaround: <br /> Change the powerflexSdc to sdc:3.6 in values.yaml https://github.com/dell/csi-powerflex/blob/72b27acee7553006cc09df97f85405f58478d2e4/helm/csi-vxflexos/values.yaml#L13 <br /> |
| sdc:3.6.1 is causing issues while installing the csi-powerflex driver on ubuntu. |  Workaround: <br /> Change the powerflexSdc to sdc:3.6 in values.yaml https://github.com/dell/csi-powerflex/blob/72b27acee7553006cc09df97f85405f58478d2e4/helm/csi-vxflexos/values.yaml#L13 <br /> |
A CSI ephemeral pod may not get created in OpenShift 4.13 and fail with the error `"error when creating pod: the pod uses an inline volume provided by CSIDriver csi-vxflexos.dellemc.com, and the namespace has a pod security enforcement level that is lower than privileged."` | This issue occurs because OpenShift 4.13 introduced the CSI Volume Admission plugin to restrict the use of a CSI driver capable of provisioning CSI ephemeral volumes during pod admission. Therefore, an additional label `security.openshift.io/csi-ephemeral-volume-profile` in [csidriver.yaml](https://github.com/dell/helm-charts/blob/csi-vxflexos-2.10.0/charts/csi-vxflexos/templates/csidriver.yaml) file with the required security profile value should be provided. Follow [OpenShift 4.13 documentation for CSI Ephemeral Volumes](https://docs.openshift.com/container-platform/4.13/storage/container_storage_interface/ephemeral-storage-csi-inline.html) for more information. |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with kubenetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
| The PowerFlex Dockerfile is incorrectly labeling the version as 2.7.0 for the 2.8.0 version. | Describe the driver pod using ```kubectl describe pod $podname -n vxflexos``` to ensure v2.8.0 is installed. |
| Resource quotas may not work properly with the CSI PowerFlex driver. PowerFlex is only able to assign storage in 8Gi chunks, so if a create volume call is made with a size not divisible by 8Gi, CSI-PowerFlex will round up to the next 8Gi boundary when it provisions storage -- however, the resource quota will not record this size but rather the original size in the create request. This means that, for example, if a 10Gi resource quota is set, and a user provisions 10 1Gi PVCs, 80Gi of storage will actually be allocated, which is well over the amount specified in the resource quota. | For now, users should only provision volumes in 8Gi-divisible chunks if they want to use resource quotas. |
| Helm install of CSM for PowerFlex v1.10.0 is failing due to a duplicate `mountPath: /host_opt_emc_path` being added to volumeMounts charts/csi-vxflexos/templates/node.yaml. Error message is `Error: INSTALLATION FAILED: 1 error occurred: DaemonSet.apps "vxflexos-node" is invalid: spec.template.spec.initContainers[0].volumeMounts[4].mountPath: Invalid value: "/host_opt_emc_path": must be unique` | The issue can be resolved by removing the duplicate entry in [https://github.com/dell/helm-charts/blob/main/charts/csi-vxflexos/templates/node.yaml](https://github.com/dell/helm-charts/blob/main/charts/csi-vxflexos/templates/node.yaml) |


### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
- For fixing [#1210 - [BUG]: Helm deployment of PowerFlex driver is failing](https://github.com/dell/csm/issues/1210), a new helm-chart has been released. In order to install this helm chart, we need to pass the flag `--helm-charts-version` during helm installation and flag `-v` during offline bundle installation with value `csi-vxflexos-2.10.1`.
