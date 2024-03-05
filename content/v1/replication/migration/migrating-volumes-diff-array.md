---
title: Between Storage Arrays
linktitle: Between Storage Arrays
weight:   1
description: >
  Support for Array Migration of Volumes between arrays
---

User can migrate existing pre-provisioned volumes to another storage array by using the array migration feature. 

> _**NOTE**_: Currently only migration of standalone block volumes is supported. 

## Prerequisites 

This feature needs to be planned in a controlled host environment.

If the user have native multipathing, the user has to run multipath list commands on all nodes to ensure that there are no faulty paths on the host. If any faulty paths exist, the user has to flush the paths, and have a clean setup before migration is triggered using the following command:

```bash
rescan-scsi-bus.sh --remove
```

#### On Storage Array 

User has to configure physical SRDF connection between source array (where the volumes are currently provisioned) and target array (where the volumes should be migrated).

#### In Kubernetes 

User need to ensure that migration group CRD is installed. 

To install CRD, user can run the command as below:

```bash
kubectl create -f deploy/replicationcrds.all.yaml
```

## Support Matrix

| PowerMax | PowerStore | PowerScale | PowerFlex | Unity | 
| - | - | - | - | - | 
| Yes | No | No | No | No |

## Installing Driver With sidecars 

Dell-csi-migrator and dell-csi-node-rescanner sidecars are installed alongside with the driver, the user can enable it in the driver's myvalues.yaml file.

#### Sample:

```yaml
# CSM module attributes 
# Set this to true to enable migration 
# Allowed values: 
#   "true" - migration is enabled 
#   "false" - migration is disabled
# Default value: "false" 
migration: 
  enabled: true
  # Change this to use any specific version of the dell-csi-migrator sidecar 
  # Default value: None 
  nodeRescanSidecarImage: dellemc/dell-csi-node-rescanner:v1.0.0 
  image: dellemc/dell-csi-migrator:v1.1.0 
  # migrationPrefix: Determine if migration is enabled 
  # Default value: "migration.storage.dell.com" 
  # Examples: "migration.storage.dell.com" 
  migrationPrefix: "migration.storage.dell.com" 
``` 

Target array configuration and endpoint needs to be updated in the driver's [myvalues.yaml](../../../csidriver/installation/helm/powermax/#csi-powermax-driver-with-proxy-in-standalone-mode) file as shown below:  

```yaml
  ########################## 
  # PLATFORM ATTRIBUTES 
  ##########################
  # The CSI PowerMax ReverseProxy section to fill out the required configuration  
  defaultCredentialsSecret: powermax-creds 
  storageArrays: 
    - storageArrayId: "000000000000" 
      endpoint: https://00.000.000.00:0000 
#      backupEndpoint: https://backup-1.unisphe.re:8443 
    - storageArrayId: "000120001178" 
      endpoint: https://00.000.000.00:0000 
#      backupEndpoint: https://backup-2.unisphe.re:8443 
```
 
After enabling the migration module the user can continue to install the CSI driver following usual installation procedure.

## PowerMax Support 

CSM for PowerMax supports the following migrations: 

- From a VMAX3 array to VMAX All Flash, or PowerMax array.  

- From a PowerMax array to another PowerMax array.

#### Basic Usage 

To trigger array migration procedure, the user need to create the migration group for the required source and target array.  

Creating the migration group will trigger reconcile action on the migrator sidecar that will call ArrayMigrate() on the CSI driver with actions `migrate` or `commit`. After the migrated state, the migration group will trigger reconcile on the node-rescanner sidecar. 

#### Manual Migration Group Creation 

User can find sample migration group manifest in the driver repository [here](https://github.com/dell/csi-powermax/tree/main/samples/migrationgroup). A sample is provided below, for convenience:  

``` yaml
apiVersion: "replication.storage.dell.com/v1"
kind: DellCSIMigrationGroup
metadata:
  # custom name of the migration group
  # Default value: pmax-migration
  name: pmax-migration
spec:
  # driverName: exact name of CSI PowerMax driver
  driverName: "csi-powermax.dellemc.com"
  # sourceID: source ArrayID
  sourceID: "000000001234"
  # targetID: target ArrayID
  targetID: "000000005678"
  migrationGroupAttributes:
    action: "migrate"
 ```   
 To create the migration group, use the below command:

 ```bash
kubectl -create -f <manifest.yaml>
```

After completion of migration, the migration group comes to deleting state after which the admin can manually delete the migration group with the below command:

```bash
kubectl -delete -f <manifest.yaml>
``` 

## Post migration 

The PV/PVCs will be mounted, up and running after migration and the pod can continue service as before.  

> _**LIMITATION**_: Any control operations like expansion, snapshot creation, replication workflows on migrated PV/PVCs will not be supported. 
