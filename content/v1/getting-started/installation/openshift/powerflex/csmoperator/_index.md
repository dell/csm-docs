---
title: "Installation Guide"
linktitle: "Operator"
no_list: true
description: CSM Operator Installation
weight: 2
---

1. Set up an OpenShift cluster following the official documentation.
2. Complete the base installation.
3. Proceed with module installation.
<br>

{{< accordion id="Two" title="Base Install" markdown="true" >}}

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

    Use this command to create new project. You can use any project name instead of `vxflexos`.

    ```bash 
    oc new-project vxflexos
    ```

2. ##### **Create config secret:** 
      <br>

    Create a file called `config.yaml` or use [sample](https://github.com/dell/csi-powerflex/blob/main/samples/secret.yaml): 
    
    
    Example: 
    <div style="margin-bottom:-1.8rem">

    ```yaml
    cat << EOF > config.yaml
    - username: "admin"
      password: "password"
      systemID: "2b11bb111111bb1b"
      endpoint: "https://127.0.0.2"
      skipCertificateValidation: true
      mdm: "10.0.0.3,10.0.0.4"
    EOF
    ```
    </div>
    
    Add blocks for each Powerflex array in `config.yaml`, and include both source and target arrays if replication is enabled.
 
    <br>

    Edit the file, then run the command to create the `vxflexos-config`.

    ```bash
    oc create secret generic vxflexos-config --from-file=config=config.yaml -n vxflexos --dry-run=client -oyaml > secret-vxflexos-config.yaml
    ```
    
    Use this command to **create** the config:

    ```bash 
    oc apply -f secret-vxflexos-config.yaml
    ```

    Use this command to **replace or update** the config:

    ```bash
    oc replace -f secret-vxflexos-config.yaml --force
    ```
  
    Verify config secret is created.

    ```terminal
    oc get secret -n vxflexos
     
    NAME                 TYPE        DATA   AGE
    vxflexos-config      Opaque      1      3h7m
    ```  
  </br>

3. ##### **Create Custom Resource** ContainerStorageModule for powerflex.
   
   <br>

    Use this command to create the **ContainerStorageModule Custom Resource**:

    ```bash
    oc create -f csm-vxflexos.yaml
    ```

    Example:
    <div style="margin-bottom:-1.8rem">

    ```yaml
    cat << EOF > csm-vxflexos.yaml
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
      name: vxflexos
      namespace: vxflexos
    spec:
      driver:
        csiDriverType: "powerflex"
        configVersion: {{< version-v1 key="PFlex_latestVersion" >}}
    EOF 
    ``` 
    </div>
    
    **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/tree/release/v1.9.1/samples/storage_csm_powerflex_{{< version-v1 key="Det_sample_operator_pflex" >}}.yaml) for detailed settings.
   
   </br>
    To set the parameters in CR. The table shows the main settings of the PowerFlex driver and their defaults.
  <ul>
{{< collapse id="1" title="Parameters">}}
| Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
|<div style="text-align: left"> dnsPolicy |<div style="text-align: left"> Determines the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
|<div style="text-align: left"> fsGroupPolicy |<div style="text-align: left"> Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No | "ReadWriteOnceWithFSType" |
|<div style="text-align: left"> replicas |<div style="text-align: left"> Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, excess pods will become stay in a pending state. Defaults are 2 which allows for Controller high availability. | Yes | 2 |
|<div style="text-align: left"> storageCapacity.enabled |<div style="text-align: left"> Enable/Disable storage capacity tracking | No | true |
|<div style="text-align: left"> storageCapacity.pollInterval |<div style="text-align: left"> Configure how often the driver checks for changed capacity | No | 5m |
|<div style="text-align: left"> enableQuota |<div style="text-align: left"> a boolean that, when enabled, will set quota limit for a newly provisioned NFS volume | No | none |
|<div style="text-align: left"> maxVxflexosVolumesPerNode |<div style="text-align: left"> Specify default value for maximum number of volumes that controller can publish to the node.If value is zero CO SHALL decide how many volumes of this type can be published by the controller to the node | Yes | 0 |
|<div style="text-align: left"> ***Common parameters for node and controller*** |
|<div style="text-align: left"> X_CSI_VXFLEXOS_ENABLELISTVOLUMESNAPSHOT |<div style="text-align: left"> Enable list volume operation to include snapshots (since creating a volume from a snap actually results in a new snap) | No | false |
|<div style="text-align: left"> X_CSI_VXFLEXOS_ENABLESNAPSHOTCGDELETE |<div style="text-align: left"> Enable this to automatically delete all snapshots in a consistency group when a snap in the group is deleted | No | false |
|<div style="text-align: left"> X_CSI_ALLOW_RWO_MULTI_POD_ACCESS |<div style="text-align: left"> Setting allowRWOMultiPodAccess to "true" will allow multiple pods on the same node to access the same RWO volume. This behavior conflicts with the CSI specification version 1.3. NodePublishVolume description that requires an error to be returned in this case. However, some other CSI drivers support this behavior and some customers desire this behavior. Customers use this option at their own risk. | No | false |
|<div style="text-align: left"> INTERFACE_NAMES |<div style="text-align: left"> A mapping of node names to interface names. Only necessary when SDC is disabled. | No | none |
|<div style="text-align: left"> ***Controller parameters*** |
|<div style="text-align: left"> X_CSI_POWERFLEX_EXTERNAL_ACCESS |<div style="text-align: left"> allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | empty |
|<div style="text-align: left"> X_CSI_HEALTH_MONITOR_ENABLED |<div style="text-align: left"> Enable/Disable health monitor of CSI volumes from Controller plugin - volume condition | No | false |
|<div style="text-align: left"> ***Node parameters*** |
|<div style="text-align: left"> X_CSI_RENAME_SDC_ENABLED |<div style="text-align: left"> Enable this to rename the SDC with the given prefix. The new name will be ("prefix" + "worker_node_hostname") and it should not exceed 31 chars. | Yes | false |
|<div style="text-align: left"> X_CSI_APPROVE_SDC_ENABLED |<div style="text-align: left"> Enable this to to approve restricted SDC by GUID during setup | Yes | false |
|<div style="text-align: left"> X_CSI_HEALTH_MONITOR_ENABLED |<div style="text-align: left"> Enable/Disable health monitor of CSI volumes from Node plugin - volume condition | No | false |
|<div style="text-align: left"> X_CSI_SDC_ENABLED |<div style="text-align: left"> Enable/Disable installation of the SDC. | Yes | true |
|<div style="text-align: left"> X_CSI_SDC_SFTP_REPO_ENABLED |<div style="text-align: left"> A boolean that enables/disables the SFTP repository settings for SDC. | No | false |
|<div style="text-align: left"> X_CSI_SFTP_REPO_ADDRESS  |<div style="text-align: left"> Specifies the address of the Dell SFTP/private repository to look up for SDC kernel files. | No | "sftp://0.0.0.0" |
|<div style="text-align: left"> X_CSI_SFTP_REPO_USER  |<div style="text-align: left"> Specifies the username to authenticate to the SFTP repository. | No | "sdcSFTPRepoUser" |
{{< /collapse >}}
</ul>

