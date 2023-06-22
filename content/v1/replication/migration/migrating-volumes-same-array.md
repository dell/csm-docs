---
title: Between Storage classes
linktitle: Between Storage classes
weight: 2
description: >
  Support for Array Migration of Volumes between storage classes
---

You can migrate existing pre-provisioned volumes to another storage class by using volume migration feature. 

Currently two versions of migration are supported: 
- To replicated storage class from NON replicated one.
- To NON replicated storage class from replicated one.

## Prerequisites
- Original volume is from the one of currently supported CSI drivers (see Support Matrix)
- Migrated sidecar is installed alongside with the driver, you can enable it in your `myvalues.yaml` file
```yaml
migration:
  enabled: true
```

## Support Matrix
| Migration Type | PowerMax | PowerStore | PowerScale | PowerFlex | Unity | 
| - | - | - | - | - | - | 
| NON_REPL_TO_REPL | Yes | No | No | No | No |
| REPL_TO_NON_REPL | Yes | No | No | No | No |


## Basic Usage

To trigger migration procedure, you need to patch existing PersistentVolume with migration annotation (by default `migration.storage.dell.com/migrate-to`) and in value of said annotation specify StorageClass name you want to migrate to. 

For example, if we have PV named `test-pv` already provisioned and we want to migrate it to replicated storage class named `powermax-replication` we can run:

```shell
kubectl patch pv test-pv -p '{"metadata": {"annotations":{"migration.storage.dell.com/migrate-to":"powermax-replication"}}}'
```

Patching PV resource will trigger migration sidecar that will call `VolumeMigrate` call from the CSI driver. After migration is finished new PersistentVolume will be created in cluster with name of original PV plus `-to-<sc-name>` appended to it. 

In our example, we will see this when running `kubectl get pv`: 
```shell
NAME                                   CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM                       STORAGECLASS                REASON   AGE
test-pv                                1Gi        RWO            Retain           Bound       default/test-pvc            powermax                             5m
test-pv-to-powermax-replication        1Gi        RWO            Retain           Available                               powermax-replication                 10s

```

When Volume Migration is finished, source PV will be updated with an `EVENT` that denotes that this has taken place. 

Newly created PV (`test-pv-to-powermax-replication` in our example) is available for consumption via static provisioning by any PVC that requests it.


## Namespace Considerations For Replication

Replication Groups in CSM Replication can be made namespaced, meaning that one SC will generate one Replication Group per namespace. This is also important when migrating volumes from/to replcation storage class.

"When just setting one annotation migration.storage.dell.com/migrate-to migrated volume is assumed to be used in same namespace as original PV and it’s PVC. In the case of being migrated to replication enabled storage class will be inserted in namespaced Replication Group inside PVC namespace."

However, you can define in which namespace migrated volume must be used after migration by setting `migration.storage.dell.com/namespace`. You can use the same annotation in a scenario where you only have a statically provisioned PV, and you don't have it bound to any PVC, and you want to migrate it to another storage class.


## Non Disruptive Migration

You can migrate your PVs without disrupting workflows if you use StatefulSet with multiple replicas to deploy application. 

Instruction (you can also use `repctl` for convenience):

1. Find every PV for your StatefulSet and patch it with `migration.storage.dell.com/migrate-to` annotation that points to new storage class:
    ```shell
    kubectl patch pv <pv-name> -p '{"metadata": {"annotations":{"migration.storage.dell.com/migrate-to":"powermax-replication"}}}'
    ```

2. Ensure you have a copy of StatefulSet manifest somewhere ready, we will need it later. If you don't have it, you can get it from cluster:
    ```shell
    kubectl get sts <sts-name> -n <ns-name> -o yaml > sts-manifest.yaml
    ```

3. To not disrupt any workflows, we will need to delete StatefulSet without deleting any pods, to do so you can use the `--cascade` flag:
    ```shell
    kubectl delete sts <sts-name> -n <ns-name> --cascade=orphan
    ```

4. Change the StorageClass in your manifest of StatefulSet to point to a new storage class, then apply it to the cluster:
    ```shell
    kubectl apply -f sts-manifest.yaml
    ```

5. Find a PVC and pod of one replica of StatefulSet delete PVCs first and Pod after it:
    ```shell
    kubectl delete pvc <pvc-name> -n <ns-name>
    ```
    ```shell
    kubectl delete pod <pod-name> -n <ns-name>
    ```

    Wait for new pod to be created by StatefulSet, it should create new PVC that will use migrated PV. 

6. Repeat step 5 until all replicas use new PVCs.


## Using repctl

You can use `repctl` CLI tool to help you simplify running migration specific commands.

### Single PV

In its most simple usage, repctl can do the same operations as kubectl, for example, migrating the single PV 'test-pv' from our example will look like: 

```shell
./repctl migrate pv test-pv --to-sc powermax-replication
```

`repctl` will go and patch the resource for you. You can also provide `--wait` flag for it to wait until migrated PV is created in the cluster. 
`repctl` also can set `migration.storage.dell.com/namespace` for you if you provide `--target-ns` flag. 


Aside from just migrating single PVs repctl can migrate PVCs and StatefulSets. 

### PVC

`repctl` can find PV for any given PVC for you and patch it. 
This could be done with similar command to single PV migration: 

```shell
./repctl migrate pvc test-pvc --to-sc powermax-replication -n default
```

Notice that we provide original namespace (`default` in our example) for this command because PVCs are namespaced resource and we need namespace to be able to find it. 


### StatefulSet


`repctl` can help you migrate entire StatefulSet by automating migration process. 

You can use this command to do so: 
```shell
./repctl migrate sts test-sts --to-sc powermax-replication -n default
```

By default, it will find every Pod, PVC and PV for provided StatefulSet and patch every PV with annotation. 

You can also optionally provide `--ndu` flag, with this flag provided repctl will do steps provided in [Non Disruptive Migration](#non-disruptive-migration) section automatically. 
