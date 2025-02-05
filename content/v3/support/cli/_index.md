---
title: "CLI"
linkTitle: "CLI"
weight: 4
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
| [dellctl backup](#dellctl-backup) | Allows you to manipulate application backups/clones |
| [dellctl backup create](#dellctl-backup-create) | Create an application backup/clones |
| [dellctl backup delete](#dellctl-backup-delete) | Delete application backups |
| [dellctl backup get](#dellctl-backup-get) | Get application backups |
| [dellctl restore](#dellctl-restore) | Allows you to manipulate application restores |
| [dellctl restore create](#dellctl-restore-create) | Restore an application backup |
| [dellctl restore delete](#dellctl-restore-delete) | Delete application restores |
| [dellctl restore get](#dellctl-restore-get) | Get application restores |
| [dellctl schedule](#dellctl-schedule) | Allows you to manipulate schedules |
| [dellctl schedule create](#dellctl-schedule-create) | Create a schedule |
| [dellctl schedule create for-backup](#dellctl-schedule-create-for-backup) | Create a schedule for application backups |
| [dellctl schedule delete](#dellctl-schedule-delete) | Delete schedules |
| [dellctl schedule get](#dellctl-schedule-get) | Get schedules |
| [dellctl encryption rekey](#dellctl-encryption-rekey) | Rekey an encrypted volume |
| [dellctl encryption rekey-status](#dellctl-encryption-rekey-status) | Get status of an encryption rekey operation |
| [dellctl images](#dellctl-images) | List the container images needed by csi driver |
| [dellctl volume get](#dellctl-volume-get) | Gets PowerFlex volume information for a given tenant on a local cluster |
| [dellctl admin token](#dellctl-admin-token) | Generate an administrator token for administrating CSM Authorization v2 |
| [dellctl generate token](#dellctl-generate-token) | Generate a tenant token for configuring a Dell CSI Driver with CSM Authorization v2 |


## Installation instructions
1. Download `dellctl` from [here](https://github.com/dell/csm/releases/latest/download/dellctl).
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

Allows you to manipulate one or more k8s cluster configurations

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

```bash
dellctl cluster add -n cluster1 -f ~/kubeconfigs/cluster1-kubeconfig
```
```
 INFO Adding clusters ...
 INFO Cluster: cluster1
 INFO Successfully added cluster cluster1 in /root/.dellctl/clusters/cluster1 folder.
```

Add a cluster with it's uid

```bash

dellctl cluster add -n cluster2 -f ~/kubeconfigs/cluster2-kubeconfig -u "035133aa-5b65-4080-a813-34a7abe48180"
```
```
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

```bash
dellctl cluster remove -n cluster1
```
```
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

```bash
dellctl cluster get
```
```
CLUSTER ID      VERSION URL                             UID
cluster1        v1.22   https://1.2.3.4:6443
cluster2        v1.22   https://1.2.3.5:6443            035133aa-5b65-4080-a813-34a7abe48180
```



---



## Commands related to application mobility operations

### dellctl backup

Allows you to manipulate application backups/clones

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

```bash
dellctl backup create backup1 --include-namespaces demo1
```
```
 INFO Backup request "backup1" submitted successfully.
 INFO Run 'dellctl backup get backup1' for more details.
```

Create clones of the application running in namespace `demo1`, on clusters with id `cluster1` and `cluster2`

```bash

dellctl backup create demo-app-clones --include-namespaces demo1 --clones "cluster1/demo1:restore-ns1" --clones "cluster2/demo1:restore-ns1"
```
```
 INFO Clone request "demo-app-clones" submitted successfully.
 INFO Run 'dellctl backup get demo-app-clones' for more details.
```

Take backup of application running in namespace `demo3` on remote cluster with id `cluster2`

```bash

dellctl backup create backup4 --include-namespaces demo3 --cluster-id cluster2
```
```
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

```bash
dellctl backup delete backup1
```
```
Are you sure you want to continue (Y/N)? Y
 INFO Request to delete backup "backup1" submitted successfully.
 INFO The backup will be fully deleted after all associated data (backup files, pod volume data, restores, velero backup) are removed.
```

Delete multiple backups

```bash
dellctl backup delete backup1 backup2
```
```
Are you sure you want to continue (Y/N)? Y
 INFO Request to delete backup "backup1" submitted successfully.
 INFO The backup will be fully deleted after all associated data (backup files, pod volume data, restores, velero backup) are removed.
 INFO Request to delete backup "backup2" submitted successfully.
 INFO The backup will be fully deleted after all associated data (backup files, pod volume data, restores, velero backup) are removed.
```


Delete all backups without asking for user confirmation

```bash
dellctl backup delete --all --confirm
```
```
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

```bash
dellctl backup get
```
```
NAME              STATUS      CREATED                         EXPIRES                         STORAGE LOCATION   DATA MOVER   CLONED   TARGET CLUSTERS
backup1           Completed   2022-07-27 11:51:00 -0400 EDT   2022-08-26 11:51:00 -0400 EDT   default            Restic       false
backup2           Completed   2022-07-27 11:59:24 -0400 EDT   2022-08-26 11:59:42 -0400 EDT   default            Restic       false
backup4           Completed   2022-07-27 12:02:54 -0400 EDT   NA                              default            Restic       false
demo-app-clones   Restored    2022-07-27 11:53:37 -0400 EDT   2022-08-26 11:53:37 -0400 EDT   default            Restic       true     cluster1, cluster2
```

Get backups from remote cluster with id `cluster2`

```bash
dellctl backup get --cluster-id cluster2
```
```
NAME              STATUS      CREATED                         EXPIRES                         STORAGE LOCATION   DATA MOVER   CLONED   TARGET CLUSTERS
backup1           Completed   2022-07-27 11:52:42 -0400 EDT   NA                              default            Restic       false
backup2           Completed   2022-07-27 12:02:29 -0400 EDT   NA                              default            Restic       false
backup4           Completed   2022-07-27 12:01:49 -0400 EDT   2022-08-26 12:01:49 -0400 EDT   default            Restic       false
demo-app-clones   Completed   2022-07-27 11:54:55 -0400 EDT   NA                              default            Restic       true     cluster1, cluster2
```

Get backups with their names

```bash
dellctl backup get backup1 demo-app-clones
```
```
NAME              STATUS      CREATED                         EXPIRES                         STORAGE LOCATION   DATA MOVER   CLONED   TARGET CLUSTERS
backup1           Completed   2022-07-27 11:51:00 -0400 EDT   2022-08-26 11:51:00 -0400 EDT   default            Restic       false
demo-app-clones   Completed   2022-07-27 11:53:37 -0400 EDT   2022-08-26 11:53:37 -0400 EDT   default            Restic       true     cluster1, cluster2
```



---



### dellctl restore

Allows you to manipulate application restores

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

```bash

dellctl restore create restore1 --from-backup backup1 --namespace-mappings "demo1:restorens1"
```
```
 INFO Restore request "restore1" submitted successfully.
 INFO Run 'dellctl restore get restore1' for more details.
```

Restore application backup `backup1` on remote cluster `cluster2` in namespace `demo1`

```bash
dellctl restore create restore1 --from-backup backup1 --cluster-id cluster2
```
```
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

```bash
dellctl restore delete restore1 --cluster-id cluster2
```
```
Are you sure you want to continue (Y/N)? Y
 INFO Request to delete restore "restore1" submitted successfully.
 INFO The restore will be fully deleted after all associated data (restore files, velero restore) are removed.
```

Delete multiple restores

```bash
dellctl restore delete restore1 restore4
```
```
Are you sure you want to continue (Y/N)? Y
 INFO Request to delete restore "restore1" submitted successfully.
 INFO The restore will be fully deleted after all associated data (restore files, velero restore) are removed.
 INFO Request to delete restore "restore4" submitted successfully.
 INFO The restore will be fully deleted after all associated data (restore files, velero restore) are removed.
```

Delete all restores without asking for user confirmation

```bash
dellctl restore delete --all --confirm
```
```
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

```bash
dellctl restore get
```
```
NAME       BACKUP    STATUS      CREATED                         COMPLETED
restore1   backup1   Completed   2022-07-27 12:35:29 -0400 EDT
restore4   backup1   Completed   2022-07-27 12:39:42 -0400 EDT
```

Get all the application restores created on remote cluster with id `cluster2`

```bash
dellctl restore get --cluster-id cluster2
```
```
NAME       BACKUP    STATUS      CREATED                         COMPLETED
restore1   backup1   Completed   2022-07-27 12:38:43 -0400 EDT
```

Get restores with their names

```bash
dellctl restore get restore1
```
```
NAME       BACKUP    STATUS      CREATED                         COMPLETED
restore1   backup1   Completed   2022-07-27 12:35:29 -0400 EDT
```



---



### dellctl schedule

Allows you to manipulate schedules

##### Available Commands

```
  create      Create a schedule
  delete      Delete schedules
  get         Get schedules
```

##### Flags

```
  -h, --help   Help for schedule  
```

##### Output

Outputs help text



---



### dellctl schedule create

Create a schedule

##### Available Commands

```
  for-backup  Create a schedule for application backups
```

##### Flags

```
      --cluster-id string   Id of the cluster managed by dellctl
  -h, --help                Help for create
      --name string         Name for the schedule
      --schedule string     A cron expression representing when to create the application backup  
```

##### Output

Outputs help text



---



### dellctl schedule create for-backup

Create a schedule for application backups

##### Flags

```
      --exclude-namespaces stringArray                        List of namespace names to exclude from the backup.
      --include-namespaces stringArray                        List of namespace names to include in the backup (use '*' for all namespaces). (default *)
      --ttl duration                                          Backup retention period. (default 720h0m0s)
      --exclude-resources stringArray                         Resources to exclude from the backup, formatted as resource.group, such as storageclasses.storage.k8s.io.
      --include-resources stringArray                         Resources to include in the backup, formatted as resource.group, such as storageclasses.storage.k8s.io (use '*' for all resources).
      --backup-location string                                Storage location where k8s resources and application data will be backed up to. (default "default")
      --data-mover string                                     Data mover to be used to backup application data. (default "Restic")
      --include-cluster-resources optionalBool[=true]         Include cluster-scoped resources in the backup
  -l, --label-selector labelSelector                          Only backup resources matching this label selector. (default <none>)
      --set-owner-references-in-backup optionalBool[=false]   Specifies whether to set OwnerReferences on backups created by this schedule.
  -n, --namespace string                                      The namespace in which application mobility service should operate. (default "app-mobility-system")
  -h, --help                                                  Help for for-backup
```

##### Global Flags

```
      --cluster-id string   Id of the cluster managed by dellctl
      --name string         Name for the schedule
      --schedule string     A cron expression representing when to create the application backup
```

##### Output

Create a schedule to backup namespace demo, every 1hour

```bash

dellctl schedule create for-backup --name schedule1 --schedule "@every 1h" --include-namespaces demo
```
```
 INFO schedule request "schedule1" submitted successfully.
 INFO Run 'dellctl schedule get schedule1' for more details.
```

Create a schedule to backup namespace demo, once a day at midnight and set OwnerReferences on backups created by this schedule

```bash

dellctl schedule create for-backup --name schedule2 --schedule "@daily" --include-namespaces demo --set-owner-references-in-backup
```
```
 INFO schedule request "schedule2" submitted successfully.
 INFO Run 'dellctl schedule get schedule2' for more details.
```

Create a schedule to backup namespace demo, at 23:00(11:00 pm) every saturday

```bash

dellctl schedule create for-backup --name schedule3 --schedule "00 23 * * 6" --include-namespaces demo
```
```
 INFO schedule request "schedule3" submitted successfully.
 INFO Run 'dellctl schedule get schedule3' for more details.
```



---



### dellctl schedule delete

Delete one or more schedules

##### Flags

```
      --all                 Delete all schedules
      --cluster-id string   Id of the cluster managed by dellctl
      --confirm             Confirm deletion
  -h, --help                Help for delete
  -n, --namespace string    The namespace in which application mobility service should operate. (default "app-mobility-system")
```

##### Output

Delete a schedule with name

```bash
dellctl schedule delete schedule1
```
```
Are you sure you want to continue (Y/N)? y
 INFO Request to delete schedule "schedule1" submitted successfully.
```

Delete multiple schedules

```bash
dellctl schedule delete schedule1 schedule2
```
```
Are you sure you want to continue (Y/N)? y
 INFO Request to delete schedule "schedule1" submitted successfully.
 INFO Request to delete schedule "schedule2" submitted successfully.
```

Delete all schedules without asking for user confirmation

```bash
dellctl schedule delete --confirm --all
```
```
 INFO Request to delete schedule "schedule1" submitted successfully.
 INFO Request to delete schedule "schedule2" submitted successfully.
```


---



### dellctl schedule get

Get schedules

##### Flags

```
      --cluster-id string   Id of the cluster managed by dellctl
  -h, --help                Help for get
  -n, --namespace string    The namespace in which application mobility service should operate. (default "app-mobility-system")
```

##### Output

Get all the application schedules created on local cluster

```bash
dellctl schedule get
```
```
NAME          STATUS    CREATED                         PAUSED   SCHEDULE    LAST BACKUP TIME
schedule1     Enabled   2022-11-04 08:33:35 +0000 UTC   false    @every 1h   NA
schedule2     Enabled   2022-11-04 08:35:57 +0000 UTC   false    @daily      NA
```

Get schedules with their names

```bash
dellctl schedule get schedule1
```
```
NAME          STATUS    CREATED                         PAUSED   SCHEDULE    LAST BACKUP TIME
schedule1     Enabled   2022-11-04 08:33:35 +0000 UTC   false    @every 1h   NA
```

### dellctl encryption rekey

Encryption rekey with a name for the rekey object and volume name of an encrypted volume

##### Flags

```
      --cluster-id string   Id of the cluster managed by dellctl
  -h, --help                help for get
```


##### Output


```bash
dellctl encryption rekey myrekey k8s-5d2cc565d4
```
```
 INFO rekey request "myrekey" submitted successfully for persistent volume "k8s-5d2cc565d4".
 INFO Run 'dellctl encryption rekey-status myrekey' for more details.
```


### dellctl encryption rekey-status

Encryption rekey status with name of the rekey object

##### Flags

```
      --cluster-id string   Id of the cluster managed by dellctl
  -h, --help                help for get
```


##### Output


```bash
dellctl encryption rekey-status myrekey
```
```
 INFO Status of rekey request myrekey = completed
```

### dellctl images

List the container images needed by csm components

**NOTE.**: 
# Supported CSM Components
[csi-vxflexos,csi-isilon,csi-powerstore,csi-unity,csi-powermax,csm-authorization]


#### Aliases

```
images,imgs
```

#### Flags

```
  Flags:
  -c, --component string   csm-component name
  -h, --help               help for images
  
```
#### Output


```bash
dellctl images --component csi-vxflexos
```
```
Driver/Module Image             Supported Orchestrator Versions         Sidecar Images
dellemc/csi-vxflexos:v2.9.0     k8s1.28,k8s1.27,k8s1.26,ocp4.14,ocp4.13 registry.k8s.io/sig-storage/csi-attacher:v4.4.2
                                                                        registry.k8s.io/sig-storage/csi-provisioner:v3.6.2
                                                                        registry.k8s.io/sig-storage/csi-external-health-monitor-controller:v0.10.0
                                                                        registry.k8s.io/sig-storage/csi-snapshotter:v6.3.2
                                                                        registry.k8s.io/sig-storage/csi-resizer:v1.9.2
                                                                        registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.9.1
                                                                        dellemc/sdc:4.5

dellemc/csi-vxflexos:v2.8.0     k8s1.27,k8s1.26,k8s1.25,ocp4.13,ocp4.12 registry.k8s.io/sig-storage/csi-attacher:v4.3.0
                                                                        registry.k8s.io/sig-storage/csi-provisioner:v3.5.0
                                                                        registry.k8s.io/sig-storage/csi-external-health-monitor-controller:v0.9.0
                                                                        registry.k8s.io/sig-storage/csi-snapshotter:v6.2.2
                                                                        registry.k8s.io/sig-storage/csi-resizer:v1.8.0
                                                                        registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.8.0
                                                                        dellemc/sdc:3.6.1

dellemc/csi-vxflexos:v2.7.0     k8s1.27,k8s1.26,k8s1.25,ocp4.12,ocp4.11 registry.k8s.io/sig-storage/csi-attacher:v4.3.0
                                                                        registry.k8s.io/sig-storage/csi-provisioner:v3.5.0
                                                                        registry.k8s.io/sig-storage/csi-external-health-monitor-controller:v0.9.0
                                                                        registry.k8s.io/sig-storage/csi-snapshotter:v6.2.2
                                                                        registry.k8s.io/sig-storage/csi-resizer:v1.8.0
                                                                        registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.8.0
                                                                        dellemc/sdc:3.6.0.6

```

```bash
dellctl images --component csm-authorization
```
```
Driver/Module Image                             Supported Orchestrator Versions Sidecar Images
dellemc/csm-authorization-sidecar:v1.9.0        k8s1.28,k8s1.27,k8s1.26         jetstack/cert-manager-cainjector:v1.6.1
                                                                                jetstack/cert-manager-controller:v1.6.1
                                                                                jetstack/cert-manager-webhook:v1.6.1
                                                                                ingress-nginx/controller:v1.4.0
                                                                                ingress-nginx/kube-webhook-certgen:v20220916-gd32f8c343

dellemc/csm-authorization-sidecar:v1.8.0        k8s1.27,k8s1.26,k8s1.25         jetstack/cert-manager-cainjector:v1.6.1
                                                                                jetstack/cert-manager-controller:v1.6.1
                                                                                jetstack/cert-manager-webhook:v1.6.1
                                                                                ingress-nginx/controller:v1.4.0
                                                                                ingress-nginx/kube-webhook-certgen:v20220916-gd32f8c343

dellemc/csm-authorization-sidecar:v1.7.0        k8s1.27,k8s1.26,k8s1.25         jetstack/cert-manager-cainjector:v1.6.1
                                                                                jetstack/cert-manager-controller:v1.6.1
                                                                                jetstack/cert-manager-webhook:v1.6.1
                                                                                ingress-nginx/controller:v1.4.0
                                                                                ingress-nginx/kube-webhook-certgen:v20220916-gd32f8c343
```

### dellctl volume get

Gets PowerFlex volume information for a given tenant on a local cluster

##### Aliases
  get, ls, list

##### Flags

```
  -h, --help                           help for get
      --insecure optionalBool[=true]   provide flag to skip certificate validation
      --namespace string               namespace of the secret for the given tenant
      --proxy string                   auth proxy endpoint to use
```

##### Output

Gets PowerFlex volume information for a given tenant on a local cluster. The namespace is the namespace where tenant secret is created. 

>Note: This was output was generated using Authorization Proxy version 1.5.1. Please ensure you are using version 1.5.1 or greater.

```bash
dellctl volume get --proxy <proxy.dell.com> --namespace vxflexos
```
```
# dellctl volume get --proxy <proxy.dell.com> --namespace vxflexos

NAME             VOLUME ID          SIZE       POOL     SYSTEM ID          PV NAME          PV STATUS   STORAGE CLASS   PVC NAME       NAMESPACE
k8s-e7c8b39112   a69bf18e00000008   8.000000   mypool   636468e3638c840f   k8s-e7c8b39112   Released    vxflexos        demo-claim10   default
k8s-e6e2b46103   a69bf18f00000009   8.000000   mypool   636468e3638c840f   k8s-e6e2b46103   Bound       vxflexos        demo-claim11   default
k8s-b1abb817d3   a69bf19000000001   8.000000   mypool   636468e3638c840f   k8s-b1abb817d3   Bound       vxflexos        demo-claim13   default
k8s-28e4184f41   c6b2280d0000009a   8.000000   mypool   636468e3638c840f   k8s-28e4184f41   Available   local-storage  
k8s-7296621062   a69b554f00000004   8.000000   mypool   636468e3638c840f
```

### dellctl admin token

Generate an administrator token for administrating CSM Authorization v2

##### Flags

```
      --access-token-expiration duration    Expiration time of the access token, e.g. 1m30s (default 1m0s)
  -h, --help                                help for token
  -s, --jwt-signing-secret string           Specify JWT signing secret, or omit to use stdin
  -n, --name string                         Admin name
      --refresh-token-expiration duration   Expiration time of the refresh token, e.g. 48h (default 720h0m0s)
```

##### Output

```bash
dellctl admin token -n <administrator-name> --jwt-signing-secret <signing-secret>
```

```
# dellctl admin token -n admin --jwt-signing-secret secret
{
  "Access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjc20iLCJleHAiOjE3MjA3MDk1MTcsImdyb3VwIjoiYWRtaW4iLCJpc3MiOiJjb20uZGVsbC5jc20iLCJyb2xlcyI6IiIsInN1YiI6ImNzbS1hZG1pbiJ9.WS5NSxrCoMn90ohOZZyyGoBias583xYumeKvmIrCqSs",
  "Refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjc20iLCJleHAiOjE3MjMzMDE0NTcsImdyb3VwIjoiYWRtaW4iLCJpc3MiOiJjb20uZGVsbC5jc20iLCJyb2xlcyI6IiIsInN1YiI6ImNzbS1hZG1pbiJ9.MJ9ajrB-nLEQKdAA-H8n78kS9QiX1yW_-m7K4Tmu7Mg"
}
```

### dellctl generate token

Generate a tenant token for configuring a Dell CSI Driver with CSM Authorization v2

##### Flags

```
      --access-token-expiration duration    Expiration time of the access token, e.g. 1m30s (default 1m0s)
  -h, --help                                help for token
      --refresh-token-expiration duration   Expiration time of the refresh token, e.g. 48h (default 720h0m0s)
  -t, --tenant string                       Tenant name

Global Flags:
      --addr string          Address of the CSM Authorization Proxy Server; required
  -f, --admin-token string   Path to admin token file; required
      --insecure             Skip certificate validation of the CSM Authorization Proxy Server
```

##### Output

```bash
dellctl generate token --admin-token <admin-token-file> --addr <csm-authorization-address> --tenant <tenant-name>
```

```
# dellctl admin token -n admin --jwt-signing-secret secret
apiVersion: v1
data:
  access: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKamMyMGlMQ0psZUhBaU9qRTJPREl3TVRBeU5UTXNJbWR5YjNWd0lqb2labTl2SWl3aWFYTnpJam9pWTI5dExtUmxiR3d1WTNOdElpd2ljbTlzWlhNaU9pSmlZWElpTENKemRXSWlPaUpqYzIwdGRHVnVZVzUwSW4wLjlSYkJISzJUS2dZbVdDX0paazBoSXV0N0daSDV4NGVjQVk2ekdaUDNvUWs=
  refresh: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKamMyMGlMQ0psZUhBaU9qRTJPRFEyTURJeE9UTXNJbWR5YjNWd0lqb2labTl2SWl3aWFYTnpJam9pWTI5dExtUmxiR3d1WTNOdElpd2ljbTlzWlhNaU9pSmlZWElpTENKemRXSWlPaUpqYzIwdGRHVnVZVzUwSW4wLkxQcDQzbXktSVJudTFjdmZRcko4M0pMdTR2NXlWQlRDV2NjWFpfWjROQkU=
kind: Secret
metadata:
  creationTimestamp: null
  name: proxy-authz-tokens
type: Opaque
```
