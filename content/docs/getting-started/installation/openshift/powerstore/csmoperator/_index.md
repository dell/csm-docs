---
title: Installation
linkTitle: Operator
description: >
  Installing the CSI Driver for PowerStore via Container Storage Module Operator 
no_list: true 
weight: 2
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}


{{< markdownify >}}
Supported driver and module versions offered by the Container Storage Module Operator [here](../../../../../supportmatrix/#operator-compatibility-matrix)
{{< /markdownify >}}

<br>
<br>

{{< accordion id="One" title="CSM Installation Wizard" >}}
  {{< include file="content/docs/getting-started/installation/installationwizard/operator.md" hideIds="1,2,3" >}}
{{< /accordion >}}

<br>

{{< accordion id="Two" title="CSI Driver" markdown="true" >}}  

</br>

### Operator Installation

</br>
 
1. On the OpenShift console, navigate to **OperatorHub** and use the keyword filter to search for **Dell Container Storage Modules.** 

2. Click **Dell Container Storage Modules** tile 

3. Keep all default settings and click **Install**.

</br>
<ol>

Verify that the operator is deployed 
```terminal 
oc get operators

NAME                                                          AGE
dell-csm-operator-certified.openshift-operators               2d21h
```  

```terminal
oc get pod -n openshift-operators

NAME                                                       READY   STATUS       RESTARTS      AGE
dell-csm-operator-controller-manager-86dcdc8c48-6dkxm      2/2     Running      21 (19h ago)  2d21h
``` 


</ol>
</br>


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
powerstore   3h            powerstore      v2.13.0         Succeeded      
```

Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.
</ul>


4. ##### **Create Storage class:** 
    
    <br>

    Use this command to create the **Storage Class**: 

    ```bash
    oc apply -f sc-powerstore.yaml
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
    
    <br>

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
    oc appky -f vsclass-powerstore.yaml
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



### Configurations
<br>


{{< collapse id="2" title="Persistent Volume Claim" card="false" >}} 
  
  <br> 
  <ol>
  <li>

  ##### **Create Persistent Volume Claim**

  <br>

  Use this command to create the **Persistent Volume Claim**:

  ```bash
  oc apply -f pvc-powerstore.yaml
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
  oc get pvc -n default

  NAME                           STATUS   VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
  pvc-powerstore                 Bound  ocp08-9f103c4fc6     8Gi        RWO            powerstore       <unset>               4s
  ``` 

  <br> 
  </li>
  
  <li>
  
  ##### **Create Pod which uses Persistent Volume Claim with storage class**

  <br>

  Use this command to create the **Pod**:


  ```bash
  oc apply -f pod-powerstore.yaml
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
  pod-powerstore                              1/1     Running   0          109s
  ``` 

  <br>  
  </li>
  <li>

  ##### **Delete Persistance Volume Claim**
  
  </br>

  Use this command to  **Delete Persistance Volume Claim**:

  ```bash
  oc delete pvc pvc-powerstore-restore -n default
  ```

  Verify restore pvc is deleted:

  ```terminal
  oc get pvc -n default

  NAME                    STATUS   VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
  pvc-powerstore          Bound    ocp08-095f7d3c52   8Gi        RWO            powerstore     <unset>                7m34s
  ```
  </br> 
  </li> 
</ol>

{{< /collapse >}}


{{< collapse id="4" title="Volume Snapshot" card="false" >}} 
<br> 

<ol> 
<li>

##### **Create Volume Snapshot**  

<br>

Use this command to create the **Volume Snapshot**:


```bash
oc apply -f vs-powerstore.yaml
```

Example:
```yaml
cat << 'EOF' > vs-powerstore.yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: vs-powerstore'
  namespace: default
spec:
  volumeSnapshotClassName: vsclass-powerstore
  source:
    persistentVolumeClaimName: pvc-powerstore
EOF
```

Verify Volume Snapshot is created:

```terminal
oc get volumesnapshot -n default

NAME           READYTOUSE   SOURCEPVC       SOURCESNAPSHOTCONTENT   RESTORESIZE   SNAPSHOTCLASS        SNAPSHOTCONTENT                                    CREATIONTIME   AGE
vs-powerstore  true         pvc-powerstore                          8Gi           vsclass-powerstore   snapcontent-80e99281-0d96-4275-b4aa-50301d110bd4   2m57s          12s
``` 

</br>

Verify Volume Snapshot content is created:

```terminal
oc get volumesnapshotcontent

NAME                                               READYTOUSE   RESTORESIZE   DELETIONPOLICY   DRIVER                       VOLUMESNAPSHOTCLASS     VOLUMESNAPSHOT   VOLUMESNAPSHOTNAMESPACE   AGE
snapcontent-80e99281-0d96-4275-b4aa-50301d110bd4   true         8589934592    Delete           csi-powerstore.dellemc.com   vsclass-powerstore      vs-powerstore      default                   23s
```  

<br>  
</li>
<li>

##### **Restore Snapshot** 

</br>

Use this command to  **Restore Snapshot**:

```bash
oc apply -f pvc-powerstore.yaml
```

Example:

```yaml
cat << 'EOF' > pvc-powerstore-restore.yaml  
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-powerstore-restore
  namespace: default
spec:
  storageClassName: powerstore
  dataSource:
    name: vs-powerstore
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 8Gi
  EOF
``` 

Verify restore pvc is created:

```terminal
oc get pvc -n default

NAME                    STATUS   VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
pvc-powerstore          Bound    ocp08-095f7d3c52   8Gi        RWO            powerstore     <unset>                 7m34s
pvc-powerstore-restore  Bound    ocp08-19874e9042   8Gi        RWO            powerstore     <unset>                 4s
```

<br> 
</li> 
<li>

##### **Delete Volume Snapshot**
</br>

Use this command to  **Delete Volume Snapshot**:

```bash
oc delete vs vs-powerstore -n default
```

Verify  Volume Snapshot is deleted:

```terminal
oc get vs -n default

NAME                    STATUS   VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
```

</li>
</ol>


{{< /collapse >}} 

{{< /accordion >}}   

<br>

{{< accordion id="Three" title="CSM Modules" >}}

<br>   

{{< cardcontainer >}}

    {{< customcard link1="./csm-modules/resiliency"   image="1" title="Resiliency"  >}}

{{< /cardcontainer >}}
{{< /accordion >}}  