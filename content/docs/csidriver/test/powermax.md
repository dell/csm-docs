---
title: Test PowerMax CSI Driver
linktitle: PowerMax
description: Tests to validate PowerMax CSI Driver installation
---

This section provides multiple methods to test driver functionality in your environment. The tests are validated using bash as the default shell.

**Note**: To run the test for CSI Driver for Dell PowerMax, install Helm 3.

The _csi-powermax_ repository includes examples of how you can use CSI Driver for Dell PowerMax. The shell scripts are used to automate the installation and uninstallation of helm charts for the creation of Pods with a different number of volumes in a given namespace using the storageclass provided. To test the installation of the CSI driver, perform these tests:
- Volume clone test
- Volume test
- Snapshot test

#### Volume test

Use this procedure to perform a volume test.

1. Create a namespace with the name _test_.
2. Run the `cd csi-powermax/test/helm` command to go to the `csi-powermax/test/helm` directory, which contains the `starttest.sh` script and the _2vols_ directories.
3. Run the starttest.sh script and provide it with a test name. The following sample command can be used to run the _2vols_ test: 
   ```bash
   
   ./starttest.sh -t 2vols -n <test_namespace> -s <storageclass-name>
   ```

    This script installs a helm chart that creates a Pod with a container, creates two PVCs, and mounts them into the created container. You can now log in to the newly created container and check the mounts.
4. Run the `/stoptest.sh -t 2vols -n <test_namespace>` script to stop the test. This script deletes the Pods and the PVCs created during the test and uninstalls the helm chart.

>*NOTE*: Helm tests have been designed assuming that users have created storageclass names like `storageclass-name` and `storageclass-name-xfs`. You can use `kubectl get sc` to check for the storageclass names.

#### Volume clone test

Use this procedure to perform a volume clone test.

1. Create a namespace with the name _test_.
2. Run the `cd csi-powermax/test/helm` command to go to the `csi-powermax/test/helm` directory, which contains the `volumeclonetest.sh` script.
3. Run the `volumeclonetest.sh` script using the following command: 
   ```bash 

   volumeclonetest.sh -n <test_namespace> -s <storageclass-name>
   ```

This script does the following:
- Installs a helm chart that creates a Pod with a container, creates two PVCs, and mounts them into the created container.
- Then it creates a file on one of the PVCs and calculates its checksum.
- After that, it uses that PVC as the data source to create a new PVC and mounts it on the same container. It checks if the file that existed in the source PVC also exists in the new PVC, calculates its checksum, and compares it to the checksum previously calculated.
- Finally, it cleans up all the resources that are created as part of the test.

#### Snapshot test

Use this procedure to perform a snapshot test.

1. Create a namespace with the name _test_.
2. Run the `cd csi-powermax/test/helm` command to go to the `csi-powermax/test/helm` directory, which contains the `snaprestoretest.sh`script.
3. Run the `snaprestoretest.sh` script by running the command : `bash snaprestoretest.sh -n <test_namespace> -s <storageclass-name>`
  
  This script does the following:
  - Installs a helm chart that creates a Pod with a container, creates two PVCs, and mounts them into the created container.
  - Writes some data to one of the PVCs.
  - After that, it creates a snapshot of that PVC and uses it as a data source to create a new PVC. It mounts the newly created PVC to the container created earlier and then lists the contents of the source and the target PVCs.
  - Cleans up all the resources that were created as part of the test.

>*NOTE*: This test has been designed assuming that users are using the snapshot class name `powermax-snapclass`. You must update the snapshot class name in the file `snap1.yaml` present in the test/helm folder based on your method of deployment. To get a list of volume snapshot classes, run the command - `kubectl get volumesnapshotclass`

#### Volume Expansion test

Use this procedure to perform a volume expansion test.

1. Create a namespace with the name _test_
2. Run the `cd csi-powermax/test/helm` command to go to the `csi-powermax/test/helm` directory, which contains the `volumeexpansiontest.sh`script.
3. Run the `volumeexpansiontest.sh` script by running the command : `bash volumeexpansiontest.sh -n <test_namespace> -s <storageclass-name>`

  This script does the following:
  - Installs a helm chart that creates a Pod with a container, creates one PVC, and mounts it into the created container
  - Writes some data to the PVC
  - After that, it calculates the checksum of the written data, expands the PVC, and then recalculates the checksum
  - Cleans up all the resources that were created as part of the test

