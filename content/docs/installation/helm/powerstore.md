---
title: PowerStore
description: >
  Installing PowerStore CSI Driver via Helm
---

The CSI Driver for Dell EMC PowerStore can be deployed by using the provided Helm v3 charts and installation scripts on both Kubernetes and OpenShift platforms. For more detailed information on the installation scripts, review the script [documentation](https://github.com/dell/csi-powerstore/tree/master/dell-csi-helm-installer).

The controller section of the Helm chart installs the following components in a _Deployment_ in the namespace `csi-powerstore`:
- CSI Driver for Dell EMC PowerStore
- Kubernetes External Provisioner, which provisions the volumes
- Kubernetes External Attacher, which attaches the volumes to the containers
- Kubernetes External Snapshotter, which provides snapshot support
- Kubernetes External Resizer, which resizes the volume

The node section of the Helm chart installs the following component in a _DaemonSet_ in the namespace `csi-powerstore`:
- CSI Driver for Dell EMC PowerStore
- Kubernetes Node Registrar, which handles the driver registration

## Prerequisites

The following are requirements to be met before installing the CSI Driver for Dell EMC PowerStore:
- Install Kubernetes or OpenShift (see [supported versions](../../../dell-csi-driver/))
- Install Helm 3
- If you plan to use either the Fibre Channel or iSCSI protocol, refer to either _Fibre Channel requirements_ or _Set up the iSCSI Initiator_ sections below. You can use NFS volumes without FC or iSCSI configuration.
> You can use either the Fibre Channel or iSCSI protocol, but you do not need both.
- Linux native multipathing requirements
- Configure Mount propagation on container runtime (i.e. Docker)
- Volume Snapshot requirements
- The nonsecure registries are defined in Docker or other container runtimes, for CSI drivers that are hosted in a non-secure location.
- You can access your cluster with kubectl and helm.
- Ensure that your nodes support mounting NFS volumes. 

### Install Helm 3.0

Install Helm 3.0 on the master node before you install the CSI Driver for Dell EMC PowerFlex.

**Steps**

  Run the `curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash` command to install Helm 3.0.

### Fibre Channel requirements

Dell EMC PowerStore supports Fibre Channel communication. If you use the Fibre Channel protocol, ensure that the
following requirement is met before you install the CSI Driver for Dell EMC PowerStore:
- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port director must be done.


### Set up the iSCSI Initiator
The CSI Driver for Dell EMC PowerStore v1.3 supports iSCSI connectivity.

If you use the iSCSI protocol, set up the iSCSI initiators as follows:
- Ensure that the iSCSI initiators are available on both Controller and Worker nodes.
- Kubernetes nodes must have access (network connectivity) to an iSCSI director on the Dell EMC PowerStore array that
has IP interfaces. Manually create IP routes for each node that connects to the Dell EMC PowerStore.
- All Kubernetes nodes must have the _iscsi-initiator-utils_ package for CentOS/RHEL or _open-iscsi_ package for Ubuntu installed, and the _iscsid_ service must be enabled and running.
To do this, run the `systemctl enable --now iscsid` command.
- Ensure that the unique initiator name is set in _/etc/iscsi/initiatorname.iscsi_.

For information about configuring iSCSI, see _Dell EMC PowerStore documentation_ on Dell EMC Support.

### Linux multipathing requirements
Dell EMC PowerStore supports Linux multipathing. Configure Linux multipathing before installing the CSI Driver for Dell EMC
PowerStore.

Set up Linux multipathing as follows:
- Ensure that all nodes have the _Device Mapper Multipathing_ package installed.
> You can install it by running `yum install device-mapper-multipath` on CentOS or `apt install multipath-tools` on Ubuntu. This package should create a multipath configuration file located in `/etc/multipath.conf`.
- Enable multipathing using the `mpathconf --enable --with_multipathd y` command.
- Enable `user_friendly_names` and `find_multipaths` in the `multipath.conf` file.
- Ensure that the multipath command for `multipath.conf` is available on all Kubernetes nodes.

### Configure Mount Propagation on Container Runtime 

It is required to configure mount propagation on your container runtime on all Kubernetes nodes before installing the CSI Driver for Dell EMC PowerStore.  The following is instruction on how to do this with Docker.  If you use another container runtime please follow the recommended instructions from the vendor to configure mount propagation.

**Steps**

1. Edit the service section of `/etc/systemd/system/multi-user.target.wants/docker.service` file to add the following lines:
   ```bash
   docker.service
   [Service]...
   MountFlags=shared
   ```
2. Restart the docker service with `systemctl daemon-reload` and `systemctl restart docker` on all the nodes.

*NOTE:* Some distribution, like Ubuntu, already has _MountFlags_ set by default.

### Volume Snapshot Requirements

#### Volume Snapshot CRD's
The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on Github.
- If on Kubernetes 1.18/1.19 (beta snapshots) use [v3.0.3](https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.3/client/config/crd)
- If on Kubernetes 1.20 (v1 snapshots) use [v4.0.0](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.0.0/client/config/crd)

#### Volume Snapshot Controller
The beta Volume Snapshots in Kubernetes version 1.17 and later, the CSI external-snapshotter sidecar is split into two controllers:
- A common snapshot controller
- A CSI external-snapshotter sidecar

The common snapshot controller must be installed only once in the cluster irrespective of the number of CSI drivers installed in the cluster. On OpenShift clusters 4.4 and later, the common snapshot-controller is pre-installed. In the clusters where it is not present, it can be installed using `kubectl` and the manifests are available:
- If on Kubernetes 1.18/1.19 (beta snapshots) use [v3.0.3](https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.3/deploy/kubernetes/snapshot-controller)
- If on Kubernetes 1.20 (v1 snapshots) use [v4.0.0](https://github.com/kubernetes-csi/external-snapshotter/tree/v4.0.0/deploy/kubernetes/snapshot-controller)

*NOTE:*
- The manifests available on GitHub install the snapshotter image: 
   - [quay.io/k8scsi/csi-snapshotter:v3.0.3](https://quay.io/repository/k8scsi/csi-snapshotter?tag=v3.0.3&tab=tags)
   - [quay.io/k8scsi/csi-snapshotter:v4.0.0](https://quay.io/repository/k8scsi/csi-snapshotter?tag=v4.0.0&tab=tags)
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

#### Installation example 

You can install CRDs and default snapshot controller by running following commands:
```bash
git clone https://github.com/kubernetes-csi/external-snapshotter/
cd ./external-snapshotter
git checkout release-<your-version>
kubectl create -f client/config/crd
kubectl create -f deploy/kubernetes/snapshot-controller
```

*NOTE:*
- It is recommended to use v3.0.3 version of snapshotter/snapshot-controller when using Kubernetes v1.18, v1.19
- When using Kubernetes v1.20 it is recommended to use v4.0.0 version of snapshotter/snapshot-controller.
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

## Install the Driver

**Steps**
1. Run `git clone https://github.com/dell/csi-powerstore.git` to clone the git repository.
2. Ensure that you have created namespace where you want to install the driver. You can run `kubectl create namespace csi-powerstore` to create a new one. 
3. Check `helm/csi-powerstore/driver-image.yaml` and confirm the driver image points to new image.
4. Edit `helm/secret.yaml`, correct namespace field to point to your desired namespace.
5. Edit `helm/config.yaml` file and configure connection information for your PowerStore arrays changing following parameters:
    - *endpoint*: defines the full URL path to the PowerStore API.
    - *username*, *password*: defines credentials for connecting to array.
    - *insecure*: defines if we should use insecure connection or not.
    - *default*: defines if we should treat the current array as a default.
    - *block-protocol*: defines what SCSI transport protocol we should use (FC, ISCSI, None, or auto).
    - *nas-name*: defines what NAS should be used for NFS volumes.
    
    Add more blocks similar to above for each PowerStore array if necessary. 
6. Create storage classes using ones from `helm/samples/storageclass` folder as an example and apply them to the Kubernetes cluster by running `kubectl create -f <path_to_storageclass_file>`
    > If you do not specify `arrayIP` parameter in the storage class then the array that was specified as the default would be used for provisioning volumes.
7. Create the secret by running ```sed "s/CONFIG_YAML/`cat helm/config.yaml | base64 -w0`/g" helm/secret.yaml | kubectl apply -f -```
8. Copy the default values.yaml file `cd dell-csi-helm-installer && cp ../helm/csi-powerstore/values.yaml ./my-powerstore-settings.yaml`
9. Edit the newly created values file and provide values for the following parameters `vi my-powerstore-settings.yaml`:

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| volumeNamePrefix | Defines the string added to each volume that the CSI driver creates | No | "csi" |
| nodeNamePrefix | Defines the string added to each node that the CSI driver registers | No | "csi-node" |
| nodeIDPath | Defines a path to file with a unique identifier identifying the node in the Kubernetes cluster| No | "/etc/machine-id" |
| externalAccess | Defines additional entries for hostAccess of NFS volumes, single IP address and subnet are valid entries | No | " " |
| connection.enableCHAP   | Defines whether the driver should use CHAP for iSCSI connections or not | No | False |
| controller.nodeSelector | Defines what nodes would be selected for pods of controller deployment | Yes | " " |
| controller.tolerations  | Defines tolerations that would be applied to controller deployment | Yes | " " |
| controller.replicas     | Defines number of replicas of controller deployment | Yes | 2 |
| node.nodeSelector | Defines what nodes would be selected for pods of node daemonset | Yes | " " |
| node.tolerations  | Defines tolerations that would be applied to node daemonset | Yes | " " |

8. Install the driver using `csi-install.sh` bash script by running `./csi-install.sh --namespace csi-powerstore --values ./my-powerstore-settings.yaml` 
   - After that the driver should be installed, you can check the condition of driver pods by running `kubectl get all -n csi-powerstore` 

*NOTE:* 
- For detailed instructions on how to run the install scripts, refer to the readme document in the dell-csi-helm-installer folder.
- By default, the driver scans available SCSI adapters and tries to register them with the storage array under the SCSI hostname using `nodeNamePrefix` and the ID read from the file pointed to by `nodeIDPath`. If an adapter is already registered with the storage under a different hostname, the adapter is not used by the driver.
- A hostname the driver uses for registration of adapters is in the form `<nodeNamePrefix>-<nodeID>-<nodeIP>`. By default, these are csi-node and the machine ID read from the file `/etc/machine-id`. 
- To customize the hostname, for example if you want to make them more user friendly, adjust nodeIDPath and nodeNamePrefix accordingly. For example, you can set `nodeNamePrefix` to `k8s` and `nodeIDPath` to `/etc/hostname` to produce names such as `k8s-worker1-192.168.1.2`.
- (Optional) Enable additional Mount Options - A user is able to specify additional mount options as needed for the driver. 
   - Mount options are specified in storageclass yaml under _mountOptions_. 
   - *WARNING*: Before utilizing mount options, you must first be fully aware of the potential impact and understand your environment's requirements for the specified option.

## Storage Classes

The CSI driver for Dell EMC PowerStore version 1.3 and later, `dell-csi-helm-installer` will not create any storage classes as part of the driver installation. A wide set of annotated storage class manifests have been provided in the `helm/samples` folder. Please use these samples to create new storage classes to provision storage. See this [note](../../../../v1/installation/helm/powerstore/#storage-classes) for the driving reason behind this change.

### What happens to my existing storage classes?

*Upgrading from CSI PowerStore v1.2 driver*
The storage classes created as part of the installation have an annotation - "helm.sh/resource-policy": keep set. This ensures that even after an uninstall or upgrade, the storage classes are not deleted. You can continue using these storage classes if you wish so.

*Upgrading from an older version of the driver*
The storage classes will be deleted if you upgrade the driver. If you wish to continue using those storage classes, you can patch them and apply the annotation "helm.sh/resource-policy": keep before performing an upgrade.

*NOTE:* If you continue to use the old storage classes, you may not be able to take advantage of any new storage class parameter supported by the driver.

**Steps to create storage class:**

There are samples storage class yaml files available under `helm/samples/storageclass`.  These can be copied and modified as needed.

1. Edit the sample storage class yaml file and update following parameters: 
- *arrayIP*: specifies what array driver should use to provision volumes, if not specified driver will use array specified as `default` in `helm/config.yaml`
- *FsType*: specifies what filesystem type driver should use, possible variants `ext4`, `xfs`, `nfs`, if not specified driver will use `ext4` by default
- *allowedTopologies* (Optional): If you want you can also add topology constraints.
```yaml
allowedTopologies:
  - matchLabelExpressions: 
      - key: csi-powerstore.dellemc.com/12.34.56.78-iscsi
# replace "-iscsi" with "-fc" or "-nfs" at the end to use FC or NFS enabled hosts
# replace "12.34.56.78" with PowerStore endpoint IP
        values:
          - "true"
```

2. Create your storage class by using `kubectl`:
```bash
kubectl create -f <path_to_storageclass_file>
```

*NOTE:* Deleting a storage class has no impact on a running Pod with mounted PVCs. You won't be able to provision new PVCs until at least one storage class is newly created.
