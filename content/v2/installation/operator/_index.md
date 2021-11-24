---
title: "Dell CSI Operator Installation Process"
linkTitle: "Using Operator"
weight: 4
description: >
  Installation of Dell EMC CSI drivers using Dell CSI Operator
---

The Dell CSI Operator is a Kubernetes Operator, which can be used to install and manage the CSI Drivers provided by Dell EMC for various storage platforms. This operator is available as a community operator for upstream Kubernetes and can be deployed using OperatorHub.io. It is also available as a certified operator for OpenShift clusters and can be deployed using the OpenShift Container Platform. Both these methods of installation use OLM (Operator Lifecycle Manager).  The operator can also be deployed manually.


## Installation
Dell CSI Operator has been tested and qualified with 
- Upstream Kubernetes or OpenShift (see [supported versions](../../dell-csi-driver/#features-and-capabilities))

#### Before you begin
If you have installed an old version of the `dell-csi-operator` which was available with the name _CSI Operator_, please refer to this [section](#replacing-csi-operator-with-dell-csi-operator) before continuing.

#### Full list of CSI Drivers and versions supported by the Dell CSI Operator
| CSI Driver         | Version | ConfigVersion | Kubernetes Version       | OpenShift Version |
| ------------------ | ------  | --------------| ------------------------ | ----------------- |
| CSI PowerMax       | 1.5     | v4            | 1.17, 1.18, 1.19         | 4.4, 4.5, 4.6     |
| CSI PowerMax       | 1.6     | v5            | 1.18, 1.19, 1.20         | 4.6, 4.7          |
| CSI PowerMax       | 1.7     | v6            | 1.19, 1.20, 1.21         | 4.6, 4.7          |
| CSI PowerFlex      | 1.3     | v3            | 1.17, 1.18, 1.19         | 4.4, 4.5, 4.6     |
| CSI PowerFlex      | 1.4     | v4            | 1.18, 1.19, 1.20         | 4.6, 4.7          |
| CSI PowerFlex      | 1.5     | v5            | 1.19, 1.20, 1.21         | 4.6, 4.7          |
| CSI PowerScale     | 1.4     | v4            | 1.17, 1.18, 1.19         | 4.4, 4.5, 4.6     |
| CSI PowerScale     | 1.5     | v5            | 1.18, 1.19, 1.20         | 4.6, 4.7          |
| CSI PowerScale     | 1.6     | v6            | 1.19, 1.20, 1.21         | 4.6, 4.7          |
| CSI Unity          | 1.4     | v3            | 1.17, 1.18, 1.19         | 4.4, 4.5, 4.6     |
| CSI Unity          | 1.5     | v4            | 1.18, 1.19, 1.20         | 4.6, 4.7          |
| CSI Unity          | 1.6     | v5            | 1.19, 1.20, 1.21         | 4.6, 4.7          |
| CSI PowerStore     | 1.2     | v2            | 1.17, 1.18, 1.19         | 4.5, 4.6          |
| CSI PowerStore     | 1.3     | v3            | 1.18, 1.19, 1.20         | 4.6, 4.7          |
| CSI PowerStore     | 1.4     | v4            | 1.19, 1.20, 1.21         | 4.6, 4.7          |

</br>

**Dell CSI Operator can be installed via OLM (Operator Lifecycle Manager) and manual installation.**

### Installation Using Operator Lifecycle Manager
`dell-csi-operator` can be installed using Operator Lifecycle Manager (OLM) on upstream Kubernetes clusters & Red Hat OpenShift Clusters.  
The installation process involves the creation of a `Subscription` object either via the _OperatorHub_ UI or using `kubectl/oc`. While creating the `Subscription` you can set the Approval strategy for the `InstallPlan` for the Operator to - 
* _Automatic_ - If you want the Operator to be automatically installed or upgraded (once an upgrade becomes available)
* _Manual_ - If you want a Cluster Administrator to manually review and approve the `InstallPlan` for installation/upgrades

**NOTE**: The recommended version of OLM for upstream Kubernetes is **`v0.17.0`**.

#### Pre-Requisite for installation with OLM
Please run the following commands for creating the required `ConfigMap` before installing the `dell-csi-operator` using OLM.  
```
$ git clone github.com/dell/dell-csi-operator
$ cd dell-csi-operator
$ tar -czf config.tar.gz driverconfig/
# Replace operator-namespace in the below command with the actual namespace where the operator will be deployed by OLM
$ kubectl create configmap dell-csi-operator-config --from-file config.tar.gz -n <operator-namespace>
```
##### Upstream Kubernetes
- For installing via OperatorHub.io on Kubernetes, go to the [OperatorHub page](../../partners/operator/).
##### Red Hat OpenShift Clusters
- For installing via OpenShift with the Operator, go to the [OpenShift page](../../partners/redhat/).

### Manual Installation

#### Steps

>**Skip step 1 for "offline bundle installation" and continue using the workspace created by untar of dell-csi-operator-bundle.tar.gz.**
1. Clone the [Dell CSI Operator repository](https://github.com/dell/dell-csi-operator). 
2. Run `bash scripts/install.sh` to install the operator.
>NOTE: Dell CSI Operator version 1.4.0 and higher would install to the 'dell-csi-operator' namespace by default.
Any existing installations of Dell CSI Operator (v1.2.0 or later) installed using `install.sh` to the 'default' or 'dell-csi-operator' namespace can be upgraded to the new version by running `install.sh --upgrade`.

{{< imgproc non-olm-1.jpg Resize "2500x" >}}{{< /imgproc >}}

3. Run the command `oc get pods -n dell-csi-operator` to validate the install. If completed successfully, you should be able to see the operator-related pod in the 'dell-csi-operator' namespace.

{{< imgproc non-olm-2.jpg Resize "3500x800" >}}{{< /imgproc >}}

## Custom Resource Definitions
As part of the Dell CSI Operator installation, a CRD representing each driver installation is also installed.  
List of CRDs which are installed in API Group `storage.dell.com`
* csipowermax
* csiunity
* csivxflexos
* csiisilon
* csipowerstore
* csipowermaxrevproxy

For installation of the supported drivers, a `CustomResource` has to be created in your cluster.

## Pre-Requisites for installation of the CSI Drivers

### Pre-requisites for upstream Kubernetes Clusters
On upstream Kubernetes clusters, make sure to install
* VolumeSnapshot CRDs
  * On clusters running v1.20 & v1.21, make sure to install v1 VolumeSnapshot CRDs
  * On clusters running v1.19, make sure to install v1beta1 VolumeSnapshot CRDs
* External Volume Snapshot Controller with the correct version

### Pre-requisites for Red Hat OpenShift Clusters
#### iSCSI
If you are installing a CSI driver which is going to use iSCSI as the transport protocol, please follow the following instructions.  
In Red Hat OpenShift clusters, you can create a `MachineConfig` object using the console or `oc` to ensure that the iSCSI daemon starts on all the Red Hat CoreOS nodes. Here is an example of a `MachineConfig` object:

```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: 99-iscsid
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 2.2.0  
    systemd:
      units:
      - name: "iscsid.service"
        enabled: true
```
Once the `MachineConfig` object has been deployed, CoreOS will ensure that `iscsid.service` starts automatically.

Alternatively, you can check the status of the iSCSI service by entering the following command on each worker node in the cluster:

`sudo systemctl status iscsid`

The service should be up and running (i.e. should be active state).

If the `iscsid.service` is not running, then perform the following steps on each worker node in the cluster
1. `Login` to worker nodes and check if the file /etc/iscsi/initiatorname.iscsi has been created properly
2. If the file doesn't exist or it doesn't contain a valid ISCSI IQN, then make sure it exists with valid entries
3. Ensure that iscsid service is running - Enable ```sudo systemctl enable iscsid``` & restart ```sudo systemctl restart iscsid``` iscsid if necessary. 
Note: If your worker nodes are running Red Hat CoreOS, make sure that automatic ISCSI login at boot is configured. Please contact RedHat for more details.

#### MultiPath
If you are installing a CSI Driver which requires the installation of the Linux native Multipath software - _multipathd_, please follow the below instructions

To enable multipathd on RedHat CoreOS nodes you need to prepare a working configuration encoded in base64.

`echo 'defaults {
user_friendly_names yes
find_multipaths yes
}
blacklist {
}' | base64 -w0`

Use the base64 encoded string output in the following `MachineConfig` yaml file (under source section)
```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: workers-multipath-conf-default
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 2.2.0
    storage:
      files:
      - contents:
          source: data:text/plain;charset=utf-8;base64,ZGVmYXVsdHMgewp1c2VyX2ZyaWVuZGx5X25hbWVzIHllcwpmaW5kX211bHRpcGF0aHMgeWVzCn0KCmJsYWNrbGlzdCB7Cn0K
          verification: {}
        filesystem: root
        mode: 400
        path: /etc/multipath.conf
```
After deploying this`MachineConfig` object, CoreOS will start multipath service automatically.  
Alternatively, you can check the status of the multipath service by entering the following command in each worker nodes.  
`sudo multipath -ll`

If the above command is not successful, ensure that the /etc/multipath.conf file is present and configured properly. Once the file has been configured correctly, enable the multipath service by running the following command: 
`sudo /sbin/mpathconf –-enable --with_multipathd y`

Finally, you have to restart the service by providing the command
`sudo systemctl restart multipathd`

For additional information refer to official documentation of the multipath configuration.

## Replacing CSI Operator with Dell CSI Operator
`Dell CSI Operator` was previously available, with the name `CSI Operator`, for both manual and OLM installation.  
`CSI Operator` has been discontinued and has been renamed to `Dell CSI Operator`.  This is just a name change and as a result,
the Kubernetes resources created as part of the Operator deployment will use the name `dell-csi-operator` instead of `csi-operator`.

Before proceeding with the installation of the new `Dell CSI Operator`, any existing `CSI Operator` installation has to be completely 
removed from the cluster.

Note - This **doesn't** impact any of the CSI Drivers which have been installed in the cluster

If the old `CSI Operator` was installed manually, then run the following command from the root of the repository which was used 
originally for installation

    bash scripts/undeploy.sh

If you don't have the original repository available, then run the following commands

    git clone https://github.com/dell/dell-csi-operator.git
    cd dell-csi-operator
    git checkout csi-operator-v1.0.0
    bash scripts/undeploy.sh

Note - Once you have removed the old `CSI Operator`, then for installing the new `Dell CSI Operator`, you will need to pull/checkout the latest code

If you had installed the old CSI Operator using OLM, then please follow the uninstallation instructions provided by OperatorHub. This will mostly involve:

    * Deleting the CSI Operator Subscription  
    * Deleting the CSI Operator CSV  


## Installing CSI Driver via Operator
CSI Drivers can be installed by creating a `CustomResource` object in your cluster.

Sample manifest files for each driver `CustomResourceDefintion` have been provided in the `samples` folder to help with the installation of the drivers.
These files follow the naming convention

    {driver name}_{driver version}_k8s_{k8 version}.yaml
Or

    {driver name}_{driver version}_ops_{OpenShift version}.yaml
For e.g.
* sample/powermax_v140_k8s_117.yaml* <- To install CSI PowerMax driver v1.4.0 on a Kubernetes 1.17 cluster  
* sample/powermax_v140_ops_46.yaml* <- To install CSI PowerMax driver v1.4.0 on an OpenShift 4.6 cluster

Copy the correct sample file and edit the mandatory & any optional parameters specific to your driver installation by following the instructions [here](#modify-the-driver-specification)  
>NOTE: A detailed explanation of the various mandatory and optional fields in the CustomResource is available [here](#custom-resource-specification). Please make sure to read through and understand the various fields.

Run the following command to install the CSI driver.
```
kubectl create -f <driver-manifest.yaml>
```

**Note**: If you are using an OLM based installation, the example manifests are available in the `OperatorHub` UI.
You can edit these manifests and install the driver using the `OperatorHub` UI.

### Verifying the installation
Once the driver Custom Resource has been created, you can verify the installation

*  Check if Driver CR got created successfully

    For e.g. – If you installed the PowerMax driver
    ```
    $ kubectl get csipowermax -n <driver-namespace>
    ```
* Check the status of the Custom Resource to verify if the driver installation was successful

If the driver-namespace was set to _test-powermax_, and the name of the driver is _powermax_, then run the command `kubectl get csipowermax/powermax -n test-powermax -o yaml` to get the details of the Custom Resource.

Note: If the _state_ of the `CustomResource` is _Running_ then all the driver pods have been successfully installed. If the _state_ is _SuccessFul_, then it means the driver deployment was successful but some driver pods may not be in a _Running_ state.
Please refer to the _Troubleshooting_ section [here](../../troubleshooting/operator) if you encounter any issues during installation.

### Changes in installation for latest CSI drivers
If you are installing the latest versions of the CSI drivers, the driver controller will be installed as a Kubernetes `Deployment` instead of a `Statefulset`. These installations can also run multiple replicas for the driver controller pods(not supported for StatefulSets) to support High Availability for the Controller.

## Update CSI Drivers
The CSI Drivers installed by the Dell CSI Operator can be updated like any Kubernetes resource. This can be achieved in various ways which include –

* Modifying the installation directly via `kubectl edit`
    For e.g. - If the name of the installed unity driver is unity, then run
    ```
    # Replace driver-namespace with the namespace where the Unity driver is installed
    $ kubectl edit csiunity/unity -n <driver-namespace>
    ```
    and modify the installation
* Modify the API object in-place via `kubectl patch`

**NOTE**: If you are trying to upgrade the CSI driver from an older version, make sure to modify the _configVersion_ field if required.

**NOTE**: Do not try to update the operator by modifying the original `CustomResource` manifest file and running the `kubectl apply -f` command. As part of the driver installation, the Operator sets some annotations on the `CustomResource` object which are further utilized in some workflows (like detecting upgrade of drivers). If you run the `kubectl apply -f` command to update the driver, these annotations are overwritten and this may lead to failures.

**NOTE**: From v1.4.0 onwards, Dell CSI Operator does not support creation of `StorageClass` and `VolumeSnapshotClass` objects. Although these fields are still present in the various driver `CustomResourceDefinitions`, they would be ignored by the operator. These fields will be removed from the `CustomResourceDefinitions` in a future release. If `StorageClass` and `VolumeSnapshotClass` needs to be retained,  you should upgrade the driver as per the recommended way noted above.
`StorageClass` and `VolumeSnapshotClass` would not be retained on driver uninstallation.  

### Supported modifications
* Changing environment variable values for driver
* Adding (supported) environment variables
* Updating the image of the driver
## Limitations
* The Dell CSI Operator can't manage any existing driver installed using Helm charts. If you already have installed one of the DellEMC CSI driver in your cluster and  want to use the operator based deployment, uninstall the driver and then redeploy the driver following the installation procedure described above
* The Dell CSI Operator is not fully compliant with the OperatorHub React UI elements and some of the Custom Resource fields may show up as invalid or unsupported in the OperatorHub GUI. To get around this problem, use kubectl/oc commands to get details about the Custom Resource(CR). This issue will be fixed in the upcoming releases of the Dell CSI Operator


## Custom Resource Specification
Each CSI Driver installation is represented by a Custom Resource.  

The specification for the Custom Resource is the same for all the drivers.   
Below is a list of all the mandatory and optional fields in the Custom Resource specification

### Mandatory fields
**configVersion** - Configuration version  - Refer full list of supported driver for finding out the appropriate config version [here](#full-list-of-csi-drivers-and-versions-supported-by-the-dell-csi-operator)                  
**replicas**  - Number of replicas for controller plugin - Must be set to 1 for all drivers  
**common**  
This field is mandatory and is used to specify common properties for both controller and the node plugin
* image - driver container image
* imagePullPolicy - Image Pull Policy of the driver image
* envs - List of environment variables and their values
### Optional fields
**controller** - List of environment variables and values which are applicable only for controller  
**node** - List of environment variables and values which are applicable only for node  
**sideCars** - Specification for CSI sidecar containers.  
**authSecret** - Name of the secret holding credentials for use by the driver. If not specified, the default secret *-creds must exist in the same namespace as driver  
**tlsCertSecret** - Name of the TLS cert secret for use by the driver. If not specified, a secret *-certs must exist in the namespace as driver

**forceUpdate**  
Boolean value which can be set to `true` in order to force update the status of the CSI Driver 

**tolerations**
List of tolerations which should be applied to the driver StatefulSet/Deployment and DaemonSet  
It should be set separately in the controller and node sections if you want separate set of tolerations for them

**nodeSelector**
Used to specify node selectors for the driver StatefulSet/Deployment and DaemonSet  

Here is a sample specification annotated with comments to explain each field
```yaml
apiVersion: storage.dell.com/v1
kind: CSIPowerMax          # Type of the driver
metadata:
  name: test-powermax      # Name of the driver
  namespace: test-powermax # Namespace where driver is installed
spec:
  driver:
    # Used to specify configuration version
    configVersion: v3      # Refer the table containing the full list of supported drivers to find the appropriate config version
    replicas: 1
    forceUpdate: false     # Set to true in case you want to force an update of driver status
    common:                # All common specification
      image: "dellemc/csi-powermax:v1.4.0.000R"   #driver image for a particular release
      imagePullPolicy: IfNotPresent
      envs:
        - name: X_CSI_POWERMAX_ENDPOINT
          value: "https://0.0.0.0:8443/"
        - name: X_CSI_K8S_CLUSTER_PREFIX
          value: "XYZ"
```
You can set the field ***replicas*** to a higher number than `1` for the latest driver versions.

Note - The `image` field should point to the correct image tag for version of the driver you are installing.  
For e.g. - If you wish to install v1.4 of the CSI PowerMax driver, use the image tag `dellemc/csi-powermax:v1.4.0.000R`

### SideCars
Although the sidecars field in the driver specification is optional, it is **strongly** recommended to not modify any details related to sidecars provided (if present) in the sample manifests. Any modifications to this should be only done after consulting with Dell EMC support.

### Modify the driver specification
* Choose the correct configVersion. Refer the table containing the full list of supported drivers and versions.
* Provide the namespace (in metadata section) where you want to install the driver.
* Provide a name (in metadata section) for the driver. This will be the name of the Custom Resource.
* Edit the values for mandatory configuration parameters specific to your installation.
* Edit/Add any values for optional configuration parameters to customize your installation.
* If you are installing the latest versions of the CSI drivers, the default number of replicas is set to 2. You can increase/decrease this value.

### StorageClass and VolumeSnapshotClass

#### New Installations
You should not provide any `StorageClass` or `VolumeSnapshotClass` details during driver installation. The sample files for all the drivers have been updated to reflect this change. Even if these details are there in the sample files, `StorageClass` or `VolumeSnapshotClass` will not be created.

#### What happens to my existing StorageClass & VolumeSnapshotClass objects
* In case you are upgrading an existing driver installation by using kubectl edit or by patching the object in place, any existing objects will remain as is. If you added more objects as part of the upgrade, then this request will be ignored by the Operator.
* If you uninstall the older driver, then any `StorageClass` or `VolumeSnapshotClass` objects will be deleted.
* An uninstall and followed by an install of the driver would also result in `StorageClass` and `VolumeSnapshotClass` getting deleted and not getting created again.

**NOTE:** For more information on pre-requisites and parameters, please refer to the sub-pages below for each driver.

**NOTE:** Storage Classes and Volume Snapshot Classes would no longer be created during the installation of the driver via an operator from v1.4.0 and higher.

