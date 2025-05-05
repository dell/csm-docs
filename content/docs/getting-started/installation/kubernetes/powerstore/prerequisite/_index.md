---
title: "Prerequisite"
linkTitle: "Prerequisite"
weight: 1
Description: >
--- 
The following requirements must be met before installing the CSI Driver for PowerStore:

- A Kubernetes or OpenShift cluster (see [supported versions](../../../../../concepts/csidriver/#features-and-capabilities))
- Install Helm 3.x
- Refer to the sections below for protocol specific requirements.
- If you want to use pre-configured iSCSI/FC hosts be sure to check that they are not part of any host group.
- Linux multipathing requirements (described later).
- Mount propagation is enabled on the container runtime that is being used.
- If using Snapshot feature, satisfy all Volume Snapshot requirements.
- Insecure registries are defined in Docker or other container runtime for CSI drivers that are hosted in a non-secure location.
- Ensure that your nodes support mounting NFS volumes if using NFS.
- For NVMe support the preferred multipath solution is NVMe native multipathing. The [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) describes the details of each configuration option.
- For "Shared NFS" - Install necessary nfs-utils package and ensure nfs-server and nfs-mountd services are active and running on all nodes.

{{< tabpane text=true lang="en" >}}
{{% tab header="Fibre Channel" lang="en" %}}

### Fibre Channel requirements

The following requirements must be fulfilled in order to successfully use the Fiber Channel protocol with the CSI PowerStore driver:

- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel ports on the PowerStore arrays must be done.
- If the number of volumes that will be published to nodes is high, then configure the maximum number of LUNs for your HBAs on each node. See the appropriate HBA document to configure the maximum number of LUNs.
{{% /tab %}}

{{% tab header="iSCSI" lang="en" %}}
### iSCSI Requirements

The following requirements must be fulfilled in order to successfully use the iSCSI protocol with the CSI PowerStore driver:

- Ensure that the necessary iSCSI initiator utilities are installed on each Kubernetes worker node. This typically includes the _iscsi-initiator-utils_ package for RHEL or _open-iscsi_ package for Ubuntu.
- Enable and start the _iscsid_ service on each Kubernetes worker node. This service is responsible for managing the iSCSI initiator. You can enable the service by running the following command on all worker nodes: `systemctl enable --now iscsid`
- Ensure that the unique initiator name is set in _/etc/iscsi/initiatorname.iscsi_.
- Ensure that the iSCSI initiators are available on all the nodes where the driver node plugin will be installed.
- Ensure that the unique initiator name is set in _/etc/iscsi/initiatorname.iscsi_.
- Kubernetes nodes must have network connectivity to an iSCSI port on the PowerStore array that
has IP interfaces.
- Ensure that the iSCSI initiators on the nodes are not a part of any existing Host or Host Group on the PowerStore arrays. The driver will create host entries for the iSCSI initiators which adheres to the naming conventions required by the driver.

Refer to the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for more information.
{{% /tab %}}

{{% tab header="NVMe" lang="en" %}}

### NVMe Requirements

The following requirements must be fulfilled in order to successfully use the NVMe protocols with the CSI PowerStore driver:

- All OpenShift or Kubernetes nodes connecting to Dell storage arrays must use unique host NVMe Qualified Names (NQNs).

- The driver requires the NVMe command-line interface (nvme-cli) to manage the NVMe clients and targets. The NVMe CLI tool is installed in the host using the following command on RPM oriented Linux distributions.

  ```bash
  sudo dnf -y install nvme-cli
  ```
<br>

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
<br> 
To change the IO policy to round-robin you can add a udev rule on each worker node. Place a config file in /etc/udev/rules.d with the name 71-nvme-io-policy.rules with the following contents:

```text
ACTION=="add|change", SUBSYSTEM=="nvme-subsystem", ATTR{iopolicy}="round-robin"
```

In order to change the rules on a running kernel you can run the following commands:

```bash
/sbin/udevadm control --reload-rules
/sbin/udevadm trigger --type=devices --action=change
``` 
<br> 

**Configure the control loss timeout**

To reduce the impact of PowerStore non disruptive software upgrades you must set the control loss timeout. This can be done using udev rules on each worker node. More information can be found in the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf). To configure the control loss timeout place a config file in /etc/udev/rules.d with the name 72-nvmf-ctrl_loss_tmo.rules with the following contents:

```text
ACTION=="add|change", SUBSYSTEM=="nvme", KERNEL=="nvme*", ATTR{ctrl_loss_tmo}="-1"
```
<br>
In order to change the rules on a running kernel you can run the following commands:

```bash
/sbin/udevadm control --reload-rules
/sbin/udevadm trigger --type=devices --action=change
```
<br>

**Requirements for NVMeTCP**

- Modules including the nvme, nvme_core, nvme_fabrics, and nvme_tcp are required for using NVMe over Fabrics using TCP. Load the NVMe and NVMe-OF Modules using the below commands:
  ```bash
  modprobe nvme
  modprobe nvme_tcp
  ``` 
  <br>
- The NVMe modules may not be available after a node reboot. Loading the modules at startup is recommended.

**Requirements for NVMeFC**
- NVMeFC Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port must be done.

> Do not load the nvme_tcp module for NVMeFC
{{% /tab %}}
{{< /tabpane >}}   

### Linux multipathing requirements

Supported Multipathing 
  - Dell PowerStore supports Linux multipathing (DM-MPIO) and NVMe native multipathing.  
  - Configure Linux multipathing before installing the CSI Driver.

{{< tabpane text=true lang="en" >}}
{{% tab header="NVMe" lang="en" %}}For NVMe connectivity native NVMe multipathing is used. Refer [Dell Technologies Host Connectivity](https://elabnavigator.dell.com/vault/pdf/Linux.pdf#page=209).
{{% /tab %}}

{{% tab header="Fibre Channel / iSCSI" lang="en" %}}

1. Configuration steps: 

   - Install the Device Mapper Multipathing package on all nodes:
        -  `dnf install device-mapper-multipath`
        -   `apt install multipath-tools`

   - Enable multipathing: `mpathconf --enable --with_multipathd y`
   - Edit `/etc/multipath.conf` to enable `user_friendly_names` and `find_multipaths`.
   - Ensure the `mpathconf` command is available on all Kubernetes nodes.
    
<br>

The following is a **simple** sample multipath.conf file. For a detailed sample, refer [Dell Technologies Host Connectivity](https://elabnavigator.dell.com/vault/pdf/Linux.pdf#page=202).

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

{{% /tab %}}
{{< /tabpane >}}

### Replication feature Requirements (Optional)

Applicable only if you decided to enable the Replication feature in `values.yaml`

```yaml
replication:
  enabled: true
```
#### Replication CRD's

The CRDs for replication can be obtained and installed from the csm-replication project on Github. Use `csm-replication/deploy/replicationcrds.all.yaml` located in csm-replication git repo for the installation.

CRDs should be configured during replication prepare stage with repctl as described in [install-repctl](../../../../../getting-started/installation/kubernetes/powerstore/helm/csm-modules/replication/install-repctl/)