
---
title: "Installation"
linktitle: "Operator"
no_list: true
description: CSM Operator Installation
weight: 2
---

{{< markdownify >}}
Supported driver and module versions offered by the Container Storage Modules Operator [here](../../../../../supportmatrix/#operator-compatibility-matrix)
{{< /markdownify >}}

<br>
<br>


{{< accordion id="One" title="CSM Installation Wizard" >}}
  {{< include file="content/docs/getting-started/installation/installationwizard/operator.md" >}}
{{< /accordion >}}
<br>

{{< accordion id="Two" title="CSI Driver" markdown="true" >}}   

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
     - clusterName: "cluster2"
        username: "user"
        password: "password"
        endpoint: "1.2.3.4"
        endpointPort: "8080"
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

      If certificate validation is skipped, empty secret must be created. To create an empty secret. Ex: empty-secret.yaml
     
      ```yaml 
      cat << EOF > empty-secret.yaml
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
       oc create -f empty-secret.yaml
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
        configVersion: {{< version-docs key="PScale_latestVersion" >}}
    EOF 
    ``` 
    </div> 

    **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerscale_{{< version-docs key="sample_sc_pscale" >}}.yaml) for detailed settings.

    To set the parameters in CR. The table shows the main settings of the Powerscale driver and their defaults.

<ul>
{{< collapse id="1" title="Parameters">}}
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | namespace | Specifies namespace where the driver will be installed | Yes | "isilon" |
   | replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be in pending state until new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
   | dnsPolicy | Determines the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
   | fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No | "ReadWriteOnceWithFSType" |
   | storageCapacity | Enable/Disable storage capacity tracking feature | No | false |
   | ***Common parameters for node and controller*** |
   | CSI_ENDPOINT | The UNIX socket address for handling gRPC calls | No | /var/run/csi/csi.sock |
   | X_CSI_ISI_SKIP_CERTIFICATE_VALIDATION | Specifies whether SSL security needs to be enabled for communication between PowerScale and CSI Driver | No | true |
   | X_CSI_ISI_PATH | Base path for the volumes to be created | Yes | |
   | X_CSI_ALLOWED_NETWORKS | Custom networks for PowerScale export. List of networks that can be used for NFS I/O traffic, CIDR format should be used | No | empty |
   | X_CSI_ISI_AUTOPROBE | To enable auto probing for driver | No | true |
   | X_CSI_ISI_NO_PROBE_ON_START | Indicates whether the controller/node should probe during initialization | Yes | |
   | X_CSI_ISI_VOLUME_PATH_PERMISSIONS | The permissions for isi volume directory path | Yes | 0777 |
   | X_CSI_ISI_AUTH_TYPE | Indicates the authentication method to be used. If set to 1 then it follows as session-based authentication else basic authentication. If CSM Authorization is enabled, this value must be set to 1. | No | 0 |
   | ***Controller parameters*** |
   | X_CSI_MODE   | Driver starting mode  | No | controller |
   | X_CSI_ISI_ACCESS_ZONE | Name of the access zone a volume can be created in | No | System |
   | X_CSI_ISI_QUOTA_ENABLED | To enable SmartQuotas | Yes | |
   | ***Node parameters*** |
   | X_CSI_MAX_VOLUMES_PER_NODE | Specify the default value for the maximum number of volumes that the controller can publish to the node | Yes | 0 |
   | X_CSI_MODE   | Driver starting mode  | No | node |
   | ***Sidecar parameters*** |
   | volume-name-prefix | The volume-name-prefix will be used by provisioner sidecar as a prefix for all the volumes created  | Yes | k8s |
   | monitor-interval | The monitor-interval will be used by external-health-monitor as an interval for health checks  | Yes | 60s |
{{< /collapse >}}
</ul>

<ul>
Check if ContainerStorageModule CR is created successfully:

```terminal
oc get csm isilon -n isilon

NAME        CREATIONTIME   CSIDRIVERTYPE   CONFIGVERSION                                          STATE
isilon      3h             isilon          {{< version-docs key="PScale_latestVersion" >}}        Succeeded      
```

Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.
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
    parameters:  
       AccessZone: System  
       IsiPath: /ifs/data/csi  
       RootClientEnabled: "false" 
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
       name: isilon-snapclass
    driver: csi-isilon.dellemc.com
    deletionPolicy: Delete
    parameters:
       IsiPath: /ifs/data/csi
    EOF 
    ```

    Verify Volume Snapshot Class is created: 

    ```terminal
    oc get volumesnapshot
    
    NAME                      DRIVER                              DELETIONPOLICY   AGE
    isilon-snapclass          csi-isilon.dellemc.com              Delete           3h9m
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
  oc delete pvc pvc-isilon-restore -n default
  ```

  Verify restore pvc is deleted:

  ```terminal
  oc get pvc -n default

  NAME                    STATUS   VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
  pvc-isilon              Bound    ocp08-095f7d3c52   8Gi        RWO            isilon         <unset>                 7m34s
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
oc apply -f pvc-isilon.yaml
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
{{< accordion id="Three" title="CSM Modules" >}}

<br>   

{{< cardcontainer >}}
    {{< customcard link1="./csm-modules/authorizationv1-x"  image="1" title="Authorization v1.x" >}}

    {{< customcard link1="./csm-modules/authorizationv2-0"   image="1" title="Authorization v2.0"  >}}

    {{< customcard  link1="./csm-modules/observability"   image="1" title="Observability"  >}}

    {{< customcard  link1="./csm-modules/replication"  image="1" title="Replication"  >}} 

    {{< customcard link1="./csm-modules/resiliency"   image="1" title="Resiliency"  >}}

{{< /cardcontainer >}}
{{< /accordion >}}  
