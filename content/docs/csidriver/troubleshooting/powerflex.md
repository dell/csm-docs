---
title: PowerFlex 
linktitle: PowerFlex 
description: Troubleshooting PowerFlex Driver
---

| Symptoms | Prevention, Resolution or Workaround |
|------------|--------------|
| The installation fails with the following error message: <br />```Node xxx does not have the SDC installed```| Install the PowerFlex SDC on listed nodes. The SDC must be installed on all the nodes that need to pull an image of the driver. |
| The standalone Helm chart installation fails with `Error: couldn't find key MDM in Secret vxflexos/vxflexos-config` | Make sure that you have ssh keys set up between the master and worker nodes. |
| When you run the command `kubectl describe pods vxflexos-controller-* –n vxflexos`, the system indicates that the driver image could not be loaded. | - If on Kubernetes, edit the `daemon.json` file found in the registry location and add <br />```{ "insecure-registries" :[ "hostname.cloudapp.net:5000" ] }```<br />- If on OpenShift, run the command `oc edit image.config.openshift.io/cluster` and add registries to yaml file that is displayed when you run the command. |
|The `kubectl logs -n vxflexos vxflexos-controller-* driver` logs show that the driver is not authenticated.| Check the username, password, and the gateway IP address for the PowerFlex system.|
|The `kubectl logs vxflexos-controller-* -n vxflexos driver` logs show that the system ID is incorrect.| Use the `get_vxflexos_info.sh` to find the correct system ID. Add the system ID to `myvalues.yaml` script.|
|CreateVolume error System <Name> is not configured in the driver | Powerflex name if used for systemID in StorageClass ensure same name is also used in array config systemID |  
|Defcontext mount option seems to be ignored, volumes still are not being labeled correctly.|Ensure SElinux is enabled on a worker node, and ensure your container run time manager is properly configured to be utilized with SElinux.|
|Mount options that interact with SElinux are not working (like defcontext).|Check that your container orchestrator is properly configured to work with SElinux.|
|Installation of the driver on Kubernetes v1.20/v1.21/v1.22 fails with the following error: <br />```Error: unable to build kubernetes objects from release manifest: unable to recognize "": no matches for kind "VolumeSnapshotClass" in version "snapshot.storage.k8s.io/v1"```|Kubernetes v1.20/1.21/v1.22 requires v1 version of snapshot CRDs to be created in cluster, see the [Volume Snapshot Requirements](../../installation/helm/powerflex/#optional-volume-snapshot-requirements)|
| The `kubectl logs -n vxflexos vxflexos-controller-* driver` logs show `x509: certificate signed by unknown authority` |A self assigned certificate is used for PowerFlex array. See [certificate validation for PowerFlex Gateway](../../installation/helm/powerflex/#certificate-validation-for-powerflex-gateway-rest-api-calls)|
| When you run the command `kubectl apply -f snapclass-v1.yaml`, you get the error `error: unable to recognize "snapclass-v1.yaml": no matches for kind "VolumeSnapshotClass" in version "snapshot.storage.k8s.io/v1"` | Check to make sure that the v1 snapshotter CRDs are installed, and not the v1beta1 CRDs, which are no longer supported. |
| The controller pod is stuck and producing errors such as" `Failed to watch *v1.VolumeSnapshotContent: failed to list *v1.VolumeSnapshotContent: the server could not find the requested resource (get volumesnapshotcontents.snapshot.storage.k8s.io)` | Make sure that v1 snapshotter CRDs and v1 snapclass are installed, and not v1beta1, which is no longer supported. |


>*Note*: `vxflexos-controller-*` is the controller pod that acquires leader lease

