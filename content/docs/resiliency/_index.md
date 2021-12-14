---
title: "Resiliency"
linkTitle: "Resiliency"
weight: 6
Description: >
  Dell EMC Container Storage Modules (CSM) for Resiliency
---

[Container Storage Modules](https://github.com/dell/csm) (CSM) for Resiliency is part of the  open-source suite of Kubernetes storage enablers for Dell EMC products.

User applications can have problems if you want their Pods to be resilient to node failure. This is especially true of those deployed with StatefulSets that use PersistentVolumeClaims. Kubernetes guarantees that there will never be two copies of the same StatefulSet Pod running at the same time and accessing storage. Therefore, it does not clean up StatefulSet Pods if the node executing them fails.
 
For the complete discussion and rationale, go to https://github.com/kubernetes/community and search for the pod-safety.md file (path: contributors/design-proposals/storage/pod-safety.md).
For more background on the forced deletion of Pods in a StatefulSet, please visit [Force Delete StatefulSet Pods](https://kubernetes.io/docs/tasks/run-application/force-delete-stateful-set-pod/#:~:text=In%20normal%20operation%20of%20a,1%20are%20alive%20and%20ready).

## CSM for Resiliency High-Level Description

CSM for Resiliency is designed to make Kubernetes Applications, including those that utilize persistent storage, more resilient to various failures. The first component of the Resiliency module is a pod monitor that is specifically designed to protect stateful applications from various failures. It is not a standalone application, but rather is deployed as a _sidecar_ to CSI (Container Storage Interface) drivers, in both the driver's controller pods and the driver's node pods. Deploying CSM for Resiliency as a sidecar allows it to make direct requests to the driver through the Unix domain socket that Kubernetes sidecars use to make CSI requests.

Some of the methods CSM for Resiliency invokes in the driver are standard CSI methods, such as NodeUnpublishVolume, NodeUnstageVolume, and ControllerUnpublishVolume. CSM for Resiliency also uses proprietary calls that are not part of the standard CSI specification. Currently, there is only one, ValidateVolumeHostConnectivity that returns information on whether a host is connected to the storage system and/or whether any I/O activity has happened in the recent past from a list of specified volumes. This allows CSM for Resiliency to make more accurate determinations about the state of the system and its persistent volumes.

Accordingly, CSM for Resiliency is adapted to and qualified with each CSI driver it is to be used with. Different storage systems have different nuances and characteristics that CSM for Resiliency must take into account.

## CSM for Resiliency Capabilities

CSM for Resiliency provides the following capabilities:

{{<table "table table-striped table-bordered table-sm">}}
| Capability | PowerScale | Unity | PowerStore | PowerFlex | PowerMax |
| - | :-: | :-: | :-: | :-: | :-: |
| Detect pod failures for the following failure types - Node failure, K8S Control Plane Network failure, Array I/O Network failure | no  | yes | no | yes | no |
| Cleanup pod artifacts from failed nodes | no |  yes | no | yes | no |
| Revoke PV access from failed nodes | no |  yes | no | yes | no |
{{</table>}}

## Supported Operating Systems/Container Orchestrator Platforms

{{<table "table table-striped table-bordered table-sm">}}
| COP/OS | Supported Versions |
|-|-|
| Kubernetes    | 1.21, 1.22, 1.23 |
| Red Hat OpenShift | 4.8, 4.9 |
| RHEL          |     7.x, 8.x      |
| CentOS        |     7.8, 7.9     |
{{</table>}}

## Supported Storage Platforms

{{<table "table table-striped table-bordered table-sm">}}
|               | PowerFlex | Unity |
|---------------|:-------------------:|:----------------:|
| Storage Array | 3.5.x, 3.6.x | 5.0.5, 5.0.6, 5.0.7, 5.1.0 |
{{</table>}}

## Supported CSI Drivers

CSM for Authorization supports the following CSI drivers and versions.
{{<table "table table-striped table-bordered table-sm">}}
| Storage Array | CSI Driver | Supported Versions |
| ------------- | ---------- | ------------------ |
| CSI Driver for Dell EMC PowerFlex | [csi-powerflex](https://github.com/dell/csi-powerflex) | v2.0,v2.1 |
| CSI Driver for Dell EMC Unity | [csi-unity](https://github.com/dell/csi-unity) | v2.0,v2.1 |
{{</table>}}

### PowerFlex Support

PowerFlex is a highly scalable array that is very well suited to Kubernetes deployments. The CSM for Resiliency support for PowerFlex leverages the following PowerFlex features:

* Very quick detection of Array I/O Network Connectivity status changes (generally takes 1-2 seconds for the array to detect changes)
* A robust mechanism if Nodes are doing I/O to volumes (sampled over a 5-second period).
* Low latency REST API supports fast CSI provisioning and de-provisioning operations.
* A proprietary network protocol provided by the SDC component that can run over the same IP interface as the K8S control plane or over a separate IP interface for Array I/O.

### Unity Support

Dell EMC Unity is targeted for midsized deployments, remote or branch offices, and cost-sensitive mixed workloads. Unity systems are designed for all-Flash, deliver the best value in the market, and are available in purpose-built (all Flash or hybrid Flash), converged deployment options (through VxBlock), and software-defined virtual edition. 

* Unity (purpose-built): A modern midrange storage solution, engineered from the groundup to meet market demands for Flash, affordability and incredible simplicity. The Unity Family is available in 12 All Flash models and 12 Hybrid models.
* VxBlock (converged): Unity storage options are also available in Dell EMC VxBlock System 1000.
* UnityVSA (virtual): The Unity Virtual Storage Appliance (VSA) allows the advanced unified storage and data management features of the Unity family to be easily deployed on VMware ESXi servers, for a ‘software defined’ approach. UnityVSA is available in two editions:
  * Community Edition is a free downloadable 4 TB solution recommended for nonproduction use.
  * Professional Edition is a licensed subscription-based offering available at capacity levels of 10 TB, 25 TB, and 50 TB. The subscription includes access to online support resources, EMC Secure Remote Services (ESRS), and on-call software- and systems-related support.

All three deployment options, i.e. Unity, UnityVSA, and Unity-based VxBlock, enjoy one architecture, one interface with consistent features and rich data services.

## Limitations and Exclusions

This file contains information on Limitations and Exclusions that users should be aware of. Additionally, there are driver specific limitations and exclusions that may be called out in the [Deploying CSM for Resiliency](deployment) page.

### Supported and Tested Operating Modes

The following provisioning types are supported and have been tested:

* Dynamic PVC/PVs of accessModes "ReadWriteOnce" and volumeMode "FileSystem".
* Dynamic PVC/PVs of accessModes "ReadWriteOnce" and volumeMode "Block".
* Use of the above volumes with Pods created by StatefulSets.
* Up to 12 or so protected pods on a given node.
* Failing up to 3 nodes at a time in 9 worker node clusters, or failing 1 node at a time in smaller clusters. Application recovery times are dependent on the number of pods that need to be moved as a result of the failure. See the section on "Testing and Performance" for some of the details.

### Not Tested But Assumed to Work

* Deployments with the above volume types, provided two pods from the same deployment do not reside on the same node. At the current time anti-affinity rules should be used to guarantee no two pods accessing the same volumes are scheduled to the same node.
* Multi-array support 

### Not Yet Tested or Supported

* Pods that use persistent volumes from multiple CSI drivers. This _cannot_ be supported because multiple controller-podmons (one for each driver type) would be trying to manage the failover with conflicting actions.

* ReadWriteMany volumes. This may have issues if a node has multiple pods accessing the same volumes. In any case once pod cleanup fences the volumes on a node, they will no longer be available to any pods using those volumes on that node. We will endeavor to support this in the future.

* Multiple instances of the same driver type (for example two CSI driver for Dell EMC PowerFlex deployments.)

## Deploying and Managing Applications Protected by CSM for Resiliency

 The first thing to remember about _CSM for Resiliency_ is that it only takes action on pods configured with the designated label. Both the key and the value have to match what is in the podmon helm configuration. CSM for Resiliency emits a log message at startup with the label key and value it is using to monitor pods:

 ```
 labelSelector: {map[podmon.dellemc.com/driver:csi-vxflexos]
 ```
 The above message indicates the key is: podmon.dellemc.com/driver and the label value is csi-vxflexos. To search for the pods that would be monitored, try this:
 ```
[root@lglbx209 podmontest]# kubectl get pods -A -l podmon.dellemc.com/driver=csi-vxflexos
NAMESPACE   NAME           READY   STATUS    RESTARTS   AGE
pmtu1       podmontest-0   1/1     Running   0          3m7s
pmtu2       podmontest-0   1/1     Running   0          3m8s
pmtu3       podmontest-0   1/1     Running   0          3m6s
 ```

 If CSM for Resiliency detects a problem with a pod caused by a node or other failure that it can initiate remediation for, it will add an event to that pod's events:
 ```
 kubectl get events -n pmtu1
 ...
 61s         Warning   NodeFailure              pod/podmontest-0              podmon cleaning pod [7520ba2a-cec5-4dff-8537-20c9bdafbe26 node.example.com] with force delete
...
 ```

 CSM for Resiliency may also generate events if it is unable to cleanup a pod for some reason. For example, it may not clean up a pod because the pod is still doing I/O to the array.

 #### Important
 Before putting an application into production that relies on CSM for Resiliency monitoring, it is important to do a few test failovers first. To do this take the node that is running the pod offline for at least 2-3 minutes. Verify that there is an event message similar to the one above is logged, and that the pod recovers and restarts normally with no loss of data. (Note that if the node is running many CSM for Resiliency protected pods, the node may need to be down longer for CSM for Resiliency to have time to evacuate all the protected pods.)

 ### Application Recommendations

 1. It is recommended that pods that will be monitored by CSM for Resiliency be configured to exit if they receive any I/O errors. That should help achieve the recovery as quickly as possible.

 2. CSM for Resiliency does not directly monitor application health. However, if standard Kubernetes health checks are configured, that may help reduce pod recovery time in the event of node failure, as CSM for Resiliency should receive an event that the application is Not Ready. Note that a Not Ready pod is not sufficient to trigger CSM for Resiliency action unless there is also some condition indicating a Node failure or problem, such as the Node is tainted, or the array has lost connectivity to the node.

 3. As noted previously in the Limitations and Exclusions section, CSM for Resiliency has not yet been verified to work with ReadWriteMany or ReadOnlyMany volumes. Also, it has not been verified to work with pod controllers other than StatefulSet.

## Recovering From Failures

Normally CSM for Resiliency should be able to move pods that have been impacted by Node Failures to a healthy node. After the failed nodes have come back online, CSM for Resiliency cleans them up (especially any potential zombie pods) and then automatically removes the CSM for Resiliency node taint that prevents pods from being scheduled to the failed node(s). There are a few cases where this cannot be fully automated and operator intervention is required, including:

1. CSM for Resiliency expects that when a node failure occurs, all CSM for Resiliency labeled pods are evacuated and rescheduled on other nodes. This process may not complete however if the node comes back online before CSM for Resiliency has had time to evacuate all the labeled pods. The remaining pods may not restart correctly, going to "Error" or "CrashLoopBackoff". We are considering some possible remediation for this condition but have not implemented them yet.

    If this happens, try deleting the pod with "kubectl delete pod ...". In our experience this normally will cause the pod to be restarted and transition to the "Running" state.

2. Podmon-node is responsible for cleaning up failed nodes after the nodes' communication has been restored. The algorithm checks to see that all the monitored pods have terminated and their volumes and mounts have been cleaned up.

    If some of the monitored pods are still executing, node-podmon will emit the following log message at the end of a cleanup cycle (and retry the cleanup after a delay):

    ```
    pods skipped for cleanup because still present: <pod-list>
    ```
    If this happens, __DO NOT__ manually remove the CSM for Resiliency node taint. Doing so could possibly cause data corruption if volumes were not cleaned up, and a pod using those volumes was subsequently scheduled to that node.

    The correct course of action in this case is to reboot the failed node(s) that have not removed their taints in a reasonable time (5-10 minutes after the node is online again.) The operator can delay executing this reboot until it is convenient, but new pods will not be scheduled to it in the interim. This reboot will cancel any potential zombie pods. After the reboot, node-podmon should automatically remove the node taint after a short time.

## Testing Methodology and Results

A three tier testing methodology is used for CSM for Resiliency:

1. Unit testing with high coverage (>90% statement) tests the program logic and is especially used to test the error paths by injecting faults.
2. An integration test describes test scenarios in Gherkin that sets up specific testing scenarios executed against a Kubernetes test cluster. The tests use ranges for many of the parameters to add an element of "chaos testing".
3. Script based testing supports longevity testing in a Kubernetes cluster. For example, one test repeatedly fails three different lists of nodes in succession and is used to fail 1/3 of the cluster's worker nodes on a cyclic basis and repeat indefinitely. This test collect statistics on length of time for pod evacuation, pod recovery, and node cleanup.