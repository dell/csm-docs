--- 
toc_hide: true  
no_list: true
---
## (Optional) Volume Snapshot Requirements

On Upstream Kubernetes clusters, ensure that to install

* VolumeSnapshot CRDs - Install v1 VolumeSnapshot CRDs
* External Volume Snapshot Controller

For detailed snapshot setup procedure, [click here.](v1/concepts/snapshots/#helm-optional-volume-snapshot-requirements)

>NOTE: This step can be skipped with OpenShift.

## Installing CSI Driver via Operator

Refer [PowerScale Driver](../kubernetes/powerscale/csmoperator) to install the driver via Operator <br>
Refer [PowerFlex Driver](../kubernetes/powerflex/csmoperator) to install the driver via Operator <br>
Refer [PowerMax Driver](../kubernetes/powermax/csmoperator) to install the driver via Operator <br>
Refer [PowerStore Driver](../kubernetes/powerstore/csmoperator) to install the driver via Operator <br>
Refer [Unity XT Driver](../kubernetes/unityxt/csmoperator) to install the driver via Operator <br>

>NOTE: If you are using an OLM based installation, example manifests are available in `OperatorHub` UI.
You can edit these manifests and install the driver using the `OperatorHub` UI.

### Verifying the driver installation

Once the driver `Custom Resource (CR)` is created, you can verify the installation as mentioned below

* Check if ContainerStorageModule CR is created successfully using the command below:
    ```bash
    kubectl get csm/<name-of-custom-resource> -n <driver-namespace> -o yaml
    ```
* Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](v1/getting-started/installation/troubleshooting/csmoperator/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information. 

## Custom Resource Definitions

As part of the Dell CSM Operator installation, a CRD representing configuration for the CSI Driver and CSM Modules is also installed.
`containerstoragemodule` CRD is installed in API Group `storage.dell.com`.

Drivers and modules can be installed by creating a `customResource`.

### Custom Resource Specification

Each CSI Driver and CSM Module installation is represented by a Custom Resource.

The specification for the Custom Resource is the same for all the drivers.Below is a list of all the mandatory and optional fields in the Custom Resource specification

#### Mandatory fields

**configVersion** - Configuration version - refer [here](#supported-csm-components) for appropriate config version.

**replicas**  - Number of replicas for controller plugin - must be set to 1 for all drivers.

**dnsPolicy** - Determines the dnsPolicy for the node daemonset. Accepted values are `Default`, `ClusterFirst`, `ClusterFirstWithHostNet`, `None`.

**common** - This field is mandatory and is used to specify common properties for both controller and the node plugin.

* image - driver container image
* imagePullPolicy - Image Pull Policy of the driver image
* envs - List of environment variables and their values

#### Optional fields

**controller** - List of environment variables and values which are applicable only for controller.

**node** - List of environment variables and values which are applicable only for node.

**sideCars** - Specification for CSI sidecar containers.

**tlsCertSecret** - Name of the TLS cert secret for use by the driver. If not specified, a secret *-certs must exist in the namespace as driver.

**tolerations** - List of tolerations which should be applied to the driver StatefulSet/Deployment and DaemonSet. It should be set separately in the controller and node sections if you want separate set of tolerations for them.

**nodeSelector** - Used to specify node selectors for the driver StatefulSet/Deployment and DaemonSet.

>NOTE: The `image` field should point to the correct image tag for version of the driver you are installing.
