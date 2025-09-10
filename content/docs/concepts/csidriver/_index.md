---
title: "Container Storage Modules with CSI"
linkTitle: "Container Storage Modules with CSI"
description: About Dell Technologies (Dell) Container Storage Modules with CSI
no_list: true
weight: 3
---

The CSI Drivers implement an interface between [CSI](https://kubernetes-csi.github.io/docs/) enabled Container Orchestrator (CO) and Storage Arrays. It is a plug-in that is installed into Kubernetes to provide persistent storage using the Dell storage system.

![CSI Architecture](../../../images/csidriver/Architecture_Diagram.png)

## Features and capabilities

### CSI Driver Capabilities
{{<table "table table-striped table-bordered table-sm">}}
| Features                 | PowerStore | PowerScale | PowerFlex | PowerMax | Unity XT  |
|--------------------------|:----------:|:----------:|:---------:|:--------:|:---------:|
| <div style="text-align: left"> CSI Driver version       |    {{< version-docs key="csi_powerstore_latest_version" >}}  | {{< version-docs key="csi_powerscale_latest_version" >}}    | {{< version-docs key="csi_powerflex_latest_version" >}}    | {{< version-docs key="csi_powermax_latest_version" >}}   | {{< version-docs key="csi_unity_latest_version" >}}    |
| <div style="text-align: left"> Static Provisioning      | ✅        | ✅        | ✅       | ✅      | ✅       |
| <div style="text-align: left"> Dynamic Provisioning     | ✅        | ✅        | ✅       | ✅      | ✅       |
| <div style="text-align: left"> Expand Persistent Volume | ✅        | ✅        | ✅       | ✅      | ✅       |
| <div style="text-align: left"> Volume Snapshot    | ✅        | ✅        | ✅       | ✅ for LUN<br>❌ for NFS | ✅       |
| <div style="text-align: left"> Volume Clone | ✅        | ✅        | ✅       | ✅ for LUN<br>❌ for NFS | ✅       |
| <div style="text-align: left"> [Access Mode](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes) for [volumeMode: Filesystem](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#volume-mode)| RWO, RWOP<br><br>ROX, RWX **with NFS ONLY** | RWO, RWX, ROX, RWOP | RWO, ROX, RWOP<br><br>RWX  **with NFS ONLY** | RWO, RWOP<br><br>ROX, RWX **with NFS ONLY** | RWO, ROX, RWOP<br><br>RWX  **with NFS ONLY** |
| <div style="text-align: left"> Access Mode for `volumeMode: Block`| RWO, RWX, ROX, RWOP | Not Supported | RWX, ROX, RWOP | RWX, ROX, RWOP | RWO, RWX |
|<div style="text-align: left"> [Raw Block Volume](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#raw-block-volume-support)         | ✅      | ❌        | ✅       | ✅        | ✅        |
|<div style="text-align: left"> [CSI Ephemeral Volume](https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/#csi-ephemeral-volumes)         | ✅      | ✅       | ✅       | ❌         | ✅        |
|<div style="text-align: left"> [Generic Ephemeral Volume](https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/#generic-ephemeral-volumes) | ✅      | ✅       | ✅       | ✅        | ✅        |
| <div style="text-align: left"> Topology                 | ✅        | ✅        | ✅       | ✅      | ✅       |
| <div style="text-align: left"> Multi-array              | ✅        | ✅        | ✅       | ✅      | ✅       |
| <div style="text-align: left"> Volume Health Monitoring | ✅        | ✅        | ✅       | ✅      | ✅       |
| <div style="text-align: left"> Storage Capacity Tracking | ✅       | ✅        | ✅       | ✅      | ✅       |
| <div style="text-align: left"> Volume Limit             | ✅        | ✅        | ✅       | ✅      | ✅       |
{{</table>}}

### Storage Platform Details
{{<table "table table-striped table-bordered table-sm">}}
| Features                                     | PowerStore       | PowerScale       | PowerFlex          | PowerMax         | Unity XT         |
|----------------------------------------------|:----------------:|:----------------:|:------------------:|:----------------:|:----------------:|
| <div style="text-align: left"> Fibre Channel | ✅              | N/A              | N/A                | ✅              | ✅               |
| <div style="text-align: left"> iSCSI         | ✅              | N/A              | N/A                | ✅              | ✅               |
| <div style="text-align: left"> NVMeTCP       | ✅              | N/A              | N/A                | ✅              | N/A               |
| <div style="text-align: left"> NVMeFC        | ✅              | N/A              | N/A                | N/A              | N/A              |
| <div style="text-align: left"> NFS           | ✅              | ✅              | ✅                | ✅ - SDNAS only (❌ eNAS) | ✅      |
| <div style="text-align: left"> Other         | N/A              | N/A              | ScaleIO protocol   | N/A              | N/A              |
| <div style="text-align: left"> Supported FS  | ext3 / ext4 / xfs / NFS | NFS       | ext4 / xfs / NFS   | ext4 / xfs / NFS | ext4 / xfs / NFS |
| <div style="text-align: left"> Thin / Thick provisioning | Thin | N/A              | Thin               | Thin             | Thin/Thick       |
| <div style="text-align: left"> Platform-specific configurable settings | iSCSI CHAP | Access Zone<br>NFS version (3 or 4)<br>Configurable Export IPs | - | Service Level selection<br>iSCSI CHAP | Host IO Limit<br>Tiering Policy<br>NFS Host IO size<br>Snapshot Retention duration |
| <div style="text-align: left"> Auto RDM(vSphere)  | N/A         | N/A              | N/A                | Yes(over FC)     | N/A              |
| <div style="text-align: left"> Internet Protocol| IPv4          | IPv4             | IPv4               | IPv4             | IPv4             |
{{</table>}}

> **Note:** Please note Dual-Stack or IPv6 is not supported.

</br>
