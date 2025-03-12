---
title: "CSI Drivers"
linkTitle: "CSI Drivers"
description: About Dell Technologies (Dell) CSI Drivers 
no_list: true 
weight: 3
---

The CSI Drivers implement an interface between [CSI](https://kubernetes-csi.github.io/docs/) (CSI spec v1.6) enabled Container Orchestrator (CO) and Storage Arrays. It is a plug-in that is installed into Kubernetes to provide persistent storage using the Dell storage system.

![CSI Architecture](../../../images/csidriver/Architecture_Diagram.png)

## Features and capabilities

### CSI Driver Capabilities
{{<table "table table-striped table-bordered table-sm">}}
| Features                 | PowerMax | PowerFlex | Unity XT  | PowerScale | PowerStore |
|--------------------------|:--------:|:---------:|:---------:|:----------:|:----------:|
| <div style="text-align: left"> CSI Driver version       | 2.13.0   | 2.13.0    | 2.13.0    | 2.13.0     | 2.13.0     |
| <div style="text-align: left"> Static Provisioning      | yes      | yes       | yes       | yes        | yes        |
| <div style="text-align: left"> Dynamic Provisioning     | yes      | yes       | yes       | yes        | yes        |
| <div style="text-align: left"> Expand Persistent Volume | yes      | yes       | yes       | yes        | yes        |
| <div style="text-align: left"> Create VolumeSnapshot    | yes for LUN<br>no for NFS | yes       | yes       | yes        | yes        |
| <div style="text-align: left"> Create Volume from Snapshot | yes for LUN<br>no for NFS | yes       | yes       | yes        | yes        |
| <div style="text-align: left"> Delete Snapshot          | yes for LUN<br>no for NFS | yes       | yes       | yes        | yes        |
| <div style="text-align: left"> [Access Mode](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes) for [volumeMode: Filesystem](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#volume-mode)| RWO, RWOP<br><br>ROX, RWX **with NFS ONLY**| RWO, ROX, RWOP<br><br>RWX  **with NFS ONLY** | RWO, ROX, RWOP<br><br>RWX  **with NFS ONLY** | RWO, RWX, ROX, RWOP | RWO, RWOP<br><br>ROX, RWX **with NFS ONLY** |
| <div style="text-align: left"> Access Mode for `volumeMode: Block`| RWX, ROX, RWOP | RWX, ROX, RWOP | RWO, RWX | Not Supported | RWO, RWX, ROX, RWOP |
| <div style="text-align: left"> CSI Volume Cloning       | yes for LUN<br>no for NFS       | yes for LUN<br>no for NFS       | yes       | yes        | yes        |
| <div style="text-align: left"> CSI Raw Block Volume     | yes      | yes       | yes       | no         | yes        |
| <div style="text-align: left"> CSI Ephemeral Volume     | no       | yes       | yes       | yes        | yes        |
| <div style="text-align: left"> Topology                 | yes      | yes       | yes       | yes        | yes        |
| <div style="text-align: left"> Multi-array              | yes      | yes       | yes       | yes        | yes        |
| <div style="text-align: left"> Volume Health Monitoring | yes      | yes       | yes       | yes        | yes        |
| <div style="text-align: left"> Storage Capacity Tracking | yes     | yes       | yes       | yes        | yes        |
| <div style="text-align: left"> Volume Limit             | yes      | yes       | yes       | yes        | yes        |
{{</table>}}

### Storage Platform Details
{{<table "table table-striped table-bordered table-sm">}}
| Features      | PowerMax         | PowerFlex          | Unity XT         | PowerScale       | PowerStore       |
|---------------|:----------------:|:------------------:|:----------------:|:----------------:|:----------------:|
| <div style="text-align: left"> Fibre Channel | yes              | N/A                | yes              | N/A              | yes              |
| <div style="text-align: left"> iSCSI         | yes              | N/A                | yes              | N/A              | yes              |
| <div style="text-align: left"> NVMeTCP       | yes              | N/A                | N/A              | N/A              | yes              |
| <div style="text-align: left"> NVMeFC        | N/A              | N/A                | N/A              | N/A              | yes              |
| <div style="text-align: left"> NFS           | yes - SDNAS only (not eNAS)   | yes   | yes              | yes              | yes              |
| <div style="text-align: left"> Other         | N/A              | ScaleIO protocol   | N/A              | N/A              | N/A              |
| <div style="text-align: left"> Supported FS  | ext4 / xfs / NFS | ext4 / xfs / NFS   | ext4 / xfs / NFS | NFS       | ext3 / ext4 / xfs / NFS |
| <div style="text-align: left"> Thin / Thick provisioning | Thin | Thin               | Thin/Thick       | N/A              | Thin             |
| <div style="text-align: left"> Platform-specific configurable settings | Service Level selection<br>iSCSI CHAP | - | Host IO Limit<br>Tiering Policy<br>NFS Host IO size<br>Snapshot Retention duration | Access Zone<br>NFS version (3 or 4);Configurable Export IPs | iSCSI CHAP |
| <div style="text-align: left"> Auto RDM(vSphere)  | Yes(over FC) | N/A               | N/A              | N/A              | N/A              |
|<div style="text-align: left"> Internet Protocol| IPv4 | IPv4               | IPv4             | IPv4              | IPv4             |
{{</table>}}

> **Note:** Please note Dual-Stack or IPv6 is not supported.

</br>
