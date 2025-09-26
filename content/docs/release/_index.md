---
title: "Release Notes"
linkTitle: "Release Notes"
no_list: true
weight: 20
Description: >
  Container Storage Modules release notes
---

## Notifications

<div style="text-align: left;">
  
  <h3 >🔒<strong>Important Notice</strong></h3>
  <hr>
  <p>
  Starting with the release of <strong>Container Storage Modules v1.16.0</strong> will no longer be maintained as an open source project. Future development will continue under a closed source model. This change reflects our commitment to delivering even greater value to our customers by enabling faster innovation and more deeply integrated features with the Dell storage portfolio.
  </p>
  <p>For existing customers using Dell’s Container Storage Modules, you will continue to receive:</p>
  <ul>
    <li><strong>Ongoing Support &amp; Community Engagement</strong><br>
        You will continue to receive high-quality support through Dell Support and our community channels. Your experience of engaging with the Dell community remains unchanged.
    </li>
    <li><strong>Streamlined Deployment &amp; Updates</strong><br>
        Deployment and update processes will remain consistent, ensuring a smooth and familiar experience.
    </li>
    <li><strong>Access to Documentation &amp; Resources</strong><br>
        All documentation and related materials will remain publicly accessible, providing transparency and technical guidance.
    </li>
    <li><strong>Continued Access to Current Open Source Version</strong><br>
        The current open-source version will remain available under its existing license for those who rely on it.
    </li>
  </ul>

  <p>
  Moving to a closed source model allows Dell’s development team to accelerate feature delivery and enhance integration across our Enterprise Kubernetes Storage solutions, ultimately providing a more seamless and robust experience.
  </p>

  <p>
  We deeply appreciate the contributions of the open source community and remain committed to supporting our customers through this transition.
  </p>

  <p>
  For questions or access requests, please contact the maintainers via 
  <a href="https://www.dell.com/support/kbdoc/en-in/000188046/container-storage-interface-csi-drivers-and-container-storage-modules-csm-how-to-get-support" target="_blank">Dell Support</a>.
    <hr>
</div> 

<br>  

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

## Release Notes for v1.15.0

### New Features/Changes

