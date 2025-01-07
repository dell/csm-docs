---
title: "Operator"
linktitle: "Operator"
no_list: true
description: CSM Operator Installation
weight: 2
---

## Installing the Operator
To deploy the Operator, follow the instructions available [here](../../../operator/operatorinstallation_openshift.md).

{{< accordion id="Two" title="CSI Driver" markdown="true" >}}  

### CSI Driver Installation
</br>

1. **Create project:**
  
   Use this command to **create** new project:

   ```bash 
   oc new-project vxflexos
   ```
   You can use any project name instead of `vxflexos`.

2. **Create config secret:** 
       
    Create a file called `config.yaml` or use [sample](https://github.com/dell/csi-powerflex/blob/main/samples/secret.yaml): 
   
    Example:
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

    Add blocks for each Powerflex array in `config.yaml`, and include both source and target arrays if replication is enabled.
 
    <br>

    Edit the file, then run the command to create the `vxflexos-config`.

    ```bash
    oc create secret generic vxflexos-config --from-file=config=config.yaml -n vxflexos --dry-run=client -oyaml > secret-vxflexos-config.yaml
    ```
    
    Use this command to **apply** the config:

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

3. **Create Custom Resource** ContainerStorageModule for powerflex.

    ```bash
    oc create -f csm-powerflex.yaml
    ```

    Example:
    ```yaml
    cat << EOF > csm-powerflex.yaml
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
      name: vxflexos
      namespace: vxflexos
    spec:
      driver:
        csiDriverType: "powerflex"
        configVersion: v2.13.0
    EOF 
    ``` 

    **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerflex_v2130.yaml) for detailed settings.

    To set the parameters in CR. The table shows the main settings of the PowerFlex driver and their defaults.
<ul>
{{< collapse id="1" title="Parameters">}}
| Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| dnsPolicy | Determines the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
| fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No | "ReadWriteOnceWithFSType" |
| replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, excess pods will become stay in a pending state. Defaults are 2 which allows for Controller high availability. | Yes | 2 |
| storageCapacity.enabled | Enable/Disable storage capacity tracking | No | true |
| storageCapacity.pollInterval | Configure how often the driver checks for changed capacity | No | 5m |
| enableQuota | a boolean that, when enabled, will set quota limit for a newly provisioned NFS volume | No | none |
| maxVxflexosVolumesPerNode | Specify default value for maximum number of volumes that controller can publish to the node.If value is zero CO SHALL decide how many volumes of this type can be published by the controller to the node | Yes | 0 |
| ***Common parameters for node and controller*** |
| X_CSI_VXFLEXOS_ENABLELISTVOLUMESNAPSHOT | Enable list volume operation to include snapshots (since creating a volume from a snap actually results in a new snap) | No | false |
| X_CSI_VXFLEXOS_ENABLESNAPSHOTCGDELETE | Enable this to automatically delete all snapshots in a consistency group when a snap in the group is deleted | No | false |
| X_CSI_DEBUG | To enable debug mode | No | true |
| X_CSI_ALLOW_RWO_MULTI_POD_ACCESS | Setting allowRWOMultiPodAccess to "true" will allow multiple pods on the same node to access the same RWO volume. This behavior conflicts with the CSI specification version 1.3. NodePublishVolume description that requires an error to be returned in this case. However, some other CSI drivers support this behavior and some customers desire this behavior. Customers use this option at their own risk. | No | false |
| INTERFACE_NAMES | A mapping of node names to interface names. Only necessary when SDC is disabled. | No | none |
| ***Controller parameters*** |
| X_CSI_POWERFLEX_EXTERNAL_ACCESS | allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | empty |
| X_CSI_HEALTH_MONITOR_ENABLED | Enable/Disable health monitor of CSI volumes from Controller plugin - volume condition | No | false |
| ***Node parameters*** |
| X_CSI_RENAME_SDC_ENABLED | Enable this to rename the SDC with the given prefix. The new name will be ("prefix" + "worker_node_hostname") and it should not exceed 31 chars. | Yes | false |
| X_CSI_APPROVE_SDC_ENABLED | Enable this to to approve restricted SDC by GUID during setup | Yes | false |
| X_CSI_HEALTH_MONITOR_ENABLED | Enable/Disable health monitor of CSI volumes from Node plugin - volume condition | No | false |
| X_CSI_SDC_ENABLED | Enable/Disable installation of the SDC. | Yes | true |
{{< /collapse >}}
</ul>

