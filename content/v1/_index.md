
---
title: "Documentation"
linkTitle: "Documentation"
---
{{% pageinfo color="primary" %}}
This document version is no longer actively maintained. The site that you are currently viewing is an archived snapshot. For up-to-date documentation, see the [latest version](/csm-docs/)
{{% /pageinfo %}}

The Dell Technologies (Dell) Container Storage Modules (CSM) enables simple and consistent integration and automation experiences, extending enterprise storage capabilities to Kubernetes for cloud-native stateful applications. It reduces management complexity so developers can independently consume enterprise storage with ease and automate daily operations such as provisioning, snapshotting, replication, observability, authorization and, resiliency.

<img src="csm_hexagon.png" alt="CSM Hex Diagram" width="500"/>

CSM is made up of multiple components including modules (enterprise capabilities), CSI drivers (storage enablement) and, other related applications (deployment, feature controllers, etc).

<img src="csm_diagram.jpg" alt="CSM Diagram" width="800"/>

## CSM Supported Modules and Dell CSI Drivers

| Modules/Drivers | CSM 1.2.1 | [CSM 1.2](../v1/) | [CSM 1.1](../v1/) | [CSM 1.0.1](../v2/) | 
| - | :-: | :-: | :-: | :-: |
| [Authorization](https://hub.docker.com/r/dellemc/csm-authorization-sidecar) | 1.2 | 1.2 | 1.1 | 1.0 |
| [Observability](https://hub.docker.com/r/dellemc/csm-topology) | 1.1.1 | 1.1 | 1.0.1 | 1.0.1  |
| [Replication](https://hub.docker.com/r/dellemc/dell-csi-replicator) | 1.2 | 1.2 | 1.1 | 1.0 |
| [Resiliency](https://hub.docker.com/r/dellemc/podmon) | 1.1 | 1.1 | 1.0.1 | 1.0.1 |
| [CSI Driver for PowerScale](https://hub.docker.com/r/dellemc/csi-isilon/tags) | v2.2 | v2.2 | v2.1 | v2.0 | 
| [CSI Driver for Unity](https://hub.docker.com/r/dellemc/csi-unity/tags) | v2.2 | v2.2 | v2.1 | v2.0 |
| [CSI Driver for PowerStore](https://hub.docker.com/r/dellemc/csi-powerstore/tags) | v2.2 | v2.2 | v2.1 | v2.0 |
| [CSI Driver for PowerFlex](https://hub.docker.com/r/dellemc/csi-vxflexos/tags) | v2.2 | v2.2 | v2.1 | v2.0 |
| [CSI Driver for PowerMax](https://hub.docker.com/r/dellemc/csi-powermax/tags) | v2.2 | v2.2 | v2.1 | v2.0 |

## CSM Modules Support Matrix for Dell CSI Drivers 

| CSM Module        | CSI PowerFlex v2.2 | CSI PowerScale v2.2 | CSI PowerStore v2.2 | CSI PowerMax v2.2 | CSI Unity XT v2.2    |
| ----------------- | -------------- | --------------- | --------------- | ------------- | --------------- |
| Authorization v1.2| ✔️              | ✔️               | ❌              | ✔️             | ❌            |
| Observability v1.1.1 | ✔️              | ❌              | ✔️               | ❌            | ❌            |
| Replication   v1.2| ❌             | ✔️              | ✔️               | ✔️             | ❌            |
| Resilency     v1.1| ✔️              | ❌              | ❌              | ❌            | ✔️             |