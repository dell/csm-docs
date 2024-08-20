---
title: Offline Installation of Dell CSI Storage Providers
linktitle: Offline Installer
description: Offline Installation of Dell CSI Storage Providers
---

The `csi-offline-bundle.sh` script can be used to create a package usable for offline installation of the Dell CSI Storage Providers, via either Helm or the Dell CSM Operator. 

This includes the following drivers:
* [PowerFlex](https://github.com/dell/csi-vxflexos)
* [PowerMax](https://github.com/dell/csi-powermax)
* [PowerScale](https://github.com/dell/csi-powerscale)
* [PowerStore](https://github.com/dell/csi-powerstore)
* [Unity XT](https://github.com/dell/csi-unity)

As well as the Dell CSM Operator.
* [Dell CSM Operator](https://github.com/dell/csm-operator)
   - Directions for offline installation can be found [here](../../../deployment/csmoperator/#building-an-offline-bundle).

## Dependencies

Multiple Linux-based systems may be required to create and process an offline bundle for use.
* One Linux-based system, with Internet access, will be used to create the bundle. This involved the user cloning a git repository hosted on github.com and then invoking a script that utilizes `docker` or `podman` to pull and save container images to file.
* One Linux-based system, with access to an image registry, to invoke a script that uses `docker` or `podman` to restore container images from file and push them to a registry

If one Linux system has both Internet access and access to an internal registry, that system can be used for both steps.

Preparing an offline bundle requires the following utilities:

| Dependency            | Usage |
| --------------------- | ----- |
| `docker` or `podman`  | `docker` or `podman` will be used to pull images from public image registries, tag them, and push them to a private registry.  |
|                       | One of these will be required on both the system building the offline bundle as well as the system preparing for installation. |
|                       | Tested version(s) are `docker` 19.03+ and `podman` 1.6.4+
| `git`                 | `git` will be used to manually clone one of the above repositories in order to create an offline bundle.
|                       | This is only needed on the system preparing the offline bundle.
|                       | Tested version(s) are `git` 1.8+ but any version should work.

## Workflow

To perform an offline installation of a driver or the Operator, the following steps should be performed:
1. Build an offline bundle
2. Unpacking the offline bundle created in Step 1 and preparing for installation
3. Perform either a Helm installation or Operator installation using the files obtained after unpacking in Step 2 

**NOTE:** It is recommended to use the same build tool for packing and unpacking of images (either docker or podman).

### Building an offline bundle

This needs to be performed on a Linux system with access to the Internet as a git repo will need to be cloned, and container images pulled from public registries.

To build an offline bundle for Helm installs, the following steps are needed:
1. Perform a `git clone` of the specific driver repo.
2. Run the `csi-offline-bundle.sh` script with an argument of `-c` in order to create an offline bundle
  - For Helm installs, the `csi-offline-bundle.sh` script will be found in the `dell-csi-helm-installer` directory

To build an offline bundle for Operator installs, the following steps are needed:
1. Perform a `git clone` of the Dell CSM Operator repo.
2. Run the `csi-offline-bundle.sh` script with an argument of `-c` in order to create an offline bundle
  - For Operator installs, the `csm-offline-bundle.sh` script will be found in the `scripts` directory

The script will perform the following steps:
  - Determine required images by parsing either the driver Helm charts (if run from a cloned CSI Driver git repository) or the Dell CSM Operator configuration files (if run from a clone of the Dell CSM Operator repository)
  - Perform an image `pull` of each image required
  - Save all required images to a file by running `docker save` or `podman save`
  - Build a `tar.gz` file containing the images as well as files required to installer the driver and/or Operator

The resulting offline bundle file can be copied to another machine, if necessary, to gain access to the desired image registry.

The following is an example of how to build an offline bundle for Helm install of a specific driver:
```bash
git clone -b <version tag> https://github.com/dell/csi-powerscale.git
```
```bash
cd csi-powerscale
```
```bash
bash dell-csi-helm-installer/csi-offline-bundle.sh -c
```

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


An example of preparing the bundle for installation for Helm install of a specific driver:
```bash
tar xvfz csi-isilon-bundle-2.11.0.tar.gz
```
```
csi-isilon-bundle-2.11.0/
csi-isilon-bundle-2.11.0/helm-charts/
csi-isilon-bundle-2.11.0/helm-charts/charts/
csi-isilon-bundle-2.11.0/helm-charts/charts/csi-isilon/
csi-isilon-bundle-2.11.0/helm-charts/charts/csi-isilon/Chart.yaml
csi-isilon-bundle-2.11.0/helm-charts/charts/csi-isilon/values.yaml
csi-isilon-bundle-2.11.0/helm-charts/charts/csi-isilon/templates/
csi-isilon-bundle-2.11.0/helm-charts/charts/csi-isilon/templates/sec-rolebinding.yaml
csi-isilon-bundle-2.11.0/helm-charts/charts/csi-isilon/templates/node.yaml
csi-isilon-bundle-2.11.0/helm-charts/charts/csi-isilon/templates/_helpers.tpl
csi-isilon-bundle-2.11.0/helm-charts/charts/csi-isilon/templates/validation.yaml
...
...
csi-isilon-bundle-2.11.0/README.md
csi-isilon-bundle-2.11.0/LICENSE
```
```bash
cd csi-isilon-bundle-2.11.0
```
```bash
bash dell-csi-helm-installer/csi-offline-bundle.sh -p -r localregistry:5000/dell/csi/
```

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
