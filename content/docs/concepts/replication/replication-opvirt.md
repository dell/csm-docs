---
title: Metro Replication with OpenShift Virtualization
linktitle: Metro Replication with OpenShift Virtualization
weight: 6
description: >
  Support of Metro Replication with OpenShift Virtualization for CSI drivers.
---

Starting in v1.12.0, the Replication module supports the metro volume
replication for Persistent Volumes (PVs) created via virtualized workloads
(VMs).

## OpenShift Virtualization:

- OpenShift Virtualization allows virtual machines (VMs) to run alongside
  container workloads within Kubernetes clusters, addressing the coexistence of
  legacy VM workloads and modern containers.

## OpenShift Virtualization support with Metro Replication

- Install the OpenShift Virtualization operator from the RedHat UI on OpenShift
  Cluster.
- The Replication modes supported are: Metro
- CSI Driver supported: PowerMax, PowerStore
- Make sure a default storage class configured for metro replication. To set the
  replication storage class as the default, update the annotation as follows:

  ```
  kubectl patch storageclass replication-storageclass -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
  ```

- Deploy a VM on the OCP cluster to provision a Persistent Volume (PV) using a
  data volume. The PV provisioned by the VM on the cluster will be created on
  the source as well as target arrays, as there is an active-active replication
  session between the two clusters.

- Refer this
  [document](https://docs.openshift.com/rosa/virt/virtual_machines/creating_vms_rh/virt-creating-vms-from-cli.html)
  for creating virtual machine from the command line.

## Access Metro Volume on cluster

- Login to the VM using the
  _[virtctl](https://kubevirt.io/user-guide/user_workloads/virtctl_client_tool/)_
  binary:

  ```
  ./virtctl console repl-vm -n kubevirttest
  ```

- Write data to Persistent Volume (PV):

  ```
    localhost:/# printf "Data written to PV" | dd  of=/dev/vda bs=1 count=150 conv=notrunc
    28+0 records in
    28+0 records out
  ```

- Read data from Persistent Volume (PV):
  ```
    localhost:/# dd if=/dev/vda bs=1 count=150 conv=notrunc
    Data written to PV
    150+0 records in
    150+0 records out
  ```
