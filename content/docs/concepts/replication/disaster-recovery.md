---
title: Disaster Recovery
linktitle: Disaster Recovery
weight: 4
description: >
  Disaster Recovery Workflows
---

## Disaster Recovery Workflows

Once the `DellCSIReplicationGroup` & `PersistentVolume` objects have been replicated across clusters (or within the same cluster), users can exercise the general Disaster Recovery workflows.

Ensure automatic remapping of PVCs is enabled by setting "disablePVCRemap" to "false" in the driver manifest (Refer: ![pvc-remap](../../concepts/replication/pvc-remap.md)).

### Planned Migration to the target cluster/array
This scenario is the typical choice when you want to try your disaster recovery plan or you need to switch activities from one site to another: 

a. Execute "failover" action on selected ReplicationGroup using the cluster name
{{< tabpane text=true lang="en" >}} {{% tab header="1️⃣ stretched Kubernetes cluster" lang="en" %}}
   ```bash
   ./repctl failover --rg rg-id-site-1 --target rg-id-site-2
   ```
{{% /tab %}}
{{% tab header="2️⃣ independent Kubernetes clusters" lang="en" %}}
   ```bash
    ./repctl --rg rg-id failover --target target-cluster-name
   ```
{{% /tab %}}
{{< /tabpane >}}

b. Execute "reprotect" action on selected ReplicationGroup which will resume the replication from new "source"
{{< tabpane text=true lang="en" >}} {{% tab header="1️⃣ stretched Kubernetes cluster" lang="en" %}}
   ```bash
   ./repctl reprotect --rg rg-id-site-2
   ```
{{% /tab %}}
{{% tab header="2️⃣ independent Kubernetes clusters" lang="en" %}}

   ```bash
    ./repctl --rg rg-id reprotect --at new-source-cluster-name
   ```
{{% /tab %}}
{{< /tabpane >}}
![state_changes1](../../../../images/replication/state_changes1.png)

### Unplanned Migration to the target cluster/array
This scenario is the typical choice when a site goes down: 

a. Scale down the application pods to zero replicas by editing the application manifest yaml file and changing the replicas count to 0.

b. The application pods might go to Error state. Force delete the application pods by running

   ```bash
   kubectl delete pods <pod-name> -n <namespace> --force
   ```

c. Execute "failover" action on selected ReplicationGroup using the cluster name
{{< tabpane text=true lang="en" >}} {{% tab header="1️⃣ stretched Kubernetes cluster" lang="en" %}}
   ```bash
   ./repctl failover --rg rg-id-site-1 --target rg-id-site-2 --unplanned
   ```
{{% /tab %}}
{{% tab header="2️⃣ independent Kubernetes clusters" lang="en" %}}
   ```bash
    ./repctl --rg rg-id failover --target target-cluster-name --unplanned 
   ```
{{% /tab %}}
{{< /tabpane >}}

d. (PowerMax driver only) Execute "swap" action on selected ReplicationGroup which would swap personalities of R1 and R2.
{{< tabpane text=true lang="en" >}} {{% tab header="1️⃣ stretched Kubernetes cluster" lang="en" %}}
   ```bash
    ./repctl --rg rg-id-site-2 swap
   ```
{{% /tab %}}
{{% tab header="2️⃣ independent Kubernetes clusters" lang="en" %}}
   ```bash    
    ./repctl --rg rg-id swap --at target-cluster-name
   ```
{{% /tab %}}
{{< /tabpane >}}

> _**Note**_: Unplanned migration usually happens when the original "source" cluster is unavailable. The following action makes sense when the cluster is back.

e. (PowerScale arrays only) Before initiating a failback or reprotect operation, storage administrators must manually disable the SyncIQ policy when bringing the failed-over source array back online. Failing to do so may result in unexpected behavior.

f. Execute "reprotect" action on selected ReplicationGroup which will resume the replication.
{{< tabpane text=true lang="en" >}} {{% tab header="1️⃣ stretched Kubernetes cluster" lang="en" %}}
   ```bash    
    ./repctl --rg rg-id-site-1 reprotect
   ```
{{% /tab %}}
{{% tab header="2️⃣ independent Kubernetes clusters" lang="en" %}}
   ```bash
    ./repctl --rg rg-id reprotect --at new-source-cluster-name
   ```
{{% /tab %}}
{{< /tabpane >}}
![state_changes2](../../../../images/replication/state_changes2.png) 

g. Scale up the application pods to desired count by editing the application manifest yaml file and changing the replicas count to desired value.
      

> _**NOTE**_: When users do Failover and Failback, the tests pods on the source cluster may go "CrashLoopOff" state since it will try to remount the same volume which is already mounted. To get around this problem, bring down the number of replicas to 0 and then after that is done, bring it up to 1.


