
---
title: "Operator"
linktitle: "Operator"
no_list: true
description: CSM Operator Installation
weight: 2
---

## Installing the Operator
To deploy the Operator, follow the instructions available [here](../../../operator/operatorinstallation_openshift.md).

{{< accordion id="One" title="CSM Installation Wizard" >}}
  {{< include "content/docs/getting-started/installation/installationwizard/operator.md" >}}
{{< /accordion >}}
<br>

{{< accordion id="Two" title="CSI Driver" markdown="true" >}}  

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
    
    Create a file called `config.yaml` or use [sample](https://github.com/dell/csi-powerscale/blob/main/samples/secret.yaml): 
   
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
    oc create -f csm-powerscale.yaml
    ```

    Example:
    <div style="margin-bottom: -1.8rem">


    ```yaml
    cat << EOF > csm-powerscale.yaml
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
      name: isilon
      namespace: isilon
    spec:
      driver:
        csiDriverType: "powerscale"
        configVersion: v2.13.0
    EOF 
    ``` 
    </div> 

    **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerscale_v2130.yaml) for detailed settings.

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

NAME        CREATIONTIME   CSIDRIVERTYPE   CONFIGVERSION   STATE
isilon      3h             powerscale      v2.12.0         Succeeded      
```

Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.
</ul>

<br>

4. ##### **Create Storage class:** 
    
    <br>

    Use this command to create the **Storage Class**: 

    ```bash
    oc create -f sc-powerscale.yaml
    ```

    Example: 
    ```yaml
    cat << EOF > sc-powerscale.yaml
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
    oc create -f vsclass-powerscale.yaml
    ```

    Example:
    ```yaml
    cat << EOF > vsclass-powerscale.yaml
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
    oc get volumesnapshotclass
    
    NAME                      DRIVER                              DELETIONPOLICY   AGE
    isilon-snapclass          csi-isilon.dellemc.com              Delete           3h9m
    ``` 
   </br>

### PVC and Pod Creation

 </br>

1. ##### **Create Persistent Volume Claim:**


    <br>
    
    Use this command to create the **Persistent Volume Claim**: 

    ```bash
    oc create -f pvc-powerscale.yaml
    ```

    Example:
    ```yaml
    cat << EOF > pvc-powerscale.yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: pvc-powerscale
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
    oc get pvc -n isilon
 

    ```

     </br>

2.  ##### **Create Pod which uses Persistent Volume Claim with storage class:**  

    <br>
    
    Use this command to create the **Pod**: 


    ```bash
    oc create -f pod-powerscale.yaml
    ```

    Example: 
    ```yaml
    cat << 'EOF' > pod-powerscale.yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: pod-powerscale
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
          claimName: pvc-powerscale
    EOF
    ```

    Verify pod is created:

    ```terminal
    oc get pod -n default

    NAME                                        READY   STATUS    RESTARTS   AGE
    pod-powerscale                              1/1     Running   0          109s
    
    ``` 



### Install CSI Driver
</br>

1. **Create namespace:**

   ```bash 
      oc new-project isilon
   ```
   This command creates a namespace called `isilon`. You can replace `isilon` with any name you prefer.

2. **Create `config` file:** 

     a. Create a file called `config.yaml` or pick a [sample](https://github.com/dell/csi-powerscale/blob/main/samples/secret/secret.yaml) that has Powerscale array connection details: 
      ```yaml
     isilonClusters:
      - clusterName: "cluster2"
         username: "user"
         password: "password"
         endpoint: "1.2.3.4"
         endpointPort: "8080"
     ```
      - **Update Parameters:** Replace placeholders with actual values for your PowerScale array.
      - **Add Blocks:** If you have multiple PowerScale arrays, add similar blocks for each one.
      - **Replication:** If replication is enabled, make sure the `config.yaml` includes all involved PowerScale arrays.

     </br>

     b. After editing the file, **run this command to create a config** called `isilon-config`.

     ```bash
      oc create secret generic isilon-creds --from-file=config=config.yaml -n isilon --dry-run=client -oyaml > secret-config.yaml
     ```

     Use the following command to **replace or update the config**

     ```bash
     oc create secret generic isilon-creds --from-file=config=config.yaml -n isilon -o yaml --dry-run | kubectl replace -f -
     ```
   **Note**: The user needs to validate the YAML syntax and array related key/values while replacing the isilon-creds secret.
   The driver will continue to use previous values in case of an error found in the YAML file.

4. **Create isilon-certs-n secret.**

      Please refer [this section](../../../../../getting-started/installation/kubernetes/powerscale/helm/#certificate-validation-for-onefs-rest-api-calls) for creating cert-secrets.

      If certificate validation is skipped, empty secret must be created. To create an empty secret. Ex: empty-secret.yaml

      ```yaml
      apiVersion: v1
      kind: Secret
      metadata:
         name: isilon-certs-0
         namespace: isilon
      type: Opaque
      data:
         cert-0: ""
      ```

      ```bash
       oc create -f empty-secret.yaml
      ```

4. **Install Driver**

   i. **Create a CR (Custom Resource)** for Powerscale using the sample files provided

    a. **Minimal Configuration:**
      ```yaml
      apiVersion: storage.dell.com/v1
      kind: ContainerStorageModule
      metadata:
      name: isilon
      namespace: isilon
      spec:
      driver:
         csiDriverType: "isilon"
         configVersion: v2.13.0
         forceRemoveDriver: true
   ```
      [sample file](https://github.com/dell/csm-operator/blob/main/samples/minimal-samples/powerscale_v2130.yaml) for default settings. Modify if needed.

    [OR]                                                

    b. **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerscale_v2130.yaml) for detailed settings.

 - Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerScale driver and their default values: 

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

  ii. **Create PowerScale custom resource**:

   ```bash
    oc create -f <input_sample_file.yaml>
   ```
   This command will deploy the PowerScale driver in the namespace specified in the input YAML file.

</ul>

5. **Verify the installation** as mentioned below

    * Check if ContainerStorageModule CR is created successfully using the command below:
        ```bash
        oc get csm/isilon -n isilon
        ```
    * Check the status of the CR to verify if the driver installation is in the `Succeed` state. If the status is not `Succeed`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.

    </br>

6. **Create Storage Class** 
 
    ```yaml 
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
   
    ````  

   Refer [Storage Class](https://github.com/dell/csi-powerscale/tree/main/samples/storageclass) for different sample files. 

   **Run this command to create** a storage class

   ```bash
     oc create -f < storage-class.yaml >
   ```

 7. **Create Volume Snapshot Class** 
    ```yaml 
      apiVersion: snapshot.storage.k8s.io/v1
      kind: VolumeSnapshotClass
      metadata:
         name: isilon-snapclass
      driver: csi-isilon.dellemc.com
      deletionPolicy: Delete
      parameters:
         IsiPath: /ifs/data/csi
    ````

    Refer [Volume Snapshot Class](https://github.com/dell/csi-powerscale/blob/main/samples/volumesnapshotclass/) for the sample files.

    **Run this command to create** a volume snapshot class
    ```bash
      oc create -f < volume-snapshot-class.yaml >
    ``` 
**Note** :

   - "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
   -  Also, snapshotter and resizer sidecars are not optional to choose, it comes default with Driver installation.

{{< /accordion >}}  
<br>
{{< accordion id="Three" title="CSM Modules" >}}
<br>
{{< markdownify >}}
The driver and modules versions installable with the Container Storage Module Operator [Click Here](../../../../../supportmatrix/#operator-compatibility-matrix)
{{< /markdownify >}}

<br>   

{{< cardcontainer >}}
    {{< customcard link1="./csm-modules/authorizationv1.x"  image="1" title="Authorization v1.x" >}}

    {{< customcard link1="./csm-modules/authorizationv2.0"   image="1" title="Authorization v2.0"  >}}

    {{< customcard  link1="./csm-modules/observability"   image="1" title="Observability"  >}}

    {{< customcard  link1="./csm-modules/replication"  image="1" title="Replication"  >}} 

    {{< customcard link1="./csm-modules/resiliency"   image="1" title="Resiliency"  >}}

{{< /cardcontainer >}}
{{< /accordion >}}  
