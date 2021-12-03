---
title: Design
linktitle: Design
weight: 1
description: >
  CSM for Resiliency Design
---

This section covers CSM for Resiliency's design.  The detail is sufficient that you should be able to understand what CSM for Resiliency is designed to do in various situations and how it works. CSM for Resiliency is deployed as a sidecar named _podmon_ with a CSI driver in both the controller pods and node pods. These are referred to as controller-podmon and node-podmon respectively.

Generally controller-podmon and the driver controller pods are deployed using a Deployment. 
The Deployments support one or multiple replicas for High Availability and use a standard K8S leader election protocol so that only one controller
is active at a time (as does the driver and all the controller sidecars.)
The controller deployment also supports a Node Selector that allows the controllers to be placed on K8S Manager (non Worker) nodes.

Node-podmon and the driver node pods are deployed in a DaemonSet, with a Pod deployed on every K8S Worker Node.

## Controller-Podmon

Controller-podmon is responsible for:

* Setting up a Watch for CSM for Resiliency labeled pods, and if a Pod is Initialized but Not Ready and resident on a Node with a NoSchedule or NoExecute taint, calling _controllerCleanupPod_ to cleanup the pod so that a replacement pod can be scheduled.

* Periodically polling the arrays to see if it has connectivity to the nodes that are hosting CSM for Resiliency labeled pods (if enabled.) If an array has lost connectivity to a node hosting CSM for Resiliency labeled pods using that array, _controllerCleanupPod_ is invoked to cleanup the pods that have lost I/O connectivity.

* Tainting nodes that have failed so that a) no further pods will get scheduled to them until they are returned to service, and b) podmon-node upon seeing the taint will invoke 
the cleanup operations to make sure any zombie pods (pods that have been replaced) cannot write to the volumes they were using.

* If a CSM for Resiliency labeled pod enters a CrashLoopBackOff state, deleting that pod so it can be replaced.

_ControllerCleanupPod_ cleans up the pod by taking the following actions:
1. The VolumeAttachments (VAs) are loaded, and all VAs belonging to the pod being cleaned up are identified. The PVs for each VolumeAttachment are identified and used to get the Volume Handle (array identifier for the volume.)
2. If enabled, the array is queried if any of the volumes to the pod are still doing I/O. If so, cleanup is aborted.
3. The pod's volumes are "fenced" from the node the pod resides on to prevent any potential I/O from a zombie pod. This is done by calling the CSI ControllerUnpublishVolume call for each of the volumes.
4. A taint is applied to the node to keep any new pods from being scheduled to the node. If the replacement pod were to get scheduled to the same node as a zombie pod, they might both gain access to the volume concurrently causing corruption.
5. The VolumeAttachments for the pod is deleted. This is necessary so the replacement pod to be created can attach the volumes.
6. The pod is forcibly deleted so that a StatefulSet controller which created the pod is free to create a replacement pod.

## Node-Podmon

Node-podmon has the following responsibilities:

1. Establishing a pod watch which is used to maintain a list of pods executing on this node that may need to be cleaned up. The list includes information about each Mount volume or Block volume used by the pod including the volume handle, volume name, private mount path, and mount path in the pod.
2. Periodically (every 30 seconds) polling to see if controller-podmon has applied a taint to the node. If so, node-podmon calls _nodeModeCleanupPod_ for each pod to clean up any remnants of the pod (which is potentially a zombie pod.)
3. If all pods have been successfully cleaned up, and there are no labeled pods on this node still existing, only then will node-podmon remove the taint placed on the node by controller-podmon.

_NodeModeCleanupPod_ cleans up the pod remnants by taking the following actions for each volume used by the pod:
1. Calling NodeUnpublishVolume to unpublish the volume from the pod.
2. Unmounting and deleting the target path for the volume.
3. Calling NodeUnstageVolume to unpublish the volume from the node.
4. Unmounting and deleting the staging path for the volume.

## Design Limitations

There are some limitations with the current design. Some might be able to be addressed in the future- others are inherent in the approach.

1. The design relies on the array's ability to revoke access to a volume for a particular node for the fencing operation. The granularity of access control for a volume is per node. Consequently, it isn't possible to revoke access from one pod on a node while retaining access to another pod on the same node if we cannot communicate with the node.
The implications of this are that if more than one pod on a node is sharing the same volume(s), they all must be protected by CSM for Resiliency, and they all must be cleaned up by controller-podmon if the node fails. If only some of the pods are cleaned up, the other pods will lose access to the volumes shared with pods that have been cleaned, so those pods should also fail.
2. The node-podmon cleanup algorithm purposefully will not remove the node taint until all the protected volumes have been cleaned up from the node. This works well if the node fault lasts long enough that controller-podmon can evacuate all the protected pods from the node. However, if the failure is short-lived, and controller-podmon does not clean up all the protected pods on the node, or if for some reason node-podmon cannot clean a pod completely, the taint is left on the node, and manual intervention is required. The required intervention is for the operator to reboot the node, which will ensure that no zombie pods survive. Upon seeing the reboot, node-podmon will then remove the taint.
3. If the node failure is short-lived and controller-podmon has not evacuated some of the protected pods on the node, they may try and restart on the same pod. This has been observed to cause such pods to go into CrashLoopBackoff. We are currently considering solutions to this problem.
