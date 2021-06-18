---
title: PowerScale
description: >
  Installing PowerScale CSI Driver via Helm
---
The CSI Driver for Dell EMC PowerScale can be deployed by using the provided Helm v3 charts and installation scripts on both Kubernetes and OpenShift platforms. For more detailed information on the installation scripts, review the script [documentation](https://github.com/dell/csi-powerscale/tree/master/dell-csi-helm-installer).

The controller section of the Helm chart installs the following components in a _Deployment_ in the specified namespace:
- CSI Driver for PowerScale
- Kubernetes External Provisioner, which provisions the volumes
- Kubernetes External Attacher, which attaches the volumes to the containers
- Kubernetes External Snapshotter, which provides snapshot support
- Kubernetes External Resizer, which resizes the volume

The node section of the Helm chart installs the following component in a _DaemonSet_ in the specified namespace:
- CSI Driver for PowerScale
- Kubernetes Node Registrar, which handles the driver registration

## Prerequisites

The following are requirements to be met before installing the CSI Driver for Dell EMC PowerScale:
- Install Kubernetes or OpenShift (see [supported versions](../../../dell-csi-driver/))
- Install Helm 3
- Configure Mount propagation on container runtime
- If using Snapshot feature, satisfy all Volume Snapshot requirements

### Install Helm 3.0

Install Helm 3.0 on the master node before you install the CSI Driver for Dell EMC PowerStore.

**Steps**

  Run the `curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash` command to install Helm 3.0.

### Configure Mount Propagation on Container Runtime 

It is required to configure mount propagation on your container runtime on all Kubernetes nodes before installing the CSI Driver for Dell EMC PowerStore.  The following is instruction on how to do this with Docker.  If you use another container runtime please follow the recommended instructions from the vendor to configure mount propagation.

**Steps**

1. Edit the service section of `/etc/systemd/system/multi-user.target.wants/docker.service` file to add the following lines:
   ```bash
   docker.service
   [Service]...
   MountFlags=shared
   ```
2. Restart the docker service with `systemctl daemon-reload` and `systemctl restart docker` on all the nodes.

*NOTE:* Some distribution, like Ubuntu, already has _MountFlags_ set by default.

### (Optional) Volume Snapshot Requirements

Applicable only if you decided to enable snapshot feature in `values.yaml`

```yaml
snapshot:
  enabled: true
```

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

*NOTE:*
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

*NOTE:*
- It is recommended to use 3.0.x version of snapshotter/snapshot-controller when using Kubernetes 1.19
- When using Kubernetes 1.20/1.21 it is recommended to use 4.0.x version of snapshotter/snapshot-controller.
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

## Install the Driver

**Steps**
1. Run `git clone https://github.com/dell/csi-powerscale.git` to clone the git repository.
2. Ensure that you have created namespace where you want to install the driver. You can run `kubectl create namespace csi-powerscale` to create a new one. The use of "csi-powerstore"  as the namespace is just an example. You can choose any name for the namespace.
3. Collect information from the PowerScale Systems like IP address, IsiPath, username, and password. Make a note of the value for these parameters as they must be entered in the *secret.json*.
4. Copy *the helm/csi-isilon/values.yaml* into a new location with name say *my-isilon-settings.yaml*, to customize settings for installation.
5. Edit *my-isilon-settings.yaml* to set the following parameters for your installation:
   The following table lists the primary configurable parameters of the PowerScale driver Helm chart and their default values. More detailed information can be
   found in the  [`values.yaml`](https://github.com/dell/csi-powerscale/blob/master/helm/csi-isilon/values.yaml) file in this repository.

   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |    
   | certSecretCount | Represents the number of certificate secrets, which the user is going to create for SSL authentication. (isilon-cert-0..isilon-cert-(n-1)); Minimum value should be 1.| true | 1 |
   | isiPort | "isiPort" defines the HTTPs port number of the PowerScale OneFS API server. | false | 8080 |
   | allowedNetworks | "allowedNetworks" defines the list of networks that can be used for NFS I/O traffic, CIDR format must be used. | false | [ ] |
   | isiInsecure | "isiInsecure" specifies whether the PowerScale OneFS API server's certificate chain and hostname must be verified. This value will affect the default storage class implementation. | false | true |
   | isiAccessZone | The name of the access zone a volume can be created in. | false | System |
   | volumeNamePrefix | "volumeNamePrefix" defines a string prepended to each volume created by the CSI driver. | false | k8s |
   | controllerCount | "controllerCount" defines the number of CSI PowerScale controller nodes to deploy to the Kubernetes release.| true | 2 |
   | enableQuota | Indicates whether the provisioner should attempt to set (later unset) quota on a newly provisioned volume. This requires SmartQuotas to be enabled.| false | true |
   | noProbeOnStart | Indicates whether the controller/node should probe during initialization. | false | false |
   | isiPath | The default base path for the volumes to be created, will be used if a storage class does not have the IsiPath parameter specified.| false | /ifs/data/csi |
   | autoProbe |  Enable auto probe. | false | true |
   | nfsV3 | Specify whether to set the version to v3 when mounting an NFS export. If the value is "false", then the default version supported will be used (that is, the mount command will not explicitly specify "-o vers=3" option). This flag has now been deprecated and will be removed in a future release. Use the StorageClass.mountOptions if you want to specify 'vers=3' as a mount option. | false | false |
   | enableCustomTopology | Indicates PowerScale FQDN/IP which will be fetched from node label and the same will be used by controller and node pod to establish a connection to Array. This requires enableCustomTopology to be enabled. | false | false |
   | maxIsilonVolumesPerNode | Specify the default value for a maximum number of volumes that the controller can publish to the node. If the value is zero CO SHALL decide how many volumes of this type can be published by the controller to the node. This limit is applicable to all the nodes in the cluster for which node label 'max-isilon-volumes-per-node' is not set. | true | 0 |
   | ***Controller parameters*** | Set nodeSelector and tolerations for controller. |
   | nodeSelector | Define nodeSelector for the controllers, if required. | false | |
   | tolerations | Define tolerations for the controllers, if required. | false | |
   | ***Node parameters*** | Set nodeSelector and tolerations for node pods. |
   | nodeSelector | Define nodeSelector for the node pods, if required. | false | |
   | tolerations | Define tolerations for the node pods, if required. | false | |

   *NOTE:* 

   - User should provide all boolean values with double-quotes. This applies only for *my-isilon-settings.yaml*. Example: "true"/"false"
   - ControllerCount parameter value must not exceed the number of nodes in the Kubernetes cluster. Otherwise, some of the controller pods remain in "Pending" state till new nodes are available for scheduling. The installer exits with a WARNING on the same.
   - Whenever the *certSecretCount* parameter changes in *my-isilon-setting.yaml* user needs to reinstall the driver.
   
    
6. Create a secret file for the OneFS credentials by editing the *secret.json* or *secret.yaml* file present under helm directory. Either *secret.json* or *secret.yaml* can be used for adding the credentials of one or more OneFS storage arrays. The following table lists driver configuration parameters for a single storage array.
   
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | isiIP | "isiIP" defines the HTTPs endpoint of the PowerScale OneFS API server. | true | - |
   | endpoint | This is a new way of defining existing isiIP. User can use either isiIP or endpoint but not both. | true | - |
   | clusterName | PoweScale cluster against which volume CRUD operations are performed through this secret. This is a logical name. | true | - |
   | username | Username for accessing PowerScale OneFS system. | true | - |
   | password | Password for accessing PowerScale OneFS system. | true | - |
   | isDefaultCluster |Defines whether this storage array should be the default. This entry should be present only for one OneFS array and that array will be marked default for existing volumes. | false | false |
   | isDefault | This is a new way of defining the existing isDefaultCluster key. User can use either isDefaultCluster or isDefault key but not both. | false | false |
   | ***Optional parameters*** | Following parameters are Optional if provided will override default values of values.yaml . |
   | isiPort | isiPort defines the HTTPs port number of the PowerScale OneFS API server. | false | 8080 |
   | isiInsecure | "isiInsecure" specifies whether the PowerScale OneFS API server's certificate chain and hostname should be verified. | false | false |
   | skipCertificateValidation | This is a new way of defining the existing isiInsecure key. User can use either skipCertificateValidation or isiInsecure key but not both. | false | false |
   | isiPath | The base path for the volumes to be created. Note: isiPath value provided in the storage class will take the highest precedence while creating PVC.| true | - |
   | LogLevel | Log level of Drivers | false | "debug" |

   The username specified in *secret.json* / *secret.yaml* must be from the authentication providers of PowerScale. The user must have enough privileges to perform the actions. The suggested privileges are as follows:
     

   | Privilege | Type |
   | --------- | ----- |
   | ISI_PRIV_LOGIN_PAPI | Read Only |
   | ISI_PRIV_NFS | Read Write |
   | ISI_PRIV_QUOTA | Read Write |
   | ISI_PRIV_SNAPSHOT | Read Write |
   | ISI_PRIV_IFS_RESTORE | Read Only |
   | ISI_PRIV_NS_IFS_ACCESS | Read Only |

If user creates secret.json, then after editing the file, run the following command to create a secret called 'isilon-creds'
    <br/> `kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.json`  

Alternatively, if user creates secret.yaml, then the secret can be created by running the following command:
     `kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml`
   
   *NOTE:* 
   - If any key/value is present in *secret* file and *my-isilon-settings.yaml*, then the values provided *secret* takes precedence.
   - If any key/value is present in all *my-isilon-settings.yaml*, *secret* and storageClass, then the values provided in storageClass parameters takes precedence.
   - User has to validate the JSON/ yaml syntax and array-related key/values while replacing or appending the isilon-creds secret. The driver will continue to use previous values in case of an error found in the JSON / yaml file.
   - For the key isiIP/endpoint, the user can give either IP address or FQDN. Also user can prefix 'https' (For example, https://192.168.1.1) with the value.
   
7. Install OneFS CA certificates by following the instructions from the next section, if you want to validate OneFS API server's certificates. If not, create an empty secret using the following command and an empty secret must be created for the successful installation of CSI Driver for Dell EMC PowerScale.
    ```
    kubectl create -f emptysecret.yaml
    ```
   This command will create a new secret called `isilon-certs-0` in isilon namespace.
   
8.  Install the driver using `csi-install.sh` bash script by running `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace isilon --values ../helm/my-isilon-settings.yaml` (assuming that the current working directory is 'helm' and my-isilon-settings.yaml is also present under 'helm' directory)

## Certificate validation for OneFS REST API calls 

The CSI driver exposes an install parameter 'isiInsecure' which determines if the driver
performs client-side verification of the OneFS certificates. The 'isiInsecure' parameter is set to true by default and the driver does not verify the OneFS certificates.

If the 'isiInsecure' or 'skipCertificateValidation' is set to false, then the secret isilon-certs must contain the CA certificate for OneFS. 
If this secret is an empty secret, then the validation of the certificate fails, and the driver fails to start.

If the 'isiInsecure'  or 'skipCertificateValidation' parameter is set to false and a previous installation attempt to create the empty secret, then this secret must be deleted and re-created using the CA certs. If the OneFS certificate is self-signed, then perform the following steps:

### Procedure

1. To fetch the certificate, run `openssl s_client -showcerts -connect [OneFS IP] </dev/null 2>/dev/null | openssl x509 -outform PEM > ca_cert_0.pem`
2. To create the certs secret, run `kubectl create secret generic isilon-certs-0 --from-file=cert-0=ca_cert_0.pem -n isilon`  
3. Use the following command to replace the secret <br/> `kubectl create secret generic isilon-certs-0 -n isilon --from-file=cert-0=ca_cert_0.pem -o yaml --dry-run | kubectl replace -f -`

**NOTES:**
1. The OneFS IP can be with or without a port, depends upon the configuration of OneFS API server.
2. The commands are based on the namespace 'isilon'
3. It is highly recommended that ca_cert.pem file(s) having the naming convention as ca_cert_number.pem (example: ca_cert_0, ca_cert_1), where this number starts from 0 and grows as the number of OneFS arrays grows.
4. The cert secret created out of these pem files must have the naming convention as isilon-certs-number (example: isilon-certs-0, isilon-certs-1, and so on.); The number must start from zero and must grow in incremental order. The number of the secrets created out of pem files should match certSecretCount value in myvalues.yaml or my-isilon-settings.yaml.

### Dynamic update of array details via secret.json

CSI Driver for Dell EMC PowerScale now provides supports for Multi cluster. Now users can link the single CSI Driver to multiple OneFS Clusters by updating *secret.json* or *secret.yaml*. User can now update the isilon-creds secret by editing the *secret.json* or *secret.yaml* and executing the following command (replace secret.json with secret.yaml based on need)

`kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.json -o yaml --dry-run=client | kubectl replace -f -`
&nbsp;

**Note**: Updating isilon-certs-x secrets is a manual process, unlike isilon-creds. Users have to re-install the driver in case of updating/adding the SSL certificates or changing the certSecretCount parameter.


## Storage Classes

The CSI driver for Dell EMC PowerScale version 1.5 and later, `dell-csi-helm-installer` does not create any storage classes as part of the driver installation. A wide set of annotated storage class manifests have been provided in the `helm/samples` folder. Use these samples to create new storage classes to provision storage. See this [note](../../../../v2/installation/helm/isilon/#storage-classes) for the driving reason behind this change.

### What happens to my existing storage classes?

*Upgrading from CSI PowerScale v1.5 driver*
The storage classes created as part of the installation have an annotation - "helm.sh/resource-policy": keep set. This ensures that even after an uninstall or upgrade, the storage classes are not deleted. You can continue using these storage classes if you wish so.

*Upgrading from an older version of the driver*
It is strongly recommended to upgrade the earlier versions of CSI PowerScale to 1.5 before upgrading to 1.6.

*NOTE*:
- At least one storage class is required for one array.
- If you uninstall the driver and reinstall it, you can still face errors if any update in the `values.yaml` file leads to an update of the storage class(es):

```
    Error: cannot patch "<sc-name>" with kind StorageClass: StorageClass.storage.k8s.io "<sc-name>" is invalid: parameters: Forbidden: updates to parameters are forbidden
```

In case you want to make such updates, ensure to delete the existing storage classes using the `kubectl delete storageclass` command.  
Deleting a storage class has no impact on a running Pod with mounted PVCs. You cannot provision new PVCs until at least one storage class is newly created.

## Volume Snapshot Class

Starting CSI PowerMax v1.7, `dell-csi-helm-installer` will not create any Volume Snapshot Class during the driver installation. There is a sample Volume Snapshot Class manifest present in the _helm/samples/_ folder. Please use this sample to create a new Volume Snapshot Class to create Volume Snapshots.

### What happens to my existing Volume Snapshot Classes?
*Upgrading from CSI PowerScale v1.5 driver*
The existing volume snapshot class will be retained.

*Upgrading from an older version of the driver* :
It is strongly recommended to upgrade the earlier versions of CSI PowerScale to 1.5 before upgrading to 1.6.
