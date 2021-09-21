---
title: "Snapshots"
linkTitle: "Snapshots"
weight: 8
Description: >
  Snapshot module of Dell EMC CSI drivers
---
## Volume Snapshot Feature

In order to use Volume Snapshots, ensure the following components have been deployed to your cluster:
- Kubernetes Volume Snapshot CRDs
- Volume Snapshot Controller
- Volume Snapshot Class

>Note: From v1.7, the CSI driver installation process will no longer create VolumeSnapshotClass. 
> If you want to create VolumeSnapshots, then create a VolumeSnapshotClass using the sample provided in the _/samples/volumesnapshotclass_ folder under respective drivers.

### Creating Volume Snapshots
The following is a sample manifest for creating a Volume Snapshot using the **v1** snapshot APIs:
```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: pvol0-snap1
spec:
  volumeSnapshotClassName: csm-snapclass
  source:
    persistentVolumeClaimName: pvol0

```

After the VolumeSnapshot has been successfully created by the CSI driver, a VolumeSnapshotContent object is automatically created. When the status of the VolumeSnapshot object has the _readyToUse_ field set to _true_, it is available for use.