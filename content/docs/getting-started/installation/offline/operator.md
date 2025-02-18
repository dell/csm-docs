---
title: "Offline Operator Installation"
linkTitle: "Offline Operator Installation"
no_list: true
description: Offline Operator Installation
weight: 4
--- 

## Workflow

To perform an offline installation :

1. [**Build an offline bundle**](../offline#building-an-offline-bundle-1)
2. [**Unpack the offline bundle**](../offline#unpacking-the-offline-bundle-and-preparing-for-installation-1) and prepare for installation.
3. [**Install operator**](../offline#install-operator-1) using the unpacked files.
4. [**Install Container Storage Modules**](../offline#install-container-storage-module-1) using the unpacked files.

>NOTE: Use the same tool (docker or podman) for packing and unpacking images.

#### **Building an offline bundle**

>NOTE: Login to `registry.redhat.io` with RedHat credentials before starting.

On a Linux system with Internet access:

1. Clone the required `csm-operator` version:
```bash
git clone -b v1.8.0 https://github.com/dell/csm-operator.git 
cd csm-operator
``` 

2. Run the csm-offline-bundle.sh script to create an offline bundle:
```bash
bash scripts/csm-offline-bundle.sh -c
```

The script will :

* Determine required images from CSM Operator configuration files.
* Pull each required image.
* Save all images to a file using `docker save` or `podman save`
* Build a `tar.gz` file containing the images and necessary installation files.

Here is the output of a request to build an offline bundle for the Dell CSM Operator:


{{< collapse id="1" title="Output">}}

```bash
* Building image manifest file

   Processing file /root/csm-operator/operatorconfig/driverconfig/common/default.yaml
   Processing file /root/csm-operator/bundle/manifests/dell-csm-operator.clusterserviceversion.yaml

* Pulling and saving container images

   quay.io/dell/container-storage-modules/csi-isilon:v2.13.0
   quay.io/dell/container-storage-modules/csi-metadata-retriever:v1.10.0
   quay.io/dell/container-storage-modules/csipowermax-reverseproxy:v2.12.0
   quay.io/dell/container-storage-modules/csi-powermax:v2.13.0
   quay.io/dell/container-storage-modules/csi-powerstore:v2.13.0
   quay.io/dell/container-storage-modules/csi-unity:v2.13.0
   quay.io/dell/container-storage-modules/csi-vxflexos:v2.13.0
   quay.io/dell/container-storage-modules/csm-authorization-sidecar:v1.13.0
   quay.io/dell/container-storage-modules/csm-metrics-powerflex:v1.11.0
   quay.io/dell/container-storage-modules/csm-metrics-powerscale:v1.8.0
   quay.io/dell/container-storage-modules/csm-topology:v1.11.0
   quay.io/dell/container-storage-modules/dell-csi-replicator:v1.11.0
   quay.io/dell/container-storage-modules/dell-replication-controller:v1.11.0
   quay.io/dell/storage/powerflex/sdc:4.5.2.1
   quay.io/dell/container-storage-modules/dell-csm-operator:v1.8.0
   registry.redhat.io/openshift4/ose-kube-rbac-proxy-rhel9:v4.16.0-202409051837.p0.g8ea2c99.assembly.stream.el9
   nginxinc/nginx-unprivileged:1.27
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
{{< /collapse >}} 

The resulting offline bundle file can be copied to another machine, if necessary, to gain access to the desired image registry.

#### **Unpacking the offline bundle and preparing for installation**

This step needs to be performed on a Linux system with access to an image registry that will host container images. If the registry requires `login`, that should be done before proceeding.

1. **Copy the Offline Bundle :** Transfer the offline bundle file to a machine with access to the desired image registry.
2. **Unpack the Bundle:**  
    - On a Linux system with registry access, expand the bundle file:
    ```bash
    tar xvfz dell-csm-operator-bundle.tar.gz
    ```
   Here is the output of untar
<ul>
{{< collapse id="2" title="Output">}}

   ```bash
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
{{< /collapse >}}
</ul> 

3. **Prepare for Installation:** Run the `csm-offline-bundle.sh` script with the `-p` option and specify the internal registry path with the `-r` option:
      ```bash
      cd dell-csm-operator-bundle 

      bash scripts/csm-offline-bundle.sh -p -r localregistry:5000/dell-csm-operator/
      ```

   The script will :

      - Load required container images.
      - Tag images with the user-supplied registry information.
      - Push tagged images to the registry.
      - Update the Operator configuration to use the new images.

      Here is the output for preparing the bundle for installation (`localregistry:5000` refers to an image registry accessible to Kubernetes/OpenShift. `dell-csm-operator` refers to the folder created within the registry.):
<ul>
{{< collapse id="3" title="Output">}}

```bash
Preparing a offline bundle for installation

* Loading quay.io images

Loaded image: quay.io/dell/container-storage-modules/csi-powerstore:v2.13.0
Loaded image: quay.io/dell/container-storage-modules/csi-isilon:v2.13.0
...
...
Loaded image: registry.k8s.io/sig-storage/csi-resizer:v1.12.0
Loaded image: registry.k8s.io/sig-storage/csi-snapshotter:v8.1.0

* Tagging and pushing images

   quay.io/dell/container-storage-modules/csi-isilon:v2.13.0 -> localregistry:5000/dell-csm-operator/csi-isilon:v2.13.0
   quay.io/dell/container-storage-modules/csi-metadata-retriever:v1.10.0 -> localregistry:5000/dell-csm-operator/csi-metadata-retriever:v1.10.0
   ...
   ...
   registry.k8s.io/sig-storage/csi-resizer:v1.12.0 -> localregistry:5000/dell-csm-operator/csi-resizer:v1.12.0
   registry.k8s.io/sig-storage/csi-snapshotter:v8.1.0 -> localregistry:5000/dell-csm-operator/csi-snapshotter:v8.1.0

* Preparing files within /root/dell-csm-operator-bundle

   changing: quay.io/dell/container-storage-modules/csi-isilon:v2.13.0 -> localregistry:5000/dell-csm-operator/csi-isilon:v2.13.0
   changing: quay.io/dell/container-storage-modules/csi-metadata-retriever:v1.10.0 -> localregistry:5000/dell-csm-operator/csi-metadata-retriever:v1.10.0
   ...
   ...
   changing: registry.k8s.io/sig-storage/csi-resizer:v1.12.0 -> localregistry:5000/dell-csm-operator/csi-resizer:v1.12.0
   changing: registry.k8s.io/sig-storage/csi-snapshotter:v8.1.0 -> localregistry:5000/dell-csm-operator/csi-snapshotter:v8.1.0

* Complete
```
{{< /collapse >}}

</ul>

#### **Install Operator:**

   - Run the `install.sh` script to install the operator: 

      ```bash
      bash scripts/install.sh
      ```
#### **Install Container Storage Modules** 

**Prepare for Installation:** Ensure required images are available and Operator configuration is updated.

**Follow Installation Procedure:** Proceed with the usual installation steps as documented for the [Operator](docs/getting-started/installation/operator/operatorinstallation_openshift/#installation).

>Notes: 
- The Operator installs to the `dell-csm-operator` namespace by default
- Offline bundle installation is only supported with manual installs (without using Operator Lifecycle Manager).
- Use files from the unpacked offline bundle (dell-csm-operator-bundle.tar.gz) as image tags in the manifests are modified to point to the internal registry.
- Offline bundle installs the operator in the default namespace via the install.sh script. Ensure the current context in the kubeconfig file is set to default.
