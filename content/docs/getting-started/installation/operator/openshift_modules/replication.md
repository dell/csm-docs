---
title: Replication
linkTitle: "Replication"
description: >
  Installing Replication via Container Storage Modules Operator
--- 

1. Review the SyncIQ configuration on both the source and target PowerScale

   a. Use the below command to verify the SyncIQ is licensed on both PowerScale.

        isi license list

   b. Use the below command to review the SyncIQ configuration on the source PowerScale
     
      ```terminal
     ps01-1# isi sync settings view

                                       Service: on
                                 Source Subnet: -
                                   Source Pool: -
                               Force Interface: No
                       Restrict Target Network: No
                             Tw Chkpt Interval: -
                                Report Max Age: 1Y
                              Report Max Count: 2000
                                    RPO Alerts: Yes
                           Max Concurrent Jobs: 24
      Bandwidth Reservation Reserve Percentage: 1
        Bandwidth Reservation Reserve Absolute: -
                           Encryption Required: Yes
                        Cluster Certificate ID: 809c57b723f765b33a4a1a9905fd5837c12ae0ebe5f75ffd5aa3353cd83536e8
                    OCSP Issuer Certificate ID: 
                                  OCSP Address: 
                        Encryption Cipher List: 
                           Elliptic Curve List: 
                          Renegotiation Period: 8H
                       Service History Max Age: 1Y
                     Service History Max Count: 2000
                          Use Workers Per Node: No
                           Preferred RPO Alert: Never
                                  Password Set: No
      ``` 
   
   c. Use this command to review the SyncIQ configuration on the target PowerScale
    
    ```terminal

    ps02-1# isi sync settings view
                                     Service: on
                               Source Subnet: -
                                 Source Pool: -
                             Force Interface: No
                     Restrict Target Network: No
                           Tw Chkpt Interval: -
                              Report Max Age: 1Y
                            Report Max Count: 2000
                                  RPO Alerts: Yes
                         Max Concurrent Jobs: 24
    Bandwidth Reservation Reserve Percentage: 1
      Bandwidth Reservation Reserve Absolute: -
                         Encryption Required: Yes
                      Cluster Certificate ID: 1e3def272e919debfb3cb5bfd1a8de2be09d4b0dfe9a0af1b3b26eab16477e80
                  OCSP Issuer Certificate ID: 
                                OCSP Address: 
                      Encryption Cipher List: 
                         Elliptic Curve List: 
                        Renegotiation Period: 8H
                     Service History Max Age: 1Y
                   Service History Max Count: 2000
                        Use Workers Per Node: No
                         Preferred RPO Alert: Never
                                Password Set: No 
    ```

1. Install the repctl utility

   ```bash
   wget -O repctl https://github.com/dell/csm-replication/releases/download/<version>/repctl-linux-amd64

   chmod +x repctl
   
   mv repctl /usr/local/bin/
   ``` 
   
   Verify the repctl utility is installed.
   ```terminal
   repctl -v
   repctl version {{< version-docs key="repctl" >}}
   ````
<br> 

2. Configure the repctl utility
   
   ```bash
   repctl cluster add -f kubeconfig -n ocp01

   repctl cluster add -f kubeconfig -n ocp02
   ``` 
   
   Verify both the source and target OpenShift clusters are added.
   ```terminal
   repctl cluster get 
   +---------------+
   | Cluster       |
   +---------------+
   ClusterId       Version URL
   ocp01           v1.30   https://api.ocp01.vdi.xtremio:6443
   ocp02           v1.30   https://api.ocp02.vdi.xtremio:6443  
   ```
 
<br> 

3. Create the replication CRDs
   
   ```bash
   git clone -b <version> https://github.com/dell/csm-replication.git

   repctl create -f csm-replication/deploy/replicationcrds.all.yaml 
   ```

<br> 

4. Inject the service account’s configuration into the clusters.
   
   ```bash
   repctl cluster inject --use-sa 
   ``` 

5. Install CSM Operator only on the source OpenShift Cluster 


   a. On the OpenShift console, navigate to **OperatorHub** and use the keyword filter to search for **Dell Container Storage Modules.** 

   b. Click **Dell Container Storage Modules** tile 

   c. Keep all default settings and click **Install**.

   </br>
   

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

<br>

6. Create Project in both the source and target OpenShift cluster
   
   <br>

    Use this command to create new project. You can use any project name instead of `isilon`.

    ```bash 
    oc new-project isilon
    ```


7. Create config secret on both source and target OpenShift Cluster 

    <br>   
    
    Create a file called `config.yaml` or use [sample](https://github.com/dell/csi-powerscale/blob/main/samples/secret/secret.yaml): 
   
    Example: 
    <div style="margin-bottom: -1.8rem">


    ```yaml
    cat <<EOF> config.yaml
    isilonClusters:
    - clusterName: "ps01"
      username: "csmadmin"
      password: "P@ssw0rd123"
      endpoint: "ps01.vdi.xtremio"
      skipCertificateValidation: true
      replicationCertificateID: "1e3def272e919debfb3cb5bfd1a8de2be09d4b0dfe9a0af1b3b26eab16477e80"
    - clusterName: "ps02"
      username: "csmadmin"
      password: "P@ssw0rd123"
      endpoint: "ps02.vdi.xtremio"
      skipCertificateValidation: true
      replicationCertificateID: "809c57b723f765b33a4a1a9905fd5837c12ae0ebe5f75ffd5aa3353cd83536e8"
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

