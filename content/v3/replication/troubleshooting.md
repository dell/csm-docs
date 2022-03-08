---
title: Troubleshooting
linktitle: Troubleshooting
weight: 8
description: >
   Troubleshooting guide
---

| Symptoms | Prevention, Resolution or Workaround |
| --- | --- | 
| Persistent volumes don't get created on the target cluster. |  Run `kubectl describe` on one of the pods of replication controller and see if event says `Config update won't be applied because of invalid configmap/secrets. Please fix the invalid configuration`. If it does then ensure you correctly populated replication ConfigMap. You can check the current status by running `kubectl describe cm -n dell-replication-controller dell-replication-controller-config`. If ConfigMap is empty please edit it yourself or use `repctl cluster inject` command. |
| Persistent volumes don't get created on the target cluster. You don't see any events on the replication-controller pod. | Check logs of replication controller by running `kubectl logs -n dell-replication-controller dell-replication-controller-manager-<generated-symbols>`. If you see `clusterId - <clusterID> not found` errors then be sure to check if you specified the same clusterIDs in both your ConfigMap and replication enabled StorageClass. | 
| You apply replication action by manually editing ReplicationGroup resource field `spec.action` and don't see any change of ReplicationGroup state after a while.  | Check events of the replication-controller pod, if it says `Cannot proceed with action <your-action>. [unsupported action]` then check spelling of your action and consult [replication-actions](../replication-actions) page. Alternatively, you can use `repctl` instead of manually editing ReplicationGroup resources. | 
| You execute failover action using `repctl failover` command and see `failover: error executing failover to source site`. | This means you tried to failover to a cluster that is already marked source. If you still want to execute failover for RG just choose another cluster. | 
| You've created PersistentVolumeClaim using replication enabled StorageClass but don't see any RGs created in the source cluster. | Check annotations of created PersistentVolumeClaim. If it doesn't have `annotations` that start with `replication.storage.dell.com` then please wait for a couple of minutes for them to be added and RG to be created. | 
