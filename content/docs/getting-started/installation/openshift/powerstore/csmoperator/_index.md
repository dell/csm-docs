---
title: Operator
linkTitle: Operator
description: >
  Installing the CSI Driver for PowerStore via Container Storage Module Operator 
no_list: true 
weight: 2
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

## Installing the Operator
To deploy the Operator, follow the instructions available [here](../../../operator/operatorinstallation_openshift.md).

{{< accordion id="One" title="CSM Installation Wizard" >}}
  {{< includee file="content/docs/getting-started/installation/installationwizard/operator.md" hideIds="1,2,3" >}}
{{< /accordion >}}

<br>

{{< accordion id="Two" title="CSI Driver" markdown="true" >}}   
### CSI Driver Installation
</br>

1. ##### **Create project:**
    
    <br>

    Use this command to create new project. You can use any project name instead of `powerstore`.

    ```bash 
    oc new-project powerstore
    ```


2. ##### **Create config secret:** 
       
    <br>

    Create a file called `config.yaml` or use [sample](https://github.com/dell/csi-powerstore/blob/main/samples/secret/secret.yaml): 
   
    Example: 
    <div style="margin-bottom: -1.8rem">
    
    ```yaml
    cat << EOF > config.yaml
    arrays:
    - endpoint: "https://11.0.0.1/api/rest"
        globalID: "unique"
        username: "user"
        password: "password"
        skipCertificateValidation: true
        blockProtocol: "FC"
    EOF
    ```
    </div> 

    Add blocks for each PowerStore array in `config.yaml`, and include both source and target arrays if replication is enabled. 
    
    The username in `config.yaml` must be from PowerStore’s authentication providers and have at least the **Storage Operator** role.
 
    <br>

    Edit the file, then run the command to create the `powerstore-config`.

    ```bash
    oc create secret generic powerstore-config --from-file=config=config.yaml -n powerstore --dry-run=client -oyaml > secret-config.yaml
    ```
    
    Use this command to **create** the config:

    ```bash 
    oc apply -f secret-powerstore-config.yaml
    ```

    Use this command to **replace or update** the config:

    ```bash
    oc replace -f secret-powerstore-config.yaml --force
    ```
  
    Verify config secret is created.

    ```terminal
    oc get secret -n powerstore
     
    NAME                 TYPE        DATA   AGE
    powerstore-config    Opaque      1      3h7m
    ```  
  </br>

3. ##### **Create Custom Resource** ContainerStorageModule for powerstore.
   
   <br>

    Use this command to create the **ContainerStorageModule Custom Resource**:

    ```bash
    oc create -f csm-store.yaml
    ```

    Example:
    <div style="margin-bottom: -1.8rem">


    ```yaml
    cat << EOF > csm-powerstore.yaml
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
    name: powerstore
    namespace: powerstore
    spec:
    driver:
       csiDriverType: "powerstore"
       configVersion: v2.13.0
       forceRemoveDriver: true
    EOF 
    ``` 
    </div> 

    **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerstore_v2130.yaml) for detailed settings.

    To set the parameters in CR. The table shows the main settings of the PowerStore driver and their defaults.
<ul>
{{< collapse id="1" title="Parameters">}}

  | Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be in pending state until new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
| namespace | Specifies namespace where the driver will be installed | Yes | "powerstore" |
| fsGroupPolicy | Defines which FS Group policy mode to be used. Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No |"ReadWriteOnceWithFSType"|
| storageCapacity | Enable/Disable storage capacity tracking feature | No | false |
| ***Common parameters for node and controller*** |
| X_CSI_POWERSTORE_NODE_NAME_PREFIX | Prefix to add to each node registered by the CSI driver | Yes | "csi-node"
| X_CSI_FC_PORTS_FILTER_FILE_PATH | To set path to the file which provides a list of WWPN which should be used by the driver for FC connection on this node | No | "/etc/fc-ports-filter" |
| ***Controller parameters*** |
| X_CSI_POWERSTORE_EXTERNAL_ACCESS | allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | empty |
| X_CSI_NFS_ACLS | Defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory. | No | "0777" |
| ***Node parameters*** |
| X_CSI_POWERSTORE_ENABLE_CHAP | Set to true if you want to enable iSCSI CHAP feature | No | false |
{{< /collapse >}}
</ul>

<ul>
Check if ContainerStorageModule CR is created successfully:

```terminal
oc get csm powerstore -n powerstore

NAME        CREATIONTIME   CSIDRIVERTYPE   CONFIGVERSION   STATE
powerstore    3h             powerstore      v2.12.0         Succeeded      
```

Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.
</ul>


