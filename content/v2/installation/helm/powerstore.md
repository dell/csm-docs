---
title: PowerStore
description: >
  Installing PowerStore CSI Driver via Helm
---

The CSI Driver for Dell EMC PowerStore can be deployed by using the provided Helm v3 charts and installation scripts on both Kubernetes and OpenShift platforms. For more detailed information on the installation scripts, please review the script [documentation](https://github.com/dell/csi-unity/tree/master/dell-csi-helm-installer).

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
- Install Kubernetes (1.17, 1.18, 1.19) or OpenShift (4.5 or 4.6)
- Install Helm 3
- If you plan to use either the Fibre Channel or iSCSI protocol, refer to either _Fibre Channel requirements_ or _Set up the iSCSI Initiator_ sections below. You can use NFS volumes without FC or iSCSI configuration.
> You can use either the Fibre Channel or iSCSI protocol, but you do not need both.
- Linux native multipathing requirements
- Configure Mount propagation on container runtime (i.e. Docker)
- Volume Snapshot requirements
- The nonsecure registries are defined in Docker or other container runtime, for CSI drivers that are hosted in a nonsecure location.
- You can access your cluster with kubectl and helm.

### Install Helm 3.0

Install Helm 3.0 on the master node before you install the CSI Driver for Dell EMC PowerFlex.

**Steps**

  Run the `curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash` command to install Helm 3.0.

### Fibre Channel requirements

Dell EMC PowerStore supports Fibre Channel communication. If you will use the Fibre Channel protocol, ensure that the
following requirement is met before you install the CSI Driver for Dell EMC PowerStore:
- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port director must be done.


### Set up the iSCSI Initiator
The CSI Driver for Dell EMC PowerStore v1.2 supports iSCSI connectivity.

If you will use the iSCSI protocol, set up the iSCSI initiators as follows:
- Make sure that the iSCSI initiators are available on both Controller and Worker nodes.
- Kubernetes nodes should have access (network connectivity) to an iSCSI director on the Dell EMC PowerStore array that
has IP interfaces. Manually create IP routes for each node that connects to the Dell EMC PowerStore.
- All Kubernetes nodes must have the _iscsi-initiator-utils_ package for CentOS/RHEL or _open-iscsi_ package for Ubuntu installed, and the _iscsid_ service must be enabled and running.
To do this, run the `systemctl enable --now iscsid` command.
- Make sure that the unique initiator name is set in _/etc/iscsi/initiatorname.iscsi_.

For information about configuring iSCSI, see _Dell EMC PowerStore documentation_ on Dell EMC Support.

### Linux multipathing requirements
Dell EMC PowerStore supports Linux multipathing. Configure Linux multipathing before installing the CSI Driver for Dell EMC
PowerStore.

Set up Linux multipathing as follows:
- Ensure that all nodes have the _Device Mapper Multipathing_ package installed.
> You can install it by running yum install device-mapper-multipath on CentOS or apt install multipath-tools on Ubuntu. This package should create a multipath configuration file located in `/etc/multipath.conf`.
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

### Volume Snapshot requirements

#### Volume Snapshot CRD's
The Kubernetes Volume Snapshot CRDs can be obtained and installed from the external-snapshotter project on [Github](https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.2/client/config/crd).

Alternately, you can install the CRDs by supplying the option _--snapshot-crd_ while installing the driver using the `csi-install.sh` script. If you are installing the driver using the Dell CSI Operator, there is a helper script provided to install the snapshot CRDs - `scripts/install_snap_crds.sh`.

#### Volume Snapshot Controller

Starting with beta Volume Snapshots in Kubernetes 1.17, the CSI external-snapshotter sidecar is split into two controllers:
- A common snapshot controller
- A CSI external-snapshotter sidecar

The common snapshot controller must be installed only once in the cluster irrespective the number of CSI drivers installed in the cluster. On OpenShift clusters 4.4 onwards, the common snapshot-controller is pre-installed. In the clusters where it is not present, it can be installed using `kubectl` and the manifests available on [GitHub](https://github.com/kubernetes-csi/external-snapshotter/tree/v3.0.2/deploy/kubernetes/snapshot-controller).

*NOTE:*
- The manifests available on GitHub install v3.0.2 of the snapshotter image - [quay.io/k8scsi/csi-snapshotter:v3.0.2](https://quay.io/repository/k8scsi/csi-snapshotter?tag=v3.0.2&tab=tags)
- Dell EMC recommends using v3.0.2 image of the snapshot-controller - [quay.io/k8scsi/snapshot-controller:v3.0.2](https://quay.io/repository/k8scsi/snapshot-controller?tag=v3.0.2&tab=tags)
- The CSI external-snapshotter sidecar is still installed along with the driver and does not involve any extra configuration.

## Install the Driver

**Steps**
1. Run `git clone https://github.com/dell/csi-powerstore.git` to clone the git repository
2. Ensure that you've created namespace where you want to install the driver. You can run `kubectl create namespace csi-powerstore` to create a new one 
3. Check helm/csi-powerstore/driver-image.yaml and confirm the driver image points to new image.
4. Edit the `helm/secret.yaml`, point to correct namespace and replace the values for the username and password parameters.
    These values can be obtained using base64 encoding as described in the following example:
    ```bash
    echo -n "myusername" | base64
    echo -n "mypassword" | base64
    ```
   where *myusername* & *mypassword* are credentials that would be used for accessing PowerStore API.
   *NOTE:* If you want to use iSCSI CHAP you need fill `chapsecret` and `chapuser` fields in similar manner
5. Create the secret by running `kubectl create -f helm/secret.yaml` 
6. Copy the default values.yaml file `cd dell-csi-helm-installer && cp ../helm/csi-powerstore/values.yaml ./my-powerstore-settings.yaml`
7. Edit the newly created values file and provide values for the following parameters `vi my-powerstore-settings.yaml`:

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| powerStoreApi | Defines the full URL path to the PowerStore API | Yes | " " |
| volumeNamePrefix | Defines the string added to each volume that the CSI driver creates | No | "csi" |
| nodeNamePrefix | Defines the string added to each node that the CSI driver registers | No | "csi-node" |
| nodeIDPath | Defines a path to file with a unique identifier identifying the node in the Kubernetes cluster| No | "/etc/machine-id" |
| connection.scsiProtocol | Defines which transport protocol to use (FC, ISCSI, None, or auto). <br />- By default, the driver scans available SCSI adapters and tries to register them with the storage array under the SCSI hostname using `nodeNamePrefix` and the ID read from the file pointed to by `nodeIDPath`. If an adapter is already registered with the storage under a different hostname, the adapter is not used by the driver. <br />- A hostname the driver uses for registration of adapters is in the form `<nodeNamePrefix>-<nodeID>-<nodeIP>`. By default, these are csi-node and the machine ID read from the file `/etc/machine-id`. <br />- To customize the hostname, for example if you want to make them more user friendly, adjust nodeIDPath and nodeNamePrefix accordingly. <br />- For example, you can set `nodeNamePrefix` to `k8s` and `nodeIDPath` to `/etc/hostname` to produce names such as `k8s-worker1-192.168.1.2`. | Yes | "auto" |
| connection.nfs.enable   | Enables or disables NFS support | No | FALSE |
| connection.nfs.nasServerName | Points to the NAS server that would be used - If you have nfs.enabled set to true, it will try to use *nfs.nasServerName*. This will fail if you do not provide *nfs.nasServerName*. | No | "nas-server" |
| connection.nfs.version   | Defines version of NFS protocol | No | "v3" |
| connection.enableCHAP   | Defines whether the driver should use CHAP for iSCSI connections or not | No | FALSE |
| controller.nodeSelector | Defines what nodes would be selected for pods of controller deployment | Yes | " " |
| controller.tolerations  | Defines tolerations that would be applied to controller deployment | Yes | " " |
| controller.replicas     | Defines number of replicas of controller deployment | Yes | 2 |
| node.nodeSelector | Defines what nodes would be selected for pods of node daemonset | Yes | " " |
| node.tolerations  | Defines tolerations that would be applied to node daemonset | Yes | " " |

8. Install the driver using `csi-install.sh` bash script by running `./csi-install.sh --namespace csi-powerstore --values ./my-powerstore-settings.yaml` 
   - After that the driver should be installed, you can check condition of driver pods by running `kubectl get all -n csi-powerstore` 

*NOTE:* 
- For detailed instructions on how to run the install scripts, refer to the readme document in the dell-csi-helm-installer folder.
- (Optional) Enable additional Mount Options - A user is able to specify additional mount options as needed for the driver. 
   - Mount options are specified in storageclass yaml under _mountOptions_. 
   - *WARNING*: Before utilizing mount options, you must first be fully aware of the potential impact and understand your environment's requirements for the specified option.

## Storage Classes
As part of the driver installation, a set of storage classes is created along with the driver pods. This is done to demonstrate how storage classes need to be created to consume storage from Dell EMC storage arrays. 

The `StorageClass` object in Kubernetes is immutable and can't be modified once created. It creates challenges when we need to change or update a parameter, for example when a version of the driver introduces new configurable parameters for the storage classes. To avoid issues during upgrades, future releases of the drivers will have the installation separated from the creation of Storage Classes.
In preparation for that, starting in Q4 of 2020, an annotation `"helm.sh/resource-policy": keep` is applied to the storage classes created by the `dell-csi-helm-installer`.

Because of this annotation, these storage classes are not going to be deleted even after the driver has been uninstalled.
This annotation has been applied to give you an opportunity to keep using  these storage classes even with a future release of the driver. In case you wish to not use these storage classes, you will need to delete them by using the `kubectl delete storageclass` command.

*NOTE*: If you uninstall the driver and reinstall it, you can still face errors if any update in the `values.yaml` file leads to an update of the storage class(es):

```
    Error: cannot patch "<sc-name>" with kind StorageClass: StorageClass.storage.k8s.io "<sc-name>" is invalid: parameters: Forbidden: updates to parameters are forbidden
```

In case you want to make such updates, make sure to delete the existing storage classes using the `kubectl delete storageclass` command.  
Deleting a storage class has no impact on a running Pod with mounted PVCs. You won't be able to provision new PVCs until at least one storage class is newly created.
