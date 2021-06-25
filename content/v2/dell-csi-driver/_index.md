---
title: "Introduction"
linktitle: "Introduction"
description: About Dell EMC CSI Drivers for Kubernetes
weight: 1
---

The CSI Drivers by Dell EMC implement an interface between [CSI](https://kubernetes-csi.github.io/docs/) enabled Container Orchestrator (CO) and Dell EMC Storage Arrays. It is a plug-in that is installed into Kubernetes to provide persistent storage using Dell storage system.

The following are the drivers provided for the Dell storage family:

| Driver | PowerScale/Isilon | Unity | PowerStore | PowerFlex/VxFlex OS | PowerMax |
| - | :-: | :-: | :-: | :-: | :-: |
| Current version | v1.4  | v1.4 | v1.2 | v1.3 | v1.5 |
| [Older Versions](../archives/) | v1.3 |  v1.3 | v1.1 | v1.2 | v1.4 |

*NOTE:* This doc version is no longer supported by us. You can check our [latest version](/storage-plugin-docs/)

## Architecture

![Architecture](Architecture_Diagram.png)

## Features and capabilities

### Supported Platforms
{{<table "table table-striped table-bordered table-sm">}}

| Features      |     PowerMax     | PowerFlex/VxFlex OS |&emsp;&emsp; Unity| PowerScale/Isilon |    PowerStore    |
|---------------|:----------------:|:-------------------:|:----------------:|:-----------------:|:----------------:|
| Storage Array |5978.479.479, 5978.669.669| 3.0.x, 3.5.x | 5.0.0, 5.0.1, 5.0.2, 5.0.3| OneFS 8.1, 8.2, 9.0, 9.1 | 1.0.x |
| Kubernetes    | 1.17, 1.18, 1.19 |   1.17, 1.18, 1.19  | 1.17, 1.18, 1.19 |  1.17, 1.18, 1.19 | 1.17, 1.18, 1.19 |
| RHEL          |   7.7, 7.8, 7.9  |    7.7, 7.8, 7.9    |   7.7, 7.8, 7.9  |   7.7, 7.8, 7.9   |   7.7, 7.8, 7.9  |
| Ubuntu        |       20.04      |        20.04        |        20.04     |         20.04     |       20.04      |
| CentOS        |   7.6, 7.7, 7.8  |    7.6, 7.7, 7.8    |   7.6, 7.7, 7.8  |   7.6, 7.7, 7.8   |   7.6, 7.7, 7.8  |
| SLES          |        no        |        15SP2        |        no        |         no        |        no        |
| OpenShift     |     4.5, 4.6     |       4.5, 4.6      |     4.5, 4.6     |      4.5, 4.6     |     4.5, 4.6     |
| Docker EE     |        3.1       |         3.1         |        3.1       |        3.1        |        3.1       |
| Google Anthos |        1.5       |          no         |        no        |         no        |        1.5       |
{{</table>}}
### CSI Driver Capabilities
{{<table "table table-striped table-bordered table-sm">}}
| Features                 | PowerMax | PowerFlex/VxFlexOS | &emsp;&emsp; Unity  | PowerScale/Isilon | PowerStore |
|--------------------------|:--------:|:------------------:|:---------:|:-----------------:|:----------:|
| Static Provisioning      | yes      | yes                | yes   | yes               | yes        |
| Dynamic Provisioning     | yes      | yes                | yes   | yes               | yes        |
| Expand Persistent Volume | yes      | yes                | yes   | yes               | yes        |
| Create VolumeSnapshot    | yes      | yes                | yes   | yes               | yes        |
| Create Volume from Snapshot | yes   | yes                | yes   | yes               | yes        |
| Delete Snapshot          | yes      | yes                | yes   | yes               | yes        |
| [Access Mode](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes)         | RWO/RWX/ROX | RWO | RWO(FC/iSCSI)<br> RWO/RWX/ROX(NFS)<br>RWO/RWX/ROX(Raw block FC and iSCSI) | RWO/RWX/ROX | RWO(FC/iSCSI)<br>RWO/RWX/ROX(RawBlock, NFS) |
| CSI Volume Cloning       | yes      | yes                | yes   | yes               | yes        |
| CSI Raw Block Volume     | yes      | yes                | yes   | no                | yes        |
| CSI Ephemeral Volume     | no       | no                 | yes   | yes               | yes        |
| Topology                 | yes      | yes                | yes   | yes               | yes        |
| Multi-array              | yes (via Unisphere) | no  | yes (with single driver) | no | no     |
{{</table>}}
### Backend Storage Details
{{<table "table table-striped table-bordered table-sm">}}
| Features      | PowerMax         | VxFlexOS/PowerFlex | &emsp;&emsp;Unity| Isilon/PowerScale| PowerStore       |
|---------------|:----------------:|:------------------:|:----------------:|:----------------:|:----------------:|
| Fibre Channel | yes              | N/A                | yes              | N/A              | yes              |
| iSCSI         | yes              | N/A                | yes              | N/A              | yes              |
| NFS           | N/A              | N/A                | yes              | yes              | yes              |
| Other         | N/A              | ScaleIO protocol   | N/A              | N/A              | N/A              |
| Supported FS  | ext4 / xfs       | ext4 / xfs         | ext3 / ext4 / xfs / NFS | NFS       | ext3 / ext4 / xfs / NFS       |
| Thin / Thick provisioning | yes  | yes                | yes              | N/A              | yes              |
| Platform-specific configurable settings | Service Level selection<br>iSCSI CHAP | - | Host IO Limit<br>Tiering<br>NFS host IO size<br>Snapshot retention duration | Access Zone<br>NFS version (3 or 4) | iSCSI CHAP |
{{</table>}}

