---
title: Offline Installation of Dell CSI Storage Providers
linktitle: Offline Installer
description: Offline Installation of Dell CSI Storage Providers
---

The `csi-offline-bundle.sh` script can be used to create a package usable for offline installation of the Dell CSI Storage Providers, via either Helm 
or the Dell CSI Operator. 

This includes the following drivers:
* [PowerFlex](https://github.com/dell/csi-vxflexos)
* [PowerMax](https://github.com/dell/csi-powermax)
* [PowerScale](https://github.com/dell/csi-powerscale)
* [PowerStore](https://github.com/dell/csi-powerstore)
* [Unity XT](https://github.com/dell/csi-unity)

As well as the Dell CSI Operator
* [Dell CSI Operator](https://github.com/dell/dell-csi-operator)

## Dependencies

Multiple Linux-based systems may be required to create and process an offline bundle for use.
* One Linux-based system, with internet access, will be used to create the bundle. This involved the user cloning a git repository hosted on github.com and then invoking a script that utilizes `docker` or `podman` to pull and save container images to file.
* One Linux-based system, with access to an image registry, to invoke a script that uses `docker` or `podman` to restore container images from file and push them to a registry

If one Linux system has both internet access and access to an internal registry, that system can be used for both steps.

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

This needs to be performed on a Linux system with access to the internet as a git repo will need to be cloned, and container images pulled from public registries.

To build an offline bundle, the following steps are needed:
1. Perform a `git clone` of the desired repository. For a helm-based install, the specific driver repo should be cloned. For an Operator based deployment, the Dell CSI Operator repo should be cloned
2. Run the `csi-offline-bundle.sh` script with an argument of `-c` in order to create an offline bundle
  - For Helm installs, the `csi-offline-bundle.sh` script will be found in the `dell-csi-helm-installer` directory
  - For Operator installs, the `csi-offline-bundle.sh` script will be found in the `scripts` directory

The script will perform the following steps:
  - Determine required images by parsing either the driver Helm charts (if run from a cloned CSI Driver git repository) or the Dell CSI Operator configuration files (if run from a clone of the Dell CSI Operator repository)
  - Perform an image `pull` of each image required
  - Save all required images to a file by running `docker save` or `podman save`
  - Build a `tar.gz` file containing the images as well as files required to installer the driver and/or Operator

The resulting offline bundle file can be copied to another machine, if necessary, to gain access to the desired image registry.

For example, here is the output of a request to build an offline bundle for the Dell CSI Operator:
```
git clone -b v1.10.0 https://github.com/dell/dell-csi-operator.git
```
```
cd dell-csi-operator/scripts
```
```
[root@user scripts]# ./csi-offline-bundle.sh -c

*
* Pulling and saving container images

   dellemc/csi-isilon:v2.3.0
   dellemc/csi-isilon:v2.4.0
   dellemc/csi-isilon:v2.5.0
   dellemc/csipowermax-reverseproxy:v2.4.0
   dellemc/csi-powermax:v2.3.1
   dellemc/csi-powermax:v2.4.0
   dellemc/csi-powermax:v2.5.0
   dellemc/csi-powerstore:v2.3.0
   dellemc/csi-powerstore:v2.4.0
   dellemc/csi-powerstore:v2.5.0
   dellemc/csi-unity:v2.3.0
   dellemc/csi-unity:v2.4.0
   dellemc/csi-unity:v2.5.0
   dellemc/csi-vxflexos:v2.3.0
   dellemc/csi-vxflexos:v2.4.0
   dellemc/csi-vxflexos:v2.5.0
   dellemc/dell-csi-operator:v1.10.0
   dellemc/sdc:3.5.1.1-1
   dellemc/sdc:3.6
   dellemc/sdc:3.6.0.6
   dellemc/sdc:3.6.1
   docker.io/busybox:1.32.0
   ...
   ...

*
* Copying necessary files

   /root/dell-csi-operator/driverconfig
   /root/dell-csi-operator/deploy
   /root/dell-csi-operator/samples
   /root/dell-csi-operator/scripts
   /root/dell-csi-operator/OLM.md
   /root/dell-csi-operator/README.md
   /root/dell-csi-operator/LICENSE

*
* Compressing release

   dell-csi-operator-bundle/
   dell-csi-operator-bundle/driverconfig/
   dell-csi-operator-bundle/driverconfig/config.yaml
   dell-csi-operator-bundle/driverconfig/isilon_v230_v121.json
   dell-csi-operator-bundle/driverconfig/isilon_v230_v122.json
   dell-csi-operator-bundle/driverconfig/isilon_v230_v123.json
   dell-csi-operator-bundle/driverconfig/isilon_v230_v124.json
   dell-csi-operator-bundle/driverconfig/isilon_v240_v121.json
   dell-csi-operator-bundle/driverconfig/isilon_v240_v122.json
   dell-csi-operator-bundle/driverconfig/isilon_v240_v123.json
   dell-csi-operator-bundle/driverconfig/isilon_v240_v124.json
   dell-csi-operator-bundle/driverconfig/isilon_v250_v123.json
   dell-csi-operator-bundle/driverconfig/isilon_v250_v124.json
   dell-csi-operator-bundle/driverconfig/isilon_v250_v125.json
   dell-csi-operator-bundle/driverconfig/powermax_v230_v121.json
   ...
   ...

*
* Complete

Offline bundle file is: /root/dell-csi-operator/dell-csi-operator-bundle.tar.gz

```

### Unpacking the offline bundle and preparing for installation

This needs to be performed on a Linux system with access to an image registry that will host container images. If the registry requires `login`, that should be done before proceeding.

To prepare for the driver or Operator installation, the following steps need to be performed:
1. Copy the offline bundle file created from the previous step to a system with access to an image registry available to your Kubernetes/OpenShift cluster
2. Expand the bundle file by running `tar xvfz <filename>`
3. Run the `csi-offline-bundle.sh` script and supply the `-p` option as well as the path to the internal registry with the `-r` option

The script will then perform the following steps:
  - Load the required container images into the local system
  - Tag the images according to the user-supplied registry information
  - Push the newly tagged images to the registry
  - Modify the Helm charts or Operator configuration to refer to the newly tagged/pushed images


An example of preparing the bundle for installation (192.168.75.40:5000 refers to an image registry accessible to Kubernetes/OpenShift):
```
tar xvfz dell-csi-operator-bundle.tar.gz
dell-csi-operator-bundle/
dell-csi-operator-bundle/samples/
...
<listing of files included in bundle>
...
dell-csi-operator-bundle/LICENSE
dell-csi-operator-bundle/README.md
```
```
cd dell-csi-operator-bundle
```
```
[root@user scripts]# ./csi-offline-bundle.sh -p -r localregistry:5000/csi-operator
Preparing a offline bundle for installation

*
* Loading docker images

   5b1fa8e3e100: Loading layer [==================================================>]  3.697MB/3.697MB
   e20ed4c73206: Loading layer [==================================================>]  17.22MB/17.22MB
   Loaded image: k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.6.0
   d72a74c56330: Loading layer [==================================================>]  3.031MB/3.031MB
   f2d2ab12e2a7: Loading layer [==================================================>]  48.08MB/48.08MB
   Loaded image: k8s.gcr.io/sig-storage/csi-snapshotter-v6.1.0
   417cb9b79ade: Loading layer [==================================================>]  3.062MB/3.062MB
   61fefb35ccee: Loading layer [==================================================>]  16.88MB/16.88MB
   Loaded image: k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.5.1
   7a5b9c0b4b14: Loading layer [==================================================>]  3.031MB/3.031MB
   1555ad6e2d44: Loading layer [==================================================>]  49.86MB/49.86MB
   Loaded image: k8s.gcr.io/sig-storage/csi-attacher-v4.0.0
   2de1422d5d2d: Loading layer [==================================================>]  54.56MB/54.56MB
   Loaded image: k8s.gcr.io/sig-storage/csi-resizer-v1.6.0
   25a1c1010608: Loading layer [==================================================>]  54.54MB/54.54MB
   Loaded image: k8s.gcr.io/sig-storage/csi-snapshotter-v6.0.1
   07363fa84210: Loading layer [==================================================>]  3.062MB/3.062MB
   5227e51ea570: Loading layer [==================================================>]  54.92MB/54.92MB
   Loaded image: k8s.gcr.io/sig-storage/csi-attacher-v3.5.0
   cfb5cbeabdb2: Loading layer [==================================================>]  55.38MB/55.38MB
   Loaded image: k8s.gcr.io/sig-storage/csi-resizer-v1.5.0
   ...
   ...

*
* Tagging and pushing images

   dellemc/dell-csi-operator:v1.10.0 -> localregistry:5000/csi-operator/dell-csi-operator:v1.10.0
   dellemc/csi-isilon:v2.3.0 -> localregistry:5000/csi-operator/csi-isilon:v2.3.0
   dellemc/csi-isilon:v2.4.0 -> localregistry:5000/csi-operator/csi-isilon:v2.4.0
   dellemc/csi-isilon:v2.5.0 -> localregistry:5000/csi-operator/csi-isilon:v2.5.0
   dellemc/csipowermax-reverseproxy:v2.4.0 -> localregistry:5000/csi-operator/csipowermax-reverseproxy:v2.4.0
   dellemc/csi-powermax:v2.3.1 -> localregistry:5000/csi-operator/csi-powermax:v2.3.1
   dellemc/csi-powermax:v2.4.0 -> localregistry:5000/csi-operator/csi-powermax:v2.4.0
   dellemc/csi-powermax:v2.5.0 -> localregistry:5000/csi-operator/csi-powermax:v2.5.0
   dellemc/csi-powerstore:v2.3.0 -> localregistry:5000/csi-operator/csi-powerstore:v2.3.0
   dellemc/csi-powerstore:v2.4.0 -> localregistry:5000/csi-operator/csi-powerstore:v2.4.0
   dellemc/csi-powerstore:v2.5.0 -> localregistry:5000/csi-operator/csi-powerstore:v2.5.0
   dellemc/csi-unity:v2.3.0 -> localregistry:5000/csi-operator/csi-unity:v2.3.0
   dellemc/csi-unity:v2.4.0 -> localregistry:5000/csi-operator/csi-unity:v2.4.0
   dellemc/csi-unity:v2.5.0 -> localregistry:5000/csi-operator/csi-unity:v2.5.0
   dellemc/csi-vxflexos:v2.3.0 -> localregistry:5000/csi-operator/csi-vxflexos:v2.3.0
   dellemc/csi-vxflexos:v2.4.0 -> localregistry:5000/csi-operator/csi-vxflexos:v2.4.0
   dellemc/csi-vxflexos:v2.5.0 -> localregistry:5000/csi-operator/csi-vxflexos:v2.5.0
   dellemc/sdc:3.5.1.1-1 -> localregistry:5000/csi-operator/sdc:3.5.1.1-1
   dellemc/sdc:3.6 -> localregistry:5000/csi-operator/sdc:3.6
   dellemc/sdc:3.6.0.6 -> localregistry:5000/csi-operator/sdc:3.6.0.6
   dellemc/sdc:3.6.1 -> localregistry:5000/csi-operator/sdc:3.6.1
   docker.io/busybox:1.32.0 -> localregistry:5000/csi-operator/busybox:1.32.0
   ...
   ...

*
* Preparing operator files within /root/dell-csi-operator-bundle

   changing: dellemc/dell-csi-operator:v1.10.0 -> localregistry:5000/csi-operator/dell-csi-operator:v1.10.0
   changing: dellemc/csi-isilon:v2.3.0 -> localregistry:5000/csi-operator/csi-isilon:v2.3.0
   changing: dellemc/csi-isilon:v2.4.0 -> localregistry:5000/csi-operator/csi-isilon:v2.4.0
   changing: dellemc/csi-isilon:v2.5.0 -> localregistry:5000/csi-operator/csi-isilon:v2.5.0
   changing: dellemc/csipowermax-reverseproxy:v2.4.0 -> localregistry:5000/csi-operator/csipowermax-reverseproxy:v2.4.0
   changing: dellemc/csi-powermax:v2.3.1 -> localregistry:5000/csi-operator/csi-powermax:v2.3.1
   changing: dellemc/csi-powermax:v2.4.0 -> localregistry:5000/csi-operator/csi-powermax:v2.4.0
   changing: dellemc/csi-powermax:v2.5.0 -> localregistry:5000/csi-operator/csi-powermax:v2.5.0
   changing: dellemc/csi-powerstore:v2.3.0 -> localregistry:5000/csi-operator/csi-powerstore:v2.3.0
   changing: dellemc/csi-powerstore:v2.4.0 -> localregistry:5000/csi-operator/csi-powerstore:v2.4.0
   changing: dellemc/csi-powerstore:v2.5.0 -> localregistry:5000/csi-operator/csi-powerstore:v2.5.0
   changing: dellemc/csi-unity:v2.3.0 -> localregistry:5000/csi-operator/csi-unity:v2.3.0
   changing: dellemc/csi-unity:v2.4.0 -> localregistry:5000/csi-operator/csi-unity:v2.4.0
   changing: dellemc/csi-unity:v2.5.0 -> localregistry:5000/csi-operator/csi-unity:v2.5.0
   changing: dellemc/csi-vxflexos:v2.3.0 -> localregistry:5000/csi-operator/csi-vxflexos:v2.3.0
   changing: dellemc/csi-vxflexos:v2.4.0 -> localregistry:5000/csi-operator/csi-vxflexos:v2.4.0
   changing: dellemc/csi-vxflexos:v2.5.0 -> localregistry:5000/csi-operator/csi-vxflexos:v2.5.0
   changing: dellemc/sdc:3.5.1.1-1 -> localregistry:5000/csi-operator/sdc:3.5.1.1-1
   changing: dellemc/sdc:3.6 -> localregistry:5000/csi-operator/sdc:3.6
   changing: dellemc/sdc:3.6.0.6 -> localregistry:5000/csi-operator/sdc:3.6.0.6
   changing: dellemc/sdc:3.6.1 -> localregistry:5000/csi-operator/sdc:3.6.1
   changing: docker.io/busybox:1.32.0 -> localregistry:5000/csi-operator/busybox:1.32.0
   ...
   ...
 
*
* Complete
```

### Perform either a Helm installation or Operator installation

Now that the required images are available and the Helm Charts/Operator configuration updated, you can proceed by following the usual installation procedure as documented either via [Helm](../helm) or [Operator](../operator/#manual-installation).

*NOTES:* 
1. Offline bundle installation is only supported with manual installs i.e. without using Operator Lifecycle Manager.
2. Installation should be done using the files that are obtained after unpacking the offline bundle (dell-csi-operator-bundle.tar.gz) as the image tags in the manifests are modified to point to the internal registry. 
3. Offline bundle installs operator in `default` namespace via install.sh script. Make sure that the current context in kubeconfig file has the namespace set to `default`.