---
title: "Offline Operator Installation"
linkTitle: "Offline Operator Installation"
no_list: true
description: Offline Operator Installation
weight: 4
--- 

#### Workflow

To perform an offline installation, the following steps should be performed:

1. Build an offline bundle
2. Unpack the offline bundle created in Step 1 and prepare for installation
3. Perform operator installation using the files obtained after unpacking in Step 2
4. Perform driver installation using the files obtained after unpacking in Step 2

>NOTE: It is recommended to use the same build tool for packing and unpacking of images (either docker or podman).

#### Building an offline bundle
>NOTE: Login to the `registry.redhat.io` registry using RedHat credentials before you proceed with offline bundle creation.

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

   quay.io/dell/container-storage-modules/csi-isilon:v2.12.0
   quay.io/dell/container-storage-modules/csi-metadata-retriever:v1.9.0
   quay.io/dell/container-storage-modules/csipowermax-reverseproxy:v2.11.0
   quay.io/dell/container-storage-modules/csi-powermax:v2.12.0
   quay.io/dell/container-storage-modules/csi-powerstore:v2.12.0
   quay.io/dell/container-storage-modules/csi-unity:v2.12.0
   quay.io/dell/container-storage-modules/csi-vxflexos:v2.12.0
   quay.io/dell/container-storage-modules/csm-authorization-sidecar:v1.12.0
   quay.io/dell/container-storage-modules/csm-metrics-powerflex:v1.10.0
   quay.io/dell/container-storage-modules/csm-metrics-powerscale:v1.7.0
   quay.io/dell/container-storage-modules/csm-topology:v1.10.0
   quay.io/dell/container-storage-modules/dell-csi-replicator:v1.10.0
   quay.io/dell/container-storage-modules/dell-replication-controller:v1.10.0
   dellemc/sdc:4.5.2.1
   quay.io/dell/container-storage-modules/dell-csm-operator:v1.7.0
   registry.redhat.io/openshift4/ose-kube-rbac-proxy-rhel9:v4.16.0-202409051837.p0.g8ea2c99.assembly.stream.el9
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

* Loading quay.io images

Loaded image: quay.io/dell/container-storage-modules/csi-powerstore:v2.12.0
Loaded image: quay.io/dell/container-storage-modules/csi-isilon:v2.12.0
...
...
Loaded image: registry.k8s.io/sig-storage/csi-resizer:v1.12.0
Loaded image: registry.k8s.io/sig-storage/csi-snapshotter:v8.1.0

* Tagging and pushing images

   quay.io/dell/container-storage-modules/csi-isilon:v2.12.0 -> localregistry:5000/dell-csm-operator/csi-isilon:v2.12.0
   quay.io/dell/container-storage-modules/csi-metadata-retriever:v1.9.0 -> localregistry:5000/dell-csm-operator/csi-metadata-retriever:v1.9.0
   ...
   ...
   registry.k8s.io/sig-storage/csi-resizer:v1.12.0 -> localregistry:5000/dell-csm-operator/csi-resizer:v1.12.0
   registry.k8s.io/sig-storage/csi-snapshotter:v8.1.0 -> localregistry:5000/dell-csm-operator/csi-snapshotter:v8.1.0

* Preparing files within /root/dell-csm-operator-bundle

   changing: quay.io/dell/container-storage-modules/csi-isilon:v2.12.0 -> localregistry:5000/dell-csm-operator/csi-isilon:v2.12.0
   changing: quay.io/dell/container-storage-modules/csi-metadata-retriever:v1.9.0 -> localregistry:5000/dell-csm-operator/csi-metadata-retriever:v1.9.0
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
