---
title: "CSM Operator"
linkTitle: "CSM Operator"
description: Container Storage Modules Operator
weight: 1
---

The Dell Container Storage Modules Operator Operator is a Kubernetes Operator, which can be used to install and manage the CSI Drivers and CSM Modules provided by Dell for various storage platforms. This operator is available as a community operator for upstream Kubernetes and can be deployed using OperatorHub.io. The operator can be installed using OLM (Operator Lifecycle Manager) or manually.

## Supported Platforms
Dell CSM Operator has been tested and qualified on Upstream Kubernetes and OpenShift. Supported versions are listed below.

| Kubernetes Version         | OpenShift Version   |
| -------------------------- | ------------------- |
| 1.24, 1.25, 1.26           | 4.10, 4.10 EUS, 4.11 |

## Supported CSI Drivers

| CSI Driver         | Version   | ConfigVersion  |
| ------------------ | --------- | -------------- |
| CSI PowerScale     | 2.4.0 +   |   v2.4.0 +     |
| CSI PowerFlex      | 2.4.0 +   |   v2.4.0 +     |

## Supported CSM Modules

| CSM Modules        | Version   | ConfigVersion  |
| ------------------ | --------- | -------------- |
| CSM Authorization  | 1.2.0 +   | v1.2.0 +       |
| CSM Replication    | 1.3.0 +   | v1.3.0 +       |
| CSM Observability  | 1.2.0 +   | v1.2.0 +       |

## Installation
Dell CSM Operator can be installed manually or via Operator Hub.

### Manual Installation

#### Operator Installation on a cluster without OLM

1. Clone and checkout the required csm-operator version using `git clone -b v1.1.0 https://github.com/dell/csm-operator.git`
2. `cd csm-operator`
3. (Optional) If using a local Docker image, edit the `deploy/operator.yaml` file and set the image name for the CSM Operator Deployment.
4. Run `bash scripts/install.sh` to install the operator.

>NOTE: Dell CSM Operator will be installed in the `dell-csm-operator` namespace.

{{< imgproc install.jpg Resize "2500x" >}}{{< /imgproc >}}

5. Run the command `kubectl get pods -n dell-csm-operator` to validate the installation. If installed successfully, you should be able to see the operator pod in the `dell-csm-operator` namespace.

{{< imgproc install_pods.jpg Resize "2500x" >}}{{< /imgproc >}}
   
#### Operator Installation on a cluster with OLM
1. Clone and checkout the required csm-operator version using `git clone -b v1.1.0 https://github.com/dell/csm-operator.git`
2. `cd csm-operator`
3. Run `bash scripts/install_olm.sh` to install the operator.
>NOTE: Dell CSM Operator will get installed in the `test-csm-operator-olm` namespace.

{{< imgproc install_olm.jpg Resize "2500x" >}}{{< /imgproc >}}

4. Once installation completes, run the command `kubectl get pods -n test-csm-operator-olm` to validate the installation. If installed successfully, you should be able to see the operator pods and CSV in the `test-csm-operator-olm` namespace. The CSV phase will be in `Succeeded` state.
   
{{< imgproc install_olm_pods.JPG Resize "2500x" >}}{{< /imgproc >}}

>**NOTE**: The recommended version of OLM for upstream Kubernetes is **`v0.18.3`**.

### Installation via Operator Hub
`dell-csm-operator` can be installed via Operator Hub on upstream Kubernetes clusters & Red Hat OpenShift Clusters.

The installation process involves the creation of a `Subscription` object either via the _OperatorHub_ UI or using `kubectl/oc`. While creating the `Subscription` you can set the Approval strategy for the `InstallPlan` for the operator to: 
* _Automatic_ - If you want the operator to be automatically installed or upgraded (once an upgrade is available).
* _Manual_ - If you want a cluster administrator to manually review and approve the `InstallPlan` for installation/upgrades.

### Uninstall
#### Operator uninstallation on a cluster without OLM
To uninstall a CSM operator, run `bash scripts/uninstall.sh`. This will uninstall the operator in `dell-csm-operator` namespace.

{{< imgproc uninstall.jpg Resize "2500x" >}}{{< /imgproc >}}

#### Operator uninstallation on a cluster with OLM
To uninstall a CSM operator installed with OLM run `bash scripts/uninstall_olm.sh`. This will uninstall the operator in  `test-csm-operator-olm` namespace.

{{< imgproc uninstall_olm.JPG Resize "2500x" >}}{{< /imgproc >}}

### To upgrade Dell CSM Operator, perform the following steps.
Dell CSM Operator can be upgraded in 2 ways:

1.Using script (for non-OLM based installation)

2.Using Operator Lifecycle Manager (OLM)

#### Using Installation Script
1. Clone and checkout the required csm-operator version using `git clone -b v1.1.0 https://github.com/dell/csm-operator.git`
2. `cd csm-operator`
3. Execute `bash scripts/install.sh --upgrade`  . This command will install the latest version of the operator.

>Note: Dell CSM Operator would install to the 'dell-csm-operator' namespace by default.

#### Using OLM
The upgrade of the Dell CSM Operator is done via Operator Lifecycle Manager.

The `Update approval` (**`InstallPlan`** in OLM terms) strategy plays a role while upgrading dell-csm-operator on OpenShift. This option can be set during installation of dell-csm-operator on OpenShift via the console and can be either set to `Manual` or `Automatic`.
- If the **`Update approval`** is set to `Automatic`, OpenShift automatically detects whenever the latest version of dell-csm-operator is available in the **`Operator hub`**, and upgrades it to the latest available version.
- If the upgrade policy is set to `Manual`, OpenShift notifies of an available upgrade. This notification can be viewed by the user in the **`Installed Operators`** section of the OpenShift console. Clicking on the hyperlink to `Approve` the installation would trigger the dell-csm-operator upgrade process.

**NOTE**: The recommended version of OLM for Upstream Kubernetes is **`v0.18.3`**.

### Custom Resource Definitions
As part of the Dell CSM Operator installation, a CRD representing configuration for the CSI Driver and CSM Modules is also installed.  
`containerstoragemodule` CRD is installed in API Group `storage.dell.com`.

Drivers and modules can be installed by creating a `customResource`.

### Custom Resource Specification
Each CSI Driver and CSM Module installation is represented by a Custom Resource.  

The specification for the Custom Resource is the same for all the drivers.Below is a list of all the mandatory and optional fields in the Custom Resource specification

#### Mandatory fields

**configVersion** - Configuration version - refer [here](#supported-csi-drivers) for appropriate config version.

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

**authSecret** - Name of the secret holding credentials for use by the driver. If not specified, the default secret *-creds must exist in the same namespace as driver.

**tlsCertSecret** - Name of the TLS cert secret for use by the driver. If not specified, a secret *-certs must exist in the namespace as driver.

**tolerations** - List of tolerations which should be applied to the driver StatefulSet/Deployment and DaemonSet. It should be set separately in the controller and node sections if you want separate set of tolerations for them.

**nodeSelector** - Used to specify node selectors for the driver StatefulSet/Deployment and DaemonSet. 

>**Note:** The `image` field should point to the correct image tag for version of the driver you are installing.  
