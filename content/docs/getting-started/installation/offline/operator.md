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
4. [**Install Container Storage Modules**](../offline#install-container-storage-modules-1) using the unpacked files.
5. [**Installing Dell CSM Operator on a disconnected OpenShift environment**](../offline#installing-dell-csm-operator-on-a-disconnected-openshift-environment-1)

>NOTE: Use the same tool (docker or podman) for packing and unpacking images.

### **Building an offline bundle**

>NOTE: Login to `registry.redhat.io` with RedHat credentials before starting.

On a Linux system with Internet access:

1. Clone the required `csm-operator` version:

```bash
git clone -b {{< version-docs key="csm-operator_latest_version" >}} https://github.com/dell/csm-operator.git
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

   quay.io/dell/container-storage-modules/csi-isilon:{{< version-docs key="PScale_latestVersion" >}}
   quay.io/dell/container-storage-modules/csi-metadata-retriever:{{< version-docs key="metadata_retriever_latest_version" >}}
   quay.io/dell/container-storage-modules/csi-powermax:{{< version-docs key="PMax_latestVersion" >}}
   quay.io/dell/container-storage-modules/csi-powerstore:{{< version-docs key="PStore_latestVersion" >}}
   quay.io/dell/container-storage-modules/csi-unity:{{< version-docs key="PUnity_latestVersion" >}}
   quay.io/dell/container-storage-modules/csi-vxflexos:{{< version-docs key="PFlex_latestVersion" >}}
   quay.io/dell/container-storage-modules/csm-metrics-powerflex:{{< version-docs key="Observability_csm_metrics_PFlex_image" >}}
   quay.io/dell/container-storage-modules/csm-metrics-powerscale:{{< version-docs key="Observability_csm_metrics_PScale_image" >}}
   quay.io/dell/container-storage-modules/csm-metrics-powerstore:{{< version-docs key="Observability_csm_metrics_PStore_image" >}}
   quay.io/dell/container-storage-modules/dell-csi-replicator:{{< version-docs key="replicator_latest_version" >}}
   quay.io/dell/container-storage-modules/dell-replication-controller:{{< version-docs key="replication_controller_latest_version" >}}
   quay.io/dell/storage/powerflex/sdc:5.0
   quay.io/dell/container-storage-modules/dell-csm-operator:{{< version-docs key="csm-operator_latest_version" >}}
   registry.redhat.io/openshift4/ose-kube-rbac-proxy-rhel9:v4.16.0-202409051837.p0.g8ea2c99.assembly.stream.el9
   nginxinc/nginx-unprivileged:1.27
   ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:{{< version-docs key="opentelemetry_collector_latest_version" >}}
   registry.k8s.io/sig-storage/csi-attacher:{{< version-docs key="csi_attacher_latest_version" >}}
   registry.k8s.io/sig-storage/csi-external-health-monitor-controller:{{< version-docs key="csi_external_health_monitor_controller_latest_version" >}}
   registry.k8s.io/sig-storage/csi-node-driver-registrar:{{< version-docs key="csi_node_driver_registrar_latest_version" >}}
   registry.k8s.io/sig-storage/csi-provisioner:{{< version-docs key="csi_provisioner_latest_version" >}}
   registry.k8s.io/sig-storage/csi-resizer:{{< version-docs key="csi_resizer_latest_version" >}}
   registry.k8s.io/sig-storage/csi-snapshotter:{{< version-docs key="csi_snapshotter_latest_version" >}}

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

Loaded image: quay.io/dell/container-storage-modules/csi-powerstore:{{< version-docs key="PStore_latestVersion" >}}
Loaded image: quay.io/dell/container-storage-modules/csi-isilon:{{< version-docs key="PScale_latestVersion" >}}
...
...
Loaded image: registry.k8s.io/sig-storage/csi-resizer:{{< version-docs key="csi_resizer_latest_version" >}}
Loaded image: registry.k8s.io/sig-storage/csi-snapshotter:{{< version-docs key="csi_snapshotter_latest_version" >}}

* Tagging and pushing images

   quay.io/dell/container-storage-modules/csi-isilon:{{< version-docs key="PScale_latestVersion" >}} -> localregistry:5000/dell-csm-operator/csi-isilon:{{< version-docs key="PScale_latestVersion" >}}
   quay.io/dell/container-storage-modules/csi-metadata-retriever:{{< version-docs key="metadata_retriever_latest_version" >}} -> localregistry:5000/dell-csm-operator/csi-metadata-retriever:{{< version-docs key="metadata_retriever_latest_version" >}}
   ...
   ...
   registry.k8s.io/sig-storage/csi-resizer:{{< version-docs key="csi_resizer_latest_version" >}} -> localregistry:5000/dell-csm-operator/csi-resizer:{{< version-docs key="csi_resizer_latest_version" >}}
   registry.k8s.io/sig-storage/csi-snapshotter:{{< version-docs key="csi_snapshotter_latest_version" >}} -> localregistry:5000/dell-csm-operator/csi-snapshotter:{{< version-docs key="csi_snapshotter_latest_version" >}}

* Preparing files within /root/dell-csm-operator-bundle

   changing: quay.io/dell/container-storage-modules/csi-isilon:{{< version-docs key="PScale_latestVersion" >}} -> localregistry:5000/dell-csm-operator/csi-isilon:{{< version-docs key="PScale_latestVersion" >}}
   changing: quay.io/dell/container-storage-modules/csi-metadata-retriever:{{< version-docs key="metadata_retriever_latest_version" >}} -> localregistry:5000/dell-csm-operator/csi-metadata-retriever:{{< version-docs key="metadata_retriever_latest_version" >}}
   ...
   ...
   changing: registry.k8s.io/sig-storage/csi-resizer:{{< version-docs key="csi_resizer_latest_version" >}} -> localregistry:5000/dell-csm-operator/csi-resizer:{{< version-docs key="csi_resizer_latest_version" >}}
   changing: registry.k8s.io/sig-storage/csi-snapshotter:{{< version-docs key="csi_snapshotter_latest_version" >}} -> localregistry:5000/dell-csm-operator/csi-snapshotter:{{< version-docs key="csi_snapshotter_latest_version" >}}

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
- <span></span>{{< message text="21" >}}
- Offline bundle installs the operator in the default namespace via the install.sh script. Ensure the current context in the kubeconfig file is set to default.

#### Installing Dell CSM Operator on a disconnected OpenShift environment

This guide provides instructions for installing the Dell CSM Operator on a disconnected OpenShift environment. The most convenient method is to mirror the entire catalog of certified Operators.

**Prerequisites**

Before getting started, ensure the following prerequisites are met:
- The OpenShift CLI (oc) installed
- Access to a private container registry where the mirrored images will be hosted
- Sufficient local storage space to download all required images

**Mirror the Certified Operator Catalog**

Run the following command to mirror the catalog:

```bash
oc adm catalog mirror registry.redhat.io/redhat/certified-operator-index:v[ocp version] [private-registry-url]
```
Example:

```bash
oc adm catalog mirror registry.redhat.io/redhat/certified-operator-index:v4.19 registry.example.com:5000
```

For more detailed steps, such as using credentials to authenticate, using a file archive, and more, refer to the official [OpenShift documentation](https://docs.redhat.com/en/documentation/openshift_container_platform/4.20/html/disconnected_environments/index)

**Populating OperatorHub from a mirrored Operator**

After previous step completes successfully, an `ImageContentSourcePolicy` manifest is generated. That resource will translate regular image url and tags into the mirrored ones in the private registry.

From the disconnected environment run:
```bash
oc create -f imageContentSourcePolicy.yaml
```

Then update the `CatalogSource` to reference the mirrored content in the private registry:
```bash
oc apply -f catalogSource.yaml
```

Verify the deployment:
```bash
oc get pods -n openshift-marketplace
```

Once all pods are in a healthy state, the Red Hat–certified Operators should appear in the `OperatorHub` in the OpenShift Web Console

For more detailed steps on populating the OperatorHub with a new catalog, refer to the official [OpenShift documentation](https://docs.redhat.com/en/documentation/openshift_container_platform/4.20/html/postinstallation_configuration/post-install-preparing-for-users#post-install-mirrored-catalogs).

**Mirroring only the Dell CSM Operator**

The synchronization of the full certified operator catalog is a resource‑intensive process and can take several hours to complete. It also requires significant storage capacity on the container registry (typically more than 1 TB).

An alternative method is to mirror only the Dell CSM Operator. To do so use `oc-mirror` plugin to select the __dell-csm-operator-certified__ only. 

That procedure is documented in the [official documentation](https://docs.redhat.com/en/documentation/openshift_container_platform/4.20/html/disconnected_environments/about-installing-oc-mirror-v2#installation-oc-mirror-v2-about_about-installing-oc-mirror-v2).

The overall workflow is similar to the steps described in the previous section, with the following additional requirements:
- Download and install the `oc-mirror` plugin (available through the OpenShift Web Console or from the [Github repository](https://github.com/openshift/oc-mirror/releases)).
- Authenticate `podman` with `registry.redhat.io`.
- Prepare an `ImageSetConfiguration` that includes only the Dell CSM Operator.

Here is a sample `ImageSetConfiguration` file to be adjusted with OpenShift version and CSM Operator version:
```yaml
apiVersion: mirror.openshift.io/v2alpha1
kind: ImageSetConfiguration
mirror:
  operators:
    - catalog: registry.redhat.io/redhat/certified-operator-index:v[ocp version]
      packages:
        - name: dell-csm-operator-certified
          channels:
            - name: stable
              minVersion: "[dell csm operator version]"
```

In a fully disconnected environment, the required images must be downloaded locally:
```bash
oc mirror --config=dell-csm-operator-mirror.yml file:///tmp/dell-csm-operator-imageset --v2
```

Push the images to the private registry:
```bash
oc mirror --config=dell-csm-operator-mirror.yml --from file:///tmp/dell-csm-operator-imageset docker://<mirror_registry_url> --v2
```

Finally, patch the `ImageDigestMirrorSet`:
```bash
oc apply -f cluster-resources
```

Verification can be performed using:
```bash
oc get imagedigestmirrorset
oc get catalogsource -n openshift-marketplace
oc get clustercatalog
```
