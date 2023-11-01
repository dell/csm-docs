
---
title: "CSI Drivers"
linkTitle: "CSI Drivers"
description: About Dell Technologies (Dell) CSI Drivers 
weight: 3
---

The CSI Drivers by Dell implement an interface between [CSI](https://kubernetes-csi.github.io/docs/) (CSI spec v1.5) enabled Container Orchestrator (CO) and Dell Storage Arrays. It is a plug-in that is installed into Kubernetes to provide persistent storage using the Dell storage system.

![CSI Architecture](Architecture_Diagram.png)

## Features and capabilities

### Supported Container Orchestrator Platforms

{{<table "table table-striped table-bordered table-sm">}}
|               | PowerMax         | PowerFlex           | Unity XT         | PowerScale        | PowerStore       |
|---------------|:----------------:|:-------------------:|:----------------:|:-----------------:|:----------------:|
| Kubernetes    | 1.25, 1.26, 1.27 | 1.25, 1.26, 1.27    | 1.25, 1.26, 1.27 | 1.25, 1.26, 1.27  | 1.25, 1.26, 1.27 |
| Red Hat OpenShift | 4.12, 4.12 EUS, 4.13 | 4.12, 4.12 EUS, 4.13 | 4.12, 4.12 EUS, 4.13 | 4.12, 4.12 EUS, 4.13 | 4.12, 4.13, 4.13 EUS |
| Mirantis Kubernetes Engine | 3.6.x |     3.6.x         |       3.6.x      | 3.5.x, 3.6.x      |        3.6.x     |
| Google Anthos |        1.15      |          1.15       |        no        |         1.15      |        1.15      |
| VMware Tanzu  |        no        |          no         |        NFS       |         NFS       |      NFS,iSCSI   |
| Rancher Kubernetes Engine | 1.4.1|          1.4.7      |        1.4.8     |         1.4.7     |      1.4.5       |
| Amazon Elastic Kubernetes Service<br> Anywhere | yes  | yes  |   yes      |        yes        |      yes         |
| Kubernetes K3s Engine on Debian OS |     no    |  no   |      1.26, 1.27  |        no         |        no        |
| OS dependencies | iscsi-initiator-utils<br>multipathd or powerpath<br>nvme-cli<br>nfs-utils | - |    iscsi-initiator-utils<br>multipathd<br>nfs-utils | nfs-utils | iscsi-initiator-utils<br>multipathd<br>nvme-cli<br>nfs-utils |
{{</table>}}

> Notes:
> * The required OS packages are only for the protocol needed (e.g. if NVMe isn't the storage access protocol then nvme-cli is not required).
> * Internal testing is done for RHEL and SLES only, to confirm another OS is fully compatible, all [cert-csi tests](installation/test/certcsi) must pass successfully.
> * Please visit [E-Lab Navigator](https://elabnavigator.dell.com/eln/modernHomeSSM) for specific Dell Storage System OS level support matrices.

### CSI Driver Capabilities
{{<table "table table-striped table-bordered table-sm">}}
| Features                 | PowerMax | PowerFlex | Unity XT  | PowerScale | PowerStore |
|--------------------------|:--------:|:---------:|:---------:|:----------:|:----------:|
| CSI Driver version       | 2.8.0    | 2.8.0     | 2.8.0     | 2.8.0      | 2.8.0      |
| Static Provisioning      | yes      | yes       | yes       | yes        | yes        |
| Dynamic Provisioning     | yes      | yes       | yes       | yes        | yes        |
| Expand Persistent Volume | yes      | yes       | yes       | yes        | yes        |
| Create VolumeSnapshot    | yes      | yes       | yes       | yes        | yes        |
| Create Volume from Snapshot | yes   | yes       | yes       | yes        | yes        |
| Delete Snapshot          | yes      | yes       | yes       | yes        | yes        |
| [Access Mode](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes) for [volumeMode: Filesystem](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#volume-mode)| RWO, RWOP<br><br>ROX, RWX **with NFS ONLY**| RWO, ROX, RWOP<br><br>RWX  **with NFS ONLY** | RWO, ROX, RWOP<br><br>RWX  **with NFS ONLY** | RWO, RWX, ROX, RWOP | RWO, RWOP<br><br>ROX, RWX **with NFS ONLY** |
| Access Mode for `volumeMode: Block`| RWO, RWX, ROX, RWOP | RWO, RWX, ROX, RWOP |RWO, RWX, ROX, RWOP |Not Supported | RWO, RWX, ROX, RWOP |
| CSI Volume Cloning       | yes      | yes       | yes       | yes        | yes        |
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
| Storage Array | PowerMax 2500/8500 PowerMaxOS 10 (6079) , PowerMaxOS 10.0.1 (6079) <br> PowerMax 2000/8000 - 5978.711.xxx, 5978.479.xxx <br>Unisphere 10.0,10.0.1 |    3.5.x, 3.6.x, 4.0.x, 4.5  | 5.1.x, 5.2.x, 5.3.0 | OneFS 8.1, 8.2, 9.0, 9.1, 9.2, 9.3, 9.4, 9.5.0.4 | 2.0.x, 2.1.x, 3.0, 3.2, 3.5     |
{{</table>}}

>Note: To connect to a PowerFlex 4.5 array, the SDC image will need to be changed to dellemc/sdc:4.5.
>- If using helm to install, you will need to make this change in your values.yaml file. See [helm install documentation](https://dell.github.io/csm-docs/docs/csidriver/installation/helm/powerflex/) for details.
>- If using CSM-Operator to install, you will need to make this change in your samples file. See [operator install documentation](https://dell.github.io/csm-docs/docs/deployment/csmoperator/drivers/powerflex/) for details.

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
