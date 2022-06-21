---
title: Tools
linktitle: Tools
weight: 7
description: >
  repctl tool for Replication feature in detail
---
# repctl

`repctl` is a command-line client for configuring replication 
and managing replicated resources between multiple Kubernetes clusters.


## Usage

### Managing Clusters

To begin managing replication with `repctl` you need to add your Kubernetes
clusters, you can do that using `cluster add` command

```shell
./repctl cluster add -f <config-file> -n <name>
```

You can view clusters that are currently being managed by `repctl`
by running `cluster get` command
```shell
./repctl cluster get
```

Or, alternatively, using `get cluster` command
```shell
./repctl get cluster
```


Also, you can inject information about all of your current clusters as
config maps into the same clusters, so it can be used by `dell-csi-replicator`

```shell 
./repctl cluster inject
```

You can also generate kubeconfigs from existing replication service accounts and inject them in config maps by providing `--use-sa` flag

```shell
./repctl cluster inject --use-sa
```

### Querying Resources

After adding clusters you want to manage with `repctl` you can query
resources from multiple clusters at once using `get` command. 

For example, this command will list all storage classes in all clusters
that currently are being managed by `repctl`

```shell
./repctl get storageclasses --all
```

If you want to query some particular clusters you can do that by specifying
`clusters` flag

```shell
./repctl get pv --clusters cluster-1,cluster-3
```

All other different flags for querying resources you can check using
included into the tool help flag `-h`.

### Creating Resources

#### Generic
Generic `create` command allows you to apply provided config file into 
multiple clusters at once

```shell
/repctl create -f <path-to-file>
```

#### PersistentVolumeClaims
You can use `repctl` to create PVCs from Replication Group's PVs 
on the target cluster

```shell
./repctl create pvc --rg <rg-name> -t <target-namespace> --dry-run=false
```

> By default, 'create pvc' will do a 'dry-run' while creating PVCs.
If you don't encounter any issues in the dry-run, then you can
re-run the command by turning off the dry-run flag to false.

#### Storage Classes
`repctl` can create special `replication enabled` storage classes from
provided config, you can find example configs in `examples` folder

```shell
./repctl create sc --from-config <config-file>`
```

### Single Cluster Replication
`repctl` supports working with replication within a single Kubernetes cluster. 

Just add cluster you want to use with `cluster add` command, and you can list, filter, and create resources. 

Volumes and ReplicationGroups created as "target" resources would be prefixed with `replicated-` 
so you can easily differentiate them. 

You can also differentiate between single cluster replication configured StorageClasses and ReplicationGroups and multi-cluster ones 
by checking `remoteClusterID` field, for a single cluster the field would be set to `self`.

To create replication enabled storage classes for single cluster replication using `create sc` command
be sure to set both `sourceClusterID` and `targetClusterID` to the same `clusterID` and continue as usual with executing the command.
Name of StorageClass resource that created as "target" will be appended with `-tgt`. 

### Executing Actions
`repctl` can be used to execute various replication actions on ReplicationGroups. 

#### Failover

This command will perform a planned `failover` to a cluster or an RG.

When working with multiple clusters, you can perform failover by specifying the target _cluster ID_. To do that use `--target <targetClusterID>` parameter.

```shell
./repctl --rg <rg-id> failover --target <tgt-cluster-id>
```

When working with replication within a single cluster, you can perform failover by specifying the target _replication group ID_. To do that use `--target <rg-id>` parameter.

```shell
./repctl --rg <rg-id> failover --target <tgt-rg-id>
```

In both scenarios `repctl` will patch the CR at the source site with action **FAILOVER_REMOTE**.

You can also provide `--unplanned` parameter, then `repctl` will perform an unplanned failover to a given cluster or an RG, instead of **FAILOVER_REMOTE** `repctl` will patch CR at target cluster with action **UNPLANNED_FAILOVER_LOCAL**.

#### Reprotect

This command will perform a `reprotect` at the specified cluster or the RG.

When working with multiple clusters, you can perform reprotect by specifying the _cluster ID_. To do that use `--at <clusterID>` parameter.

```shell
./repctl --rg <rg-id> reprotect --at <tgt-cluster-id>
```

When working with replication within a single cluster, you can perform reprotect by specifying the _replication group ID_. To do that use `--rg <rg-id>` parameter.

```shell
./repctl --rg <rg-id> reprotect 
```

In both scenarios `repctl` will patch the CR at the source site with action **REPROTECT_LOCAL**.

#### Failback

This command will perform a planned `failback` to a cluster or an RG.

When working with multiple clusters, you can perform failback by specifying the _cluster ID_, to do that use `--target <clusterID>` parameter.

```shell
./repctl --rg <rg-id> failback --target <tgt-cluster-id>
```

When working with replication within a single cluster, you can perform failback by specifying the _replication group ID_. To do that use `--target <rg-id>` parameter.

```shell
./repctl --rg <rg-id> failback --target <tgt-rg-id>
```

In both scenarios `repctl` will patch the CR at the source site with action **FAILBACK_LOCAL**.

You can also provide `--discard` parameter, then `repctl` will perform a failback but discard any writes at target, instead of **FAILBACK_LOCAL** `repctl` will patch CR at target cluster with action **ACTION_FAILBACK_DISCARD_CHANGES_LOCAL**.

#### Swap

This command will perform a `swap` at a specified cluster or an RG.

When working with multiple clusters, you can perform swap by specifying the _cluster ID_. To do that use `--at <clusterID>` parameter.

```shell
./repctl --rg <rg-id> swap --at <tgt-cluster-id>
```

When working with replication within a single cluster, you can perform swap by specifying the _replication group ID_. To do that use `--rg <rg-id>` parameter.

```shell
./repctl --rg <rg-id> swap
```

repctl will patch CR at the source cluster with action `SWAP_LOCAL`.


#### Wait For Completion 

When executing actions you can provide `--wait` argument to make `repctl` wait for completion of specified action.

For example when executing `failover`: 
```shell
./repctl --rg <rg-id> failover --target <tgt-cluster-id> --wait
```

#### Maintenance Actions

You can also use `exec` command to execute maintenance actions such as `suspend`, `resume`, and `sync`.

For single or multi-cluster config:
```shell
./repctl --rg <rg-id> exec -a <ACTION>
```

Where `<ACTION>` can be one of the following:
* `suspend` will suspend replication, changes will no longer be synced between replication sites
* `resume` will resume replication, canceling the effect of `suspend` action
* `sync` will force synchronization of change between replication sites 

