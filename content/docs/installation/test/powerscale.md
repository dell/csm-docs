---
title: Test PowerScale CSI Driver
linktitle: PowerScale
description: Tests to validate PowerScale CSI Driver installation
---

This section provides multiple methods to test driver functionality in your environment.

**Note**: To run the test for CSI Driver for Dell EMC PowerScale, install Helm 3.

## Test deploying a simple pod with PowerScale storage

Test the deployment workflow of a simple pod on PowerScale storage.

1. **Creating a storage class:**

   Create a file `storageclass.yaml` using sample yaml file located at helm/samples/storageclass

   Execute the following command to create storage class:
   ```
   kubectl create -f $PWD/storageclass.yaml
   ```

   Result: After executing the above command storage class will be created in the default namespace, and the user can see the storage class by executing `kubectl get sc`.
   Note: Verify system for the new storage class.

2. **Creating a volume:**

    Create a file `pvc.yaml` using sample yaml files located at test/sample_files/


    Execute the following command to create volume:
    ```
    kubectl create -f $PWD/pvc.yaml
    ```

    Result: After executing the above command PVC will be created in the default namespace, and the user can see the pvc by executing `kubectl get pvc`. 
    Note: Verify system for the new volume. Note that the status of the volume can be either Bound or Pending depending on the VolumeBindingMode specified on storage class.

3. **Attach the volume to Host**

    To attach a volume to a host, create a new application(Pod) and use the PVC created above in the Pod. This scenario is explained using the Nginx application. Create `nginx.yaml` 
    using sample yaml files located at test/sample_files/.

    Execute the following command to mount the volume to Kubernetes node:
    ```
    kubectl create -f $PWD/nginx.yaml
    ```

    Result: After executing the above command, new nginx pod will be successfully created and started in the default namespace.
    Note: Verify PowerScale system for host to be part of clients/rootclients field of export created for volume and used by nginx application.

4. **Create Snapshot**

    The following procedure will create a snapshot of the volume in the container using VolumeSnapshot objects defined in snap.yaml. The sample file for snapshot creation is located at test/sample_files/
    
    Execute the following command to create snapshot:
    ```
    kubectl create -f $PWD/snap.yaml
    ```
    
    The spec.source section contains the volume that will be snapped in the default namespace. For example, if the volume to be snapped is testvolclaim1, then the created snapshot is named testvolclaim1-snap1. Verify the PowerScale system for newly created snapshot.
    
    Note:
    
    * User can see the snapshots using `kubectl get volumesnapshot`
    * Notice that this VolumeSnapshot class has a reference to a snapshotClassName:isilon-snapclass. The CSI Driver for PowerScale installation creates this class 
      as its default snapshot class. 
    * You can see its definition using `kubectl get volumesnapshotclasses isilon-snapclass -o yaml`.
    * The value of IsiPath in default VolumeSnapshotClass is taken from values.yaml. If user wants different path, she has to create custom volumesnapshot class with required IsiPath in parameters section.
    * Sample VolumeSnapshotClass file is present under helm/samples/volumesnapshotclass

5. **Create Volume from Snapshot**

    The following procedure will create a new volume from a given snapshot which is specified in spec dataSource field.
    
    The sample file for volume creation from snapshot is located under test/sample_files/
    
    Execute the following command to create snapshot:
    ```
    kubectl create -f $PWD/volume_from_snap.yaml
    ```

    Verify the PowerScale system for newly created volume from snapshot.

6. **Delete Snapshot**

    Execute the following commands to delete the snapshot:
    
    ```
    kubectl get volumesnapshot
    kubectl delete volumesnapshot pvcsnap
    ```

7. **Create new volume from existing volume(volume clone)**

    The following procedure will create a new volume from another existing volume which is specified in spec dataSource field.
    
    The sample file for volume creation from volume is located at test/sample_files/
    
    Execute the following command to create snapshot:
    ```
    kubectl create -f $PWD/volume_from_volume.yaml
    ```

    Verify the PowerScale system for new created volume from volume.

8.  **To Unattach the volume from Host**

    Delete the nginx application to unattach the volume from host:
    
    `kubectl delete -f nginx.yaml`

9.  **To delete the volume**

    ```
    kubectl get pvc
    kubectl delete pvc testvolclaim1
    kubectl get pvc
    ```