>Note: This is not applicable for replicated volumes.

### Setting Application Prefix 

Application prefix is the name of the application that can be used to group the PowerMax volumes. We can use it while naming storage group. To set the application prefix for PowerMax, please refer to the sample storage class https://github.com/dell/csi-powermax/blob/main/samples/storageclass/powermax.yaml.

```yaml
# Name of application to be used to group volumes
  # This is used in naming storage group
  # Optional: true, Default value: None
  # Examples: APP, app, sanity, tests
  ApplicationPrefix: <application prefix>  
```
>Note: Supported length of storage group for PowerMax is 64 characters. Storage group name is of the format "csi-`clusterprefix`-`application prefix`-`SLO name`-`SRP name`-SG". Based on the other inputs like clusterprefix,SLO name and SRP name maximum length of the ApplicationPrefix can vary.

## Consuming existing volumes with static provisioning

Use this procedure to consume existing volumes with static provisioning.

1. Open your Unisphere for PowerMax, and take a note of volume-id.
2. Create PersistentVolume and use this volume-id as a volumeHandle in the manifest. Modify other parameters according to your needs.
3. In the following example, storage class is assumed as 'powermax', cluster prefix as 'ABC' and volume's internal name as '00001', array ID as '000000000001', volume ID as '1abc23456'. The volume-handle should be in the format of `csi`-`clusterPrefix`-`volumeNamePrefix`-`id`-`arrayID`-`volumeID`.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pvol
  namespace: test  
spec:
  accessModes:
  - ReadWriteOnce
  capacity:
    storage: 8Gi
  csi:
    driver: csi-powermax.dellemc.com
    volumeHandle: csi-ABC-pmax-1abc23456-000000000001-00001
  persistentVolumeReclaimPolicy: Retain
  storageClassName: powermax
  volumeMode: Filesystem
```

3. Create PersistentVolumeClaim to use this PersistentVolume.

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: pvc
  namespace: test
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 8Gi
  storageClassName: powermax
  volumeMode: Filesystem
  volumeName: pvol         
```

4. Then use this PVC as a volume in a pod.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: powermaxtest
  namespace: test
---
kind: StatefulSet
apiVersion: apps/v1
metadata:
  name: powermaxtest
  namespace: test
spec:
  selector:
    matchLabels:
     app: powermaxtest
  serviceName: staticprovisioning
  template:
   metadata:
    labels:
     app: powermaxtest
   spec:
    serviceAccount: powermaxtest
    containers:
     - name: test 
      image: docker.io/centos:latest
      command: [ "/bin/sleep", "3600" ]
      volumeMounts:
       - mountPath: "/data"
        name: pvc
    volumes:
     - name: pvc
      persistentVolumeClaim:
       claimName: pvc
```

5. After the pod becomes `Ready` and `Running`, you can start to use this pod and volume.

>Note: CSI driver for PowerMax will create the necessary objects like Storage group, HostID and Masking View. They must not be created manually.


## Setting QoS parameters for throttling performance and bandwidth 

Use this procedure to set QoS parameters for throttling performance and bandwidth

1. Create [storage class](https://github.com/dell/csi-powermax/tree/main/samples/storageclass) with the following parameters set.

``` yaml
 # Following params are for HostLimits, set them only if you want to set IOLimits
  # HostLimitName uniquely identifies given set of limits on a storage class
  # This is used in naming storage group, max of 3 letter
  # Optional: true
  # Example: "HL1", "HL2"
  #HostLimitName: "HL1"
  # The MBs per Second Host IO limit for the storage class
  # Optional: true, Default: ""
  # Examples: 100, 200, NOLIMIT
  #HostIOLimitMBSec: ""
  # The IOs per Second Host IO limit for the storage class
  # Optional: true, Default: ""
  # Examples: 100, 200, NOLIMIT
  #HostIOLimitIOSec: ""
  # distribution of the Host IO limits for the storage class
  # Optional: true, Default: ""
  # Allowed values: Never","Always" or "OnFailure" only
  #DynamicDistribution: ""
  ```

2. Use the above storage class to create the PVC and provision the volume to the pod.

3. Once the pod becones `Ready` and `Running`, you will see the QoS parameters applied for throttling performance and bandwidth.