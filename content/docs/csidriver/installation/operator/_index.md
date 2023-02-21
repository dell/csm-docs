---
title: "CSI Driver installation using Dell CSI Operator"
linkTitle: "Using Operator"
weight: 4
description: >
  Installation of CSI drivers using Dell CSI Operator
---

The Dell CSI Operator is a Kubernetes Operator, which can be used to install and manage the CSI Drivers provided by Dell for various storage platforms. This operator is available as a community operator for upstream Kubernetes and can be deployed using OperatorHub.io. It is also available as a certified operator for OpenShift clusters and can be deployed using the OpenShift Container Platform. Both these methods of installation use OLM (Operator Lifecycle Manager).  The operator can also be deployed manually.

## Prerequisites

#### Volume Snapshot CRD's
The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on Github. Manifests are available here:[v6.1.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v6.1.0/client/config/crd)

#### Volume Snapshot Controller
The CSI external-snapshotter sidecar is split into two controllers:
- A common snapshot controller
- A CSI external-snapshotter sidecar

The common snapshot controller must be installed only once in the cluster irrespective of the number of CSI drivers installed in the cluster. On OpenShift clusters 4.4 and later, the common snapshot-controller is pre-installed. In the clusters where it is not present, it can be installed using `kubectl` and the manifests are available here: [v6.1.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v6.1.0/deploy/kubernetes/snapshot-controller)

*NOTE:*
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

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
- It is recommended to use 6.1.x version of snapshotter/snapshot-controller.


