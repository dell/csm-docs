---
title: Offline Installation of Dell EMC CSI Storage Providers
linktitle: Offline Installer
description: Offline Installation of Dell EMC CSI Storage Providers
---

The `csi-offline-bundle.sh` script can be used to create a package usable for offline installation of the Dell EMC CSI Storage Providers, via either Helm 
or the Dell CSI Operator. 

This includes the following drivers:
* [PowerFlex](https://github.com/dell/csi-vxflexos)
* [PowerMax](https://github.com/dell/csi-powermax)
* [PowerScale](https://github.com/dell/csi-powerscale)
* [PowerStore](https://github.com/dell/csi-powerstore)
* [Unity](https://github.com/dell/csi-unity)

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
[user@anothersystem /home/user]# git clone https://github.com/dell/dell-csi-operator.git
```
```
[user@anothersystem /home/user]# cd dell-csi-operator
```
```
[user@system /home/user/dell-csi-operator]# scripts/csi-offline-bundle.sh -c
*
* Building image manifest file

*
* Pulling container images

   dellemc/csi-isilon:v1.4.0.000R
   dellemc/csi-isilon:v1.5.0
   dellemc/csi-isilon:v1.6.0
   dellemc/csipowermax-reverseproxy:v1.3.0
   dellemc/csi-powermax:v1.5.0.000R
   dellemc/csi-powermax:v1.6.0
   dellemc/csi-powermax:v1.7.0
   dellemc/csi-powerstore:v1.2.0.000R
   dellemc/csi-powerstore:v1.3.0
   dellemc/csi-powerstore:v1.4.0
   dellemc/csi-unity:v1.4.0.000R
   dellemc/csi-unity:v1.5.0
   dellemc/csi-unity:v1.6.0
   dellemc/csi-vxflexos:v1.3.0.000R
   dellemc/csi-vxflexos:v1.4.0
   dellemc/csi-vxflexos:v1.5.0
   dellemc/dell-csi-operator:v1.4.0
   dellemc/sdc:3.5.1.1
   dellemc/sdc:3.5.1.1-1
   docker.io/busybox:1.32.0
   k8s.gcr.io/sig-storage/csi-attacher:v3.0.0
   k8s.gcr.io/sig-storage/csi-attacher:v3.1.0
   k8s.gcr.io/sig-storage/csi-attacher:v3.2.1
   k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.0.1
   k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.1.0
   k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.2.0
   k8s.gcr.io/sig-storage/csi-provisioner:v2.0.2
   k8s.gcr.io/sig-storage/csi-provisioner:v2.1.0
   k8s.gcr.io/sig-storage/csi-provisioner:v2.2.1
   k8s.gcr.io/sig-storage/csi-resizer:v1.2.0
   k8s.gcr.io/sig-storage/csi-snapshotter:v3.0.2
   k8s.gcr.io/sig-storage/csi-snapshotter:v3.0.3
   k8s.gcr.io/sig-storage/csi-snapshotter:v4.0.0
   k8s.gcr.io/sig-storage/csi-snapshotter:v4.1.0
   quay.io/k8scsi/csi-resizer:v1.0.0
   quay.io/k8scsi/csi-resizer:v1.1.0

*
* Saving images

*
* Copying necessary files

 /dell/git/dell-csi-operator/config
 /dell/git/dell-csi-operator/deploy
 /dell/git/dell-csi-operator/samples
 /dell/git/dell-csi-operator/scripts
 /dell/git/dell-csi-operator/README.md
 /dell/git/dell-csi-operator/LICENSE

*
* Compressing release

dell-csi-operator-bundle/
dell-csi-operator-bundle/samples/
...
<listing of files included in bundle>
...
dell-csi-operator-bundle/LICENSE
dell-csi-operator-bundle/README.md

*
* Complete

Offline bundle file is: /dell/git/dell-csi-operator/dell-csi-operator-bundle.tar.gz
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
[user@anothersystem /tmp]# tar xvfz dell-csi-operator-bundle.tar.gz
dell-csi-operator-bundle/
dell-csi-operator-bundle/samples/
...
<listing of files included in bundle>
...
dell-csi-operator-bundle/LICENSE
dell-csi-operator-bundle/README.md
```
```
[user@anothersystem /tmp]# cd dell-csi-operator-bundle
```
```
[user@anothersystem /tmp/dell-csi-operator-bundle]# scripts/csi-offline-bundle.sh -p -r 192.168.75.40:5000/operator
Preparing an offline bundle for installation

*
* Loading docker images


*
* Tagging and pushing images

   dellemc/csi-isilon:v1.4.0.000R -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-isilon:v1.4.0.000R
   dellemc/csi-isilon:v1.5.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-isilon:v1.5.0
   dellemc/csi-isilon:v1.6.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-isilon:v1.6.0
   dellemc/csipowermax-reverseproxy:v1.3.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csipowermax-reverseproxy:v1.3.0
   dellemc/csi-powermax:v1.5.0.000R -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-powermax:v1.5.0.000R
   dellemc/csi-powermax:v1.6.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-powermax:v1.6.0
   dellemc/csi-powermax:v1.7.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-powermax:v1.7.0
   dellemc/csi-powerstore:v1.2.0.000R -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-powerstore:v1.2.0.000R
   dellemc/csi-powerstore:v1.3.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-powerstore:v1.3.0
   dellemc/csi-powerstore:v1.4.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-powerstore:v1.4.0
   dellemc/csi-unity:v1.4.0.000R -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-unity:v1.4.0.000R
   dellemc/csi-unity:v1.5.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-unity:v1.5.0
   dellemc/csi-unity:v1.6.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-unity:v1.6.0
   dellemc/csi-vxflexos:v1.3.0.000R -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-vxflexos:v1.3.0.000R
   dellemc/csi-vxflexos:v1.4.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-vxflexos:v1.4.0
   dellemc/csi-vxflexos:v1.5.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-vxflexos:v1.5.0
   dellemc/dell-csi-operator:v1.4.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/dell-csi-operator:v1.4.0
   dellemc/sdc:3.5.1.1 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/sdc:3.5.1.1
   dellemc/sdc:3.5.1.1-1 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/sdc:3.5.1.1-1
   docker.io/busybox:1.32.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/busybox:1.32.0
   k8s.gcr.io/sig-storage/csi-attacher:v3.0.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-attacher:v3.0.0
   k8s.gcr.io/sig-storage/csi-attacher:v3.1.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-attacher:v3.1.0
   k8s.gcr.io/sig-storage/csi-attacher:v3.2.1 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-attacher:v3.2.1
   k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.0.1 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-node-driver-registrar:v2.0.1
   k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.1.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-node-driver-registrar:v2.1.0
   k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.2.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-node-driver-registrar:v2.2.0
   k8s.gcr.io/sig-storage/csi-provisioner:v2.0.2 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-provisioner:v2.0.2
   k8s.gcr.io/sig-storage/csi-provisioner:v2.1.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-provisioner:v2.1.0
   k8s.gcr.io/sig-storage/csi-provisioner:v2.2.1 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-provisioner:v2.2.1
   k8s.gcr.io/sig-storage/csi-resizer:v1.2.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-resizer:v1.2.0
   k8s.gcr.io/sig-storage/csi-snapshotter:v3.0.2 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-snapshotter:v3.0.2
   k8s.gcr.io/sig-storage/csi-snapshotter:v3.0.3 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-snapshotter:v3.0.3
   k8s.gcr.io/sig-storage/csi-snapshotter:v4.0.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-snapshotter:v4.0.0
   k8s.gcr.io/sig-storage/csi-snapshotter:v4.1.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-snapshotter:v4.1.0
   quay.io/k8scsi/csi-resizer:v1.0.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-resizer:v1.0.0
   quay.io/k8scsi/csi-resizer:v1.1.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-resizer:v1.1.0

*
* Preparing operator files within /tmp/dell-csi-operator-bundle

   changing: dellemc/csi-isilon:v1.4.0.000R -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-isilon:v1.4.0.000R
   changing: dellemc/csi-isilon:v1.5.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-isilon:v1.5.0
   changing: dellemc/csi-isilon:v1.6.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-isilon:v1.6.0
   changing: dellemc/csipowermax-reverseproxy:v1.3.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csipowermax-reverseproxy:v1.3.0
   changing: dellemc/csi-powermax:v1.5.0.000R -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-powermax:v1.5.0.000R
   changing: dellemc/csi-powermax:v1.6.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-powermax:v1.6.0
   changing: dellemc/csi-powermax:v1.7.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-powermax:v1.7.0
   changing: dellemc/csi-powerstore:v1.2.0.000R -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-powerstore:v1.2.0.000R
   changing: dellemc/csi-powerstore:v1.3.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-powerstore:v1.3.0
   changing: dellemc/csi-powerstore:v1.4.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-powerstore:v1.4.0
   changing: dellemc/csi-unity:v1.4.0.000R -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-unity:v1.4.0.000R
   changing: dellemc/csi-unity:v1.5.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-unity:v1.5.0
   changing: dellemc/csi-unity:v1.6.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-unity:v1.6.0
   changing: dellemc/csi-vxflexos:v1.3.0.000R -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-vxflexos:v1.3.0.000R
   changing: dellemc/csi-vxflexos:v1.4.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-vxflexos:v1.4.0
   changing: dellemc/csi-vxflexos:v1.5.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-vxflexos:v1.5.0
   changing: dellemc/dell-csi-operator:v1.4.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/dell-csi-operator:v1.4.0
   changing: dellemc/sdc:3.5.1.1 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/sdc:3.5.1.1
   changing: dellemc/sdc:3.5.1.1-1 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/sdc:3.5.1.1-1
   changing: docker.io/busybox:1.32.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/busybox:1.32.0
   changing: k8s.gcr.io/sig-storage/csi-attacher:v3.0.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-attacher:v3.0.0
   changing: k8s.gcr.io/sig-storage/csi-attacher:v3.1.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-attacher:v3.1.0
   changing: k8s.gcr.io/sig-storage/csi-attacher:v3.2.1 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-attacher:v3.2.1
   changing: k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.0.1 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-node-driver-registrar:v2.0.1
   changing: k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.1.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-node-driver-registrar:v2.1.0
   changing: k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.2.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-node-driver-registrar:v2.2.0
   changing: k8s.gcr.io/sig-storage/csi-provisioner:v2.0.2 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-provisioner:v2.0.2
   changing: k8s.gcr.io/sig-storage/csi-provisioner:v2.1.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-provisioner:v2.1.0
   changing: k8s.gcr.io/sig-storage/csi-provisioner:v2.2.1 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-provisioner:v2.2.1
   changing: k8s.gcr.io/sig-storage/csi-resizer:v1.2.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-resizer:v1.2.0
   changing: k8s.gcr.io/sig-storage/csi-snapshotter:v3.0.2 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-snapshotter:v3.0.2
   changing: k8s.gcr.io/sig-storage/csi-snapshotter:v3.0.3 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-snapshotter:v3.0.3
   changing: k8s.gcr.io/sig-storage/csi-snapshotter:v4.0.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-snapshotter:v4.0.0
   changing: k8s.gcr.io/sig-storage/csi-snapshotter:v4.1.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-snapshotter:v4.1.0
   changing: quay.io/k8scsi/csi-resizer:v1.0.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-resizer:v1.0.0
   changing: quay.io/k8scsi/csi-resizer:v1.1.0 -> amaas-eos-mw1.cec.lab.emc.com:5028/csi-operator/csi-resizer:v1.1.0

*
* Complete

```

### Perform either a Helm installation or Operator installation

Now that the required images are available and the Helm Charts/Operator configuration updated, you can proceed by following the usual installation procedure as documented either via [Helm](../helm) or [Operator](../operator/#manual-installation).

*NOTES:* 
1. Offline bundle installation is only supported with manual installs i.e. without using Operator Lifecycle Manager.
2. Installation should be done using the files that are obtained after unpacking the offline bundle (dell-csi-operator-bundle.tar.gz) as the image tags in the manifests are modified to point to the internal registry. 
3. Offline bundle installs operator in `default` namespace via install.sh script. Make sure that the current context in kubeconfig file has the namespace set to `default`.