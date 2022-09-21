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

In order to use Volume Group Snapshots, ensure the volume snapshot module is enabled.
- Kubernetes Volume Snapshot CRDs
- Volume Snapshot Controller
- Volume Snapshot Class

### Creating Volume Group Snapshots
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

The PVC labels field specifies a label that must be present in PVCs that are to be snapshotted. Here is a sample of that portion of a .yaml for a PVC:

```yaml
metadata:
  name: volume1
  namespace: test
  labels:
    volume-group: vgs-snap-label
```

More details about the installation and use of the VolumeGroup Snapshotter can be found here: [dell-csi-volumegroup-snapshotter](https://github.com/dell/csi-volumegroup-snapshotter).

>Note: Volume group cannot be seen from the Kubernetes level as of now only volume group snapshots can be viewed as a CRD

>Volume Group Snapshots feature is supported with Helm.
