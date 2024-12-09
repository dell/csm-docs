---
title: "Support Matrix"
linkTitle: "Support Matrix"
description: Support Matrix for Container Storage Modules
no_list: true
weight: 1
---

## Supported Storage Platforms

{{<table "table table-striped table-bordered table-sm">}}
| Platform | Version | OS Dependencies |
| -------- | :-----: | :-------------: |
| PowerMax | PowerMax 2500/8500 PowerMaxOS 10 (6079)<br>PowerMaxOS 10.0.1 (6079)<br>PowerMaxOS 10.1 (6079)<br> PowerMaxOS 10.2 (6079)<br>PowerMax 2000/8000 - 5978.711.711, 5978.714.714<br>5978.479.479<br>Unisphere 10.0,10.0.1,10.1,10.2 | iscsi-initiator-utils<br>multipathd or powerpath<br>nvme-cli<br>nfs-utils |
| PowerFlex   | 3.6.x, 4.5.x, 4.6.x | [SDC](https://www.dell.com/support/home/en-us/product-support/product/scaleio/drivers) |
| Unity XT    | 5.2.x, 5.3.x, 5.4.x | iscsi-initiator-utils<br>multipathd<br>nfs-utils |
| PowerScale  | OneFS 9.4, 9.5.0.x (x >= 5), 9.7, 9.8, 9.9, 9.10 | nfs-utils |
| PowerStore  |  3.5, 3.6, 4.0, 4.1 | iscsi-initiator-utils<br>multipathd<br>nvme-cli<br>nfs-utils |
| ObjectScale |  1.2.x | - |
{{</table>}}

> Notes:
> - Only install OS dependencies for the protocols you use (e.g., skip `nvme-cli` if NVMe isn't used).
> - Always use the CSM and Kubernetes API for storage operations.
> - Changes made outside these tools (like using storage array GUIs or CLIs) won't be automatically reflected in Kubernetes including Persistent Volume (PV) metadata, leading to inaccurate metadata and state information.
> - If you must make external changes, manually update the Kubernetes cluster to keep everything in sync

## Supported Container Orchestrator Platforms

{{<table "table table-striped table-bordered table-sm">}}
| Platform                   | Version          |
|----------------------------|:----------------:|
| Kubernetes                 | 1.30, 1.31, 1.32 |
| Red Hat OpenShift          | 4.17, 4.18       |
| Mirantis Kubernetes Engine | 3.7.x            |
{{</table>}}

> Notes:
> * Any orchestrator platform or version that's not mentioned here must be self-certified using [Cert-CSI](../support/cert-csi/) in order to be supported. Although not mandatory, we recommend users to use orchestrator platforms and versions that have not met their end of life.
> * CSM Authorization Server v1 is not supported on Red Hat OpenShift. However, it is supported to install CSM Authorization Server v1 on standard Kubernetes and a Dell CSI Drvier enabled with CSM Authorization on Red Hat OpenShift. CSM Authorization Server v2 is supported on Red Hat OpenShift.

## OpenShift Virtualization

OpenShift Virtualization 4.17 <b> supports [storage profile](https://github.com/kiagnose/kubevirt-storage-checkup) operations only </b> for the following storage systems:</br>
PowerFlex, PowerMax, PowerStore, PowerScale.

## Tested Host Operating Systems

Container Storage Modules (CSM) does not officially support specific operating systems.  However, the following operating systems are known to work:

* RedHat CoreOS (RHCOS) versions as supported by OpenShift Container Platform
* RHEL 8+
* SLES 15SP5
* Ubuntu 22.04

> Notes:

> * The host operating system/version being used must align with what each Dell Storage platform supports. Please visit [E-Lab Navigator](https://elabnavigator.dell.com/eln/modernHomeSSM) for specific Dell Storage platform host operating system level support matrices.
> * Any operating system or version that's not mentioned here must be self-certified using [Cert-CSI](../support/cert-csi/) in order to be supported. Although not mandatory, we recommend users to use operating systems and versions that have not met their end of life.

## Supported Container Storage Modules

{{<table "table table-striped table-bordered table-sm">}}
| Container Storage Module                                                    | PowerMax | PowerFlex | Unity XT | PowerScale | PowerStore |
| ------------------------------------------------------------- | :------: | :-------: | :------: | :--------: | :--------: |
| [Authorization - v1.x](../authorization/)                 |   Yes    |    Yes    |    No    |    Yes     |     No     |
| [Authorization - v2.x](../authorization/)                 |   Yes    |    Yes    |    No    |    Yes     |     No     |
| [Observability](../observability/)                        |   Yes    |    Yes    |    No    |    Yes     |    Yes     |
| [Replication](../replication/)                            |   Yes    |    Yes    |    No    |    Yes     |    Yes     |
| [Resiliency](../resiliency/)                              |   Yes    |    Yes    |   Yes    |    Yes     |    Yes     |
| [Application Mobility](../applicationmobility/)           |   Yes    |    No     |    No    |     No     |     No     |
| [Volume Group Snapshot](../snapshots/volume-group-snapshots/) |    No    |    Yes    |    No    |     No     |    Yes     |
{{</table>}}



## OpenShift Compatibility with Operator  

{{<table "table table-striped table-bordered table-sm">}}
|  OpenShift Version        | Operator Version        | CSM version |
| ------------| ------------------------| ----------- |
|  4.12       | 1.2.0, 1.3.0               |1.7.1, 1.8.0           |
|  4.13       | 1.3.0, 1.4.4, 1.5.1        |1.8.0, 1.9.4, 1.10.2      |
|  4.14       | 1.4.4, 1.5.1, 1.6.1, 1.7.0 |1.9.4, 1.10.2, 1.11.1, 1.12|
|  4.15       | 1.5.1, 1.6.1, 1.7.0        |1.10.2, 1.11.1, 1.12    |
|  4.16       | 1.6.1, 1.7.0               |1.11.1, 1.12         | 
|  4.17       | 1.6.1, 1.7.0               |1.11.1, 1.12         |
|  4.18       | Not supported yet          |                  |
{{</table>}}





## Installation Wizard Compatibility Matrix 


### Supported CSI Drivers

{{<table "table table-striped table-bordered table-sm">}}
| CSI Driver         | Version   | Helm   | Operator  |
| ------------------ | --------- | ------ | --------- |
|  PowerStore     | 2.13.0    |✔️      |✔️        |
|  PowerMax       | 2.13.0    |✔️      |✔️        |
|  PowerFlex      | 2.13.0    |✔️      |❌        |
|  PowerScale     | 2.13.0    |✔️      |✔️        |
|  Unity XT       | 2.13.0    |✔️      |❌        |
{{</table>}}


### Supported Container Storage Modules

| Container Storage Modules      | Version   |
| -----------------| --------- |
| Observability    | 1.8.0+    |
| Replication      | 1.8.0+    |
| Resiliency       | 1.8.0+    | 


