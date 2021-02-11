---
title: PowerFlex
linktitle: PowerFlex
description: >
  Installing PowerFlex CSI Driver via Helm
---

The CSI Driver for Dell EMC PowerFlex can be deployed by using the provided Helm v3 charts and installation scripts on both Kubernetes and OpenShift platforms. For more detailed information on the installation scripts, please review the script [documentation](https://github.com/dell/csi-unity/tree/master/dell-csi-helm-installer).

The controller section of the Helm chart installs the following components in a _Deployment_ in the namespace `vxflexos`:
- CSI Driver for Dell EMC PowerFlex
- Kubernetes External Provisioner, which provisions the volumes
- Kubernetes External Attacher, which attaches the volumes to the containers
- Kubernetes External Snapshotter, which provides snapshot support
- Kubernetes External Resizer, which resizes the volume

The node section of the Helm chart installs the following component in a _DaemonSet_ in the namespace `vxflexos`:
- CSI Driver for Dell EMC PowerFlex
- Kubernetes Node Registrar, which handles the driver registration

## Prerequisites

The following are requirements must be met before installing the CSI Driver for Dell EMC PowerFlex:
- Install Kubernetes (1.17, 1.18, 1.19) or OpenShift (4.5 or 4.6)
- Install Helm 3
- Enable Zero Padding on PowerFlex
- Configure Mount propagation on container runtime (i.e. Docker)
- Install PowerFlex Storage Data Client 
- Volume Snapshot requirements
- A user must exist on the array with a role _>= FrontEndConfigure_


### Install Helm 3.0

Install Helm 3.0 on the master node before you install the CSI Driver for Dell EMC PowerFlex.

**Steps**

  Run the `curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash` command to install Helm 3.0.

### Enable Zero Padding on PowerFlex

Verify that zero padding is enabled on the PowerFlex storage pools that will be used. Use PowerFlex GUI or the PowerFlex CLI to check this setting. See [Dell EMC PowerFlex documentation](https://cpsdocs.dellemc.com/bundle/PF_CONF_CUST/page/GUID-D32BDFF7-3014-4894-8E1E-2A31A86D343A.html) for more information to configure this setting.

### Configure Mount Propagation on Container Runtime 

It is required to configure mount propagation on your container runtime on all Kubernetes nodes before installing the CSI Driver for Dell EMC PowerFlex. The following is instruction on how to do this with Docker. If you use another container runtime, follow the recommended instructions from the vendor to configure mount propagation.

**Steps**

1. Edit the service section of `/etc/systemd/system/multi-user.target.wants/docker.service` file to add the following lines:
   ```bash
   docker.service
   [Service]...
   MountFlags=shared
   ```
2. Restart the docker service with `systemctl daemon-reload` and `systemctl restart docker` on all the nodes.

**Note**: Some distribution, like Ubuntu, already has _MountFlags_ set by default

### Install PowerFlex Storage Data Client

The CSI Driver for PowerFlex requires you to have installed the PowerFlex Storage Data Client (SDC) on all worker nodes. If installing on Red Hat CoreOS (RHCOS) nodes on OpenShift you can install using the automated SDC deployment feature. If installing on non-RHCOS nodes, you must install SDC manually.

#### Automatic SDC Deployment

The automated deployment of the SDC runs by default when installing the driver. It installs an SDC container to faciliate the installation. While the install is automated there are a few configuration options for this feature. Those are referenced in the __Install the Driver__ section. More details on how the automatic SDC deployment works can be found in the Feature section of this site on the PowerFlex page.  

**Optional:** For a typical install, you will pull SDC kernel modules from the Dell EMC ftp site, which is setup by default. Some users might want to mirror this repository to a local location. The PowerFlex documentation has instructions on how to do this. If a mirror is used, you need to create an SDC repo secret for managing the credentials to the mirror. Details on how to create the secret are in the __Install the Driver__ section.

#### Manually SDC Deployment

For detailed PowerFlex installation procedure, see the _Dell EMC PowerFlex Deployment Guide_. Install the PowerFlex SDC as follows:

**Steps**

1. Download the PowerFlex SDC from [Dell EMC Online support](https://www.dell.com/support). The filename is EMC-ScaleIO-sdc-*.rpm, where * is the SDC name corresponding to the PowerFlex installation version.
2. Export the shell variable _MDM_IP_ in a comma-separated list using `export MDM_IP=xx.xxx.xx.xx,xx.xxx.xx.xx`, where xxx represents the actual IP address in your environment. This list contains the IP addresses of the MDMs.
3. Install the SDC per the _Dell EMC PowerFlex Deployment Guide_:
    - For Red Hat Enterprise Linux and Cent OS, run `rpm -iv ./EMC-ScaleIO-sdc-*.x86_64.rpm`, where * is the SDC name corresponding to the PowerFlex installation version.


### Volume Snapshot requirements

#### Volume Snapshot CRD's
The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on [Github](https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.3/client/config/crd).

You can also install the CRDs by supplying the option _\-\-snapshot-crd_ while installing the driver using the `csi-install.sh` script.

#### Volume Snapshot Controller

Starting with beta Volume Snapshots in Kubernetes 1.17, the CSI external-snapshotter sidecar is split into two controllers:
- A common snapshot controller
- A CSI external-snapshotter sidecar

The common snapshot controller must be installed only once in the cluster irrespective of the number of CSI drivers installed in the cluster. On OpenShift clusters 4.4 and later, the common snapshot-controller is pre-installed. In the clusters where it is not present, it can be installed using `kubectl` and the manifests available on [GitHub](https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.3/deploy/kubernetes/snapshot-controller).

*NOTE:*
- The manifests available on GitHub install v3.0.3 of the snapshotter image - [quay.io/k8scsi/csi-snapshotter:v3.0.3](https://quay.io/repository/k8scsi/csi-snapshotter?tag=v3.0.3&tab=tags)
- Dell recommends using v3.0.3 image of the snapshot-controller - [quay.io/k8scsi/snapshot-controller:v3.0.3](https://quay.io/repository/k8scsi/snapshot-controller?tag=v3.0.3&tab=tags)
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

## Install the Driver

**Steps**
1. Run `git clone https://github.com/dell/csi-powerflex.git` to clone the git repository.
2. Ensure that you have created namespace where you want to install the driver. You can run `kubectl create namespace vxflexos` to create a new one.
3. Check helm/csi-vxflexos/driver-image.yaml and confirm the driver image points to new image.
4. Edit the `helm/secret.yaml`, point to correct namespace and replace the values for the username and password parameters.
    These values can be obtained using base64 encoding as described in the following example:
    ```bash
    echo -n "myusername" | base64
    echo -n "mypassword" | base64
    ```
   where *myusername* & *mypassword* are credentials for a user with PowerFlex priviledges.
5. Create the secret by running `kubectl create -f secret.yaml` 
6. If not using automated SDC deployment, create a dummy SDC repo secret file:  `kubectl create -f sdc-repo-secret.yaml`
7. If using automated SDC deployment:
   - Check the SDC container image is the correct version for your version of PowerFlex. 
   - Create a secret for the SDC repo credentials and provide the URL for the repo. 
     - To create the secret, you must update the details in helm/sdc-repo-secret.yaml file and running `kubectl create -f sdc-repo-secret.yaml`. 
     - To set the repo URL, you must set the `repoUrl` parameter in the `myvalues.yaml` file.
8. Collect information from the PowerFlex SDC by executing the `get_vxflexos_info.sh` script located in the top-level helm directory.  This script shows the _VxFlex OS system ID_ and _MDM IP_ addresses. Make a note of the value for these parameters as they must be entered in the `myvalues.yaml` file.
    - *NOTE:* Your SDC might have multiple VxFlex OS systems registered. Ensure that you choose the correct values.
9. Copy the default values.yaml file `cd helm && cp csi-vxflexos/values.yaml myvalues.yaml`
10. Edit the newly created values file and provide values for the following parameters `vi myvalues.yaml`:

| Parameter  | Description | Required | Default |
|------------|-------------|----------|---------|
| systemName | Set to the PowerFlex/VxFlex OS system name or system ID to be used with the driver.  | Yes| "systemname"  |
| restGateway | Set to the URL of your system’s REST API Gateway. You can obtain this value from the PowerFlex administrator.| Yes | "https://123.0.0.1" |
| storagePool | Set to a default (existing) storage pool name in your PowerFlex/VxFlex OS system.| Yes| "sp" |
| volumeNamePrefix| Set so that volumes created by the driver have a default prefix. If one PowerFlex/VxFlex OS system is   servicing several different Kubernetes installations or users, these prefixes help you distinguish them. | No | "k8s"|
| controllerCount | Set to deploy multiple controller instances. If controller count is greater than the number of available nodes, excess pods will be left in pending state. You can increase number of available nodes by configuring the "controller" section in your values.yaml. For more details on the new controller pod configurations, see the Features section for Powerflex specifics. | Yes| 2 |
| enablelistvolumesnapshot | Set to have snapshots included in the CSI operation ListVolumes. Disabled by default.| No | FALSE |
| **StorageClass** | Helm charts create a Kubernetes StorageClass while deploying CSI Driver for Dell EMC PowerFlex. This section   includes relevant variables.|  - |  - |
| name| Defines the name of the Kubernetes storage class that the Helm charts will create. For example, the   _vxflexos_ base name will be used to generate names such as _vxflexos_ and   _vxflexos-xfs_.  | No | "vxflexos" |
| isDefault | Sets the newly created storage class as default for Kubernetes. Set this value to `true` only if you expect   PowerFlex to be your principle storage provider, as it will be used in PersitentVolumeClaims where no storageclass is provided. After installation, you can add custom storage classes, if desired. | No | TRUE |
| reclaimPolicy | Defines whether the volumes will be retained or deleted when the assigned pod is destroyed. The valid values for this variable are `Retain` or `Delete`.| No | "Delete"|
| **controller**| This section allows configuration of controller specific parameters. To maximize the number of available nodes for controller pods, see this section. For more details on the new controller pod configurations, see the [Features section](../../../features/powerflex/) for Powerflex specifics. |  - |  - |
| nodeSelector | Defines what nodes would be selected for pods of controller deployment. Leave as blank to use all nodes. Uncomment this section to deploy on master nodes exclusively. | No | " " |
| tolerations| Defines tolerations that would be applied to controller deployment. Leave as blank to install controller on worker nodes only. If deploying on master nodes is desired, uncomment out this section. | No | " "|
| **monitor**| This section allows configuration of the SDC monitoring pod. |  - |  -   |
| enabled| Set to enable the usage of the monitoring pod.| No | FALSE|
| hostNetwork| Set whether the monitor pod should run on the host network or not.| No | TRUE |
| hostPID | Set whether the monitor pod should run in the host namespace or not.| No | TRUE |
| **sdcKernelMirror** | [RHCOS only] The PowerFlex SDC may need to pull a new module that is known to work with newer Linux kernels. The default location of this mirror os at ftp.emc.com. The PowerFlex documentation has instructions for methods to mirror this repository to a local location if necessary. | - | - |
| repoUrl | Set the URL of the ftp mirror containing SDC kernel modules. Only ftp locations are allowed. A blank string signifies the default mirror, which is "ftp://ftp.emc.com".| No | " "  |
11. Install the driver using `csi-install.sh` bash script by running `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace vxflexos --values ../helm/myvalues.yaml`

*NOTE:* 
- For detailed instructions on how to run the install scripts, refer to the README.md  in the dell-csi-helm-installer folder.
- This script also runs the verify.sh script that is present in the same directory. You will be prompted to enter the credentials for each of the Kubernetes nodes. The `verify.sh` script needs the credentials to check if SDC has been configured on all nodes. You can also skip the verification step by specifiying the `--skip-verify-node` option.
- (Optional) Enable additional Mount Options - A user is able to specify additional mount options as needed for the driver. 
   - Mount options are specified in storageclass yaml under _mountOptions_. 
   - *WARNING*: Before utilizing mount options, you must first be fully aware of the potential impact and understand your environment's requirements for the specified option.

## Storage Classes
As part of the driver installation, a set of storage classes is created along with the driver pods. This is done to demonstrate how storage classes need to be created to consume storage from Dell EMC storage arrays. 

The `StorageClass` object in Kubernetes is immutable and can't be modified once created. It creates challenges when we need to change or update a parameter, for example when a version of the driver introduces new configurable parameters for the storage classes. To avoid issues during upgrades, future releases of the drivers will have the installation separated from the creation of Storage Classes.
In preparation for that, starting in Q4 of 2020, an annotation `"helm.sh/resource-policy": keep` is applied to the storage classes created by the `dell-csi-helm-installer`.

Because of this annotation, these storage classes are not going to be deleted even after the driver has been uninstalled.
This annotation has been applied to give you an opportunity to keep using  these storage classes even with a future release of the driver. In case you wish to not use these storage classes, you will need to delete them by using the `kubectl delete storageclass` command.

*NOTE*: If you uninstall the driver and reinstall it, you can still face errors if any update in the `values.yaml` file leads to an update of the storage class(es):

```
    Error: cannot patch "<sc-name>" with kind StorageClass: StorageClass.storage.k8s.io "<sc-name>" is invalid: parameters: Forbidden: updates to parameters are forbidden
```

In case you want to make such updates, make sure to delete the existing storage classes using the `kubectl delete storageclass` command.  
Deleting a storage class has no impact on a running Pod with mounted PVCs. You won't be able to provision new PVCs until at least one storage class is newly created.