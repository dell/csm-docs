---
title: "Support Matrix"
linkTitle: "Support Matrix"
description: Support Matrix for Container Storage Modules
no_list: true
weight: 1
---

## Storage Platforms

{{<table "table table-striped table-bordered table-sm tdleft">}}
| Prerequisites    | PowerStore         | PowerScale | PowerFlex | PowerMax | Unity XT | ObjectScale |
| :--------------: | :----------------: | :--------: | :-------: | :------: | :------: | :--:
| Version          | 3.6, 4.0, 4.1, 4.2 | OneFS 9.4, 9.5.0.x (x >= 5),<br>9.7, 9.8, 9.9, 9.10, 9.11, 9.12, 9.13 | 4.5.x, 4.6.x, 4.8.x, 5.0  | Unisphere 10.0, 10.1, 10.2, 10.3 | 5.3.x, 5.4.x, 5.5 | 4.0 |
| OS Dependencies  | iscsi-initiator-utils<br>multipathd<br>nvme-cli<br>nfs-utils | nfs-utils | [SDC](https://www.dell.com/support/home/en-us/product-support/product/scaleio/drivers)<br>nvme-cli | iscsi-initiator-utils<br>multipathd or powerpath<br>nvme-cli<br>nfs-utils | iscsi-initiator-utils<br>multipathd<br>nfs-utils | - |
{{</table>}}


**Notes:**
- Install only the OS dependencies for the protocols you use (e.g., skip `nvme-cli` if NVMe isn’t used).
- Always use the CSM and Kubernetes API for storage operations.
- Changes made outside these tools (like using storage array GUIs or CLIs) won’t be reflected in Kubernetes, leading to inaccurate metadata and state information.
- If you make external changes, manually update the Kubernetes cluster to keep everything in sync.

## Container Orchestrator Platforms

{{<table "table table-striped table-bordered table-sm tdleft">}}
| Platform                   | Version                |
|----------------------------|:----------------:      |
| Kubernetes                 | 1.33, 1.34, 1.35       |
| Red Hat OpenShift          | 4.17, 4.18, 4.19, 4.20 |
{{</table>}}

**Notes:**
- CSM Authorization Server v2 is supported on Red Hat OpenShift.

## Virtualization

 Storage operations in the virtualization environment are validated using the [Storage Checkup](https://github.com/kiagnose/kubevirt-storage-checkup), an automated diagnostic workflow that verifies storage functions required by virtual machines are operating correctly

### OpenShift Virtualization
{{<table "table table-striped table-bordered table-sm">}}
| Version      | Capability                                                                                            | PowerStore | PowerScale | PowerFlex | PowerMax | Unity XT |
|--------------|-------------------------------------------------------------------------------------------------------| :--------: | :--------: | :-------: | :------: | :------: |
| 4.17 - 4.20  | <div style="text-align: left"> Storage             </div>                                             | Yes        | No        | Yes        | Yes      | No       |
| 4.17 - 4.20  | <div style="text-align: left"> Observability        </div>                                           | Yes        | No        | Yes        | Yes      | No       |
| 4.17 - 4.20  | <div style="text-align: left"> Authorization - v2.x  </div>                                           | Yes        | No        | Yes        | Yes      | No       |
| 4.17 - 4.20  | <div style="text-align: left"> Resiliency            </div>                                           | Yes        | No        | Yes        | Yes      | No       |
| 4.17 - 4.20  | <div style="text-align: left"> Replication (Metro, Sync)	</div>                                     | Yes        | No        | No         | Yes      | No       |
| 4.17 - 4.20  | <div style="text-align: left"> Replication (Async)	</div>                                             | Yes        | No        | Yes        | Yes      | No       |
{{</table>}}
> Note: PowerStore does not support VM cloning or VM snapshot operations while Metro replication is enabled.

### SUSE Virtualization (Harvester)
{{<table "table table-striped table-bordered table-sm">}}
| Version     | Capability                                                                                            | PowerStore | PowerScale | PowerFlex | PowerMax | Unity XT |
|-------------|-------------------------------------------------------------------------------------------------------| :--------: | :--------: | :-------: | :------: | :------: |
| 1.6  | <div style="text-align: left"> Storage </div>| Yes | No   | Yes   | Yes  | No   |
| 1.5  | <div style="text-align: left"> Storage </div>| Yes | No   | Yes   | Yes   | No   |
{{</table>}}

**Notes:**
- Resiliency, Replication, Observability, and Authorization modules are not supported.
- PowerFlex 4.8 requires [SDC 3.6.6](https://quay.io/dell/storage/powerflex/sdc:3.6.6) version for compatibility.
- PowerFlex 5.0 does not support SDC for SUSE Virtualization.


### KubeVirt
{{<table "table table-striped table-bordered table-sm">}}
| Version     | Capability                                                                                            | PowerStore | PowerScale | PowerFlex | PowerMax | Unity XT |
|-------------|-------------------------------------------------------------------------------------------------------| :--------: | :--------: | :-------: | :------: | :------: |
| 1.7  | <div style="text-align: left"> Storage </div>                                                                | Yes | No   | Yes  | Yes | No    |
| 1.6  | <div style="text-align: left"> Storage </div>                                                                | Yes | No   | Yes  | Yes  | No   |
| 1.5  | <div style="text-align: left"> Storage </div>                                                                | Yes | No   | Yes  | Yes  | No   |
{{</table>}}


## Tested Host Operating Systems

- RedHat CoreOS (RHCOS) as supported by OpenShift Container Platform
- RHEL 8+
- SLES 15SP5
- Ubuntu 22.04

**Notes:**
- Ensure the host OS/version aligns with Dell Storage platform support. Check [E-Lab Navigator](https://elabnavigator.dell.com/eln/modernHomeSSM) for details.
- OS versions not listed must be self-certified using [Cert-CSI](../tooling/cert-csi/). It's recommended to use OS versions that haven't reached end of life.

## Helm Compatibility
{{<table "table table-striped table-bordered table-sm">}}
| Module           | PowerStore | PowerScale | PowerFlex | PowerMax | Unity XT | ObjectScale |
| ---------------- | ---------- |------------|-----------|----------|----------|------|
| Authorization v2 | Yes        | Yes        | Yes       | Yes      | No       | No   |
| Replication      | Yes        | Yes        | Yes       | Yes      | No       | No   |
| Observability    | Yes        | Yes        | Yes       | Yes      | No       | No   |
| Resiliency       | Yes        | Yes        | Yes       | Yes      | Yes      | No   |
{{</table>}}

**Notes:**
- In PowerFlex 5.0, the Replication feature is not supported.
- In PowerFlex 4.x, the Replication feature is not supported with NVMe/TCP mapped hosts.


## Operator Compatibility
{{<table "table table-striped table-bordered table-sm">}}
| Module           | PowerStore | PowerScale | PowerFlex | PowerMax | Unity XT | ObjectScale |
| ---------------- | ---------- |------------|-----------|----------|----------|------|
| Authorization v2 | Yes        |  Yes        | Yes      | Yes      | No       | No   |
| Replication      | Yes        |  Yes        | Yes      | Yes      | No       | No   |
| Observability    | Yes        |  Yes        | Yes      | Yes      | No       | No   |
| Resiliency       | Yes        |  Yes        | Yes      | Yes      | No       | No   |
{{</table>}}

**Notes:**
- In PowerFlex 5.0, the Replication feature is not supported.
- In PowerFlex 4.x, the Replication feature is not supported with NVMe/TCP mapped hosts.

## OpenShift Compatibility with Operator

{{<table "table table-striped table-bordered table-sm">}}
| OpenShift Version | Operator / CSM Combination |
|------------------|-------------------|
| 4.17 | 1.6.1 / 1.11.1 </br> 1.7.0 / 1.12   </br> 1.8.1 / 1.13.1 </br> 1.9.1 / 1.14.1 </br> 1.10.1 / 1.15.1 </br> 1.11.0 / 1.16.0 </br> 1.11.1 / 1.16.1 |
| 4.18 | 1.6.1 / 1.11.1 </br> 1.7.0 / 1.12   </br> 1.8.1 / 1.13.1 </br> 1.9.1 / 1.14.1 </br> 1.10.1 / 1.15.1 </br> 1.11.0 / 1.16.0 </br> 1.11.1 / 1.16.1 |
| 4.19 | 1.8.1 / 1.13.1 </br> 1.9.1 / 1.14.1 </br>  1.10.1 / 1.15.1 </br> 1.11.0 / 1.16.0 </br> 1.11.1 / 1.16.1 |
| 4.20 | 1.8.1 / 1.13.1 </br> 1.9.1 / 1.14.1 </br>  1.10.1 / 1.15.1 </br> 1.11.0 / 1.16.0 </br> 1.11.1 / 1.16.1 |
{{</ table >}}

**Note:**
- [Refer](#container-orchestrator-platforms) our supported Orchestration platform. While the Operator may be displayed, it does not necessarily mean it has been fully qualified by us.
- The PowerMax NAS server has a limitation of supporting up to 125 concurrent file systems, which in turn limits NFS usage to a maximum of 125 pods
## Installation Wizard Compatibility

### Drivers

{{<table "table table-striped table-bordered table-sm">}}
| Wizard   | PowerStore | PowerScale | PowerFlex | PowerMax | Unity XT | ObjectScale |
| -------- | ---------- |------------|-----------|----------|----------|------|
| Helm     | Yes        |  Yes        | Yes     | Yes       | No       | No   |
| Operator | Yes        |  Yes        | No      | Yes       | No       | No   |
{{</table>}}
