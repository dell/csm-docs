---
title: "Support Matrix"
linkTitle: "Support Matrix"
description: Support Matrix for Container Storage Modules
no_list: true
weight: 1
---

## Storage Platforms

{{<table "table table-striped table-bordered table-sm tdleft">}}
| Prerequisites    | PowerStore         | PowerScale | PowerFlex | PowerMax | Unity XT |
| :--------------: | :----------------: | :--------: | :-------: | :------: | :------: |
| Version          | 3.6, 4.0, 4.1, 4.2 | OneFS 9.4, 9.5.0.x (x >= 5),<br>9.7, 9.8, 9.9, 9.10, 9.11, 9.12 | 3.6.x, 4.5.x, 4.6.x, 5.0  | Unisphere 10.0, 10.1, 10.2 | 5.3.x, 5.4.x, 5.5 |
| OS Dependencies  | iscsi-initiator-utils<br>multipathd<br>nvme-cli<br>nfs-utils | nfs-utils | [SDC](https://www.dell.com/support/home/en-us/product-support/product/scaleio/drivers) | iscsi-initiator-utils<br>multipathd or powerpath<br>nvme-cli<br>nfs-utils | iscsi-initiator-utils<br>multipathd<br>nfs-utils |
{{</table>}}


**Notes:**
- Install only the OS dependencies for the protocols you use (e.g., skip `nvme-cli` if NVMe isn’t used).
- Always use the CSM and Kubernetes API for storage operations.
- Changes made outside these tools (like using storage array GUIs or CLIs) won’t be reflected in Kubernetes, leading to inaccurate metadata and state information.
- If you make external changes, manually update the Kubernetes cluster to keep everything in sync.

## Container Orchestrator Platforms

{{<table "table table-striped table-bordered table-sm tdleft">}}
| Platform                   | Version          |
|----------------------------|:----------------:|
| Kubernetes                 | 1.32, 1.33, 1.34 |
| Red Hat OpenShift          | 4.18, 4.19       |
| Mirantis Kubernetes Engine | 3.7.x            |
{{</table>}}

**Notes:**
- CSM Authorization Server v2 is supported on Red Hat OpenShift.

## OpenShift Virtualization
{{<table "table table-striped table-bordered table-sm">}}
| Version     | Capability                                                                                            | PowerStore | PowerScale | PowerFlex | PowerMax | Unity XT |
|-------------|-------------------------------------------------------------------------------------------------------| :--------: | :--------: | :-------: | :------: | :------: |
| 4.18 - 4.19  | <div style="text-align: left"> [Storage](https://github.com/kiagnose/kubevirt-storage-checkup) </div>| Yes         | No        | Yes        | Yes      | No       |
| 4.18 - 4.19  | <div style="text-align: left">  Observability        </div>                                          | Yes          | No        | Yes        | Yes      | No       |
| 4.18 - 4.19  | <div style="text-align: left"> Authorization - v2.x  </div>                                          | Yes         | No        | Yes        | Yes      | No       |
| 4.18 - 4.19  | <div style="text-align: left"> Resiliency            </div>                                          | Yes         | No        | Yes        | Yes      | No       |
| 4.18 - 4.19  | <div style="text-align: left"> Replication (Metro, Sync)	</div>                                    | Yes         | No        | No        | Yes       | No       |
| 4.18 - 4.19  | <div style="text-align: left"> Replication (Async)	</div>                                            | Yes         | No        | Yes       | Yes       | No       |
{{</table>}}
> Note: PowerStore does not support VM cloning or VM snapshot operations while Metro replication is enabled.

## SUSE Virtualization (Harvester)
{{<table "table table-striped table-bordered table-sm">}}
| Version     | Capability                                                                                            | PowerStore | PowerScale | PowerFlex | PowerMax | Unity XT |
|-------------|-------------------------------------------------------------------------------------------------------| :--------: | :--------: | :-------: | :------: | :------: |
| 1.5.2  | <div style="text-align: left"> [Storage](https://github.com/ibrokethecloud/kubevirt-storage-checkup/tree/harvester-v1.5.x) </div>| Yes | No   | Yes  | Yes  | No   |
| 1.6.1  | <div style="text-align: left"> [Storage](https://github.com/ibrokethecloud/kubevirt-storage-checkup/tree/harvester-v1.5.x) </div>| Yes | No   | Yes   | Yes  | No   |
{{</table>}}

**Notes:**
- PowerStore and PowerMax support iSCSI and NVMe/TCP.
- PowerFlex supports SDC and NVMe/TCP for SUSE Virtualization.
- SDC version [3.6.6](https://quay.io/dell/storage/powerflex/sdc:3.6.6) is supported on SUSE.
- PowerFlex version 5.0 does not support SDC on SUSE.

## Tested Host Operating Systems

Container Storage Modules doesn't officially support specific operating systems, but the following are known to work:

- RedHat CoreOS (RHCOS) as supported by OpenShift Container Platform
- RHEL 8+
- SLES 15SP5
- Ubuntu 22.04

**Notes:**
- Ensure the host OS/version aligns with Dell Storage platform support. Check [E-Lab Navigator](https://elabnavigator.dell.com/eln/modernHomeSSM) for details.
- OS versions not listed must be self-certified using [Cert-CSI](../tooling/cert-csi/). It's recommended to use OS versions that haven't reached end of life.

## Helm Compatibility
{{<table "table table-striped table-bordered table-sm">}}
| Module           | PowerStore | PowerScale | PowerFlex | PowerMax | Unity XT |
| ---------------- | ---------- |------------|-----------|----------|----------|
| Authorization v2 | Yes        | Yes        | Yes       | Yes       | No      |
| Replication      | Yes        | Yes        | Yes       | Yes       | No      |
| Observability    | Yes        | Yes        | Yes       | Yes       | No      |
| Resiliency       | Yes        | Yes        | Yes       | Yes       | Yes     |
{{</table>}}

**Notes:**
- In PowerFlex 5.0, the Replication feature is not supported.
- In PowerFlex 4.x, the Replication feature is not supported with NVMe/TCP mapped hosts.


## Operator Compatibility
{{<table "table table-striped table-bordered table-sm">}}
| Module           | PowerStore | PowerScale | PowerFlex | PowerMax | Unity XT |
| ---------------- | ---------- |------------|-----------|----------|----------|
| Authorization v2 | Yes        |  Yes        | Yes       | Yes      | No      |
| Replication      | Yes        |  Yes        | Yes       | Yes      | No      |
| Observability    | Yes        |  Yes        | Yes       | Yes      | No      |
| Resiliency       | Yes        |  Yes        | Yes       | Yes      | No      |
{{</table>}}

**Notes:**
- In PowerFlex 5.0, the Replication feature is not supported.
- In PowerFlex 4.x, the Replication feature is not supported with NVMe/TCP mapped hosts.

## OpenShift Compatibility with Operator

{{<table "table table-striped table-bordered table-sm">}}
| OpenShift Version | Operator / CSM Combination |
|------------------|-------------------|
| 4.14 | 1.4.4 / 1.10.2 </br> 1.5.1 / 1.10.2 </br> 1.6.1 / 1.11.1 </br> 1.7.0 / 1.12   </br> 1.8.1 / 1.13.1  </br> 1.9.1 / 1.14.1 </br>  1.10.1 / 1.15.1 |
| 4.16 | 1.6.1 / 1.11.1 </br> 1.7.0 / 1.12   </br> 1.8.1 / 1.13.1 </br> 1.9.1 / 1.14.1 </br> 1.10.1 / 1.15.1 |
| 4.17 | 1.6.1 / 1.11.1 </br> 1.7.0 / 1.12   </br> 1.8.1 / 1.13.1 </br> 1.9.1 / 1.14.1 </br> 1.10.1 / 1.15.1 |
| 4.18 | 1.6.1 / 1.11.1 </br> 1.7.0 / 1.12   </br> 1.8.1 / 1.13.1 </br> 1.9.1 / 1.14.1 </br> 1.10.1 / 1.15.1 |
| 4.19 | 1.8.1 / 1.13.1 </br> 1.9.1 / 1.14.1 </br>  1.10.1 / 1.15.1 |
{{</ table >}}

**Note:**
- [Refer](#container-orchestrator-platforms) our supported Orchestration platform. While the Operator may be displayed, it does not necessarily mean it has been fully qualified by us.
## Installation Wizard Compatibility

### Drivers

{{<table "table table-striped table-bordered table-sm">}}
| Wizard   | PowerStore | PowerScale | PowerFlex | PowerMax | Unity XT |
| -------- | ---------- |------------|-----------|----------|----------|
| Helm     | Yes        |  Yes        | Yes     | Yes       | No       |
| Operator | Yes        |  Yes        | No      | Yes       | No       |
{{</table>}}
