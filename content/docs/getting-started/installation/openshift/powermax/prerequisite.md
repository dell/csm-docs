---
title: "Prerequisite"
linkTitle: "Prerequisite"
weight: 1
Description: >

--- 

## Prerequisites

The following requirements must be met before installing the CSI Driver for PowerMax:

- A Kubernetes or OpenShift cluster (see [supported versions](../../../../csidriver/#features-and-capabilities)).
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
- Auto RDM for vSphere over FC requirements

### CSI PowerMax Reverse Proxy

The CSI PowerMax Reverse Proxy is a component that will be installed with the CSI PowerMax driver. For more details on this feature, see the related [documentation](../../../../csidriver/features/powermax/#csi-powermax-reverse-proxy).

Create a TLS secret that holds an SSL certificate and a private key. This is required by the reverse proxy server.
Use a tool such as `openssl` to generate this secret using the example below:

```bash
openssl genrsa -out tls.key 2048
openssl req -new -x509 -sha256 -key tls.key -out tls.crt -days 3650
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


**Cluster requirments**

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
{{% tab header="Auto RDM" lang="en" %}} 

### Auto RDM for vSphere over FC requirements

The CSI Driver for Dell PowerMax supports auto RDM for vSphere over FC. These requirements are applicable for the clusters deployed on ESX/ESXi using virtualized environement.

Set up the environment as follows:

- Requires VMware vCenter management software to manage all ESX/ESXis where the cluster is hosted.

- Add all FC array ports zoned to the ESX/ESXis to a port group where the cluster is hosted .

- Add initiators from all ESX/ESXis to a host(initiator group)/host group(cascaded initiator group) where the cluster is hosted.
- Create a secret which contains vCenter privileges. Follow the steps [here](#support-for-auto-rdm-for-vsphere-over-fc) to create the same. 
{{% /tab %}}
{{< /tabpane >}}   

{{< tabpane text=true lang="en" >}}
{{% tab header="Linux Multipathing" lang="en" %}}

### Linux Multipathing Requirements

Dell PowerMax supports Linux multipathing (DM-MPIO) and NVMe native multipathing. Configure Linux multipathing before installing the CSI Driver.

> For NVMe connectivity native NVMe multipathing is used. The following sections apply only for iSCSI and Fiber Channel connectivity.

Configure Linux multipathing as follows:
- Ensure that all nodes have the _Device Mapper Multipathing_ package installed.
  You can install it by running `dnf install device-mapper-multipath` or `apt install multipath-tools` based on your Linux distribution.
- Ensure that the multipath command `mpathconf` is available on all Kubernetes nodes.
- Enable multipathing using the `mpathconf --enable --with_multipathd y` command.  A default configuration file, `/etc/multipath.conf` is created.
- Enable `user_friendly_names` and `find_multipaths` in the `multipath.conf` file.
- As a best practice, use these options to help the operating system and the mulitpathing software detect path changes efficiently:

```text
path_grouping_policy multibus
path_checker tur
features "1 queue_if_no_path"
path_selector "round-robin 0"
no_path_retry 10
```

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
{{% /tab %}}

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

### Volume Snapshot Requirements (Optional for Helm)
  For detailed snapshot setup procedure, [click here.](../../../../../snapshots/#optional-volume-snapshot-requirements)

### Replication Requirements (Optional for Helm)

Applicable only if you decided to enable the Replication feature in `my-powermax-settings.yaml`

```yaml
replication:
  enabled: true
```
#### Replication CRD's

The CRDs for replication can be obtained and installed from the csm-replication project on Github. Use `csm-replication/deploy/replicationcrds.all.yaml` located in the csm-replication git repo for the installation.

CRDs should be configured during replication prepare stage with repctl as described in [install-repctl](../../../../../deployment/helm/modules/installation/replication/install-repctl) 


<!--
The following requirements must be met before installing CSI Driver for Dell PowerMax:
- Install Kubernetes or OpenShift (see [supported versions](../../../../../csidriver/#features-and-capabilities))
- Fibre Channel requirements
- iSCSI requirements
- NFS requirements
- NVMeTCP requirements
- Auto RDM for vSphere over FC requirements
- Certificate validation for Unisphere REST API calls
- Mount propagation is enabled on container runtime that is being used
- Linux multipathing requirements
- If using Snapshot feature, satisfy all Volume Snapshot requirements
- If enabling CSM for Authorization, please refer to the [Authorization deployment steps](../../../../../deployment/helm/modules/installation/authorization-v2.0/) first
- If using Powerpath , install the PowerPath for Linux requirements

### Prerequisite for CSI Reverse Proxy

CSI PowerMax Reverse Proxy is an HTTPS server and has to be configured with an SSL certificate and a private key.

The certificate and key are provided to the proxy via a Kubernetes TLS secret (in the same namespace). The SSL certificate must be an X.509 certificate encoded in PEM format. The certificates can be obtained via a Certificate Authority or can be self-signed and generated by a tool such as openssl.

Starting from v2.7.0 , these secrets will be created automatically using the following tls.key and tls.cert contents provided in my-powermax-settings.yaml file.
For this , we need to install cert-manager using below command which manages the certs and secrets  .

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.11.0/cert-manager.yaml
```
Here is an example showing how to generate a private key and use that to sign an SSL certificate using the openssl tool:

```bash
openssl genrsa -out tls.key 2048
openssl req -new -x509 -sha256 -key tls.key -out tls.crt -days 3650
``` 

{{< tabpane text=true lang="en">}}
{{% tab header="Fibre Channel" lang="en" %}} 

### Fibre Channel Requirements 

CSI Driver for Dell PowerMax supports Fibre Channel communication. Ensure that the following requirements are met before you install CSI Driver:
- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port director must be completed.
- Ensure that the HBA WWNs (initiators) appear on the list of initiators that are logged into the array.
- If the number of volumes that will be published to nodes is high, then configure the maximum number of LUNs for your HBAs on each node. See the appropriate HBA document to configure the maximum number of LUNs.
{{% /tab %}}
{{% tab header="iSCSI" %}}
  ### iSCSI Requirements

The CSI Driver for Dell PowerMax supports iSCSI connectivity. These requirements are applicable for the nodes that use iSCSI initiator to connect to the PowerMax arrays.

Set up the iSCSI initiators as follows:
- All Kubernetes nodes must have the _iscsi-initiator-utils_ package installed.
- Ensure that the iSCSI initiators are available on all the nodes where the driver node plugin will be installed.
- Kubernetes nodes should have access (network connectivity) to an iSCSI director on the Dell PowerMax array that has IP interfaces. Manually create IP routes for each node that connects to the Dell PowerMax if required.
- Ensure that the iSCSI initiators on the nodes are not a part of any existing Host (Initiator Group) on the Dell PowerMax array.
- The CSI Driver needs the port group names containing the required iSCSI director ports. These port groups must be set up on each Dell PowerMax array. All the port group names supplied to the driver must exist on each Dell PowerMax with the same name.

For more information about configuring iSCSI, see [Dell Host Connectivity guide](https://www.delltechnologies.com/asset/zh-tw/products/storage/technical-support/docu5128.pdf).
{{% /tab %}}
  {{% tab header="NFS" %}}
  ### NFS requirements

CSI Driver for Dell PowerMax supports NFS communication. Ensure that the following requirements are met before you install CSI Driver:
- Configure the NFS network. Please refer [here](https://dl.dell.com/content/manual57826791-dell-powermax-file-protocol-guide.pdf?language=en-us&ps=true) for more details.
- PowerMax Embedded Management guest to access Unisphere for PowerMax.
- Create the NAS server. Please refer [here](https://dl.dell.com/content/manual55638050-dell-powermax-file-quick-start-guide.pdf?language=en-us&ps=true) for more details.
  {{% /tab %}} 
{{% tab header = "NVMeTCP"%}} 
### NVMeTCP requirements
If you want to use the protocol, set up the NVMe initiators as follows:
- Setup on Array <br>
Once the NVMe endpoint is created on the array, follow the following step to update endpoint name to adhere with CSI driver.
  - Perform a  ```nvme discover --transport=tcp --traddr=<InterfaceAdd> --trsvcid=4420```. <InterfaceAdd> is the placeholder for actual IP address of NVMe Endpoint.
  - Fetch the _subnqn_, for e.g.,  _nqn.1988-11.com.dell:PowerMax_2500:00:000120001100_, this will be used as the subnqn holder while updating NVMe endpoint name.
  - Update the NVMe endpoint name as ```<subnqn>:<dir><port>>```. Here is an example how it should look, _nqn.1988-11.com.dell:PowerMax_2500:00:000120001100:OR1C000_
- Setup on Host
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
- Generate and update the _/etc/nvme/hostnqn_ with hostNQN details.
{{% /tab %}} 
{{< /tabpane >}}




### Auto RDM for vSphere over FC requirements

The CSI Driver for Dell PowerMax supports auto RDM for vSphere over FC. These requirements are applicable for the clusters deployed on ESX/ESXi using virtualized environement.

Set up the environment as follows:

- Requires VMware vCenter management software to manage all ESX/ESXis where the cluster is hosted.

- Add all FC array ports zoned to the ESX/ESXis to a port group where the cluster is hosted .

- Add initiators from all ESX/ESXis to a host(initiator group) where the cluster is hosted.

- Edit `samples/secret/vcenter-secret.yaml` file, to point to the correct namespace, and replace the values for the username and password parameters.
  These values can be obtained using base64 encoding as described in the following example:
    ```bash
    echo -n "myusername" | base64
    echo -n "mypassword" | base64
    ```
  where *myusername* and *mypassword* are credentials for a user with vCenter privileges.

Create the secret by running the below command,
```bash
kubectl create -f samples/secret/vcenter-secret.yaml
```

### Certificate validation for Unisphere REST API calls

As part of the CSI driver installation, the CSI driver requires a secret with the name _powermax-certs_ present in the namespace _powermax_. This secret contains the X509 certificates of the CA which signed the Unisphere SSL certificate in PEM format. This secret is mounted as a volume in the driver container. In earlier releases, if the install script did not find the secret, it created an empty secret with the same name. From the 1.2.0 release, the secret volume has been made optional. The install script no longer attempts to create an empty secret.

The CSI driver exposes an install parameter `skipCertificateValidation` which determines if the driver performs client-side verification of the Unisphere certificates. The `skipCertificateValidation` parameter is set to _true_ by default, and the driver does not verify the Unisphere certificates.

If the `skipCertificateValidation` parameter is set to _false_ and a previous installation attempt created an empty secret, then this secret must be deleted and re-created using the CA certs.

If the Unisphere certificate is self-signed or if you are using an embedded Unisphere, then perform the following steps:
1. To fetch the certificate, run
   ```bash
   openssl s_client -showcerts -connect [Unisphere IP]:8443 </dev/null 2> /dev/null | openssl x509 -outform PEM > ca_cert.pem
   ```

   *NOTE*: The IP address varies for each user.

2. To create the secret, run
   ```bash
   kubectl create secret generic powermax-certs --from-file=ca_cert.pem -n powermax
   ```

### Ports in the port group

There are no restrictions to how many ports can be present in the iSCSI port groups provided to the driver.

The same applies to Fibre Channel where there are no restrictions on the number of FA directors a host HBA can be zoned to. See the best practices for host connectivity to Dell PowerMax to ensure that you have multiple paths to your data volumes. 
{{< tabpane text=true lang="en">}}
{{% tab header="Multipath"%}}
### Linux multipathing requirements

CSI Driver for Dell PowerMax supports Linux multipathing. Configure Linux multipathing before installing the CSI Driver.

Set up Linux multipathing as follows:

- All the nodes must have the _Device Mapper Multipathing_ package installed.
  *NOTE:* When this package is installed it creates a multipath configuration file which is located at `/etc/multipath.conf`. Please ensure that this file always exists.
- Enable multipathing using `mpathconf --enable --with_multipathd y`
- Enable `user_friendly_names` and `find_multipaths` in the `multipath.conf` file.

As a best practice, use the following options to help the operating system and the mulitpathing software detect path changes efficiently:
```text
path_grouping_policy multibus
path_checker tur
features "1 queue_if_no_path"
path_selector "round-robin 0"
no_path_retry 10
```
#### multipathd `MachineConfig`

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
{{%/tab%}} 
{{%tab header="Powerpath"%}} 
### PowerPath for Linux requirements

CSI Driver for Dell PowerMax supports PowerPath for Linux. Configure Linux PowerPath before installing the CSI Driver.

Set up the PowerPath for Linux as follows:

- All the nodes must have the PowerPath package installed . Download the PowerPath archive for the environment from [Dell Online Support](https://www.dell.com/support/home/en-in/product-support/product/powerpath-for-linux/drivers).
- `Untar` the PowerPath archive, Copy the RPM package into a temporary folder and Install PowerPath using
   ```bash
    rpm -ivh DellEMCPower.LINUX-<version>-<build>.<platform>.x86_64.rpm
   ```
- Start the PowerPath service using
  ```bash
   systemctl start PowerPath
  ```
>Note: Do not install Dell PowerPath if multi-path software is already installed, as they cannot co-exist with native multi-path software.
{{%/tab%}}
{{</tabpane>}}

### (Optional) Volume Snapshot Requirements
  For detailed snapshot setup procedure, [click here.](../../../../../snapshots/#optional-volume-snapshot-requirements)

### (Optional) Replication feature Requirements

Applicable only if you decided to enable the Replication feature in `my-powermax-settings.yaml`

```yaml
replication:
  enabled: true
```
#### Replication CRD's

The CRDs for replication can be obtained and installed from the csm-replication project on Github. Use `csm-replication/deploy/replicationcrds.all.yaml` located in the csm-replication git repo for the installation.

CRDs should be configured during replication prepare stage with repctl as described in [install-repctl](../../../../../deployment/helm/modules/installation/replication/install-repctl)
--> 