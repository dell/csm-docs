---
title: PowerStore
linkTitle: PowerStore
description: >
  Installing the CSI Driver for Dell PowerStore via Dell CSM Operator
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}
The CSI Driver for Dell PowerStore can be installed via the Dell CSM Operator.
To deploy the Operator, follow the instructions available [here](../../#installation).

Note that the deployment of the driver using the operator does not use any Helm charts and the installation and configuration parameters will be slightly different from the one specified via the Helm installer.

## Listing installed drivers

To query for all Dell CSI drivers installed with the ContainerStorageModule CRD use the following command:

```bash
kubectl get csm --all-namespaces
```

## Prerequisites

The following requirements must be met before installing the CSI Driver for Dell PowerStore:

- A Kubernetes or OpenShift cluster (see [supported versions](../../../../csidriver/#features-and-capabilities)).
- Refer to the sections below for protocol specific requirements.
- If you want to use pre-configured iSCSI/FC hosts be sure to check that they are not part of any host group.
- Linux multipathing requirements (described later).
- Mount propagation is enabled on the container runtime that is being used.
- If using the Snapshot feature, satisfy all Volume Snapshot requirements.
- Insecure registries are defined in Docker or other container runtime for CSI drivers that are hosted in a non-secure location.
- Ensure that your nodes support mounting NFS volumes if using NFS.
- For NVMe support the preferred multipath solution is NVMe native multipathing. The [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) describes the details of each configuration option.

### Fibre Channel Requirements

The following requirements must be fulfilled in order to successfully use the Fiber Channel protocol with the CSI PowerStore driver:

- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel ports on the PowerStore arrays must be done.
- If the number of volumes that will be published to nodes is high, then configure the maximum number of LUNs for your HBAs on each node. See the appropriate HBA document to configure the maximum number of LUNs.

### iSCSI Requirements

The following requirements must be fulfilled in order to successfully use the iSCSI protocol with the CSI PowerStore driver:

- Ensure that the necessary iSCSI initiator utilities are installed on each Kubernetes worker node. This typically includes the _iscsi-initiator-utils_ package for RHEL or _open-iscsi_ package for Ubuntu.
- Enable and start the _iscsid_ service on each Kubernetes worker node. This service is responsible for managing the iSCSI initiator. You can enable the service by running the following command on all worker nodes: `systemctl enable --now iscsid`
- Ensure that the unique initiator name is set in _/etc/iscsi/initiatorname.iscsi_.
- To configure iSCSI in Red Hat OpenShift clusters, you can create a `MachineConfig` object using the console or `oc` to ensure that the iSCSI daemon starts on all the Red Hat CoreOS nodes. Here is an example of a `MachineConfig` object:

```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: 99-iscsid
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 3.2.0
    systemd:
      units:
      - name: "iscsid.service"
        enabled: true
```

Once the `MachineConfig` object has been deployed, CoreOS will ensure that the `iscsid.service` starts automatically. You can check the status of the iSCSI service by entering the following command on each worker node in the cluster: `sudo systemctl status iscsid`.

- Ensure that the iSCSI initiators are available on all the nodes where the driver node plugin will be installed.
- Ensure that the unique initiator name is set in _/etc/iscsi/initiatorname.iscsi_.
- Kubernetes nodes must have network connectivity to an iSCSI port on the Dell PowerStore array that
has IP interfaces.
- Ensure that the iSCSI initiators on the nodes are not a part of any existing Host or Host Group on the Dell PowerStore arrays. The driver will create host entries for the iSCSI initiators which adheres to the naming conventions required by the driver.

Refer to the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for more information.

### NVMe Requirements

The following requirements must be fulfilled in order to successfully use the NVMe protocols with the CSI PowerStore driver:

- All OpenShift or Kubernetes nodes connecting to Dell storage arrays must use unique host NVMe Qualified Names (NQNs).

> The OpenShift deployment process for CoreOS will set the same host NQN for all nodes. The host NQN is stored in the file /etc/nvme/hostnqn. One possible solution to ensure unique host NQNs is to add the following machine config to your OCP cluster:

```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  labels:
    machineconfiguration.openshift.io/role: worker
  name: 99-worker-custom-nvme-hostnqn
spec:
  config:
    ignition:
      version: 3.4.0
    systemd:
      units:
        - contents: |
            [Unit]
            Description=Custom CoreOS Generate NVMe Hostnqn

            [Service]
            Type=oneshot
            ExecStart=/usr/bin/sh -c '/usr/sbin/nvme gen-hostnqn > /etc/nvme/hostnqn'
            RemainAfterExit=yes

            [Install]
            WantedBy=multi-user.target
          enabled: true
          name: custom-coreos-generate-nvme-hostnqn.service
```

- The driver requires the NVMe command-line interface (nvme-cli) to manage the NVMe clients and targets. The NVMe CLI tool is installed in the host using the following command on RPM oriented Linux distributions.

```bash
sudo dnf -y install nvme-cli
```

- Support for NVMe requires native NVMe multipathing to be configured on each worker node in the cluster. Please refer to the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for more details on NVMe multipathing requirements. To determine if the worker nodes are configured for native NVMe multipathing run the following command on each worker node:

```bash
cat /sys/module/nvme_core/parameters/multipath
```

 >If the result of the command displays Y then NVMe native multipathing is enabled in the kernel. If the output is N then native NVMe multipating is disabled. Consult the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for Linux to enable native NVMe multipathing.

**Configure the IO policy**

- The default NVMeTCP native multipathing policy is "numa". The preferred IO policy for NVMe devices used for PowerStore is round-robin. You can use udev rules to enable the round robin policy on all worker nodes. To view the IO policy you can use the following command:

```bash
nvme list-subsys
```

To change the IO policy to round-robin you can add a udev rule on each worker node. Place a config file in /etc/udev/rules.d with the name 71-nvme-io-policy.rules with the following contents:

```text
ACTION=="add|change", SUBSYSTEM=="nvme-subsystem", ATTR{iopolicy}="round-robin"
```

In order to change the rules on a running kernel you can run the following commands:

```bash
/sbin/udevadm control --reload-rules
/sbin/udevadm trigger --type=devices --action=change
```

On OCP clusters you can add a MachineConfig to enable this rule on all worker nodes:

```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: 99-workers-multipath-round-robin
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 3.2.0
    storage:
      files:
      - contents:
          source: data:text/plain;charset=utf-8;base64,QUNUSU9OPT0iYWRkfGNoYW5nZSIsIFNVQlNZU1RFTT09Im52bWUtc3Vic3lzdGVtIiwgQVRUUntpb3BvbGljeX09InJvdW5kLXJvYmluIg==
          verification: {}
        filesystem: root
        mode: 420
        path: /etc/udev/rules.d/71-nvme-io-policy.rules
```

**Configure the control loss timeout**

To reduce the impact of PowerStore non disruptive software upgrades you must set the control loss timeout. This can be done using udev rules on each worker node. More information can be found in the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf). To configure the control loss timeout place a config file in /etc/udev/rules.d with the name 72-nvmf-ctrl_loss_tmo.rules with the following contents:

```text
ACTION=="add|change", SUBSYSTEM=="nvme", KERNEL=="nvme*", ATTR{ctrl_loss_tmo}="-1"
```
In order to change the rules on a running kernel you can run the following commands:

```bash
/sbin/udevadm control --reload-rules
/sbin/udevadm trigger --type=devices --action=change
```

On OCP clusters you can add a MachineConfig to enable this rule on all worker nodes:

```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: 99-nvmf-ctrl-loss-tmo
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 3.2.0
    storage:
      files:
      - contents:
          source: data:text/plain;charset=utf-8;base64,QUNUSU9OPT0iYWRkfGNoYW5nZSIsIFNVQlNZU1RFTT09Im52bWUiLCBLRVJORUw9PSJudm1lKiIsIEFUVFJ7Y3RybF9sb3NzX3Rtb309Ii0xIgo=
          verification: {}
        filesystem: root
        mode: 420
        path: /etc/udev/rules.d/72-nvmf-ctrl_loss_tmo.rules
```

**Requirements for NVMeTCP**

> Starting with OCP 4.14 NVMe/TCP is enabled by default on RCOS nodes.

- Modules including the nvme, nvme_core, nvme_fabrics, and nvme_tcp are required for using NVMe over Fabrics using TCP. Load the NVMe and NVMe-OF Modules using the below commands:
```bash
modprobe nvme
modprobe nvme_tcp
```
- The NVMe modules may not be available after a node reboot. Loading the modules at startup is recommended.

**Requirements for NVMeFC**
- NVMeFC Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port must be done.

> Do not load the nvme_tcp module for NVMeFC

### Linux Multipathing Requirements

Dell PowerStore supports Linux multipathing (DM-MPIO) and NVMe native multipathing. Configure Linux multipathing before installing the CSI Driver.

> For NVMe connectivity native NVMe multipathing is used. The following sections apply only for iSCSI and Fiber Channel connectivity.

Configure Linux multipathing as follows:
- Ensure that all nodes have the _Device Mapper Multipathing_ package installed.
  You can install it by running `dnf install device-mapper-multipath` or `apt install multipath-tools` based on your Linux distribution.
- Enable multipathing using the `mpathconf --enable --with_multipathd y` command.  A default configuration file, `/etc/multipath.conf` is created.
- Enable `user_friendly_names` and `find_multipaths` in the `multipath.conf` file.
- Ensure that the `multipath` command for `multipath.conf` is available on all Kubernetes nodes.

The following is a sample multipath.conf file:

```text
defaults {
	polling_interval 5
	checker_timeout 15
	disable_changed_wwids yes
	find_multipaths no
}
devices {
	device {
		vendor DellEMC
		product PowerStore
		detect_prio "yes"
		path_selector "queue-length 0"

		path_grouping_policy "group_by_prio"
		path_checker tur
		failback immediate
		fast_io_fail_tmo 5
		no_path_retry 3
		rr_min_io_rq 1
		max_sectors_kb 1024
		dev_loss_tmo 10
		hardware_handler "1 alua"
	}
	device {
		vendor .*
		product dellemc-powerstore
		uid_attribute ID_WWN
		prio ana
		failback immediate
		path_grouping_policy "group_by_prio"
		path_checker "none"
		path_selector "queue-length 0"
		detect_prio "yes"
		fast_io_fail_tmo 5
		no_path_retry 3
		rr_min_io_rq 1
		max_sectors_kb 1024
		dev_loss_tmo 10
	}
}
```

On some distributions the multipathd service for changes to the configuration and dynamically reconfigures itself. If you need to manually trigger a reload you can run the following command:
`sudo systemctl reload multipathd`

On OCP clusters you can add a MachineConfig to configure multipathing on the worker nodes.

You will need to first base64 encode the multipath.conf and add it to the MachineConfig definition.

```bash
echo 'defaults {
	polling_interval 5
	checker_timeout 15
	disable_changed_wwids yes
	find_multipaths no
}
devices {
	device {
		vendor DellEMC
		product PowerStore
		detect_prio "yes"
		path_selector "queue-length 0"

		path_grouping_policy "group_by_prio"
		path_checker tur
		failback immediate
		fast_io_fail_tmo 5
		no_path_retry 3
		rr_min_io_rq 1
		max_sectors_kb 1024
		dev_loss_tmo 10
		hardware_handler "1 alua"
	}
	device {
		vendor .*
		product dellemc-powerstore
		uid_attribute ID_WWN
		prio ana
		failback immediate
		path_grouping_policy "group_by_prio"
		path_checker "none"
		path_selector "queue-length 0"
		detect_prio "yes"
		fast_io_fail_tmo 5
		no_path_retry 3
		rr_min_io_rq 1
		max_sectors_kb 1024
		dev_loss_tmo 10
	}
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
          source: data:text/plain;charset=utf-8;base64,ZGVmYXVsdHMgewogIHBvbGxpbmdfaW50ZXJ2YWwgNQogIGNoZWNrZXJfdGltZW91dCAxNQogIGRpc2FibGVfY2hhbmdlZF93d2lkcyB5ZXMKICBmaW5kX211bHRpcGF0aHMgbm8KfQpkZXZpY2VzIHsKICBkZXZpY2UgewogICAgdmVuZG9yIERlbGxFTUMKICAgIHByb2R1Y3QgUG93ZXJTdG9yZQogICAgZGV0ZWN0X3ByaW8gInllcyIKICAgIHBhdGhfc2VsZWN0b3IgInF1ZXVlLWxlbmd0aCAwIgoKICAgIHBhdGhfZ3JvdXBpbmdfcG9saWN5ICJncm91cF9ieV9wcmlvIgogICAgcGF0aF9jaGVja2VyIHR1cgogICAgZmFpbGJhY2sgaW1tZWRpYXRlCiAgICBmYXN0X2lvX2ZhaWxfdG1vIDUKICAgIG5vX3BhdGhfcmV0cnkgMwogICAgcnJfbWluX2lvX3JxIDEKICAgIG1heF9zZWN0b3JzX2tiIDEwMjQKICAgIGRldl9sb3NzX3RtbyAxMAogICAgaGFyZHdhcmVfaGFuZGxlciAiMSBhbHVhIgogIH0KICBkZXZpY2UgewogICAgdmVuZG9yIC4qCiAgICBwcm9kdWN0IGRlbGxlbWMtcG93ZXJzdG9yZQogICAgdWlkX2F0dHJpYnV0ZSBJRF9XV04KICAgIHByaW8gYW5hCiAgICBmYWlsYmFjayBpbW1lZGlhdGUKICAgIHBhdGhfZ3JvdXBpbmdfcG9saWN5ICJncm91cF9ieV9wcmlvIgogICAgcGF0aF9jaGVja2VyICJub25lIgogICAgcGF0aF9zZWxlY3RvciAicXVldWUtbGVuZ3RoIDAiCiAgICBkZXRlY3RfcHJpbyAieWVzIgogICAgZmFzdF9pb19mYWlsX3RtbyA1CiAgICBub19wYXRoX3JldHJ5IDMKICAgIHJyX21pbl9pb19ycSAxCiAgICBtYXhfc2VjdG9yc19rYiAxMDI0CiAgICBkZXZfbG9zc190bW8gMTAKICB9Cn0K
          verification: {}
        filesystem: root
        mode: 400
        path: /etc/multipath.conf
```

After deploying this`MachineConfig` object, CoreOS will start the multipath service automatically.
Alternatively, you can check the status of the multipath service by running the following command on each worker node.
`sudo multipath -ll`

Refer to the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for more information.

### Volume Snapshot Requirements (Optional)
For detailed snapshot setup procedure, [click here.](../../../../snapshots/#optional-volume-snapshot-requirements)

### Replication Requirements (Optional)

Applicable only if you decided to enable the Replication feature in `sample.yaml`

```yaml
replication:
  enabled: true
```
#### Replication CRDs

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

## Install Driver

1. Follow all the [prerequisites](#prerequisites) above

2. Create a CR (Custom Resource) for PowerStore using the sample files provided

    a. Install the PowerStore driver using default configuration using
    the sample file provided
   [here](https://github.com/dell/csm-operator/tree/main/samples/minimal-samples). This file can be modified to use custom parameters if needed.

    b. Install the PowerStore driver using the detailed configuration using
    the sample file provided
    [here](https://github.com/dell/csm-operator/tree/main/samples).

3. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerStore driver and their default values:

  | Parameter | Description | Required | Default |
| --------- | ----------- | -------- |-------- |
| replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, the excess pods will be in pending state until new nodes are available for scheduling. Default is 2 which allows for Controller high availability. | Yes | 2 |
| namespace | Specifies namespace where the driver will be installed | Yes | "powerstore" |
| fsGroupPolicy | Defines which FS Group policy mode to be used. Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No |"ReadWriteOnceWithFSType"|
| storageCapacity | Enable/Disable storage capacity tracking feature | No | false |
| ***Common parameters for node and controller*** |
| X_CSI_POWERSTORE_NODE_NAME_PREFIX | Prefix to add to each node registered by the CSI driver | Yes | "csi-node"
| X_CSI_FC_PORTS_FILTER_FILE_PATH | To set path to the file which provides a list of WWPN which should be used by the driver for FC connection on this node | No | "/etc/fc-ports-filter" |
| ***Controller parameters*** |
| X_CSI_POWERSTORE_EXTERNAL_ACCESS | allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | empty |
| X_CSI_NFS_ACLS | Defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory. | No | "0777" |
| ***Node parameters*** |
| X_CSI_POWERSTORE_ENABLE_CHAP | Set to true if you want to enable iSCSI CHAP feature | No | false |
| ***Sidecar parameters*** |
| volume-name-prefix | The volume-name-prefix will be used by provisioner sidecar as a prefix for all the volumes created  | Yes | csivol |
| monitor-interval | The monitor-interval will be used by external-health-monitor as an interval for health checks  | Yes | 60s |

4. Execute the following command to create PowerStore custom resource:
   ```bash
   kubectl create -f <input_sample_file.yaml>
   ```
   This command will deploy the CSI PowerStore driver in the namespace specified in the input YAML file.

   - Next, the driver should be installed, you can check the condition of driver pods by running
      ```bash
      kubectl get all -n <driver-namespace>
      ```

5. [Verify the CSI Driver installation](../#verifying-the-driver-installation)

6. Refer https://github.com/dell/csi-powerstore/tree/main/samples for the sample files.

**Note** :
   1. "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
   2. Snapshotter and resizer sidecars are not optional. They are defaults with Driver installation.

## Dynamic secret change detection

CSI PowerStore supports the ability to dynamically modify array information within the secret, allowing users to update
<u>_credentials_</u> for the PowerStore arrays, in-flight, without restarting the driver.
> Note: Updates to the secret that include adding a new array, or modifying the endpoint, globalID, or blockProtocol parameters
> require the driver to be restarted to properly pick up and process the changes.

To do so, change the configuration file `config.yaml` and apply the update using the following command:

```bash
sed "s/CONFIG_YAML/`cat config.yaml | base64 -w0`/g" secret.yaml | kubectl apply -f -
```
