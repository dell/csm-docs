---
title: "Release Notes"
linkTitle: "Release Notes"
no_list: true
weight: 20
Description: >
  Container Storage Modules release notes
---

## Notifications

 **General:**

> * <span><span/>{{< message text="8" >}}
> * <span><span/>{{< message text="7" >}}
> * <span><span/>{{< message text="1" >}}

**Deprecation:**

> * <span><span/>{{< message text="11" >}}
> * <span><span/>{{< message text="12" >}}
> * <span><span/>{{< message text="14" >}}
> * <span><span/>{{< message text="15" >}}
> * <span><span/>{{< message text="16" >}}

## Release Notes for v1.16.0

### New Features/Changes

- Enable NVMe/TCP Connectivity for PowerFlex without SDC Requirement
- Enable OIDC Support for PowerFlex
- Enable Multi-SG support for PowerMax 
- Supported SUSE storage certification process for CSI PowerMax, CSI PowerStore and CSI PowerFlex
- Optimize volume provisioning and publishing in CSI driver for PowerMax Unisphere 10.3
- Support CSM upgrade via CSM operator using CSM Version
- Support PowerStore Metro Non-Uniform Host Connectivity
- Support PowerStore High Availability and degraded modes for Metro volumes during Site Failure
- Enhance PowerStore Resiliency deferred operations during Site Failure for Metro Configurations
- Enabled scalable Kubernetes system metrics collection for observability and visualization across PowerFlex, PowerMax, PowerStore, and PowerScale
- Enabled scalable KubeVirt VM metrics collection for observability and visualization across PowerStore, PowerMax, and PowerFlex
- Synchronized CSM Operator with oc-mirror
- Unified Logging Framework for CSI drivers (and future CSM modules)
- CSI PowerStore Async File Replication
- Support for PowerFlex v5.0 in CSM

### Fixed Issues

- eth_port missing in gopowerstore endpoint
- No lastSuccessConfiguration for Auth CR
- Offline bundle testing fails when the ConfigMap includes sidecar images
- Podmon aborts pod cleanup due to context cancel in ValidateVolumeHostConnectivity for metro volumes
- Podmon taints a node if it has lost connectivity to the default array even if the node was not supposed to have connectivity to that array(Non-uniform)
- Unexpected Reference in Logs to csm-application-mobility-controller and velero-plugin Components
- Idempotency failure in CSI PowerMax - Create Volume with Metro
- CSI-PowerStore doesn't connect to multiple iSCSI networks
- CSI Volume Deletion Bottleneck – SG Removal Delay
- CSI node pod crashes while unmounting PowerStore LUNs
- CSI PowerStore NVMe doesn't work with multiple VLANs
- Reverse proxy sometimes does not log request ID
- Pod Recovery by CSM Resiliency fails with panic in CSI PowerMax controller during node failure
- Performance Metrics API returns empty results when the comma separated StorageGroupList field is included in the request payload - PowerMax.
- CSI PowerMax fails to switch to embedded Unisphere during Primary Unisphere failure
- NodeUnstageVolume reports success even though flushing the volume fails - Unity
- NodeUnstageVolume reports success even though flushing the volume fails - PowerStore
- During StageVolume for a FC device the waitForDeviceWWN() fails to rescan all the SD paths on seeing stale wwid - PowerMax
- CSI-PowerMax driver fails to create replicated volume when no SRDF group exists
- Inconsistent parameters in observability module in Helm and operator
- Update gopowerstore api client default timeout type to consider it as seconds
- CSI PowerStore driver does not add topology keys for FC protocol when the first FC initiator has no active session
- CSM Replication PowerScale - failback operation do not swap PVC
- PowerStore Metrics Service: Timeout failures when fetching performance metrics
- Topology keys disappear after restart of CSI node pod in CSI-PowerStore driver for FC protocol
- CSI PowerMax Driver: Storage pool metrics are not collected in a multi availability zone setup
- CSM Observability integration PowerStore/PowerMax ServiceMonitor
- PowerMax driver does not round off the virtualization filesystem correctly
- NFS volume staging and unstaging were broken.
- Modify an NFS export for a NAS server’s file system - repeated Failed Messages
- Fix NFS Volume access logic to enforce only user‑specified external access
- Remove gorilla/mux dependency from unit tests in observability module
- Annotations missed as part of Operator version update workflow
- Migrate deprecated github.com/golang/mock to go.uber.org/mock
- CSI PowerStore : NodeUnstageVolume is failing for NFS volumes
- Unity Nightly fails on 4.20.8 OCP E2E tests
- Unity OCP E2E - Fails on OCP 4.20.8
- PowerMax driver is not rounding off the virtualization filesystem perfectly
- Default replication sidecar version is missing in version-values.yaml
- Replication - Remote PV does not get MountOptions from SC
- PowerStore Prepare Storage stage logs is having error but wrongly showing as passed
- NFS volume Staging and Unstaging were broken.
- Modify an NFS export for a NAS server’s file system” Repeated Failed Messages

