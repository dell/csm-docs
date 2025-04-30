---
title: "Resiliency"
linkTitle: "Resiliency"
no_list: true 
weight: 6
Description: >
  Container Storage Modules (CSM) for Resiliency
---

[Container Storage Modules](https://github.com/dell/csm) for Resiliency is part of the  open-source suite of Kubernetes storage enablers for Dell products.

User applications can have problems if you want their Pods to be resilient to node failure. This is especially true of those deployed with StatefulSets that use PersistentVolumeClaims. Kubernetes guarantees that there will never be two copies of the same StatefulSet Pod running at the same time and accessing storage. Therefore, it does not clean up StatefulSet Pods if the node executing them fails.
 
For the complete discussion and rationale, you can read the [pod-safety design proposal](https://github.com/kubernetes/design-proposals-archive/blob/main/storage/pod-safety.md).

For more background on the forced deletion of Pods in a StatefulSet, please visit [Force Delete StatefulSet Pods](https://kubernetes.io/docs/tasks/run-application/force-delete-stateful-set-pod/#:~:text=In%20normal%20operation%20of%20a,1%20are%20alive%20and%20ready).

Container Storage Modules for Resiliency and [Non graceful node shutdown](https://github.com/kubernetes/enhancements/tree/master/keps/sig-storage/2268-non-graceful-shutdown) are mutually exclusive. One shall use either Resiliency or Non graceful node shutdown feature provided by Kubernetes.

## Container Storage Modules for Resiliency High-Level Description

Resiliency is designed to make Kubernetes Applications, including those that utilize persistent storage, more resilient to various failures. The first component of the Resiliency module is a pod monitor that is specifically designed to protect stateful applications from various failures. It is not a standalone application, but rather is deployed as a _sidecar_ to CSI (Container Storage Interface) drivers, in both the driver's controller pods and the driver's node pods. Deploying Container Storage ModuleResiliency as a sidecar allows it to make direct requests to the driver through the Unix domain socket that Kubernetes sidecars use to make CSI requests.

Some of the methods Resiliency invokes in the driver are standard CSI methods, such as NodeUnpublishVolume, NodeUnstageVolume, and ControllerUnpublishVolume. Resiliency also uses proprietary calls that are not part of the standard CSI specification. Currently, there is only one, ValidateVolumeHostConnectivity that returns information on whether a host is connected to the storage system and/or whether any I/O activity has happened in the recent past from a list of specified volumes. This allows for Resiliency to make more accurate determinations about the state of the system and its persistent volumes. Resiliency is designed to adhere to pod affinity settings of pods.

Accordingly,Resiliency is adapted to and qualified with each CSI driver it is to be used with. Different storage systems have different nuances and characteristics for Resiliency must take into account.

## Container Storage Modules for Resiliency Capabilities

Container Storage Modules for Resiliency provides the following capabilities:

{{<table "table table-striped table-bordered table-sm">}}
| Capability                              | PowerStore | PowerScale | PowerFlex |  PowerMax | UnityXT |
| --------------------------------------- | :--------: | :------: | :--------: | :-------:  | :------: |
| <div style="text-align: left"> Detect pod failures when: Node failure, K8S Control Plane Network failure, </br> K8S Control Plane failure, Array I/O Network failure | Yes  | Yes | Yes | Yes | Yes |
| <div style="text-align: left"> Cleanup pod artifacts from failed nodes | Yes         | Yes   | Yes         | Yes       | Yes       |
| <div style="text-align: left"> Revoke PV access from failed nodes      | Yes         | Yes   | Yes         | Yes       | Yes       |
{{</table>}}

## PowerFlex Support
PowerFlex is highly scalable and well-suited for Kubernetes deployments. The Container Storage Modules for Resiliency leverages these features:
- Quick detection of Array I/O Network Connectivity status changes (1-2 seconds).
- Robust mechanism to detect if Nodes are doing I/O to volumes (sampled over 5 seconds).
- Low latency REST API for fast CSI provisioning and de-provisioning.
- Proprietary network protocol via the SDC component, which can run over the same or separate IP interface as the K8S control plane.
 
## Unity XT Support
Unity XT is ideal for mid-sized deployments, remote/branch offices, and cost-sensitive mixed workloads. It supports all-Flash and is available in:
- **Purpose-built**: 12 All Flash models and 12 Hybrid models.
- **Converged (VxBlock)**: Available in Dell VxBlock System 1000.
- **Virtual (UnityVSA)**: Deployable on VMware ESXi servers, available in:
  - **Community Edition**: Free 4 TB solution for non-production use.
  - **Professional Edition**: Subscription-based, available in 10 TB, 25 TB, and 50 TB, with support and ESRS.
 
All three deployment options, Unity XT, UnityVSA, and Unity-based VxBlock, enjoy one architecture, one interface with consistent features and rich data services.
 
## Support for PowerScale, PowerStore, and PowerMax
These arrays provide robust and scalable solutions for Kubernetes deployments, ensuring high performance, reliability, and ease of management.
 
### Array Highlights:
- **PowerScale**: Highly scalable NFS array, ideal for large-scale file storage needs.
- **PowerStore**: Versatile and scalable, suitable for a wide range of workloads with advanced data services.
- **PowerMax**: The highest performing block storage array, delivering exceptional performance for critical applications.
 
### Key Features:
- **Detection of Array I/O Network Connectivity Status Changes**: All three arrays quickly detect changes in network connectivity, ensuring minimal disruption to operations.
- **Robust Mechanism to Detect Node I/O Activity**: They all have mechanisms to detect if nodes are performing I/O to volumes, sampled over a short period.
- **Low Latency REST API**: Each array offers a low latency REST API, facilitating fast CSI provisioning and de-provisioning.

## Limitations and Exclusions

This file contains information on Limitations and Exclusions that users should be aware of. Additionally, there are driver specific limitations and exclusions that may be called out in the [Deploying Container Storage Modules for Resiliency](../../getting-started/installation/kubernetes/powermax/helm/csm-modules/resiliency/) page.

### Supported and Tested Operating Modes

The following provisioning types are supported

* Dynamic PVC/PVs of accessModes "ReadWriteOnce, ReadWriteMany" and volumeMode "FileSystem".
* Dynamic PVC/PVs of accessModes "ReadWriteOnce, ReadWriteMany" and volumeMode "Block".
* Use of the above volumes with Pods created by StatefulSets.
* Up to 12 or so protected pods on a given node.
* Failing up to 3 nodes at a time in 9 worker node clusters, or failing 1 node at a time in smaller clusters. Application recovery times are dependent on the number of pods that need to be moved as a result of the failure. See the section on "Testing and Performance" for some of the details.
* Multi-array are supported. In case of CSI Driver for PowerScale and CSI Driver for Unity, if any one of the array is not connected, the array connectivity will be false. CSI Driver for Powerflex connectivity will be determined by connection to default array.

>Note:

The following scenarios are not supported.

* Pods that use persistent volumes from multiple CSI drivers. This _cannot_ be supported because multiple controller-podmons (one for each driver type) would be trying to manage the failover with conflicting actions.

* When using ReadWriteMany volumes, issues occur if multiple pods on the same node access the same volume. During pod cleanup, the volume is fenced on that node, making it unavailable to any other pods on the same node that are using it.
  
* Multiple instances of the same driver type (for example two CSI driver for PowerFlex deployments.)

* PowerFlex with Resiliency is not supported for the NFS protocol.

## Deploying and Managing Applications Protected by Container Storage Modules for Resiliency

 The first thing to remember about _CSM for Resiliency_ is that it only takes action on pods configured with the designated label. This functionality extends to VM workloads running on OpenShift Virtualization, as long as the Virtual Machine is labeled correctly. Both the key and the value have to match what is in the podmon helm configuration.  CSM for Resiliency emits a log message at startup with the label key and value it is using to monitor pods:

 ```yaml
 labelSelector: {map[podmon.dellemc.com/driver:csi-vxflexos]
 ```
 The above message indicates the key is: podmon.dellemc.com/driver and the label value is csi-vxflexos. To search for the pods that would be monitored, try this:
 ```bash
 kubectl get pods -A -l podmon.dellemc.com/driver=csi-vxflexos
 ```
```
NAMESPACE   NAME           READY   STATUS    RESTARTS   AGE
pmtu1       podmontest-0   1/1     Running   0          3m7s
pmtu2       podmontest-0   1/1     Running   0          3m8s
pmtu3       podmontest-0   1/1     Running   0          3m6s
 ```

### Applying Labels for VM Workloads
To enable resiliency monitoring for a VM, you must ensure the correct label is applied to the VM manifest. This label will automatically propagate to the virt-launcher pod created by OpenShift Virtualization.

```
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  labels:
    kubevirt.io/vm: vm-alpine
  name: vm-alpine
  namespace: vmns
spec:
  running: true
  template:
    metadata:
      labels:
        kubevirt.io/vm: vm-alpine
        podmon.dellemc.com/driver: csi-vxflexos
```
Once the VM is up and running, verify the virt-launcher pod is being tracked by CSM for Resiliency:

kubectl get pods -A -l podmon.dellemc.com/driver=csi-vxflexos

Example output:
```bash
NAMESPACE   NAME                                                READY   STATUS    RESTARTS   AGE
default     virt-launcher-vm-alpine-xyz                          1/1     Running   0          5d13h
```
If the virt-launcher pod appears in this list, the VM is successfully protected by CSM for Resiliency.

If Container Storage Modules for Resiliency detects a problem with a pod caused by a node or other failure that it can initiate remediation for, it will add an event to that pod's events:
 ```bash
 kubectl get events -n pmtu1
 ```
 ```
 ...
 61s         Warning   NodeFailure              pod/podmontest-0              podmon cleaning pod [7520ba2a-cec5-4dff-8537-20c9bdafbe26 node.example.com] with force delete
...
 ```

 Container Storage Modules for Resiliency may also generate events if it is unable to clean up a pod for some reason. For example, it may not clean up a pod because the pod is still doing I/O to the array.

Similarly, the label selector for csi-powerscale, csi-unity, csi-powerstore and csi-powermax would be as shown respectively.
 ```yaml
 labelSelector: {map[podmon.dellemc.com/driver:csi-isilon]
 labelSelector: {map[podmon.dellemc.com/driver:csi-unity]
 labelSelector: {map[podmon.dellemc.com/driver:csi-powerstore]
 labelSelector: {map[podmon.dellemc.com/driver:csi-powermax]
 ```

 #### Important
 Before putting an application into production that relies on Container Storage Modules for Resiliency monitoring, it is important to do a few test failovers first. To do this take the node that is running the pod offline for at least 2-3 minutes. Verify that there is an event message similar to the one above is logged, and that the pod recovers and restarts normally with no loss of data. (Note that if the node is running many Container Storage Modules for Resiliency protected pods, the node may need to be down longer for Container Storage Modules for Resiliency to have time to evacuate all the protected pods.)

 ### Application Recommendations

 1. It is recommended that pods that will be monitored by Container Storage Modules for Resiliency be configured to exit if they receive any I/O errors. That should help achieve the recovery as quickly as possible.

 2. Container Storage Modules for Resiliency does not directly monitor application health. However, if standard Kubernetes health checks are configured, that may help reduce pod recovery time in the event of node failure, as Container Storage Modules for Resiliency should receive an event that the application is Not Ready. Note that a Not Ready pod is not sufficient to trigger Container Storage Modules for Resiliency action unless there is also some condition indicating a Node failure or problem, such as the Node is tainted, or the array has lost connectivity to the node.

 3. As noted previously in the Limitations and Exclusions section, Container Storage Modules for Resiliency has not yet been verified to work with ReadWriteMany or ReadOnlyMany volumes. Also, it has not been verified to work with pod controllers other than StatefulSet.

 ### Storage Array Upgrades
To avoid application pods getting stuck in a Pending state, Container Storage Modules for Resiliency should be disabled for storage array upgrades; even if the storage array upgrade is advertised as non-distruptive. If the container orchestrator platform nodes lose connectivity with the array, which is more likely during an upgrade, then Resiliency will delete the application pods on the affected nodes and attempt to move them to a healthy node. If all of the nodes are affected, then the application pods will be stuck in a Pending state.

## Recovering From Failures

Normally Container Storage Modules for Resiliency should be able to move pods that have been impacted by Node Failures to a healthy node. After the failed nodes have come back online, Container Storage Modules for Resiliency cleans them up (especially any potential zombie pods) and then automatically removes the Container Storage Modules for Resiliency node taint that prevents pods from being scheduled to the failed node(s). There are a few cases where this cannot be fully automated and operator intervention is required, including:

1. Container Storage Modules for Resiliency expects that when a node failure occurs, all Container Storage Modules for Resiliency labeled pods are evacuated and rescheduled on other nodes. This process may not complete however if the node comes back online before Container Storage Modules for Resiliency has had time to evacuate all the labeled pods. The remaining pods may not restart correctly, going to "Error" or "CrashLoopBackoff". We are considering some possible remediation for this condition but have not implemented them yet.

    If this happens, try deleting the pod with "kubectl delete pod ...". In our experience this normally will cause the pod to be restarted and transition to the "Running" state.

2. Podmon-node is responsible for cleaning up failed nodes after the nodes' communication has been restored. The algorithm checks to see that all the monitored pods have terminated and their volumes and mounts have been cleaned up.

    If some of the monitored pods are still executing, node-podmon will emit the following log message at the end of a cleanup cycle (and retry the cleanup after a delay):

    ```yaml
    pods skipped for cleanup because still present: <pod-list>
    ```
    If this happens, __DO NOT__ manually remove the Container Storage Modules for Resiliency node taint. Doing so could possibly cause data corruption if volumes were not cleaned up, and a pod using those volumes was subsequently scheduled to that node.

    The correct course of action in this case is to reboot the failed node(s) that have not removed their taints in a reasonable time (5-10 minutes after the node is online again.) The operator can delay executing this reboot until it is convenient, but new pods will not be scheduled to it in the interim. This reboot will cancel any potential zombie pods. After the reboot, node-podmon should automatically remove the node taint after a short time.

## Testing Methodology and Results

A three tier testing methodology is used for Container Storage Modules for Resiliency:

1. Unit testing with high coverage (>90% statement) tests the program logic and is especially used to test the error paths by injecting faults.
2. An integration test describes test scenarios in Gherkin that sets up specific testing scenarios executed against a Kubernetes test cluster. The tests use ranges for many of the parameters to add an element of "chaos testing".
3. Script based testing supports longevity testing in a Kubernetes cluster. For example, one test repeatedly fails three different lists of nodes in succession and is used to fail 1/3 of the cluster's worker nodes on a cyclic basis and repeat indefinitely. This test collect statistics on length of time for pod evacuation, pod recovery, and node cleanup.
