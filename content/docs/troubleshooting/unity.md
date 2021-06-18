---
title: Unity
description: Troubleshooting Unity Driver
---

---
| Symptoms | Prevention, Resolution or Workaround |
| --- | --- |
| When you run the command `kubectl describe pods unity-controller-<suffix> –n unity`, the system indicates that the driver image could not be loaded. | You may need to put an insecure-registries entry in `/etc/docker/daemon.json` or login to the docker registry |
| The `kubectl logs -n unity unity-node-<suffix>` driver logs show that the driver can't connect to Unity - Authentication failure. | Check if you have created a secret with correct credentials |
| Installation of the driver on Kubernetes v1.20/1.21 fails with the following error: <br />```Error: unable to build kubernetes objects from release manifest: unable to recognize "": no matches for kind "VolumeSnapshotClass" in version "snapshot.storage.k8s.io/v1"``` | Kubernetes v1.20/1.21 requires v1 version of snapshot CRDs.  If on Kubernetes 1.20/1.21 (v1 snapshots) install CRDs from v4.0.0, see point 6 [here](../../../docs/installation/helm/unity/#install-csi-driver)  |
| `fsGroup` specified in pod spec is not reflected in files or directories at mounted path of volume. | fsType of PVC must be set for fsGroup to work. fsType can be specified while creating a storage class. For NFS protocol, fsType can be specified as `nfs`. fsGroup doesn't work for ephemeral inline volumes. |

