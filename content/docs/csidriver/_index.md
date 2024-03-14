
---
title: "CSI Drivers"
linkTitle: "CSI Drivers"
description: About Dell Technologies (Dell) CSI Drivers 
weight: 3
---

The CSI Drivers by Dell implement an interface between [CSI](https://kubernetes-csi.github.io/docs/) (CSI spec v1.6) enabled Container Orchestrator (CO) and Dell Storage Arrays. It is a plug-in that is installed into Kubernetes to provide persistent storage using the Dell storage system.

![CSI Architecture](Architecture_Diagram.png)

## Features and capabilities

### CSI Driver Capabilities
{{<table "table table-striped table-bordered table-sm">}}
| Features                 | PowerMax | PowerFlex | Unity XT  | PowerScale | PowerStore |
|--------------------------|:--------:|:---------:|:---------:|:----------:|:----------:|
| CSI Driver version       | 2.10.0    | 2.10.0     | 2.10.0     | 2.10.0      | 2.10.0      |
| Static Provisioning      | yes      | yes       | yes       | yes        | yes        |
| Dynamic Provisioning     | yes      | yes       | yes       | yes        | yes        |
| Expand Persistent Volume | yes      | yes       | yes       | yes        | yes        |
| Create VolumeSnapshot    | yes for LUN<br>no for NFS | yes       | yes       | yes        | yes        |
| Create Volume from Snapshot | yes for LUN<br>no for NFS | yes       | yes       | yes        | yes        |
| Delete Snapshot          | yes for LUN<br>no for NFS | yes       | yes       | yes        | yes        |
| [Access Mode](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes) for [volumeMode: Filesystem](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#volume-mode)| RWO, RWOP<br><br>ROX, RWX **with NFS ONLY**| RWO, ROX, RWOP<br><br>RWX  **with NFS ONLY** | RWO, ROX, RWOP<br><br>RWX  **with NFS ONLY** | RWO, RWX, ROX, RWOP | RWO, RWOP<br><br>ROX, RWX **with NFS ONLY** |
| Access Mode for `volumeMode: Block`| RWO, RWX, ROX, RWOP | RWO, RWX, ROX, RWOP |RWO, RWX, ROX, RWOP |Not Supported | RWO, RWX, ROX, RWOP |
| CSI Volume Cloning       | yes for LUN<br>no for NFS       | yes       | yes       | yes        | yes        |
| CSI Raw Block Volume     | yes      | yes       | yes       | no         | yes        |
| CSI Ephemeral Volume     | no       | yes       | yes       | yes        | yes        |
| Topology                 | yes      | yes       | yes       | yes        | yes        |
| Multi-array              | yes      | yes       | yes       | yes        | yes        |
| Volume Health Monitoring | yes      | yes       | yes       | yes        | yes        |
| Storage Capacity Tracking | yes     | yes       | yes       | yes        | yes        |
| Volume Limit             | yes      | yes       | yes       | yes        | yes        |
{{</table>}}
### Supported Storage Platforms
{{<table "table table-striped table-bordered table-sm">}}
|               | PowerMax                                                | PowerFlex        | Unity XT                   | PowerScale                         |    PowerStore    |
|---------------|:-------------------------------------------------------:|:----------------:|:--------------------------:|:----------------------------------:|:----------------:|
| Storage Array | PowerMax 2500/8500 PowerMaxOS 10 (6079) , PowerMaxOS 10.0.1 (6079) , PowerMaxOS 10.1 (6079)<br> PowerMax 2000/8000 - 5978.711.xxx, 5978.479.xxx <br>Unisphere 10.0,10.0.1,10.1 |    3.6.x, 4.0.x, 4.5.x  | 5.1.x, 5.2.x, 5.3.0 | OneFS 9.3, 9.4, 9.5.0.x (x >=5) | 3.0, 3.2, 3.5, 3.6    |
{{</table>}}

### Backend Storage Details
{{<table "table table-striped table-bordered table-sm">}}
| Features      | PowerMax         | PowerFlex          | Unity XT         | PowerScale       | PowerStore       |
|---------------|:----------------:|:------------------:|:----------------:|:----------------:|:----------------:|
| Fibre Channel | yes              | N/A                | yes              | N/A              | yes              |
| iSCSI         | yes              | N/A                | yes              | N/A              | yes              |
| NVMeTCP       | N/A              | N/A                | N/A              | N/A              | yes              |
| NVMeFC        | N/A              | N/A                | N/A              | N/A              | yes              |
| NFS           | yes - SDNAS only (not eNAS)   | yes   | yes              | yes              | yes              |
| Other         | N/A              | ScaleIO protocol   | N/A              | N/A              | N/A              |
| Supported FS  | ext4 / xfs / NFS | ext4 / xfs / NFS   | ext4 / xfs / NFS | NFS       | ext3 / ext4 / xfs / NFS |
| Thin / Thick provisioning | Thin | Thin               | Thin/Thick       | N/A              | Thin             |
| Platform-specific configurable settings | Service Level selection<br>iSCSI CHAP | - | Host IO Limit<br>Tiering Policy<br>NFS Host IO size<br>Snapshot Retention duration | Access Zone<br>NFS version (3 or 4);Configurable Export IPs | iSCSI CHAP |
| Auto RDM(vSphere)  | Yes(over FC) | N/A               | N/A              | N/A              | N/A              |
{{</table>}}

### Community Qualified Platforms
{{<table "table table-striped table-bordered table-sm">}}
| cert-csi results                                       | OS         | CO               | Storage Platform        | Protocol  | CSM        |
|--------------------------------------------------------|:----------:|:----------------:|:-----------------------:|:---------:|:----------:|
| [Ticket 1079](https://github.com/dell/csm/issues/1079) | Debian 10  | K3s v1.24.7+k3s1 | Unity VSA 5.3.1.0.5.008 | iSCSI     | CSI v1.8.0 |

{{</table>}}
