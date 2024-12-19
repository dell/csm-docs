---
title: "Offline Helm Installation"
linkTitle: "Offline Helm Installation"
no_list: true
description: Offline Helm Installation
weight: 4
--- 

## Workflow

To perform an offline installation of a driver or the Operator, the following steps should be performed:
1. Build an offline bundle
2. Unpacking the offline bundle created in Step 1 and preparing for installation
3. Perform either a Helm installation or Operator installation using the files obtained after unpacking in Step 2 

**NOTE:** It is recommended to use the same build tool for packing and unpacking of images (either docker or podman).

### Building an offline bundle
>NOTE: Login to the `registry.redhat.io` registry using RedHat credentials before you proceed with offline bundle creation.

This needs to be performed on a Linux system with access to the Internet as a git repo will need to be cloned, and container images pulled from public registries.

To build an offline bundle, the following steps are needed:
1. Perform a `git clone` of the desired repository. For a helm-based install, the specific driver repo should be cloned. For an Operator based deployment, the Dell CSM Operator repo should be cloned
2. Run the `csi-offline-bundle.sh` script with an argument of `-c` in order to create an offline bundle
  - For Helm installs, the `csi-offline-bundle.sh` script will be found in the `dell-csi-helm-installer` directory
  - For Operator installs, the `csm-offline-bundle.sh` script will be found in the `scripts` directory

The script will perform the following steps:
  - Determine required images by parsing either the driver Helm charts (if run from a cloned CSI Driver git repository) or the Dell CSM Operator configuration files (if run from a clone of the Dell CSM Operator repository)
  - Perform an image `pull` of each image required
  - Save all required images to a file by running `docker save` or `podman save`
  - Build a `tar.gz` file containing the images as well as files required to installer the driver and/or Operator

The resulting offline bundle file can be copied to another machine, if necessary, to gain access to the desired image registry.

The following is an example of how to build an offline bundle for the Dell CSM Operator:
```bash
git clone -b <version tag> https://github.com/dell/csm-operator.git
```
```bash
cd csm-operator
```
```bash
bash scripts/csm-offline-bundle.sh -c
```

### Unpacking the offline bundle and preparing for installation

This needs to be performed on a Linux system with access to an image registry that will host container images. If the registry requires `login`, that should be done before proceeding.

To prepare for the driver or Operator installation, the following steps need to be performed:
1. Copy the offline bundle file created from the previous step to a system with access to an image registry available to your Kubernetes/OpenShift cluster
2. Expand the bundle file by running `tar xvfz <filename>`
3. Run the `csi-offline-bundle.sh` script and supply the `-p` option as well as the path to the internal registry with the `-r` option
    - For Operator installs, the `csm-offline-bundle.sh` script will be found in the `scripts` directory

The script will then perform the following steps:
  - Load the required container images into the local system
  - Tag the images according to the user-supplied registry information
  - Push the newly tagged images to the registry
  - Modify the Helm charts or Operator configuration to refer to the newly tagged/pushed images


An example of preparing the bundle for installation for the Dell CSM Operator:
```bash
tar xvfz dell-csm-operator-bundle.tar.gz
```
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
```bash
cd dell-csm-operator-bundle
```
```bash
bash scripts/csm-offline-bundle.sh -p -r localregistry:5000/dell-csm-operator/
```


### Perform either a Helm installation or Operator installation

Now that the required images are available and the Helm Charts/Operator configuration updated, you can proceed by following the usual installation procedure as documented either via [Helm](../../../deployment/helm/drivers/installation) or [Operator](../../../deployment/csmoperator/#installation).

*NOTES:* 
1. Offline bundle installation is only supported with manual installs i.e. without using Operator Lifecycle Manager.
2. Installation should be done using the files that are obtained after unpacking the offline bundle (dell-csm-operator-bundle.tar.gz) as the image tags in the manifests are modified to point to the internal registry. 
3. Offline bundle installs operator in `default` namespace via install.sh script. Make sure that the current context in kubeconfig file has the namespace set to `default`.
