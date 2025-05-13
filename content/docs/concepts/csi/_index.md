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

{{< accordion id="One" title="Overview and Core Principles" expanded="true" markdown="true">}} 
Container Storage Interface ([CSI](https://kubernetes-csi.github.io/docs/)) is a standardized model designed to integrate storage systems with Kubernetes and other orchestration platforms. Since Kubernetes version 1.10, CSI has been supported in beta, enabling seamless storage integration.

CSI allows storage drivers to operate independently of Kubernetes updates, providing storage vendors the flexibility to release, upgrade, and enhance their drivers on their own schedules. This ensures that Kubernetes remains a stable and reliable orchestration system while accommodating advancements in storage technology.

With Container Storage Modules (CSM) utilizing CSI, you can perform various storage operations efficiently and effectively.

<img src="./csm_arc.png" alt="CSM Architecture"></img> 

{{< /accordion >}} 


{{< accordion id="Two" title="Features Summary" markdown="true">}} 

### CSI Driver Capabilities
{{<table "table table-striped table-bordered table-sm">}}
| Features                 | PowerStore | PowerScale | PowerFlex | PowerMax | Unity XT  |
|--------------------------|:----------:|:----------:|:---------:|:--------:|:---------:|
| <div style="text-align: left"> Driver version       | 2.13.0     | 2.13.0     | 2.13.0    | 2.13.0   | 2.13.0    |
| <div style="text-align: left"> Static Provisioning      | yes        | yes        | yes       | yes      | yes       |
| <div style="text-align: left"> Dynamic Provisioning     | yes        | yes        | yes       | yes      | yes       |
| <div style="text-align: left"> Expand Persistent Volume | yes        | yes        | yes       | yes      | yes       |
| <div style="text-align: left"> Volume Snapshot    | yes        | yes        | yes       | yes for LUN<br>no for NFS | yes       |
| <div style="text-align: left"> Volume Clone | yes        | yes        | yes       | yes for LUN<br>no for NFS | yes       |
| <div style="text-align: left"> [Access Mode](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes) for [volumeMode: Filesystem](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#volume-mode)| RWO, RWOP<br><br>ROX, RWX **with NFS ONLY** | RWO, RWX, ROX, RWOP | RWO, ROX, RWOP<br><br>RWX  **with NFS ONLY** | RWO, RWOP<br><br>ROX, RWX **with NFS ONLY** | RWO, ROX, RWOP<br><br>RWX  **with NFS ONLY** |
| <div style="text-align: left"> Access Mode for `volumeMode: Block`| RWO, RWX, ROX, RWOP | Not Supported | RWX, ROX, RWOP | RWX, ROX, RWOP | RWO, RWX |
| [Raw Block Volume](https://kubernetes.io/docs/concepts/storage/volume-pvc-datasource/)                               | yes      | no       | yes       | yes         | yes        |
| [CSI Ephemeral Volume](https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/#csi-ephemeral-volumes)         | yes       | yes       | yes       | no        | yes        |
| [Generic Ephemeral Volume](https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/#generic-ephemeral-volumes) | yes      | yes       | yes       | yes        | yes        |
| <div style="text-align: left"> Topology                 | yes        | yes        | yes       | yes      | yes       |
| <div style="text-align: left"> Multi-array              | yes        | yes        | yes       | yes      | yes       |
| <div style="text-align: left"> Volume Health Monitoring | yes        | yes        | yes       | yes      | yes       |
| <div style="text-align: left"> Storage Capacity Tracking | yes       | yes        | yes       | yes      | yes       |
| <div style="text-align: left"> Volume Limit             | yes        | yes        | yes       | yes      | yes       |
{{</table>}}

### Dell Storage Platform 
{{<table "table table-striped table-bordered table-sm">}}
| Features      | PowerStore       | PowerScale       | PowerFlex          | PowerMax         | Unity XT         |
|---------------|:----------------:|:----------------:|:------------------:|:----------------:|:----------------:|
| <div style="text-align: left"> Fibre Channel | yes              | N/A              | N/A                | yes              | yes              |
| <div style="text-align: left"> iSCSI         | yes              | N/A              | N/A                | yes              | yes              |
| <div style="text-align: left"> NVMeTCP       | yes              | N/A              | N/A                | yes              | N/A              |
| <div style="text-align: left"> NVMeFC        | yes              | N/A              | N/A                | N/A              | N/A              |
| <div style="text-align: left"> NFS           | yes              | yes              | yes                | yes - SDNAS only (not eNAS) | yes              |
| <div style="text-align: left"> Other         | N/A              | N/A              | ScaleIO protocol   | N/A              | N/A              |
| <div style="text-align: left"> Supported FS  | ext3 / ext4 / xfs / NFS | NFS       | ext4 / xfs / NFS   | ext4 / xfs / NFS | ext4 / xfs / NFS |
| <div style="text-align: left"> Thin / Thick provisioning | Thin             | N/A              | Thin               | Thin             | Thin/Thick       |
| <div style="text-align: left"> Platform-specific configurable settings | iSCSI CHAP | Access Zone<br>NFS version (3 or 4);Configurable Export IPs | - | Service Level selection<br>iSCSI CHAP | Host IO Limit<br>Tiering Policy<br>NFS Host IO size<br>Snapshot Retention duration |
| <div style="text-align: left"> Auto RDM(vSphere)  | N/A              | N/A              | N/A                | Yes(over FC)     | N/A              |
| <div style="text-align: left"> Internet Protocol| IPv4             | IPv4             | IPv4               | IPv4             | IPv4             |
{{</table>}}

> **Note:** Please note Dual-Stack or IPv6 is not supported.

{{< /accordion >}} 

### Storage Details
{{< cardcontainer >}} 

    {{< customcard  link="./powerstore"  imageNumber="3" title="PowerStore"  >}}

    {{< customcard   link="./powermax"  imageNumber="3" title="PowerMax" >}} 

    {{< customcard link="./powerflex" imageNumber="3" title="PowerFlex"  >}} 

    {{< customcard  link="./powerscale"  imageNumber="3" title="PowerScale"  >}}

    {{< customcard link="./unity"   imageNumber="3" title="Unity"  >}}

{{< /cardcontainer >}}

</br>