<ul>
Check if ContainerStorageModule CR is created successfully:

```terminal
oc get csm vxflexos -n vxflexos

NAME        CREATIONTIME   CSIDRIVERTYPE   CONFIGVERSION                                           STATE
vxflexos    3h             powerflex       {{< version-v1 key="PFlex_latestVersion" >}}         Succeeded
```

Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.

</ul>

<br> 

4. ##### **Create Storage class:**
    
    <br>

    Use this command to create the **Storage Class**:

    ```bash
    oc apply -f sc-vxflexos.yaml
    ```

    Example: 
    <div style="margin-bottom:-1.8rem">
    
    ```yaml
    cat << EOF > sc-vxflexos.yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: vxflexos
      annotations:
        storageclass.kubernetes.io/is-default-class: "true"
    provisioner: csi-vxflexos.dellemc.com
    reclaimPolicy: Delete
    allowVolumeExpansion: true
    parameters:
      storagepool: <STORAGE_POOL>
      systemID: <SYSTEM_ID>
      csi.storage.k8s.io/fstype: ext4
    volumeBindingMode: Immediate
    EOF
    ```
    </div>

     Replace placeholders with actual values for your powerflex array and various storage class sample refer [here](https://github.com/dell/csi-powerflex/tree/main/samples/storageclass)

    </br>

    Verify Storage Class is created:

    ```terminal
    oc get storageclass vxflexos
  
    NAME                    PROVISIONER                    RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
    vxflexos (default)      csi-vxflexos.dellemc.com       Delete          Immediate           true                   3h8m
    ``` 

    </br>

5. ##### **Create Volume Snapshot Class:**

    <br>
    
    Use this command to create the **Volume Snapshot Class**:


    ```bash
    oc apply -f vsclass-vxflexos.yaml
    ```

    Example:
    ```yaml
    cat << EOF > vsclass-vxflexos.yaml
    apiVersion: snapshot.storage.k8s.io/v1
    kind: VolumeSnapshotClass
    metadata:
      name: vsclass-vxflexos
    driver: csi-vxflexos.dellemc.com
    deletionPolicy: Delete
    EOF 
    ```

    Verify Volume Snapshot Class is created:

    ```terminal
    oc get volumesnapshotclass

    NAME                 DRIVER                     DELETIONPOLICY   AGE
    vsclass-vxflexos     csi-vxflexos.dellemc.com   Delete           3h9m
    ``` 
   </br>

### Configurations
<br>


{{< collapse id="2" title="Persistent Volume Claim " card="false" >}} 
  
  <br> 
  <ol> 
  <li> 

  ##### **Create Persistent Volume Claim**

  <br>
  Use this command to create the **Persistent Volume Claim**:

  ```bash
  oc apply -f pvc-vxflexos.yaml
  ```

  Example:
  ```yaml
  cat << EOF > pvc-vxflexos.yaml
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: pvc-vxflexos
    namespace: default
  spec:
    accessModes:
    - ReadWriteOnce
    resources:
      requests:
        storage: 8Gi
    storageClassName: vxflexos
  EOF
  ```

  Verify Persistent Volume Claim is created:


  ```terminal
  oc get pvc -n default

  NAME                           STATUS   VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
  pvc-vxflexos                   Bound    ocp08-9f103c4fc6   8Gi        RWO            vxflexos       <unset>                 4s
  ``` 
  <br> 
  </li>
  <li>

  ##### **Create Pod which uses Persistent Volume Claim with storage class**

  <br>
  
  Use this command to create the **Pod**:


  ```bash
  oc apply -f pod-vxflexos.yaml
  ```

  Example: 
  ```yaml
  cat << 'EOF' > pod-vxflexos.yaml
  apiVersion: v1
  kind: Pod
  metadata:
    name: pod-vxflexos
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
        claimName: pvc-vxflexos
  EOF
  ```

  Verify pod is created:

  ```terminal
  oc get pod -n default

  NAME                                        READY   STATUS    RESTARTS   AGE
  pod-vxflexos                                1/1     Running   0          109s
  ``` 
  <br> 
  </li>
  <li>

  ##### **Delete Persistence Volume Claim**
  
  </br>

  Use this command to  **Delete Persistence Volume Claim**:

  ```bash
  oc delete pvc pvc-vxflexos -n default
  ```

  Verify restore pvc is deleted:

  ```terminal
  oc get pvc -n default

  NAME                    STATUS   VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE

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
oc apply -f vs-vxflexos.yaml
```

Example:
```yaml
cat << 'EOF' > vs-vxflexos.yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: vs-vxflexos
  namespace: default
spec:
  volumeSnapshotClassName: vsclass-vxflexos
  source:
    persistentVolumeClaimName: pvc-vxflexos
EOF
```

Verify Volume Snapshot is created:

```terminal
oc get volumesnapshot -n default

NAME           READYTOUSE   SOURCEPVC       SOURCESNAPSHOTCONTENT   RESTORESIZE   SNAPSHOTCLASS      SNAPSHOTCONTENT                                    CREATIONTIME   AGE
vs-vxflexos    true         pvc-vxflexos                            8Gi           vsclass-vxflexos   snapcontent-80e99281-0d96-4275-b4aa-50301d110bd4   2m57s          12s
``` 

</br>

Verify Volume Snapshot content is created:

```terminal
oc get volumesnapshotcontent

NAME                                               READYTOUSE   RESTORESIZE   DELETIONPOLICY   DRIVER                     VOLUMESNAPSHOTCLASS   VOLUMESNAPSHOT   VOLUMESNAPSHOTNAMESPACE   AGE
snapcontent-80e99281-0d96-4275-b4aa-50301d110bd4   true         8589934592    Delete           csi-vxflexos.dellemc.com   vsclass-vxflexos      vs-vxflexos      default                   23s
```  
<br> 
</li>
<li>

##### **Restore Snapshot** 

</br>

Use this command to  **Restore Snapshot**:

```bash
oc apply -f pvc-vxflexos-restore.yaml
```

Example:

```yaml
cat << 'EOF' > pvc-vxflexos-restore.yaml  
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-vxflexos-restore
  namespace: default
spec:
  storageClassName: vxflexos
  dataSource:
    name: vs-vxflexos
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
pvc-vxflexos            Bound    ocp08-095f7d3c52   8Gi        RWO            vxflexos      <unset>                 7m34s
pvc-vxflexos-restore    Bound    ocp08-19874e9042   8Gi        RWO            vxflexos      <unset>                 4s
```
</br> 
</li>
<li>

##### **Delete Volume Snapshot**
</br>

Use this command to  **Delete Volume Snapshot**:

```bash
oc delete vs vs-vxflexos -n default
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

{{< accordion id="Three" title="Modules">}}

{{< cardcontainer >}}
    {{< customcard link1="./csm-modules/authorizationv1-x"  image="6" title="Authorization v1.x" >}}

    {{< customcard link1="./csm-modules/authorizationv2-0"   image="6" title="Authorization v2.0"  >}}

    {{< customcard  link1="./csm-modules/observability"   image="6" title="Observability"  >}}

    {{< customcard  link1="./csm-modules/replication"  image="6" title="Replication"  >}} 

    {{< customcard link1="./csm-modules/resiliency"   image="6" title="Resiliency"  >}}

{{< /cardcontainer >}}


{{< /accordion >}} 