### Known Issues

| Issue | Workaround |
|-------|------------|
| <div style="text-align: left"> Installing CSM Operator version `1.10.0` from the OpenShift Web Console may result in the new Operator instance becoming stuck in the `upgradePending` state. This prevents successful deployment. |  <div style="text-align: left"> Uninstall the affected Operator instance and reinstall it to restore normal operation. |
| <div style="text-align: left"> When CSM Operator creates a deployment that includes secrets (e.g., observability, cert-manager, velero), these secrets are not deleted on uninstall and will be left behind. For example, the `karavi-topology-tls`, `otel-collector-tls`, and `cert-manager-webhook-ca` secrets will not be deleted. |  <div style="text-align: left"> This should not cause any issues on the system, but all secrets present on the cluster can be found with `kubectl get secrets -A`, and any unwanted secrets can be deleted with `kubectl delete secret -n <secret-namespace> <secret-name>`|
| <div style="text-align: left"> In certain environments, users have encountered difficulties in installing drivers using the CSM Operator due to the 'OOM Killed' issue. This issue is attributed to the default resource requests and limits configured in the CSM Operator, which fail to meet the resource requirements of the user environments. OOM error occurs when a process in the container tries to consume more memory than the limit specified in resource configuration.| <div style="text-align: left"> Before deploying the CSM Operator, it is crucial to adjust the memory and CPU requests and limits in the files [config/manager.yaml](https://github.com/dell/csm-operator/blob/main/config/manager/manager.yaml#L100), [deploy/operator.yaml](https://github.com/dell/csm-operator/blob/main/deploy/operator.yaml#L1330) to align with the user's environment requirements. If the containers running on the pod exceed the specified CPU and memory limits, the pod may get evicted. Currently CSM Operator does not support updating this configuration dynamically. CSM Operator needs to be redeployed for these updates to take effect in case it is already installed. Steps to manually update the resource configuration and then redeploy CSM Operator are available [here](../../docs/getting-started/installation/operator/operatorinstallation_kubernetes#installation)|
|  <div style="text-align: left">  sdc:3.6.x/3.6.x.x is causing issues while installing the csi-powerflex driver on ubuntu/RHEL. |  <div style="text-align: left">   Workaround: <br /> Change the powerflexSdc to sdc:3.6 in `values.yaml` <br /> |
|  <div style="text-align: left">   <div style="text-align: left">  If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. |  <div style="text-align: left">  It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with kubernetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
|  <div style="text-align: left">  Resource quotas may not work properly with the CSI PowerFlex driver. PowerFlex is only able to assign storage in 8Gi chunks, so if a create volume call is made with a size not divisible by 8Gi, CSI-PowerFlex will round up to the next 8Gi boundary when it provisions storage -- however, the resource quota will not record this size but rather the original size in the create request. This means that, for example, if a 10Gi resource quota is set, and a user provisions 10 1Gi PVCs, 80Gi of storage will actually be allocated, which is well over the amount specified in the resource quota. |  <div style="text-align: left">  For now, users should only provision volumes in 8Gi-divisible chunks if they want to use resource quotas. |
|  <div style="text-align: left">  Unable to update Host: A problem occurred modifying the host resource |  <div style="text-align: left">  This issue occurs when the nodes do not have unique hostnames or when an IP address/FQDN with same sub-domains are used as hostnames. The workaround is to use unique hostnames or FQDN with unique sub-domains|
|  <div style="text-align: left">  Automatic SRDF group creation is failing with "Unable to get Remote Port on SAN for Auto SRDF" for PowerMaxOS 10.1 arrays |  <div style="text-align: left">  Create the SRDF Group and add it to the storage class |
|  <div style="text-align: left">  When the driver is installed using CSM Operator , a few times, pods created using block volume are getting stuck in containercreating/terminating state or devices are not available inside the pod. |  <div style="text-align: left">  Update the daemonset with parameter `mountPropagation: "Bidirectional"` for volumedevices-path under volumeMounts section.|
|  <div style="text-align: left">  When running CSI-PowerMax with Replication in a multi-cluster configuration, the driver on the target cluster fails and the following error is seen in logs: `error="CSI reverseproxy service host or port not found, CSI reverseproxy not installed properly"` |  <div style="text-align: left">  The reverseproxy service needs to be created manually on the target cluster.|
|  <div style="text-align: left">  Storage capacity tracking does not return `MaximumVolumeSize` parameter. PowerScale is purely NFS based meaning it has no actual volumes. Therefore `MaximumVolumeSize` cannot be implemented if there is no volume creation.|  <div style="text-align: left">  CSI PowerScale 2.9.1 is compliant with CSI 1.6 specification since the field `MaximumVolumeSize` is optional.|
|  <div style="text-align: left">  If some older NFS exports /terminated worker nodes still in NFS export client list, CSI driver tries to add a new worker node it fails (For RWX volume). |  <div style="text-align: left">  User need to manually clean the export client list from old entries to make successful addition of new worker nodes. |
|  <div style="text-align: left">  fsGroupPolicy may not work as expected without root privileges for NFS only<br/>https://github.com/kubernetes/examples/issues/260 |  <div style="text-align: left">  To get the desired behavior set "RootClientEnabled" = "true" in the storage class parameter |
|  <div style="text-align: left">  PowerScale 9.5.0, Driver installation fails with session based auth, "HTTP/1.1 401 Unauthorized" |  <div style="text-align: left">  Fix is available in PowerScale >= 9.5.0.4 |
|  <div style="text-align: left">  If the NVMeFC pod is not getting created and the host loses the ssh connection, causing the driver pods to go to error state |  <div style="text-align: left">  remove the nvme_tcp module from the host in case of NVMeFC connection |
|  <div style="text-align: left">  When a node goes down, the block volumes attached to the node cannot be attached to another node   |  <div style="text-align: left">  This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down.  Now the volume can be attached to the new node. |
|  <div style="text-align: left">  When driver node pods enter CrashLoopBackOff and PVC remains in pending state with one of the following events:<br /> 1. failed to provision volume with StorageClass `<storage-class-name>`: error generating accessibility requirements: no available topology found <br /> 2. waiting for a volume to be created, either by external provisioner "csi-powerstore.dellemc.com" or manually created by system administrator.|  <div style="text-align: left">  Check whether all array details present in the secret file are valid and remove any invalid entries if present. <br/>Redeploy the driver. |
|  <div style="text-align: left">  In OpenShift 4.13, the root user is not allowed to perform write operations on NFS shares, when root squashing is enabled. |  <div style="text-align: left">  The workaround for this issue is to disable root squashing by setting allowRoot: "true" in the NFS storage class. |
|  <div style="text-align: left">  If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs, and the pending pods will be scheduled to nodes when the driver pods are restarted. |  <div style="text-align: left">  It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with Kubernetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
|  <div style="text-align: left">  If two separate networks are configured for ISCSI and NVMeTCP, the driver may encounter difficulty identifying the second network (e.g., NVMeTCP). |  <div style="text-align: left">  This is a known issue, and the workaround involves creating a single network on the array to serve both ISCSI and NVMeTCP purposes. |
|  <div style="text-align: left">  When a PV/PVC is deleted in Kubernetes, it will trigger the deletion of the underlying volume and snapshot on the array as a default behaviour. This can result in a situation where the VolumeSnapshot and VolumeSnapshotContent will still show "readyToUse: true", but leaves them unusable because it is no longer backed by underlying storage snapshot. This will not allow the creation of a PVC from snapshot and this could also lead to a data loss situations. |  <div style="text-align: left">  This is a known issue, and the workaround is use of **retain** policy on the various PV, VolumeSnapshot and VolumeSnapshotContent that you wish to use for cloning.  |
|  <div style="text-align: left">  Nodes not getting registered on Unity XT. |  <div style="text-align: left">  Creating wrapper around `hostname` command inside the node pod's driver container fails when `-I` flag is used. This will trigger fallback behaviour in driver and should fix the issue. |
|  <div style="text-align: left">  Topology-related node labels are not removed automatically.  |  <div style="text-align: left">  Currently, when the driver is uninstalled, topology-related node labels are not getting removed automatically. There is an open issue in the Kubernetes to fix this. Until the fix is released, remove the labels manually after the driver un-installation using command **kubectl label node <node_name> <label1>- <label2>- ...** Example: **kubectl label node <hostname> csi-unity.dellemc.com/array123-iscsi-** Note: there must be - at the end of each label to remove it.|
|  <div style="text-align: left">  NFS Clone - Resize of the snapshot is not supported by Unity XT Platform, however, the user should never try to resize the cloned NFS volume.|  <div style="text-align: left">  Currently, when the driver takes a clone of NFS volume, it succeeds but if the user tries to resize the NFS volumesnapshot, the driver will throw an error.|
| <div style="text-align: left"> A CSI ephemeral pod may not get created starting OpenShift 4.13 and fail with the error `"error when creating pod: the pod uses an inline volume provided by CSIDriver csi-unity.dellemc.com, and the namespace has a pod security enforcement level that is lower than privileged."` |  <div style="text-align: left">  This issue occurs because OpenShift 4.13 introduced the CSI Volume Admission plugin to restrict the use of a CSI driver capable of provisioning CSI ephemeral volumes during pod admission. Therefore, an additional label `security.openshift.io/csi-ephemeral-volume-profile` in `csidriver.yaml` file with the required security profile value should be provided. |
|  <div style="text-align: left">  Controller publish is taking too long to complete/ Health monitoring is causing Unity array to panic by opening multiple sessions/ There are error messages in the log `context deadline exceeded`, when health monitoring is enabled |  <div style="text-align: left">  Disable volume health monitoring on the node and keep it only at the controller level.|
