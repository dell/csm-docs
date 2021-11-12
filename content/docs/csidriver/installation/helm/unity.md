---
title: Unity
description: >
  Installing CSI Driver for Unity via Helm
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

* Install Kubernetes or OpenShift (see [supported versions](../../../../csidriver/#features-and-capabilities))
* Install Helm v3
* To use FC protocol, the host must be zoned with Unity array and Multipath needs to be configured
* To use iSCSI protocol, iSCSI initiator utils packages needs to be installed and Multipath needs to be configured 
* To use NFS protocol, NFS utility packages needs to be installed
* Mount propagation is enabled on container runtime that is being used

## Install CSI Driver

Install CSI Driver for Unity using this procedure.

*Before you begin*

 * You must have the downloaded files, including the Helm chart from the source [git repository](https://github.com/dell/csi-unity) with the command ```git clone -b v2.0.0 https://github.com/dell/csi-unity.git```, ready for this procedure.
 * In the top-level dell-csi-helm-installer directory, there should be two scripts, `csi-install.sh` and `csi-uninstall.sh`.
 * Ensure _unity_ namespace exists in Kubernetes cluster. Use the `kubectl create namespace unity` command to create the namespace if the namespace is not present.
   
   

Procedure

1. Collect information from the Unity Systems like Unique ArrayId, IP address, username, and password. Make a note of the value for these parameters as they must be entered in the  `secret.yaml` and `myvalues.yaml` file.

    **Note**: 
      * ArrayId corresponds to the serial number of Unity array.
      * Unity Array username must have role as Storage Administrator to be able to perform CRUD operations.

2. Copy the `helm/csi-unity/values.yaml` into a file named `myvalues.yaml` in the same directory of `csi-install.sh`, to customize settings for installation.

3. Edit `myvalues.yaml` to set the following parameters for your installation:
   
    The following table lists the primary configurable parameters of the Unity driver chart and their default values. More detailed information can be found in the [`values.yaml`](https://github.com/dell/csi-unity/blob/master/helm/csi-unity/values.yaml) file in this repository.
    
    | Parameter | Description | Required | Default |
    | --------- | ----------- | -------- |-------- |
    | version | helm version | true | - |
    | logLevel | LogLevel is used to set the logging level of the driver | true | info |
    | allowRWOMultiPodAccess | Flag to enable multiple pods to use the same PVC on the same node with RWO access mode. | false | false |
    | kubeletConfigDir | Specify kubelet config dir path | Yes | /var/lib/kubelet |
	  | syncNodeInfoInterval | Time interval to add node info to the array. Default 15 minutes. The minimum value should be 1 minute. | false | 15 |
    | maxUnityVolumesPerNode | Maximum number of volumes that controller can publish to the node. | false | 0 |
    | certSecretCount | Represents the number of certificate secrets, which the user is going to create for SSL authentication. (unity-cert-0..unity-cert-n). The minimum value should be 1. | false | 1 |
    | imagePullPolicy |  The default pull policy is IfNotPresent which causes the Kubelet to skip pulling an image if it already exists. | Yes | IfNotPresent |
    | podmon.enabled | service to monitor failing jobs and notify | false | - |
    | podmon.image| pod man image name | false | - |
    | **controller** | Allows configuration of the controller-specific parameters.| - | - |
    | controllerCount | Defines the number of csi-powerscale controller pods to deploy to the Kubernetes release| Yes | 2 |
    | volumeNamePrefix | Defines a string prefix for the names of PersistentVolumes created | Yes | "k8s" |
    | snapshot.enabled | Enable/Disable volume snapshot feature | Yes | true |
    | snapshot.snapNamePrefix | Defines a string prefix for the names of the Snapshots created | Yes | "snapshot" |
    | resizer.enabled | Enable/Disable volume expansion feature | Yes | true |
    | nodeSelector | Define node selection constraints for pods of controller deployment | No | |
    | tolerations | Define tolerations for the controller deployment, if required | No | |
    | ***node*** | Allows configuration of the node-specific parameters.| - | - |
    | tolerations | Define tolerations for the node daemonset, if required | No | |
    | dnsPolicy | Define the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |



    **Note**: 
    
      * User should provide all boolean values with double-quotes. This applies only for `myvalues.yaml`. Example: "true"/"false"
        
      * controllerCount parameter value should be <= number of nodes in the kubernetes cluster else install script fails.
        
      * User can a create separate _StorageClass_ (with topology-related keys) by referring to existing default storage classes.

      * Host IO Limit must have a minimum bandwidth of 1 MBPS to discover the volumes on node successfully.
      
      * User must not change the value of allowRWOMultiPodAccess to true unless intended to use the feature and is aware of the consequences. Enabling multiple pods to access the same PVC with RWO access mode on the same node might cause data to be overwritten and therefore leading to data loss in some cases.

   Example *myvalues.yaml*   
    ```yaml
    logLevel: "info"
    imagePullPolicy: Always
    certSecretCount: 1
    kubeletConfigDir: /var/lib/kubelet
    controller:
      controllerCount: 2
      volumeNamePrefix : csivol
      snapshot:
        enabled: true
        snapNamePrefix: csi-snap
      resizer:
        enabled: false
    allowRWOMultiPodAccess: false
    syncNodeInfoInterval: 5
    maxUnityVolumesPerNode: 0
    ```
   
4. For certificate validation of Unisphere REST API calls refer [here](#certificate-validation-for-unisphere-rest-api-calls). Otherwise, create an empty secret with file `helm/emptysecret.yaml` file by running the `kubectl create -f helm/emptysecret.yaml` command.

5. Prepare the `secret.yaml`  for driver configuration.
    The following table lists driver configuration parameters for multiple storage arrays.
    
    | Parameter | Description | Required | Default |
    | --------- | ----------- | -------- |-------- |
    | storageArrayList.username | Username for accessing Unity system  | true | - |
    | storageArrayList.password | Password for accessing Unity system  | true | - |
    | storageArrayList.endpoint | REST API gateway HTTPS endpoint Unity system| true | - |
    | storageArrayList.arrayId | ArrayID for Unity system | true | - |
    | storageArrayList.skipCertificateValidation | "skipCertificateValidation " determines if the driver is going to validate unisphere certs while connecting to the Unisphere REST API interface. If it is set to false, then a secret unity-certs has to be created with an X.509 certificate of CA which signed the Unisphere certificate. | true | true |
    | storageArrayList.isDefault | An array having isDefault=true or isDefaultArray=true will be considered as the default array when arrayId is not specified in the storage class. This parameter should occur only once in the list. | false | false |


    Example: secret.yaml
    ```yaml
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

	Use the following command to create a new secret unity-creds from `secret.yaml` file.
	
    `kubectl create secret generic unity-creds -n unity --from-file=config=secret.yaml`
    
    Use the following command to replace or update the secret:
    
    `kubectl create secret generic unity-creds -n unity --from-file=config=secret.yaml -o yaml --dry-run | kubectl replace -f -`
    
    **Note**: The user needs to validate the yaml syntax and array-related key/values while replacing the unity-creds secret.
    The driver will continue to use previous values in case of an error found in the yaml file.
	
	
	Alternatively, users can configure and use `secret.yaml` for driver configuration. The parameters remain the same as in the above table and below is a sample of `secret.yaml`. Samples of  `secret.yaml` is available in the directory `csi-unity/samples/secret/ `.
	
	Example: secret.yaml
	```yaml
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
    
      **Note:**
      * Parameters "allowRWOMultiPodAccess" and "syncNodeInfoTimeInterval" have been enabled for configuration in values.yaml and this helps users to dynamically change these values without the need for driver re-installation.

6. Setup for snapshots.
         
   Applicable only if you decided to enable snapshot feature in `values.yaml`

    ```yaml
    controller:
      snapshot:
        enabled: true
    ```

   In order to use the Kubernetes Volume Snapshot feature, you must ensure the following components have been deployed on your Kubernetes cluster

    #### Volume Snapshot CRD's
    The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on Github. Use [v4.2.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.2.0/client/config/crd) for the installation.

    #### Volume Snapshot Controller
    The CSI external-snapshotter sidecar is split into two controllers:
    - A common snapshot controller
    - A CSI external-snapshotter sidecar

    Use [v4.2.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.2.0/deploy/kubernetes/snapshot-controller) for the installation.

    **Note**:
    - The manifests available on GitHub install the snapshotter image: 
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
    - It is recommended to use 4.2.x version of snapshotter/snapshot-controller.
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
    |
    |- Verifying helm values version                                    Success
    
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
    

## Certificate validation for Unisphere REST API calls 

This topic provides details about setting up the certificate validation for the CSI Driver for Dell EMC Unity.

*Before you begin*

As part of the CSI driver installation, the CSI driver requires a secret with the name unity-certs-0 to unity-certs-n based on the ".Values.certSecretCount" parameter present in the namespace unity.

This secret contains the X509 certificates of the CA which signed the Unisphere SSL certificate in PEM format.

If the install script does not find the secret, it creates one empty secret with the name unity-certs-0.

If this secret is an empty secret, then the validation of the certificate fails, and the driver fails to start.

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

## Volume Snapshot Class

For CSI Driver for Unity version 1.6 and later, `dell-csi-helm-installer` does not create any Volume Snapshot  classes as part of the driver installation. A wide set of annotated storage class manifests have been provided in the `csi-unity/samples/volumesnapshotclass/` folder. Use these samples to create new Volume Snapshot to provision storage.

### What happens to my existing Volume Snapshot Classes?

*Upgrading from CSI Unity v1.6 driver*:
The existing volume snapshot class will be retained.

*Upgrading from an older version of the driver*:
It is strongly recommended to upgrade the earlier versions of CSI Unity to 1.6 before upgrading to 2.0.

## Storage Classes

Storage Classes are an essential Kubernetes construct for Storage provisioning. To know more about Storage Classes, refer to https://kubernetes.io/docs/concepts/storage/storage-classes/

A wide set of annotated storage class manifests have been provided in the [samples/storageclass](https://github.com/dell/csi-unity/tree/master/samples/storageclass) folder. Use these samples to create new storage classes to provision storage.

For CSI Driver for Unity version 2.0, a wide set of annotated storage class manifests have been provided in the `csi-unity/samples/storageclass` folder. Use these samples to create new storage classes to provision storage.

### What happens to my existing storage classes?

Upgrading from an older version of the driver: The storage classes will be deleted if you upgrade the driver. If you wish to continue using those storage classes, you can patch them and apply the annotation “helm.sh/resource-policy”: keep before performing an upgrade.

>Note: If you continue to use the old storage classes, you may not be able to take advantage of any new storage class parameter supported by the driver.

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
    kubectl create secret generic unity-creds -n unity --from-file=config=secret.yaml -o yaml --dry-run=client | kubectl replace -f -
```
**Note**: Updating unity-certs-x secrets is a manual process, unlike unity-creds. Users have to re-install the driver in case of updating/adding the SSL certificates or changing the certSecretCount parameter.

## Dynamic Logging Configuration

This feature is introduced in CSI Driver for unity version 2.0.0. 

### Helm based installation
As part of driver installation, a ConfigMap with the name `unity-config-params` is created, which contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of CSI driver. 

Users can set the default log level by specifying log level to `logLevel` attribute in values.yaml during driver installation.

To change the log level dynamically to a different value user can edit the same values.yaml, and run the following command
```
cd dell-csi-helm-installer
./csi-install.sh --namespace unity --values ./myvalues.yaml --upgrade
```

Note: myvalues.yaml is a values.yaml file which user has used for driver installation.  