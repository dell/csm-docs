---
title: "Offline Helm Installation"
linkTitle: "Offline Helm Installation"
no_list: true
description: Offline Helm Installation
weight: 4
--- 

## Workflow

To perform an offline installation :

1. [**Build an offline bundle**](../offline#building-an-offline-bundle-2) 
2. [**Unpack the offline bundle**](../offline#unpacking-the-offline-bundle-and-preparing-for-installation-2) and prepare for installation.
3. [**Install Container Storage Module**](../offline#install-container-storage-module-2) using the unpacked files.

>NOTE: Use the same tool (docker or podman) for packing and unpacking images.

#### **Building an offline bundle**
>NOTE: Login to the `registry.redhat.io` registry using RedHat credentials before you proceed with offline bundle creation.

- On a Linux system with Internet access, clone the desired repository:
  - For Helm installs, clone the specific driver repo.
- Run the `csi-offline-bundle.sh` script with the `-c` option to create the bundle: 
```bash
git clone -b <version tag> https://github.com/dell/csi-<driver>.git
cd csi-<driver>/dell-csi-helm-installer
bash csi-offline-bundle.sh -c
``` 
{{< collapse id="1" title="Output">}}
```bash 
*
* Building image manifest file

   Processing files in /root/csi-<driver>/helm-charts/charts/csi-<driver>

*
* Pulling and saving container images

   quay.io/dell/container-storage-modules/csi-metadata-retriever:v1.9.0
   quay.io/dell/container-storage-modules/csi-powerstore:v2.12.0
   quay.io/dell/container-storage-modules/csi-volumegroup-snapshotter:v1.7.0
   quay.io/dell/container-storage-modules/dell-csi-replicator:v1.10.0
   quay.io/dell/container-storage-modules/podmon:v1.11.0
   registry.k8s.io/sig-storage/csi-attacher:v4.7.0
   registry.k8s.io/sig-storage/csi-external-health-monitor-controller:v0.13.0
   registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.12.0
   registry.k8s.io/sig-storage/csi-provisioner:v5.1.0
   registry.k8s.io/sig-storage/csi-resizer:v1.12.0
   registry.k8s.io/sig-storage/csi-snapshotter:v8.1.0

*
* Copying necessary files

 /root/csi-<driver>/helm-charts/charts/csi-powerstore
 /root/csi-<driver>/dell-csi-helm-installer
 /root/csi-<driver>/README.md
 /root/csi-<driver>/LICENSE

*
* Compressing release

csi-<driver>-bundle-2.12.0/
csi-<driver>-bundle-2.12.0/helm-charts/
csi-<driver>-bundle-2.12.0/helm-charts/charts/
csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/
csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/Chart.yaml
csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/values.yaml
csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/templates/
csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/templates/node.yaml
csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/templates/_helpers.tpl
csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/templates/csidriver.yaml
csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/templates/driver-config-params.yaml
csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/templates/controller.yaml
csi-<driver>-bundle-2.12.0/LICENSE
csi-<driver>-bundle-2.12.0/README.md
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/common.sh
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/verify-csi-powerstore.sh
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/registry.k8s.io-sig-storage-csi-resizer-v1.12.0.tar
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/quay.io-dell-container-storage-modules-csi-metadata-retriever-v1.9.0.tar
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/registry.k8s.io-sig-storage-csi-attacher-v4.7.0.tar
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/quay.io-dell-container-storage-modules-csi-powerstore-v2.12.0.tar
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/registry.k8s.io-sig-storage-csi-snapshotter-v8.1.0.tar
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/quay.io-dell-container-storage-modules-dell-csi-replicator-v1.10.0.tar
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/quay.io-dell-container-storage-modules-podmon-v1.11.0.tar
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/registry.k8s.io-sig-storage-csi-external-health-monitor-controller-v0.13.0.tar
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/registry.k8s.io-sig-storage-csi-node-driver-registrar-v2.12.0.tar
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/quay.io-dell-container-storage-modules-csi-volumegroup-snapshotter-v1.7.0.tar
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/registry.k8s.io-sig-storage-csi-provisioner-v5.1.0.tar
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/csi-offline-bundle.md
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/.gitignore
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/README.md
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/csi-install.sh
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.manifest
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/verify.sh
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/csi-uninstall.sh
csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/csi-offline-bundle.sh

*
* Complete

Offline bundle file is: ~/csi-<driver>/csi-<driver>-bundle-2.12.0.tar.gz
```
{{< /collapse >}}

#### **Unpacking the offline bundle and preparing for installation**

1. On a Linux system with registry access, copy the bundle file.
2.  Expand the bundle file: `tar xvfz csi-<driver>-bundle-2.12.0.tar.gz`
{{< collapse id="2" title="Output">}}   

```bash
  csi-<driver>-bundle-2.12.0/
  csi-<driver>-bundle-2.12.0/helm-charts/
  csi-<driver>-bundle-2.12.0/helm-charts/charts/
  csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/
  csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/Chart.yaml
  csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/values.yaml
  csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/templates/
  csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/templates/node.yaml
  csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/templates/_helpers.tpl
  csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/templates/csidriver.yaml
  csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/templates/driver-config-params.yaml
  csi-<driver>-bundle-2.12.0/helm-charts/charts/csi-<driver>/templates/controller.yaml
  csi-<driver>-bundle-2.12.0/LICENSE
  csi-<driver>-bundle-2.12.0/README.md
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/common.sh
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/verify-csi-<driver>.sh
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/registry.k8s.io-sig-storage-csi-resizer-v1.12.0.tar
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/quay.io-dell-container-storage-modules-csi-metadata-retriever-v1.9.0.tar
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/registry.k8s.io-sig-storage-csi-attacher-v4.7.0.tar
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/quay.io-dell-container-storage-modules-csi-<driver>-v2.12.0.tar
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/registry.k8s.io-sig-storage-csi-snapshotter-v8.1.0.tar
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/quay.io-dell-container-storage-modules-dell-csi-replicator-v1.10.0.tar
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/quay.io-dell-container-storage-modules-podmon-v1.11.0.tar
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/registry.k8s.io-sig-storage-csi-external-health-monitor-controller-v0.13.0.tar
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/registry.k8s.io-sig-storage-csi-node-driver-registrar-v2.12.0.tar
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/quay.io-dell-container-storage-modules-csi-volumegroup-snapshotter-v1.7.0.tar
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.tar/registry.k8s.io-sig-storage-csi-provisioner-v5.1.0.tar
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/csi-offline-bundle.md
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/.gitignore
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/README.md
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/csi-install.sh
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/images.manifest
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/verify.sh
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/csi-uninstall.sh
  csi-<driver>-bundle-2.12.0/dell-csi-helm-installer/csi-offline-bundle.sh 
```
{{< /collapse >}}
3. Run the `csi-offline-bundle.sh` script with the `-p` option and specify the registry path with the `-r` option:
```bash  
cd csi-<driver>-bundle-2.12.0/dell-csi-helm-installer 
./csi-offline-bundle.sh -p -r localregistry:5000/dell-csi-<driver>
```

 * The script will then perform the following steps:
   - Load the required container images into the local system
   - Tag the images according to the user-supplied registry information
   - Push the newly tagged images to the registry
   - Modify the Helm charts to refer to the newly tagged/pushed images

#### **Install Container Storage Module**

**Prepare for Installation:**  Ensure required images are available and Helm Charts configuration is updated. 

**Follow Installation Procedure:** Proceed with the usual installation steps as documented for [Helm](docs/getting-started/installation/helm).