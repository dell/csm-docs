---
title: Unity
description: Troubleshooting Unity Driver
---

---
| Symptoms | Prevention, Resolution or Workaround |
| --- | --- |
| When you run the command `kubectl describe pods unity-controller-<suffix> –n unity`, the system indicates that the driver image could not be loaded. | You may need to put an insecure-registries entry in `/etc/docker/daemon.json` or login to the docker registry |
| The `kubectl logs -n unity unity-node-<suffix>` driver logs shows that the driver can't connect to Unity - Authentication failure. | Check if you have created secret with correct credentials |
| Installation of the driver on Kubernetes v1.20 fails with the following error: <br />```Error: unable to build kubernetes objects from release manifest: unable to recognize "": no matches for kind "VolumeSnapshotClass" in version "snapshot.storage.k8s.io/v1"``` | Kubernetes v1.20 requires v1 version of snapshot CRDs.  If on Kubernetes 1.20 (v1 snapshots) install CRDs from v4.0.0, see point 6 [here](../../../docs/installation/helm/unity/#install-csi-driver)  |
