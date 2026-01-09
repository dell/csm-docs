---
title: "Offline"
linkTitle: "Offline"
no_list: true
description: Offline Installation
weight: 4
---

The `cosi-offline-bundle.sh` script can be used to create a package for the offline installation of Dell COSI storage providers for deployment via Helm.  

## Dependencies

* Multiple Linux systems may be needed.
  * One system with Internet access to create the bundle:Clone a GitHub repository.
  * Run a script using Docker or Podman to pull and save container images.
  * One system with access to an image registry to : Run a script using Docker or Podman to restore and push images to the registry.
* RedHat credentials to pull `openshift4/ose-kube-rbac-proxy-rhel9` image from `registry.redhat.io` (no unauthenticated access).

If one system has both Internet access and registry access, it can be used for both steps.

## Dependencies and Usage

Preparing an offline bundle requires the following utilities: 

<div class="tdleft">

| **Dependency**            | **Usage** |
| ------------------------- | ----- |
| **`docker` or `podman`**  | Used to pull images from public registries, tag them, and push to a private registry.   |
|                           | Required on both the system building the offline bundle and the system preparing for installation.  |
|                           |Tested versions: docker 19.03+ and podman 1.6.4+.
| **`git`**                 | Used to manually clone repositories to create an offline bundle. 
|                           | Needed only on the system preparing the offline bundle. 
|                           | Tested versions: git 1.8+ (any version should work).

</div>

<br>
{{< accordion id="One" title="Operator" markdown="true" >}} 
{{<include  file="content/docs/getting-started/installation/offline/operator.md" suffix="1">}}

{{< /accordion >}}
<br> 
{{< accordion id="Two" title="Helm" markdown="true" >}} 

## Workflow

To perform an offline installation of the COSI driver with helm, the following steps should be performed:
1. Build an offline bundle
2. Unpacking an offline bundle and preparing for installation
3. Perform a Helm installation

### Building an offline bundle

This needs to be performed on a linux system with access to the internet as a git repo will need to be cloned, and container images pulled from public registries.

To build an offline bundle, the following steps are needed:
1. Perform a `git clone -b <version tag> https://github.com/dell/cosi.git`.
2. Run the offline bundle script with an argument of `-c` in order to create an offline bundle
  - For Helm installs, the `cosi-offline-bundle.sh` script will be found in the `dell-cosi-helm-installer` directory

The script will perform the following steps:
  - Determine required images by parsing the driver Helm charts
  - Perform an image `pull` of each image required
  - Save all required images to a file by running `docker save` or `podman save`
  - Build a `tar.gz` file containing the images as well as files required to instal the driver

The resulting offline bundle file can be copied to another machine, if necessary, to gain access to the desired image registry.

### Unpacking an offline bundle and preparing for installation

This needs to be performed on a linux system with access to an image registry that will host container images. If the registry requires `login`, that should be done before proceeding.

To prepare for driver installation, the following steps need to be performed:
1. Copy the offline bundle file to a system with access to an image registry available to your Kubernetes/OpenShift cluster
2. Expand the bundle file by running `tar xvfz <filename>`
3. Run the `cosi-offline-bundle.sh` script and supply the `-p` option as well as the path to the internal registry with the `-r` option

The script will then perform the following steps:
  - Load the required container images into the local system
  - Tag the images according to the user supplied registry information
  - Push the newly tagged images to the registry
  - Modify the Helm charts configuration to refer to the newly tagged/pushed images

Follow Installation Procedure: Proceed with the usual installation steps as documented for [Helm](../../../helm/).

{{< /accordion >}}