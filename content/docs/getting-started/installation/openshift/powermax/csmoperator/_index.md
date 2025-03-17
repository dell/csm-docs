---
title: Installation
linkTitle: Operator 
no_list: true
weight: 2
description: >
  Installing the CSI Driver for PowerMax via Container Storage Module Operator
---

<br>
<br>

{{< accordion id="One" title="Prerequisite" >}} 
<br>
{{<include  file="content/docs/getting-started/installation/openshift/powermax/prerequisite/_index.md" >}}

{{< /accordion >}}

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
      - endpoint: "https://powerstore.example.com/api/rest"
        globalID: "PSxxxxxxxxxxxx"
        username: "csmadmin"
        password: "P@ssw0rd123"
        skipCertificateValidation: true
        blockProtocol: "FC"
    EOF
    ```
    </div> 
 

    <br>

    Edit the file, then run the command to create the `powerstore-config`.

    ```bash
    oc create secret generic powerstore-config --from-file=config=config.yaml -n powerstore --dry-run=client -oyaml > secret-powerstore-config.yaml
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
    oc create -f csm-powerstore.yaml
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
        configVersion: {{< version-docs key="PStore_latestVersion" >}}
    EOF 
    ``` 
    </div> 

    **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerstore_v2130.yaml) for detailed settings.
    
    <br>
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

NAME        CREATIONTIME   CSIDRIVERTYPE   CONFIGVERSION         STATE
powerstore  3h             powerstore      {{< version-docs key="PStore_latestVersion" >}}               Succeed    
```

Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.
</ul>

<br>

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
      name: "powerstore"
      annotations:
        storageclass.kubernetes.io/is-default-class: "true"
    provisioner: "csi-powerstore.dellemc.com"
    parameters:
      arrayID: "Unique"
      csi.storage.k8s.io/fstype: "xfs"
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
    oc apply -f vsclass-powerstore.yaml
    ```

    Example:
    ```yaml
    cat << EOF > vsclass-powerstore.yaml
    apiVersion: snapshot.storage.k8s.io/v1
    kind: VolumeSnapshotClass
    metadata:
      name: vsclass-powerstore
    driver: csi-powerstore.dellemc.com
    deletionPolicy: Delete
    EOF 
    ```

    Verify Volume Snapshot Class is created: 

    ```terminal
    oc get volumesnapshotclass
    
    NAME                      DRIVER                              DELETIONPOLICY   AGE
    vsclass-powerstore        csi-powerstore.dellemc.com          Delete           3h9m
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

  NAME                           STATUS   VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS       VOLUMEATTRIBUTESCLASS   AGE
  pvc-powerstore                 Bound    ocp08-9f103c4fc6   8Gi        RWO            powerstore         <unset>                 4s
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

  ##### **Delete Persistence Volume Claim**
  
  </br>

  Use this command to  **Delete Persistence Volume Claim**:

  ```bash
  oc delete pvc pvc-powerstore -n default
  ```

  Verify restore pvc is deleted:

  ```terminal
  oc get pvc -n default

  NAME                    STATUS   VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
  pvc-powerstore          Bound    ocp08-095f7d3c52   8Gi        RWO            powerstore     <unset>                 7m34s
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
  name: vs-powerstore
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
snapcontent-80e99281-0d96-4275-b4aa-50301d110bd4   true         8589934592    Delete           csi-powerstore.dellemc.com   vsclass-powerstore      vs-powerstore    default                   23s
```  

<br>  
</li>
<li>

##### **Restore Snapshot** 

</br>

Use this command to  **Restore Snapshot**:

```bash
oc apply -f pvc-powerstore-restore.yaml
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

##### **Delete Restore Persistant Volume Claim**   

<br>
Use this command to  **Delete Restore Persistant Volume Claim**:

```bash
oc delete pvc pvc-powerstore-restore -n default
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

{{< collapse id="3" title="Volume Prefix" card="false" >}}  

Example:

