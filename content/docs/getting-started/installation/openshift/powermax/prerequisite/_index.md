---
title: "Prerequisite"
linkTitle: "Prerequisite"
weight: 1
Description: >

--- 

The following requirements must be met before installing the CSI Driver for PowerMax:

- A Kubernetes or OpenShift cluster (see [supported versions](../../../../../concepts/csidriver/#features-and-capabilities)).
- If enabling CSM for Authorization, please refer to the Authorization deployment steps first
- If enabling CSM Replication, both source and target storage systems must be locally managed by Unisphere.
  - _Example_: When using two Unisphere instances, the first Unisphere instance should be configured with the source storage system as locally
  managed and target storage system as remotely managed. The second Unisphere configuration should mirror the first — locally managing the target storage system and
  remotely managing the source storage system.
- Refer to the sections below for protocol specific requirements.
- For NVMe support the preferred multipath solution is NVMe native multipathing. The [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) describes the details of each configuration option.
- Linux multipathing requirements (described later).
- PowerPath for Linux requirements (described later).
- Mount propagation is enabled on the container runtime that is being used.
- If using Snapshot feature, satisfy all Volume Snapshot requirements.
- Insecure registries are defined in Docker or other container runtime for CSI drivers that are hosted in a non-secure location.
- Ensure that your nodes support mounting NFS volumes if using NFS.

### CSI PowerMax Reverse Proxy

The CSI PowerMax Reverse Proxy is a component that will be installed with the CSI PowerMax driver. For more details on this feature, see the related [documentation](../../../../../concepts/csidriver/features/powermax/#csi-powermax-reverse-proxy).

Create a TLS secret that holds an SSL certificate and a private key. This is required by the reverse proxy server.
Use a tool such as `openssl` to generate this secret using the example below:

```bash
openssl genrsa -out tls.key 2048
openssl req -new -key tls.key -out tls.csr -config openssl.cnf
openssl x509 -req -in tls.csr -signkey tls.key -out tls.crt -days 3650 -extensions req_ext -extfile openssl.cnf
kubectl create secret -n <namespace> tls csirevproxy-tls-secret --cert=tls.crt --key=tls.key
```
{{< tabpane text=true lang="en" >}}
{{% tab header="Fibre Channel" lang="en" %}}
### Fibre Channel Requirements

The following requirements must be fulfilled in order to successfully use the Fiber Channel protocol with the CSI PowerMax driver:

- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port director must be completed.
- Ensure that the HBA WWNs (initiators) appear on the list of initiators that are logged into the array.
- If the number of volumes that will be published to nodes is high, then configure the maximum number of LUNs for your HBAs on each node. See the appropriate HBA document to configure the maximum number of LUNs.
{{% /tab %}}


{{% tab header="iSCSI" lang="en" %}}

### iSCSI Requirements

The following requirements must be fulfilled in order to successfully use the iSCSI protocol with the CSI PowerMax driver.

- Ensure that the necessary iSCSI initiator utilities are installed on each Kubernetes worker node. This typically includes the _iscsi-initiator-utils_ package for RHEL.
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
      version: 3.4.0
    systemd:
      units:
      - name: "iscsid.service"
        enabled: true
```

Once the `MachineConfig` object has been deployed, CoreOS will ensure that the `iscsid.service` starts automatically. You can check the status of the iSCSI service by entering the following command on each worker node in the cluster: `sudo systemctl status iscsid`.

- Ensure that the iSCSI initiators are available on all the nodes where the driver node plugin will be installed.
- Ensure that the unique initiator name is set in _/etc/iscsi/initiatorname.iscsi_.
- If your worker nodes are running Red Hat CoreOS, make sure that automatic iSCSI login at boot is configured. Please contact RedHat for more details.
- Kubernetes nodes must have network connectivity to an iSCSI director on the Dell PowerMax array that has IP interfaces. Manually create IP routes for each node that connects to the Dell PowerMax if required.
- Ensure that the iSCSI initiators on the nodes are not a part of any existing Host (Initiator Group) on the Dell PowerMax array.
- The CSI Driver needs the port group name containing the required iSCSI director ports. These port groups must be set up on each Dell PowerMax array. All the port group names supplied to the driver must exist on each Dell PowerMax with the same name.

Refer to the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for more information.
{{% /tab %}}


{{% tab header="NVMe" lang="en" %}}

### NVMe Requirements

The following requirements must be fulfilled in order to successfully use the NVMe/TCP protocols with the CSI PowerMax driver:

- Modules including the nvme, nvme_core, nvme_fabrics, and nvme_tcp are required for using NVMe over Fabrics using TCP. Load the NVMe and NVMe-OF Modules using the below commands:
```bash
modprobe nvme
modprobe nvme_tcp
```
- The NVMe modules may not be available after a node reboot. Loading the modules at startup is recommended.

> Starting with OCP 4.14 NVMe/TCP is enabled by default on RCOS nodes.


**Cluster requirements**

- All OpenShift or Kubernetes nodes connecting to Dell storage arrays must use unique host NQNs.
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

- The default NVMeTCP native multipathing policy is "numa". The preferred IO policy for NVMe devices used for PowerMax is round-robin. You can use udev rules to enable the round robin policy on all worker nodes. To view the IO policy you can use the following command:

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
      version: 3.4.0
    storage:
      files:
      - contents:
          source: data:text/plain;charset=utf-8;base64,QUNUSU9OPT0iYWRkfGNoYW5nZSIsIFNVQlNZU1RFTT09Im52bWUtc3Vic3lzdGVtIiwgQVRUUntpb3BvbGljeX09InJvdW5kLXJvYmluIg==
          verification: {}
        filesystem: root
        mode: 420
        path: /etc/udev/rules.d/71-nvme-io-policy.rules
```

**Array requirements**

Once the NVMe endpoint is created on the array, follow the following steps to update the endpoint name to adhere to the CSI driver requirements.

   - Run  ```nvme discover --transport=tcp --traddr=<InterfaceAdd> --trsvcid=4420```. <InterfaceAdd> is the placeholder for actual IP address of NVMe Endpoint.
   - Fetch the _subnqn_, for e.g.,  _nqn.1988-11.com.dell:PowerMax_2500:00:000120001100_, this will be used as the subnqn holder while updating NVMe endpoint name.
   - Update the NVMe endpoint name as ```<subnqn>:<dir><port>>```. Here is an example how it should look, _nqn.1988-11.com.dell:PowerMax_2500:00:000120001100:OR1C000_
{{% /tab %}}

{{% tab header="NFS" lang="en" %}}

### NFS Requirements

CSI Driver for Dell PowerMax supports NFS communication. Ensure that the following requirements are met before you install CSI Driver:
- Configure the NFS network. Please refer [here](https://dl.dell.com/content/manual57826791-dell-powermax-file-protocol-guide.pdf?language=en-us&ps=true) for more details.
- PowerMax Embedded Management guest to access Unisphere for PowerMax.
- Create the NAS server. Please refer [here](https://dl.dell.com/content/manual55638050-dell-powermax-file-quick-start-guide.pdf?language=en-us&ps=true) for more details.
{{% /tab %}}
{{< /tabpane >}}   

Choose your multipathing software between [Multipath](#linux-multipathing-requirements) & [PowerPath](#powerpath-for-linux-requirements)

{{< tabpane text=true lang="en" >}}
{{< tab header="Linux Multipathing" lang="en" >}}
{{< markdownify >}}


### Linux Multipathing Requirements

 Configure Linux multipathing before installing the CSI Driver.
 Supported Multipathing 
    - Dell PowerMax supports Linux multipathing (DM-MPIO) and NVMe native multipathing.  
    - Configure Linux multipathing before installing the CSI Driver.


{{< /markdownify >}}


{{< collapse id="1" title="NVMe" >}} For NVMe connectivity native NVMe multipathing is used. Refer [Dell Technologies Host Connectivity](https://elabnavigator.dell.com/vault/pdf/Linux.pdf#page=209) Linux Guide for more details.{{< /collapse >}}
<br>
{{< collapse id="2" title="FC/iSCSI" >}}

1. Configuration steps: 

   - Install the Device Mapper Multipathing package on all nodes:
        -  `dnf install device-mapper-multipath`
   - Ensure the `mpathconf` command is available on all Kubernetes nodes.
   - Enable multipathing: `mpathconf --enable --with_multipathd y`
   - Edit `/etc/multipath.conf` to enable `user_friendly_names` and `find_multipaths`.
    
<br>

2. Best Practices 

    Use these options in multipath.conf for efficient path detection:

    ```text
    path_grouping_policy multibus
    path_checker tur
    features "1 queue_if_no_path"
    path_selector "round-robin 0"
    no_path_retry 10
    ```
<br>
The following is a sample multipath.conf file. You may have to adjust these values based on your environment.

```text
defaults {
  user_friendly_names yes
  find_multipaths yes
  path_grouping_policy multibus
  path_checker tur
  features "1 queue_if_no_path"
  path_selector "round-robin 0"
  no_path_retry 10
}
  blacklist {
}
```

On some distributions the multipathd service for changes to the configuration and dynamically reconfigures itself. If you need to manually trigger a reload you can run the following command:
`sudo systemctl reload multipathd`

To enable multipathd on RedHat CoreOS nodes you need to prepare a working configuration encoded in base64. For example you can run the following command to encode the above multipath.config file.

```text
echo 'defaults {
  user_friendly_names yes
  find_multipaths yes
  path_grouping_policy multibus
  path_checker tur
  features "1 queue_if_no_path"
  path_selector "round-robin 0"
  no_path_retry 10
}
  blacklist {
}' | base64 -w0
```

The output of the above command follows:
```text
ZGVmYXVsdHMgewogIHVzZXJfZnJpZW5kbHlfbmFtZXMgeWVzCiAgZmluZF9tdWx0aXBhdGhzIHllcwogIHBhdGhfZ3JvdXBpbmdfcG9saWN5IG11bHRpYnVzCiAgcGF0aF9jaGVja2VyIHR1cgogIGZlYXR1cmVzICIxIHF1ZXVlX2lmX25vX3BhdGgiCiAgcGF0aF9zZWxlY3RvciAicm91bmQtcm9iaW4gMCIKICBub19wYXRoX3JldHJ5IDEwCn0KICBibGFja2xpc3Qgewp9Cg==
```

Use the base64 encoded string output in the following `MachineConfig` yaml file (under source section)

```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: 99-workers-multipath-conf-default
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 3.4.0
    storage:
      files:
      - contents:
          source: data:text/plain;charset=utf-8;base64,ZGVmYXVsdHMgewogIHVzZXJfZnJpZW5kbHlfbmFtZXMgeWVzCiAgZmluZF9tdWx0aXBhdGhzIHllcwogIHBhdGhfZ3JvdXBpbmdfcG9saWN5IG11bHRpYnVzCiAgcGF0aF9jaGVja2VyIHR1cgogIGZlYXR1cmVzICIxIHF1ZXVlX2lmX25vX3BhdGgiCiAgcGF0aF9zZWxlY3RvciAicm91bmQtcm9iaW4gMCIKICBub19wYXRoX3JldHJ5IDEwCn0KICBibGFja2xpc3Qgewp9Cg==
          verification: {}
        filesystem: root
        mode: 400
        path: /etc/multipath.conf
```

After deploying this`MachineConfig` object, CoreOS will start the multipath service automatically.
Alternatively, you can check the status of the multipath service by running the following command on each worker node.
`sudo multipath -ll`

Refer to the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for more information.

{{< /collapse >}}

{{< markdownify >}}

{{< /markdownify >}}
{{< /tab >}}
{{% tab header="PowerPath" lang="en" %}} 

### PowerPath for Linux requirements

The CSI Driver for Dell PowerMax supports PowerPath for Linux. Configure Linux PowerPath before installing the CSI Driver.

Follow this procedure to set up PowerPath for Linux:

- All the nodes must have the PowerPath package installed . Download the PowerPath archive for the environment from [Dell Online Support](https://www.dell.com/support/home/en-in/product-support/product/powerpath-for-linux/drivers).
- `Untar` the PowerPath archive, Copy the RPM package into a temporary folder and Install PowerPath using `rpm -ivh DellEMCPower.LINUX-<version>-<build>.<platform>.x86_64.rpm`
- Start the PowerPath service using `systemctl start PowerPath`

>Note: Do not install Dell PowerPath if multi-path software is already installed, as they cannot co-exist with native multi-path software. 
{{% /tab %}}



{{< /tabpane >}}   


### Replication Requirements (Optional)

Applicable only if you decided to enable the Replication feature in `my-powermax-settings.yaml`

```yaml
replication:
  enabled: true
```
#### Replication CRD's

The CRDs for replication can be obtained and installed from the csm-replication project on Github. Use `csm-replication/deploy/replicationcrds.all.yaml` located in the csm-replication git repo for the installation.

CRDs should be configured during replication prepare stage with repctl as described in [install-repctl](../../../../../getting-started/installation/kubernetes/powermax/helm/csm-modules/replication/install-repctl/) 

