
---
title: "Installation Guide"
linktitle: "Operator"
no_list: true
description: CSM Operator Installation
weight: 2
---

1. Set up an OpenShift cluster following the official documentation.
2. Proceed to the Prerequisite
3. Complete the base installation.
4. Proceed with module installation.

<br>


{{< accordion id="Zero" title="Prerequisite" markdown="true">}} 

<br>

1. **Make sure the nfs is enabled in the powerscale**

    ```terminal
    ps01-1# isi nfs settings global view
    NFS Service Enabled: Yes
        NFSv3 Enabled: Yes
        NFSv4 Enabled: Yes
                v4.0 Enabled: Yes
                v4.1 Enabled: Yes
                v4.2 Enabled: Yes
    NFS RDMA Enabled: No
        Rquota Enabled: No   

    ``` 
    <br>

2. **Create Group and User for CSM**  

    ```bash
    isi auth group create csmadmins --zone system
    isi auth user create csmadmin --password "P@ssw0rd123" --password-expires false --primary-group csmadmins --zone system
    ``` 

3. **Create role and assign the required permission** 

    ```bash
    isi auth roles create CSMAdminRole --description "Dell CSM Admin Role"  --zone System
    isi auth roles modify CSMAdminRole --zone System --add-priv-read ISI_PRIV_LOGIN_PAPI --add-priv-read ISI_PRIV_IFS_RESTORE --add-priv-read ISI_PRIV_NS_IFS_ACCESS  --add-priv-read ISI_PRIV_IFS_BACKUP --add-priv-read ISI_PRIV_AUTH --add-priv-read ISI_PRIV_AUTH_ZONES --add-priv-read  ISI_PRIV_STATISTICS
    isi auth roles modify CSMAdminRole --zone System --add-priv-write ISI_PRIV_NFS --add-priv-write ISI_PRIV_QUOTA --add-priv-write ISI_PRIV_SNAPSHOT --add-priv-write ISI_PRIV_SYNCIQ
    isi auth roles modify CSMAdminRole --add-group csmadmins

    ```

4. **Get PowerScale Array Details** 

   a. Cluster Name: 
   
      ``` 
      ps01-1# isi cluster identity view
      Description: 
          MOTD: 
      MOTD Header: 
          Name: ps01 
      ``` 

   b. Access Zone Name:

      ```
      ps01-1# isi zone zones list
      Name      Path               
      -----------------------------
      System    /ifs               
      ps01-az01 /ifs/data/ps01/az01
      -----------------------------
      Total: 2 
      ```

   c. Smart Connect Zone name  

      ```
      ps01-1# isi network pools list
      ID                                SC Zone               IP Ranges                   Allocation Method 
      ------------------------------------------------------------------------------------------------------
      groupnet0.subnet0.ps01-az01-pool0 ps01-az01.example.com 10.181.98.225-10.181.98.227 static            
      groupnet0.subnet0.system-pool0    ps01.example.com      10.181.98.222-10.181.98.224 static            
      ------------------------------------------------------------------------------------------------------
      Total: 2  
      ```

<br> 

5. **Create the base directory for the storage class** 
    
   ```bash 
   mkdir /ifs/data/ps01/az01/csi
   chown csmadmin:csmadmins /ifs/data/ps01/az01/csi
   chmod 755 /ifs/data/ps01/az01/csi

   ```
<br> 

6. Make sure all the parent directory of the base path has permission 755 

<br>

7. **(optional) Create quota on the base directory** 

   ```bash 
   isi quota quotas create /ifs/data/ps01/az01/csi directory --percent-advisory-threshold 80 --percent-soft-threshold 90 --soft-grace 1D --hard-threshold 100G --include-snapshots true
   ``` 

{{< /accordion >}}




<br>

{{< accordion id="Two" title="Base Install" markdown="true" >}}   

</br>

#### Operator Installation

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

    Use this command to create new project. You can use any project name instead of `isilon`.

    ```bash 
    oc new-project isilon
    ```
<br>

