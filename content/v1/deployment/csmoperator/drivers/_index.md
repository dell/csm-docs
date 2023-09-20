---
title: "CSI Drivers"
linkTitle: "CSI Drivers"
description: Installation of Dell CSI Drivers using Dell CSM Operator
weight: 1
---

## (Optional) Volume Snapshot Requirements

On Upstream Kubernetes clusters, ensure that to install
* VolumeSnapshot CRDs - Install v1 VolumeSnapshot CRDs
* External Volume Snapshot Controller

For detailed snapshot setup procedure, [click here.](../../../snapshots/#optional-volume-snapshot-requirements)

>NOTE: This step can be skipped with OpenShift.

## Installing CSI Driver via Operator

Refer [PowerScale Driver](../drivers/powerscale) to install the driver via Operator <br>
Refer [PowerFlex Driver](../drivers/powerflex) to install the driver via Operator <br>
Refer [PowerMax Driver](../drivers/powermax) to install the driver via Operator <br>
Refer [PowerStore Driver](../drivers/powerstore) to install the driver via Operator <br>
Refer [Unity XT Driver](../drivers/unity) to install the driver via Operator <br>

>NOTE: If you are using an OLM based installation, example manifests are available in `OperatorHub` UI.
You can edit these manifests and install the driver using the `OperatorHub` UI.

### Verifying the driver installation
Once the driver `Custom Resource (CR)` is created, you can verify the installation as mentioned below

*  Check if ContainerStorageModule CR is created successfully using the command below:
    ```bash

    kubectl get csm/<name-of-custom-resource> -n <driver-namespace> -o yaml
    ```
* Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.


### Update CSI Drivers
The CSI Drivers and CSM Modules installed by the Dell CSM Operator can be updated like any Kubernetes resource. This can be achieved in various ways which include:

* Modifying the installation directly via `kubectl edit`
    For example - If the name of the installed PowerScale driver is powerscale, then run
    #Replace driver-namespace with the namespace where the PowerScale driver is installed
    ```bash
    kubectl edit csm/powerscale -n <driver-namespace>
    ```
    and modify the installation
* Modify the API object in-place via `kubectl patch`

#### Supported modifications
* Changing environment variable values for driver
* Updating the image of the driver
* Upgrading the driver version

**NOTES:** 
1. If you are trying to upgrade the CSI driver from an older version, make sure to modify the _configVersion_ field if required.
   ```yaml
      driver:
        configVersion: v2.7.0
   ```
2. Do not try to update the operator by modifying the original `CustomResource` manifest file and running the `kubectl apply -f` command. As part of the driver installation, the Operator sets some annotations on the `CustomResource` object which are further utilized in some workflows (like detecting upgrade of drivers). If you run the `kubectl apply -f` command to update the driver, these annotations are overwritten and this may lead to failures.

### Uninstall CSI Driver
The CSI Drivers and CSM Modules can be uninstalled by deleting the Custom Resource.

For e.g.
```bash
kubectl delete csm/powerscale -n <driver-namespace>
```

By default, the `forceRemoveDriver` option is set to `true` which will uninstall the CSI Driver and CSM Modules when the Custom Resource is deleted. Setting this option to `false` is not recommended.

### SideCars
Although the sidecars field in the driver specification is optional, it is **strongly** recommended to not modify any details related to sidecars provided (if present) in the sample manifests. The only exception to this is modifications requested by the documentation, for example, filling in blank IPs or other such system-specific data. Any modifications not specifically requested by the documentation should be only done after consulting with Dell support.
