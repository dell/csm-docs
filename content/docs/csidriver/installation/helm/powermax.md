---
title: PowerMax
linktitle: PowerMax 
description: >
  Installing CSI Driver for PowerMax via Helm
---

CSI Driver for Dell EMC PowerMax can be deployed by using the provided Helm v3 charts and installation scripts on both Kubernetes and OpenShift platforms. For more detailed information on the installation scripts, see the script [documentation](https://github.com/dell/csi-powermax/tree/master/dell-csi-helm-installer).

The controller section of the Helm chart installs the following components in a _Deployment_ in the specified namespace:
- CSI Driver for Dell EMC PowerMax
- Kubernetes External Provisioner, which provisions the volumes
- Kubernetes External Attacher, which attaches the volumes to the containers
- Kubernetes External Snapshotter, which provides snapshot support
- Kubernetes External Resizer, which resizes the volume
- CSI PowerMax ReverseProxy (optional)

The node section of the Helm chart installs the following component in a _DaemonSet_ in the specified namespace:
- CSI Driver for Dell EMC PowerMax
- Kubernetes Node Registrar, which handles the driver registration

## Prerequisites

The following requirements must be met before installing CSI Driver for Dell EMC PowerMax:
- Install Kubernetes or OpenShift (see [supported versions](../../../../csidriver/#features-and-capabilities))
- Install Helm 3
- Fibre Channel requirements
- iSCSI requirements
- Certificate validation for Unisphere REST API calls
- Mount propagation is enabled on container runtime that is being used
- Linux multipathing requirements
- If using Snapshot feature, satisfy all Volume Snapshot requirements

### Install Helm 3

Install Helm 3 on the master node before you install CSI Driver for Dell EMC PowerMax.

**Steps**

  Run the `curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash` command to install Helm 3.


### Fibre Channel Requirements

CSI Driver for Dell EMC PowerMax supports Fibre Channel communication. Ensure that the following requirements are met before you install CSI Driver:
- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port director must be completed.
- Ensure that the HBA WWNs (initiators) appear on the list of initiators that are logged into the array.
- If the number of volumes that will be published to nodes is high, then configure the maximum number of LUNs for your HBAs on each node. See the appropriate HBA document to configure the maximum number of LUNs.

### iSCSI Requirements

The CSI Driver for Dell EMC PowerMax supports iSCSI connectivity. These requirements are applicable for the nodes that use iSCSI initiator to connect to the PowerMax arrays.

Set up the iSCSI initiators as follows:
- All Kubernetes nodes must have the _iscsi-initiator-utils_ package installed.
- Ensure that the iSCSI initiators are available on all the nodes where the driver node plugin will be installed.
- Kubernetes nodes should have access (network connectivity) to an iSCSI director on the Dell EMC PowerMax array that has IP interfaces. Manually create IP routes for each node that connects to the Dell EMC PowerMax if required.
- Ensure that the iSCSI initiators on the nodes are not a part of any existing Host (Initiator Group) on the Dell EMC PowerMax array.
- The CSI Driver needs the port group names containing the required iSCSI director ports. These port groups must be set up on each Dell EMC PowerMax array. All the port group names supplied to the driver must exist on each Dell EMC PowerMax with the same name.

For more information about configuring iSCSI, see [Dell EMC Host Connectivity guide](https://www.delltechnologies.com/asset/zh-tw/products/storage/technical-support/docu5128.pdf).

### Certificate validation for Unisphere REST API calls

As part of the CSI driver installation, the CSI driver requires a secret with the name _powermax-certs_ present in the namespace _powermax_. This secret contains the X509 certificates of the CA which signed the Unisphere SSL certificate in PEM format. This secret is mounted as a volume in the driver container. In earlier releases, if the install script did not find the secret, it created an empty secret with the same name. From the 1.2.0 release, the secret volume has been made optional. The install script no longer attempts to create an empty secret.

The CSI driver exposes an install parameter `skipCertificateValidation` which determines if the driver performs client-side verification of the Unisphere certificates. The `skipCertificateValidation` parameter is set to _true_ by default, and the driver does not verify the Unisphere certificates.

If the `skipCertificateValidation` parameter is set to _false_ and a previous installation attempt created an empty secret, then this secret must be deleted and re-created using the CA certs.

If the Unisphere certificate is self-signed or if you are using an embedded Unisphere, then perform the following steps:
1. To fetch the certificate, run `openssl s_client -showcerts -connect [Unisphere IP]:8443 </dev/null 2> /dev/null | openssl x509 -outform PEM > ca_cert.pem`

   *NOTE*: The IP address varies for each user.

2. To create the secret, run `kubectl create secret generic powermax-certs --from-file=ca_cert.pem -n powermax`

### Ports in the port group

There are no restrictions to how many ports can be present in the iSCSI port groups provided to the driver.

The same applies to Fibre Channel where there are no restrictions on the number of FA directors a host HBA can be zoned to. See the best practices for host connectivity to Dell EMC PowerMax to ensure that you have multiple paths to your data volumes.

### Linux multipathing requirements

CSI Driver for Dell EMC PowerMax supports Linux multipathing. Configure Linux multipathing before installing the CSI Driver.

Set up Linux multipathing as follows:

- All the nodes must have the _Device Mapper Multipathing_ package installed.  
  *NOTE:* When this package is installed it creates a multipath configuration file which is located at `/etc/multipath.conf`. Please ensure that this file always exists.
- Enable multipathing using `mpathconf --enable --with_multipathd y`
- Enable `user_friendly_names` and `find_multipaths` in the `multipath.conf` file.

As a best practice, use the following options to help the operating system and the mulitpathing software detect path changes efficiently:
```text
path_grouping_policy multibus
path_checker tur
features "1 queue_if_no_path"
path_selector "round-robin 0"
no_path_retry 10
```

### (Optional) Volume Snapshot Requirements

Applicable only if you decided to enable snapshot feature in `values.yaml`

```yaml
snapshot:
  enabled: true
```

#### Volume Snapshot CRD's
The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on Github. For installation, use [v4.2.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.2.0/client/config/crd)

#### Volume Snapshot Controller
The CSI external-snapshotter sidecar is split into two controllers to support Volume snapshots.

- A common snapshot controller
- A CSI external-snapshotter sidecar

The common snapshot controller must be installed only once in the cluster, irrespective of the number of CSI drivers installed in the cluster. On OpenShift clusters 4.4 and later, the common snapshot-controller is pre-installed. In the clusters where it is not present, it can be installed using `kubectl` and the manifests are available here: [v4.2.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.2.0/deploy/kubernetes/snapshot-controller)

*NOTE:*
- The manifests available on GitHub install the snapshotter image: 
  [quay.io/k8scsi/csi-snapshotter:v4.0.x](https://quay.io/repository/k8scsi/csi-snapshotter?tag=v4.0.0&tab=tags)
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

### (Optional) Replication feature Requirements

Applicable only if you decided to enable the Replication feature in `values.yaml`

```yaml
replication:
  enabled: true
```
#### Replication CRD's

The CRDs for replication can be obtained and installed from the csm-replication project on Github. Use `csm-replication/deploy/replicationcrds.all.yaml` located in the csm-replication git repo for the installation.

CRDs should be configured during replication prepare stage with repctl as described in [install-repctl](../../../../replication/deployment/install-repctl)

#### Installation example 

You can install CRDs and the default snapshot controller by running the following commands:
```bash
git clone https://github.com/kubernetes-csi/external-snapshotter/
cd ./external-snapshotter
git checkout release-<your-version>
kubectl create -f client/config/crd
kubectl create -f deploy/kubernetes/snapshot-controller
```

*NOTE:*
- It is recommended to use 4.2.x version of snapshotter/snapshot-controller.
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.


## Install the Driver

**Steps**

1. Run `git clone https://github.com/dell/csi-powermax.git` to clone the git repository. This will include the Helm charts and dell-csi-helm-installer scripts.
2. Ensure that you have created a namespace where you want to install the driver. You can run `kubectl create namespace powermax` to create a new one 
3. Edit the `samples/secret/secret.yaml file, point to the correct namespace, and replace the values for the username and password parameters.
    These values can be obtained using base64 encoding as described in the following example:
    ```bash
    echo -n "myusername" | base64
    echo -n "mypassword" | base64
    ```
   where *myusername* and *mypassword* are credentials for a user with PowerMax privileges.
4. Create the secret by running `kubectl create -f samples/secret/secret.yaml`.
5. If you are going to install the new CSI PowerMax ReverseProxy service, create a TLS secret with the name - _csireverseproxy-tls-secret_ which holds an SSL certificate and the corresponding private key in the namespace where you are installing the driver.
6. Copy the default values.yaml file `cd helm && cp csi-powermax/values.yaml my-powermax-settings.yaml`
7. Edit the newly created file and provide values for the following parameters `vi my-powermax-settings.yaml`

| Parameter | Description  | Required   | Default  |
|-----------|--------------|------------|----------|
| kubeletConfigDir | Specify kubelet config dir path | Yes | /var/lib/kubelet |
| imagePullPolicy |  The default pull policy is IfNotPresent which causes the Kubelet to skip pulling an image if it already exists. | Yes | IfNotPresent |
| clusterPrefix | Prefix that is used during the creation of various masking-related entities (Storage Groups, Masking Views, Hosts, and Volume Identifiers) on the array. The value that you specify here must be unique. Ensure that no other CSI PowerMax driver is managing the same arrays that are configured with the same prefix. The maximum length for this prefix is three characters. | Yes  | "ABC" |
| defaultFsType | Used to set the default FS type for external provisioner | Yes | ext4 |
| portGroups | List of comma-separated port group names. Any port group that is specified here must be present on all the arrays that the driver manages.     | For iSCSI Only | "PortGroup1, PortGroup2, PortGroup3" |
| storageResourcePool | This parameter must mention one of the SRPs on the PowerMax array that the symmetrixID specifies. This value is used to create the default storage class. | Yes| "SRP_1" |
| serviceLevel  | This parameter must mention one of the Service Levels on the PowerMax array. This value is used to create the default storage class.   | Yes| "Bronze"     |
| skipCertificateValidation | Skip client-side TLS verification of Unisphere certificates | No | "True" |
| transportProtocol  | Set the preferred transport protocol for the Kubernetes cluster which helps the driver choose between FC and iSCSI when a node has both FC and iSCSI connectivity to a PowerMax array.| No | Empty|
| nodeNameTemplate | Used to specify a template that will be used by the driver to create Host/IG names on the PowerMax array. To use the default naming convention, leave this value empty.  | No | Empty|
| **controller** | Allows configuration of the controller-specific parameters.| - | - |
| controllerCount | Defines the number of csi-powerscale controller pods to deploy to the Kubernetes release| Yes | 2 |
| volumeNamePrefix | Defines a string prefix for the names of PersistentVolumes created | Yes | "k8s" |
| snapshot.enabled | Enable/Disable volume snapshot feature | Yes | true |
| snapshot.snapNamePrefix | Defines a string prefix for the names of the Snapshots created | Yes | "snapshot" |
| resizer.enabled | Enable/Disable volume expansion feature | Yes | true |
| nodeSelector | Define node selection constraints for pods of controller deployment | No | |
| tolerations | Define tolerations for the controller deployment, if required | No | |
| **node** | Allows configuration of the node-specific parameters.| - | - |
| tolerations | Add tolerations as per requirement | No | - |
| nodeSelector | Add node selectors as per requirement | No | - |
| **global**| This section refers to configuration options for both CSI PowerMax Driver and Reverse Proxy | - | - |
|defaultCredentialsSecret| This secret name refers to:<br> 1. The Unisphere credentials if the driver is installed without proxy or with proxy in Linked mode.<br>2. The proxy credentials if the driver is installed with proxy in StandAlone mode.<br>3. The default Unisphere credentials if credentialsSecret is not specified for a management server.| Yes | powermax-creds |
| storageArrays| This section refers to the list of arrays managed by the driver and Reverse Proxy in StandAlone mode.| - | - |
| storageArrayId | This refers to PowerMax Symmetrix ID.| Yes | 000000000001|
| endpoint | This refers to the URL of the Unisphere server managing _storageArrayId_. Endpoint should be the HTTPS localhost endpoint that the authorization sidecar will listen on if authorization is enabled| Yes if Reverse Proxy mode is _StandAlone_ | https://primary-1.unisphe.re:8443 |
| backupEndpoint | This refers to the URL of the backup Unisphere server managing _storageArrayId_, if Reverse Proxy is installed in _StandAlone_ mode. BackupEndpoint should be the HTTPS localhost endpoint that the authorization sidecar will listen on if authorization is enabled| No | https://backup-1.unisphe.re:8443 |
| managementServers | This section refers to the list of configurations for Unisphere servers managing powermax arrays.| - | - |
| endpoint | This refers to the URL of the Unisphere server. Endpoint should be the HTTPS localhost endpoint that the authorization sidecar will listen on if authorization is enabled | Yes | https://primary-1.unisphe.re:8443 |
| credentialsSecret| This refers to the user credentials for _endpoint_ | No| primary-1-secret|
| skipCertificateValidation | This parameter should be set to false if you want to do client-side TLS verification of Unisphere for PowerMax SSL certificates.| No | "True"       |
| certSecret    |  The name of the secret in the same namespace containing the CA certificates of the Unisphere server | Yes, if skipCertificateValidation is set to false | Empty|
| limits | This refers to various limits for Reverse Proxy | No | - |
| maxActiveRead | This refers to the maximum concurrent READ request handled by the reverse proxy.| No | 5 |
| maxActiveWrite | This refers to the maximum concurrent WRITE request handled by the reverse proxy.| No | 4 |
| maxOutStandingRead | This refers to maximum queued READ request when reverse proxy receives more than _maxActiveRead_ requests. | No | 50 |
| maxOutStandingWrite| This refers to maximum queued WRITE request when reverse proxy receives more than _maxActiveWrite_ requests.| No | 50 | 
| **csireverseproxy**| This section refers to the configuration options for CSI PowerMax Reverse Proxy  |  -  | - |
| enabled |  Boolean parameter which indicates if CSI PowerMax Reverse Proxy is going to be configured and installed.<br>**NOTE:** If not enabled, then there is no requirement to configure any of the following values. | No | "False" |
| image | This refers to the image of the CSI Powermax Reverse Proxy container. | Yes | dellemc/csipowermax-reverseproxy:v1.4.0 |
| tlsSecret | This refers to the TLS secret of the Reverse Proxy Server.| Yes | csirevproxy-tls-secret |
| deployAsSidecar | If set to _true_, the Reverse Proxy is installed as a sidecar to the driver's controller pod otherwise it is installed as a separate deployment.| Yes | "True" |
| port  | Specify the port number that is used by the NodePort service created by the CSI PowerMax Reverse Proxy installation| Yes | 2222 |
| mode | This refers to the installation mode of Reverse Proxy. It can be set to:<br> 1. _Linked_: In this mode, the Reverse Proxy communicates with a primary or a backup Unisphere managing the same set of arrays.<br>2. _StandAlone_: In this mode, the Reverse Proxy communicates with multiple arrays managed by different Unispheres.| Yes | "StandAlone" |
| **authorization** | [Authorization](../../../../authorization/deployment) is an optional feature to apply credential shielding of the backend PowerMax. | - | - |
| enabled                  | A boolean that enables/disables authorization feature. |  No      |   false   |
| sidecarProxyImage | Image for csm-authorization-sidecar. | No | " " |
| proxyHost | Hostname of the csm-authorization server. | No | Empty |
| skipCertificateValidation | A boolean that enables/disables certificate validation of the csm-authorization server. | No | true |

8. Install the driver using `csi-install.sh` bash script by running `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace powermax --values ../helm/my-powermax-settings.yaml`

*Note:* 
- For detailed instructions on how to run the install scripts, see the readme document in the dell-csi-helm-installer folder.
- There are a set of samples provided [here](#sample-values-file) to help you configure the driver with reverse proxy
- This script also runs the verify.sh script in the same directory. You will be prompted to enter the credentials for each of the Kubernetes nodes. The `verify.sh` script needs the credentials to check if the iSCSI initiators have been configured on all nodes. You can also skip the verification step by specifying the `--skip-verify-node` option
- In order to enable authorization, there should be an authorization proxy server already installed. 

## Storage Classes

Starting CSI PowerMax v1.6, `dell-csi-helm-installer` will not create any storage classes as part of the driver installation. A wide set of annotated storage class manifests has been provided in the `samples/storageclass` folder. Please use these samples to create new storage classes to provision storage.

### What happens to my existing storage classes?

Upgrading from an older version of the driver: The storage classes will be deleted if you upgrade the driver. To continue using those storage classes, you can patch them and apply the annotation “helm.sh/resource-policy”: keep before performing an upgrade.

>Note: If you continue to use the old storage classes, you may not be able to take advantage of any new storage class parameter supported by the driver.

## Volume Snapshot Class

Starting with CSI PowerMax v1.7, `dell-csi-helm-installer` will not create any Volume Snapshot Class during the driver installation. There is a sample Volume Snapshot Class manifest present in the _samples/volumesnapshotclass_ folder. Please use this sample to create a new Volume Snapshot Class to create Volume Snapshots.

### What happens to my existing Volume Snapshot Classes?

*Upgrading from CSI PowerMax v1.7 driver*:
The existing volume snapshot class will be retained.

*Upgrading from an older version of the driver*:
It is strongly recommended to upgrade the earlier versions of CSI PowerMax to 1.7 before upgrading to 2.0.

## Sample values file
The following sections have useful snippets from `values.yaml` file which provides more information on how to configure the CSI PowerMax driver along with CSI PowerMax ReverseProxy in various modes

### CSI PowerMax driver without Proxy
In this mode, the CSI PowerMax driver can only connect to a single `Unisphere` server. So, you just specify a list of storage arrays
and the address of the `Unisphere` server

```yaml
global:
  defaultCredentialsSecret: powermax-creds
  storageArrays:
    - storageArrayId: "000000000001"
    - storageArrayId: "000000000002"
  managementServers:
    - endpoint: https://unisphere-address:8443
```

>Note: If you provide multiple endpoints in the list of management servers, the installer will only use the first server in the list

### CSI PowerMax driver with Proxy in Linked mode
In this mode, the CSI PowerMax ReverseProxy acts as a `passthrough` for the RESTAPI calls and only provides limited functionality
such as rate limiting, backup Unisphere server. The CSI PowerMax driver is still responsible for the authentication with the Unisphere server.

The first endpoint in the list of management servers is the primary Unisphere server and if you provide a second endpoint, then
it will be considered as the backup Unisphere's endpoint.

```yaml
global:
  defaultCredentialsSecret: powermax-creds
  storageArrays:
    - storageArrayId: "000000000001"
    - storageArrayId: "000000000002"
  managementServers:
    - endpoint: https://primary-unisphere:8443
      skipCertificateValidation: false
      certSecret: primary-cert
      limits:
        maxActiveRead: 5
        maxActiveWrite: 4
        maxOutStandingRead: 50
        maxOutStandingWrite: 50
    - endpoint: https://backup-unisphere:8443 #Optional

# "csireverseproxy" refers to the subchart csireverseproxy
csireverseproxy:
  # Set enabled to true if you want to use proxy
  enabled: true
  image: dellemc/csipowermax-reverseproxy:v1.4.0
  tlsSecret: csirevproxy-tls-secret
  deployAsSidecar: true
  port: 2222
  mode: Linked
```

>Note: Since the driver is still responsible for authentication when used with Proxy in `Linked` mode, the credentials for both
> primary and backup Unisphere need to be the same.

### CSI PowerMax driver with Proxy in StandAlone mode
This is the most advanced configuration which provides you with the capability to connect to Multiple Unisphere servers.
You can specify primary and backup Unisphere servers for each storage array. If you have different credentials for your Unisphere servers, you can also specify different credential secrets.

```yaml
global:
  defaultCredentialsSecret: powermax-creds
  storageArrays:
    - storageArrayId: "000000000001"
      endpoint: https://primary-1.unisphe.re:8443
      backupEndpoint: https://backup-1.unisphe.re:8443
    - storageArrayId: "000000000002"
      endpoint: https://primary-2.unisphe.re:8443
      backupEndpoint: https://backup-2.unisphe.re:8443
  managementServers:
    - endpoint: https://primary-1.unisphe.re:8443
      credentialsSecret: primary-1-secret
      skipCertificateValidation: false
      certSecret: primary-cert
      limits:
        maxActiveRead: 5
        maxActiveWrite: 4
        maxOutStandingRead: 50
        maxOutStandingWrite: 50
    - endpoint: https://backup-1.unisphe.re:8443
      credentialsSecret: backup-1-secret
      skipCertificateValidation: true
    - endpoint: https://primary-2.unisphe.re:8443
      credentialsSecret: primary-2-secret
      skipCertificateValidation: true
    - endpoint: https://backup-2.unisphe.re:8443
      credentialsSecret: backup-2-secret
      skipCertificateValidation: true

# "csireverseproxy" refers to the subchart csireverseproxy
csireverseproxy:
  # Set enabled to true if you want to use proxy
  enabled: true
  image: dellemc/csipowermax-reverseproxy:v1.4.0
  tlsSecret: csirevproxy-tls-secret
  deployAsSidecar: true
  port: 2222
  mode: StandAlone
```

>Note: If the credential secret is missing from any management server details, the installer will try to use the defaultCredentialsSecret