- [#1468 - [FEATURE]: Support K8s secrets as credential store in CSM Authorization Proxy v2](https://github.com/dell/csm/issues/1468)
- [#1947 - [FEATURE]: Authorization support for PowerStore](https://github.com/dell/csm/issues/1947)
- [#1954 - [FEATURE]: Observability enhancements to prevent hitting the max login limit in PowerFlex](https://github.com/dell/csm/issues/1954)
- [#1961 - [FEATURE]: Support Resiliency and Metro - Node failure.](https://github.com/dell/csm/issues/1961)
- [#1962 - [FEATURE]: Deliver restricted SDC access mode support for PowerFlex](https://github.com/dell/csm/issues/1962)
- [#1988 - [FEATURE]: Embed topology metrics for each storage platform into the storage specific metrics service for Observability](https://github.com/dell/csm/issues/1988)
- [#2001 - [FEATURE]: CSM support for Kubernetes 1.34](https://github.com/dell/csm/issues/2001)
- [#2023-  [FEATURE]: CSM Operator support Observability deployments for PowerStore](https://github.com/dell/csm/issues/2023)
- [#2024-  [FEATURE]: CSM operator supports replication deployment for PowerStore](https://github.com/dell/csm/issues/2024)

### Fixed Issues

- [#1898 - [BUG]: Incorrect Metro Architecture Diagram Used for PowerStore in Replication](https://github.com/dell/csm/issues/1898)
- [#1899 - [BUG]: Fix NFS Idempotent CreateVolume Request in Driver](https://github.com/dell/csm/issues/1899)
- [#1910 - [BUG]: CSM PowerMax is intermittently left in a failed state](https://github.com/dell/csm/issues/1910)
- [#1911 - [BUG]: Missing skipCertificateValidation Support in PowerStore CSI Driver](https://github.com/dell/csm/issues/1911)
- [#1917 - [BUG]: Not able to pull the images for Offline installation for karavi-observability](https://github.com/dell/csm/issues/1917)
- [#1920 - [BUG]: PowerScale Snapshots of volumes with a prefix different to that of the X_CSI_VOL_PREFIX fail in v2.14](https://github.com/dell/csm/issues/1920)
- [#1924 - [BUG]: After failover with PVC swap, the initial PV does not have a reserved/reserved claim](https://github.com/dell/csm/issues/1924)
- [#1926 - [BUG]: Unity CSI Driver Fails OCP End to End Intermittently](https://github.com/dell/csm/issues/1926)
- [#1930 - [BUG]: Powerstore has unnecessary sharedNFS related codes that affects performance.](https://github.com/dell/csm/issues/1930)
- [#1932 - [BUG]: powerflex driver's replication does not search for correct volume name when name + prefix > 31 chars](https://github.com/dell/csm/issues/1932)
- [#1936 - [BUG]: CSM-Operator samples under ocp folder for PowerFlex is pointing to old sha id for SDC image](https://github.com/dell/csm/issues/1936)
- [#1937 - [BUG]: Snapshot class mentioned in documentation fails](https://github.com/dell/csm/issues/1937)
- [#1938 - [BUG]: Broken referencelink on Support Matrix](https://github.com/dell/csm/issues/1938)
- [#1943 - [BUG]: CSM Authorization: Proxy server deployment is failing](https://github.com/dell/csm/issues/1943)
- [#1949 - [BUG]: Duplicate entries in Release notes](https://github.com/dell/csm/issues/1949)
- [#1951 - [BUG]: Repctl Failover Documentation is Unclear](https://github.com/dell/csm/issues/1951)
- [#1952 - [BUG]: replication missing permission in operator](https://github.com/dell/csm/issues/1952)
- [#1955 - [BUG]: Incorrect secret name mentioned for PowerScale installation using operator in OCP environment in CSM Docs](https://github.com/dell/csm/issues/1955)
- [#1959 - [BUG]: Operator does not apply spec.driver.common.envs to driver node](https://github.com/dell/csm/issues/1959)
- [#1960 - [BUG]: Formatting is broken in documentation for night mode](https://github.com/dell/csm/issues/1960)
- [#1964 - [BUG]: CSI PowerFlex driver panics during CreateVolume()](https://github.com/dell/csm/issues/1964)
- [#1969 - [BUG]: node driver crashed on unlocking an unlocked mutex](https://github.com/dell/csm/issues/1969)
- [#1970 - [BUG]: PowerMax client is using PowerFlex methods in CSM authorization](https://github.com/dell/csm/issues/1970)
- [#1972 - [BUG]: Authorization Installation clarity](https://github.com/dell/csm/issues/1972)
- [#1974 - [BUG]: Host registration is missing when using metro topology label](https://github.com/dell/csm/issues/1974)
- [#1986 - [BUG]: Operator fails to install PowerStore](https://github.com/dell/csm/issues/1986)
- [#1997 - [BUG]: broken links to csm-operator samples in concepts section](https://github.com/dell/csm/issues/1997)
- [#1998 - [BUG]: Powerstore NFS volume usage does not report stats when Volume health Monitoring is enabled](https://github.com/dell/csm/issues/1998)
- [#1999 - [BUG]: Node preferred added for testing resiliency for metro is causing regression in normal set up](https://github.com/dell/csm/issues/1999)
- [#2000 - [BUG]: CSI-PowerScale does not log CSI REQ/REP since 2.14](https://github.com/dell/csm/issues/2000)
- [#2002 - [BUG]: Issue with expansion for PowerStore metro volume](https://github.com/dell/csm/issues/2002)
- [#2003 - [BUG]: invalid topology labels due to delays in initiators login state report from Unity array](https://github.com/dell/csm/issues/2003)
- [#2004 - [BUG]: op e2e tests fail for PowerMax](https://github.com/dell/csm/issues/2004)
- [#2011 - [BUG]: CSI PowerScale is not able to find the default cluster and failing with error "isilon-node-fntjz"](https://github.com/dell/csm/issues/2011)
- [#2017 - [BUG]: ControllerUnpublish fails to retrieve PV due to tenant prefix mismatch with Auth v2 enabled for powerscale](https://github.com/dell/csm/issues/2017)

### Known Issues

| Issue | Workaround |
|-------|------------|
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