8. Create PowerScale certificate secret in both source and target OpenShift Cluster

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


9. Create custom resource ContainerStorageModule for PowerScale only on the source OpenShift Cluster 

    Use this command to create the **ContainerStorageModule Custom Resource**:

    ```bash
    oc create -f csm-isilon.yaml
    ```

    Example:
    <div style="margin-bottom: -1.8rem">


    ```yaml
    cat <<EOF> csm-powerscale.yaml
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
      name: isilon
      namespace: isilon
    spec:
      driver:
        authSecret: isilon-config
        common:
          envs:
          - name: X_CSI_ISI_AUTH_TYPE
            value: "1"
        configVersion: {{< version-docs key="PFlex-latestVersion" >}}
        csiDriverSpec:
          fSGroupPolicy: File
          storageCapacity: true
        csiDriverType: isilon
        forceRemoveDriver: true
        replicas: 1
        sideCars:
        - args:
          - --volume-name-prefix=ocp01
          name: provisioner
      modules:
      - name: replication
        enabled: true
        components:
        - name: dell-replication-controller-manager
          envs:
          - name: TARGET_CLUSTERS_IDS
            value: ocp02
    EOF
     ``` 
    </div>
   
   <br>

   Check if ContainerStorageModule CR is created successfully:

   ```terminal
   oc get csm isilon -n isilon

   NAME        CREATIONTIME   CSIDRIVERTYPE   CONFIGVERSION    STATE
   isilon      3h             isilon          {{< version-docs key="csi_powerscale_latest_version" >}}          Succeeded      
   ```

   Verify the CSM Pods are running in the Source OpenSfhift Cluster
   
   ```bash
   oc get pod -n powerscale
   NAME                                     READY   STATUS    RESTARTS      AGE
   powerscale-controller-77f8f74d4f-9vwnm   7/7     Running   5 (19h ago)   22h
   powerscale-node-5xcxz                    2/2     Running   4 (23h ago)   24h
   powerscale-node-fpct7                    2/2     Running   7 (23h ago)   24h 
   ``` 

   Verify the Replication Controller pod is running in the source opeshift cluster
   
   ```bash
   oc get pod -n dell-replication-controller
   NAME                                                   READY   STATUS    RESTARTS      AGE
   dell-replication-controller-manager-795cd7fbd6-w8wkn   1/1     Running   2 (19h ago)   22h 
   ```

10. Create Storage Class 
    
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
    
    Verify Storage Class is created: 

    ```terminal
    oc get storageclass isilon
  
    NAME                    PROVISIONER                    RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION    AGE
    isilon (default)        csi-isilon.dellemc.com         Delete          Immediate           true                    3h8m
    ``` 