2. ##### **Create config secret:** 

    <br>   
    
    Create a file called `config.yaml` or use [sample](https://github.com/dell/csi-powerscale/blob/main/samples/secret/secret.yaml): 
   
    Example: 
    <div style="margin-bottom: -1.8rem">


    ```yaml
    cat << EOF > config.yaml
    isilonClusters:
    - clusterName: "ps01"
      username: "csmadmin"
      password: "P@ssw0rd123"
      endpoint: "ps01.example.com"
      skipCertificateValidation: true
    EOF
    ```
   </div>

    Add blocks for each Powerscale array in `config.yaml`, and include both source and target arrays if replication is enabled.
 
    <br>

    Edit the file, then run the command to create the `isilon-config`.

    ```bash
    oc create secret generic isilon-config --from-file=config=config.yaml -n isilon --dry-run=client -oyaml > secret-isilon-config.yaml
    ```
    
    Use this command to **create** the config:

    ```bash 
    oc apply -f secret-isilon-config.yaml
    ```

    Use this command to **replace or update** the config:

    ```bash
    oc replace -f secret-isilon-config.yaml --force
    ```
  
    Verify config secret is created.

    ```terminal
    oc get secret -n isilon
     
    NAME                 TYPE        DATA   AGE
    isilon-config        Opaque      1      3h7m
    ```  
  </br>

3. ##### **Create isilon-certs-n secret.**
      <br>

      If certificate validation is skipped, empty secret must be created. To create an empty secret. Ex: secret-isilon-certs.yaml
     
      ```yaml 
      cat << EOF > secret-isilon-certs.yaml
      apiVersion: v1
      kind: Secret
      metadata:
         name: isilon-certs-0
         namespace: isilon
      type: Opaque
      data:
         cert-0: "" 
      EOF
      ```

      ```bash
       oc create -f secret-isilon-certs.yaml
      ```
<br>

4. ##### **Create Custom Resource** ContainerStorageModule for PowerScale.
   
   <br>

    Use this command to create the **ContainerStorageModule Custom Resource**:

    ```bash
    oc create -f csm-isilon.yaml
    ```

    Example:
    <div style="margin-bottom: -1.8rem">


    ```yaml
    cat << EOF > csm-isilon.yaml
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
      name: isilon
      namespace: isilon
    spec:
      driver:
        csiDriverType: "isilon"
        configVersion: {{< version-v1 key="PScale_latestVersion" >}}
        authSecret: isilon-config
        common:
          envs:
            - name: X_CSI_ISI_AUTH_TYPE
              value: "1"
     EOF 
     ``` 
    </div> 

    **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerscale_{{< version-v1 key="sample_sc_pscale" >}}.yaml) for detailed settings or use [Wizard](./installationwizard#generate-manifest-file) to generate the sample file..

    <br>

    To set the parameters in CR. The table shows the main settings of the Powerscale driver and their defaults.

<ul>
{{< collapse id="1" title="Parameters">}}
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   |<div style="text-align: left"> namespace |<div style="text-align: left"> Specifies namespace where the driver will be installed | Yes | "isilon" |
   |<div style="text-align: left"> replicas |<div style="text-align: left"> Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be in pending state until new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
   |<div style="text-align: left"> dnsPolicy |<div style="text-align: left"> Determines the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
   |<div style="text-align: left"> fsGroupPolicy |<div style="text-align: left"> Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No | "ReadWriteOnceWithFSType" |
   |<div style="text-align: left"> storageCapacity |<div style="text-align: left"> Enable/Disable storage capacity tracking feature | No | false |
   |<div style="text-align: left"> ***Common parameters for node and controller*** |
   |<div style="text-align: left"> CSI_ENDPOINT |<div style="text-align: left"> The UNIX socket address for handling gRPC calls | No | /var/run/csi/csi.sock |
   |<div style="text-align: left"> X_CSI_ISI_SKIP_CERTIFICATE_VALIDATION |<div style="text-align: left"> Specifies whether SSL security needs to be enabled for communication between PowerScale and CSI Driver | No | true |
   |<div style="text-align: left"> X_CSI_ISI_PATH |<div style="text-align: left"> Base path for the volumes to be created | Yes | |
   |<div style="text-align: left"> X_CSI_ALLOWED_NETWORKS |<div style="text-align: left"> Custom networks for PowerScale export. List of networks that can be used for NFS I/O traffic, CIDR format should be used | No | empty |
   |<div style="text-align: left"> X_CSI_ISI_AUTOPROBE |<div style="text-align: left"> To enable auto probing for driver | No | true |
   |<div style="text-align: left"> X_CSI_ISI_NO_PROBE_ON_START |<div style="text-align: left"> Indicates whether the controller/node should probe during initialization | Yes | |
   |<div style="text-align: left"> X_CSI_ISI_VOLUME_PATH_PERMISSIONS |<div style="text-align: left"> The permissions for isi volume directory path | Yes | 0777 |
   |<div style="text-align: left"> X_CSI_ISI_AUTH_TYPE |<div style="text-align: left"> Indicates the authentication method to be used. If set to 1 then it follows as session-based authentication else basic authentication. If CSM Authorization is enabled, this value must be set to 1. | No | 0 |
   |<div style="text-align: left"> ***Controller parameters*** |
   |<div style="text-align: left"> X_CSI_MODE   |<div style="text-align: left"> Driver starting mode  | No | controller |
   |<div style="text-align: left"> X_CSI_ISI_ACCESS_ZONE |<div style="text-align: left"> Name of the access zone a volume can be created in | No | System |
   |<div style="text-align: left"> X_CSI_ISI_QUOTA_ENABLED |<div style="text-align: left"> To enable SmartQuotas | Yes | |
   |<div style="text-align: left"> X_CSI_VOL_PREFIX |<div style="text-align: left"> The X_CSI_VOL_PREFIX will be used by provisioner sidecar as a prefix for all the volumes created | Yes | csivol |
   |<div style="text-align: left"> ***Node parameters*** |
   |<div style="text-align: left"> X_CSI_MAX_VOLUMES_PER_NODE |<div style="text-align: left"> Specify the default value for the maximum number of volumes that the controller can publish to the node | Yes | 0 |
   |<div style="text-align: left"> X_CSI_MODE   |<div style="text-align: left"> Driver starting mode  | No | node |
   |<div style="text-align: left"> ***Sidecar parameters*** |
   |<div style="text-align: left"> monitor-interval |<div style="text-align: left"> The monitor-interval will be used by external-health-monitor as an interval for health checks  | Yes | 60s |
{{< /collapse >}}
</ul>

<ul>
Check if ContainerStorageModule CR is created successfully:

```terminal
oc get csm isilon -n isilon

NAME        CREATIONTIME   CSIDRIVERTYPE   CONFIGVERSION    STATE
isilon      3h             isilon          {{< version-v1 key="PScale_latestVersion" >}}          Succeeded      
```

</ul>

<br>

4. ##### **Create Storage class:** 
    
    <br>

    Use this command to create the **Storage Class**: 

    ```bash
    oc apply -f sc-isilon.yaml
    ```

    Example: 
    ```yaml
    cat << EOF > sc-isilon.yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
       name: isilon
    provisioner: csi-isilon.dellemc.com
    reclaimPolicy: Delete
    allowVolumeExpansion: true
    IsiVolumePathPermissions: "0775"
    mountOptions: ["vers=4"]
    parameters:  
       ClusterName: ps01
       AccessZone: ps01-az01  
       AzServiceIP: ps01-az01.example.com 
       IsiPath: /ifs/data/ps01/az01/csi 
       RootClientEnabled: "false" 
       csi.storage.k8s.io/fstype: "nfs" 
    volumeBindingMode: Immediate
    EOF
    ```
     Replace placeholders with actual values for your powerscale array and various storage class sample refer [here](https://github.com/dell/csi-powerscale/tree/main/samples/storageclass) 

    <br>

    Verify Storage Class is created: 

    ```terminal
    oc get storageclass isilon
  
    NAME                    PROVISIONER                    RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION    AGE
    isilon (default)        csi-isilon.dellemc.com         Delete          Immediate           true                    3h8m
    ``` 

    </br>

6. ##### **Create Volume Snapshot Class:** 

    <br>
    
    Use this command to create the **Volume Snapshot**: 


    ```bash
    oc apply -f vsclass-isilon.yaml
    ```

    Example:
    ```yaml
    cat << EOF > vsclass-isilon.yaml
    apiVersion: snapshot.storage.k8s.io/v1
    kind: VolumeSnapshotClass
    metadata:
       name: vsclass-isilon
    driver: csi-isilon.dellemc.com
    deletionPolicy: Delete
    parameters:
       IsiPath: /ifs/data/ps01/az01/csi
    EOF 
    ```

    Verify Volume Snapshot Class is created: 

    ```terminal
    oc get volumesnapshot
    
    NAME                      DRIVER                              DELETIONPOLICY   AGE
    vsclass-isilon            csi-isilon.dellemc.com              Delete           3h9m
    ``` 
   </br>

### Configurations
<br>


{{< collapse id="2" title="Persistent Volume Claim" card="false" >}} 
<ol>  

  <br> 
<li>  

##### **Create Persistent Volume Claim**

  <br>

  Use this command to create the **Persistent Volume Claim**:

  ```bash
  oc apply -f pvc-isilon.yaml
  ```

  Example:
  ```yaml
  cat << EOF > pvc-isilon.yaml
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: pvc-isilon
    namespace: default
  spec:
    accessModes:
    - ReadWriteOnce
    resources:
      requests:
        storage: 8Gi
    storageClassName: isilon
  EOF
  ```

  Verify Persistent Volume Claim is created:



  ```terminal
  oc get pvc -n default

  NAME                           STATUS   VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
  pvc-isilon                     Bound    ocp08-9f103c4fc6   8Gi        RWO            isilon         <unset>                 4s
  ``` 

  <br> 
</li>

<li>

  ##### **Create Pod which uses Persistent Volume Claim with storage class**

  <br>

  Use this command to create the **Pod**:


  ```bash
  oc apply -f pod-isilon.yaml
  ```

  Example: 
  ```yaml
  cat << 'EOF' > pod-isilon.yaml
  apiVersion: v1
  kind: Pod
  metadata:
    name: pod-isilon
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
        claimName: pvc-isilon
  EOF
  ```

  Verify pod is created:

  ```terminal
  oc get pod -n default

  NAME                                        READY   STATUS    RESTARTS   AGE
  pod-isilon                                  1/1     Running   0          109s
  ``` 

  <br> 
</li>
<li>

  ##### **Delete Persistence Volume Claim**
  
  </br>

  Use this command to  **Delete Persistence Volume Claim**:

  ```bash
  oc delete pvc pvc-isilon -n default
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
oc apply -f vs-isilon.yaml
```

Example:
```yaml
cat << 'EOF' > vs-isilon.yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: vs-isilon'
  namespace: default
spec:
  volumeSnapshotClassName: vsclass-isilon
  source:
    persistentVolumeClaimName: pvc-isilon
EOF
```

Verify Volume Snapshot is created:

```terminal
oc get volumesnapshot -n default

NAME           READYTOUSE   SOURCEPVC       SOURCESNAPSHOTCONTENT   RESTORESIZE   SNAPSHOTCLASS      SNAPSHOTCONTENT                                    CREATIONTIME   AGE
vs-isilon      true         pvc-isilon                              8Gi           vsclass-isilon     snapcontent-80e99281-0d96-4275-b4aa-50301d110bd4   2m57s          12s
``` 

</br>

Verify Volume Snapshot content is created:

```terminal
oc get volumesnapshotcontent

NAME                                               READYTOUSE   RESTORESIZE   DELETIONPOLICY   DRIVER                     VOLUMESNAPSHOTCLASS   VOLUMESNAPSHOT   VOLUMESNAPSHOTNAMESPACE   AGE
snapcontent-80e99281-0d96-4275-b4aa-50301d110bd4   true         8589934592    Delete           csi-isilon.dellemc.com     vsclass-isilon        vs-isilon        default                   23s
```  
</li>
<br> 

<li>

##### **Restore Snapshot** 

</br>

Use this command to  **Restore Snapshot**:

```bash
oc apply -f pvc-isilon-restore.yaml
```

Example:

```yaml
cat << 'EOF' > pvc-isilon-restore.yaml  
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-isilon-restore
  namespace: default
spec:
  storageClassName: isilon
  dataSource:
    name: vs-isilon
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
pvc-isilon              Bound    ocp08-095f7d3c52   8Gi        RWO            isilon         <unset>                 7m34s
pvc-isilon-restore      Bound    ocp08-19874e9042   8Gi        RWO            isilon         <unset>                 4s
``` 
</br> 
</li>
<li>

##### **Delete Volume Snapshot**
</br>

Use this command to  **Delete Volume Snapshot**:

```bash
oc delete vs vs-isilon -n default
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
{{< accordion id="Three" title="Modules" >}}

<br>   

{{< cardcontainer >}}
    {{< customcard link1="./csm-modules/authorizationv1-x"  image="1" title="Authorization v1.x" >}}

    {{< customcard link1="./csm-modules/authorizationv2-0"   image="1" title="Authorization v2.0"  >}}

    {{< customcard  link1="./csm-modules/observability"   image="1" title="Observability"  >}}

    {{< customcard  link1="./csm-modules/replication"  image="1" title="Replication"  >}} 

    {{< customcard link1="./csm-modules/resiliency"   image="1" title="Resiliency"  >}}

{{< /cardcontainer >}}
{{< /accordion >}}  
