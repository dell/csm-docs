---
title: PowerStore
linkTitle: "PowerStore"
description: >
  Installing Dell CSI Driver for PowerStore via Dell CSM Operator
---

## Installing CSI Driver for PowerStore via Dell CSM Operator

The CSI Driver for Dell PowerStore can be installed via the Dell CSM Operator.
To deploy the Operator, follow the instructions available [here](../../#installation).

Note that the deployment of the driver using the operator does not use any Helm charts and the installation and configuration parameters will be slightly different from the one specified via the Helm installer.

### Check existing ContainerStorageModule CRD
User can query for all Dell CSI drivers using the following command:
```bash
kubectl get csm --all-namespaces
```


### Prerequisites

#### Fibre Channel requirements

Dell PowerStore supports Fibre Channel communication. If you use the Fibre Channel protocol, ensure that the
following requirement is met before you install the CSI Driver for Dell PowerStore:
- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port must be done.


#### Set up the iSCSI Initiator
The CSI Driver for Dell PowerStore v1.4 and higher supports iSCSI connectivity.

If you use the iSCSI protocol, set up the iSCSI initiators as follows:
- Ensure that the iSCSI initiators are available on both Controller and Worker nodes.
- Kubernetes nodes must have access (network connectivity) to an iSCSI port on the Dell PowerStore array that
has IP interfaces. Manually create IP routes for each node that connects to the Dell PowerStore.
- All Kubernetes nodes must have the _iscsi-initiator-utils_ package for CentOS/RHEL or _open-iscsi_ package for Ubuntu installed, and the _iscsid_ service must be enabled and running.
To do this, run the `systemctl enable --now iscsid` command.
- Ensure that the unique initiator name is set in _/etc/iscsi/initiatorname.iscsi_.

For information about configuring iSCSI, see _Dell PowerStore documentation_ on Dell Support.


#### Set up the NVMe Initiator

If you want to use the protocol, set up the NVMe initiators as follows:
- The driver requires NVMe management command-line interface (nvme-cli) to use configure, edit, view or start the NVMe client and target. The nvme-cli utility provides a command-line and interactive shell option. The NVMe CLI tool is installed in the host using the below command.
```bash
sudo apt install nvme-cli
```

**Requirements for NVMeTCP**
- Modules including the nvme, nvme_core, nvme_fabrics, and nvme_tcp are required for using NVMe over Fabrics using TCP. Load the NVMe and NVMe-OF Modules using the below commands:
```bash
modprobe nvme
modprobe nvme_tcp
```
- The NVMe modules may not be available after a node reboot. Loading the modules at startup is recommended.

**Requirements for NVMeFC**
- NVMeFC Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port must be done.

*NOTE:*
- Do not load the nvme_tcp module for NVMeFC

#### Linux multipathing requirements
Dell PowerStore supports Linux multipathing. Configure Linux multipathing before installing the CSI Driver for Dell
PowerStore.

Set up Linux multipathing as follows:
- Ensure that all nodes have the _Device Mapper Multipathing_ package installed.
> You can install it by running `yum install device-mapper-multipath` on CentOS or `apt install multipath-tools` on Ubuntu. This package should create a multipath configuration file located in `/etc/multipath.conf`.
- Enable multipathing using the `mpathconf --enable --with_multipathd y` command.
- Enable `user_friendly_names` and `find_multipaths` in the `multipath.conf` file.
- Ensure that the multipath command for `multipath.conf` is available on all Kubernetes nodes.

##### multipathd `MachineConfig`

If you are installing a CSI Driver which requires the installation of the Linux native Multipath software - _multipathd_, please follow the below instructions

To enable multipathd on RedHat CoreOS nodes you need to prepare a working configuration encoded in base64.

```bash echo 'defaults {
user_friendly_names yes
find_multipaths yes
}
blacklist {
}' | base64 -w0
```

Use the base64 encoded string output in the following `MachineConfig` yaml file (under source section)
```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: workers-multipath-conf-default
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 3.2.0
    storage:
      files:
      - contents:
          source: data:text/plain;charset=utf-8;base64,ZGVmYXVsdHMgewp1c2VyX2ZyaWVuZGx5X25hbWVzIHllcwpmaW5kX211bHRpcGF0aHMgeWVzCn0KCmJsYWNrbGlzdCB7Cn0K
          verification: {}
        filesystem: root
        mode: 400
        path: /etc/multipath.conf
```
After deploying this`MachineConfig` object, CoreOS will start multipath service automatically.
Alternatively, you can check the status of the multipath service by entering the following command in each worker nodes.
`sudo multipath -ll`

If the above command is not successful, ensure that the /etc/multipath.conf file is present and configured properly. Once the file has been configured correctly, enable the multipath service by running the following command:
`sudo /sbin/mpathconf –-enable --with_multipathd y`

Finally, you have to restart the service by providing the command
`sudo systemctl restart multipathd`

For additional information refer to official documentation of the multipath configuration.

#### (Optional) Volume Snapshot Requirements
  For detailed snapshot setup procedure, [click here.](../../../../snapshots/#optional-volume-snapshot-requirements)

#### (Optional) Replication feature Requirements

Applicable only if you decided to enable the Replication feature in `sample.yaml`

```yaml
replication:
  enabled: true
```
##### Replication CRD's

The CRDs for replication can be obtained and installed from the csm-replication project on Github. Use `csm-replication/deploy/replicationcrds.all.yaml` located in csm-replication git repo for the installation.

CRDs should be configured during replication prepare stage with repctl as described in [install-repctl](../../../helm/modules/installation/replication/install-repctl)
### Namespace and PowerStore API Access Configuration

1. Create namespace.
   Execute `kubectl create namespace powerstore` to create the powerstore namespace (if not already present). Note that the namespace can be any user-defined name, in this example, we assume that the namespace is 'powerstore'.

2. Create a file called `config.yaml` that has Powerstore array connection details with the following content
   ```yaml
   arrays:
      - endpoint: "https://10.0.0.1/api/rest"     # full URL path to the PowerStore API
        globalID: "unique"                        # unique id of the PowerStore array
        username: "user"                          # username for connecting to API
        password: "password"                      # password for connecting to API
        skipCertificateValidation: true           # indicates if client side validation of (management)server's certificate can be skipped
        isDefault: true                           # treat current array as a default (would be used by storage classes without arrayID parameter)
        blockProtocol: "auto"                     # what SCSI transport protocol use on node side (FC, ISCSI, NVMeTCP, NVMeFC, None, or auto)
        nasName: "nas-server"                     # what NAS should be used for NFS volumes
        nfsAcls: "0777"                           # (Optional) defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory.
                                                  # NFSv4 ACls are supported for NFSv4 shares on NFSv4 enabled NAS servers only. POSIX ACLs are not supported and only POSIX mode bits are supported for NFSv3 shares.
   ```
   Change the parameters with relevant values for your PowerStore array. 
   Add more blocks similar to above for each PowerStore array if necessary.

   If replication feature is enabled, ensure the secret includes all the PowerStore arrays involved in replication.

   #### User Privileges
   The username specified in `config.yaml` must be from the authentication providers of PowerStore. The user must have the correct user role to perform the actions. The minimum requirement is **Storage Operator**.

3. Create Kubernetes secret: 

   Create a file called `secret.yaml` in same folder as `config.yaml` with following content
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
      name: powerstore-config
      namespace: powerstore
   type: Opaque
   data:
      config: CONFIG_YAML
   ```

   Combine both files and create Kubernetes secret by running the following command:
   ```bash

   sed "s/CONFIG_YAML/`cat config.yaml | base64 -w0`/g" secret.yaml | kubectl apply -f -
   ```

### Install Driver

1. Follow all the [prerequisites](#prerequisite) above
   
2. Create a CR (Custom Resource) for PowerStore using the sample files provided 
   [here](https://github.com/dell/csm-operator/tree/master/samples). This file can be modified to use custom parameters if needed.

3. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerStore driver and their default values:

  | Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be in pending state until new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
| namespace | Specifies namespace where the driver will be installed | Yes | "powerstore" |
| fsGroupPolicy | Defines which FS Group policy mode to be used. Supported modes `None, File and ReadWriteOnceWithFSType` | No |"ReadWriteOnceWithFSType"|
| storageCapacity | Enable/Disable storage capacity tracking feature | No | false |
| ***Common parameters for node and controller*** |
| X_CSI_POWERSTORE_NODE_NAME_PREFIX | Prefix to add to each node registered by the CSI driver | Yes | "csi-node" 
| X_CSI_FC_PORTS_FILTER_FILE_PATH | To set path to the file which provides a list of WWPN which should be used by the driver for FC connection on this node | No | "/etc/fc-ports-filter" |
| ***Controller parameters*** |
| X_CSI_POWERSTORE_EXTERNAL_ACCESS | allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | empty |
| X_CSI_NFS_ACLS | Defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory. | No | "0777" |
| ***Node parameters*** |
| X_CSI_POWERSTORE_ENABLE_CHAP | Set to true if you want to enable iSCSI CHAP feature | No | false |

4.  Execute the following command to create PowerStore custom resource:
   ```bash
   kubectl create -f <input_sample_file.yaml>
   ```
   This command will deploy the CSI PowerStore driver in the namespace specified in the input YAML file.
      
   - Next, the driver should be installed, you can check the condition of driver pods by running 
      ```bash
      kubectl get all -n <driver-namespace>
      ```

5.  [Verify the CSI Driver installation](../#verifying-the-driver-installation)

6. Refer https://github.com/dell/csi-powerstore/tree/main/samples for the sample files.
    
**Note** : 
   1. "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
   2. Snapshotter and resizer sidecars are not optional. They are defaults with Driver installation. 
