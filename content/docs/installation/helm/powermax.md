---
title: PowerMax
linktitle: PowerMax 
description: >
  Installing PowerMax CSI Driver via Helm
---

The CSI Driver for Dell EMC PowerMax can be deployed by using the provided Helm v3 charts and installation scripts on both Kubernetes and OpenShift platforms. For more detailed information on the installation scripts, see the script [documentation](https://github.com/dell/csi-unity/tree/master/dell-csi-helm-installer).

The controller section of the Helm chart installs the following components in a _Deployment_ in the `powermax` namespace:
- CSI Driver for Dell EMC PowerMax
- Kubernetes External Provisioner, which provisions the volumes
- Kubernetes External Attacher, which attaches the volumes to the containers
- Kubernetes External Snapshotter, which provides snapshot support
- Kubernetes External Resizer, which resizes the volume

The node section of the Helm chart installs the following component in a _DaemonSet_ in the namespace `powermax`:
- CSI Driver for Dell EMC PowerMax
- Kubernetes Node Registrar, which handles the driver registration

## Prerequisites

The following requirements must be met before installing the CSI Driver for Dell EMC PowerMax:
- Install Kubernetes or OpenShift (see [supported versions](../../../dell-csi-driver/))
- Install Helm 3
- Fibre Channel requirements
- iSCSI requirements
- Certificate validation for Unisphere REST API calls
- Configure Mount propagation on container runtime (that is, Docker)
- Linux multipathing requirements
- Volume Snapshot requirements

### Install Helm 3

Install Helm 3 on the master node before you install the CSI Driver for Dell EMC PowerMax.

**Steps**

  Run the `curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash` command to install Helm 3.


### Fibre Channel Requirements

CSI Driver for Dell EMC PowerMax supports Fibre Channel communication. Ensure that the following requirements are met before you install the CSI Driver:
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
- The CSI Driver needs the port group names containing the required iSCSI director ports. These port groups must be set up on each Dell EMC PowerMax array. All the port groups names supplied to the driver must exist on each Dell EMC PowerMax with the same name.

For information about configuring iSCSI, see _Dell EMC PowerMax documentation_ on Dell EMC Support.

### Certificate validation for Unisphere REST API calls

As part of the CSI driver installation, the CSI driver requires a secret with the name _powermax-certs_ present in the namespace _powermax_. This secret contains the X509 certificates of the CA which signed the Unisphere SSL certificate in PEM format. This secret is mounted as a volume in the driver container. In earlier releases, if the install script did not find the secret, it created an empty secret with the same name. From the 1.2.0 release, the secret volume has been made optional. The install script no longer attempts to create an empty secret.

The CSI driver exposes an install parameter `skipCertificateValidation` which determines if the driver performs client-side verification of the Unisphere certificates. The `skipCertificateValidation` parameter is set to _true_ by default, and the driver does not verify the Unisphere certificates.

If the `skipCertificateValidation` parameter is set to _false_ and a previous installation attempt created an empty secret, then this secret must be deleted and re-created using the CA certs.

If the Unisphere certificate is self-signed or if you are using an embedded Unisphere, then perform the following steps:
1. To fetch the certificate, run `openssl s_client -showcerts -connect [Unisphere IP]:8443 </dev/null> /dev/null | openssl x509 -outform PEM > ca_cert.pem`

   *NOTE*: The IP address varies for each user.

2. To create the secret, run `kubectl create secret generic powermax-certs --from-file=ca_cert.pem -n powermax`

### Ports in port group

There are no restrictions around how many ports can be present in the iSCSI port groups provided to the driver.

The same applies to Fibre Channel where there are no restrictions on the number of FA directors a host HBA can be zoned to. See the best practices for host connectivity to Dell EMC PowerMax to ensure that you have multiple paths to your data volumes.

### Configure Mount Propagation on Container Runtime 

You must configure mount propagation on your container runtime on all Kubernetes nodes before installing the CSI Driver for Dell EMC PowerMax.  The following steps explain how to do this with Docker.  If you use another container runtime please follow the recommended instructions from the vendor to configure mount propagation.

**Steps**

1. Edit the service section of `/etc/systemd/system/multi-user.target.wants/docker.service` file to add the following lines:
   ```bash
   docker.service
   [Service]...
   MountFlags=shared
   ```
2. Restart the docker service with `systemctl daemon-reload` and `systemctl restart docker` on all the nodes.
2. Restart the docker service with systemctl daemon-reload and systemctl restart docker on all the nodes.

### Linux multipathing requirements

CSI Driver for Dell EMC PowerMax supports Linux multipathing. Configure Linux multipathing before installing the CSI Driver.

Set up Linux multipathing as follows:

- All the nodes must have the _Device Mapper Multipathing_ package installed.  
  *NOTE:* When this package is installed it creates a multipath configuration file which is located at `/etc/multipath.conf`. Please ensure that this file always exists.
- Enable multipathing using `mpathconf --enable --with_multipathd y`
- Enable `user_friendly_names` and `find_multipaths` in the `multipath.conf` file.

### Volume Snapshot Requirements

#### Volume Snapshot CRD's
The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on Github.
- If on Kubernetes 1.18/1.19 (beta snapshots) use [v3.0.3](https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.3/client/config/crd)
- If on Kubernetes 1.20 (v1 snapshots) use [v4.0.0](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.0.0/client/config/crd)

#### Volume Snapshot Controller
Starting with beta Volume Snapshots in Kubernetes 1.17, the CSI external-snapshotter sidecar is split into two controllers:
- A common snapshot controller
- A CSI external-snapshotter sidecar

The common snapshot controller must be installed only once in the cluster irrespective of the number of CSI drivers installed in the cluster. On OpenShift clusters 4.4 and later, the common snapshot-controller is pre-installed. In the clusters where it is not present, it can be installed using `kubectl` and the manifests are available:
- If on Kubernetes 1.18/1.19 (beta snapshots) use [v3.0.3](https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.3/deploy/kubernetes/snapshot-controller)
- If on Kubernetes 1.20 (v1 snapshots) use [v4.0.0](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.0.0/deploy/kubernetes/snapshot-controller)

*NOTE:*
- The manifests available on GitHub install the snapshotter image: 
   - [quay.io/k8scsi/csi-snapshotter:v3.0.3](https://quay.io/repository/k8scsi/csi-snapshotter?tag=v3.0.3&tab=tags)
   - [quay.io/k8scsi/csi-snapshotter:v4.0.0](https://quay.io/repository/k8scsi/csi-snapshotter?tag=v4.0.0&tab=tags)
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

## Install the Driver

**Steps**

1. Run `git clone https://github.com/dell/csi-powermax.git` to clone the git repository.  This will include the Helm charts and dell-csi-helm-installer scripts.
2. Ensure that you have created a namespace where you want to install the driver. You can run `kubectl create namespace powermax` to create a new one 
3. Edit the `helm/secret.yaml file, point to the correct namespace and replace the values for the username and password parameters.
    These values can be obtained using base64 encoding as described in the following example:
    ```bash
    echo -n "myusername" | base64
    echo -n "mypassword" | base64
    ```
   where *myusername* and *mypassword* are credentials for a user with PowerMax priviledges.
4. Create the secret by running `kubectl create -f helm/secret.yaml` 
5. If you are going to install the new CSI PowerMax ReverseProxy service, create a TLS secret with the name - _csireverseproxy-tls-secret_ which holds an SSL certificate and the corresponding private key in the namespace where you are installing the driver.
6. Copy the default values.yaml file `cd helm && cp csi-powermax/values.yaml my-powermax-settings.yaml
7. Edit the newly created file and provide values for the following parameters `vi my-powermax-settings.yaml`

| Parameter | Description  | Required   | Default  |
|-----------|--------------|------------|----------|
| unisphere | Specifies the URL of the Unisphere for PowerMax server. If using the CSI PowerMax Reverse Proxy, leave this value unchanged at https://127.0.0.1:8443.  | Yes  | "https://127.0.0.1:8443"  |
| clusterPrefix | Prefix that is used during the creation of various masking-related entities (Storage Groups, Masking Views, Hosts, and Volume Identifiers) on the array. The value that you specify here must be unique. Ensure that no other CSI PowerMax driver is managing the same arrays that are configured with the same prefix. The maximum length for this   prefix is three characters. | Yes  | "ABC" |
| controller | Allows configuration of the controller-specific parameters.| - | - |
| node | Allows configuration of the node-specific parameters.| - | - |
| tolerations | Add tolerations as per requirement | No | - |
| nodeSelector | Add node selectors as per requirement | No | - |
| defaultFsType | Used to set the default FS type for external provisioner | Yes | ext4 |
| portGroups | List of comma-separated port group names. Any port group that is specified here must be present on all the arrays that the driver manages.     | For iSCSI Only | "PortGroup1, PortGroup2, PortGroup3" |
| arrayWhitelist| List of comma-separated array IDs. If this parameter remains empty, the driver manages all the arrays that are managed by the Unisphere instance that is configured for the driver.  Specify the IDs of the arrays that you want to manage, using the driver.| No | Empty|
| symmetrixID   | Specify a Dell EMC PowerMax array that the driver manages. This value is used to create a default storage class.   | Yes| "000000000000"   |
| storageResourcePool | This parameter must mention one of the SRPs on the PowerMax array that the symmetrixID specifies. This value is used to create the default storage class. | Yes| "SRP_1" |
| serviceLevel  | This parameter must mention one of the Service Levels on the PowerMax array. This value is used to create the default storage class.   | Yes| "Bronze"     |
| skipCertificateValidation | Skip client-side TLS verification of Unisphere certificates | No | "True" |
| transportProtocol  | Set preferred transport protocol for the Kubernetes cluster which helps the driver choose between FC and iSCSI when a node has both FC and iSCSI connectivity to a PowerMax array.| No | Empty|
| nodeNameTemplate | Used to specify a template which will be used by the driver to create Host/IG names on the PowerMax array. To use the default naming convention, then leave this value empty.  | No | Empty|
| **csireverseproxy**| This section refers to configuration options for CSI PowerMax Reverse Proxy  |  -  | - |
| enabled       |  Boolean parameter which indicates if CSI PowerMax Reverse Proxy is going to be configured and installed.<br>**NOTE:** If not enabled, then there is no requirement to configure any of the following values.  | No | "False"      |
| port  | Specify the port number that is used by the NodePort service created by the CSI PowerMax Reverse Proxy installation| No | 2222 |
| primary       | Mandatory section for Reverse Proxy   |  -  | - |
| unisphere     | This must specify the URL of the Unisphere for PowerMax server  | Yes, if using Reverse Proxy | "https://0.0.0.0:8443"   |
| skipCertificateValidation | This parameter should be set to false if you want to do client-side TLS verification of Unisphere for PowerMax SSL certificates. It is set to true by default. | No | "True"       |
| certSecret    |  The name of the secret in the same namespace containing the CA certificates of the Unisphere server | Yes, if skipCertificateValidation is set to false | Empty|
| backup| Optional section for Reverse Proxy. Specify Unisphere server address which the Reverse Proxy can fall back to if the primary Unisphere is unreachable or unresponsive.<br>**NOTE:** If you do not want to specify a backup Unisphere server, then remove the backup section from the file  | -   | - |
| unisphere     | Specify the IP address of the Unisphere for PowerMax server which manages the arrays being used by the CSI driver| No | "https://0.0.0.0:8443"   |
| skipCertificateValidation | This parameter should be set to false if you want to do client-side TLS verification of Unisphere for PowerMax SSL certificates. It is set to true by default. | No | "True"       |
| certSecret    | The name of the secret in the same namespace containing the CA certificates of the Unisphere server  | No | Empty|

8. Install the driver using `csi-install.sh` bash script by running `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace powermax --values ../helm/my-powermax-settings.yaml`

*Note:* 
- For detailed instructions on how to run the install scripts, see the readme document in the dell-csi-helm-installer folder.
- This script also runs the verify.sh script in the same directory. You will be prompted to enter the credentials for each of the Kubernetes nodes. The `verify.sh` script needs the credentials to check if the iSCSI initiators have been configured on all nodes. You can also skip the verification step by specifying the `--skip-verify-node` option

## Storage Classes

Starting in CSI PowerMax v1.6, `dell-csi-helm-installer` will not create any storage classes as part of the driver installation. A wide set of annotated storage class manifests has been provided in the `helm/samples` folder. Please use these samples to create new storage classes to provision storage.
See this [note](../../../../v1/installation/helm/powermax/) for the driving reason behind this change.

### What happens to my existing storage classes?

*Upgrading from CSI PowerMax v1.5 driver*
The storage classes created as part of the installation have an annotation - "helm.sh/resource-policy": keep set. This ensures that even after an uninstall or upgrade, the storage classes are not deleted. You can continue using these storage classes if you wish so.

*Upgrading from an older version of the driver*
The storage classes will be deleted if you upgrade the driver. If you wish to continue using those storage classes, you can patch them and apply the annotation "helm.sh/resource-policy": keep before performing an upgrade.

*Note:* If you continue to use the old storage classes, you may not be able to take advantage of any new storage class parameter supported by the driver.
