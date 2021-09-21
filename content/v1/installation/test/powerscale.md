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

   Execute the following command to create a storage class:
   ```
   kubectl create -f $PWD/storageclass.yaml
   ```

   Result: After executing the above command storage class will be created in the default namespace, and the user can see the storage class by executing `kubectl get sc`.
  

2. **Creating a volume:**

    Create a file `pvc.yaml` using sample yaml files located at test/sample_files/
    
    Execute the following command to create volume:
    
    `kubectl create -f $PWD/pvc.yaml`
    
    Result: After executing the above command PVC will be created in the default namespace, and the user can see the pvc by executing the command kubectl get pvc. 
      
**Note**: The status of the volume can be either Bound or Pending depending on the VolumeBindingMode specified on the storage class.
      

3. **Attach the volume to Host**

    To attach a volume to a host, create a new application(Pod) and use the PVC created above in the Pod. This scenario is explained using the Nginx application. Create `nginx.yaml` using sample yaml files located at test/sample_files/.

    Execute the following command to mount the volume to the Kubernetes node:
    ```
    kubectl create -f $PWD/nginx.yaml
    ```

    Result: After executing the above command, a new nginx pod will be successfully created and started in the default namespace.
    **Note**: Verify PowerScale system for the host to be part of clients/rootclients field of export created for volume and used by nginx application.
  

4. **Create Snapshot**

   VolumeSnapshotClass is needed for creating the volume snapshots. Starting from v1.6, CSI Driver for PowerScale will not create any default Volume Snapshot class.

   So the user has to create a volume snapshot class. The required sample files are present under /helm/samples/volumesnapshotclass. Choose the file based on Kubernetes version. 

   Execute either one of the following commands to create a volume snapshot class.

   `kubectl create -f $PWD/volsnapclass_v1.yaml` OR `kubectl create -f $PWD/volsnapclass_beta.yaml`

   The above-said command will create a volume snapshotclass with the name isilon-snapclass.


   The following procedure will create a snapshot of the volume in the container using VolumeSnapshot objects defined in snap.yaml. The sample file for snapshot creation is located at test/sample_files/.

   Execute the following command to create snapshot:
        
      `kubectl create -f $PWD/snap.yaml` 

   The spec.source section contains the volume that will be snapped in the default namespace. For example, if the volume to be snapped is testvolclaim1, then the created snapshot is named testvolclaim1-snap1. Verify the PowerScale system for the newly created snapshot.
    

**Note**:

* User can see the snapshots using `kubectl get volumesnapshot`
* Notice that this VolumeSnapshot class has a reference to a snapshotClassName:isilon-snapclass.
*  User has to make sure that the IsiPath in the parameters section of the volume snapshot class is matching with a corresponding storage class.
  

5. **Create Volume from Snapshot**

    The following procedure will create a new volume from a given snapshot which is specified in the spec dataSource field.
    
    The sample file for volume creation from the snapshot is located under test/sample_files/
    
    Execute the following command to create a snapshot:
    ```
    kubectl create -f $PWD/volume_from_snap.yaml
    ```

    Verify the PowerScale system for newly created volume from the snapshot.
  

6. **Delete Snapshot**

    Execute the following commands to delete the snapshot:
    
    ```
    kubectl get volumesnapshot
    kubectl delete volumesnapshot pvcsnap
    ```
  

7. **Create a new volume from existing volume(volume clone)**

    The following procedure will create a new volume from another existing volume which is specified in the spec dataSource field.
    
    The sample file for volume creation from volume is located at test/sample_files/
    
    Execute the following command to create a snapshot:
    ```
    kubectl create -f $PWD/volume_from_volume.yaml
    ```

    Verify the PowerScale system for newly created volume from volume.
  

8.  **To Unattach the volume from Host**

    Delete the nginx application to Unattach the volume from the host:
    
    `kubectl delete -f nginx.yaml`
  

9.  **To delete the volume**

    ```
    kubectl get pvc
    kubectl delete pvc testvolclaim1
    kubectl get pvc
    ```
