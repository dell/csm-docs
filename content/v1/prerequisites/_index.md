---
title: "Prerequisites and Support Matrix"
linkTitle: "Prerequisites and Support Matrix"
description: Prerequisites and Support Matrix for CSM 
weight: 1
---

## Supported Storage Platforms

{{<table "table table-striped table-bordered table-sm">}}
| Platform      | Version          | OS Dependencies          |
|---------------|:----------------:|:------------------------:|
| PowerMax    | PowerMax 2500/8500 PowerMaxOS 10 (6079)<br>PowerMaxOS 10.0.1 (6079)<br>PowerMaxOS 10.1 (6079)<br>PowerMax 2000/8000 - 5978.711.711, 5978.714.714<br>5978.479.479<br>Unisphere 10.0,10.0.1,10.1 | iscsi-initiator-utils<br>multipathd or powerpath<br>nvme-cli<br>nfs-utils |
| PowerFlex | 3.6.x, 4.5.x, 4.6.x | [SDC](https://www.dell.com/support/home/en-us/product-support/product/scaleio/drivers)|
| Unity XT | 5.2.x, 5.3.0, 5.4.x  | iscsi-initiator-utils<br>multipathd<br>nfs-utils |
| PowerScale | OneFS 9.4, 9.5.0.x (x >= 5), 9.7 | nfs-utils |
| PowerStore  | 3.0, 3.2, 3.5, 3.6 | iscsi-initiator-utils<br>multipathd<br>nvme-cli<br>nfs-utils |
| ObjectScale | 1.2.x | - |
{{</table>}}

> Notes:
> * The required OS dependencies are only for the protocol needed (e.g. if NVMe isn't the storage access protocol then nvme-cli is not required)..
> * It is important to note that any operations performed outside of the CSM and Kubernetes ecosystem, such as modifying storage configurations directly using GUI or CLI tools provided by the storage array, may not be supported or automatically picked up by the CSM. As a result, metadata and state information within Kubernetes, including Persistent Volume (PV) metadata, may not reflect changes made outside of the driver. For consistent and accurate management of storage resources, it is recommended to perform all operations through the CSM and Kubernetes API. If external modifications are necessary, corresponding updates should be manually synchronized with the Kubernetes cluster to ensure accurate metadata and functionality.

## Supported Container Orchestrator Platforms

{{<table "table table-striped table-bordered table-sm">}}
| Platform                   | Version          |
|----------------------------|:----------------:|
| Kubernetes                 | 1.28, 1.29, 1.30 |
| Red Hat OpenShift          | 4.15, 4.16       |
| Mirantis Kubernetes Engine | 3.7.x            |
| Google Anthos              | 1.15             |
| Rancher Kubernetes Engine  | 1.4.x            |
| VMware Tanzu               | 7.0              |
{{</table>}}

> Notes:
> * Any orchestrator platform or version that's not mentioned here must be self-certified using [Cert-CSI](../support/cert-csi/) in order to be supported.  Although not mandatory, we recommend users to use orchestrator platforms and versions that have not met their end of life.
> * CSM Authorization Server v1 is not supported on Red Hat OpenShift. However, it is supported to install CSM Authorization Server v1 on standard Kubernetes and a Dell CSI Drvier enabled with CSM Authorization on Red Hat OpenShift. CSM Authorization Server v2 is supported on Red Hat OpenShift.

## Tested Host Operating Systems

Container Storage Modules (CSM) does not officially support specific operating systems.  However, the following operating systems are known to work:
- RedHat CoreOS (RHCOS) versions as supported by OpenShift Container Platform
- RHEL 8+
- SLES 15SP5
- Ubuntu 22.04

> Notes: 
> * The host operating system/version being used must align with what each Dell Storage platform supports. Please visit [E-Lab Navigator](https://elabnavigator.dell.com/eln/modernHomeSSM) for specific Dell Storage platform host operating system level support matrices.
> * Any operating system or version that's not mentioned here must be self-certified using [Cert-CSI](../support/cert-csi/) in order to be supported. Although not mandatory, we recommend users to use operating systems and versions that have not met their end of life.

## Supported CSM Modules

{{<table "table table-striped table-bordered table-sm">}}
| CSM Module                                                    | PowerMax | PowerFlex | Unity XT | PowerScale | PowerStore |
|---------------------------------------------------------------|:--------:|:---------:|:--------:|:----------:|:----------:|
| [CSM Authorization - v1.x GA](../authorization/)              | Yes      | Yes       | No       | Yes        | No         |
| [CSM Authorization - v2.0 Tech Preview](../authorization/)    | No       | Yes       | No       | No         | No         |
| [CSM Observability](../observability/)                        | Yes      | Yes       | No       | Yes        | Yes        |
| [CSM Replication](../replication/)                            | Yes      | Yes       | No       | Yes        | Yes        |
| [CSM Resiliency](../resiliency/)                              | Yes       | Yes       | Yes      | Yes        | Yes        |
| [CSM Encryption](../secure/encryption/)                       | No       | No        | No       | Yes        | No         |
| [CSM Application Mobility](../applicationmobility/)           | Yes      | No       | No      | No        | No        |
| [Volume Group Snapshot](../snapshots/volume-group-snapshots/) | No       | Yes       | No       | No         | Yes        |

{{</table>}}

> Notes:
> * Encryption is available as a Technical Preview only and is not officially supported.
> * Authorization v2.0 is available as a Technical Preview only on PowerFlex.

## CSM Operator compatibility matrix

The table below lists the driver and modules versions installable with the CSM Operator:
{{<table "table table-striped table-bordered table-sm">}}
| CSI Driver         | Version | CSM Authorization | CSM Replication | CSM Observability | CSM Resiliency |
| ------------------ |---------|-------------------|-----------------|-------------------|----------------|
| CSI PowerScale     | 2.11.0  | ✔ 1.11.0          | ✔ 1.9.0        | ✔ 1.9.0           | ✔ 1.10.0      |
| CSI PowerScale     | 2.10.1  | ✔ 1.10.1          | ✔ 1.8.1        | ✔ 1.8.1           | ✔ 1.9.1       |
| CSI PowerScale     | 2.9.1   | ✔ 1.9.1           | ✔ 1.7.1        | ✔ 1.7.0           | ✔ 1.8.1       |
| CSI PowerFlex      | 2.11.0  | ✔ 1.11.0          | ✔ 1.9.0        | ✔ 1.9.0           | ✔ 1.10.0      |
| CSI PowerFlex      | 2.10.1  | ✔ 1.10.1          | ✔ 1.8.1        | ✔ 1.8.1           | ✔ 1.9.1       |
| CSI PowerFlex      | 2.9.2   | ✔ 1.9.1           | ✔ 1.7.1        | ✔ 1.7.0           | ✔ 1.8.1       |
| CSI PowerStore     | 2.11.0  | ❌                | ❌             | ❌                | ✔ 1.10.0      |
| CSI PowerStore     | 2.10.1  | ❌                | ❌             | ❌                | ✔ 1.9.1       |
| CSI PowerStore     | 2.9.1   | ❌                | ❌             | ❌                | ✔ 1.8.1       |
| CSI PowerMax       | 2.11.0  | ✔ 1.11.0          | ✔ 1.9.0        | ✔ 1.9.0           | ✔ 1.10.0      |
| CSI PowerMax       | 2.10.1  | ✔ 1.10.1          | ✔ 1.8.1        | ✔ 1.8.1           | ❌            |
| CSI PowerMax       | 2.9.1   | ✔ 1.9.1           | ✔ 1.7.1        | ✔ 1.7.0           | ❌            |
| CSI Unity XT       | 2.11.0  | ❌                | ❌             | ❌                | ❌            |
| CSI Unity XT       | 2.10.1  | ❌                | ❌             | ❌                | ❌            |
| CSI Unity XT       | 2.9.1   | ❌                | ❌             | ❌                | ❌            |
{{</table>}}