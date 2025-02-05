---
title: PowerStore
linktitle: PowerStore 
description: Troubleshooting PowerStore Driver
---
| Symptoms | Prevention, Resolution or Workaround |
| --- | --- | 
| When you run the command `kubectl describe pods powerstore-controller-<suffix> –n csi-powerstore`, the system indicates that the driver image could not be loaded. | - If on Kubernetes, edit the daemon.json file found in the registry location and add `{ "insecure-registries" :[ "hostname.cloudapp.net:5000" ] }` <br> - If on OpenShift, run the command `oc edit image.config.openshift.io/cluster` and add registries to yaml file that is displayed when you run the command.|
| The `kubectl logs -n csi-powerstore powerstore-node-<suffix>` driver logs show that the driver can't connect to PowerStore API. | Check if you've created a secret with correct credentials |
|Installation of the driver on Kubernetes supported versions fails with the following error: <br />```Error: unable to build kubernetes objects from release manifest: unable to recognize "": no matches for kind "VolumeSnapshotClass" in version "snapshot.storage.k8s.io/v1"```|Kubernetes v1.21/v1.22/v1.23 requires v1 version of snapshot CRDs to be created in cluster, see the [Volume Snapshot Requirements](../../../deployment/helm/drivers/installation/powerstore/#optional-volume-snapshot-requirements)|
| If PVC is not getting created and getting the following error in PVC description: <br />```failed to provision volume with StorageClass "powerstore-iscsi": rpc error: code = Internal desc = : Unknown error:```| Check if you've created a secret with correct credentials | 
| If the NVMeFC pod is not getting created and the host looses the ssh connection, causing the driver pods to go to error state | remove the nvme_tcp module from the host in case of NVMeFC connection |
| When a node goes down, the block volumes attached to the node cannot be attached to another node | 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node. |
| If the pod creation for NVMe takes time when the connections between the host and the array are more than 2 and considerable volumes are mounted on the host | Reduce the number of connections between the host and the array to 2. |
|Driver install or upgrade fails because of an incompatible Kubernetes version, even though the version seems to be within the range of compatibility. For example: Error: UPGRADE FAILED: chart requires kubeVersion: >= 1.22.0 < 1.25.0 which is incompatible with Kubernetes V1.22.11-mirantis-1 | If you are using an extended Kubernetes version, please see the [helm Chart](https://github.com/dell/helm-charts/blob/main/charts/csi-powerstore/Chart.yaml) and use the alternate kubeVersion check that is provided in the comments. Please note that this is not meant to be used to enable the use of pre-release alpha and beta versions, which is not supported.|
| If two separate networks are configured for ISCSI and NVMeTCP, the driver may encounter difficulty identifying the second network (e.g., NVMeTCP). | This is a known issue, and the workaround involves creating a single network on the array to serve both ISCSI and NVMeTCP purposes. |
| Unable to provision PVC's via driver | Ensure that the NAS name matches the one provided on the array side. | 
| Unable to install or upgrade the driver | Ensure  that the firewall is configured to grant adequate permissions for downloading images from the registry. |  
| Faulty paths in the multipath | Ensure that the configuration of the multipath is correct and connectivity to the underlying hardware is intact. |
| Unable to install or upgrade the driver due to minimum Kubernetes version or Openshift version | Currently CSM only supports n, n-1, n-2 version of Kubernetes and Openshift, if you still wanted to continue with existing version update the `verify.sh` to continue.| 
| Volumes are not getting deleted on the array when PV's are deleted | Ensure `persistentVolumeReclaimPolicy` is set to Delete. |
| fsGroupPolicy may not work as expected without root privileges for NFS only [https://github.com/kubernetes/examples/issues/260](https://github.com/kubernetes/examples/issues/260) | To get the desired behavior set “RootClientEnabled” = “true” in the storage class parameter |
