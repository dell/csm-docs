---
title: "CSM Operator"
linkTitle: "CSM Operator"
description: Container Storage Modules Operator
weight: 1
---

>>NOTE: The Dell CSM Operator is currently in tech-preview and is not supported in production environments. It can be used in environments where no other Dell CSI Drivers or CSM Modules are installed.

The Dell CSM Operator is a Kubernetes Operator, which can be used to install and manage the CSI Drivers and CSM Modules provided by Dell for various storage platforms. This operator is available as a community operator for upstream Kubernetes and can be deployed using OperatorHub.io. The operator can be installed using OLM (Operator Lifecycle Manager) or manually.

## Supported Platforms
Dell CSM Operator has been tested and qualified on Upstream Kubernetes and OpenShift. Supported versions are listed below.

| Kubernetes Version   | OpenShift Version   |
| -------------------- | ------------------- |
| 1.21, 1.22, 1.23     | 4.8, 4.9            |

## Supported CSI Drivers

| CSI Driver         | Version   | ConfigVersion  |
| ------------------ | --------- | -------------- |
| CSI PowerScale     | 2.2.0     | v2.2.0         |

## Supported CSM Modules

| CSM Modules        | Version   | ConfigVersion  |
| ------------------ | --------- | -------------- |
| CSM Authorization  | 1.2.0     | v1.2.0         |

## Installation
Dell CSM Operator can be installed manually or via Operator Hub.

### Manual Installation

