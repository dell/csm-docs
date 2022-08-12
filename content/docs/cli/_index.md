---
title: "CLI"
linkTitle: "CLI"
weight: 9
Description: >
  CLI for Dell Container Storage Modules (CSM)
---
dellctl is a common command line interface(CLI) used to interact with and manage your [Container Storage Modules](https://github.com/dell/csm) (CSM) resources.
This document outlines all dellctl commands, their intended use, options that can be provided to alter their execution, and expected output from those commands.

| Command | Description |
| - | - |
| [dellctl](#dellctl) | dellctl is used to interact with Container Storage Modules |
| [dellctl cluster](#dellctl-cluster) | Manipulate one or more k8s cluster configurations |
| [dellctl cluster add](#dellctl-cluster-add) | Add a k8s cluster to be managed by dellctl |
| [dellctl cluster remove](#dellctl-cluster-remove) | Removes a k8s cluster managed by dellctl |
| [dellctl cluster get](#dellctl-cluster-get) | List all clusters currently being managed by dellctl |
| [dellctl backup](#dellctl-backup) | Allows to manipulate application backups/clones |
| [dellctl backup create](#dellctl-backup-create) | Create an application backup/clones |
| [dellctl backup delete](#dellctl-backup-delete) | Delete application backups |
| [dellctl backup get](#dellctl-backup-get) | Get application backups |
| [dellctl restore](#dellctl-restore) | Allows to manipulate application restores |
| [dellctl restore create](#dellctl-restore-create) | Restore an application backup |
| [dellctl restore delete](#dellctl-restore-delete) | Delete application restores |
| [dellctl restore get](#dellctl-restore-get) | Get application restores |


## Installation instructions
1. Download `dellctl` from [here](https://github.com/dell/csm/releases/tag/v1.4.0).
2. chmod +x dellctl
3. Move `dellctl` to `/usr/local/bin` or add `dellctl`'s containing directory path to PATH environment variable.
4. Run `dellctl --help` to know available commands or run `dellctl command --help` to know more about a specific command.

By default, the `dellctl` runs against local cluster(referenced by `KUBECONFIG` environment variable or by a kube config file present at default location).
The user can register one or more remote clusters for `dellctl`, and run any `dellctl` command against these clusters by specifying the registered cluster id to the command.


## General Commands

### dellctl

dellctl is a CLI tool for managing Dell Container Storage Resources.

##### Flags

```
  -h, --help      help for dellctl
  -v, --version   version for dellctl  
```

##### Output

Outputs help text



---



### dellctl cluster

Allows to manipulate one or more k8s cluster configurations

##### Available Commands

```
  add         Adds a k8s cluster to be managed by dellctl
  remove      Removes a k8s cluster managed by dellctl
  get         List all clusters currently being managed by dellctl  
```

##### Flags

```
  -h, --help   help for cluster  
```

##### Output

Outputs help text



---



### dellctl cluster add

Add one or more k8s clusters to be managed by dellctl

##### Flags

```
Flags:
  -n, --names strings   cluster names
  -f, --files strings   paths for kube config files
  -u, --uids strings    uids of the kube-system namespaces in the clusters
      --force           forcefully add cluster
  -h, --help            help for add
```

##### Output

```
# dellctl cluster add -n cluster1 -f ~/kubeconfigs/cluster1-kubeconfig
 INFO Adding clusters ...
 INFO Cluster: cluster1
 INFO Successfully added cluster cluster1 in /root/.dellctl/clusters/cluster1 folder.
```

Add a cluster with it's uid

```
# dellctl cluster add -n cluster2 -f ~/kubeconfigs/cluster2-kubeconfig -u "035133aa-5b65-4080-a813-34a7abe48180"
 INFO Adding clusters ...
 INFO Cluster: cluster2
 INFO Successfully added cluster cluster2 in /root/.dellctl/clusters/cluster2 folder.
```



---



### dellctl cluster remove

Removes a k8s cluster by name from the list of clusters being managed by dellctl

##### Aliases

```
  remove, rm
```

##### Flags

```
  -h, --help          help for remove
  -n, --name string   cluster name
```

##### Output

```
# dellctl cluster remove -n cluster1
 INFO Removing cluster with id cluster1
 INFO Removed cluster with id cluster1
```



---



### dellctl cluster get

List all clusters currently being managed by dellctl

##### Aliases

```
  get, ls
```

##### Flags

```
  -h, --help   help for get
```

##### Output

```
# dellctl cluster get
CLUSTER ID      VERSION URL                             UID
cluster1        v1.22   https://10.225.7.48:6443
cluster2        v1.22   https://10.247.103.145:6443     035133aa-5b65-4080-a813-34a7abe48180
```



---



## Commands related to application mobility operations

### dellctl backup

Allows to manipulate application backups/clones

##### Available Commands

```
  create      Create an application backup/clones
  delete      Delete application backups
  get         Get application backups
```

##### Flags

```
  -h, --help   help for backup  
```

##### Output

Outputs help text



---



### dellctl backup create

Create an application backup/clones

##### Flags

```
      --cluster-id string                               Id of the cluster managed by dellctl
      --exclude-namespaces stringArray                  List of namespace names to exclude from the backup.
      --include-namespaces stringArray                  List of namespace names to include in the backup (use '*' for all namespaces). (default *)
      --ttl duration                                    Backup retention period. (default 720h0m0s)
      --exclude-resources stringArray                   Resources to exclude from the backup, formatted as resource.group, such as storageclasses.storage.k8s.io.
      --include-resources stringArray                   Resources to include in the backup, formatted as resource.group, such as storageclasses.storage.k8s.io (use '*' for all resources).
      --backup-location string                          Storage location where k8s resources and application data will be backed up to. (default "default")
      --data-mover string                               Data mover to be used to backup application data. (default "Restic")
      --include-cluster-resources optionalBool[=true]   Include cluster-scoped resources in the backup
  -l, --label-selector labelSelector                    Only backup resources matching this label selector. (default <none>)
  -n, --namespace string                                The namespace in which application mobility service should operate. (default "app-mobility-system")
      --clones stringArray                              Creates an application clone into target clusters managed by dellctl. Specify optional namespace mappings where the clone is created. Example: 'cluster1/sourceNamespace1:targetNamespace1', 'cluster1/sourceNamespace1:targetNamespace1;cluster2/sourceNamespace2:targetNamespace2'
  -h, --help                                            help for create
```

##### Output

Create a backup of the applications running in namespace `demo1`

```
# dellctl backup create backup1 --include-namespaces demo1
 INFO Backup request "backup1" submitted successfully.
 INFO Run 'dellctl backup get backup1' for more details.
```

Create clones of the application running in namespace `demo1`, on clusters with id `cluster1` and `cluster2`

```
# dellctl backup create demo-app-clones --include-namespaces demo1 --clones "cluster1/demo1:restore-ns1" --clones "cluster2/demo1:restore-ns1"
 INFO Clone request "demo-app-clones" submitted successfully.
 INFO Run 'dellctl backup get demo-app-clones' for more details.
```

Take backup of application running in namespace `demo3` on remote cluster with id `cluster2`

```
# dellctl backup create backup4 --include-namespaces demo3 --cluster-id cluster2
 INFO Backup request "backup4" submitted successfully.
 INFO Run 'dellctl backup get backup4' for more details.
```



---



### dellctl backup delete

Delete one or more application backups

##### Flags

```
      --all                 Delete all backups
      --cluster-id string   Id of the cluster managed by dellctl
      --confirm             Confirm deletion
  -h, --help                help for delete
  -n, --namespace string    The namespace in which application mobility service should operate. (default "app-mobility-system")
```

##### Output

```
# dellctl backup delete backup1
Are you sure you want to continue (Y/N)? Y
 INFO Request to delete backup "backup1" submitted successfully.
 INFO The backup will be fully deleted after all associated data (backup files, pod volume data, restores, velero backup) are removed.
```

Delete multiple backups

```
# dellctl backup delete backup1 backup2
Are you sure you want to continue (Y/N)? Y
 INFO Request to delete backup "backup1" submitted successfully.
 INFO The backup will be fully deleted after all associated data (backup files, pod volume data, restores, velero backup) are removed.
 INFO Request to delete backup "backup2" submitted successfully.
 INFO The backup will be fully deleted after all associated data (backup files, pod volume data, restores, velero backup) are removed.
```


Delete all backups without asking for user confirmation

```
# dellctl backup delete --all --confirm
 INFO Request to delete backup "backup4" submitted successfully.
 INFO The backup will be fully deleted after all associated data (backup files, pod volume data, restores, velero backup) are removed.
 INFO Request to delete backup "demo-app-clones" submitted successfully.
 INFO The backup will be fully deleted after all associated data (backup files, pod volume data, restores, velero backup) are removed.
```


---



### dellctl backup get

Get application backups

##### Flags

```
      --cluster-id string   Id of the cluster managed by dellctl
  -h, --help                help for get
  -n, --namespace string    The namespace in which application mobility service should operate. (default "app-mobility-system")

```

##### Output

```
# dellctl backup get
NAME              STATUS      CREATED                         EXPIRES                         STORAGE LOCATION   DATA MOVER   CLONED   TARGET CLUSTERS
backup1           Completed   2022-07-27 11:51:00 -0400 EDT   2022-08-26 11:51:00 -0400 EDT   default            Restic       false
backup2           Completed   2022-07-27 11:59:24 -0400 EDT   2022-08-26 11:59:42 -0400 EDT   default            Restic       false
backup4           Completed   2022-07-27 12:02:54 -0400 EDT   NA                              default            Restic       false
demo-app-clones   Restored    2022-07-27 11:53:37 -0400 EDT   2022-08-26 11:53:37 -0400 EDT   default            Restic       true     cluster1, cluster2
```

Get backups from remote cluster with id `cluster2`

```
# dellctl backup get --cluster-id cluster2
NAME              STATUS      CREATED                         EXPIRES                         STORAGE LOCATION   DATA MOVER   CLONED   TARGET CLUSTERS
backup1           Completed   2022-07-27 11:52:42 -0400 EDT   NA                              default            Restic       false
backup2           Completed   2022-07-27 12:02:29 -0400 EDT   NA                              default            Restic       false
backup4           Completed   2022-07-27 12:01:49 -0400 EDT   2022-08-26 12:01:49 -0400 EDT   default            Restic       false
demo-app-clones   Completed   2022-07-27 11:54:55 -0400 EDT   NA                              default            Restic       true     cluster1, cluster2
```

Get backups with their names

```
# dellctl backup get backup1 demo-app-clones
NAME              STATUS      CREATED                         EXPIRES                         STORAGE LOCATION   DATA MOVER   CLONED   TARGET CLUSTERS
backup1           Completed   2022-07-27 11:51:00 -0400 EDT   2022-08-26 11:51:00 -0400 EDT   default            Restic       false
demo-app-clones   Completed   2022-07-27 11:53:37 -0400 EDT   2022-08-26 11:53:37 -0400 EDT   default            Restic       true     cluster1, cluster2
```



---



### dellctl restore

Allows to manipulate application restores

##### Available Commands

```
  create      Restore an application backup
  delete      Delete application restores
  get         Get application restores
```

##### Flags

```
  -h, --help   help for restore  
```

##### Output

Outputs help text



---



### dellctl restore create

Restore an application backup

##### Flags

```
      --cluster-id string                               Id of the cluster managed by dellctl
      --from-backup string                              Backup to restore from
      --namespace-mappings mapStringString              Map of source namespace names to target namespace names to restore into in the form src1:dst1,src2:dst2,...
      --exclude-namespaces stringArray                  List of namespace names to exclude from the backup.
      --include-namespaces stringArray                  List of namespace names to include in the backup (use '*' for all namespaces). (default *)
      --exclude-resources stringArray                   Resources to exclude from the backup, formatted as resource.group, such as storageclasses.storage.k8s.io.
      --include-resources stringArray                   Resources to include in the backup, formatted as resource.group, such as storageclasses.storage.k8s.io (use '*' for all resources).
      --restore-volumes optionalBool[=true]             Whether to restore volumes from snapshots.
      --include-cluster-resources optionalBool[=true]   Include cluster-scoped resources in the backup
  -n, --namespace string                                The namespace in which application mobility service should operate. (default "app-mobility-system")
  -h, --help                                            help for create
```

##### Output

Restore application backup `backup1` on local cluster in namespace `restorens1`

```
# dellctl restore create restore1 --from-backup backup1 --namespace-mappings "demo1:restorens1"
 INFO Restore request "restore1" submitted successfully.
 INFO Run 'dellctl restore get restore1' for more details.
```

Restore application backup `backup1` on remote cluster `cluster2` in namespace `demo1`

```
# dellctl restore create restore1 --from-backup backup1 --cluster-id cluster2
 INFO Restore request "restore1" submitted successfully.
 INFO Run 'dellctl restore get restore1' for more details.
```



---



### dellctl restore delete

Delete one or more application restores

##### Flags

```
      --all                 Delete all restores
      --cluster-id string   Id of the cluster managed by dellctl
      --confirm             Confirm deletion
  -h, --help                help for delete
  -n, --namespace string    The namespace in which application mobility service should operate. (default "app-mobility-system")
```

##### Output

Delete a restore created on remote cluster with id `cluster2`

```
# dellctl restore delete restore1 --cluster-id cluster2
Are you sure you want to continue (Y/N)? Y
 INFO Request to delete restore "restore1" submitted successfully.
 INFO The restore will be fully deleted after all associated data (restore files, velero restore) are removed.
```

Delete multiple restores

```
# dellctl restore delete restore1 restore4
Are you sure you want to continue (Y/N)? Y
 INFO Request to delete restore "restore1" submitted successfully.
 INFO The restore will be fully deleted after all associated data (restore files, velero restore) are removed.
 INFO Request to delete restore "restore4" submitted successfully.
 INFO The restore will be fully deleted after all associated data (restore files, velero restore) are removed.
```

Delete all restores without asking for user confirmation

```
# dellctl restore delete --all --confirm
 INFO Request to delete restore "restore1" submitted successfully.
 INFO The restore will be fully deleted after all associated data (restore files, velero restore) are removed.
 INFO Request to delete restore "restore2" submitted successfully.
 INFO The restore will be fully deleted after all associated data (restore files, velero restore) are removed.
```


---



### dellctl restore get

Get application restores

##### Flags

```
      --cluster-id string   Id of the cluster managed by dellctl
  -h, --help                help for get
  -n, --namespace string    The namespace in which application mobility service should operate. (default "app-mobility-system")
```

##### Output

Get all the application restores created on local cluster

```
# dellctl restore get
NAME       BACKUP    STATUS      CREATED                         COMPLETED
restore1   backup1   Completed   2022-07-27 12:35:29 -0400 EDT
restore4   backup1   Completed   2022-07-27 12:39:42 -0400 EDT
```

Get all the application restores created on remote cluster with id `cluster2`

```
# dellctl restore get --cluster-id cluster2
NAME       BACKUP    STATUS      CREATED                         COMPLETED
restore1   backup1   Completed   2022-07-27 12:38:43 -0400 EDT
```

Get restores with their names

```
# dellctl restore get restore1
NAME       BACKUP    STATUS      CREATED                         COMPLETED
restore1   backup1   Completed   2022-07-27 12:35:29 -0400 EDT
```