<ul>
Check if ContainerStorageModule CR is created successfully:

```terminal
oc get csm vxflexos -n vxflexos
NAME        CREATIONTIME   CSIDRIVERTYPE   CONFIGVERSION   STATE
vxflexos    3h             powerflex       v2.12.0         Succeeded      
```

Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.
</ul>

5. **Create Storage class:** 

    ```bash
    oc create -f sc-powerflex.yaml
    ```

    Example: 
    ```yaml
    cat << EOF > sc-powerflex.yaml
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
     Replace placeholders with actual values for your powerflex array and various storage class sample refer [here](https://github.com/dell/csi-powerflex/tree/main/samples/storageclass) 
      
    Verify Storage Class is created: 

    ```terminal
    oc get storageclass vxflexos
  
    NAME                    PROVISIONER                    RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
    vxflexos (default)      csi-vxflexos.dellemc.com       Delete          Immediate           true                   3h8m
    ``` 

    </br>

6. **Create Volume Snapshot Class:** 

    ```bash
    oc create -f vsclass-powerflex.yaml
    ```

    Example:
    ```yaml
    cat << EOF > vsclass-powerflex.yaml
    apiVersion: snapshot.storage.k8s.io/v1
    kind: VolumeSnapshotClass
    metadata:
      name: vxflexos-snapclass
    deletionPolicy: Delete
    EOF 
    ```

    Verify Volume Snapshot Class is created: 

    ```terminal
    oc get volumesnapshotclass
    
    NAME                      DRIVER                              DELETIONPOLICY   AGE
    vxflexos-snapclass        csi-vxflexos.dellemc.com            Delete           3h9m
    ``` 
   </br>

### PVC and Pod Creation

 </br>

1. **Create Persistent Volume Claim:**

    ```bash
    oc create -f pvc-powerflex.yaml
    ```

    Example:
    ```yaml
    cat << EOF > pvc-powerflex.yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: pvc-powerflex
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
    oc get pvc -n vxflexos
 

    ```

     </br>

2.  **Create Pod which uses Persistent Volume Claim with storage class:** 

    ```bash
    oc create -f pod-powerflex.yaml
    ```

    Example: 
    ```yaml
    cat << EOF > pod-powerflex.yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: pod-powerflex
      namespace: default
    spec:
      containers:
      - name: ubi
        image: registry.access.redhat.com/ubi9/ubi
        command: [ "bash", "-c" ]
        args: [ "while true; do touch /data/file-$(date +%T); sleep 20; done;" ]
        volumeMounts:
        - name: data
          mountPath: /data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: pvc-powerflex
    EOF
    ```

    Verify pod is created:

    ```terminal
    oc get pod -n vxflexos
   

    ``` 

{{< /accordion >}}  

<br>

{{< accordion id="Three" title="CSM Modules">}}
<br>  
{{< markdownify >}}
The driver and modules versions installable with the Container Storage Module Operator [Click Here](../../../../../supportmatrix/#operator-compatibility-matrix)
{{< /markdownify >}}
<br>   

{{< cardcontainer >}}
    {{< customcard link1="./csm-modules/authorizationv1.x"  image="6" title="Authorization v1.x" >}}

    {{< customcard link1="./csm-modules/authorizationv2.0"   image="6" title="Authorization v2.0"  >}}

    {{< customcard  link1="./csm-modules/observability"   image="6" title="Observability"  >}}

    {{< customcard  link1="./csm-modules/replication"  image="6" title="Replication"  >}} 

    {{< customcard link1="./csm-modules/resiliency"   image="6" title="Resiliency"  >}}

{{< /cardcontainer >}}


{{< /accordion >}} 
