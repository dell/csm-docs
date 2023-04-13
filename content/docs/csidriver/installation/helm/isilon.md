---
title: PowerScale
description: >
  Installing CSI Driver for PowerScale via Helm
---
The CSI Driver for Dell PowerScale can be deployed by using the provided Helm v3 charts and installation scripts on both Kubernetes and OpenShift platforms. For more detailed information on the installation scripts, review the script [documentation](https://github.com/dell/csi-powerscale/tree/master/dell-csi-helm-installer).

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

The following are requirements to be met before installing the CSI Driver for Dell PowerScale:
- Install Kubernetes or OpenShift (see [supported versions](../../../../csidriver/#features-and-capabilities))
- Install Helm 3
- Mount propagation is enabled on container runtime that is being used
- `nfs-utils` package must be installed on nodes that will mount volumes
- If using Snapshot feature, satisfy all Volume Snapshot requirements
- If enabling CSM for Authorization, please refer to the [Authorization deployment steps](../../../../authorization/deployment/) first
- If enabling CSM for Replication, please refer to the [Replication deployment steps](../../../../replication/deployment/) first
- If enabling CSM for Resiliency, please refer to the [Resiliency deployment steps](../../../../resiliency/deployment/) first
- If enabling Encryption, please refer to the [Encryption deployment steps](../../../../secure/encryption/deployment/) first

### Install Helm 3.0

Install Helm 3.0 on the master node before you install the CSI Driver for Dell PowerScale.

**Steps**

  Run the `curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash` command to install Helm 3.0.

### (Optional) Volume Snapshot Requirements

Applicable only if you decided to enable snapshot feature in `values.yaml`

```yaml
controller:
  snapshot:
    enabled: true
```

#### Volume Snapshot CRD's
The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on Github. Manifests are available here:[v6.2.1](https://github.com/kubernetes-csi/external-snapshotter/tree/v6.2.1/client/config/crd)

#### Volume Snapshot Controller
The CSI external-snapshotter sidecar is split into two controllers:
- A common snapshot controller
- A CSI external-snapshotter sidecar

The common snapshot controller must be installed only once in the cluster irrespective of the number of CSI drivers installed in the cluster. On OpenShift clusters 4.4 and later, the common snapshot-controller is pre-installed. In the clusters where it is not present, it can be installed using `kubectl` and the manifests are available here: [v6.2.1](https://github.com/kubernetes-csi/external-snapshotter/tree/v6.2.1/deploy/kubernetes/snapshot-controller)

*NOTE:*
- The manifests available on GitHub install the snapshotter image:
   - [quay.io/k8scsi/csi-snapshotter:v4.0.x](https://quay.io/repository/k8scsi/csi-snapshotter?tag=v4.0.0&tab=tags)
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.


#### Installation example
You can install CRDs and the default snapshot controller by running these commands:
```bash
git clone https://github.com/kubernetes-csi/external-snapshotter/
cd ./external-snapshotter
git checkout release-<your-version>
kubectl kustomize client/config/crd | kubectl create -f -
kubectl -n kube-system kustomize deploy/kubernetes/snapshot-controller | kubectl create -f -
```

*NOTE:*
- It is recommended to use 6.2.x version of snapshotter/snapshot-controller.

### (Optional) Volume Health Monitoring
Volume Health Monitoring feature is optional and by default this feature is disabled for drivers when installed via helm.

If enabled capacity metrics (used & free capacity, used & free inodes) for PowerScale PV will be expose in Kubernetes metrics API.

To enable this feature, add the below block to the driver manifest before installing the driver. This ensures to install external
health monitor sidecar. To get the volume health state value under controller should be set to true as seen below. To get the
volume stats value under node should be set to true.
```yaml
controller:
  healthMonitor:
    # enabled: Enable/Disable health monitor of CSI volumes
    # Allowed values:
    #   true: enable checking of health condition of CSI volumes
    #   false: disable checking of health condition of CSI volumes
    # Default value: None
    enabled: false
    # interval: Interval of monitoring volume health condition
    # Allowed values: Number followed by unit (s,m,h)
    # Examples: 60s, 5m, 1h
    # Default value: 60s
    interval: 60s
node:
  healthMonitor:
    # enabled: Enable/Disable health monitor of CSI volumes- volume usage, volume condition
    # Allowed values:
    #   true: enable checking of health condition of CSI volumes
    #   false: disable checking of health condition of CSI volumes
    # Default value: None
    enabled: false
```

### (Optional) Replication feature Requirements
Applicable only if you decided to enable the Replication feature in `values.yaml`

```yaml
replication:
  enabled: true
```

#### Replication CRD's

The CRDs for replication can be obtained and installed from the csm-replication project on Github. Use `csm-replication/deploy/replicationcrds.all.yaml` located in the csm-replication git repo for the installation.

CRDs should be configured during replication prepare stage with repctl as described in [install-repctl](../../../../replication/deployment/install-repctl)

## Install the Driver

**Steps**
1. Run `git clone -b v2.6.1 https://github.com/dell/csi-powerscale.git` to clone the git repository.
2. Ensure that you have created the namespace where you want to install the driver. You can run `kubectl create namespace isilon` to create a new one. The use of "isilon"  as the namespace is just an example. You can choose any name for the namespace.
3. Collect information from the PowerScale Systems like IP address, IsiPath, username, and password. Make a note of the value for these parameters as they must be entered in the *secret.yaml*.
4. Copy *the helm/csi-isilon/values.yaml* into a new location with name say *my-isilon-settings.yaml*, to customize settings for installation.
5. Edit *my-isilon-settings.yaml* to set the following parameters for your installation:
   The following table lists the primary configurable parameters of the PowerScale driver Helm chart and their default values. More detailed information can be
   found in the  [`values.yaml`](https://github.com/dell/csi-powerscale/blob/master/helm/csi-isilon/values.yaml) file in this repository.

   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |  
| driverRepository | Set to give the repository containing the driver image (used as part of the image name). | Yes | dellemc |
   | logLevel | CSI driver log level | No | "debug" |
   | certSecretCount | Defines the number of certificate secrets, which the user is going to create for SSL authentication. (isilon-cert-0..isilon-cert-(n-1)); Minimum value should be 1.| Yes | 1 |
   | [allowedNetworks](../../../features/powerscale/#support-custom-networks-for-nfs-io-traffic) | Defines the list of networks that can be used for NFS I/O traffic, CIDR format must be used. | No | [ ] |
   | maxIsilonVolumesPerNode | Defines the default value for a maximum number of volumes that the controller can publish to the node. If the value is zero CO SHALL decide how many volumes of this type can be published by the controller to the node. This limit is applicable to all the nodes in the cluster for which node label 'max-isilon-volumes-per-node' is not set. | Yes | 0 |
   | imagePullPolicy | Defines the policy to determine if the image should be pulled prior to starting the container | Yes | IfNotPresent |
   | verbose | Indicates what content of the OneFS REST API message should be logged in debug level logs | Yes | 1 |
   | kubeletConfigDir | Specify kubelet config dir path | Yes | "/var/lib/kubelet" |
   | enableCustomTopology | Indicates PowerScale FQDN/IP which will be fetched from node label and the same will be used by controller and node pod to establish a connection to Array. This requires enableCustomTopology to be enabled. | No | false |
   | fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType` | No | "ReadWriteOnceWithFSType" |
   | podmonAPIPort | Defines the port which csi-driver will use within the cluster to support podmon | No | 8083 |
   | maxPathLen | Defines the maximum length of path for a volume | No | 192 |
   | ***controller*** | Configure controller pod specific parameters | | |
   | controllerCount | Defines the number of csi-powerscale controller pods to deploy to the Kubernetes release| Yes | 2 |
   | volumeNamePrefix | Defines a string prefix for the names of PersistentVolumes created | Yes | "k8s" |
   | snapshot.enabled | Enable/Disable volume snapshot feature | Yes | true |
   | snapshot.snapNamePrefix | Defines a string prefix for the names of the Snapshots created | Yes | "snapshot" |
   | resizer.enabled | Enable/Disable volume expansion feature | Yes | true |
   | healthMonitor.enabled | Enable/Disable health monitor of CSI volumes- volume status, volume condition | Yes | false |
   | healthMonitor.interval | Interval of monitoring volume health condition | Yes | 60s |
   | nodeSelector | Define node selection constraints for pods of controller deployment | No | |
   | tolerations | Define tolerations for the controller deployment, if required | No | |
   | leader-election-lease-duration | Duration, that non-leader candidates will wait to force acquire leadership | No | 20s |
   | leader-election-renew-deadline   | Duration, that the acting leader will retry refreshing leadership before giving up  | No | 15s |
   | leader-election-retry-period   | Duration, the LeaderElector clients should wait between tries of actions  | No | 5s |
   | ***node*** | Configure node pod specific parameters | | |
   | nodeSelector | Define node selection constraints for pods of node daemonset | No | |
   | tolerations | Define tolerations for the node daemonset, if required | No | |
   | dnsPolicy | Define the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
   | healthMonitor.enabled | Enable/Disable health monitor of CSI volumes- volume usage, volume condition | Yes | false |
   | ***PLATFORM ATTRIBUTES*** | | | |   
   | endpointPort | Define the HTTPs port number of the PowerScale OneFS API server. If authorization is enabled, endpointPort should be the HTTPS localhost port that the authorization sidecar will listen on. This value acts as a default value for endpointPort, if not specified for a cluster config in secret. | No | 8080 |
   | skipCertificateValidation | Specify whether the PowerScale OneFS API server's certificate chain and hostname must be verified. This value acts as a default value for skipCertificateValidation, if not specified for a cluster config in secret. | No | true |
   | isiAuthType | Indicates the authentication method to be used. If set to 1 then it follows as session-based authentication else basic authentication | No | 0 |
   | isiAccessZone | Define the name of the access zone a volume can be created in. If storageclass is missing with AccessZone parameter, then value of isiAccessZone is used for the same. | No | System |
   | enableQuota | Indicates whether the provisioner should attempt to set (later unset) quota on a newly provisioned volume. This requires SmartQuotas to be enabled.| No | true |   
   | isiPath | Define the base path for the volumes to be created on PowerScale cluster. This value acts as a default value for isiPath, if not specified for a cluster config in secret| No | /ifs/data/csi |
   | ignoreUnresolvableHosts | Allows new host to add to existing export list though any of the existing hosts from the same exports are unresolvable/doesn't exist anymore. | No | false |
   | noProbeOnStart | Define whether the controller/node plugin should probe all the PowerScale clusters during driver initialization | No | false |
   | autoProbe | Specify if automatically probe the PowerScale cluster if not done already during CSI calls | No | true |
   | **authorization** | [Authorization](../../../../authorization/deployment) is an optional feature to apply credential shielding of the backend PowerScale. | - | - |
   | enabled                  | A boolean that enables/disables authorization feature. |  No      |   false   |
   | sidecarProxyImage | Image for csm-authorization-sidecar. | No | " " |
   | proxyHost | Hostname of the csm-authorization server. | No | Empty |
   | skipCertificateValidation | A boolean that enables/disables certificate validation of the csm-authorization server. | No | true |
   | **podmon**               | [Podmon](../../../../resiliency/deployment) is an optional feature to enable application pods to be resilient to node failure.  |  -        |  -       |
   | enabled                  | A boolean that enables/disables podmon feature. |  No      |   false   |
   | image | image for podmon. | No | " " |
   | **encryption** | [Encryption](../../../../secure/encryption/deployment) is an optional feature to apply encryption to CSI volumes. | - | - |
   | enabled        | A boolean that enables/disables Encryption feature. | No | false |
   | image | Encryption driver image name. | No | "dellemc/csm-encryption:v0.3.0" |
   
   *NOTE:* 

   - ControllerCount parameter value must not exceed the number of nodes in the Kubernetes cluster. Otherwise, some of the controller pods remain in a "Pending" state till new nodes are available for scheduling. The installer exits with a WARNING on the same.
   - Whenever the *certSecretCount* parameter changes in *my-isilon-setting.yaml* user needs to reinstall the driver.
   - In order to enable authorization, there should be an authorization proxy server already installed.
   - If you are using a custom image, check the *version* and *driverRepository* fields in *my-isilon-setting.yaml* to make sure that they are pointing to the correct image repository and driver version. These two fields are spliced together to form the image name, as shown here: <driverRepository>/csi-isilon:v<version>
   
    
6. Edit following parameters in samples/secret/secret.yaml file and update/add connection/authentication information for one or more PowerScale clusters.
   
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | clusterName | Logical name of PoweScale cluster against which volume CRUD operations are performed through this secret. | Yes | - |
   | username | username for connecting to PowerScale OneFS API server | Yes | - |
   | password | password for connecting to PowerScale OneFS API server | Yes | - |
   | endpoint | HTTPS endpoint of the PowerScale OneFS API server. If authorization is enabled, endpoint should be the HTTPS localhost endpoint that the authorization sidecar will listen on | Yes | - |
   | isDefault | Indicates if this is a default cluster (would be used by storage classes without ClusterName parameter). Only one of the cluster config should be marked as default. | No | false |
   | ***Optional parameters*** | Following parameters are Optional. If specified will override default values from values.yaml. |
   | skipCertificateValidation | Specify whether the PowerScale OneFS API server's certificate chain and hostname must be verified. | No | default value from values.yaml |
   | ignoreUnresolvableHosts | Allows new host to add to existing export list though any of the existing hosts from the same exports are unresolvable/doesn't exist anymore. | No | default value from values.yaml |
   | endpointPort | Specify the HTTPs port number of the PowerScale OneFS API server | No | default value from values.yaml |
   | isiPath | The base path for the volumes to be created on PowerScale cluster. Note: IsiPath parameter in storageclass, if present will override this attribute. | No | default value from values.yaml |
   | mountEndpoint | Endpoint of the PowerScale OneFS API server, for example, 10.0.0.1. This must be specified if [CSM-Authorization](https://github.com/dell/karavi-authorization) is enabled. | No | - |

### User privileges
   The username specified in *secret.yaml* must be from the authentication providers of PowerScale. The user must have enough privileges to perform the actions. The suggested privileges are as follows:

   | Privilege              | Type       |
   | ---------------------- | ---------- |
   | ISI_PRIV_LOGIN_PAPI    | Read Only  |
   | ISI_PRIV_NFS           | Read Write |
   | ISI_PRIV_QUOTA         | Read Write |
   | ISI_PRIV_SNAPSHOT      | Read Write |
   | ISI_PRIV_IFS_RESTORE   | Read Only  |
   | ISI_PRIV_NS_IFS_ACCESS | Read Only  |
   | ISI_PRIV_IFS_BACKUP    | Read Only  |
   | ISI_PRIV_SYNCIQ        | Read Write |

Create isilon-creds secret using the following command:
  <br/> `kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml`
   
   *NOTE:* 
   - If any key/value is present in all *my-isilon-settings.yaml*, *secret*, and storageClass, then the values provided in storageClass parameters take precedence.
   - The user has to validate the yaml syntax and array-related key/values while replacing or appending the isilon-creds secret. The driver will continue to use previous values in case of an error found in the yaml file.
   - For the key isiIP/endpoint, the user can give either IP address or FQDN. Also, the user can prefix 'https' (For example, https://192.168.1.1) with the value.
   - The *isilon-creds* secret has a *mountEndpoint* parameter which should only be updated and used when [Authorization](../../../../authorization) is enabled.
   
7. Install OneFS CA certificates by following the instructions from the next section, if you want to validate OneFS API server's certificates. If not, create an empty secret using the following command and an empty secret must be created for the successful installation of CSI Driver for Dell PowerScale.
    ```
    kubectl create -f empty-secret.yaml
    ```
   This command will create a new secret called `isilon-certs-0` in isilon namespace.
   
8.  Install the driver using `csi-install.sh` bash script by running `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace isilon --values ../helm/my-isilon-settings.yaml` (assuming that the current working directory is 'helm' and my-isilon-settings.yaml is also present under 'helm' directory)

## Certificate validation for OneFS REST API calls 

The CSI driver exposes an install parameter 'skipCertificateValidation' which determines if the driver
performs client-side verification of the OneFS certificates. The 'skipCertificateValidation' parameter is set to true by default and the driver does not verify the OneFS certificates.

If the 'skipCertificateValidation' is set to false, then the secret isilon-certs must contain the CA certificate for OneFS. 
If this secret is an empty secret, then the validation of the certificate fails, and the driver fails to start.

If the 'skipCertificateValidation' parameter is set to false and a previous installation attempt to create the empty secret, then this secret must be deleted and re-created using the CA certs. If the OneFS certificate is self-signed, then perform the following steps:

### Procedure

1. To fetch the certificate, run `openssl s_client -showcerts -connect [OneFS IP] </dev/null 2>/dev/null | openssl x509 -outform PEM > ca_cert_0.pem`
2. To create the certs secret, run `kubectl create secret generic isilon-certs-0 --from-file=cert-0=ca_cert_0.pem -n isilon`  
3. Use the following command to replace the secret <br/> `kubectl create secret generic isilon-certs-0 -n isilon --from-file=cert-0=ca_cert_0.pem -o yaml --dry-run | kubectl replace -f -`

**NOTES:**
1. The OneFS IP can be with or without a port, depends upon the configuration of OneFS API server.
2. The commands are based on the namespace 'isilon'
3. It is highly recommended that ca_cert.pem file(s) having the naming convention as ca_cert_number.pem (example: ca_cert_0, ca_cert_1), where this number starts from 0 and grows as the number of OneFS arrays grows.
4. The cert secret created out of these pem files must have the naming convention as isilon-certs-number (example: isilon-certs-0, isilon-certs-1, and so on.); The number must start from zero and must grow in incremental order. The number of the secrets created out of pem files should match certSecretCount value in myvalues.yaml or my-isilon-settings.yaml.

### Dynamic update of array details via secret.yaml

CSI Driver for Dell PowerScale now provides supports for Multi cluster. Now users can link the single CSI Driver to multiple OneFS Clusters by updating *secret.yaml*. Users can now update the isilon-creds secret by editing the *secret.yaml* and executing the following command

`kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml -o yaml --dry-run=client | kubectl replace -f -`


**Note**: Updating isilon-certs-x secrets is a manual process, unlike isilon-creds. Users have to re-install the driver in case of updating/adding the SSL certificates or changing the certSecretCount parameter.


## Storage Classes

The CSI driver for Dell PowerScale version 1.5 and later, `dell-csi-helm-installer` does not create any storage classes as part of the driver installation. A sample storage class manifest is available at `samples/storageclass/isilon.yaml`. Use this sample manifest to create a storageclass to provision storage; uncomment/ update the manifest as per the requirements.    

### What happens to my existing storage classes?

*Upgrading from CSI PowerScale v2.3 driver*:
The storage classes created as part of the installation have an annotation - "helm.sh/resource-policy": keep set. This ensures that even after an uninstall or upgrade, the storage classes are not deleted. You can continue using these storage classes if you wish so.

*NOTE*:
- At least one storage class is required for one array.
- If you uninstall the driver and reinstall it, you can still face errors if any update in the `values.yaml` file leads to an update of the storage class(es):

```
    Error: cannot patch "<sc-name>" with kind StorageClass: StorageClass.storage.k8s.io "<sc-name>" is invalid: parameters: Forbidden: updates to parameters are forbidden
```

In case you want to make such updates, ensure to delete the existing storage classes using the `kubectl delete storageclass` command.  
Deleting a storage class has no impact on a running Pod with mounted PVCs. You cannot provision new PVCs until at least one storage class is newly created.

>Note: If you continue to use the old storage classes, you may not be able to take advantage of any new storage class parameter supported by the driver.

## Volume Snapshot Class

Starting CSI PowerScale v1.6, `dell-csi-helm-installer` will not create any Volume Snapshot Class during the driver installation. Sample volume snapshot class manifests are available at `samples/volumesnapshotclass/`. Use these sample manifests to create a volumesnapshotclass for creating volume snapshots; uncomment/ update the manifests as per the requirements.

## Silent Mount Re-tries (v2.6.0)
There are race conditions, when completing the ControllerPublish call to populate the client to volumes export list takes longer time than usual due to background NFS refresh process on OneFS wouldn't have completed at same time, resulted in error:"mount failed" with initial attempts and might log success after few re-tries. This unnecessarily logs false positive "mount failed" error logs and to overcome this scenario Driver does silent mount re-tries attempts after every two sec. (five attempts max) for every NodePublish Call and allows successful mount within five re-tries without logging any mount error messages.
"mount failed" will be logged once these five mount retrial attempts are exhausted and still client is not populated to export list.

Mount Re-tries handles below scenarios:
- Access denied by server while mounting (NFSv3)
- No such file or directory (NFSv4)

*Sample*:
```
level=error clusterName=powerscale runid=10 msg="mount failed: exit status 32
mounting arguments: -t nfs -o rw XX.XX.XX.XX:/ifs/data/csi/k8s-ac7b91962d /var/lib/kubelet/pods/9f72096a-a7dc-4517-906c-20697f9d7375/volumes/kubernetes.io~csi/k8s-ac7b91962d/mount
output: mount.nfs: access denied by server while mounting XX.XX.XX.XX:/ifs/data/csi/k8s-ac7b91962d
```

