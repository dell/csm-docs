---
title: Replication with
linktitle: Replication with KubeVirt
weight: 6
description: >
  Support of Replication enabled CSI drivers with virtualized workloads.
---

Starting in v1.11.0, the Replication module supports the volume replication for
Persistent Volumes (PVs) created via virtualized workloads (VMs).

## KubeVirt:

- KubeVirt allows virtual machines (VMs) to run alongside container workloads
  within Kubernetes clusters, addressing the coexistence of legacy VM workloads
  and modern containers.

## KubeVirt support with Replication

- Install the OpenShift Virtualization operator from the RedHat UI on both the
  source and target clusters with OCP v4.18 and above.
- The Replication modes supported are: SYNC and ASYNC.

- Make sure the driver is installed with the Replication Module enabled and a
  default storage class configured for replication. To set the replication
  storage class as the default, update the annotation as follows:

  ```
  kubectl patch storageclass replication-storageclass -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
  ```

- Deploy a VM on the source cluster to provision a Persistent Volume (PV) using
  a data volume template or a Persistent Volume Claim (PVC). The PV created on
  the source will be replicated to the target cluster, as there is an active
  replication session between the two clusters.

- sample _create-vm.yaml_ manifest:

```
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  labels:
    kubevirt.io/vm: vm-alpine-rwo
  name: source-vm
spec:
  running: true
  template:
    metadata:
      labels:
        kubevirt.io/vm: vm-alpine-rwo
    spec:
      domain:
        devices:
          disks:
            - disk:
                bus: virtio
              name: datavolumedisk1
          interfaces:
            - masquerade: {}
              name: default
        resources:
          requests:
            memory: 1Gi
      terminationGracePeriodSeconds: 0
      networks:
        - name: default
          pod: {}
      volumes:
        - dataVolume:
            name: alpine-rwo-dv
          name: datavolumedisk1
  dataVolumeTemplates:
    - metadata:
        name: alpine-rwo-dv
      spec:
        storage:
          accessModes:
            - ReadWriteOnce
          resources:
            requests:
              storage: 8Gi
          storageClassName: replication-storageclass
        source:
          registry:
            url: docker://quay.io/kubevirt/alpine-container-disk-demo:v0.42.1
```

- On the target cluster, the replica Persistent Volume (PV) can be accessed by
  binding it to a replica Persistent Volume Claim (PVC). Deploy a replica VM on
  the target cluster to provision the replica PV using the replica PVC.

## Access replicated Persistent Volume (PV) on target cluster

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
- When a
  [Replication Action](https://dell.github.io/csm-docs/docs/replication/replication-actions/),
  such as a failover, is triggered, the Persistent Volume (PV) becomes
  accessible from the target cluster and can be accessed in the same manner.
