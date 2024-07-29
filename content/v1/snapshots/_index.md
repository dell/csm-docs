---
title: "Snapshots"
linkTitle: "Snapshots"
weight: 8
Description: >
  Snapshot module of Dell CSI drivers
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

>Note: VolumeSnapshots can be listed using the command `kubectl get volumesnapshot -n <namespace>`


### (Optional) Volume Snapshot Requirements

Applicable only if you decide to enable the snapshot feature in `values.yaml`.

```yaml
snapshot:
  enabled: true
```

#### Volume Snapshot CRD's
The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on Github. For installation, use [v7.0.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v7.0.1/client/config/crd)

#### Volume Snapshot Controller
The CSI external-snapshotter sidecar is split into two controllers to support Volume snapshots.

- A common snapshot controller
- A CSI external-snapshotter sidecar

The common snapshot controller must be installed only once in the cluster, irrespective of the number of CSI drivers installed in the cluster. On OpenShift clusters 4.4 and later, the common snapshot-controller is pre-installed. In the clusters where it is not present, it can be installed using `kubectl` and the manifests are available here: [v7.0.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v7.0.1/deploy/kubernetes/snapshot-controller)

*NOTE:*
- The manifests available on GitHub install the snapshotter image: 
  [quay.io/k8scsi/csi-snapshotter:v4.0.x](https://quay.io/repository/k8scsi/csi-snapshotter?tag=v4.0.0&tab=tags)
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

#### Installation example 

You can install CRDs and the default snapshot controller by running the following commands:
```bash
git clone https://github.com/kubernetes-csi/external-snapshotter/
cd ./external-snapshotter
git checkout release-6.2
kubectl kustomize client/config/crd | kubectl create -f -
kubectl -n kube-system kustomize deploy/kubernetes/snapshot-controller | kubectl create -f -
```

*NOTE:*
- It is recommended to use the 6.2.x version of snapshotter/snapshot-controller.
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

