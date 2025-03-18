---
title: "Installation"
linktitle: "Operator"
no_list: true
description: CSM Operator Installation
weight: 2
---

{{< markdownify >}}
Supported driver and module versions offered by the Container Storage Module Operator [here](../../../../../supportmatrix/#operator-compatibility-matrix)
{{< /markdownify >}}

<br>
<br>

{{< accordion id="Two" title="Driver" markdown="true" >}}  

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

    Use this command to create new project. You can use any project name instead of `unity`.

    ```bash 
    oc new-project unity
    ```

2. ##### **Create config secret:** 
    <br>

    Create a file called `config.yaml` or use [sample](https://github.com/dell/csi-unity/tree/main/samples/secret/secret.yaml): 
   
    Example: 
    <div style="margin-bottom: -1.8rem">

    ```yaml
    cat << EOF > config.yaml
     storageArrayList:
       - arrayId: "APM00******1"                 # unique array id of the Unisphere array
         username: "user"                        # username for connecting to API
         password: "password"                    # password for connecting to API
         endpoint: "https://10.1.1.1/"           # full URL path to the Unity XT API
         skipCertificateValidation: true         # indicates if client side validation of (management)server's certificate can be skipped
         isDefault: true                         # treat current array as a default (would be used by storage classes without arrayID parameter)
    EOF
    ``` 
    </div>

    Add blocks for each unity array in `config.yaml`, and include both source and target arrays if replication is enabled.
 
    <br>

    Edit the file, then run the command to create the `unity-config`.

    ```bash
    oc create secret generic unity-config --from-file=config=config.yaml -n unity --dry-run=client -oyaml > secret-unity-config.yaml
    ```
    
    Use this command to **create** the config:

    ```bash 
    oc apply -f secret-unity-config.yaml
    ```

    Use this command to **replace or update** the config:

    ```bash
    oc replace -f secret-unity-config.yaml --force
    ```
  
    Verify config secret is created.

    ```terminal
    oc get secret -n unity
     
    NAME                 TYPE        DATA   AGE
    unity-config         Opaque      1      3h7m
    ```  
  </br> 


3. ##### **Create Custom Resource** ContainerStorageModule for unity.
   
   <br>

    Use this command to create the **ContainerStorageModule Custom Resource**:

    ```bash
    oc create -f csm-unity.yaml
    ```

    Example:
    <div style="margin-bottom: -1.8rem">


    ```yaml
    cat << EOF > csm-unity.yaml
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
      name: unity
      namespace: unity
    spec:
      driver:
        csiDriverType: "unity"
        configVersion: {{< version-docs key="PUnity_latestVersion" >}}
        forceRemoveDriver: true
    EOF 
    ``` 
    </div>

    **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_unity_v2130.yaml) for detailed settings.

    To set the parameters in CR. The table shows the main settings of the unity driver and their defaults.
    

<ul>
{{< collapse id="1" title="Parameters">}}
| Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be in pending state until new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
| namespace | Specifies namespace where the driver will be installed | Yes | "unity" |
| fsGroupPolicy | Defines which FS Group policy mode to be used. Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No |"ReadWriteOnceWithFSType"|
| storageCapacity.enabled | Enable/Disable storage capacity tracking | No | true |
| storageCapacity.pollInterval | Configure how often the driver checks for changed capacity | No | 5m |
| ***Common parameters for node and controller*** |
| X_CSI_UNITY_ALLOW_MULTI_POD_ACCESS | To enable sharing of volumes across multiple pods within the same node in RWO access mode | No | false |
| X_CSI_UNITY_SYNC_NODEINFO_INTERVAL | Time interval to add node info to array. Default 15 minutes. Minimum value should be 1 | No | 15 |
| CSI_LOG_LEVEL | Sets the logging level of the driver | true | info |
| TENANT_NAME | Tenant name added while adding host entry to the array | No |  |
| CERT_SECRET_COUNT | Represents the number of certificate secrets, which the user is going to create for SSL authentication. (unity-cert-0..unity-cert-n). The minimum value should be 1. | false | 1 |
| X_CSI_UNITY_SKIP_CERTIFICATE_VALIDATION | Specifies if the driver is going to validate unisphere certs while connecting to the Unisphere REST API interface.If it is set to false, then a secret unity-certs has to be created with an X.509 certificate of CA which signed the Unisphere certificate | No | true |
| ***Controller parameters*** |
| X_CSI_HEALTH_MONITOR_ENABLED | Enable/Disable health monitor of CSI volumes from Controller plugin - volume condition | No | false |
| ***Node parameters*** |
| X_CSI_HEALTH_MONITOR_ENABLED | Enable/Disable health monitor of CSI volumes from Controller plugin - volume condition | No | false |
| X_CSI_ALLOWED_NETWORKS | Custom networks for Unity export. List of networks that can be used for NFS I/O traffic, CIDR format should be used "ip/prefix, ip/prefix" | No | empty |
{{< /collapse >}}
</ul>


<ul>
Check if ContainerStorageModule CR is created successfully:

```terminal
oc get csm unity -n unity

NAME        CREATIONTIME   CSIDRIVERTYPE   CONFIGVERSION       STATE
unity       3h             unity           {{< version-docs key="PUnity_latestVersion" >}}             Succeeded      
```

Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.
</ul>

<br>

4. ##### **Create Storage class:** 
    
    <br>

    Use this command to create the **Storage Class**: 

    ```bash
    oc apply -f sc-unity.yaml
    ```

    Example: 
    <div style="margin-bottom: -1.8rem">


    ```yaml
    cat << EOF > sc-unity.yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name:  unity-<ARRAY_ID>-iscsi
    provisioner: csi-unity.dellemc.com
    reclaimPolicy: Delete
    allowVolumeExpansion: true
    volumeBindingMode: Immediate
    parameters: 
      protocol: iSCSI 
      arrayId: <ARRAY_ID>
      storagepool: <STORAGE_POOL> 
      thinProvisioned: "true"
      tieringPolicy: <TIERING_POLICY>
      hostIOLimitName: <HOST_IO_LIMIT_NAME>
      csi.storage.k8s.io/fstype: ext4
    EOF
    ```
    </div> 
    
     Replace placeholders with actual values for your unity array and various storage class sample refer [here](https://github.com/dell/csi-unity/tree/main/samples/storageclass) 
      
    Verify Storage Class is created: 

    ```terminal
    oc get storageclass unity
  
    NAME                    PROVISIONER                    RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
    unity (default)         csi-unity.dellemc.com          Delete          Immediate           true                   3h8m
    ``` 

    </br>

6. ##### **Create Volume Snapshot Class:** 

    <br>
    
    Use this command to create the **Volume Snapshot**: 


    ```bash
    oc apply -f vsclass-unity.yaml
    ```

    Example:
    ```yaml
    cat << EOF > vsclass-unity.yaml
    apiVersion: snapshot.storage.k8s.io/v1
    kind: VolumeSnapshotClass
    metadata:
      name: vsclass-unity 
    driver: csi-unity.dellemc.com
    deletionPolicy: Delete
    EOF 
    ```

    Verify Volume Snapshot Class is created: 

    ```terminal
    oc get volumesnapshotclass
    
    NAME                      DRIVER                              DELETIONPOLICY   AGE
    vsclass-unity             csi-unity.dellemc.com               Delete           3h9m
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
  oc apply -f pvc-unity.yaml
  ```

  Example:
  ```yaml
  cat << EOF > pvc-unity.yaml
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: pvc-unity
    namespace: default
  spec:
    accessModes:
    - ReadWriteOnce
    resources:
      requests:
        storage: 8Gi
    storageClassName: unity
  EOF
  ```

  Verify Persistent Volume Claim is created:



  ```terminal
  oc get pvc -n default

  NAME                           STATUS   VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
  pvc-unity                      Bound    ocp08-9f103c4fc6   8Gi        RWO            unity          <unset>                 4s
  ``` 

  <br>
  </li>
  <li>
  
  ##### **Create Pod which uses Persistent Volume Claim with storage class**

  <br>

  Use this command to create the **Pod**:


  ```bash
  oc apply -f pod-unity.yaml
  ```

  Example: 
  ```yaml
  cat << 'EOF' > pod-unity.yaml
  apiVersion: v1
  kind: Pod
  metadata:
    name: pod-unity
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
        claimName: pvc-unity
  EOF
  ```

  Verify pod is created:

  ```terminal
  oc get pod -n default

  NAME                                        READY   STATUS    RESTARTS   AGE
  pod-unity                                   1/1     Running   0          109s
  ``` 

  <br> 
  </li>
  <li>

  ##### **Delete Persistence Volume Claim**
  
  </br>

  Use this command to  **Delete Persistence Volume Claim**:

  ```bash
  oc delete pvc pvc-unity -n default
  ```

  Verify restore pvc is deleted:

  ```terminal
  oc get pvc -n default

  NAME                 STATUS      VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
  pvc-unity            Bound       ocp08-095f7d3c52   8Gi        RWO            unity          <unset>                 7m34s
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
oc apply -f vs-unity.yaml
```

Example:
```yaml
cat << 'EOF' > vs-unity.yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: vs-unity'
  namespace: default
spec:
  volumeSnapshotClassName: vsclass-unity
  source:
    persistentVolumeClaimName: pvc-unity
EOF
```

Verify Volume Snapshot is created:

```terminal
oc get volumesnapshot -n default

NAME           READYTOUSE   SOURCEPVC       SOURCESNAPSHOTCONTENT   RESTORESIZE   SNAPSHOTCLASS      SNAPSHOTCONTENT                                    CREATIONTIME   AGE
vs-unity       true         pvc-unity                               8Gi           vsclass-unity      snapcontent-80e99281-0d96-4275-b4aa-50301d110bd4   2m57s          12s
``` 

</br>

Verify Volume Snapshot content is created:

```terminal
oc get volumesnapshotcontent

NAME                                               READYTOUSE   RESTORESIZE   DELETIONPOLICY   DRIVER                     VOLUMESNAPSHOTCLASS   VOLUMESNAPSHOT   VOLUMESNAPSHOTNAMESPACE   AGE
snapcontent-80e99281-0d96-4275-b4aa-50301d110bd4   true         8589934592    Delete           csi-unity.dellemc.com      vsclass-unity         vs-unity         default                   23s
```  

<br> 
</li>
<li>

##### **Restore Snapshot** 

</br>

Use this command to  **Restore Snapshot**:

```bash
oc apply -f pvc-unity-restore.yaml
```

Example:

```yaml
cat << 'EOF' > pvc-unity-restore.yaml  
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-unity-restore
  namespace: default
spec:
  storageClassName: unity
  dataSource:
    name: vs-unity
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
pvc-unity            Bound    ocp08-095f7d3c52   8Gi        RWO            unity      <unset>                 7m34s
pvc-unity-restore    Bound    ocp08-19874e9042   8Gi        RWO            unity      <unset>                 4s
```
<br>
</li>
<li>

##### **Delete Volume Snapshot**
</br>

Use this command to  **Delete Volume Snapshot**:

```bash
oc delete vs vs-unity -n default
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