---
title: "CSM Operator"
linkTitle: "CSM Operator"
description: Container Storage Modules Operator
weight: 2
---

The Dell Container Storage Modules Operator is a Kubernetes Operator, which can be used to install and manage the CSI Drivers and CSM Modules provided by Dell for various storage platforms. This operator is available as a community operator for upstream Kubernetes and can be deployed using OperatorHub.io. The operator can be installed using OLM (Operator Lifecycle Manager) or manually.

## Supported CSM Components

The table below lists the driver and modules versions installable with the CSM Operator:

| CSI Driver         | Version | CSM Authorization | CSM Replication | CSM Observability | CSM Resiliency |
| ------------------ |---------|-------------------|-----------------|-------------------|----------------|
| CSI PowerScale     | 2.11.0  | ✔ 1.11.0          | ✔ 1.9.0        | ✔ 1.9.0           | ✔ 1.10.0       |
| CSI PowerScale     | 2.10.0  | ✔ 1.10.0          | ✔ 1.8.0        | ✔ 1.8.0           | ✔ 1.9.0        |
| CSI PowerScale     | 2.9.0   | ✔ 1.9.0           | ✔ 1.7.0        | ✔ 1.7.0           | ✔ 1.8.0        |
| CSI PowerFlex      | 2.11.0  | ✔ 1.11.0          | ✔ 1.9.0        | ✔ 1.9.0           | ✔ 1.10.0       |
| CSI PowerFlex      | 2.10.0  | ✔ 1.10.0          | ✔ 1.8.0        | ✔ 1.8.0           | ✔ 1.9.0        |
| CSI PowerFlex      | 2.9.0   | ✔ 1.9.0           | ✔ 1.7.0        | ✔ 1.7.0           | ✔ 1.8.0        |
| CSI PowerStore     | 2.11.0  | ❌                | ❌             | ❌                | ✔ 1.10.0       |
| CSI PowerStore     | 2.10.0  | ❌                | ❌             | ❌                | ✔ 1.9.0        |
| CSI PowerStore     | 2.9.0   | ❌                | ❌             | ❌                | ✔ 1.8.0        |
| CSI PowerMax       | 2.11.0  | ✔ 1.11.0          | ✔ 1.9.0        | ✔ 1.9.0           | ❌             |
| CSI PowerMax       | 2.10.0  | ✔ 1.10.0          | ✔ 1.8.0        | ✔ 1.8.0           | ❌             |
| CSI PowerMax       | 2.9.0   | ✔ 1.9.0           | ✔ 1.7.0        | ✔ 1.7.0           | ❌             |
| CSI Unity XT       | 2.11.0  | ❌                | ❌             | ❌                | ❌             |
| CSI Unity XT       | 2.10.0  | ❌                | ❌             | ❌                | ❌             |
| CSI Unity XT       | 2.9.0   | ❌                | ❌             | ❌                | ❌             |

These CR will be used for new deployment or upgrade. In most case, it is recommended to use the latest available version.

