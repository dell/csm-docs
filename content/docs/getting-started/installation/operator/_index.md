--- 
toc_hide: true  
no_list: true
---
## (Optional) Volume Snapshot Requirements

On Upstream Kubernetes clusters, ensure that to install

* VolumeSnapshot CRDs - Install v1 VolumeSnapshot CRDs
* External Volume Snapshot Controller

For detailed snapshot setup procedure, [click here.](docs/concepts/snapshots/#optional-volume-snapshot-requirements)

>NOTE: This step can be skipped with OpenShift.

## Installing CSI Driver via Operator

Refer [PowerScale Driver](../kubernetes/powerscale/csmoperator) to install the driver via Operator <br>
Refer [PowerFlex Driver](../kubernentes/powerflex/csmoperator) to install the driver via Operator <br>
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
* Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](docs/getting-started/installation/troubleshooting/csmoperator/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.