#### Operator Installation on a cluster without OLM
1. Clone the [Dell CSM Operator repository](https://github.com/dell/csm-operator).
2. `cd csm-operator`
3. Run `bash scripts/install.sh` to install the operator.
>NOTE: Dell CSM Operator will be installed in the `dell-csm-operator` namespace.

{{< imgproc install.jpg Resize "2500x" >}}{{< /imgproc >}}

4. Run the command `kubectl get pods -n dell-csm-operator` to validate the installation. If installed successfully, you should be able to see the operator pod in the `dell-csm-operator` namespace.

{{< imgproc install_pods.jpg Resize "2500x" >}}{{< /imgproc >}}
   
#### Operator Installation on a cluster with OLM
1. Clone the [Dell CSM Operator repository](https://github.com/dell/csm-operator).
2. `cd csm-operator`
3. Run `bash scripts/install_olm.sh` to install the operator.
>NOTE: Dell CSM Operator will get installed in the `test-csm-operator-olm` namespace.

{{< imgproc install_olm.jpg Resize "2500x" >}}{{< /imgproc >}}

4. Once installation completes, run the command `kubectl get pods -n test-csm-operator-olm` to validate the installation. If installed successfully, you should be able to see the operator pods and CSV in the `test-csm-operator-olm` namespace. The CSV phase will be in `Succeeded` state.
   
{{< imgproc install_olm_pods.jpg Resize "2500x" >}}{{< /imgproc >}}

### Installation via Operator Hub
`dell-csm-operator` can be installed via Operator Hub on upstream Kubernetes clusters & Red Hat OpenShift Clusters.

##### Upstream Kubernetes
For installing via OperatorHub.io on Kubernetes, go to the [OperatorHub page](../../csidriver/partners/operator/).
_**NOTE**_: The recommended version of OLM for upstream Kubernetes is **`v0.18.2`**.

##### Red Hat OpenShift Clusters:
For installing via OpenShift with the Operator, go to the [OpenShift page](../../csidriver/partners/redhat/).


The installation process involves the creation of a `Subscription` object either via the _OperatorHub_ UI or using `kubectl/oc`. While creating the `Subscription` you can set the Approval strategy for the `InstallPlan` for the operator to: 
* _Automatic_ - If you want the operator to be automatically installed or upgraded (once an upgrade is available).
* _Manual_ - If you want a cluster administrator to manually review and approve the `InstallPlan` for installation/upgrades.

### Uninstall
#### Operator uninstallation on a cluster without OLM
To uninstall a CSM operator, run `bash scripts/uninstall.sh`. This will uninstall the operator in `dell-csm-operator` namespace.

{{< imgproc uninstall.jpg Resize "2500x" >}}{{< /imgproc >}}

#### Operator uninstallation on a cluster with OLM
To uninstall a CSM operator installed with OLM run `bash scripts/uninstall_olm.sh`. This will uninstall the operator in  `test-csm-operator-olm` namespace.

{{< imgproc uninstall_olm.jpg Resize "2500x" >}}{{< /imgproc >}}

### Custom Resource Definitions
As part of the Dell CSM Operator installation, a CRD representing configuration for the CSI Driver and CSM Modules is also installed.  
`containerstoragemodule` CRD is installed in API Group `storage.dell.com`.

Drivers and modules can be installed by creating a `customResource`.

### Custom Resource Specification
Each CSI Driver and CSM Module installation is represented by a Custom Resource.  

The specification for the Custom Resource is the same for all the drivers.Below is a list of all the mandatory and optional fields in the Custom Resource specification

#### Mandatory fields
**configVersion** - Configuration version - refer [here](#full-list-of-csi-drivers-and-versions-supported-by-the-dell-csm-operator) for appropriate config version                 
**replicas**  - Number of replicas for controller plugin - must be set to 1 for all drivers  
**dnsPolicy** - Determines the dnsPolicy for the node daemonset. Accepted values are `Default`, `ClusterFirst`, `ClusterFirstWithHostNet`, `None`
**common** - This field is mandatory and is used to specify common properties for both controller and the node plugin
* image - driver container image
* imagePullPolicy - Image Pull Policy of the driver image
* envs - List of environment variables and their values
#### Optional fields
**controller** - List of environment variables and values which are applicable only for controller  
**node** - List of environment variables and values which are applicable only for node  
**sideCars** - Specification for CSI sidecar containers.  
**authSecret** - Name of the secret holding credentials for use by the driver. If not specified, the default secret *-creds must exist in the same namespace as driver  
**tlsCertSecret** - Name of the TLS cert secret for use by the driver. If not specified, a secret *-certs must exist in the namespace as driver
**tolerations** - List of tolerations which should be applied to the driver StatefulSet/Deployment and DaemonSet. It should be set separately in the controller and node sections if you want separate set of tolerations for them
**nodeSelector** - Used to specify node selectors for the driver StatefulSet/Deployment and DaemonSet  

_**Note:**_ The `image` field should point to the correct image tag for version of the driver you are installing.  

### Supported CSI Drivers

| CSI Driver         | Version   | ConfigVersion  |
| ------------------ | --------- | -------------- |
| CSI PowerScale     | 2.2.0     | v2.2.0         |

### Pre-requisites for installation of the CSI Drivers

On Upstream Kubernetes clusters, make sure to install
* VolumeSnapshot CRDs - Install v1 VolumeSnapshot CRDs
* External Volume Snapshot Controller

#### Volume Snapshot CRD's
The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on Github. Manifests are available [here](https://github.com/kubernetes-csi/external-snapshotter/tree/v5.0.1/client/config/crd)

#### Volume Snapshot Controller
The CSI external-snapshotter sidecar is split into two controllers:
- A common snapshot controller
- A CSI external-snapshotter sidecar

The common snapshot controller must be installed only once in the cluster irrespective of the number of CSI drivers installed in the cluster. On OpenShift clusters, the common snapshot-controller is pre-installed. In the clusters where it is not present, it can be installed using `kubectl` and the manifests are available [here](https://github.com/kubernetes-csi/external-snapshotter/tree/v5.0.1/deploy/kubernetes/snapshot-controller)

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

## Installing CSI Driver via Operator

Refer [PowerScale Driver](drivers/powerscale) to install the driver via Operator

**Note**: If you are using an OLM based installation, example manifests are available in `OperatorHub` UI.
You can edit these manifests and install the driver using the `OperatorHub` UI.

### Verifying the driver installation
Once the driver `Custom Resource (CR)` is created, you can verify the installation as mentioned below

*  Check if ContainerStorageModule CR is created successfully using the command below:
    ```
    $ kubectl get csm -n <driver-namespace>
    ```
* Check the status of the CR to verify if the driver installation is successful.

If the driver namespace is set to _test-powerscale_ and the name of the driver is _powerscale_, then run the command `kubectl get csipowerscale/powerscale -n test-powerscale -o yaml` to get the details of the CR.

_**Note**_: If the _state_ of the CR is `Running` then all the driver pods have been successfully installed. If the _state_ is `Successful`, then it means the driver deployment is successful but some driver pods may not be in `Running` state.

### Update CSI Drivers
The CSI Drivers and CSM Modules installed by the Dell CSM Operator can be updated like any Kubernetes resource. This can be achieved in various ways which include:

* Modifying the installation directly via `kubectl edit`
    For e.g. - If the name of the installed PowerScale driver is powerscale, then run
    ```
    # Replace driver-namespace with the namespace where the PowerScale driver is installed
    $ kubectl edit csm/powerscale -n <driver-namespace>
    ```
    and modify the installation
* Modify the API object in-place via `kubectl patch`

### Supported modifications
* Changing environment variable values for driver
* Updating the image of the driver

### SideCars
Although the sidecars field in the driver specification is optional, it is **strongly** recommended to not modify any details related to sidecars provided (if present) in the sample manifests. The only exception to this is modifications requested by the documentation, for example, filling in blank IPs or other such system-specific data. Any modifications not specifically requested by the documentation should be only done after consulting with Dell support.

## Modules
The CSM Operator can optionally enable modules that are supported by the specific Dell CSI driver. By default, the modules are disabled but they can be enabled by setting the `enabled` flag to true and setting any other configuration options for the given module. 

### Supported CSM Modules

| CSM Modules        | Version   | ConfigVersion  |
| ------------------ | --------- | -------------- |
| CSM Authorization  | 1.2.0     | v1.2.0         |

## Limitations
* The Dell CSM Operator can't manage any existing driver installed using Helm charts or the Dell CSI Operator. If you already have installed one of the Dell CSI driver in your cluster and  want to use the operator based deployment, uninstall the driver and then redeploy the driver following the installation procedure described above
* The Dell CSM Operator is not fully compliant with the OperatorHub React UI elements.Due to this, some of the Custom Resource fields may show up as invalid or unsupported in the OperatorHub GUI. To get around this problem, use `kubectl/oc` commands to get details about the Custom Resource(CR). This issue will be fixed in the upcoming releases of the Dell CSM Operator.