The full compatibility matrix of CSI/CSM versions for the CSM Operator is available [here](../../prerequisites/#csm-operator-compatibility-matrix)
## Installation
Dell CSM Operator can be installed manually or via Operator Hub.

Once installed you will be able to deploy [drivers](drivers) and [modules](modules) from the Operator.

### OpenShift Installation via Operator Hub
`dell-csm-operator` can be installed via Operator Hub on upstream Kubernetes clusters & Red Hat OpenShift Clusters.

The installation process involves the creation of a `Subscription` object either via the _OperatorHub_ UI or using `kubectl/oc`. While creating the `Subscription` you can set the Approval strategy for the `InstallPlan` for the operator to:
* _Automatic_ - If you want the operator to be automatically installed or upgraded (once an upgrade is available).
* _Manual_ - If you want a cluster administrator to manually review and approve the `InstallPlan` for installation/upgrades.

![OpenShit Operator Hub CSM install](operator_hub_install.gif)

### Certified vs Community
Dell CSM Operator is distributed as both `Certified` & `Community` editions. 

Both editions have the same codebase and are supported by Dell Technologies, the only differences are:
* The `Certified` version is officially supported by Redhat by partnering with software vendors.
* The `Certified` version is often released couple of days/weeks after the `Community` version.
* The `Certified` version is specific to Openshift and can only be installed on specific Openshift versions where it is certified.
* The `Community` can be installed on any Kubernetes distributions.

### Manual Installation on a cluster without OLM

1. Install volume snapshot CRDs. For detailed snapshot setup procedure, [click here](../../snapshots/#volume-snapshot-feature).
2. Clone and checkout the required csm-operator version using
```bash
git clone -b v1.6.0 https://github.com/dell/csm-operator.git
```
3. `cd csm-operator`
4. _(Optional)_ If using a local Docker image, edit the `deploy/operator.yaml` file and set the image name for the CSM Operator Deployment.
5. _(Optional)_ If **CSM Replication** is planned for use and will be deployed using two clusters in an environment where the DNS is not configured, and cluster API endpoints are FQDNs, in order to resolve queries to remote API endpoints, it is necessary to edit the `deploy/operator.yaml` file and add the `hostAliases` field and associated `<FQDN>:<IP>` mappings to the CSM Operator Controller Manager Deployment under `spec.template.spec`. More information on host aliases can be found, [here](https://kubernetes.io/docs/tasks/network/customize-hosts-file-for-pods/).
    ```yaml
    # example config
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: dell-csm-operator-controller-manager
    spec:
      template:
        spec:
          hostAliases:
          - hostnames:
            - "remote.FQDN"
            ip: "255.255.255.1"
    ```
6. Run `bash scripts/install.sh` to install the operator.

>NOTE: Dell CSM Operator will be installed in the `dell-csm-operator` namespace.

{{< imgproc install.JPG Resize "2500x" >}}{{< /imgproc >}}

6. Run the command to validate the installation.
```bash
kubectl get pods -n dell-csm-operator
```
 If installed successfully, you should be able to see the operator pod in the `dell-csm-operator` namespace.

{{< imgproc install_pods.jpg Resize "2500x" >}}{{< /imgproc >}}

### Offline Bundle Installation on a cluster without OLM
The `csm-offline-bundle.sh` script can be used to create a package usable for offline installation of Dell CSI Drivers via CSM Operator

#### Dependencies

Multiple Linux-based systems may be required to create and process an offline bundle for use.
* One Linux-based system, with Internet access, will be used to create the bundle. This involves the user cloning a git repository hosted on github.com and then invoking a script that utilizes `docker` or `podman` to pull and save container images to file.
* One Linux-based system, with access to an image registry, to invoke a script that uses `docker` or `podman` to restore container images from file and push them to a registry

If one Linux system has both Internet access and access to an internal registry, that system can be used for both steps.

Preparing an offline bundle requires the following utilities:

| Dependency            | Usage |
| --------------------- | ----- |
| `docker` or `podman`  | `docker` or `podman` will be used to pull images from public image registries, tag them, and push them to a private registry. |
|                       | One of these will be required on both the system building the offline bundle as well as the system preparing for installation. |
|                       | Tested version(s) are `docker` 24.0.5 and `podman` 4.4.1 |
| `git`                 | `git` will be used to manually clone one of the above repositories in order to create an offline bundle. |
|                       | This is only needed on the system preparing the offline bundle. |
|                       | Tested version(s) are `git` 2.39.3 but any version should work. |

#### Workflow

To perform an offline installation, the following steps should be performed:
1. Build an offline bundle
2. Unpack the offline bundle created in Step 1 and prepare for installation
3. Perform operator installation using the files obtained after unpacking in Step 2
4. Perform driver installation using the files obtained after unpacking in Step 2

>NOTE: It is recommended to use the same build tool for packing and unpacking of images (either docker or podman).

#### Building an offline bundle

This needs to be performed on a Linux system with access to the Internet as a git repo will need to be cloned, and container images pulled from public registries.

To build an offline bundle, the following steps are needed:
1. Clone and checkout the required csm-operator version using
```bash
git clone -b v1.6.0 https://github.com/dell/csm-operator.git
```
2. `cd csm-operator`
3. Run the `csm-offline-bundle.sh` script which will be found in the `scripts` directory with an argument of `-c` in order to create an offline bundle
```bash
bash scripts/csm-offline-bundle.sh -c
```

The script will perform the following steps:
  - Determine required images by parsing CSM Operator configuration files
  - Perform an image `pull` of each image required
  - Save all required images to a file by running `docker save` or `podman save`
  - Build a `tar.gz` file containing the images as well as files required to install the Operator and drivers.

Here is the output of a request to build an offline bundle for the Dell CSM Operator:

```
* Building image manifest file

   Processing file /root/csm-operator/operatorconfig/driverconfig/common/default.yaml
   Processing file /root/csm-operator/bundle/manifests/dell-csm-operator.clusterserviceversion.yaml

* Pulling and saving container images

   dellemc/csi-isilon:v2.11.0
   dellemc/csi-metadata-retriever:v1.8.0
   dellemc/csipowermax-reverseproxy:v2.10.0
   dellemc/csi-powermax:v2.11.0
   dellemc/csi-powerstore:v2.11.0
   dellemc/csi-unity:v2.11.0
   dellemc/csi-vxflexos:v2.11.0
   dellemc/csm-authorization-sidecar:v1.11.0
   dellemc/csm-metrics-powerflex:v1.9.0
   dellemc/csm-metrics-powerscale:v1.6.0
   dellemc/csm-topology:v1.9.0
   dellemc/dell-csi-replicator:v1.9.0
   dellemc/dell-replication-controller:v1.9.0
   dellemc/sdc:4.5.1
   docker.io/dellemc/dell-csm-operator:v1.6.0
   gcr.io/kubebuilder/kube-rbac-proxy:v0.8.0
   nginxinc/nginx-unprivileged:1.20
   otel/opentelemetry-collector:0.42.0
   registry.k8s.io/sig-storage/csi-attacher:v4.6.1
   registry.k8s.io/sig-storage/csi-external-health-monitor-controller:v0.11.0
   registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.10.1
   registry.k8s.io/sig-storage/csi-provisioner:v5.0.1
   registry.k8s.io/sig-storage/csi-resizer:v1.11.1
   registry.k8s.io/sig-storage/csi-snapshotter:v8.0.1

* Copying necessary files

 /root/csm-operator/deploy
 /root/csm-operator/operatorconfig
 /root/csm-operator/samples
 /root/csm-operator/scripts
 /root/csm-operator/README.md
 /root/csm-operator/LICENSE

* Compressing release

dell-csm-operator-bundle/
dell-csm-operator-bundle/deploy/
dell-csm-operator-bundle/deploy/operator.yaml
dell-csm-operator-bundle/deploy/crds/
dell-csm-operator-bundle/deploy/crds/storage.dell.com_containerstoragemodules.yaml
dell-csm-operator-bundle/deploy/olm/
dell-csm-operator-bundle/deploy/olm/operator_community.yaml
...
...
dell-csm-operator-bundle/README.md
dell-csm-operator-bundle/LICENSE

* Complete

Offline bundle file is: /root/csm-operator/dell-csm-operator-bundle.tar.gz
```

The resulting offline bundle file can be copied to another machine, if necessary, to gain access to the desired image registry.

#### Unpacking the offline bundle and preparing for installation

This step needs to be performed on a Linux system with access to an image registry that will host container images. If the registry requires `login`, that should be done before proceeding.

To prepare for Operator installation, the following steps need to be performed:
1. Copy the offline bundle file created from the previous step to a system with access to an image registry available to your Kubernetes/OpenShift cluster
2. Expand the bundle file by running `tar xvfz <filename>`
```bash
tar xvfz dell-csm-operator-bundle.tar.gz
```
Here is the output of untar
```
dell-csm-operator-bundle/
dell-csm-operator-bundle/deploy/
dell-csm-operator-bundle/deploy/operator.yaml
dell-csm-operator-bundle/deploy/crds/
dell-csm-operator-bundle/deploy/crds/storage.dell.com_containerstoragemodules.yaml
dell-csm-operator-bundle/deploy/olm/
dell-csm-operator-bundle/deploy/olm/operator_community.yaml
...
...
dell-csm-operator-bundle/README.md
dell-csm-operator-bundle/LICENSE
```
3. Run the `csm-offline-bundle.sh` script and supply the `-p` option as well as the path to the internal registry with the `-r` option
```bash
cd dell-csm-operator-bundle
```
```bash
bash scripts/csm-offline-bundle.sh -p -r localregistry:5000/dell-csm-operator/
```

The script will then perform the following steps:
  - Load the required container images into the local system
  - Tag the images according to the user-supplied registry information
  - Push the newly tagged images to the registry
  - Modify the Operator configuration to refer to the newly tagged/pushed images

Here is the output for preparing the bundle for installation (`localregistry:5000` refers to an image registry accessible to Kubernetes/OpenShift. `dell-csm-operator` refers to the folder created within the registry.):

```
Preparing a offline bundle for installation

* Loading docker images

Loaded image: docker.io/dellemc/csi-powerstore:v2.11.0
Loaded image: docker.io/dellemc/csi-isilon:v2.11.0
...
...
Loaded image: registry.k8s.io/sig-storage/csi-resizer:v1.11.1
Loaded image: registry.k8s.io/sig-storage/csi-snapshotter:v8.0.1

* Tagging and pushing images

   dellemc/csi-isilon:v2.11.0 -> localregistry:5000/dell-csm-operator/csi-isilon:v2.11.0
   dellemc/csi-metadata-retriever:v1.8.0 -> localregistry:5000/dell-csm-operator/csi-metadata-retriever:v1.8.0
   ...
   ...
   registry.k8s.io/sig-storage/csi-resizer:v1.11.1 -> localregistry:5000/dell-csm-operator/csi-resizer:v1.9.2
   registry.k8s.io/sig-storage/csi-snapshotter:v8.0.1 -> localregistry:5000/dell-csm-operator/csi-snapshotter:v6.3.2

* Preparing files within /root/dell-csm-operator-bundle

   changing: dellemc/csi-isilon:v2.11.0 -> localregistry:5000/dell-csm-operator/csi-isilon:v2.11.0
   changing: dellemc/csi-metadata-retriever:v1.8.0 -> localregistry:5000/dell-csm-operator/csi-metadata-retriever:v1.8.0
   ...
   ...
   changing: registry.k8s.io/sig-storage/csi-resizer:v1.11.1 -> localregistry:5000/dell-csm-operator/csi-resizer:v1.9.2
   changing: registry.k8s.io/sig-storage/csi-snapshotter:v8.0.1 -> localregistry:5000/dell-csm-operator/csi-snapshotter:v6.3.2

* Complete
```

#### Perform Operator installation

Now that the required images are available and the Operator configuration updated, you can proceed to install the operator by executing `install.sh` script.
```bash
bash scripts/install.sh
```
>NOTE: Dell CSM Operator would install to the 'dell-csm-operator' namespace by default.

## Uninstall

### Operator uninstallation on a cluster without OLM
To uninstall a CSM operator, run `bash scripts/uninstall.sh`. This will uninstall the operator in `dell-csm-operator` namespace.

{{< imgproc uninstall.jpg Resize "2500x" >}}{{< /imgproc >}}

## Upgrade

### Dell CSM Operator
Dell CSM Operator can be upgraded in 2 ways:

1. Using Operator Lifecycle Manager (OLM)

2. Using script (for non-OLM based installation)

#### Using OLM
The upgrade of the Dell CSM Operator is done via Operator Lifecycle Manager.

The `Update approval` (**`InstallPlan`** in OLM terms) strategy plays a role while upgrading dell-csm-operator on OpenShift. This option can be set during installation of dell-csm-operator on OpenShift via the console and can be either set to `Manual` or `Automatic`.
- If the **`Update approval`** is set to `Automatic`, OpenShift automatically detects whenever the latest version of dell-csm-operator is available in the **`Operator hub`**, and upgrades it to the latest available version.
- If the upgrade policy is set to `Manual`, OpenShift notifies of an available upgrade. This notification can be viewed by the user in the **`Installed Operators`** section of the OpenShift console. Clicking on the hyperlink to `Approve` the installation would trigger the dell-csm-operator upgrade process.

>NOTE: The recommended version of OLM for Upstream Kubernetes is **`v0.25.0`**.

#### Using Installation Script
1. Clone and checkout the required csm-operator version using
```bash
git clone -b v1.6.0 https://github.com/dell/csm-operator.git
```
2. `cd csm-operator`
3. Execute `bash scripts/install.sh --upgrade`  . This command will install the latest version of the operator.

>NOTE: Dell CSM Operator would install to the 'dell-csm-operator' namespace by default.

### Upgrade driver using Dell CSM Operator:
The CSI Drivers installed by the Dell CSM Operator can be updated like any Kubernetes resource.
* Modifying the installation directly via `kubectl edit`
    ```
    $ kubectl get <driver-object> -n <driver-namespace>
    ```
    For example - If the CSI PowerStore driver is installed then run this command to get the object name
    ```
    # Replace driver-namespace with the namespace where the CSI PowerStore driver is installed
    $ kubectl get csm -n <driver-namespace>
    ```
    use the object name in `kubectl edit` command.
    ```
    $ kubectl edit csm <driver-object>/<object-name> -n <driver-namespace>
    ```
    For example - If the object name is powerstore then use the name as powerstore
    ```
    # Replace object-name with the powerstore
    $ kubectl edit csm powerstore -n <driver-namespace>
    ```
    and modify the installation. The usual fields to edit are the version of drivers, sidecars and the environment variables.
The following notes explain some of the general items to take care of.

>NOTE:
1. If you are trying to upgrade the CSI driver from an older version, make sure to modify the _configVersion_ field.
   ```yaml
      driver:
        configVersion: v2.11.0
   ```

### Upgrade Modules using Dell CSM Operator

* Refer [Upgrade Obsevability Module](./modules/observability/#upgrade-observability) to upgrade the Observability Module via Operator

* Refer [Upgrade Authorization Module](./modules/authorization/#upgrade-csm-authorization) to upgrade the Authorization Module via Operator

## Custom Resource Definitions
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

**tlsCertSecret** - Name of the TLS cert secret for use by the driver. If not specified, a secret *-certs must exist in the namespace as driver.

**tolerations** - List of tolerations which should be applied to the driver StatefulSet/Deployment and DaemonSet. It should be set separately in the controller and node sections if you want separate set of tolerations for them.

**nodeSelector** - Used to specify node selectors for the driver StatefulSet/Deployment and DaemonSet.

>NOTE: The `image` field should point to the correct image tag for version of the driver you are installing.