```yaml
cat << 'EOF' > csm-powerstore.yaml
apiVersion: storage.dell.com/v1
kind: ContainerStorageModule
metadata:
  name: powerstore
  namespace: powerstore
spec:
  driver:
    csiDriverType: "powerstore"
    configVersion: v2.13.0
    common:
      envs:
      - name: X_CSI_POWERSTORE_NODE_NAME_PREFIX
        value: "ocp08"
    sideCars:
    - name: provisioner
      args: ["--volume-name-prefix=ocp08"]
EOF
```  

{{< /collapse >}}  


{{< /accordion >}}   

<br>

{{< accordion id="Three" title="Modules" >}}

<br>   

{{< cardcontainer >}}

    {{< customcard link1="./csm-modules/resiliency"   image="1" title="Resiliency"  >}}

{{< /cardcontainer >}}
{{< /accordion >}}  

<!--
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

{{< markdownify >}}
Supported driver and module versions offered by the Container Storage Module Operator [here](../../../../../supportmatrix/#operator-compatibility-matrix)
{{< /markdownify >}}

<br>
<br>

{{< accordion id="One" title="CSM Installation Wizard" markdown="true" >}}  
{{<include  file="content/docs/getting-started/installation/installationwizard/operator.md" >}}
{{< /accordion >}}

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

### Install Driver

1. **Create namespace:** 

   Run `kubectl create namespace <driver-namespace>` using the desired name to create the namespace.
2. **Create PowerMax credentials:**

   Create a file called powermax-creds.yaml or pick a [sample](https://github.com/dell/csi-powermax/blob/main/samples/secret/secret.yaml) that has Powermax array connection details :
     ```yaml
        apiVersion: v1
        kind: Secret
        metadata:
          name: powermax-creds
            # Replace driver-namespace with the namespace where driver is being deployed
          namespace: <driver-namespace>
        type: Opaque
        data:
          # set username to the base64 encoded username
          username: <base64 username>
          # set password to the base64 encoded password
          password: <base64 password>
          # Uncomment the following key if you wish to use ISCSI CHAP authentication (v1.3.0 onwards)
          # chapsecret: <base64 CHAP secret>
     ```
   Replace the values for the username and password parameters. These values can be obtained using base64 encoding as described in the following example:
   ```BASH
   echo -n "myusername" | base64
   echo -n "mypassword" | base64
   # If mychapsecret is the iSCSI CHAP secret
   echo -n "mychapsecret" | base64

   ```
   Run the `kubectl create -f powermax-creds.yaml` command to create the secret.

3. **Create Reverseproxy Configmap:** 

    Create a configmap using sample [here](https://github.com/dell/csm-operator/tree/master/samples/csireverseproxy/config.yaml). Fill in the appropriate values for driver configuration.
    Example: config.yaml
    ```yaml
    port: 2222 # Port on which reverseproxy will listen
    logLevel: debug
    logFormat: text
    config:
      storageArrays:
          - storageArrayId: "000000000001" # arrayID
            primaryURL: https://primary-1.unisphe.re:8443 # primary unisphere for arrayID
            backupURL: https://backup-1.unisphe.re:8443   # backup unisphere for arrayID
            proxyCredentialSecrets:
              - primary-unisphere-secret-1 # credential secret for primary unisphere, e.g., powermax-creds
              - backup-unisphere-secret-1 # credential secret for backup unisphere, e.g., powermax-creds
          - storageArrayId: "000000000002"
            primaryURL: https://primary-2.unisphe.re:8443
            backupURL: https://backup-2.unisphe.re:8443
            proxyCredentialSecrets:
            - primary-unisphere-secret-2
            - backup-unisphere-secret-2
      managementServers:
        - url: https://primary-1.unisphe.re:8443 # primary unisphere endpoint
          arrayCredentialSecret: primary-unisphere-secret-1 # primary credential secret e.g., powermax-creds
          skipCertificateValidation: true
        - url: https://backup-1.unisphe.re:8443 # backup unisphere endpoint
          arrayCredentialSecret: backup-unisphere-secret-1 # backup credential secret e.g., powermax-creds
          skipCertificateValidation: false # value false, to verify unisphere certificate and provide certSecret
          certSecret: primary-certs # unisphere verification certificate
        - url: https://primary-2.unisphe.re:8443
          arrayCredentialSecret: primary-unisphere-secret-2
          skipCertificateValidation: true
        - url: https://backup-2.unisphe.re:8443
          arrayCredentialSecret: backup-unisphere-secret-2
          skipCertificateValidation: false
          certSecret: primary-certs
    ```
    After editing the file, run this command to create a secret called `powermax-reverseproxy-config`. If you are using a different namespace/secret name, just substitute those into the command.
      ```bash
      kubectl create configmap powermax-reverseproxy-config --from-file config.yaml -n powermax
      ```
4. **Create Powermax Array Configmap:**  
  Create a configmap using the sample file [here](https://github.com/dell/csi-powermax/blob/main/samples/configmap/powermax-array-config.yaml). Fill in the appropriate values for driver configuration.
   ```yaml
      # To create this configmap use: kubectl create -f powermax-array-config.yaml
      apiVersion: v1
      kind: ConfigMap
      metadata:
        name: powermax-array-config
        namespace: powermax
      data:
        powermax-array-config.yaml: |
          # List of comma-separated port groups (ISCSI only). Example: PortGroup1, portGroup2 Required for iSCSI only
          X_CSI_POWERMAX_PORTGROUPS: ""
          # Choose which transport protocol to use (ISCSI, FC, NVMETCP, auto) defaults to auto if nothing is specified
          X_CSI_TRANSPORT_PROTOCOL: ""
          # IP address of the Unisphere for PowerMax (Required), Defaults to https://0.0.0.0:8443
          X_CSI_POWERMAX_ENDPOINT: "https://10.0.0.0:8443" 
          # List of comma-separated array ID(s) which will be managed by the driver (Required)
          X_CSI_MANAGED_ARRAYS: "000000000000,000000000000,"
   ```

5. Create a CR (Custom Resource) for PowerFlex using the sample files provided

    a. **Default Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/minimal-samples/powermax_v2130.yaml) for default settings. Modify if needed.

    [OR]                                                

    b. **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powermax_v2130.yaml) for detailed settings. 

> NOTE:
> [Replication module](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powermax_v2130.yaml#L283) must be enabled to use the Metro volume

Example:
```yaml
    - name: replication
      enabled: true
```
>  [Target clusterID](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powermax_v2130.yaml#L316) should be set as self

Example:
```yaml
    - name: "TARGET_CLUSTERS_IDS"
      value: "self"
```

6. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerMax driver and their default values:

<ul>
{{< collapse id="1" title="Parameters">}}
   | Parameter                                       | Description                                                                                                                                                                                                                                                              | Required | Default                        |
   |-------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|--------------------------------|
   | dnsPolicy                                       | Determines the DNS Policy of the Node service                                                                                                                                                                                                                            | Yes      | ClusterFirstWithHostNet        |
   | replicas                                        | Controls the number of controller Pods you deploy. If controller Pods are greater than the number of available nodes, excess Pods will become stuck in pending. The default is 2 which allows for Controller high availability.                                          | Yes      | 2                              |
   | fsGroupPolicy                                   | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field.                                                                                                                                                                  | No       | "ReadWriteOnceWithFSType"      |
   | ***Common parameters for node and controller*** |                                                                                                                                                                                                                                                                          |          |                                |
   | X_CSI_K8S_CLUSTER_PREFIX                        | Define a prefix that is appended to all resources created in the array; unique per K8s/CSI deployment; max length - 3 characters                                                                                                                                         | No      | CSM                            |
   | X_CSI_POWERMAX_PROXY_SERVICE_NAME               | Name of CSI PowerMax ReverseProxy service.                                                                                                                                                                                                                               | Yes      | csipowermax-reverseproxy       |
   | X_CSI_IG_MODIFY_HOSTNAME                        | Change any existing host names. When nodenametemplate is set, it changes the name to the specified format else it uses driver default host name format.                                                                                                                  | No       | false                          |
   | X_CSI_IG_NODENAME_TEMPLATE                      | Provide a template for the CSI driver to use while creating the Host/IG on the array for the nodes in the cluster. It is of the format a-b-c-%foo%-xyz where foo will be replaced by host name of each node in the cluster.                                              | No       | -                              |
   | X_CSI_POWERMAX_DRIVER_NAME                      | Set custom CSI driver name. For more details on this feature see the related [documentation](../../../../../concepts/csidriver/features/powermax/#custom-driver-name)                                                                                                                             | No       | -                              |
   | X_CSI_HEALTH_MONITOR_ENABLED                    | Enable/Disable health monitor of CSI volumes from Controller and Node plugin. Provides details of volume status, usage and volume condition. As a prerequisite, external-health-monitor sidecar section should be uncommented in samples which would install the sidecar | No       | false                          |
   | X_CSI_VSPHERE_ENABLED                           | Enable VMware virtualized environment support via RDM                                                                                                                                                                                                                    | No       | false                          |
   | X_CSI_VSPHERE_PORTGROUP                         | Existing portGroup that driver will use for vSphere                                                                                                                                                                                                                      | Yes      | ""                             |
   | X_CSI_VSPHERE_HOSTNAME                          | Existing host(initiator group)/host group(cascaded initiator group) that driver will use for vSphere                                                                                                                                                                     | Yes      | ""                             |
   | X_CSI_VCenter_HOST                              | URL/endpoint of the vCenter where all the ESX are present                                                                                                                                                                                                                | Yes      | ""                             |
   | ***Node parameters***                           |                                                                                                                                                                                                                                                                          |          |                                |
   | X_CSI_POWERMAX_ISCSI_ENABLE_CHAP                | Enable ISCSI CHAP authentication. For more details on this feature see the related [documentation](../../../../../concepts/csidriver/features/powermax/#iscsi-chap)                                                                                                                               | No       | false                          |
   | X_CSI_TOPOLOGY_CONTROL_ENABLED                  | Enable/Disable topology control. It filters out arrays, associated transport protocol available to each node and creates topology keys based on any such user input.                                                                                                      | No       | false                          |
   | ***CSI Reverseproxy Module***                   |                                                                                                                                                                                                                                                                          |          |                                |
   | X_CSI_REVPROXY_TLS_SECRET                       | Name of TLS secret defined in config map                                                                                                                                                                                                                                 | Yes      | "csirevproxy-tls-secret"       |
   | X_CSI_REVPROXY_PORT                             | Port number where reverseproxy will listen as defined in config map                                                                                                                                                                                                      | Yes      | "2222"                         |
   | X_CSI_CONFIG_MAP_NAME                           | Name of config map as created for CSI PowerMax                                                                                                                                                                                                                           | Yes      | "powermax-reverseproxy-config" |
{{< /collapse >}}
</ul>

7. Execute the following command to create the PowerMax custom resource:`kubectl create -f <input_sample_file.yaml>`. The above command will deploy the CSI-PowerMax driver.
8. The mandatory module CSI PowerMax Reverseproxy will be installed automatically with the same command. 
9. Once the driver `Custom Resource (CR)` is created, you can verify the installation as mentioned below

    * Check if ContainerStorageModule CR is created successfully using the command below:
        ```bash
        kubectl get csm/<name-of-custom-resource> -n <driver-namespace> -o yaml
        ```
    * Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information. 
     
10. Refer [Volume Snapshot Class](https://github.com/dell/csi-powermax/tree/main/samples/volumesnapshotclass) and [Storage Class](https://github.com/dell/csi-powermax/tree/main/samples/storageclass) for the sample files. 

## Other features to enable
### Dynamic Logging Configuration

This feature is introduced in CSI Driver for powermax version 2.0.0.

As part of driver installation, a ConfigMap with the name `powermax-config-params` is created using the manifest located in the sample file. This ConfigMap contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver. To set the default/initial log level user can set this field during driver installation.

To update the log level dynamically user has to edit the ConfigMap `powermax-config-params` and update `CSI_LOG_LEVEL` to the desired log level.
```bash
kubectl edit configmap -n powermax powermax-config-params
```

### Volume Health Monitoring
This feature is introduced in CSI Driver for PowerMax version 2.2.0.

Volume Health Monitoring feature is optional and by default this feature is disabled for drivers when installed via CSM operator.

To enable this feature, set  `X_CSI_HEALTH_MONITOR_ENABLED` to `true` in the driver manifest under controller and node section. Also, install the `external-health-monitor` from `sideCars` section for controller plugin.
To get the volume health state `value` under controller should be set to true as seen below. To get the volume stats `value` under node should be set to true.
```yaml
     # Install the 'external-health-monitor' sidecar accordingly.
        # Allowed values:
        #   true: enable checking of health condition of CSI volumes
        #   false: disable checking of health condition of CSI volumes
        # Default value: false
     controller:
       envs:
         - name: X_CSI_HEALTH_MONITOR_ENABLED
           value: "true"
     node:
       envs:
        # X_CSI_HEALTH_MONITOR_ENABLED: Enable/Disable health monitor of CSI volumes from node plugin - volume usage
        # Allowed values:
        #   true: enable checking of health condition of CSI volumes
        #   false: disable checking of health condition of CSI volumes
        # Default value: false
         - name: X_CSI_HEALTH_MONITOR_ENABLED
           value: "true"
```

### Support for custom topology keys

This feature is introduced in CSI Driver for PowerMax version 2.3.0.

Support for custom topology keys is optional and by default this feature is disabled for drivers when installed via CSM operator.

X_CSI_TOPOLOGY_CONTROL_ENABLED provides a way to filter topology keys on a node based on array and transport protocol. If enabled, user can create custom topology keys by editing node-topology-config configmap.

1. To enable this feature, set  `X_CSI_TOPOLOGY_CONTROL_ENABLED` to `true` in the driver manifest under node section.

   ```yaml
      # X_CSI_TOPOLOGY_CONTROL_ENABLED provides a way to filter topology keys on a node based on array and transport protocol
           # if enabled, user can create custom topology keys by editing node-topology-config configmap.
           # Allowed values:
           #   true: enable the filtration based on config map
           #   false: disable the filtration based on config map
           # Default value: false
           - name: X_CSI_TOPOLOGY_CONTROL_ENABLED
             value: "false"
   ```
2. Edit the sample config map "node-topology-config" as described [here](https://github.com/dell/csi-powermax/blob/main/samples/configmap/topologyConfig.yaml) with appropriate values:
   Example:
   ```yaml
           kind: ConfigMap
           metadata:
             name: node-topology-config
             namespace: powermax
           data:
             topologyConfig.yaml: |
               allowedConnections:
                 - nodeName: "node1"
                   rules:
                     - "000000000001:FC"
                     - "000000000002:FC"
                 - nodeName: "*"
                   rules:
                     - "000000000002:FC"
               deniedConnections:
                 - nodeName: "node2"
                   rules:
                     - "000000000002:*"
                 - nodeName: "node3"
                   rules:
                     - "*:*"

     ```
  <ul>
   {{< collapse id="2" title="Parameters">}}
   | Parameter | Description  |
   |-----------|--------------|
   | allowedConnections | List of node, array and protocol info for user allowed configuration |
   | allowedConnections.nodeName | Name of the node on which user wants to apply given rules |
   | allowedConnections.rules | List of StorageArrayID:TransportProtocol pair |
   | deniedConnections | List of node, array and protocol info for user denied configuration |
   | deniedConnections.nodeName | Name of the node on which user wants to apply given rules  |
   | deniedConnections.rules | List of StorageArrayID:TransportProtocol pair | 
   {{< /collapse >}}
  </ul>
<br>

3. Run following command to create the configmap
  ```bash
  kubectl create -f topologyConfig.yaml
  ```
 >Note: Name of the configmap should always be `node-topology-config`.

{{< /accordion >}}


<br>

{{< accordion id="Three" title="Modules"  >}}  

<br>   

{{< cardcontainer >}}
    {{< customcard link1="./csm-modules/authorizationv1.x"  image="1" title="Authorization v1.x" >}}

    {{< customcard link1="./csm-modules/authorizationv2.0"   image="1" title="Authorization v2.0"  >}}

    {{< customcard  link1="./csm-modules/observability"   image="1" title="Observability"  >}}

    {{< customcard  link1="./csm-modules/replication"  image="1" title="Replication"  >}} 

    {{< customcard link1="./csm-modules/resiliency"   image="1" title="Resiliency"  >}}

{{< /cardcontainer >}} 

{{< /accordion >}}
-->