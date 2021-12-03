---
title: PowerFlex 
linktitle: PowerFlex 
description: Troubleshooting PowerFlex Driver
---

| Symptoms | Prevention, Resolution or Workaround |
|------------|--------------|
| The installation fails with the following error message: <br />```Node xxx does not have the SDC installed```| Install the PowerFlex SDC on listed nodes. The SDC must be installed on all the nodes that needs to pull an image of the driver. |
| When you run the command `kubectl describe pods vxflexos-controller-0 –n vxflexos`, the system indicates that the driver image could not be loaded. | - If on Kubernetes, edit the `daemon.json` file found in the registry location and add <br />```{ "insecure-registries" :[ "hostname.cloudapp.net:5000" ] }```<br />- If on OpenShift, run the command `oc edit image.config.openshift.io/cluster` and add registries to yaml file that is displayed when you run the command.|
|The `kubectl logs -n vxflexos vxflexos-controller-0` driver logs shows that the driver is not authenticated.| Check the username, password, and the gateway IP address for the PowerFlex system.|
|The `kubectl logs vxflexos-controller-0 -n vxflexos driver` logs shows that the system ID is incorrect.| Use the `get_vxflexos_info.sh` to find the correct system ID. Add the system ID to `myvalues.yaml` script.|
|Defcontext mount option seems to be ignored, volumes still are not being labeled correctly.|Ensure SElinux is enabled on worker node, and ensure your container run time manager is properly configured to be utilized with SElinux.|
|Mount options that interact with SElinux are not working (like defcontext).|Check that your container orchestrator is properly configured to work with SElinux.|
|Installation of the driver on Kubernetes v1.20 fails with the following error: <br />```Error: unable to build kubernetes objects from release manifest: unable to recognize "": no matches for kind "VolumeSnapshotClass" in version "snapshot.storage.k8s.io/v1"```|Kubernetes v1.20 requires v1 version of snapshot CRDs.  If on Kubernetes 1.20 (v1 snapshots) install CRDs from v4.0.0, see the [Volume Snapshot Requirements](../../docs/installation/helm/powerflex.md#volume-snapshot-requirements)|