4. ##### **Create Storage class:** 
    
    <br>

    Use this command to create the **Storage Class**: 

    ```bash
    oc create -f sc-powerstore.yaml
    ```

    Example: 
    <div style="margin-bottom: -1.8rem">


    ```yaml
    cat << EOF > sc-powerstore.yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: "powerstore-ext4"
    provisioner: "csi-powerstore.dellemc.com"
    parameters:
    csi.storage.k8s.io/fstype: "ext4"
    reclaimPolicy: Delete
    allowVolumeExpansion: true
    volumeBindingMode: Immediate
    EOF
    ```
    </div>
    
     Replace placeholders with actual values for your powerstore array and various storage class sample refer [here](https://github.com/dell/csi-powerstore/tree/main/samples/storageclass) 
      
    Verify Storage Class is created: 

    ```terminal
    oc get storageclass powerstore
  
    NAME                    PROVISIONER                    RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
    powerstore(default)     csi-powerstore.dellemc.com     Delete          Immediate           true                   3h8m
    ``` 

    </br>

6. ##### **Create Volume Snapshot Class:** 

    <br>
    
    Use this command to create the **Volume Snapshot**: 


    ```bash
    oc create -f vsclass-powerstore.yaml
    ```

    Example:
    ```yaml
    cat << EOF > vsclass-powerstore.yaml
    apiVersion: snapshot.storage.k8s.io/v1
    kind: VolumeSnapshotClass
    metadata:
    name: powerstore-snapshot
    driver: "csi-powerstore.dellemc.com" 
    deletionPolicy: Delete
    EOF 
    ```

    Verify Volume Snapshot Class is created: 

    ```terminal
    oc get volumesnapshotclass
    
    NAME                      DRIVER                              DELETIONPOLICY   AGE
    powerstore-snapclass      csi-powerstore.dellemc.com          Delete           3h9m
    ``` 
   </br>

    **Note** :
     - "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.


### PVC and Pod Creation

 </br>

1. ##### **Create Persistent Volume Claim:**


    <br>
    
    Use this command to create the **Persistent Volume Claim**: 

    ```bash
    oc create -f pvc-powerstore.yaml
    ```

    Example:
    ```yaml
    cat << EOF > pvc-powerstore.yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: pvc-powerstore
      namespace: default
    spec:
      accessModes:
      - ReadWriteOnce
      resources:
        requests:
          storage: 8Gi
      storageClassName: powerstore
    EOF
    ```
  
    Verify Persistent Volume Claim is created: 

    ```terminal
    oc get pvc -n powerstore
 

    ```

     </br>

2.  ##### **Create Pod which uses Persistent Volume Claim with storage class:**  

    <br>
    
    Use this command to create the **Pod**: 


    ```bash
    oc create -f pod-powerstore.yaml
    ```

    Example: 
    ```yaml
    cat << 'EOF' > pod-powerstore.yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: pod-powerstore
      namespace: default
    spec:
      containers:
      - name: ubi
        image: registry.access.redhat.com/ubi9/ubi
        command: [ "bash", "-c" ]
        args: [ "while true; do touch /data/file-$(date +%s); sleep 20; done;" ]
        volumeMounts:
        - name: data
          mountPath: /data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: pvc-powerstore
    EOF
    ```

    Verify pod is created:

    ```terminal
    oc get pod -n default

    NAME                                        READY   STATUS    RESTARTS   AGE
    pod-powerstore                               1/1     Running   0          109s
    
    ``` 

<!--
### CSI Driver Installation
</br>

1. **Create project:**

   ```bash 
      oc new-project powerstore
   ```
   This command creates a project called `powerstore`. You can replace `powerstore` with any name you prefer.

2. **Create `config` file:** 
   
   a. Create a file called `config.yaml` or pick a [sample](https://github.com/dell/csi-powerstore/blob/main/samples/secret/secret.yaml) that has Powerstore array connection details: 

   ```yaml
   arrays:
    - endpoint: "https://11.0.0.1/api/rest"
        globalID: "unique"
        username: "user"
        password: "password"
        skipCertificateValidation: true
        blockProtocol: "FC"
   ```

      - **Update Parameters:** Replace placeholders with actual values for your PowerStore array.
      - **Add Blocks:** If you have multiple PowerStore arrays, add similar blocks for each one.
      - **Replication:** If replication is enabled, make sure the `config.yaml` includes all involved PowerStore arrays. 
    
  
  </br>
  </br>

   **User Privileges**

   The username in `config.yaml` must be from PowerStore’s authentication providers and have at least the **Storage Operator** role.

   b. After editing the file, **run this command to create a config** called `powerstore-config`.

   ```bash
    oc create secret generic powerstore-config --from-file=config=config.yaml -n powerstore --dry-run=client -oyaml > secret-config.yaml
   ```
      Use this command to **replace or update** the config:

   ```bash
     oc create secret generic powerstore-config -n powerstore --from-file=config=config.yaml -o yaml --dry-run=client | oc replace -f -
   ```

3. **Install Driver** 

   i. **Create a CR (Custom Resource)** for PowerStore using the sample files provided

   a. **Minimal Configuration:** 
   ```yaml
   apiVersion: storage.dell.com/v1
   kind: ContainerStorageModule
   metadata:
   name: powerstore
   namespace: powerstore
   spec:
   driver:
      csiDriverType: "powerstore"
      configVersion: v2.13.0
      forceRemoveDriver: true
   ```
     [sample file](https://github.com/dell/csm-operator/blob/main/samples/minimal-samples/powerstore_v2130.yaml) for default settings. Modify if needed.

    [OR]                                                

    b. **Detailed Configuration:**  [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerstore_v2130.yaml) for detailed settings.

  - Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerStore driver and their default values:
<ul>
{{< collapse id="1" title="Parameters">}}

  | Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be in pending state until new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
| namespace | Specifies namespace where the driver will be installed | Yes | "powerstore" |
| fsGroupPolicy | Defines which FS Group policy mode to be used. Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No |"ReadWriteOnceWithFSType"|
| storageCapacity | Enable/Disable storage capacity tracking feature | No | false |
| ***Common parameters for node and controller*** |
| X_CSI_POWERSTORE_NODE_NAME_PREFIX | Prefix to add to each node registered by the CSI driver | Yes | "csi-node"
| X_CSI_FC_PORTS_FILTER_FILE_PATH | To set path to the file which provides a list of WWPN which should be used by the driver for FC connection on this node | No | "/etc/fc-ports-filter" |
| ***Controller parameters*** |
| X_CSI_POWERSTORE_EXTERNAL_ACCESS | allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | empty |
| X_CSI_NFS_ACLS | Defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory. | No | "0777" |
| ***Node parameters*** |
| X_CSI_POWERSTORE_ENABLE_CHAP | Set to true if you want to enable iSCSI CHAP feature | No | false |
{{< /collapse >}}

   ii. **Create PowerStore custom resource**:

   ```bash
    oc create -f <input_sample_file.yaml>
   ```
   This command will deploy the CSI PowerStore driver in the namespace specified in the input YAML file.
</ul>

 4. **Verify the installation** as mentioned below
 
     * Check if ContainerStorageModule CR is created successfully using the command below:
         ```bash
         oc get csm/powerstore -n powerstore
         ```
     * Check the status of the CR to verify if the driver installation is in the `Succeed` state. If the status is not `Succeed`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.
 
    </br>
 
 5. **Create Storage Class** 
 
    ```yaml 
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: "powerstore-ext4"
    provisioner: "csi-powerstore.dellemc.com"
    parameters:
    csi.storage.k8s.io/fstype: "ext4"
    reclaimPolicy: Delete
    allowVolumeExpansion: true
    volumeBindingMode: Immediate
    ````   
   
    Refer [Storage Class](https://github.com/dell/csi-powerstore/tree/main/samples/storageclass) for different sample files. 

    **Run this command to create** a storage class

    ```bash
     oc create -f < storage-class.yaml >
    ```

 6. **Create Volume Snapshot Class** 
    ```yaml 
    apiVersion: snapshot.storage.k8s.io/v1
    kind: VolumeSnapshotClass
    metadata:
    name: powerstore-snapshot
    driver: "csi-powerstore.dellemc.com" 
    deletionPolicy: Delete
    ````
    Refer [Volume Snapshot Class](https://github.com/dell/csi-powerstore/tree/main/samples/volumesnapshotclass) for the sample files.

    **Run this command to create** a volume snapshot class
    ```bash
      oc create -f < volume-snapshot-class.yaml >
    ```
 
 **Note** :
   -  "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
   - Snapshotter and resizer sidecars are not optional. They are defaults with Driver installation.
--> 
{{< /accordion >}}   

<br>

{{< accordion id="Three" title="CSM Modules" >}}
{{< markdownify >}}
The driver and modules versions installable with the Container Storage Module Operator [Click Here](../../../../../supportmatrix/#operator-compatibility-matrix)
{{< /markdownify >}}

<br>   

{{< cardcontainer >}}

    {{< customcard link1="./csm-modules/resiliency"   image="1" title="Resiliency"  >}}

{{< /cardcontainer >}}
{{< /accordion >}}  