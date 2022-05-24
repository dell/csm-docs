---
title: PowerStore
linktitle: PowerStore 
description: Troubleshooting PowerStore Driver
---
| Symptoms | Prevention, Resolution or Workaround |
| --- | --- | 
| When you run the command `kubectl describe pods powerstore-controller-<suffix> –n csi-powerstore`, the system indicates that the driver image could not be loaded. | - If on Kubernetes, edit the daemon.json file found in the registry location and add `{ "insecure-registries" :[ "hostname.cloudapp.net:5000" ] }` <br> - If on OpenShift, run the command `oc edit image.config.openshift.io/cluster` and add registries to yaml file that is displayed when you run the command.|
| The `kubectl logs -n csi-powerstore powerstore-node-<suffix>` driver logs show that the driver can't connect to PowerStore API. | Check if you've created a secret with correct credentials |
|Installation of the driver on Kubernetes supported versions fails with the following error: <br />```Error: unable to build kubernetes objects from release manifest: unable to recognize "": no matches for kind "VolumeSnapshotClass" in version "snapshot.storage.k8s.io/v1"```|Kubernetes v1.21/v1.22/v1.23 requires v1 version of snapshot CRDs to be created in cluster, see the [Volume Snapshot Requirements](../../installation/helm/powerstore/#optional-volume-snapshot-requirements)|
| If PVC is not getting created and getting the following error in PVC description: <br />```failed to provision volume with StorageClass "powerstore-iscsi": rpc error: code = Internal desc = : Unknown error:```| Check if you've created a secret with correct credentials | 
| If the NVMeFC pod is not getting created and the host looses the ssh connection, causing the driver pods to go to error state | remove the nvme_tcp module from the host incase of NVMeFC connection |
