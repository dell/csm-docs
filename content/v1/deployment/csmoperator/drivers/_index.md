---
title: "CSI Drivers"
linkTitle: "CSI Drivers"
description: Installation of Dell CSI Drivers using Dell CSM Operator
weight: 1
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}
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

## Upgrading Drivers with Dell CSM Operator
You can update CSI Drivers installed by the Dell CSM Operator like any Kubernetes resource:

1. </b>Modify Installation via kubectl edit:</b></br>

```bash
kubectl get <driver-object> -n <driver-namespace>
```
2. Replace `<driver-namespace>` with the appropriate namespace. For example, to get the CSI PowerStore driver object: </br>
```bash
kubectl get csm -n <driver-namespace>
```
Use the object name in the kubectl edit command: </br>

```bash
kubectl edit csm <driver-object>/<object-name> -n <driver-namespace>
```
For example, if the object name is powerstore:</br>

```bash
kubectl edit csm powerstore -n <driver-namespace>
```

Modify the installation as needed, typically updating driver versions, sidecars, and environment variables.

3. Refer how to [upgrade](https://infohub.delltechnologies.com/en-us/p/best-practices-for-deployment-and-life-cycle-management-of-dell-csm-modules-1/#:~:text=Upgrades%20with%20Operator)guide if you have more questions </br>

> Note: Starting with CSM 1.12, use images from [quay.io](https://quay.io/organization/dell). From CSM 1.14 (May 2025), editing the CSM object will fail if using images from [Docker Hub](https://hub.docker.com/r/dellemc/).

#### Supported modifications
* Changing environment variable values for driver
* Updating the image of the driver
* Upgrading the driver version

**NOTES:** 
1. If you are trying to upgrade the CSI driver from an older version, make sure to modify the _configVersion_ field if required.
   ```yaml
      driver:
        configVersion: v2.12.0
   ```
>NOTE: <b> Avoid updating the operator by modifying the original CustomResource manifest file and running `kubectl apply -f`. This can overwrite important annotations set by the Operator, leading to failures in workflows like driver upgrades. </b>

### Uninstall CSI Driver
The CSI Drivers and CSM Modules can be uninstalled by deleting the Custom Resource.

For e.g.
```bash
kubectl delete csm/powerscale -n <driver-namespace>
```

By default, the `forceRemoveDriver` option is set to `true` which will uninstall the CSI Driver and CSM Modules when the Custom Resource is deleted. Setting this option to `false` is not recommended.

### SideCars
Although the sidecars field in the driver specification is optional, it is **strongly** recommended to not modify any details related to sidecars provided (if present) in the sample manifests. The only exception to this is modifications requested by the documentation, for example, filling in blank IPs or other such system-specific data. Any modifications not specifically requested by the documentation should be only done after consulting with Dell support.
