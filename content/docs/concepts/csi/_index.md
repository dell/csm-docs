---
title: "Container Storage Modules with CSI"
linkTitle: "Container Storage Modules with CSI"
weight: 2
Description: >
  Optimizing Kubernetes Storage with Container Storage Modules - CSI
no_list: true
---

<hr> 
<style> 
h2{
  font-weight:600;
}
h3{
  font-weight:500;
} 
.mycontent{
margin-bottom:20px;
}
</style>

{{< accordion id="One" title="Overview and Core Principles" markdown="true">}} 
Container Storage Interface ([CSI](https://kubernetes-csi.github.io/docs/)) is a standardized model designed to integrate storage systems with Kubernetes and other orchestration platforms. Since Kubernetes version 1.10, CSI has been supported in beta, enabling seamless storage integration.

CSI allows storage drivers to operate independently of Kubernetes updates, providing storage vendors the flexibility to release, upgrade, and enhance their drivers on their own schedules. This ensures that Kubernetes remains a stable and reliable orchestration system while accommodating advancements in storage technology.

With Container Storage Modules (CSM) utilizing CSI, you can perform various storage operations efficiently and effectively.

<img src="./csm_arc.png" alt="CSM Architecture"></img> 

{{< /accordion >}} 

{{< accordion id="Two" title="Features Summary" markdown="true">}} 

### Core 

{{<table "table table-striped table-bordered table-sm">}}
| **Feature Category**             | **PowerStore** | **PowerScale** | **PowerFlex** | **PowerMax** | **Unity XT**  |
|--------------------------|:--------------:|:--------------:|:-------------:|:------------:|:-------------:|
| **Driver version**       | 2.13.0         | 2.13.0         | 2.13.0        | 2.13.0       | 2.13.0        |
| **Provisioning**         |                |                |               |              |               |
| Static Provisioning      | yes            | yes            | yes           | yes          | yes           |
| Dynamic Provisioning     | yes            | yes            | yes           | yes          | yes           |
| Expand Persistent Volume | yes            | yes            | yes           | yes          | yes           |
| **Volume Management**    |                |                |               |              |               |
| Volume Snapshot          | yes            | yes            | yes           | yes (LUN)<br>no (NFS) | yes       |
| Volume Clone             | yes            | yes            | yes           | yes (LUN)<br>no (NFS) | yes       |
| **Access Modes**         |                |                |               |              |               |
| Filesystem Access Mode   | RWO, RWOP<br>ROX, RWX (NFS) | RWO, RWX, ROX, RWOP | RWO, ROX, RWOP<br>RWX (NFS) | RWO, RWOP<br>ROX, RWX (NFS) | RWO, ROX, RWOP<br>RWX (NFS) |
| Block Access Mode        | RWO, RWX, ROX, RWOP | Not Supported | RWX, ROX, RWOP | RWX, ROX, RWOP | RWO, RWX |
| **Volume Types**         |                |                |               |              |               |
| Raw Block Volume         | yes            | no             | yes           | yes          | yes           |
| CSI Ephemeral Volume     | yes            | yes            | yes           | no           | yes           |
| Generic Ephemeral Volume | yes            | yes            | yes           | yes          | yes           |
| **Additional Features**  |                |                |               |              |               |
| Topology                 | yes            | yes            | yes           | yes          | yes           |
| Multi-array              | yes            | yes            | yes           | yes          | yes           |
| Volume Health Monitoring | yes            | yes            | yes           | yes          | yes           |
| Storage Capacity Tracking| yes            | yes            | yes           | yes          | yes           |
| Volume Limit             | yes            | yes            | yes           | yes          | yes           |
{{</table>}}

### Dell Storage 
{{<table "table table-striped table-bordered table-sm">}}
| **Feature Category**                  | **PowerStore** | **PowerScale** | **PowerFlex** | **PowerMax** | **Unity XT** |
|---------------------------------------|----------------|----------------|---------------|--------------|--------------|
| **Connectivity Options**              |                |                |               |              |              |
| Fibre Channel                         | Yes            | N/A            | N/A           | Yes          | Yes          |
| iSCSI                                 | Yes            | N/A            | N/A           | Yes          | Yes          |
| NVMeTCP                               | Yes            | N/A            | N/A           | Yes          | N/A          |
| NVMeFC                                | Yes            | N/A            | N/A           | N/A          | N/A          |
| **File System Support**               |                |                |               |              |              |
| NFS                                   | Yes            | Yes            | Yes           | Yes (SDNAS)  | Yes          |
| Other Protocols                       | N/A            | N/A            | ScaleIO       | N/A          | N/A          |
| **Supported File Systems**            |                |                |               |              |              |
| ext3 / ext4 / xfs / NFS               | Yes            | NFS            | Yes           | Yes          | Yes          |
| **Provisioning**                      |                |                |               |              |              |
| Thin Provisioning                     | Yes            | N/A            | Yes           | Yes          | Yes          |
| Thick Provisioning                    | N/A            | N/A            | N/A           | N/A          | Yes          |
| **Platform-Specific Configurable Settings** |          |                |               |              |              |
| iSCSI CHAP                            | Yes            | N/A            | N/A           | Yes          | N/A          |
| Access Zone                           | N/A            | Yes            | N/A           | N/A          | N/A          |
| NFS version (3 or 4); Configurable Export IPs | Yes     | N/A            | Yes           | N/A          | N/A          |
| Service Level selection               | N/A            | N/A            | N/A           | Yes          | Yes          |
| Host IO Limit                         | N/A            | N/A            | N/A           | Yes          | N/A          |
| Tiering Policy                        | N/A            | N/A            | N/A           | Yes          | N/A          |
| NFS Host IO size                      | N/A            | N/A            | N/A           | Yes          | N/A          |
| Snapshot Retention duration           | N/A            | N/A            | N/A           | Yes          | N/A          |
| **Additional Features**               |                |                |               |              |              |
| Auto RDM (vSphere)                    | N/A            | N/A            | N/A           | Yes (over FC)| N/A          |
| **Internet Protocol**                 |                |                |               |              |              |
| IPv4                                  | Yes            | Yes            | Yes           | Yes          | Yes          |
{{</table>}}

> **Note:** Please note Dual-Stack or IPv6 is not supported.

{{< /accordion >}} 



### Dell Storage Details
{{< cardcontainer >}} 

    {{< customcard  link="./powerstore"  imageNumber="3" title="PowerStore"  >}}

    {{< customcard   link="./powermax"  imageNumber="3" title="PowerMax" >}} 

    {{< customcard link="./powerflex" imageNumber="3" title="PowerFlex"  >}} 

    {{< customcard  link="./powerscale"  imageNumber="3" title="PowerScale"  >}}

    {{< customcard link="./unity"   imageNumber="3" title="Unity"  >}}

{{< /cardcontainer >}}

</br>

