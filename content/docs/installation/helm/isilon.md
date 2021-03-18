---
title: PowerScale
description: >
  Installing PowerScale CSI Driver via Helm
---
The CSI Driver for Dell EMC PowerScale can be deployed by using the provided Helm v3 charts in upstream Kubernetes. For more detailed information on the installation scripts, review the script [documentation](https://github.com/dell/csi-powerscale/tree/master/dell-csi-helm-installer).

The controller section of the Helm chart installs the following components in a _Deployment_:
- CSI Driver for PowerScale
- Kubernetes External Provisioner, which provisions the volumes
- Kubernetes External Attacher, which attaches the volumes to the containers
- Kubernetes External Snapshotter, which provides snapshot support
- Kubernetes External Resizer, which resizes the volume

The node section of the Helm chart installs the following component in a Daemon Set:
- CSI Driver for PowerScale
- Kubernetes Node Registrar, which handles the driver registration

### Prerequisites

Before you install CSI Driver for PowerScale, verify the requirements that are mentioned in this topic are installed and configured.

#### Requirements

* Install Kubernetes or OpenShift  (see [supported versions](../../../dell-csi-driver/))
* Configure Docker service
* Install Helm v3
* Install volume snapshot components
* Deploy PowerScale driver using Helm

**Note:** There is no feature gate that needs to be set explicitly for CSI drivers version 1.17 and later. All the required feature gates are either beta/GA.

## Configure Docker service

The mount propagation in Docker must be configured on all Kubernetes nodes before installing CSI Driver for PowerScale.

### Procedure

1. Edit the service section of */etc/systemd/system/multi-user.target.wants/docker.service* file as follows:
    ```
    [Service]
    ...
    MountFlags=shared
    ```
2. Restart the Docker service with the following commands:
    ```
    systemctl daemon-reload
    systemctl restart docker
    ```

## Install volume snapshot components

### Install Snapshot CRDs

- For Kubernetes 1.18 and 1.19, SnapShot CRDs versioned  3.0.3 (<https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.3/client/config/crd>), must be installed.
- For Kubernetes 1.20, SnapShot CRDs versioned 4.0.0 (<https://github.com/kubernetes-csi/external-snapshotter/tree/v4.0.0/client/config/crd>) must be installed.

### Install Snapshot Controller

- For Kubernetes 1.18 and 1.19, Snapshot controller versioned 3.0.3 (<https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.3/deploy/kubernetes/snapshot-controller>) must be installed.
- For Kubernetes 1.20, Snapshot controller versioned 4.0.0 (<https://github.com/kubernetes-csi/external-snapshotter/tree/v4.0.0/deploy/kubernetes/snapshot-controller>) must be installed.


## Install CSI Driver for PowerScale

**Before you begin**
 * You must clone the source code from [git repository](https://github.com/dell/csi-isilon).
 * In the `dell-csi-helm-installer` directory, there will be two shell scripts, *csi-install.sh* and *csi-uninstall.sh*. These scripts handle some of the pre and post operations that cannot be performed in the helm chart.

**Steps**

1. Collect information from the PowerScale Systems like IP address,IsiPath, username and password. Make a note of the value for these parameters as they must be entered in the *secret.json*.
2. Copy the helm/csi-isilon/values.yaml into a new location with name say *my-isilon-settings.yaml*, to customize settings for installation.
3. Edit *my-isilon-settings.yaml* to set the following parameters for your installation:
   The following table lists the primary configurable parameters of the PowerScale driver Helm chart and their default values. More detailed information can be
   found in the  [`values.yaml`](https://github.com/dell/csi-powerscale/blob/master/helm/csi-isilon/values.yaml) file in this repository.

   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |    
   | certSecretCount | Represents number of certificate secrets, which user is going to create for ssl authentication. (isilon-cert-0..isilon-cert-(n-1)); Minimum value should be 1 | true | 1 |
   | isiPort | "isiPort" defines the HTTPs port number of the PowerScale OneFS API server | false | 8080 |
   | allowedNetworks | "allowedNetworks" defines list of networks which can be used for NFS I/O traffic, CIDR format must be used | false | - |
   | isiInsecure | "isiInsecure" specifies whether the PowerScale OneFS API server's certificate chain and host name must be verified. This value will affect the default storage class implementation | false | true |
   | isiAccessZone | The name of the access zone a volume can be created in | false | System |
   | volumeNamePrefix | "volumeNamePrefix" defines a string prepended to each volume created by the CSI driver. | false | k8s |
   | controllerCount | "controllerCount" defines the number of CSI PowerScale controller nodes to deploy to the Kubernetes release.| true | 2 |   
   | enableDebug | Indicates whether debug level logs should be logged | false | true |
   | verbose | Indicates what content of the OneFS REST API message should be logged in debug level logs | false | 1 |
   | enableQuota | Indicates whether the provisioner should attempt to set (later unset) quota on a newly provisioned volume. This requires SmartQuotas to be  enabled.| false | true |
   | noProbeOnStart | Indicates whether the controller/node should probe during initialization | false | false |
   | isiPath | The default base path for the volumes to be created, this will be used if a storage class does not have the IsiPath parameter specified| false | /ifs/data/csi |
   | autoProbe |  Enable auto probe. | false | true |
   | nfsV3 | Specify whether to set the version to v3 when mounting an NFS export. If the value is "false", then the default version supported will be used (that is, the mount command will not explicitly specify "-o vers=3" option). This flag has now been deprecated and will be removed in a future release. Use the StorageClass.mountOptions if you want to specify 'vers=3' as a mount option. | false | false |
   | enableCustomTopology | Indicates PowerScale FQDN/IP which will be fetched from node label and the same will be used by controller and node pod to establish connection to Array. This requires enableCustomTopology to be enabled. | false | false |
   | ***Controller parameters*** | Set nodeSelector and tolerations for controller |
   | nodeSelector | Define nodeSelector for the controllers, if required | false | |
   | tolerations | Define tolerations for the controllers, if required | false | |

   **Notes:**

   1. User should provide all boolean values with double quotes. This applicable only for my-isilon-settings.yaml. Example: "true"/"false"
   2. ControllerCount parameter value should not exceed number of nodes in the kubernetes cluster. Otherwise some of the controller pods will be in "Pending" state till new nodes are available for scheduling. The installer will exit with a WARNING on the same.
   3. Whenever certSecretCount parameter changes in myvalues.yaml user needs to reinstall the driver.
   
4. Create namespace
    Run `kubectl create namespace isilon` to create the *isilon* namespace. Specify the same namespace name while installing the driver. 

    **Note:** CSI PowerScale also supports installation of driver in custom namespace.
    
5. Create a secret file for the OneFS credentials by editing the secret.json present under helm directory. This secret.json can be used for adding the credentials of one or more OneFS storage arrays.The following table lists driver configuration parameters for a single storage array.
   
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | isiIP | "isiIP" defines the HTTPs endpoint of the PowerScale OneFS API server | true | - |
   | clusterName | PoweScale cluster against which volume CRUD operations are performed through this secret. This is a logical name. | true | - |
   | username | Username for accessing PowerScale OneFS system | true | - |
   | password | Password for accessing PowerScale OneFS system | true | - |
   | isDefaultCluster |defines whether this storage array should be the default.This entry should be present only for one OneFS array and that array will be marked default for existing volumes. | true | false |
   | ***Optional parameters*** | Following parameters are Optional, if provided , will override default values of values.yaml |
   | isiPort | isiPort defines the HTTPs port number of the PowerScale OneFS API server | false | - |
   | isiInsecure | "isiInsecure" specifies whether the PowerScale OneFS API server's certificate chain and host name should be verified. | false | false |
   | isiPath | The base path for the volumes to be created. Note: isiPath value provided in the storage class will take the highest precedence while creating PVC | true | - |

   The username specified in secret.yaml must be from the authentication providers of PowerScale. The user must have enough privileges to perform the actions. The suggested privileges are as follows:
    ```
   ISI_PRIV_LOGIN_PAPI
   ISI_PRIV_NFS
   ISI_PRIV_QUOTA
   ISI_PRIV_SNAPSHOT
   ISI_PRIV_IFS_RESTORE
   ISI_PRIV_NS_IFS_ACCESS
    ```
   **Notes:**

   1. If any key/value is present in both secret.json and my-isilon-settings.yaml , then the values provided secret.json will take precedence.
   2. If any key/value is present in both my-isilon-settings.yaml/secret.json and storageClass, then the values provided in storageClass parameters will take precedence.
   3. User has to validate the JSON syntax and array related key/values while replacing or appending the isilon-creds secret. The driver will continue to use previous values in case of an error found in the JSON file.
   
6. Install OneFS CA certificates by following the instructions from next section, if you want to validate OneFS API server's certificates. If not, create an empty secret using the following command and empty secret should be created for the successful CSI Driver for Dell EMC Powerscale installation.
    ```
    kubectl create -f emptysecret.yaml
    ```
7.  Install the driver using `csi-install.sh` bash script by running `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace isilon --values ../helm/myvalues.yaml`

## Certificate validation for OneFS REST API calls 

The CSI driver exposes an install parameter 'isiInsecure' which determines if the driver
performs client-side verification of the OneFS certificates. The 'isiInsecure' parameter is set to true by default and the driver does not verify the OneFS certificates.

If the 'isiInsecure' is set to false, then the secret isilon-certs must contain the CA certificate for OneFS. 
If this secret is an empty secret, then the validation of the certificate fails, and the driver fails to start.

If the 'isiInsecure' parameter is set to false and a previous installation attempt to create the empty secret, then this secret must be deleted and re-created using the CA certs. If the OneFS certificate is self-signed, then perform the following steps:

### Procedure

1. To fetch the certificate, run `openssl s_client -showcerts -connect [OneFS IP] </dev/null 2>/dev/null | openssl x509 -outform PEM > ca_cert_0.pem`
2. To create the certs secret, run `kubectl create secret generic isilon-certs-0 --from-file=cert-0=ca_cert_0.pem -n isilon`  
3. Use the following command to replace the secret `kubectl create secret generic isilon-certs-0 -n isilon --from-file=cert-0=ca_cert_0.pem -o yaml --dry-run | kubectl replace -f -`

**Notes:**
1. The OneFS IP can be with or without port , depends upon the configuration of OneFS API server.
2. Above said commands is based on the namespace 'isilon'
3. It is highly recommended that ca_cert.pem file(s) having the naming convention as ca_cert_number.pem (example: ca_cert_0, ca_cert_1), where this number starts from 0 and grows as number of OneFS arrays grows.
4. The cert secret created out of these pem files should have the naming convention as isilon-certs-number (example: isilon-certs-0, isilon-certs-1 etc.); The number should start from zero and should grow in incremental order. The number of the secrets created out of pem files should match certSecretCount value in myvalues.yaml or my-isilon-settings.yaml.

### Dynamic update of array details via secret.json

CSI Driver for Dell EMC PowerScale now provides supports for Multi cluster. Now user can link the single CSI Driver to multiple OneFS Clusters by updating secret.json. User can now update the isilon-creds secret by editing the secret.json and executing following command:

`kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.json -o yaml --dry-run=client | kubectl replace -f -`
&nbsp;

## Storage Classes
Storage Classes are an essential Kubernetes construct for Storage provisioning. To know more about Storage Classes, please refer:
https://kubernetes.io/docs/concepts/storage/storage-classes/

Starting from v1.5 of the driver, Storage Classes would no longer be created along with the installation of the driver.
