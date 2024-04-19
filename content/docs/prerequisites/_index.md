---
title: "Prerequisites"
linkTitle: "Prerequisites"
description: Prerequisites for CSM 
weight: 1
---

## Supported Storage Platforms

{{<table "table table-striped table-bordered table-sm">}}
| Platform      | Version          | OS Dependencies          |
|---------------|:----------------:|:------------------------:|
| PowerMax    | PowerMax 2500/8500 PowerMaxOS 10 (6079)<br>PowerMaxOS 10.0.1 (6079)<br>PowerMaxOS 10.1 (6079)<br>PowerMax 2000/8000 - 5978.711.711, 5978.714.714<br>5978.479.479<br>Unisphere 10.0,10.0.1,10.1 | iscsi-initiator-utils<br>multipathd or powerpath<br>nvme-cli<br>nfs-utils |
| PowerFlex | 3.6.x, 4.0.x, 4.5.x | [SDC](https://www.dell.com/support/home/en-us/product-support/product/scaleio/drivers)|
| Unity XT | 5.1.x, 5.2.x, 5.3.0 | iscsi-initiator-utils<br>multipathd<br>nfs-utils |
| PowerScale | OneFS 9.3, 9.4, 9.5.0.x (x >= 5) | nfs-utils |
| PowerStore  | 3.0, 3.2, 3.5, 3.6 | iscsi-initiator-utils<br>multipathd<br>nvme-cli<br>nfs-utils |
| ObjectScale | 1.2.x | - |
{{</table>}}

> Notes:
> * The required OS dependencies are only for the protocol needed (e.g. if NVMe isn't the storage access protocol then nvme-cli is not required)..

## Supported Container Orchestrator Platforms

{{<table "table table-striped table-bordered table-sm">}}
| Platform      | Version          |
|---------------|:----------------:|
| Kubernetes    | 1.27, 1.28, 1.29 |
| Red Hat OpenShift | 4.13, 4.14 |
| Mirantis Kubernetes Engine | 3.7.x |
| Google Anthos |        1.15      |
| Rancher Kubernetes Engine | 1.4.x |
| VMware Tanzu | 7.0 |
{{</table>}}

> Notes:
> * Any orchestrator platform or version that's not mentioned here must be self-certified using [Cert-CSI](../cert-csi/) in order to be supported.  Although not mandatory, we recommend users to use orchestrator platforms and versions that have not met their end of life.

## Tested Host Operating Systems

Container Storage Modules (CSM) does not officially support specific operating systems.  However, the following operating systems are known to work:
- RedHat CoreOS (RHCOS) versions as supported by OpenShift Container Platform
- RHEL 8+
- SLES 15SP5
- Ubuntu 22.04

> Notes: 
> * The host operating system/version being used must align with what each Dell Storage platform supports. Please visit [E-Lab Navigator](https://elabnavigator.dell.com/eln/modernHomeSSM) for specific Dell Storage platform host operating system level support matrices.
> * Any operating system or version that's not mentioned here must be self-certified using [Cert-CSI](../cert-csi/) in order to be supported. Although not mandatory, we recommend users to use operating systems and versions that have not met their end of life.

## Supported CSM Modules

{{<table "table table-striped table-bordered table-sm">}}
| CSM Module      | PowerMax          | PowerFlex          | Unity XT          | PowerScale          | PowerStore          |
|---------------|:----------------:|:----------------:|:----------------:|:----------------:|:----------------:|
| [CSM Authorization](../authorization/) | Yes | Yes |  Yes | Yes | No | 
| [CSM Observability](../observability/) | Yes | Yes |  No | Yes | Yes |
| [CSM Replication](../replication/) | Yes | Yes |  No | Yes | Yes |
| [CSM Resiliency](../resiliency/) | No | Yes |  Yes | Yes | Yes |
| [CSM Encryption](../secure/encryption/) | No | No |  No | Yes | No |
| [CSM Application Mobility](../applicationmobility/) | Yes | Yes |  Yes | Yes | Yes |
{{</table>}}

> Notes:
> * Encryption and Application Mobility are available as a Technical Preview only and are not officially supported.

## CSM Operator compatibility matrix

The table below lists the driver and modules versions installable with the CSM Operator:
{{<table "table table-striped table-bordered table-sm">}}
| CSI Driver         | Version | CSM Authorization | CSM Replication | CSM Observability | CSM Resiliency |
| ------------------ |---------|-------------------|-----------------|-------------------|----------------|
| CSI PowerScale     | 2.10.0   | ✔ 1.10.0           | ✔ 1.8.0        | ✔ 1.8.0           | ✔ 1.9.0       |
| CSI PowerScale     | 2.9.0   | ✔ 1.9.0           | ✔ 1.7.0        | ✔ 1.7.0           | ✔ 1.8.0       |
| CSI PowerScale     | 2.8.0   | ✔ 1.8.0           | ✔ 1.6.0        | ✔ 1.6.0           | ✔ 1.7.0       |
| CSI PowerFlex      | 2.10.0   | ✔ 1.10.0           | ✔ 1.8.0        | ✔ 1.8.0           | ✔ 1.9.0       |
| CSI PowerFlex      | 2.9.0   | ✔ 1.9.0           | ✔ 1.7.0        | ✔ 1.7.0           | ✔ 1.8.0       |
| CSI PowerFlex      | 2.8.0   | ✔ 1.8.0           | ✔ 1.6.0        | ✔ 1.6.0           | ✔ 1.7.0       |
| CSI PowerStore     | 2.10.0   | ❌                | ❌             | ❌                | ✔ 1.9.0       |
| CSI PowerStore     | 2.9.0   | ❌                | ❌             | ❌                | ✔ 1.8.0       |
| CSI PowerStore     | 2.8.0   | ❌                | ❌             | ❌                | ✔ 1.7.0       |
| CSI PowerMax       | 2.10.0   | ✔ 1.10.0           | ✔ 1.8.0        | ✔ 1.8.0           | ❌            |
| CSI PowerMax       | 2.9.0   | ✔ 1.9.0           | ✔ 1.7.0        | ✔ 1.7.0           | ❌            |
| CSI PowerMax       | 2.8.0   | ✔ 1.8.0           | ✔ 1.6.0        | ✔ 1.6.0           | ❌            |
| CSI Unity XT       | 2.10.0   | ❌                | ❌             | ❌                | ❌            |
| CSI Unity XT       | 2.9.0   | ❌                | ❌             | ❌                | ❌            |
| CSI Unity XT       | 2.8.0   | ❌                | ❌             | ❌                | ❌            |
{{</table>}}
