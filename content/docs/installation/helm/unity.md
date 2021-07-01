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

* Install Kubernetes or OpenShift (see [supported versions](../../../dell-csi-driver/#features-and-capabilities))
* Install Helm v3
* To use FC protocol, the host must be zoned with Unity array and Multipath needs to be configured
* To use iSCSI protocol, iSCSI initiator utils packages needs to be installed and Multipath needs to be configured 
* To use NFS protocol, NFS utility packages needs to be installed
* Mount propagation is enabled on container runtime that is being used

## Install CSI Driver

Install CSI Driver for Unity using this procedure.

*Before you begin*

 * You must have the downloaded files, including the Helm chart from the source [git repository](https://github.com/dell/csi-unity) with the command ```git clone https://github.com/dell/csi-unity.git```, ready for this procedure.
 * In the top-level dell-csi-helm-installer directory, there should be two scripts, `csi-install.sh` and `csi-uninstall.sh`.
 * Ensure _unity_ namespace exists in Kubernetes cluster. Use the `kubectl create namespace unity` command to create the namespace if the namespace is not present.
   
   

Procedure

1. Collect information from the Unity Systems like Unique ArrayId, IP address, username, and password. Make a note of the value for these parameters as they must be entered in the `secret.json` or `secret.yaml` and `myvalues.yaml` file.

    **Note**: 
      * ArrayId corresponds to the serial number of Unity array.
      * Unity Array username must have role as Storage Administrator to be able to perform CRUD operations.

2. Copy the `helm/csi-unity/values.yaml` into a file named `myvalues.yaml` in the same directory of `csi-install.sh`, to customize settings for installation.

3. Edit `myvalues.yaml` to set the following parameters for your installation:
   
    The following table lists the primary configurable parameters of the Unity driver chart and their default values. More detailed information can be found in the [`values.yaml`](https://github.com/dell/csi-unity/blob/master/helm/csi-unity/values.yaml) file in this repository.
    
    | Parameter | Description | Required | Default |
    | --------- | ----------- | -------- |-------- |
    | certSecretCount | Represents the number of certificate secrets, which the user is going to create for SSL authentication. (unity-cert-0..unity-cert-n). The minimum value should be 1. | false | 1 |
    | controllerCount | Controller replication count to maintain high availability. | yes | 2 |
    | volumeNamePrefix | String to prepend to any volumes created by the driver. | false | csivol |
    | snapNamePrefix | String to prepend to any snapshot created by the driver. | false | csi-snap |
    | imagePullPolicy |  The default pull policy is IfNotPresent which causes the Kubelet to skip pulling an image if it already exists. | false | IfNotPresent |
    | allowRWOMultiPodAccess | Flag to enable multiple pods to use the same PVC on the same node with RWO access mode. | false | false |
	| syncNodeInfoInterval | Time interval to add node info to the array. Default 15 minutes. The minimum value should be 1 minute. | false | 15 |
   

    **Note**: 
    
      * User should provide all boolean values with double-quotes. This applies only for `myvalues.yaml`. Example: "true"/"false"
        
      * controllerCount parameter value should be <= number of nodes in the kubernetes cluster else install script fails.
        
      * User can a create separate _StorageClass_ (with topology-related keys) by referring to existing default storage classes.

      * Host IO Limit must have a minimum bandwidth of 1 MBPS to discover the volumes on node successfully.
      
      * User must not change the value of allowRWOMultiPodAccess to true unless intended to use the feature and is aware of the consequences. Enabling multiple pods to access the same PVC with RWO access mode on the same node might cause data to be overwritten and therefore leading to data loss in some cases.
	  
	    * Parameters allowRWOMultiPodAccess and syncNodeInfoInterval have been deprecated from `myvalues.yaml` and are removed from `myvalues.yaml` in a future releases. They can be configured in `secret.json` or `secret.yaml` as they facilitate the user to dynamically change these values without the need for driver re-installation.
    

   Example *myvalues.yaml*
   
    ```yaml
    csiDebug: "true"
    volumeNamePrefix : csivol
    snapNamePrefix: csi-snap
    imagePullPolicy: Always
    certSecretCount: 1
    controllerCount: 2
    allowRWOMultiPodAccess: false
    syncNodeInfoInterval: 5
    ```
   
4. For certificate validation of Unisphere REST API calls refer [here](#certificate-validation-for-unisphere-rest-api-calls). Otherwise, create an empty secret with file `helm/emptysecret.yaml` file by running the `kubectl create -f helm/emptysecret.yaml` command.

5. Prepare the `secret.json` or `secret.yaml`  for driver configuration.
    The following table lists driver configuration parameters for multiple storage arrays.
    
    | Parameter | Description | Required | Default |
    | --------- | ----------- | -------- |-------- |
    | storageArrayList.username | Username for accessing Unity system  | true | - |
    | storageArrayList.password | Password for accessing Unity system  | true | - |
    | storageArrayList.endpoint | REST API gateway HTTPS endpoint Unity system| true | - |
    | storageArrayList.arrayId | ArrayID for Unity system | true | - |
    | storageArrayList.skipCertificateValidation | "skipCertificateValidation " determines if the driver is going to validate unisphere certs while connecting to the Unisphere REST API interface. If it is set to false, then a secret unity-certs has to be created with an X.509 certificate of CA which signed the Unisphere certificate. | true | true |
    | storageArrayList.isDefault | An array having isDefault=true or isDefaultArray=true will be considered as the default array when arrayId is not specified in the storage class. This parameter should occur only once in the list. | false | false |
	| logLevel | This parameter is used to set the logging level in the driver. Log level can be Info/Debug/Warn/Error. | false | Info |
	| allowRWOMultiPodAccess | Flag to enable multiple pods to use the same PVC on the same node with RWO access mode. | false | false |
	| syncNodeInfoInterval | Time interval to add node info to array. Default 15 minutes. Minimum value should be 1 minute. | false | 15 |
	| maxUnityVolumesPerNode | The maximum number of volumes that can be provisioned to a single node beyond which the driver would return an error on a provisioning request. Default value 0 stands for unlimited volumes. | false | 0 |
    
    Example: secret.json
    ```json
       {
         "storageArrayList": [
           {
             "username": "user",
             "password": "password",
             "endpoint": "https://10.1.1.1",
             "arrayId": "APM00******1",
             "skipCertificateValidation": true,
             "isDefaultArray": true
           },
           {
             "username": "user",
             "password": "password",
             "endpoint": "https://10.1.1.2",
             "arrayId": "APM00******2",
             "skipCertificateValidation": true
           }
         ],
		  "logLevel": "Info",
		  "allowRWOMultiPodAccess": false,
		  "syncNodeInfoTimeInterval": 15,
		  "maxUnityVolumesPerNode": 0
       }
    ```
    
	Use the following command to create a new secret unity-creds from `secret.json` file.
	
    `kubectl create secret generic unity-creds -n unity --from-file=config=secret.json`
    
    Use the following command to replace or update the secret:
    
    `kubectl create secret generic unity-creds -n unity --from-file=config=secret.json -o yaml --dry-run | kubectl replace -f -`
    
    **Note**: The user needs to validate the JSON syntax and array-related key/values while replacing the unity-creds secret.
    The driver will continue to use previous values in case of an error found in the JSON file.
	
	
	Alternatively, users can configure and use `secret.yaml` for driver configuration. The parameters remain the same as in the above table and below is a sample of `secret.yaml`. Samples of both `secret.json` and `secret.yaml` are available in the directory `csi-unity/helm/samples`.
	
	Example: secret.yaml
	```yaml
    logLevel: "Info"
    syncNodeInfoInterval: 15                                   
    allowRWOMultiPodAccess: "false"                                  
    maxUnityVolumesPerNode: 0
    storageArrayList:
    - arrayId: "APM00******1"
      username: "user"
      password: "password"
      endpoint: "https://10.1.1.1/"
      skipCertificateValidation: true
      isDefault: true
    
    - arrayId: "APM00******2"
      username: "user"
      password: "password"
      endpoint: "https://10.1.1.2/"
      skipCertificateValidation: true

	```

	Use the following command to create a new secret unity-creds from secret.yaml file.
	
    ```kubectl create secret generic unity-creds -n unity --from-file=config=secret.yaml```
    
    Use the following command to replace or update the secret:
    
    ```kubectl create secret generic unity-creds -n unity --from-file=config=secret.yaml --dry-run | kubectl replace -f -```
	
    
      **Note:**
      
      * "restGateway" parameter has been changed to "endpoint" as restgateway is deprecated and will be removed from use in secret.json or secret.yaml in a future release. Users can continue to use any one of "restGateway" or "endpoint" for now. The driver would return an error if both parameters are used.
    
      * "insecure" parameter has been changed to "skipCertificateValidation" as insecure is deprecated and will be removed from use in secret.json or secret.yaml in a future release. Users can continue to use any one of "insecure" or "skipCertificateValidation" for now. The driver would return an error if both parameters are used.
    
      * "isDefaultArray" parameter has been changed to "isDefault" as isDefaultArray is deprecated and will be removed from use in secret.json or secret.yaml in a future release. Users can continue to use any one of "isDefaultArray" or "isDefault" for now. The driver would return error if both parameters are used.
    
      * Parameters "allowRWOMultiPodAccess" and "syncNodeInfoTimeInterval" have been enabled for configuration in secret.json or secret.yaml and this helps users to dynamically change these values without the need for driver re-installation. If these parameters are specified in `myvalues.yaml` as well as here then the values from secret.json / secret.yaml takes precedence and they will reflect in the driver after unity-creds secret is updated.

6. Setup for snapshots.
         
   The Kubernetes Volume Snapshot feature is beta in Kubernetes 1.19 and moved to GA in >=v1.20.

   * The following section summarizes the changes in the **[GA](<https://kubernetes.io/blog/2020/12/10/kubernetes-1.20-volume-snapshot-moves-to-ga/>)** 
   Applicable only if you decided to enable snapshot feature in `values.yaml`

    ```yaml
    snapshot:
    enabled: true
    ```

   In order to use the Kubernetes Volume Snapshot feature, you must ensure the following components have been deployed on your Kubernetes cluster

    #### Volume Snapshot CRD's
    The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on Github.
    - If on Kubernetes 1.19 (beta snapshots) use [v3.0.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.3/client/config/crd)
    - If on Kubernetes 1.20/1.21 (v1 snapshots) use [v4.0.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.0.0/client/config/crd)

    #### Volume Snapshot Controller
    The beta Volume Snapshots in Kubernetes version 1.17 and later, the CSI external-snapshotter sidecar is split into two controllers:
    - A common snapshot controller
    - A CSI external-snapshotter sidecar

    The common snapshot controller must be installed only once in the cluster irrespective of the number of CSI drivers installed in the cluster. On OpenShift clusters 4.4 and later, the common snapshot-controller is pre-installed. In the clusters where it is not present, it can be installed using `kubectl` and the manifests are available:
    - If on Kubernetes 1.19 (beta snapshots) use [v3.0.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.3/deploy/kubernetes/snapshot-controller)
    - If on Kubernetes 1.20 and 1.21 (v1 snapshots) use [v4.0.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.0.0/deploy/kubernetes/snapshot-controller)

    **Note**:
    - The manifests available on GitHub install the snapshotter image: 
      - [quay.io/k8scsi/csi-snapshotter:v3.0.x](https://quay.io/repository/k8scsi/csi-snapshotter?tag=v3.0.3&tab=tags)
      - [quay.io/k8scsi/csi-snapshotter:v4.0.x](https://quay.io/repository/k8scsi/csi-snapshotter?tag=v4.0.0&tab=tags)
    - The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

    #### Installation example 

    You can install CRDs and default snapshot controller by running following commands:
    ```bash
    git clone https://github.com/kubernetes-csi/external-snapshotter/
    cd ./external-snapshotter
    git checkout release-<your-version>
    kubectl create -f client/config/crd
    kubectl create -f deploy/kubernetes/snapshot-controller
    ```

    **Note**:
    - It is recommended to use 3.0.x version of snapshotter/snapshot-controller when using Kubernetes 1.19
    - When using Kubernetes 1.20/1.21 it is recommended to use 4.0.x version of snapshotter/snapshot-controller.
    - The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

              

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
    Results:

    At the end of the script unity-controller Deployment and DaemonSet unity-node will be ready, execute command `kubectl get pods -n unity` to get the status of the pods and you will see the following:
    
    * One or more Unity Controller (based on controllerCount) with 5/5 containers ready, and status displayed as Running.
    * Agent pods with 2/2 containers and the status displayed as Running.
    
    The script also creates one or more volumesnapshotclasses based on the number of arrays . "unity-snapclass" will be the volumesnapshotclass for the default array. The output will be similar to the following:
    
    `[root@host ~]# kubectl get volumesnapshotclass
    NAME                             AGE
    unity-apm***********-snapclass   12m
    unity-snapclass                  12m`

## Certificate validation for Unisphere REST API calls 

This topic provides details about setting up the certificate validation for the CSI Driver for Dell EMC Unity.

*Before you begin*

As part of the CSI driver installation, the CSI driver requires a secret with the name unity-certs-0 to unity-certs-n based on the ".Values.certSecretCount" parameter present in the namespace unity.

This secret contains the X509 certificates of the CA which signed the Unisphere SSL certificate in PEM format.

If the install script does not find the secret, it creates one empty secret with the name unity-certs-0.

The CSI driver exposes an install parameter in secret.json, which is like storageArrayList[i].insecure, which determines if the driver performs client-side verification of the Unisphere certificates.

The storageArrayList[i].insecure parameter set to true by default, and the driver does not verify the Unisphere certificates.

If the storageArrayList[i].insecure set to false, then the secret unity-certs-n must contain the CA certificate for Unisphere.

If this secret is an empty secret, then the validation of the certificate fails, and the driver fails to start.

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


	  **Note:**
	
		* "unity" is the namespace for helm-based installation but namespace can be user-defined in operator-based installation.

		* User can add multiple certificates in the same secret. The certificate file should not exceed more than 1Mb due to Kubernetes secret size limitation.

		* Whenever certSecretCount parameter changes in `myvalues.yaml` user needs to uninstall and install the driver.


## Storage Classes

Storage Classes are an essential Kubernetes construct for Storage provisioning. To know more about Storage Classes, refer to https://kubernetes.io/docs/concepts/storage/storage-classes/

A wide set of annotated storage class manifests have been provided in the [helm/samples/storageclass folder](https://github.com/dell/csi-unity/tree/master/helm/samples/storageclass). Use these samples to create new storage classes to provision storage.

For CSI Driver for Unity version 1.6 and later, `dell-csi-helm-installer` does not create any storage classes as part of the driver installation. A wide set of annotated storage class manifests have been provided in the `csi-unity/helm/samples/storageclass` folder. Use these samples to create new storage classes to provision storage.

### What happens to my existing storage classes?

*Upgrading from CSI Unity v1.5 driver*
The storage classes created as part of the installation have an annotation - "helm.sh/resource-policy": keep set. This ensures that even after an uninstall or upgrade, the storage classes are not deleted. You can continue using these storage classes if you wish so.

*Upgrading from an older version of the driver*
It is strongly recommended to upgrade the earlier versions of CSI Unity to 1.5 before upgrading to 1.6.

**Steps to create storage class:**
There are samples storage class yaml files available under `helm/samples/storageclass`.  These can be copied and modified as needed.

1. Pick any of `unity-fc.yaml`, `unity-iscsi.yaml` or `unity-nfs.yaml`
2. Copy the file as `unity-<ARRAY_ID>-fc.yaml`, `unity-<ARRAY_ID>-iscsi.yaml` or `unity-<ARRAY_ID>-nfs.yaml`
3. Replace `<ARRAY_ID>` with the Array Id of the Unity Array to be used
4. Replace `<STORAGE_POOL>` with the storage pool you have
5. Replace `<TIERING_POLICY>` with the Tiering policy that is to be used for provisioning
6. Replace `<HOST_IO_LIMIT_NAME>` with the Host IO Limit Name that is to be used for provisioning
7. Replace `<mountOption1>` with the necessary mount options. If not required, this can be removed from the storage class
8. Edit `storageclass.kubernetes.io/is-default-class` to true if you want to set it as default, otherwise false. 
9. Save the file and create it by using `kubectl create -f unity-<ARRAY_ID>-fc.yaml` or `kubectl create -f unity-<ARRAY_ID>-iscsi.yaml` or `kubectl create -f unity-<ARRAY_ID>-nfs.yaml`


**Note**: 
- At least one storage class is required for one array.
- If you uninstall the driver and reinstall it, you can still face errors if any update in the `values.yaml` file leads to an update of the storage class(es):

```
    Error: cannot patch "<sc-name>" with kind StorageClass: StorageClass.storage.k8s.io "<sc-name>" is invalid: parameters: Forbidden: updates to parameters are forbidden
```

In case you want to make such updates, ensure to delete the existing storage classes using the `kubectl delete storageclass` command.  
Deleting a storage class has no impact on a running Pod with mounted PVCs. You cannot provision new PVCs until at least one storage class is newly created.


## Dynamically update the unity-creds secrets

Users can dynamically add delete array information from secret. Whenever an update happens the driver updates the "Host" information in an array.
User can update secret using the following command:
```
    kubectl create secret generic unity-creds -n unity --from-file=config=secret.json -o yaml --dry-run=client | kubectl replace -f -
```
**Note**: Updating unity-certs-x secrets is a manual process, unlike unity-creds. Users have to re-install the driver in case of updating/adding the SSL certificates or changing the certSecretCount parameter.
