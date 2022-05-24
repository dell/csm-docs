---
title: Unity
description: Troubleshooting Unity Driver
---

---
| Symptoms | Prevention, Resolution or Workaround |
| --- | --- |
| When you run the command `kubectl describe pods unity-controller-<suffix> –n unity`, the system indicates that the driver image could not be loaded. | You may need to put an insecure-registries entry in `/etc/docker/daemon.json` or login to the docker registry |
| The `kubectl logs -n unity unity-node-<suffix>` driver logs show that the driver can't connect to Unity - Authentication failure. | Check if you have created a secret with correct credentials |
| `fsGroup` specified in pod spec is not reflected in files or directories at mounted path of volume. | fsType of PVC must be set for fsGroup to work. fsType can be specified while creating a storage class. For NFS protocol, fsType can be specified as `nfs`. fsGroup doesn't work for ephemeral inline volumes. |
| Dynamic array detection will not work in Topology based environment | Whenever a new array is added or removed, then the driver controller and node pod should be restarted with command **kubectl get pods -n unity --no-headers=true \| awk '/unity-/{print $1}'\| xargs kubectl delete -n unity pod** when **topology-based storage classes are used**. For dynamic array addition without topology, the driver will detect the newly added or removed arrays automatically|
| If source PVC is deleted when cloned PVC exists, then source PVC will be deleted in the cluster but on array, it will still be present and marked for deletion. | All the cloned PVC should be deleted in order to delete the source PVC from the array. |
| PVC creation fails on a fresh cluster with **iSCSI** and **NFS** protocols alone enabled with error **failed to provision volume with StorageClass "unity-iscsi": error generating accessibility requirements: no available topology found**. | This is because iSCSI initiator login takes longer than the node pod startup time. This can be overcome by bouncing the node pods in the cluster using the below command the driver pods with **kubectl get pods -n unity --no-headers=true \| awk '/unity-/{print $1}'\| xargs kubectl delete -n unity pod** |
| Driver install or upgrade fails because of an incompatible Kubernetes version, even though the version seems to be within the range of compatibility. For example: `Error: UPGRADE FAILED: chart requires kubeVersion: >= 1.21.0 <= 1.23.0 which is incompatible with Kubernetes V1.21.11-mirantis-1` | If you are using an extended Kubernetes version, please see the helm Chart at `helm/csi-unity/Chart.yaml` and use the alternate `kubeVersion` check that is provided in the comments. *Please note* that this is not meant to be used to enable the use of pre-release alpha and beta versions, which is not supported. |

