---
title: "Support Matrix"
linkTitle: "Support Matrix"
description: Support Matrix for Container Storage Modules
no_list: true
weight: 1
---

## Storage Platforms

{{<table "table table-striped table-bordered table-sm tdleft">}}
| Platform | Version | OS Dependencies |
| -------- | :-----: | :-------------: |
| PowerStore  |  3.5, 3.6, 4.0, 4.1 | iscsi-initiator-utils<br>multipathd<br>nvme-cli<br>nfs-utils |
| PowerScale  | OneFS 9.4, 9.5.0.x (x >= 5), 9.7, 9.8, 9.9, 9.10 | nfs-utils |
| PowerFlex   | 3.6.x, 4.5.x, 4.6.x | [SDC](https://www.dell.com/support/home/en-us/product-support/product/scaleio/drivers) |
| PowerMax  |Unisphere 10.0,10.0.1,10.1,10.2 | iscsi-initiator-utils<br>multipathd or powerpath<br>nvme-cli<br>nfs-utils |
| Unity XT    | 5.2.x, 5.3.x, 5.4.x | iscsi-initiator-utils<br>multipathd<br>nfs-utils |
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
| Kubernetes                 | 1.30, 1.31, 1.32 |
| Red Hat OpenShift          | 4.17, 4.18       |
| Mirantis Kubernetes Engine | 3.7.x            |
{{</table>}}

**Notes:**
- Self-certify unsupported orchestrator platforms/versions using [Cert-CSI](../tooling/cert-csi/). Use platforms that haven't reached end of life.
- CSM Authorization Server v1 is not supported on Red Hat OpenShift. It can be installed on standard Kubernetes and used with a Dell CSI Driver enabled with CSM Authorization on Red Hat OpenShift.
- CSM Authorization Server v2 is supported on Red Hat OpenShift.

## OpenShift Virtualization
{{<table "table table-striped table-bordered table-sm">}}
| Version | Capability               | PowerFlex | PowerMax | PowerStore | PowerScale | Unity |
|---------|--------------------------| :-------: | :------: | :--------: | :--------: | :---: |
| 4.17 - 4.18    |  <div style="text-align: left"> [Storage](https://github.com/kiagnose/kubevirt-storage-checkup) </div> | Yes       | Yes      | Yes        | Yes        | No    |
| 4.17 - 4.18   | <div style="text-align: left">  Observability        </div>   | Yes       | Yes      | No         | Yes        | No    |
| 4.17 - 4.18    | <div style="text-align: left"> Authorization - v2.x  </div>   | Yes       | Yes      | No         | Yes        | No    |
| 4.17 - 4.18    | <div style="text-align: left"> Resiliency            </div>   | Yes       | Yes      | Yes         | Yes        | No    |
{{</table>}}

> Note: Replication is not supported.

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
| Platform         |  Authorization v1|  Authorization v2 | Replication | Observability | Resiliency | Application Mobility|
| ------------------ |------------------| --------------- |-----------------|-------------------|----------------|------|
| PowerStore         |  No      |   No              |  Yes              | Yes                 |    Yes     |No|
| PowerScale         |  Yes     |   Yes             |  Yes              | Yes                 |    Yes     |No|
| PowerFlex          |  Yes     |   Yes             |  Yes              | Yes                 |    Yes     |No|
| PowerMax           |  Yes     |   Yes             |  Yes              | Yes                 |    Yes     |Yes|
| Unity XT           |  No      |   No              |  No               | No                  |    Yes     |No|
{{</table>}}

## Operator Compatibility
{{<table "table table-striped table-bordered table-sm">}}
| Platform         |  Authorization v1|  Authorization v2 | Replication | Observability | Resiliency |
| ------------------ |------------------| --------------|-----------------|-------------------|----------------|
| PowerStore         |  No      |   No              |  No               | No                  |    Yes     |
| PowerScale         |  Yes     |   Yes             |  Yes              | Yes                 |    Yes     |
| PowerFlex          |  Yes     |   Yes             |  Yes              | Yes                 |    Yes     |
| PowerMax           |  Yes     |   Yes             |  Yes              | Yes                 |    Yes     |
| Unity XT           |  No      |   No              |  No               | No                  |    No      |
{{</table>}}

## OpenShift Compatibility with Operator

{{<table "table table-striped table-bordered table-sm">}}
|  OpenShift Version        | Operator Version        | CSM version |
| ------------| ------------------| ----------- |
|  4.14       | 1.4.4, 1.5.1, 1.6.1, 1.7.0, 1.8.1 |1.9.4, 1.10.2, 1.11.1, 1.12, 1.13.1|
|  4.15       | 1.5.1, 1.6.1, 1.7.0, 1.8.1        |1.10.2, 1.11.1, 1.12, 1.13.1    |
|  4.16       | 1.6.1, 1.7.0, 1.8.1               |1.11.1, 1.12, 1.13.1         |
|  4.17       | 1.6.1, 1.7.0, 1.8.1               |1.11.1, 1.12, 1.13.1         |
|  4.18       | 1.6.1, 1.7.0, 1.8.1               |1.11.1, 1.12, 1.13.1         |
{{</table>}}
**Note:**  
- [Refer](#supported-container-orchestrator-platforms) our supported Orchestration platform. While the Operator may be displayed, it does not necessarily mean it has been fully qualified by us. If desired, customers can upgrade the Operator and self-certify it.


## Installation Wizard Compatibility 

### Drivers

{{<table "table table-striped table-bordered table-sm">}}
| Platform         |     Helm   | Operator  |
| ------------------ |  ------ | --------- |
|  PowerStore     | Yes️      |Yes️        |
|  PowerScale     | Yes️      |Yes️        |
|  PowerFlex      | Yes️      |No         |
|  PowerMax       | Yes️      |Yes️        |
|  Unity XT       | Yes️      |No         |
{{</table>}}

### Modules
{{<table "table table-striped table-bordered table-sm tdleft">}}
| Container Storage Modules |
| -----------------|
| Replication      |
| Observability    |
| Resiliency       |
{{</table>}}
