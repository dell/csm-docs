---
title: "Operator installation "
linkTitle: "Operator Installation"
weight: 1 
toc_hide: true
Description: >

---  

Before installing the driver, you need to install the operator. You can find the installation instructions here.
<!--
Dell CSM Operator can be installed manually or via Operator Hub.

Once installed you will be able to deploy [drivers](drivers) and [modules](modules) from the Operator.

### OpenShift Installation via Operator Hub
>NOTE: You can update the resource requests and limits when you are deploying operator using Operator Hub

`dell-csm-operator` can be installed via Operator Hub on upstream Kubernetes clusters & Red Hat OpenShift Clusters.

The installation process involves the creation of a `Subscription` object either via the _OperatorHub_ UI or using `kubectl/oc`. While creating the `Subscription` you can set the Approval strategy for the `InstallPlan` for the operator to:
* _Automatic_ - If you want the operator to be automatically installed or upgraded (once an upgrade is available).
* _Manual_ - If you want a cluster administrator to manually review and approve the `InstallPlan` for installation/upgrades.

![OpenShit Operator Hub CSM install](./../operator_hub_install.gif)

### Certified vs Community

Dell CSM Operator is distributed as both `Certified` & `Community` editions.

Both editions have the same codebase and are supported by Dell Technologies, the only differences are:

* The `Certified` version is officially supported by Redhat by partnering with software vendors.
* The `Certified` version is often released couple of days/weeks after the `Community` version.
* The `Certified` version is specific to Openshift and can only be installed on specific Openshift versions where it is certified.
* The `Community` can be installed on any Kubernetes distributions.
-->
### Manual Installation on a cluster without OLM
>NOTE: You can update the resource requests and limits when you are deploying operator using manual installation without OLM

1. Install volume snapshot CRDs. For detailed snapshot setup procedure, [click here](../../snapshots/#volume-snapshot-feature).
2. Clone and checkout the required csm-operator version using
```bash
git clone -b v1.7.0 https://github.com/dell/csm-operator.git
```
3. `cd csm-operator`
4. _(Optional)_ If using a local Docker image, edit the `deploy/operator.yaml` file and set the image name for the CSM Operator Deployment.
5. _(Optional)_ The Dell CSM Operator might need more resources if users have larger environment (>1000 Pods). You can modify the default resource requests and limits in the files `deploy/operator.yaml`, `config/manager/manager.yaml`  and increase the values for cpu and memory. More information on setting the resource requests and limits can be found [here](https://sdk.operatorframework.io/docs/best-practices/managing-resources/). Current default values are set as below:
    ```yaml
        resources:
          limits:
            cpu: 200m
            memory: 512Mi
          requests:
            cpu: 100m
            memory: 192Mi
    ```
6. _(Optional)_ If **CSM Replication** is planned for use and will be deployed using two clusters in an environment where the DNS is not configured, and cluster API endpoints are FQDNs, in order to resolve queries to remote API endpoints, it is necessary to edit the `deploy/operator.yaml` file and add the `hostAliases` field and associated `<FQDN>:<IP>` mappings to the CSM Operator Controller Manager Deployment under `spec.template.spec`. More information on host aliases can be found, [here](https://kubernetes.io/docs/tasks/network/customize-hosts-file-for-pods/).
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
7. Run `bash scripts/install.sh` to install the operator.

>NOTE: Dell CSM Operator will be installed in the `dell-csm-operator` namespace.

>NOTE: If you want to update the resource requests and limits configuration after the operator is installed. Follow the steps below:

     * Uninstall the operator following the steps [here](https://dell.github.io/csm-docs/v3/deployment/csmoperator/#uninstall)

     * Update the resource configuration as mentioned in step 5 and install the operator using the step 7 above

<img src="./../install.JPG"> </img>

8. Run the command to validate the installation.
```bash
kubectl get pods -n dell-csm-operator
```
 If installed successfully, you should be able to see the operator pod in the `dell-csm-operator` namespace.
<img src="./../install_pods.jpg"> </img>


<!--
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
git clone -b v1.7.0 https://github.com/dell/csm-operator.git
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

   dellemc/csi-isilon:v2.12.0
   dellemc/csi-metadata-retriever:v1.9.0
   dellemc/csipowermax-reverseproxy:v2.11.0
   dellemc/csi-powermax:v2.12.0
   dellemc/csi-powerstore:v2.12.0
   dellemc/csi-unity:v2.12.0
   dellemc/csi-vxflexos:v2.12.0
   dellemc/csm-authorization-sidecar:v1.12.0
   dellemc/csm-metrics-powerflex:v1.10.0
   dellemc/csm-metrics-powerscale:v1.7.0
   dellemc/csm-topology:v1.10.0
   dellemc/dell-csi-replicator:v1.10.0
   dellemc/dell-replication-controller:v1.10.0
   dellemc/sdc:4.5.2.1
   docker.io/dellemc/dell-csm-operator:v1.7.0
   gcr.io/kubebuilder/kube-rbac-proxy:v0.8.0
   nginxinc/nginx-unprivileged:1.20
   otel/opentelemetry-collector:0.42.0
   registry.k8s.io/sig-storage/csi-attacher:v4.7.0
   registry.k8s.io/sig-storage/csi-external-health-monitor-controller:v0.13.0
   registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.12.0
   registry.k8s.io/sig-storage/csi-provisioner:v5.1.0
   registry.k8s.io/sig-storage/csi-resizer:v1.12.0
   registry.k8s.io/sig-storage/csi-snapshotter:v8.1.0

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

Loaded image: docker.io/dellemc/csi-powerstore:v2.12.0
Loaded image: docker.io/dellemc/csi-isilon:v2.12.0
...
...
Loaded image: registry.k8s.io/sig-storage/csi-resizer:v1.12.0
Loaded image: registry.k8s.io/sig-storage/csi-snapshotter:v8.1.0

* Tagging and pushing images

   dellemc/csi-isilon:v2.12.0 -> localregistry:5000/dell-csm-operator/csi-isilon:v2.12.0
   dellemc/csi-metadata-retriever:v1.9.0 -> localregistry:5000/dell-csm-operator/csi-metadata-retriever:v1.9.0
   ...
   ...
   registry.k8s.io/sig-storage/csi-resizer:v1.12.0 -> localregistry:5000/dell-csm-operator/csi-resizer:v1.12.0
   registry.k8s.io/sig-storage/csi-snapshotter:v8.1.0 -> localregistry:5000/dell-csm-operator/csi-snapshotter:v8.1.0

* Preparing files within /root/dell-csm-operator-bundle

   changing: dellemc/csi-isilon:v2.12.0 -> localregistry:5000/dell-csm-operator/csi-isilon:v2.12.0
   changing: dellemc/csi-metadata-retriever:v1.9.0 -> localregistry:5000/dell-csm-operator/csi-metadata-retriever:v1.9.0
   ...
   ...
   changing: registry.k8s.io/sig-storage/csi-resizer:v1.12.0 -> localregistry:5000/dell-csm-operator/csi-resizer:v1.12.0
   changing: registry.k8s.io/sig-storage/csi-snapshotter:v8.1.0 -> localregistry:5000/dell-csm-operator/csi-snapshotter:v8.1.0

* Complete
```

#### Perform Operator installation

Now that the required images are available and the Operator configuration updated, you can proceed to install the operator by executing `install.sh` script.
```bash
bash scripts/install.sh
```
>NOTE: Dell CSM Operator would install to the 'dell-csm-operator' namespace by default.
--> 