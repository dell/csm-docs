---
title: Architecture
linktitle: Architecture
weight: 2
description: >
  High level architecture for CSM for Replication
---

## Replication design and architecture
![arch](../arch.png)

Container Storage Modules (CSM) for Replication project consists of the following components:

* DellCSIReplicationGroup - A Kubernetes [Custom Resource](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
* CSM Replication controller which replicates the resources across(or within) Kubernetes clusters.
* CSM Replication sidecar container which is part of the CSI driver controller pod
* repctl - Multi cluster Kubernetes client for managing replication related objects

### DellCSIReplicationGroup
`DellCSIReplicationGroup` (RG) is a cluster scoped Custom Resource that represents a protection group on the backend storage array.
It is used to group volumes with the same replication related properties together.
`DellCSIReplicationGroup`'s spec contains an _action_ field which can be used to perform replication related operations on the backing protection groups on the storage arrays.
This includes operations like _Failover_, _Reprotect_, _Suspend_, _Synchronize_ e.t.c.
Any replication related operation is always carried out on all the volumes present in the group.

#### Specification

```yaml
kind: DellCSIReplicationGroup
apiVersion: replication.storage.dell.com/v1alpha1
metadata:
  name: rg-e6be24c0-145d-4b62-8674-639282ebdd13
spec:
  driverName: driver.dellemc.com # Name of the CSI driver (same as provisioner name in StorageClass)
  action: "" # Name of the replication action to be performed on the protection group
  protectionGroupAttributes:
    localAttributeKey: value
  protectionGroupId: protection-group-id # Identifier of the backing protection group on the Storage Array
  remoteClusterId: tgtClusterID # A unique identifier for the remote Kubernetes Cluster
  remoteProtectionGroupAttributes:
    remoteAttributeKey: value
  remoteProtectionGroupId: csi-rep-sg-test-5-ASYNC # Identifier for the protection group on the remote Storage Array
```

#### Status
The status sub resource of `DellCSIReplicationGroup` contains information about the state of replication & any actions which
have been performed on the object.

| Field        | Description | 
| -------------| ----------  |
| state | State of the Custom Resource |
| replicationLinkState | State of the replication on the storage arrays |
| lastAction | Result of the last performed action |
| conditions | List of recent conditions the CR instance has gone through |

```yaml
status:
    conditions:
    - condition: Action REPROTECT_REMOTE succeeded
      time: "2021-08-11T12:22:05Z"
    - condition: Replication Link State:IsSource changed from (true) to (false)
      time: "2021-08-11T12:18:50Z"
    - condition: Action FAILOVER_REMOTE succeeded
      time: "2021-08-11T12:18:50Z"
    lastAction:
      condition: Action REPROTECT_REMOTE succeeded
      time: "2021-08-11T12:22:05Z"
    replicationLinkState:
      isSource: false
      lastSuccessfulUpdate: "2021-08-11T17:18:12Z"
      state: Synchronized
    state: Ready
```

Here is a diagram representing how the _state_ of the CustomResource changes based on actions
![state](../state.png)


### CSM Replication sidecar
![sidecar](../sidecar.png)

CSM Replication sidecar is deployed as sidecar container in the CSI driver controller pod. This container is similar to Kubernetes CSI Sidecar
[containers](https://kubernetes-csi.github.io/docs/sidecar-containers.html) and runs a Controller Manager
which manages the following controllers -
* PersistentVolume(PV) Controller
* PersistentVolumeClaim(PVC) Controller
* DellCSIReplicationGroup(RG) Controller

The PV & PVC controllers watch for PV/PVC creation events and use `dell-csi-extensions` APIs to communicate with the
CSI Driver controller plugin to discover/create replication enabled volumes and protection groups on the backend storage array.
The PersistentVolume controller then uses these details to create DellCSIReplicationGroup objects in the cluster.
These controllers are also responsible for associating the PV & PVC objects with DellCSIReplicationGroup objects. This association is
established by applying annotations & labels on the PV & PVC objects.

The RG controller manages DellCSIReplicationGroup instances and processes any change requests.
It is primarily responsible for the following:

* Perform _actions_ on the protection groups
* Monitor status of replication
* Updates to the status sub resource

### CSM Replication Controller
![common](../common.png)

CSM Replication Controller is a Kubernetes application deployed independently of CSI drivers and is responsible for
the communication between Kubernetes clusters.

The details about the clusters it needs to connect to are provided in the form of a ConfigMap with references to secrets
containing the details(KubeConfig/ServiceAccount tokens) required to connect to the respective clusters.

It consists of Controller Manager which manages the following controllers:
* PersistentVolume(PV) Controller
* PersistentVolumeClaim(PVC) Controller
* DellCSIReplicationGroup(RG) Controller

The PV controller is responsible for creating PV objects (representing the replicated volumes on the backend storage array) in the remote
Kubernetes cluster.
This controller also enables deletion of the remote PV object in case it is desired by propagating the deletion request across clusters.

Similarly, the RG controller is responsible for creating RG objects in the remote Kubernetes cluster. These RG objects represent the
remote protection groups on the backend storage array. This controller can also propagate the deletion request of RG objects across clusters.

Both the PV & RG objects in the remote cluster have extra metadata associated with them in form of annotations & labels. This metadata includes
information about the respective objects in the source cluster.

The PVC objects are never replicated across the clusters. Instead, the remote PV objects have annotations related to the
source PVC objects. This information can be easily used to create the PVCs whenever required using `repctl` or even `kubectl`

### Supported Cluster Topologies
Click [here](../cluster-topologies) for details for the various types of supported cluster topologies


