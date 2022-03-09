---
title: "CSM Operator"
linkTitle: "CSM Operator"
description: Container Storage Modules Operator
weight: 1
---

>>NOTE: The CSM Operator is currently in tech-preview and is not supported in production environments.

The Dell CSM Operator is a Kubernetes Operator, which can be used to install and manage the CSI Drivers and CSM Modules provided by Dell for various storage platforms. This operator is available as a community operator for upstream Kubernetes and can be deployed using OperatorHub.io. The operator can be installed using OLM (Operator Lifecycle Manager) or manually.

## Supported Platforms
Dell CSM Operator has been tested and qualified on Upstream Kubernetes and OpenShift. Supported versions are listed below.

| Kubernetes Version   | OpenShift Version     |
| -------------------- | --------------------- |
| 1.21, 1.22, 1.23     | 4.8, 4.8 EUS, 4.9     |

## Installation
**Dell CSM Operator can be installed manually or via OLM (Operator Lifecycle Manager).**

### Manual Installation

#### Operator Installation on an environment without OLM
1. Clone the [Dell CSM Operator repository](https://github.com/dell/csm-operator).
2. Run `bash scripts/install.sh` to install the operator.
>NOTE: Dell CSM Operator will install to the 'dell-csm-operator' namespace by default.

{{< imgproc install.jpg Resize "2500x" >}}{{< /imgproc >}}

3. Run the command `kubectl get pods -n dell-csm-operator` to validate the installation. If completed successfully, you should be able to see the operator-related pod in the 'dell-csm-operator' namespace.

{{< imgproc install_pods.jpg Resize "2500x" >}}{{< /imgproc >}}
   
#### Operator Installation on an environment with OLM
1. Clone the [Dell CSM Operator repository](https://github.com/dell/csm-operator).
2. Run `bash scripts/install_olm.sh` to install the operator.
>NOTE: Dell CSM Operator will install to the 'test-csm-operator-olm' namespace by default.

{{< imgproc install_olm.jpg Resize "2500x" >}}{{< /imgproc >}}

3. Once installation completes, run the command `kubectl get pods -n test-csm-operator-olm` to validate the installation. If completed successfully, 
   you should be able to see the operator-related pods in the `test-csm-operator-olm` namespace. Also, you can see a `dell-csm-operator` CSV with the status 'Succeeded'
   created in the namespace `test-csm-operator-olm`.
   
{{< imgproc install_olm_pods.jpg Resize "2500x" >}}{{< /imgproc >}}

### Installation Using Operator Lifecycle Manager
`dell-csm-operator` can be installed using Operator Lifecycle Manager (OLM) on upstream Kubernetes clusters & Red Hat OpenShift Clusters.  
The installation process involves the creation of a `Subscription` object either via the _OperatorHub_ UI or using `kubectl/oc`. While creating the `Subscription` you can set the Approval strategy for the `InstallPlan` for the Operator to - 
* _Automatic_ - If you want the Operator to be automatically installed or upgraded (once an upgrade becomes available)
* _Manual_ - If you want a Cluster Administrator to manually review and approve the `InstallPlan` for installation/upgrades

**NOTE**: The recommended version of OLM for upstream Kubernetes is **`v0.18.2`**.

##### Upstream Kubernetes
- For installing via OperatorHub.io on Kubernetes, go to the [OperatorHub page](../../partners/operator/).
##### Red Hat OpenShift Clusters
- For installing via OpenShift with the Operator, go to the [OpenShift page](../../partners/redhat/).

### Upgrade
To upgrade an existing CSM operator, run `bash scripts/install.sh --upgrade`. This will upgrade existing CRDs and Operator objects.
Manual upgrade is not supported for Operator installed in OLM environment.

{{< imgproc upgrade.jpg Resize "2500x" >}}{{< /imgproc >}}

### Uninstall
#### Operator Uninstallation on an environment without OLM
To uninstall a CSM operator, run `bash scripts/uninstall.sh`. This will uninstall the operator in `dell-csm-operator` namespace.

{{< imgproc uninstall.jpg Resize "2500x" >}}{{< /imgproc >}}

#### Operator Uninstallation on an environment with OLM
To uninstall a CSM operator installed with OLM run `bash scripts/uninstall_olm.sh`. This will uninstall the operator in  `test-csm-operator-olm` namespace.

{{< imgproc uninstall_olm.jpg Resize "2500x" >}}{{< /imgproc >}}

## Custom Resource Definitions
As part of the Dell CSM Operator installation, a CRD representing configuration for the CSI Driver and CSM Modules is also installed.  
CRD which is installed in API Group `storage.dell.com`
* containerstoragemodule

For installation of the supported drivers and modules, a `CustomResource` has to be created in your cluster.

## Supported CSI Drivers

| CSI Driver         | Version   | ConfigVersion  |
| ------------------ | --------- | -------------- |
| CSI PowerScale     | 2.2.0     | v2.2.0         |

## Pre-Requisites for installation of the CSI Drivers

On upstream Kubernetes clusters, make sure to install
* VolumeSnapshot CRDs - Install v1 VolumeSnapshot CRDs
* External Volume Snapshot Controller with the correct version

#### Volume Snapshot CRD's
The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on Github. Manifests are available here:[v5.0.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v5.0.1/client/config/crd)

#### Volume Snapshot Controller
The CSI external-snapshotter sidecar is split into two controllers:
- A common snapshot controller
- A CSI external-snapshotter sidecar

The common snapshot controller must be installed only once in the cluster irrespective of the number of CSI drivers installed in the cluster. On OpenShift clusters, the common snapshot-controller is pre-installed. In the clusters where it is not present, it can be installed using `kubectl` and the manifests are available here: [v5.0.x](https://github.com/kubernetes-csi/external-snapshotter/tree/v5.0.1/deploy/kubernetes/snapshot-controller)

*NOTE:*
- The manifests available on GitHub install the snapshotter image:
    - [quay.io/k8scsi/csi-snapshotter:v5.0.1](https://quay.io/repository/k8scsi/csi-snapshotter?tag=v5.0.1&tab=tags)
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
- It is recommended to use 5.0.x version of snapshotter/snapshot-controller.


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


## Installing CSI Driver via Operator

[PowerScale Driver](drivers/powerscale)

**Note**: If you are using an OLM based installation, the example manifests are available in the `OperatorHub` UI.
You can edit these manifests and install the driver using the `OperatorHub` UI.

### Verifying the installation
Once the driver Custom Resource has been created, you can verify the installation

*  Check if ContainerStorageModule CR got created successfully

    For e.g.
    ```
    $ kubectl get csm -n <driver-namespace>
    ```
* Check the status of the Custom Resource to verify if the driver installation was successful

If the driver-namespace was set to _test-powerscale_, and the name of the driver is _powerscale_, then run the command `kubectl get csipowerscale/powerscale -n test-powerscale -o yaml` to get the details of the Custom Resource.

Note: If the _state_ of the `CustomResource` is _Running_ then all the driver pods have been successfully installed. If the _state_ is _SuccessFul_, then it means the driver deployment was successful but some driver pods may not be in a _Running_ state.

## Update CSI Drivers
The CSI Drivers and CSM Modules installed by the Dell CSM Operator can be updated like any Kubernetes resource. This can be achieved in various ways which include –

* Modifying the installation directly via `kubectl edit`
    For e.g. - If the name of the installed PowerScale driver is powerscale, then run
    ```
    # Replace driver-namespace with the namespace where the PowerScale driver is installed
    $ kubectl edit csm/powerscale -n <driver-namespace>
    ```
    and modify the installation
* Modify the API object in-place via `kubectl patch`


**NOTE:** `Replicas` in the driver CR file should not be greater than or equal to the number of worker nodes when upgrading the driver. If the `Replicas` count is not less than the worker node count, some of the driver controller pods would land in a pending state, and upgrade will not be successful. Driver controller pods go in a pending state because they have anti-affinity to each other and cannot be scheduled on nodes where there is a driver controller pod already running. Refer to https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#inter-pod-affinity-and-anti-affinity for more details.
### Supported modifications
* Changing environment variable values for driver
* Adding (supported) environment variables
* Updating the image of the driver

## Limitations
* The Dell CSM Operator can't manage any existing driver installed using Helm charts. If you already have installed one of the Dell CSI driver in your cluster and  want to use the operator based deployment, uninstall the driver and then redeploy the driver following the installation procedure described above
* The Dell CSM Operator is not fully compliant with the OperatorHub React UI elements and some of the Custom Resource fields may show up as invalid or unsupported in the OperatorHub GUI. To get around this problem, use kubectl/oc commands to get details about the Custom Resource(CR). This issue will be fixed in the upcoming releases of the Dell CSM Operator


## Custom Resource Specification
Each CSI Driver and CSM Module installation is represented by a Custom Resource.  

The specification for the Custom Resource is the same for all the drivers.
Below is a list of all the mandatory and optional fields in the Custom Resource specification

### Mandatory fields
**configVersion** - Configuration version  - Refer full list of supported driver for finding out the appropriate config version [here](#full-list-of-csi-drivers-and-versions-supported-by-the-dell-csm-operator)                  
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

**tolerations**
List of tolerations which should be applied to the driver StatefulSet/Deployment and DaemonSet  
It should be set separately in the controller and node sections if you want separate set of tolerations for them

**nodeSelector**
Used to specify node selectors for the driver StatefulSet/Deployment and DaemonSet  

You can set the field ***replicas*** to a higher number than `1` for the latest driver versions.

Note - The `image` field should point to the correct image tag for version of the driver you are installing.  

### SideCars
Although the sidecars field in the driver specification is optional, it is **strongly** recommended to not modify any details related to sidecars provided (if present) in the sample manifests. The only exception to this is modifications requested by the documentation, for example, filling in blank IPs or other such system-specific data. Any modifications not specifically requested by the documentation should be only done after consulting with Dell support.

### Modules
The CSM Operator can optionally enable modules that are supported by the specific Dell CSI driver. By default, the modules are disabled but they can be enabled by setting the `enabled` flag to true and setting any other configuration options for the given module. 

### Supported CSM Modules

| CSM Modules       | Version    | ConfigVersion  |
| ------------------ | --------- | -------------- |
| CSM Authorization  | 1.2.0     | v1.2.0         |

