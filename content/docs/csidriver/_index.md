
---
title: "CSI Drivers"
linkTitle: "CSI Drivers"
description: About Dell Technologies (Dell) CSI Drivers 
weight: 3
---

The CSI Drivers by Dell implement an interface between [CSI](https://kubernetes-csi.github.io/docs/) (CSI spec v1.5) enabled Container Orchestrator (CO) and Dell Storage Arrays. It is a plug-in that is installed into Kubernetes to provide persistent storage using Dell storage system.

![CSI Architecture](Architecture_Diagram.png)

## Features and capabilities

### Supported Operating Systems/Container Orchestrator Platforms
{{<table "table table-striped table-bordered table-sm">}}
|               | PowerMax         | PowerFlex           | Unity XT         | PowerScale        | PowerStore       |
|---------------|:----------------:|:-------------------:|:----------------:|:-----------------:|:----------------:|
| Kubernetes    | 1.22, 1.23, 1.24 | 1.22, 1.23, 1.24    | 1.22, 1.23, 1.24 | 1.22, 1.23, 1.24  | 1.22, 1.23, 1.24 |
| RHEL          |     7.x,8.x      |     7.x,8.x         |     7.x,8.x      |     7.x,8.x       |     7.x,8.x      |
| Ubuntu        |       20.04      |       20.04         |  18.04, 20.04    | 18.04, 20.04      |        20.04     |
| CentOS        |     7.8, 7.9     |      7.8, 7.9       |     7.8, 7.9     |      7.8, 7.9     |     7.8, 7.9     |
| SLES          |        15SP3     |        15SP3        |       15SP3      |         15SP3     |       15SP3      |
| Red Hat OpenShift | 4.9, 4.10, 4.10 EUS | 4.9, 4.10, 4.10 EUS | 4.9, 4.10, 4.10 EUS | 4.9, 4.10, 4.10 EUS | 4.9, 4.10, 4.10 EUS |
| Mirantis Kubernetes Engine | 3.5.x |      3.5.x        |       3.5.x      |        3.5.x      |        3.5.x     |
| Google Anthos |        1.9       |          1.8        |        no        |         1.9       |        1.9       |
| VMware Tanzu  |        no        |          no         |        NFS       |         NFS       |      NFS         |
| Rancher Kubernetes Engine | yes  |          yes        |        yes       |         yes       |      yes         |
| Amazon Elastic Kubernetes Service<br> Anywhere | no  |          yes        |        no       |         no       |      yes      |

{{</table>}}

### CSI Driver Capabilities
{{<table "table table-striped table-bordered table-sm">}}
| Features                 | PowerMax | PowerFlex | Unity XT  | PowerScale | PowerStore |
|--------------------------|:--------:|:---------:|:---------:|:----------:|:----------:|
| CSI Driver version       | 2.3.0    | 2.3.0     | 2.3.0     | 2.3.0      | 2.3.0      |
| Static Provisioning      | yes      | yes       | yes       | yes        | yes        |
| Dynamic Provisioning     | yes      | yes       | yes       | yes        | yes        |
| Expand Persistent Volume | yes      | yes       | yes       | yes        | yes        |
| Create VolumeSnapshot    | yes      | yes       | yes       | yes        | yes        |
| Create Volume from Snapshot | yes   | yes       | yes       | yes        | yes        |
| Delete Snapshot          | yes      | yes       | yes       | yes        | yes        |
| [Access Mode](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes)| **FC/iSCSI:**<br>RWO/<br>RWOP<br>**Raw block:**<br>RWO/<br>RWX/<br>ROX/<br>RWOP | RWO/ROX/RWOP<br><br>RWX (Raw block only) | RWO/ROX/RWOP<br><br>RWX (Raw block & NFS only) | RWO/RWX/ROX/<br>RWOP | RWO/RWOP<br>(FC/iSCSI)<br>RWO/<br>RWX/<br>ROX/<br>RWOP<br>(RawBlock, NFS) |
| CSI Volume Cloning       | yes      | yes       | yes       | yes        | yes        |
| CSI Raw Block Volume     | yes      | yes       | yes       | no         | yes        |
| CSI Ephemeral Volume     | no       | yes       | yes       | yes        | yes        |
| Topology                 | yes      | yes       | yes       | yes        | yes        |
| Multi-array              | yes      | yes       | yes       | yes        | yes        |
| Volume Health Monitoring | yes      | yes       | yes       | yes        | yes        |
{{</table>}}
### Supported Storage Platforms
{{<table "table table-striped table-bordered table-sm">}}
|               | PowerMax                                                | PowerFlex        | Unity XT                   | PowerScale                         |    PowerStore    |
|---------------|:-------------------------------------------------------:|:----------------:|:--------------------------:|:----------------------------------:|:----------------:|
| Storage Array |5978.479.479, 5978.711.711<br>Unisphere 9.2|    3.5.x, 3.6.x  | 5.0.7, 5.1.0, 5.1.2 | OneFS 8.1, 8.2, 9.0, 9.1, 9.2, 9.3 | 1.0.x, 2.0.x, 2.1.x     |
{{</table>}}
### Backend Storage Details
{{<table "table table-striped table-bordered table-sm">}}
| Features      | PowerMax         | PowerFlex          | Unity XT         | PowerScale       | PowerStore       |
|---------------|:----------------:|:------------------:|:----------------:|:----------------:|:----------------:|
| Fibre Channel | yes              | N/A                | yes              | N/A              | yes              |
| iSCSI         | yes              | N/A                | yes              | N/A              | yes              |
| NVMeTCP       | N/A              | N/A                | N/A              | N/A              | yes              |
| NVMeFC        | N/A              | N/A                | N/A              | N/A              | yes              |
| NFS           | N/A              | N/A                | yes              | yes              | yes              |
| Other         | N/A              | ScaleIO protocol   | N/A              | N/A              | N/A              |
| Supported FS  | ext4 / xfs       | ext4 / xfs         | ext3 / ext4 / xfs / NFS | NFS       | ext3 / ext4 / xfs / NFS |
| Thin / Thick provisioning | Thin  | Thin              | Thin/Thick       | N/A              | Thin             |
| Platform-specific configurable settings | Service Level selection<br>iSCSI CHAP | - | Host IO Limit<br>Tiering Policy<br>NFS Host IO size<br>Snapshot Retention duration | Access Zone<br>NFS version (3 or 4);Configurable Export IPs | iSCSI CHAP |
{{</table>}}
