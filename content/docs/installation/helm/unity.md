---
title: Unity
description: >
  Installing Unity CSI Driver via Helm
---

The CSI Driver for Dell EMC Unity can be deployed by using the provided Helm v3 charts and installation scripts on both Kubernetes and OpenShift platforms. For more detailed information on the installation scripts, review the script [documentation](https://github.com/dell/csi-unity/tree/master/dell-csi-helm-installer).

The controller section of the Helm chart installs the following components in a _Deployment_:

- CSI Driver for Unity
- Kubernetes External Provisioner, which provisions the volumes
- Kubernetes External Attacher, which attaches the volumes to the containers
- Kubernetes External Snapshotter, which provides snapshot support
- Kubernetes External Resizer, which resizes the volume

The node section of the Helm chart installs the following component in a _DaemonSet_:

- CSI Driver for Unity
- Kubernetes Node Registrar, which handles the driver registration

## Prerequisites

Before you install CSI Driver for Unity, verify the requirements that are mentioned in this topic are installed and configured.

### Requirements

* Install Kubernetes (see [supported versions](../../../dell-csi-driver/))
* Configure Docker service
* Install Helm v3
* To use FC protocol, host must be zoned with Unity array
* To use iSCSI protocol, iSCSI initiator utils packages needs to be installed
* To use NFS protocol, NFS utility packages needs to be installed

## Configure Docker service

The mount propagation in Docker must be configured on all Kubernetes nodes before installing CSI Driver for Unity.

### Procedure

1. Edit the service section of */etc/systemd/system/multi-user.target.wants/docker.service* file as follows:

    ```bash
    [Service]
    ...
    MountFlags=shared
    ```
    
2. Restart the Docker service with following commands:

    ```bash
    systemctl daemon-reload
    systemctl restart docker
    ```

## Install CSI Driver

Install CSI Driver for Unity using this procedure.

*Before you begin*

 * You must have the downloaded files, including the Helm chart from the source [git repository](https://github.com/dell/csi-unity), ready for this procedure.
 * In the top-level dell-csi-helm-installer directory, there should be two scripts, *csi-install.sh* and *csi-uninstall.sh*.
 * Ensure "unity" namespace exists in kubernetes cluster. Use `kubectl create namespace unity` command to create the namespace, if the namespace is not present.
   
   

Procedure

1. Collect information from the Unity Systems like Unique ArrayId, IP address, username  and password. Make a note of the value for these parameters as they must be entered in the secret.json and myvalues.yaml file.

2. Copy the csi-unity/values.yaml into a file named myvalues.yaml in the same directory of csi-install.sh, to customize settings for installation.

3. Edit myvalues.yaml to set the following parameters for your installation:
   
    The following table lists the primary configurable parameters of the Unity driver chart and their default values. More detailed information can be found in the [`values.yaml`](helm/csi-unity/values.yaml) file in this repository.
    
    | Parameter | Description | Required | Default |
    | --------- | ----------- | -------- |-------- |
    | certSecretCount | Represents number of certificate secrets, which user is going to create for ssl authentication. (unity-cert-0..unity-cert-n). Minimum value should be 1 | false | 1 |
    | syncNodeInfoInterval | Time interval to add node info to array. Default 15 minutes. Minimum value should be 1 minute | false | 15 |
    | controllerCount | Controller replication count to maintain high availability | yes | 2 |
    | volumeNamePrefix | String to prepend to any volumes created by the driver | false | csivol |
    | snapNamePrefix | String to prepend to any snapshot created by the driver | false | csi-snap |
    | csiDebug |  To set the debug log policy for CSI driver | false | "false" |
    | imagePullPolicy |  The default pull policy is IfNotPresent which causes the Kubelet to skip pulling an image if it already exists. | false | IfNotPresent |
    | createStorageClassesWithTopology | Flag to enable or disable topology. | true | false |
    | allowRWOMultiPodAccess | Flag to enable multiple pods use the same pvc on the same node with RWO access mode. | false | false |
    | ***Storage Array List*** | Following parameters is a list of parameters to provide multiple storage arrays |||
    | storageArrayList[i].name | Name of the storage class to be defined. A suffix of ArrayId and protocol will be added to the name. No suffix will be added to default array. | false | unity |
    | storageArrayList[i].isDefaultArray | To handle the existing volumes created in csi-unity v1.0, 1.1 and 1.1.0.1. The user needs to provide "isDefaultArray": true in secret.json. This entry should be present only for one array and that array will be marked default for existing volumes. | false | "false" |
    | ***Storage Class parameters*** | Following parameters are not present in values.yaml |||
    | storageArrayList[i].storageClass.storagePool | Unity Storage Pool CLI ID to use with in the Kubernetes storage class | true | - |
    | storageArrayList[i].storageClass.thinProvisioned | To set volume thinProvisioned | false | "true" |
    | storageArrayList[i].storageClass.isDataReductionEnabled | To set volume data reduction | false | "false" |
    | storageArrayList[i].storageClass.volumeTieringPolicy | To set volume tiering policy | false | 0 |
    | storageArrayList[i].storageClass.FsType | Block volume related parameter. To set File system type. Possible values are ext3,ext4,xfs. Supported for FC/iSCSI protocol only. | false | ext4 |
    | storageArrayList[i].storageClass.hostIOLimitName | Block volume related parameter.  To set unity host IO limit. Supported for FC/iSCSI protocol only. | false | "" |
    | storageArrayList[i].storageClass.nasServer | NFS related parameter. NAS Server CLI ID for filesystem creation. | true | "" |
    | storageArrayList[i].storageClass.hostIoSize | NFS related parameter. To set filesystem host IO Size. | false | "8192" |
    | storageArrayList[i].storageClass.reclaimPolicy | What should happen when a volume is removed | false | Delete |
    | ***Snapshot Class parameters*** | Following parameters are not present in values.yaml  |||
    | storageArrayList[i] .snapshotClass.retentionDuration | TO set snapshot retention duration. Format:"1:23:52:50" (number of days:hours:minutes:sec)| false | "" |
   

    **Note**: 
    
      * User should provide all boolean values with double quotes. This applicable only for myvalues.yaml. Example: "true"/"false"
        
      * controllerCount parameter value should be <= number of nodes in the kubernetes cluster else install script fails.
        
      * 'createStorageClassesWithTopology' key  is applicable  only in the helm based installation but not with the operator based installation. In operator based installation, however user can create custom storage class with topology related key/values.
        
      * User can create separate storage class (with topology related keys) by referring to existing default storageclasses.

      * Host IO Limit must have a minimum bandwidth of 1 MBPS to discover the volumes on node successfully.
      
      * User must not change the value of allowRWOMultiPodAccess to true unless intended to use the feature and is aware of the consequences. Enabling multiple pods access the same pvc with RWO access mode on the same node might cause data to be overwritten and therefore leading to data loss in some cases.
    

   Example *myvalues.yaml*
   
    ```yaml
    csiDebug: "true"
    volumeNamePrefix : csivol
    snapNamePrefix: csi-snap
    imagePullPolicy: Always
    certSecretCount: 1
    syncNodeInfoInterval: 5
    controllerCount: 2
    createStorageClassesWithTopology: true
    allowRWOMultiPodAccess: false
    storageClassProtocols:
       - protocol: "FC"
       - protocol: "iSCSI"
       - protocol: "NFS"
    storageArrayList:
       - name: "APM00******1"
         isDefaultArray: "true"
         storageClass:
           storagePool: pool_1
           FsType: ext4
           nasServer: "nas_1"
           thinProvisioned: "true"
           isDataReductionEnabled: true
           hostIOLimitName: "value_from_array"
           tieringPolicy: "2"
         snapshotClass:
           retentionDuration: "2:2:23:45"
       - name: "APM001******2"
         storageClass:
           storagePool: pool_1
           reclaimPolicy: Delete
           hostIoSize: "8192"
           nasServer: "nasserver_2"
    ```
   
4. Create an empty secret by navigating to helm folder that contains emptysecret.yaml file and running the kubectl create -f emptysecret.yaml command.

5. Prepare the secret.json for driver configuration.
    The following table lists driver configuration parameters for multiple storage arrays.
    
    | Parameter | Description | Required | Default |
    | --------- | ----------- | -------- |-------- |
    | username | Username for accessing unity system  | true | - |
    | password | Password for accessing unity system  | true | - |
    | restGateway | REST API gateway HTTPS endpoint Unity system| true | - |
    | arrayId | ArrayID for unity system | true | - |
    | insecure | "unityInsecure" determines if the driver is going to validate unisphere certs while connecting to the Unisphere REST API interface. If it is set to false, then a secret unity-certs has to be created with a X.509 certificate of CA which signed the Unisphere certificate | true | true |
    | isDefaultArray | An array having isDefaultArray=true is for backward compatibility. This parameter should occur once in the list. | false | false |
    
    Example: secret.json
    ```json
       {
         "storageArrayList": [
           {
             "username": "user",
             "password": "password",
             "restGateway": "https://10.1.1.1",
             "arrayId": "APM00******1",
             "insecure": true,
             "isDefaultArray": true
           },
           {
             "username": "user",
             "password": "password",
             "restGateway": "https://10.1.1.2",
             "arrayId": "APM00******2",
             "insecure": true
           }
         ]
       }
    ```
    
    `kubectl create secret generic unity-creds -n unity --from-file=config=secret.json`
    
    Use the following command to replace or update the secret:
    
    `kubectl create secret generic unity-creds -n unity --from-file=config=secret.json -o yaml --dry-run | kubectl replace -f -`
    
    **Note**: The user needs to validate the JSON syntax and array related key/values while replacing the unity-creds secret.
    The driver will continue to use previous values in case of an error found in the JSON file.
    
    **Note**: "isDefaultArray" parameter in values.yaml and secret.json should match each other. 

6. Setup for snapshots.
         
   The Kubernetes Volume Snapshot feature is beta in Kubernetes v1.18 and v1.19 and move to GA in v1.20.

   * The following section summarizes the changes in the **[GA](<https://kubernetes.io/blog/2020/12/10/kubernetes-1.20-volume-snapshot-moves-to-ga/>)** 

   In order to use the Kubernetes Volume Snapshot feature, you must ensure the following components have been deployed on your Kubernetes cluster.

    1. Install Snapshot CRDs: 
   
          For Kubernetes 1.18 and 1.19, Snapshot CRDs versioned  3.0.3 must be installed.
          **[CRDs](<https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.3/client/config/crd>)**

          For Kubernetes 1.20 , Snapshot CRDs versioned 4.0.0 must be installed.
          **[CRDs](<https://github.com/kubernetes-csi/external-snapshotter/tree/v4.0.0/client/config/crd>)**

    2. Install Snapshot Controller:
   
          For Kubernetes 1.18 and 1.19, Snapshot Controller versioned 3.0.3 must be installed.
          **[Controller](https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.3/deploy/kubernetes/snapshot-controller)**
          
          For Kubernetes 1.20, Snapshot Controller versioned 4.0.0 must be installed.   
          **[Controller](<https://github.com/kubernetes-csi/external-snapshotter/tree/v4.0.0/deploy/kubernetes/snapshot-controller>)**
          

7. Run the `./csi-install.sh --namespace unity --values ./myvalues.yaml` command to proceed with the installation.

    A successful installation must display messages that look similar to the following samples:
    ```
    ------------------------------------------------------
    > Installing CSI Driver: csi-unity on 1.20
    ------------------------------------------------------
    ------------------------------------------------------
    > Checking to see if CSI Driver is already installed
    ------------------------------------------------------
    ------------------------------------------------------
    > Verifying Kubernetes and driver configuration
    ------------------------------------------------------
    |- Kubernetes Version: 1.20
    |
    |- Driver: csi-unity                                                
    |
    |- Verifying Kubernetes versions                                    
      |
      |--> Verifying minimum Kubernetes version                         Success
      |
      |--> Verifying maximum Kubernetes version                         Success
    |
    |- Verifying that required namespaces have been created             Success
    |
    |- Verifying that required secrets have been created                Success
    |
    |- Verifying that required secrets have been created                Success
    |
    |- Verifying alpha snapshot resources                               
      |
      |--> Verifying that alpha snapshot CRDs are not installed         Success
    |
    |- Verifying sshpass installation..                                 |
    |- Verifying iSCSI installation                                     
    Enter the root password of 10.**.**.**: 
    
    Enter the root password of 10.**.**.**: 
    Success
    |
    |- Verifying snapshot support                                       
      |
      |--> Verifying that snapshot CRDs are available                   Success
      |
      |--> Verifying that the snapshot controller is available          Success
    |
    |- Verifying helm version                                           Success
    
    ------------------------------------------------------
    > Verification Complete - Success
    ------------------------------------------------------
    |
    |- Installing Driver                                                Success
      |
      |--> Waiting for Deployment unity-controller to be ready          Success
      |
      |--> Waiting for DaemonSet unity-node to be ready                 Success
    ------------------------------------------------------
    > Operation complete
    ------------------------------------------------------
    ```
    Results
    At the end of the script unity-controller Deployment and DaemonSet unity-node will be ready, execute command **kubectl get pods -n unity** to get the status of the pods and you will see the following:
    
    * One or more Unity Controller (based on controllerCount) with 5/5 containers ready, and status displayed as Running.
    * Agent pods with 2/2 containers and the status displayed as Running.
    
    Finally, the script creates storageclasses such as, "unity". Additional storage classes can be created for different combinations of file system types and Unity storage pools. 
    
    The script also creates one or more volumesnapshotclasses based on number of arrays . "unity-snapclass" will be the volumesnapshotclass for default array. The output will be similar to following:
    
    `[root@host ~]# kubectl get volumesnapshotclass
    NAME                             AGE
    unity-apm***********-snapclass   12m
    unity-snapclass                  12m`

## Certificate validation for Unisphere REST API calls 

This topic provides details about setting up the certificate validation for the CSI Driver for Dell EMC Unity.

*Before you begin*

As part of the CSI driver installation, the CSI driver requires a secret with the name unity-certs-0 to unity-certs-n based on ".Values.certSecretCount" parameter present in the namespace unity.

This secret contains the X509 certificates of the CA which signed the Unisphere SSL certificate in PEM format.

If the install script does not find the secret, it creates one empty secret with the name unity-certs-0.

The CSI driver exposes an install parameter in secret.json, which is like storageArrayList[i].insecure, which determines if the driver performs client-side verification of the Unisphere certificates.

The storageArrayList[i].insecure parameter set to true by default, and the driver does not verify the Unisphere certificates.

If the storageArrayList[i].insecure set to false, then the secret unity-certs-n must contain the CA certificate for Unisphere.

If this secret is empty secret, then the validation of the certificate fails, and the driver fails to start.

If the storageArrayList[i].insecure parameter set to false and a previous installation attempt created the empty secret, then this secret must be deleted and re-created using the CA certs.

If the Unisphere certificate is self-signed or if you are using an embedded Unisphere, then perform the following steps.

   1. To fetch the certificate, run the following command.
      `openssl s_client -showcerts -connect <Unisphere IP:Port> </dev/null 2>/dev/null | openssl x509 -outform PEM > ca_cert_0.pem`
      Example: openssl s_client -showcerts -connect 1.1.1.1:443 </dev/null 2>/dev/null | openssl x509 -outform PEM > ca_cert_0.pem
   2. Run the following command to create the cert secret with index '0':
         `kubectl create secret generic unity-certs-0 --from-file=cert-0=ca_cert_0.pem -n unity`
      Use the following command to replace the secret:
          `kubectl create secret generic unity-certs-0 -n unity --from-file=cert-0=ca_cert_0.pem -o yaml --dry-run | kubectl replace -f -` 
   3. Repeat step 1 and 2 to create multiple cert secrets with incremental index (example: unity-certs-1, unity-certs-2, etc)

**Note**: "unity" is the namespace for helm based installation but namespace can be user defined in operator based installation.

**Note**: User can add multiple certificates in the same secret. The certificate file should not exceed more than 1Mb due to kubernetes secret size limitation.

**Note**: Whenever certSecretCount parameter changes in myvalues.yaml user needs to uninstall and install the driver.

## Storage Classes

As part of the driver installation, a set of storage classes is created along with the driver pods. This is done to demonstrate how storage classes need to be created to consume storage from Dell EMC storage arrays.

The StorageClass object in Kubernetes is immutable and cannot be modified once created. It creates challenges when we need to change or update a parameter, for example when a version of the driver introduces new configurable parameters for the storage classes. To avoid issues during upgrades, future releases of the drivers will have the installation separated from the creation of Storage Classes. In preparation for that, starting from CSI Unity v1.5, an annotation "helm.sh/resource-policy": keep is applied to the storage classes created by the dell-csi-helm-installer.

Because of this annotation, these storage classes are not going to be deleted even after the driver has been uninstalled. This annotation has been applied to give you an opportunity to keep using these storage classes even with a future release of the driver. In case you wish to not use these storage classes, you will need to delete them by using the kubectl delete storageclass command.

**Note**: If you uninstall the driver and reinstall it, you can still face errors if any update in the values.yaml file leads to an update of the storage class(es):

```
Error: cannot patch "<sc-name>" with kind StorageClass: StorageClass.storage.k8s.io "<sc-name>" is invalid: parameters: Forbidden: updates to parameters are forbidden
	
```

In case you want to make such updates, ensure to delete the existing storage classes using the kubectl delete storageclass command.
Deleting a storage class has no impact on a running Pod with mounted PVCs. You will not be able to provision new PVCs until at least one storage class is newly created.

## Dynamically update the unity-creds secrets

Users can dynamically add delete array information from secret. Whenever an update happens the driver updates the "Host" information in an array.
User can update secret using the following command:

    `kubectl create secret generic unity-creds -n unity --from-file=config=secret.json -o yaml --dry-run=client | kubectl replace -f - `

**Note**: Updating unity-certs-x secrets is a manual process, unlike unity-creds. Users have to re-install the driver in case of updating/adding the SSL certificates or changing the certSecretCount parameter.
