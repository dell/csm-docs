---
title: Unity XT
description: >
  Installing CSI Driver for Unity XT via Helm
---

The CSI Driver for Dell Unity XT can be deployed by using the provided Helm v3 charts and installation scripts on both Kubernetes and OpenShift platforms. For more detailed information on the installation scripts, review the script [documentation](https://github.com/dell/csi-unity/tree/master/dell-csi-helm-installer).

## Prerequisites

Before you install CSI Driver for Unity XT, verify the requirements that are mentioned in this topic are installed and configured.

### Requirements

* Install Kubernetes or OpenShift (see [supported versions](../../../../../csidriver/#features-and-capabilities))
* Install Helm v3
* To use FC protocol, the host must be zoned with Unity XT array and Multipath needs to be configured
* To use iSCSI protocol, iSCSI initiator utils packages needs to be installed and Multipath needs to be configured 
* To use NFS protocol, NFS utility packages needs to be installed
* Mount propagation is enabled on container runtime that is being used

### Install Helm 3.0

Install Helm 3.0 on the master node before you install the CSI Driver for Dell Unity XT.

**Steps**

Run the command to install Helm 3.0.
```bash
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
``` 

### Fibre Channel requirements

Dell Unity XT supports Fibre Channel communication. If you use the Fibre Channel protocol, ensure that the
following requirement is met before you install the CSI Driver for Dell Unity XT:
- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port must be done.


### Set up the iSCSI Initiator
The CSI Driver for Dell Unity XT supports iSCSI connectivity.

If you use the iSCSI protocol, set up the iSCSI initiators as follows:
- Ensure that the iSCSI initiators are available on both Controller and Worker nodes.
- Kubernetes nodes must have access (network connectivity) to an iSCSI port on the Dell Unity XT array that
  has IP interfaces. Manually create IP routes for each node that connects to the Dell Unity XT.
- All Kubernetes nodes must have the _iscsi-initiator-utils_ package for CentOS/RHEL or _open-iscsi_ package for Ubuntu installed, and the _iscsid_ service must be enabled and running.
  To do this, run the `systemctl enable --now iscsid` command.
- Ensure that the unique initiator name is set in _/etc/iscsi/initiatorname.iscsi_.

For more information about configuring iSCSI, see [Dell Host Connectivity guide](https://www.delltechnologies.com/asset/en-us/products/storage/technical-support/docu5128.pdf).

### Linux multipathing requirements
Dell Unity XT supports Linux multipathing. Configure Linux multipathing before installing the CSI Driver for Dell
Unity XT.

Set up Linux multipathing as follows:
- Ensure that all nodes have the _Device Mapper Multipathing_ package installed.
> You can install it by running `yum install device-mapper-multipath` on CentOS or `apt install multipath-tools` on Ubuntu. This package should create a multipath configuration file located in `/etc/multipath.conf`.
- Enable multipathing using the `mpathconf --enable --with_multipathd y` command.
- Enable `user_friendly_names` and `find_multipaths` in the `multipath.conf` file.
- Ensure that the multipath command for `multipath.conf` is available on all Kubernetes nodes.

As a best practice, use the following options to help the operating system and the mulitpathing software detect path changes efficiently:
```text
path_grouping_policy multibus
path_checker tur
features "1 queue_if_no_path"
path_selector "round-robin 0"
no_path_retry 10
```

## Install CSI Driver

Install CSI Driver for Unity XT using this procedure.

*Before you begin*

 * As a pre-requisite for running this procedure, you must have the downloaded files, including the Helm chart from the source [git repository](https://github.com/dell/csi-unity) with the command 
   ```bash
   git clone -b v2.10.0 https://github.com/dell/csi-unity.git
   ```
 * In the top-level dell-csi-helm-installer directory, there should be two scripts, `csi-install.sh` and `csi-uninstall.sh`.
 * Ensure _unity_ namespace exists in Kubernetes cluster. Use the `kubectl create namespace unity` command to create the namespace if the namespace is not present.
   
   

Procedure

1. Collect information from the Unity XT Systems like unique ArrayId, IP address, username, and password. Make a note of the value for these parameters as they must be entered in the  `secret.yaml` and `myvalues.yaml` file.

    **Note**: 
      * ArrayId corresponds to the serial number of Unity XT array.
      * Unity XT Array username must have role as Storage Administrator to be able to perform CRUD operations.
      * If the user is using a complex K8s version like "v1.24.6-mirantis-1", use this kubeVersion check in helm/csi-unity/Chart.yaml file.
            kubeVersion: ">= 1.24.0-0 < 1.29.0-0"

2. Get the required values.yaml using the command below:

```bash
cd dell-csi-helm-installer && wget -O my-unity-settings.yaml https://github.com/dell/helm-charts/raw/csi-unity-2.10.0/charts/csi-unity/values.yaml
```

3. Edit `values.yaml` to set the following parameters for your installation:
   
    The following table lists the primary configurable parameters of the Unity XT driver chart and their default values. More detailed information can be found in the [`values.yaml`](https://github.com/dell/helm-charts/blob/csi-unity-2.10.0/charts/csi-unity/values.yaml) file in this repository.
    
    | Parameter | Description | Required | Default |
    | --------- | ----------- | -------- |-------- |
    | images | List all the images used by the CSI driver and CSM. If you use a private repository, change the registries accordingly. | Yes | "" |
    | logLevel | LogLevel is used to set the logging level of the driver | No | info |
    | allowRWOMultiPodAccess | Flag to enable multiple pods to use the same PVC on the same node with RWO access mode. | No | false |
    | kubeletConfigDir | Specify kubelet config dir path | Yes | /var/lib/kubelet |
    | syncNodeInfoInterval | Time interval to add node info to the array. Default 15 minutes. The minimum value should be 1 minute. | No | 15 |
    | maxUnityVolumesPerNode | Maximum number of volumes that controller can publish to the node. | No | 0 |
    | certSecretCount | Represents the number of certificate secrets, which the user is going to create for SSL authentication. (unity-cert-0..unity-cert-n). The minimum value should be 1. | No | 1 |
    | imagePullPolicy |  The default pull policy is IfNotPresent which causes the Kubelet to skip pulling an image if it already exists. | Yes | IfNotPresent |
    | podmon.enabled | service to monitor failing jobs and notify | No | false |
    | tenantName | Tenant name added while adding host entry to the array | No |  |
    | fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType` | No | "ReadWriteOnceWithFSType" |
    | storageCapacity.enabled | Enable/Disable storage capacity tracking | No | true |
    | storageCapacity.pollInterval | Configure how often the driver checks for changed capacity | No | 5m |
    | **controller** | Allows configuration of the controller-specific parameters.| - | - |
    | controllerCount | Defines the number of csi-unity controller pods to deploy to the Kubernetes release| Yes | 2 |
    | volumeNamePrefix | Defines a string prefix for the names of PersistentVolumes created | Yes | "k8s" |
    | snapshot.enabled | Enable/Disable volume snapshot feature | Yes | true |
    | snapshot.snapNamePrefix | Defines a string prefix for the names of the Snapshots created | Yes | "snapshot" |
    | resizer.enabled | Enable/Disable volume expansion feature | Yes | true |
    | nodeSelector | Define node selection constraints for pods of controller deployment | No | |
    | tolerations | Define tolerations for the controller deployment, if required | No | |
    | healthMonitor.enabled | Enable/Disable deployment of external health monitor sidecar for controller side volume health monitoring. | No | false |
    | healthMonitor.interval | Interval of monitoring volume health condition. Allowed values: Number followed by unit (s,m,h) | No | 60s |
    | ***node*** | Allows configuration of the node-specific parameters.| - | - |
    | dnsPolicy | Define the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
    | healthMonitor.enabled | Enable/Disable health monitor of CSI volumes- volume usage, volume condition | No | false |
    | nodeSelector | Define node selection constraints for pods of node deployment | No | |
    | tolerations | Define tolerations for the node deployment, if required | No | |


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
    fsGroupPolicy: ReadWriteOneFSType
    ```
   
4. For certificate validation of Unisphere REST API calls refer [here](#certificate-validation-for-unisphere-rest-api-calls). Otherwise, create an empty secret with file `csi-unity/samples/secret/emptysecret.yaml` file by running the `kubectl create -f csi-unity/samples/secret/emptysecret.yaml` command.

5. Prepare the `secret.yaml`  for driver configuration.
    The following table lists driver configuration parameters for multiple storage arrays.
    
    | Parameter                 | Description                                    | Required | Default |
    | ------------------------- | ---------------------------------------------- | -------- |-------- |
    | storageArrayList.username | Username for accessing Unity XT system         | Yes     | -       |
    | storageArrayList.password | Password for accessing Unity XT system         | Yes     | -       |
    | storageArrayList.endpoint | REST API gateway HTTPS endpoint Unity XT system| Yes     | -       |
    | storageArrayList.arrayId  | ArrayID for Unity XT system                    | Yes     | -       |
    | storageArrayList.skipCertificateValidation | "skipCertificateValidation " determines if the driver is going to validate unisphere certs while connecting to the Unisphere REST API interface. If it is set to false, then a secret unity-certs has to be created with an X.509 certificate of CA which signed the Unisphere certificate. | Yes | true |
    | storageArrayList.isDefault| An array having isDefault=true or isDefault=true will be considered as the default array when arrayId is not specified in the storage class. This parameter should occur only once in the list. | Yes | - |


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
        isDefault: false
    ```

	Use the following command to create a new secret unity-creds from `secret.yaml` file.
	
    ```bash
    kubectl create secret generic unity-creds -n unity --from-file=config=secret.yaml
    ```
    
    Use the following command to replace or update the secret:
    
    ```bash
    kubectl create secret generic unity-creds -n unity --from-file=config=secret.yaml -o yaml --dry-run | kubectl replace -f -
    ```
    
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
      isDefault: false
    ```
    
    **Note:** Parameters "allowRWOMultiPodAccess" and "syncNodeInfoInterval" have been enabled for configuration in values.yaml and this helps users to dynamically change these values without the need for driver re-installation.

6. If you want to leverage snapshotting feature, the pre-requisite is to install external-snapshotter. Installation of external-snapshotter is required only for Kubernetes and is available by default with OpenShift installations. [Click here](../../../../../snapshots/#optional-volume-snapshot-requirements) to follow the procedure to install external-snapshotter.
              

7. Run the command to proceed with the installation using bash script.
   ```bash
   ./csi-install.sh --namespace unity --values ./myvalues.yaml
   ```
    A successful installation must display messages that look similar to the following samples:
    ```
    ------------------------------------------------------
    > Installing CSI Driver: csi-unity on 1.27
    ------------------------------------------------------
    ------------------------------------------------------
    > Checking to see if CSI Driver is already installed
    ------------------------------------------------------
    ------------------------------------------------------
    > Verifying Kubernetes and driver configuration
    ------------------------------------------------------
    |- Kubernetes Version: 1.27
    |
    |- Driver: csi-unity                                                
    |
    |- Verifying Kubernetes version                                     
      |
      |--> Verifying minimum Kubernetes version                         Success
      |
      |--> Verifying maximum Kubernetes version                         Success
    |
    |- Verifying that required namespaces have been created             Success
    |
    |- Verifying that required secrets have been created                Success
    |
    |- Verifying that optional secrets have been created                Success
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
    
    * One or more Unity XT Controllers (based on controllerCount) with 5/5 containers ready, and status displayed as Running.
    * Agent pods with 2/2 containers and the status displayed as Running.

    **Note**:
    To install nightly or latest csi driver build using bash script use this command:
    ```bash
    /csi-install.sh --namespace unity --values ./myvalues.yaml --version latest --helm-charts-version <version>
    ```

8. You can also install the driver using standalone helm chart by cloning the centralised helm charts and running the helm install command as shown.

   **Syntax**:
   ```bash

   git clone -b csi-unity-2.10.0 https://github.com/dell/helm-charts

   helm install <release-name> dell/container-storage-modules -n <namespace> --version <container-storage-module chart-version> -f <values.yaml location>

   Example: helm install unity dell/container-storage-modules -n csi-unity --version 1.0.1 -f values.yaml
   ```

## Certificate validation for Unisphere REST API calls 

This topic provides details about setting up the Dell Unity XT certificate validation for the CSI Driver.

*Before you begin*

As part of the CSI driver installation, the CSI driver requires a secret with the name unity-certs-0 to unity-certs-n based on the ".Values.certSecretCount" parameter present in the namespace unity.

This secret contains the X509 certificates of the CA which signed the Unisphere SSL certificate in PEM format.

If the install script does not find the secret, it creates one empty secret with the name unity-certs-0.

If this secret is an empty secret, then the validation of the certificate fails, and the driver fails to start.

If the Unisphere certificate is self-signed or if you are using an embedded Unisphere, then perform the following steps.

   1. To fetch the certificate, run the following command.
      ```bash
      openssl s_client -showcerts -connect <Unisphere IP:Port> </dev/null 2>/dev/null | openssl x509 -outform PEM > ca_cert_0.pem
      ```
      Example: 
      ```bash
      openssl s_client -showcerts -connect 1.1.1.1:443 </dev/null 2>/dev/null | openssl x509 -outform PEM > ca_cert_0.pem
      ```
   2. Run the following command to create the cert secret with index '0':
      ```bash
      kubectl create secret generic unity-certs-0 --from-file=cert-0=ca_cert_0.pem -n unity
      ```
      Use the following command to replace the secret:
      ```bash
      kubectl create secret generic unity-certs-0 -n unity --from-file=cert-0=ca_cert_0.pem -o yaml --dry-run | kubectl replace -f -
      ``` 
   3. Repeat step 1 and 2 to create multiple cert secrets with incremental index (example: unity-certs-1, unity-certs-2, etc)


	  **Note:**
	
		* "unity" is the namespace for helm-based installation but namespace can be user-defined in operator-based installation.

		* User can add multiple certificates in the same secret. The certificate file should not exceed more than 1Mb due to Kubernetes secret size limitation.

		* Whenever certSecretCount parameter changes in `myvalues.yaml` user needs to uninstall and install the driver.

## Volume Snapshot Class

A wide set of annotated storage class manifests have been provided in the [csi-unity/samples/volumesnapshotclass/](https://github.com/dell/csi-unity/tree/main/samples/volumesnapshotclass) folder. Use these samples to create new Volume Snapshot to provision storage.

## Storage Classes

Storage Classes are an essential Kubernetes construct for Storage provisioning. To know more about Storage Classes, refer to https://kubernetes.io/docs/concepts/storage/storage-classes/

A wide set of annotated storage class manifests have been provided in the [samples/storageclass](https://github.com/dell/csi-unity/tree/master/samples/storageclass) folder. Use these samples to create new storage classes to provision storage.

For the Unity XT CSI Driver, a wide set of annotated storage class manifests have been provided in the `csi-unity/samples/storageclass` folder. Use these samples to create new storage classes to provision storage.

### What happens to my existing storage classes?

Upgrading from an older version of the driver: The storage classes will be deleted if you upgrade the driver. If you wish to continue using those storage classes, you can patch them and apply the annotation “helm.sh/resource-policy”: keep before performing an upgrade.

>Note: If you continue to use the old storage classes, you may not be able to take advantage of any new storage class parameter supported by the driver.

**Steps to create storage class:**
There are samples storage class yaml files available under `csi-unity/samples/storageclass`.  These can be copied and modified as needed.

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
```bash
kubectl create secret generic unity-creds -n unity --from-file=config=secret.yaml -o yaml --dry-run=client | kubectl replace -f -
```
**Note**: Updating unity-certs-x secrets is a manual process, unlike unity-creds. Users have to re-install the driver in case of updating/adding the SSL certificates or changing the certSecretCount parameter.

## Dynamic Logging Configuration 

### Helm based installation
As part of driver installation, a ConfigMap with the name `unity-config-params` is created, which contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of CSI driver. 

Users can set the default log level by specifying log level to `logLevel` attribute in values.yaml during driver installation.

To change the log level dynamically to a different value user can edit the same values.yaml, and run the following command
```bash
cd dell-csi-helm-installer
./csi-install.sh --namespace unity --values ./myvalues.yaml --upgrade
```

Note: myvalues.yaml is a values.yaml file which user has used for driver installation.  
