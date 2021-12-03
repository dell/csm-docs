---
title: PowerStore
linktitle: PowerStore 
description: Troubleshooting PowerStore Driver
---
| Symptoms | Prevention, Resolution or Workaround |
| --- | --- | 
| When you run the command `kubectl describe pods powerstore-controller-<suffix> –n csi-powerstore`, the system indicates that the driver image could not be loaded. | - If on Kubernetes, edit the daemon.json file found in the registry location and add `{ "insecure-registries" :[ "hostname.cloudapp.net:5000" ] }` <br> - If on OpenShift, run the command `oc edit image.config.openshift.io/cluster` and add registries to yaml file that is displayed when you run the command.|
| The `kubectl logs -n csi-powerstore powerstore-node-<suffix>` driver logs show that the driver can't connect to PowerStore API. | Check if you've created a secret with correct credentials |
|Installation of the driver on Kubernetes v1.20/1.21 fails with the following error: <br />```Error: unable to build kubernetes objects from release manifest: unable to recognize "": no matches for kind "VolumeSnapshotClass" in version "snapshot.storage.k8s.io/v1"```|Kubernetes v1.20/1.21 requires v1 version of snapshot CRDs.  If on Kubernetes 1.20/1.21 (v1 snapshots) install CRDs from v4.0.0, see the [Volume Snapshot Requirements](../../installation/helm/powerstore/#optional-volume-snapshot-requirements)|

