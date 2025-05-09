---
title: "Release Notes"
linkTitle: "Release Notes"
no_list: true
weight: 10
Description: >
  Container Storage Modules release notes
---

## Notifications:

**General:**

> * <span><span/>{{< message text="8" >}}
> * <span><span/>{{< message text="7" >}}
> * <span><span/>{{< message text="1" >}}

**Deprecation:**

> * <span><span/>{{< message text="5" >}}
> * <span><span/>{{< message text="11" >}}
> * <span><span/>{{< message text="12" >}}

## Release Notes for v1.14.0

### New Features/Changes

- [#1560 - [FEATURE]: CSM support for OpenShift 4.18](https://github.com/dell/csm/issues/1560)
- [#1561 - [FEATURE]: Added support for Kubernetes 1.32 ](https://github.com/dell/csm/issues/1561)
- [#1563 - [FEATURE]: Support KubeVirt for CSM modules](https://github.com/dell/csm/issues/1563)
- [#1610 - [FEATURE]: Added support for PowerStore 4.1 ](https://github.com/dell/csm/issues/1610)
- [#1611 - [FEATURE]: Added support for PowerScale 9.10](https://github.com/dell/csm/issues/1611)
- [#1612 - [FEATURE]: Multi-Availability Zone (AZ) support with multiple storage systems - dedicated storage systems in each AZ](https://github.com/dell/csm/issues/1612)
- [#1613 - [FEATURE]: CSI PowerFlex must have the ability to connect a subset of the worker nodes to a storage array for multi-array support](https://github.com/dell/csm/issues/1613)

### Fixed Issues

- [#1587 - [BUG]: Observability for PowerFlex Creates Too Many Sessions ](https://github.com/dell/csm/issues/1587)
- [#1667 - [BUG]: Labels versions and maintainer update for CSM images ](https://github.com/dell/csm/issues/1667)
- [#1632 - [BUG]: csm-metrics-powerstore doesn't start when the PowerStore endpoint is using a DNS name](https://github.com/dell/csm/issues/1632)
- [#1535 - [BUG]: Issue with CSM replication and unable to choose the target cluster certificate](https://github.com/dell/csm/issues/1535)
- [#1667 - [BUG]: Labels versions and maintainer update for CSM images ](https://github.com/dell/csm/issues/1667)
- [#1562 - [BUG]: Documentation for PowerFlex nasName states it is not a required field](https://github.com/dell/csm/issues/1562)
- [#1608 - [BUG]: Volume Size Rounding Issue in PowerFlex: Rounds Down Instead of Up for Multiples of 8GB](https://github.com/dell/csm/issues/1608)
- [#1639 - [BUG]: CSM PowerFlex entering boot loop when array has long response times](https://github.com/dell/csm/issues/1639)
- [#1641 - [BUG]: NodeGetVolumeStats will cause panic when called w/ an Ephemeral volume ](https://github.com/dell/csm/issues/1641)
- [#1549 - [BUG]: The NVMeCommand constant needs to use full path](https://github.com/dell/csm/issues/1549)
- [#1566 - [BUG]: Inconsistent naming convention of secret is misleading in Installation of PowerMax ](https://github.com/dell/csm/issues/1566)
- [#1568 - [BUG]: Examples provided in the secrets of install driver for the Primary Unisphere and Back up Unisphere is lacking clarity in ConfigMap](https://github.com/dell/csm/issues/1568)
- [#1569 - [BUG]: Unused variable "X_CSI_POWERMAX_ENDPOINT" resulting in driver not to start in PowerMax](https://github.com/dell/csm/issues/1569)
- [#1570 - [BUG]: Stale entries in CSM operator samples and helm-charts for PowerMax ](https://github.com/dell/csm/issues/1570)
- [#1571 - [BUG]: SubjectAltName needs to be updated in the tls.crt ](https://github.com/dell/csm/issues/1571)
- [#1584 - [BUG]: Driver should not be expecting a secret which is not used at all for PowerMax when authorization is enabled ](https://github.com/dell/csm/issues/1584)
- [#1589 - [BUG]: Automation for reverseproxy tls secret and  powermax-array-config does not present in E2E](https://github.com/dell/csm/issues/1589)
- [#1593 - [BUG]: Update the cert-manager version in Powermax Prerequisite](https://github.com/dell/csm/issues/1593)
- [#1638 - [BUG]: CSM Docs Multiple fixes for CSI-Powermax installation](https://github.com/dell/csm/issues/1638)
- [#1644 - [BUG]: Cannot create PowerMax clones](https://github.com/dell/csm/issues/1644)
- [#1650 - [BUG]: PowerMax - X_CSI_IG_MODIFY_HOSTNAME fails to rename a host with same name in different case](https://github.com/dell/csm/issues/1650)
- [#1663 - [BUG]: Pod filesystem not resized while volume gets successfully expanded](https://github.com/dell/csm/issues/1663)
- [#1667 - [BUG]: Labels versions and maintainer update for CSM images ](https://github.com/dell/csm/issues/1667)
- [#1634 - [BUG]: CSM PowerMax wrong error message](https://github.com/dell/csm/issues/1634)
- [#1514 - [BUG]: snapshot restore failed with Message = failed to get acl entries: Too many links](https://github.com/dell/csm/issues/1514)
- [#1620 - [BUG]: PowerScale - handle panic error in ParseNormalizedSnapshotID](https://github.com/dell/csm/issues/1620)
- [#1667 - [BUG]: Labels versions and maintainer update for CSM images ](https://github.com/dell/csm/issues/1667)
- [#1549 - [BUG]: The NVMeCommand constant needs to use full path](https://github.com/dell/csm/issues/1549)
- [#1582 - [BUG]: CSI-PowerStore Fails to Apply 'mountOptions' Passed in StorageClass](https://github.com/dell/csm/issues/1582)
- [#1586 - [BUG]: Snapshot from metro volume restore as non-metro even if metro storage class is chosen](https://github.com/dell/csm/issues/1586)
- [#1667 - [BUG]: Labels versions and maintainer update for CSM images ](https://github.com/dell/csm/issues/1667)
- [#1654 - [BUG]: Helm installation still check snapshot CRD even though snapshot enabled is set to false](https://github.com/dell/csm/issues/1654)
- [#1667 - [BUG]: Labels versions and maintainer update for CSM images ](https://github.com/dell/csm/issues/1667)
- [#1566 - [BUG]: Inconsistent naming convention of secret is misleading in Installation of PowerMax ](https://github.com/dell/csm/issues/1566)
- [#1567 - [BUG]: Mode is mentioned incorrectly in the configMap of PowerMax even when it is deployed as a sidecar ](https://github.com/dell/csm/issues/1567)
- [#1570 - [BUG]: Stale entries in CSM operator samples and helm-charts for PowerMax ](https://github.com/dell/csm/issues/1570)
- [#1574 - [BUG]: Operator offline bundle doesn't prepare registries correctly](https://github.com/dell/csm/issues/1574)
- [#1581 - [BUG]: Offline bundle doesn't include Authorization Server images](https://github.com/dell/csm/issues/1581)
- [#1585 - [BUG]: Stale entries in CSI PowerMax Samples of CSM operator ](https://github.com/dell/csm/issues/1585)
- [#1591 - [BUG]: Operator e2e scenario for powerflex driver with second set of alternate values is failing in OpenShift cluster](https://github.com/dell/csm/issues/1591)
- [#1594 - [BUG]: Remove extra fields from the driver specs when using minimal sample](https://github.com/dell/csm/issues/1594)
- [#1600 - [BUG]: Operator e2e scenario for powerscale driver with second set of alternate values is failing in OpenShift cluster](https://github.com/dell/csm/issues/1600)
- [#1601 - [BUG]: "make install" command is failing for csm-operator](https://github.com/dell/csm/issues/1601)
- [#1603 - [BUG]: CSM Operator Crashing](https://github.com/dell/csm/issues/1603)
- [#1604 - [BUG]: CSM Operator not deleting the deployment and daemon sets after deleting the CSM](https://github.com/dell/csm/issues/1604)
- [#1605 - [BUG]: Not able to create CSM using the minimal file, if the Operator deployed from the Operator Hub](https://github.com/dell/csm/issues/1605)
- [#1638 - [BUG]: CSM Docs Multiple fixes for CSI-Powermax installation](https://github.com/dell/csm/issues/1638)
- [#1642 - [BUG]: E2E and cert-csi tets are failing](https://github.com/dell/csm/issues/1642)
- [#1648 - [BUG]: CSM-Operator: E2E Tests are running with 1 replica count](https://github.com/dell/csm/issues/1648)
- [#1667 - [BUG]: Labels versions and maintainer update for CSM images ](https://github.com/dell/csm/issues/1667)
- [#1668 - [BUG]: CSM-Operator is reconciling non CSM pods](https://github.com/dell/csm/issues/1668)
- [#1633 - [BUG]: CSM deployment minimal file - pulling from quay after updating the image registry](https://github.com/dell/csm/issues/1633)
- [#1671 - [BUG]: Minimal CR for Powerflex is failing in Csm-operator](https://github.com/dell/csm/issues/1671)
- [#1782 - [BUG]: Pods Stuck in Terminating State After PowerFlex CSI Node Pod Restart When Deployments Share Same Node](https://github.com/dell/csm/issues/1782)

### Known Issues
| Issue | Workaround |
|-------|------------|
| When CSM Operator creates a deployment that includes secrets (e.g., application-mobility, observability, cert-manager, velero), these secrets are not deleted on uninstall and will be left behind. For example, the `karavi-topology-tls`, `otel-collector-tls`, and `cert-manager-webhook-ca` secrets will not be deleted. | This should not cause any issues on the system, but all secrets present on the cluster can be found with `kubectl get secrets -A`, and any unwanted secrets can be deleted with `kubectl delete secret -n <secret-namespace> <secret-name>`|
| In certain environments, users have encountered difficulties in installing drivers using the CSM Operator due to the 'OOM Killed' issue. This issue is attributed to the default resource requests and limits configured in the CSM Operator, which fail to meet the resource requirements of the user environments. OOM error occurs when a process in the container tries to consume more memory than the limit specified in resource configuration.| Before deploying the CSM Operator, it is crucial to adjust the memory and CPU requests and limits in the files [config/manager.yaml](https://github.com/dell/csm-operator/blob/main/config/manager/manager.yaml#L100), [deploy/operator.yaml](https://github.com/dell/csm-operator/blob/main/deploy/operator.yaml#L1330) to align with the user's environment requirements. If the containers running on the pod exceed the specified CPU and memory limits, the pod may get evicted. Currently CSM Operator do not support updating this configuration dynamically. CSM Operator needs to be redeployed for these updates to take effect in case it is already installed. Steps to manually update the resource configuration and then redeploy CSM Operator are available [here](https://dell.github.io/csm-docs/docs/deployment/csmoperator/#installation)|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.| Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100 |
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node. |
| sdc:3.6.0.6 is causing issues while installing the csi-powerflex driver on ubuntu,RHEL8.3 |  Workaround: <br /> Change the powerflexSdc to sdc:3.6 in values.yaml https://github.com/dell/csi-powerflex/blob/72b27acee7553006cc09df97f85405f58478d2e4/helm/csi-vxflexos/values.yaml#L13 <br /> |
| sdc:3.6.1 is causing issues while installing the csi-powerflex driver on ubuntu. |  Workaround: <br /> Change the powerflexSdc to sdc:3.6 in values.yaml https://github.com/dell/csi-powerflex/blob/72b27acee7553006cc09df97f85405f58478d2e4/helm/csi-vxflexos/values.yaml#L13 <br /> |
A CSI ephemeral pod may not get created in OpenShift 4.13 and fail with the error `"error when creating pod: the pod uses an inline volume provided by CSIDriver csi-vxflexos.dellemc.com, and the namespace has a pod security enforcement level that is lower than privileged."` | This issue occurs because OpenShift 4.13 introduced the CSI Volume Admission plugin to restrict the use of a CSI driver capable of provisioning CSI ephemeral volumes during pod admission. Therefore, an additional label `security.openshift.io/csi-ephemeral-volume-profile` in [csidriver.yaml](https://github.com/dell/helm-charts/blob/csi-vxflexos-2.10.0/charts/csi-vxflexos/templates/csidriver.yaml) file with the required security profile value should be provided. Follow [OpenShift 4.13 documentation for CSI Ephemeral Volumes](https://docs.openshift.com/container-platform/4.13/storage/container_storage_interface/ephemeral-storage-csi-inline.html) for more information. |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with kubernetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
| Resource quotas may not work properly with the CSI PowerFlex driver. PowerFlex is only able to assign storage in 8Gi chunks, so if a create volume call is made with a size not divisible by 8Gi, CSI-PowerFlex will round up to the next 8Gi boundary when it provisions storage -- however, the resource quota will not record this size but rather the original size in the create request. This means that, for example, if a 10Gi resource quota is set, and a user provisions 10 1Gi PVCs, 80Gi of storage will actually be allocated, which is well over the amount specified in the resource quota. | For now, users should only provision volumes in 8Gi-divisible chunks if they want to use resource quotas. |
| Unable to update Host: A problem occurred modifying the host resource | This issue occurs when the nodes do not have unique hostnames or when an IP address/FQDN with same sub-domains are used as hostnames. The workaround is to use unique hostnames or FQDN with unique sub-domains|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with kubernetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
| Automatic SRDF group creation is failing with "Unable to get Remote Port on SAN for Auto SRDF" for PowerMaxOS 10.1 arrays | Create the SRDF Group and add it to the storage class |
| [Node stage is failing with error "wwn for FC device not found"](https://github.com/dell/csm/issues/1070)| This is an intermittent issue, rebooting the node will resolve this issue |
| When the driver is installed using CSM Operator , few times, pods created using block volume are getting stuck in containercreating/terminating state or devices are not available inside the pod. | Update the daemonset with parameter `mountPropagation: "Bidirectional"` for volumedevices-path under volumeMounts section.|
| When running CSI-PowerMax with Replication in a multi-cluster configuration, the driver on the target cluster fails and the following error is seen in logs: `error="CSI reverseproxy service host or port not found, CSI reverseproxy not installed properly"` | The reverseproxy service needs to be created manually on the target cluster. Follow [the instructions here](docs/getting-started/installation/kubernetes/powermax/csmoperator/csm-modules/replication/#configuration-steps) to create it.|
| Storage capacity tracking does not return `MaximumVolumeSize` parameter. PowerScale is purely NFS based meaning it has no actual volumes. Therefore `MaximumVolumeSize` cannot be implemented if there is no volume creation.| CSI PowerScale 2.9.1 is compliant with CSI 1.6 specification since the field `MaximumVolumeSize` is optional.|
| If the length of the nodeID exceeds 128 characters, the driver fails to update the CSINode object and installation fails. This is due to a limitation set by CSI spec which doesn't allow nodeID to be greater than 128 characters. | The CSI PowerScale driver uses the hostname for building the nodeID which is set in the CSINode resource object, hence we recommend not having very long hostnames in order to avoid this issue. This current limitation of 128 characters is likely to be relaxed in future Kubernetes versions as per this issue in the community: https://github.com/kubernetes-sigs/gcp-compute-persistent-disk-csi-driver/issues/581 <br><br> **Note:** In kubernetes 1.22 this limit has been relaxed to 192 characters. |
| If some older NFS exports /terminated worker nodes still in NFS export client list, CSI driver tries to add a new worker node it fails (For RWX volume). | User need to manually clean the export client list from old entries to make successful addition of new worker nodes. |
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation. | Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100 |
| fsGroupPolicy may not work as expected without root privileges for NFS only<br/>https://github.com/kubernetes/examples/issues/260 | To get the desired behavior set "RootClientEnabled" = "true" in the storage class parameter |
| Driver logs shows "VendorVersion=2.3.0+dirty"| Update the driver to csi-powerscale 2.4.0 |  
| PowerScale 9.5.0, Driver installation fails with session based auth, "HTTP/1.1 401 Unauthorized" | Fix is available in PowerScale >= 9.5.0.4 |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with kubernetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation | Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100 |
| fsGroupPolicy may not work as expected without root privileges for NFS only https://github.com/kubernetes/examples/issues/260 | To get the desired behavior set "allowRoot: "true" in the storage class parameter |
| If the NVMeFC pod is not getting created and the host looses the ssh connection, causing the driver pods to go to error state | remove the nvme_tcp module from the host in case of NVMeFC connection |
| When a node goes down, the block volumes attached to the node cannot be attached to another node   | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down.  Now the volume can be attached to the new node. |
| When driver node pods enter CrashLoopBackOff and PVC remains in pending state with one of the following events:<br /> 1. failed to provision volume with StorageClass `<storage-class-name>`: error generating accessibility requirements: no available topology found <br /> 2. waiting for a volume to be created, either by external provisioner "csi-powerstore.dellemc.com" or manually created by system administrator.| Check whether all array details present in the secret file are valid and remove any invalid entries if present. <br/>Redeploy the driver. |
| If an ephemeral pod is not being created in OpenShift 4.13 and is failing with the error "error when creating pod: the pod uses an inline volume provided by CSIDriver csi-powerstore.dellemc.com, and the namespace has a pod security enforcement level that is lower than privileged."  | This issue occurs because OpenShift 4.13 introduced the CSI Volume Admission plugin to restrict the use of a CSI driver capable of provisioning CSI ephemeral volumes during pod admission https://docs.openshift.com/container-platform/4.13/storage/container_storage_interface/ephemeral-storage-csi-inline.html . Therefore, an additional label "security.openshift.io/csi-ephemeral-volume-profile" needs to be added to the CSIDriver object to support inline ephemeral volumes. |
| In OpenShift 4.13, the root user is not allowed to perform write operations on NFS shares, when root squashing is enabled. | The workaround for this issue is to disable root squashing by setting allowRoot: "true" in the NFS storage class. |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs, and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with Kubernetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
| If two separate networks are configured for ISCSI and NVMeTCP, the driver may encounter difficulty identifying the second network (e.g., NVMeTCP). | This is a known issue, and the workaround involves creating a single network on the array to serve both ISCSI and NVMeTCP purposes. |
| When a PV/PVC is deleted in Kubernetes, it will trigger the deletion of the underlying volume and snapshot on the array as a default behaviour. This can result in a situation where the VolumeSnapshot and VolumeSnapshotContent will still show "readyToUse: true", but leaves them unusable because it is no longer backed by underlying storage snapshot. This will not allow the creation of a PVC from snapshot and this could also lead to a data loss situations. | This is a known issue, and the workaround is use of **retain** policy on the various PV, VolumeSnapshot and VolumeSnapshotContent that you wish to use for cloning.  |
| Nodes not getting registered on Unity XT. | Creating wrapper around `hostname` command inside the node pod's driver container, that fails when `-I` flag is used. This will triggrer fallback behaviour in driver and should fix the issue. |
| Topology-related node labels are not removed automatically.  | Currently, when the driver is uninstalled, topology-related node labels are not getting removed automatically. There is an open issue in the Kubernetes to fix this. Until the fix is released, remove the labels manually after the driver un-installation using command **kubectl label node <node_name> <label1>- <label2>- ...** Example: **kubectl label node <hostname> csi-unity.dellemc.com/array123-iscsi-** Note: there must be - at the end of each label to remove it.|
| NFS Clone - Resize of the snapshot is not supported by Unity XT Platform, however, the user should never try to resize the cloned NFS volume.| Currently, when the driver takes a clone of NFS volume, it succeeds but if the user tries to resize the NFS volumesnapshot, the driver will throw an error.|
| Delete namespace that has PVCs and pods created with the driver. The External health monitor sidecar crashes as a result of this operation.| Deleting the namespace deletes the PVCs first and then removes the pods in the namespace. This brings a condition where pods exist without their PVCs and causes the external-health-monitor sidecar to crash. This is a known issue and has been reported at https://github.com/kubernetes-csi/external-health-monitor/issues/100|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the VolumeAttachment to the node that went down. <br /> Now the volume can be attached to the new node. |
| A CSI ephemeral pod may not get created in OpenShift 4.13 and fail with the error `"error when creating pod: the pod uses an inline volume provided by CSIDriver csi-unity.dellemc.com, and the namespace has a pod security enforcement level that is lower than privileged."` | This issue occurs because OpenShift 4.13 introduced the CSI Volume Admission plugin to restrict the use of a CSI driver capable of provisioning CSI ephemeral volumes during pod admission. Therefore, an additional label `security.openshift.io/csi-ephemeral-volume-profile` in [csidriver.yaml](https://github.com/dell/helm-charts/blob/csi-unity-2.8.0/charts/csi-unity/templates/csidriver.yaml) file with the required security profile value should be provided. Follow [OpenShift 4.13 documentation for CSI Ephemeral Volumes](https://docs.openshift.com/container-platform/4.13/storage/container_storage_interface/ephemeral-storage-csi-inline.html) for more information. |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with Kubernetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
| fsGroupPolicy may not work as expected without root privileges for NFS only [https://github.com/kubernetes/examples/issues/260](https://github.com/kubernetes/examples/issues/260) | To get the desired behavior set “RootClientEnabled” = “true” in the storage class parameter |
| Controller publish is taking too long to complete/ Health monitoring is causing Unity array to panic by opening multiple sessions/ There are error messages in the log `context deadline exceeded`, when health monitoring is enabled | Disable volume health monitoring on the node and keep it only at the controller level. Refer [here](https://dell.github.io/csm-docs/docs/csidriver/features/unity/#volume-health-monitoring) for more information about enabling/disabling volume health monitoring|                     

### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
- Auto SRDF group creation is currently not supported in PowerMaxOS 10.1 (6079) Arrays.
