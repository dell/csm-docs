---
title: "Volume Group Snapshots"
linkTitle: "Volume Group Snapshots"
weight: 8
Description: >
  Volume Group Snapshot module of Dell CSI drivers
---
## Volume Group Snapshot Feature
The Dell CSM Volume Group Snapshotter is an operator which extends Kubernetes API to support crash-consistent snapshots of groups of volumes.
Volume Group Snapshot supports PowerFlex and PowerStore driver.

## Installation
To install and use the Volume Group Snapshotter, you need to install pre-requisites in your cluster, then install the CRD in your cluster and deploy it with the driver.

### 1. Install Pre-Requisites
The only pre-requisite required is the external-snapshotter, which is available [here](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.1.1). Version 4.1+ is required. This is also required for the driver, so if the driver has already been installed, this pre-requisite should already be fulfilled as well.

The external-snapshotter is split into two controllers, the common snapshot controller and a CSI external-snapshotter sidecar. The common snapshot controller must be installed only once per cluster.

Here are sample instructions on installing the external-snapshotter CRDs:
```bash
git clone https://github.com/kubernetes-csi/external-snapshotter/
cd ./external-snapshotter
git checkout release-<your-version>
kubectl create -f client/config/crd
kubectl create -f deploy/kubernetes/snapshot-controller
```

### 2. Install VGS CRD

```
IMPORTANT: delete previous v1aplha2 version of CRD and vgs resources created using alpha version.
	   Snapshots on array will remain if memberReclaimPolicy=retain was used.
```
If you want to install the VGS CRD from a pre-generated yaml, you can do so with this command (run in top-level folder):
```bash
git clone https://github.com/dell/csi-volumegroup-snapshotter.git
cd csi-volumegroup-snapshotter
kubectl apply -f config/crd/vgs-install.yaml
```

If you want to create your own CRD for installation with Kustomize, then the command `make install` can be used to create and install the Custom Resource Definitions in your Kubernetes cluster.

### 3. Deploy VGS in CSI Driver with Helm Chart Parameters
The drivers that support Helm chart deployment allow the CSM Volume Group Snapshotter to be _optionally_ deployed 
by variables in the chart. There is a _vgsnapshotter_ block specified in the _values.yaml_ file of the chart that will look similar this default text:

```yaml
# volume group snapshotter(vgsnapshotter) details
# These options control the running of the vgsnapshotter container
vgsnapshotter:
  enabled: false
  image: 
 
```
To deploy CSM Volume Group Snapshotter with the driver, these changes are required:
1. Enable CSM Volume Group Snapshotter by changing the vgsnapshotter.enabled boolean to true. 
2. In the vgsnapshotter.image field, put the location of the image you created, or link to the one already built (such as the one on DockerHub, `dellemc/csi-volumegroup-snapshotter:v1.2.0`).
3. Install/upgrade the driver normally. You should now have VGS successfully deployed with the driver!


## Creating Volume Group Snapshots
This is a sample manifest for creating a Volume Group Snapshot:
```yaml
apiVersion: volumegroup.storage.dell.com/v1
kind: DellCsiVolumeGroupSnapshot
metadata:
  name: "vgs-test"
  namespace: "test"
spec:
  # Add fields here
  driverName: "csi-<driver-name>.dellemc.com" # Example: "csi-powerstore.dellemc.com"
  # defines how to process VolumeSnapshot members when volume group snapshot is deleted
  # "Retain" - keep VolumeSnapshot instances
  # "Delete" - delete VolumeSnapshot instances
  memberReclaimPolicy: "Retain"
  volumesnapshotclass: "<snapshot-class>"
  timeout: 90sec
  pvcLabel: "vgs-snap-label"
  # pvcList:
  #   - "pvcName1"
  #   - "pvcName2"
```
Run the command `kubectl create -f vg.yaml` to take the specified snapshot.

The PVC labels field specifies a label that must be present in PVCs that are to be snapshotted. Here is a sample of that portion of a .yaml for a PVC:

```yaml
metadata:
  name: volume1
  namespace: test
  labels:
    volume-group: vgs-snap-label
```

## How to create policy based Volume Group Snapshots  
Currently, array based policies are not supported. This will be addressed in an upcoming release. For a temporary solution, cronjob can be used to mimic policy based Volume Group Snapshots. The only supported policy is how often the group should be created. To create a cronjob that creates a volume group snapshot periodically, use the template found in samples/ directory. Once the template is filled out, use the command `kubectl create -f samples/cron-template.yaml` to create the configmap and cronjob. 
>Note: Cronjob is only supported on Kubernetes versions 1.21 or higher 

## VolumeSnapshotContent watcher
A VolumeSnapshotContent watcher is implemented to watch for VG's managing VolumeSnapshotContent. When any of the VolumeSnapshotContents get deleted, its managing VG, if there is one, will update `Status.Snapshots` to remove that snapshot. If all the snapshots are deleted, the VG will be also deleted automatically. 

## Deleting policy based Volume Group Snapshots  
Currently, automatic deletion of Volume Group Snapshots is not supported. All deletion must be done manually.

More details about the installation and use of the VolumeGroup Snapshotter can be found here: [dell-csi-volumegroup-snapshotter](https://github.com/dell/csi-volumegroup-snapshotter).

>Note: Volume group cannot be seen from the Kubernetes level as of now only volume group snapshots can be viewed as a CRD

>Volume Group Snapshots feature is supported with Helm.
