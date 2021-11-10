---
title: PowerFlex
linktitle: PowerFlex
description: >
  Installing the CSI Driver for PowerFlex via Helm
---

The CSI Driver for Dell EMC PowerFlex can be deployed by using the provided Helm v3 charts and installation scripts on both Kubernetes and OpenShift platforms. For more detailed information on the installation scripts, review the script [documentation](https://github.com/dell/csi-powerflex/tree/master/dell-csi-helm-installer).

The controller section of the Helm chart installs the following components in a _Deployment_ in the specified namespace:
- CSI Driver for Dell EMC PowerFlex
- Kubernetes External Provisioner, which provisions the volumes
- Kubernetes External Attacher, which attaches the volumes to the containers
- Kubernetes External Snapshotter, which provides snapshot support
- Kubernetes External Resizer, which resizes the volume

The node section of the Helm chart installs the following component in a _DaemonSet_ in the specified namespace:
- CSI Driver for Dell EMC PowerFlex
- Kubernetes Node Registrar, which handles the driver registration

## Prerequisites

The following are requirements that must be met before installing the CSI Driver for Dell EMC PowerFlex:
- Install Kubernetes or OpenShift (see [supported versions](../../../../csidriver/#features-and-capabilities))
- Install Helm 3
- Enable Zero Padding on PowerFlex
- Mount propagation is enabled on container runtime that is being used
- Install PowerFlex Storage Data Client 
- If using Snapshot feature, satisfy all Volume Snapshot requirements
- A user must exist on the array with a role _>= FrontEndConfigure_


### Install Helm 3.0

Install Helm 3.0 on the master node before you install the CSI Driver for Dell EMC PowerFlex.

**Steps**

  Run the `curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash` command to install Helm 3.0.

### Enable Zero Padding on PowerFlex

Verify that zero padding is enabled on the PowerFlex storage pools that will be used. Use PowerFlex GUI or the PowerFlex CLI to check this setting. For more information to configure this setting, see [Dell EMC PowerFlex documentation](https://cpsdocs.dellemc.com/bundle/PF_CONF_CUST/page/GUID-D32BDFF7-3014-4894-8E1E-2A31A86D343A.html).

### Install PowerFlex Storage Data Client

The CSI Driver for PowerFlex requires you to have installed the PowerFlex Storage Data Client (SDC) on all Kubernetes nodes which run the node portion of the CSI driver. 
SDC could be installed automatically by CSI driver install on Kubernetes nodes with OS platform which support automatic SDC deployment, 
currently Fedora CoreOS (FCOS) and Red Hat CoreOS (RHCOS). 
On Kubernetes nodes with OS version not supported by automatic install, you must perform the Manual SDC Deployment steps [below](#manual-sdc-deployment).
Refer to https://hub.docker.com/r/dellemc/sdc for supported OS versions.

**Optional:** For a typical install, you will pull SDC kernel modules from the Dell EMC FTP site, which is set up by default. Some users might want to mirror this repository to a local location. The [PowerFlex KB article](https://www.dell.com/support/kbdoc/en-us/000184206/how-to-use-a-private-repository-for) has instructions on how to do this. 

#### Manual SDC Deployment

For detailed PowerFlex installation procedure, see the [Dell EMC PowerFlex Deployment Guide](https://docs.delltechnologies.com/bundle/VXF_DEPLOY/page/GUID-DD20489C-42D9-42C6-9795-E4694688CC75.html). Install the PowerFlex SDC as follows:

**Steps**

1. Download the PowerFlex SDC from [Dell EMC Online support](https://www.dell.com/support). The filename is EMC-ScaleIO-sdc-*.rpm, where * is the SDC name corresponding to the PowerFlex installation version.
2. Export the shell variable _MDM_IP_ in a comma-separated list using `export MDM_IP=xx.xxx.xx.xx,xx.xxx.xx.xx`, where xxx represents the actual IP address in your environment. This list contains the IP addresses of the MDMs.
3. Install the SDC per the _Dell EMC PowerFlex Deployment Guide_:
    - For Red Hat Enterprise Linux and CentOS, run `rpm -iv ./EMC-ScaleIO-sdc-*.x86_64.rpm`, where * is the SDC name corresponding to the PowerFlex installation version.
4. To add more MDM_IP for multi-array support, run `/opt/emc/scaleio/sdc/bin/drv_cfg --add_mdm --ip 10.xx.xx.xx.xx,10.xx.xx.xx`


### (Optional) Volume Snapshot Requirements

Applicable only if you decided to enable snapshot feature in `values.yaml`

```yaml
controller:
  snapshot:
    enabled: true
```

#### Volume Snapshot CRD's
The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on Github. Manifests are available here: [v4.2.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.2.0/client/config/crd)

#### Volume Snapshot Controller
The CSI external-snapshotter sidecar is split into two controllers:
- A common snapshot controller
- A CSI external-snapshotter sidecar

The common snapshot controller must be installed only once in the cluster irrespective of the number of CSI drivers installed in the cluster. On OpenShift clusters 4.4 and later, the common snapshot-controller is pre-installed. In the clusters where it is not present, it can be installed using `kubectl` and the manifests are available here: [v4.2.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.2.0/deploy/kubernetes/snapshot-controller)

*NOTE:*
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

*NOTE:*
- When using Kubernetes 1.20/1.21/1.22 it is recommended to use 4.2.x version of snapshotter/snapshot-controller.
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

## Install the Driver

**Steps**
1. Run `git clone https://github.com/dell/csi-powerflex.git` to clone the git repository.

2. Ensure that you have created a namespace where you want to install the driver. You can run `kubectl create namespace vxflexos` to create a new one.

3. Check `helm/csi-vxflexos/values.yaml` and confirm the driver image points to a new image.

4. Collect information from the PowerFlex SDC by executing the `get_vxflexos_info.sh` script located in the scripts directory.  This script shows the _VxFlex OS system ID_ and _MDM IP_ addresses. Make a note of the value for these parameters as they must be entered in the `config.yaml` file in the samples directory.

5. Prepare the samples/config.yaml for driver configuration. The following table lists driver configuration parameters for multiple storage arrays.

    | Parameter | Description                                                  | Required | Default |
    | --------- | ------------------------------------------------------------ | -------- | ------- |
    | username  | Username for accessing PowerFlex system.                      | true     | -       |
    | password  | Password for accessing PowerFlex system.                      | true     | -       |
    | systemID  | System name/ID of PowerFlex system.                           | true     | -       |
    | allSystemNames | List of previous names of powerflex array if used for PV create     | false    | -       |
    | endpoint  | REST API gateway HTTPS endpoint for PowerFlex system.         | true     | -       |
    | skipCertificateValidation  | Determines if the driver is going to validate certs while connecting to PowerFlex REST API interface. | true     | true    |
    | isDefault | An array having isDefault=true is for backward compatibility. This parameter should occur once in the list. | false    | false   |
    | mdm       | mdm defines the MDM(s) that SDC should register with on start. This should be a list of MDM IP addresses or hostnames separated by comma. | true     | -       |

    Example: `samples/config.yaml`

    ```yaml
     # Username for accessing PowerFlex system.	
   - username: "admin"
     # Password for accessing PowerFlex system.	
     password: "password"
     # System name/ID of PowerFlex system.	
     systemID: "ID1"
     # Previous names of PowerFlex system if used for PV.
     allSystemNames: "pflex-1,pflex-2"
     # REST API gateway HTTPS endpoint for PowerFlex system.
     endpoint: "https://127.0.0.1"
     # Determines if the driver is going to validate certs while connecting to PowerFlex REST API interface.
     # Allowed values: true or false
     # Default value: true
     skipCertificateValidation: true 
     # indicates if this array is the default array
     # needed for backwards compatibility
     # only one array is allowed to have this set to true 
     # Default value: false
     isDefault: true
     # defines the MDM(s) that SDC should register with on start.
     # Allowed values:  a list of IP addresses or hostnames separated by comma.
     # Default value: none 
     mdm: "10.0.0.1,10.0.0.2"
   - username: "admin"
     password: "Password123"
     systemID: "ID2"
     endpoint: "https://127.0.0.2"
     skipCertificateValidation: true 
     mdm: "10.0.0.3,10.0.0.4"
    ```

    After editing the file, run the following command to create a secret called `vxflexos-config`:
    
    `kubectl create secret generic vxflexos-config -n vxflexos --from-file=config=samples/config.yaml`

    Use the following command to replace or update the secret:

    `kubectl create secret generic vxflexos-config -n vxflexos --from-file=config=samples/config.yaml -o yaml --dry-run=client | kubectl replace -f -`

    *NOTE:* 

    - The user needs to validate the YAML syntax and array-related key/values while replacing the vxflexos-creds secret.
    - If you want to create a new array or update the MDM values in the secret, you will need to reinstall the driver. If you change other details, such as login information, the secret will dynamically update -- see [dynamic-array-configuration](../../../features/powerflex#dynamic-array-configuration) for more details.
    - Old `json` format of the array configuration file is still supported in this release. If you already have your configuration in `json` format, you may continue to maintain it or you may transfer this configuration to `yaml`
    format and replace/update the secret.  
    - "insecure" parameter has been changed to "skipCertificateValidation" as insecure is deprecated and will be removed from use in config.yaml or secret.yaml in a future release. Users can continue to use any one of "insecure" or "skipCertificateValidation" for now. The driver would return an error if both parameters are used.
    - Please note that log configuration parameters from v1.5 will no longer work in v2.0. Please refer to the [Dynamic Logging Configuration](../../../features/powerflex#dynamic-logging-configuration) section in Features for more information.
    
6. Default logging options are set during helm install. To see possible configuration options, see the [Dynamic Logging Configuration](../../../features/powerflex#dynamic-logging-configuration) section in Features.  

7. If using automated SDC deployment:
   - Check the SDC container image is the correct version for your version of PowerFlex. 
   
8. Copy the default values.yaml file `cd helm && cp csi-vxflexos/values.yaml myvalues.yaml`

9. Edit the newly created values file and provide values for the following parameters `vi myvalues.yaml`:

| Parameter                | Description                                                                                                                                                                                                                                                                                                                                                                                                    | Required | Default |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| version | Set to verify the values file version matches driver version. | Yes | 2.0.0 |
| certSecretCount | Represents the number of certificate secrets, which the user is going to create for SSL authentication. | No | 0 |
| logLevel | CSI driver log level. Allowed values: "error", "warn"/"warning", "info", "debug". | Yes | "debug" |
| logFormat | CSI driver log format. Allowed values: "TEXT" or "JSON". | Yes | "TEXT" |
| kubeletConfigDir | kubelet config directory path. Ensure that the config.yaml file is present at this path. | Yes | /var/lib/kubelet |
| defaultFsType | Used to set the default FS type which will be used for mount volumes if FsType is not specified in the storage class. Allowed values: ext4, xfs. | Yes | ext4 |
| imagePullPolicy | Policy to determine if the image should be pulled prior to starting the container. Allowed values: Always, IfNotPresent, Never. | Yes | IfNotPresent |
| enablesnapshotcgdelete | A boolean that, when enabled, will delete all snapshots in a consistency group everytime a snap in the group is deleted. | Yes | false |
| enablelistvolumesnapshot | A boolean that, when enabled, will allow list volume operation to include snapshots (since creating a volume from a snap actually results in a new snap). It is recommend this be false unless instructed otherwise. | Yes | false |
| allowRWOMultiPodAccess | Setting allowRWOMultiPodAccess to "true" will allow multiple pods on the same node to access the same RWO volume. This behavior conflicts with the CSI specification version 1.3. NodePublishVolume description that requires an error to be returned in this case. However, some other CSI drivers support this behavior and some customers desire this behavior. Customers use this option at their own risk. | Yes | false |
| **controller**           | This section allows the configuration of controller-specific parameters. To maximize the number of available nodes for controller pods, see this section. For more details on the new controller pod configurations, see the [Features section](../../../features/powerflex#controller-ha) for Powerflex specifics.                                                                                                             | -        | -       |
| volumeNamePrefix | Set so that volumes created by the driver have a default prefix. If one PowerFlex/VxFlex OS system is servicing several different Kubernetes installations or users, these prefixes help you distinguish them. | Yes | "k8s" |
| controllerCount | Set to deploy multiple controller instances. If the controller count is greater than the number of available nodes, excess pods remain in a pending state. It should be greater than 0. You can increase the number of available nodes by configuring the "controller" section in your values.yaml. For more details on the new controller pod configurations, see the [Features section](../../../features/powerflex#controller-ha) for Powerflex specifics. | Yes | 2 |
| snapshot.enabled | A boolean that enable/disable volume snapshot feature. | No | true |
| resizer.enabled | A boolean that enable/disable volume expansion feature. | No | true |
| nodeSelector             | Defines what nodes would be selected for pods of controller deployment. Leave as blank to use all nodes. Uncomment this section to deploy on master nodes exclusively.                                                                                                                                                                                                                                         | Yes     | " "     |
| tolerations              | Defines tolerations that would be applied to controller deployment. Leave as blank to install the controller on worker nodes only. If deploying on master nodes is desired, uncomment out this section.                                                                                                                                                                                                            | Yes     | " "     |
| **node** | This section allows the configuration of node-specific parameters. | - | - |
| nodeSelector | Defines what nodes would be selected for pods of node daemonset. Leave as blank to use all nodes. | Yes | " " |
| tolerations | Defines tolerations that would be applied to node daemonset. Leave as blank to install node driver only on worker nodes. | Yes | " " |
| **monitor**              | This section allows the configuration of the SDC monitoring pod.                                                                                                                                                                                                                                                                                                                                                  | -        | -       |
| enabled                  | Set to enable the usage of the monitoring pod.                                                                                                                                                                                                                                                                                                                                                                | Yes     | false |
| hostNetwork              | Set whether the monitor pod should run on the host network or not.                                                                                                                                                                                                                                                                                                                                            | Yes     | true |
| hostPID                  | Set whether the monitor pod should run in the host namespace or not.                                                                                                                                                                                                                                                                                                                                          | Yes     | true |
| **vgsnapshotter** | This section allows the configuration of the volume group snapshotter(vgsnapshotter) pod.  | - | - |
| enabled | A boolean that enable/disable vg snapshotter feature. | No | false |
| image | Image for vg snapshotter. | No | " " |
| **podmon**               | Podmon is an optional feature under development and tech preview. Enable this feature only after contact support for additional information.  |  -        |  -       |
| enabled                  | A boolean that enable/disable podmon feature. |  No      |   false   |
| image | image for podmon. | No | " " |

10. Install the driver using `csi-install.sh` bash script by running `cd dell-csi-helm-installer && ./csi-install.sh --namespace vxflexos --values ../helm/myvalues.yaml` or for helm install charts without shell scripts refer to helm/README.md for details.

 *NOTE:*
- For detailed instructions on how to run the install scripts, refer to the README.md  in the dell-csi-helm-installer folder.
- Install script will validate MDM IP(s) in `vxflexos-config` secret and creates a new field consumed by the init container and sdc-monitor container
- This install script also runs the `verify.sh` script. You will be prompted to enter the credentials for each of the Kubernetes nodes. 
  The `verify.sh` script needs the credentials to check if SDC has been configured on all nodes. 
- It is mandatory to run install script after changes to MDM configuration in `vxflexos-config` secret. Refer [dynamic-array-configuration](../../../features/powerflex#dynamic-array-configuration)
  
- (Optional) Enable additional Mount Options - A user is able to specify additional mount options as needed for the driver. 
   - Mount options are specified in storageclass yaml under _mkfsFormatOption_. 
   - *WARNING*: Before utilizing mount options, you must first be fully aware of the potential impact and understand your environment's requirements for the specified option.

## Certificate validation for PowerFlex Gateway REST API calls 

This topic provides details about setting up the certificate for the CSI Driver for Dell EMC PowerFlex.

*Before you begin*

As part of the CSI driver installation, the CSI driver requires a secret with the name vxflexos-certs-0 to vxflexos-certs-n based on the ".Values.certSecretCount" parameter present in the namespace vxflexos.

This secret contains the X509 certificates of the CA which signed PowerFlex gateway SSL certificate in PEM format.

The CSI driver exposes an install parameter in config.yaml, `skipCertificateValidation`, which determines if the driver performs client-side verification of the gateway certificates.

`skipCertificateValidation` parameter is set to true by default, and the driver does not verify the gateway certificates.

If `skipCertificateValidation` is set to false, then the secret vxflexos-certs-n must contain the CA certificate for the array gateway.

If this secret is an empty secret, then the validation of the certificate fails, and the driver fails to start.

If the gateway certificate is self-signed or if you are using an embedded gateway, then perform the following steps.

1. To fetch the certificate, run the following command.

         `openssl s_client -showcerts -connect <Gateway IP:Port> </dev/null 2>/dev/null | openssl x509 -outform PEM > ca_cert_0.pem`
	
   Example: openssl s_client -showcerts -connect 1.1.1.1:443 </dev/null 2>/dev/null | openssl x509 -outform PEM > ca_cert_0.pem
	
2. Run the following command to create the cert secret with index '0':

         `kubectl create secret generic vxflexos-certs-0 --from-file=cert-0=ca_cert_0.pem -n vxflexos`
	
   Use the following command to replace the secret:
	
          `kubectl create secret generic vxflexos-certs-0 -n vxflexos --from-file=cert-0=ca_cert_0.pem -o yaml --dry-run | kubectl replace -f -` 
	
3. Repeat step 1 and 2 to create multiple cert secrets with incremental index (example: vxflexos-certs-1, vxflexos-certs-2, etc)


*Note:*
	
- "vxflexos" is the namespace for helm-based installation but namespace can be user-defined in operator-based installation.
- User can add multiple certificates in the same secret. The certificate file should not exceed more than 1Mb due to Kubernetes secret size limitation.
- Whenever certSecretCount parameter changes in `myvalues.yaml` user needs to uninstall and install the driver.
- Updating vxflexos-certs-n secrets is a manual process, unlike vxflexos-config. Users have to re-install the driver in case of updating/adding the SSL certificates or changing the certSecretCount parameter.



## Storage Classes

For CSI driver for PowerFlex version 1.4 and later, `dell-csi-helm-installer` does not create any storage classes as part of the driver installation. A wide set of annotated storage class manifests have been provided in the `samples` folder. Use these samples to create new storage classes to provision storage.

### What happens to my existing storage classes?

Upgrading from an older version of the driver: The storage classes will be deleted if you upgrade the driver. If you wish to continue using those storage classes, you can patch them and apply the annotation “helm.sh/resource-policy”: keep before performing an upgrade.

>Note: If you continue to use the old storage classes, you may not be able to take advantage of any new storage class parameter supported by the driver.

**Steps to create storage class:**
There are samples storage class yaml files available under `samples/storageclass`.  These can be copied and modified as needed. 

1. Edit `storageclass.yaml` if you need ext4 filesystem and `storageclass-xfs.yaml` if you want xfs filesystem.
2. Replace `<STORAGE_POOL>` with the storage pool you have.
3. Replace `<SYSTEM_ID>` with the system ID you have. Note there are two appearances in the file.
4. Edit `storageclass.kubernetes.io/is-default-class` to true if you want to set it as default, otherwise false. 
5. Save the file and create it by using `kubectl create -f storageclass.yaml` or `kubectl create -f storageclass-xfs.yaml`

 *NOTE*: 
- At least one storage class is required for one array.
- If you uninstall the driver and reinstall it, you can still face errors if any update in the `values.yaml` file leads to an update of the storage class(es):

```
    Error: cannot patch "<sc-name>" with kind StorageClass: StorageClass.storage.k8s.io "<sc-name>" is invalid: parameters: Forbidden: updates to parameters are forbidden
```

In case you want to make such updates, ensure to delete the existing storage classes using the `kubectl delete storageclass` command.  
Deleting a storage class has no impact on a running Pod with mounted PVCs. You cannot provision new PVCs until at least one storage class is newly created.

## Volume Snapshot Class

Starting CSI PowerFlex v1.5, `dell-csi-helm-installer` will not create any Volume Snapshot Class during the driver installation. There is a sample Volume Snapshot Class manifest present in the _samples/_ folder. Please use this sample to create a new Volume Snapshot Class to create Volume Snapshots.

*NOTE* 
Support for v1beta1 snapshots is being discontinued in this release.

### What happens to my existing Volume Snapshot Classes?

*Upgrading from CSI PowerFlex v1.5 driver*:
The existing volume snapshot class will be retained.

*Upgrading from an older version of the driver*:
It is strongly recommended to upgrade the earlier versions of CSI PowerFlex to 1.5 before upgrading to 2.0.