## Installation
Dell CSI Operator has been tested and qualified with 
- Upstream Kubernetes or OpenShift (see [supported versions](../../../csidriver/#features-and-capabilities))

#### Before you begin
If you have installed an old version of the `dell-csi-operator` which was available with the name _CSI Operator_, please refer to this [section](#replacing-csi-operator-with-dell-csi-operator) before continuing.

#### Full list of CSI Drivers and versions supported by the Dell CSI Operator
| CSI Driver         | Version | ConfigVersion | Kubernetes Version | OpenShift Version     |
| ------------------ |---------|---------------|--------------------| --------------------- |
| CSI PowerMax       | 2.4.0   | v2.3.0        | 1.22, 1.23, 1.24   | 4.8, 4.8 EUS, 4.9     |
| CSI PowerMax       | 2.5.0   | v2.4.0        | 1.23, 1.24, 1.25   | 4.9, 4.10, 4.10 EUS   |
| CSI PowerMax       | 2.6.0   | v2.5.0        | 1.24, 1.25, 1.26   | 4.10, 4.10 EUS, 4.11  |
| CSI PowerFlex      | 2.3.0   | v2.3.0        | 1.22, 1.23, 1.24   | 4.9, 4.10, 4.10 EUS   |
| CSI PowerFlex      | 2.4.0   | v2.4.0        | 1.22, 1.23, 1.24   | 4.9, 4.10, 4.10 EUS   |
| CSI PowerFlex      | 2.5.0   | v2.5.0        | 1.23, 1.24, 1.25   | 4.10, 4.10 EUS, 4.11  |
| CSI PowerScale     | 2.4.0   | v2.4.0        | 1.22, 1.23, 1.24   | 4.9, 4.10, 4.10 EUS   |
| CSI PowerScale     | 2.5.0   | v2.5.0        | 1.23, 1.24, 1.25   | 4.10, 4.10 EUS, 4.11   |
| CSI PowerScale     | 2.6.0   | v2.6.0        | 1.24, 1.25, 1.26   | 4.10, 4.10 EUS, 4.11  |
| CSI Unity XT       | 2.3.0   | v2.3.0        | 1.22, 1.23, 1.24   | 4.9, 4.10, 4.10 EUS   |
| CSI Unity XT       | 2.4.0   | v2.4.0        | 1.22, 1.23, 1.24   | 4.9, 4.10, 4.10 EUS   |
| CSI Unity XT       | 2.5.0   | v2.5.0        | 1.23, 1.24, 1.25   | 4.10, 4.10 EUS, 4.11  |
| CSI PowerStore     | 2.3.0   | v2.3.0        | 1.22, 1.23, 1.24   | 4.9, 4.10, 4.10 EUS   |
| CSI PowerStore     | 2.4.0   | v2.4.0        | 1.22, 1.23, 1.24   | 4.9, 4.10, 4.10 EUS   |
| CSI PowerStore     | 2.5.0   | v2.5.0        | 1.23, 1.24. 1.25   | 4.10, 4.10 EUS, 4.11  |

</br>

**Dell CSI Operator can be installed via OLM (Operator Lifecycle Manager) and manual installation.**

### Installation Using Operator Lifecycle Manager
`dell-csi-operator` can be installed using Operator Lifecycle Manager (OLM) on upstream Kubernetes clusters & Red Hat OpenShift Clusters.  
The installation process involves the creation of a `Subscription` object either via the _OperatorHub_ UI or using `kubectl/oc`. While creating the `Subscription` you can set the Approval strategy for the `InstallPlan` for the Operator to - 
* _Automatic_ - If you want the Operator to be automatically installed or upgraded (once an upgrade becomes available)
* _Manual_ - If you want a Cluster Administrator to manually review and approve the `InstallPlan` for installation/upgrades

**NOTE**: The recommended version of OLM for upstream Kubernetes is **`v0.18.3`**.

#### Pre-Requisite for installation with OLM
Please run the following commands for creating the required `ConfigMap` before installing the `dell-csi-operator` using OLM.  
```
$ git clone https://github.com/dell/dell-csi-operator.git
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
1. Clone and checkout the required dell-csi-operator version using `git clone -b v1.10.0 https://github.com/dell/dell-csi-operator.git`.
2. cd dell-csi-operator
3. Run `bash scripts/install.sh` to install the operator.

{{< imgproc non-olm-1.jpg Resize "2500x" >}}{{< /imgproc >}}

4. Run the command `oc get pods -n dell-csi-operator` to validate the installation. If completed successfully, you should be able to see the operator-related pod in the 'dell-csi-operator' namespace.

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
  * On clusters running v1.24,v1.25 & v1.26, make sure to install v1 VolumeSnapshot CRDs
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
      version: 3.2.0  
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
      version: 3.2.0
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

## Installing CSI Driver via Operator
CSI Drivers can be installed by creating a `CustomResource` object in your cluster.

Sample manifest files for each driver `CustomResourceDefintion` have been provided in the `samples` folder to help with the installation of the drivers.
These files follow the naming convention

    {driver name}_{driver version}_k8s_{k8 version}.yaml
Or

    {driver name}_{driver version}_ops_{OpenShift version}.yaml
For e.g.
* samples/powermax_v260_k8s_126.yaml* <- To install CSI PowerMax driver v2.6.0 on a Kubernetes 1.26 cluster  
* samples/powermax_v250_ops_411.yaml* <- To install CSI PowerMax driver v2.5.0 on an OpenShift 4.11 cluster

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

## Update CSI Drivers
The CSI Drivers installed by the Dell CSI Operator can be updated like any Kubernetes resource. This can be achieved in various ways which include –

* Modifying the installation directly via `kubectl edit`
    For example - If the name of the installed Unity XT driver is unity, then run
    ```
    # Replace driver-namespace with the namespace where the Unity XT driver is installed
    $ kubectl edit csiunity/unity -n <driver-namespace>
    ```
    and modify the installation. The usual fields to edit are the version of drivers and sidecars and the env variables.
* Modify the API object in place via `kubectl patch` command. 

To create patch file or edit deployments, refer [here](https://github.com/dell/dell-csi-operator/tree/master/samples) for driver version & env variables and [here](https://github.com/dell/dell-csi-operator/tree/master/driverconfig/config.yaml) for version of side-cars.
The latest versions of drivers could have additional env variables or sidecars.

The below notes explain some of the general items to take care of.

**NOTES:** 
1. If you are trying to upgrade the CSI driver from an older version, make sure to modify the _configVersion_ field if required.
   ```yaml
      driver:
        configVersion: v2.5.0
   ```
2. Volume Health Monitoring feature is optional and by default this feature is disabled for drivers when installed via operator.
   To enable this feature, we will have to modify the below block while upgrading the driver.To get the volume health state add 
   external-health-monitor sidecar in the sidecar section and `value`under controller set to true and the `value` under node set 
   to true as shown below:<br />
    i. Add controller and node section as below:
    ```yaml
        controller:
          envs:
            - name: X_CSI_HEALTH_MONITOR_ENABLED
              value: "true"
        dnsPolicy: ClusterFirstWithHostNet
        node:
          envs:
            - name: X_CSI_HEALTH_MONITOR_ENABLED
              value: "true"
    ```
   ii. Update the sidecar versions and add external-health-monitor sidecar if you want to enable health monitor of CSI volumes from Controller plugin:
    ```yaml
        sideCars:
        - args:
          - --volume-name-prefix=csiunity
          - --default-fstype=ext4
          image: k8s.gcr.io/sig-storage/csi-provisioner:v3.3.0
          imagePullPolicy: IfNotPresent
          name: provisioner
        - args:
          - --snapshot-name-prefix=csiunitysnap
          image: k8s.gcr.io/sig-storage/csi-snapshotter:v6.1.0
          imagePullPolicy: IfNotPresent
          name: snapshotter
        - args:
          - --monitor-interval=60s
          image: gcr.io/k8s-staging-sig-storage/csi-external-health-monitor-controller:v0.7.0
          imagePullPolicy: IfNotPresent
          name: external-health-monitor
        - image: k8s.gcr.io/sig-storage/csi-attacher:v4.0.0
          imagePullPolicy: IfNotPresent
          name: attacher
        - image: k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.6.0
          imagePullPolicy: IfNotPresent
          name: registrar
        - image: k8s.gcr.io/sig-storage/csi-resizer:v1.6.0
          imagePullPolicy: IfNotPresent
          name: resizer
    ```
3. Configmap needs to be created with command `kubectl create -f configmap.yaml` using following yaml file.
```yaml
kind: ConfigMap
metadata:
  name: unity-config-params
  namespace: test-unity
data:
  driver-config-params.yaml: |
    CSI_LOG_LEVEL: "info"
    ALLOW_RWO_MULTIPOD_ACCESS: "false"
    MAX_UNITY_VOLUMES_PER_NODE: "0"
    SYNC_NODE_INFO_TIME_INTERVAL: "15"
    TENANT_NAME: ""
```

**NOTE:** `Replicas` in the driver CR file should not be greater than or equal to the number of worker nodes when upgrading the driver. If the `Replicas` count is not less than the worker node count, some of the driver controller pods would land in a pending state, and upgrade will not be successful. Driver controller pods go in a pending state because they have anti-affinity to each other and cannot be scheduled on nodes where there is a driver controller pod already running. Refer to https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#inter-pod-affinity-and-anti-affinity for more details.

**NOTE:** Do not try to update the operator by modifying the original `CustomResource` manifest file and running the `kubectl apply -f` command. As part of the driver installation, the Operator sets some annotations on the `CustomResource` object which are further utilized in some workflows (like detecting upgrade of drivers). If you run the `kubectl apply -f` command to update the driver, these annotations are overwritten and this may lead to failures.

**NOTE:** From v1.4.0 onwards, Dell CSI Operator does not support the creation of `StorageClass` and `VolumeSnapshotClass` objects. Although these fields are still present in the various driver `CustomResourceDefinitions`, they would be ignored by the operator. These fields will be removed from the `CustomResourceDefinitions` in a future release. If `StorageClass` and `VolumeSnapshotClass` need to be retained,  you should upgrade the driver as per the recommended way noted above.
`StorageClass` and `VolumeSnapshotClass` would not be retained on driver uninstallation.  

### Supported modifications
* Changing environment variable values for driver
* Adding (supported) environment variables
* Updating the image of the driver
## Limitations
* The Dell CSI Operator can't manage any existing driver installed using Helm charts. If you already have installed one of the Dell CSI drivers in your cluster and  want to use the operator based deployment, uninstall the driver and then redeploy the driver following the installation procedure described.
* The Dell CSI Operator is not fully compliant with the OperatorHub React UI elements and some of the Custom Resource fields may show up as invalid or unsupported in the OperatorHub GUI. To get around this problem, use kubectl/oc commands to get details about the Custom Resource(CR). This issue will be fixed in the upcoming releases of the Dell CSI Operator


## Custom Resource Specification
Each CSI Driver installation is represented by a Custom Resource.  

The specification for the Custom Resource is the same for all the drivers.   
Below is a list of all the mandatory and optional fields in the Custom Resource specification

### Mandatory fields
**configVersion** - Configuration version  - Refer full list of supported driver for finding out the appropriate config version [here](#full-list-of-csi-drivers-and-versions-supported-by-the-dell-csi-operator)                  
**replicas**  - Number of replicas for controller plugin - Must be set to 1 for all drivers  
**dnsPolicy** - Determines the dnsPolicy for the node daemonset. Accepted values are `Default`, `ClusterFirst`, `ClusterFirstWithHostNet`, `None`
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

**fsGroupPolicy**
Defines which FS Group policy mode to be used, Supported modes: None, File and ReadWriteOnceWithFSType 

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
For e.g. - If you wish to install v2.5.0 of the CSI PowerMax driver, use the image tag `dellemc/csi-powermax:v2.5.0`

### SideCars
Although the sidecars field in the driver specification is optional, it is **strongly** recommended to not modify any details related to sidecars provided (if present) in the sample manifests. The only exception to this is modifications requested by the documentation, for example, filling in blank IPs or other such system-specific data. Any modifications not specifically requested by the documentation should be only done after consulting with Dell support.

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

