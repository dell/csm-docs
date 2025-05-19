---
title: 'Prerequisite'
linkTitle: 'Prerequisite'
weight: 1
Description: >
---

<hr>

The following requirements must be met before installing the CSI Driver for
PowerMax:

- A Kubernetes or OpenShift cluster (see
  [supported versions](../../../../../concepts/csidriver/#features-and-capabilities)).
- A PowerMax system managed by a Unisphere instance with software version 10.0
  or later.
- If enabling CSM for Authorization, please refer to the Authorization
  deployment steps first
- If enabling CSM Replication, both source and target storage systems must be
  locally managed by Unisphere.
  - _Example_: When using two Unisphere instances, the first Unisphere instance
    should be configured with the source storage system as locally managed and
    target storage system as remotely managed. The second Unisphere
    configuration should mirror the first — locally managing the target storage
    system and remotely managing the source storage system.
- Refer to the sections below for protocol specific requirements.
- For NVMe support the preferred multipath solution is NVMe native multipathing.
  The
  [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf)
  describes the details of each configuration option.
- Linux multipathing requirements (described later).
- PowerPath for Linux requirements (described later).
- Mount propagation is enabled on the container runtime that is being used.
- If using Snapshot feature, satisfy all Volume Snapshot requirements.
- Insecure registries are defined in Docker or other container runtime for CSI
  drivers that are hosted in a non-secure location.
- Ensure that your nodes support mounting NFS volumes if using NFS.
- Auto RDM for vSphere over FC requirements

### CSI PowerMax Reverse Proxy

The CSI PowerMax Reverse Proxy is a component that will be installed with the
CSI PowerMax driver. For more details on this feature, see the related
[documentation](../../../../../concepts/csidriver/features/powermax/#csi-powermax-reverse-proxy).

Create a TLS secret that holds an SSL certificate and a private key. This is
required by the reverse proxy server.

Create the Configuration file (openssl.cnf) which includes the subjectAltName:

```bash
[ req ]
default_bits       = 2048
distinguished_name = req_distinguished_name
req_extensions     = req_ext
prompt             = no
[ req_distinguished_name ]
C  = XX
L  = Default City
O  = Default Company Ltd
[ req_ext ]
subjectAltName = @alt_names
[ alt_names ]
DNS.1 = "csipowermax-reverseproxy"
IP.1 = "0.0.0.0"
```

Use a tool such as `openssl` to generate this secret using the example below:

```bash
openssl genrsa -out tls.key 2048
openssl req -new -key tls.key -out tls.csr -config openssl.cnf
openssl x509 -req -in tls.csr -signkey tls.key -out tls.crt -days 3650 -extensions req_ext -extfile openssl.cnf
kubectl create secret -n <namespace> tls csirevproxy-tls-secret --cert=tls.crt --key=tls.key
```

{{< tabpane text=true lang="en" >}} {{% tab header="Fibre Channel" lang="en" %}}

### Fibre Channel Requirements

The following requirements must be fulfilled in order to successfully use the
Fiber Channel protocol with the CSI PowerMax driver:

- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port director must
  be completed.
- Ensure that the HBA WWNs (initiators) appear on the list of initiators that
  are logged into the array.
- If the number of volumes that will be published to nodes is high, then
  configure the maximum number of LUNs for your HBAs on each node. See the
  appropriate HBA document to configure the maximum number of LUNs. {{% /tab %}}

{{% tab header="iSCSI" lang="en" %}}

### iSCSI Requirements

The following requirements must be fulfilled in order to successfully use the
iSCSI protocol with the CSI PowerMax driver.

- Ensure that the necessary iSCSI initiator utilities are installed on each
  Kubernetes worker node. This typically includes the _iscsi-initiator-utils_
  package for RHEL or _open-iscsi_ package for Ubuntu.
- Enable and start the _iscsid_ service on each Kubernetes worker node. This
  service is responsible for managing the iSCSI initiator. You can enable the
  service by running the following command on all worker nodes:
  `systemctl enable --now iscsid`
- Ensure that the unique initiator name is set in
  _/etc/iscsi/initiatorname.iscsi_.
- Ensure that the iSCSI initiators are available on all the nodes where the
  driver node plugin will be installed.
- Ensure that the unique initiator name is set in
  _/etc/iscsi/initiatorname.iscsi_.
- If your worker nodes are running Red Hat CoreOS, make sure that automatic
  iSCSI login at boot is configured. Please contact RedHat for more details.
- Kubernetes nodes must have network connectivity to an iSCSI director on the
  Dell PowerMax array that has IP interfaces. Manually create IP routes for each
  node that connects to the Dell PowerMax if required.
- Ensure that the iSCSI initiators on the nodes are not a part of any existing
  Host (Initiator Group) on the Dell PowerMax array.
- The CSI Driver needs the port group name containing the required iSCSI
  director ports. These port groups must be set up on each Dell PowerMax array.
  All the port group names supplied to the driver must exist on each Dell
  PowerMax with the same name.

Refer to the
[Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf)
for more information. {{% /tab %}}

{{% tab header="NVMe" lang="en" %}}

### NVMe Requirements

The following requirements must be fulfilled in order to successfully use the
NVMe/TCP protocols with the CSI PowerMax driver:

- Modules including the nvme, nvme_core, nvme_fabrics, and nvme_tcp are required
  for using NVMe over Fabrics using TCP. Load the NVMe and NVMe-OF Modules using
  the below commands:
  ```bash
  modprobe nvme
  modprobe nvme_tcp
  ```
  <br>
- The NVMe modules may not be available after a node reboot. Loading the modules
  at startup is recommended.

> Starting with OCP 4.14 NVMe/TCP is enabled by default on RCOS nodes.

**Cluster requirements**

- The driver requires the NVMe command-line interface (nvme-cli) to manage the
  NVMe clients and targets. The NVMe CLI tool is installed in the host using the
  following command on RPM oriented Linux distributions.

  ```bash
  sudo dnf -y install nvme-cli
  ```

  <br>

- Support for NVMe requires native NVMe multipathing to be configured on each
  worker node in the cluster. Please refer to the
  [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf)
  for more details on NVMe multipathing requirements. To determine if the worker
  nodes are configured for native NVMe multipathing run the following command on
  each worker node:

  ```bash
  cat /sys/module/nvme_core/parameters/multipath
  ```

> If the result of the command displays Y then NVMe native multipathing is
> enabled in the kernel. If the output is N then native NVMe multipating is
> disabled. Consult the
> [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf)
> for Linux to enable native NVMe multipathing.

**Configure the IO policy**

- The default NVMeTCP native multipathing policy is "numa". The preferred IO
  policy for NVMe devices used for PowerMax is round-robin. You can use udev
  rules to enable the round robin policy on all worker nodes. To view the IO
  policy you can use the following command:

  ```bash
  nvme list-subsys
  ```

To change the IO policy to round-robin you can add a udev rule on each worker
node. Place a config file in /etc/udev/rules.d with the name
71-nvme-io-policy.rules with the following contents:

```text
ACTION=="add|change", SUBSYSTEM=="nvme-subsystem", ATTR{iopolicy}="round-robin"
```

<br> 
In order to change the rules on a running kernel you can run the following commands:

```bash
/sbin/udevadm control --reload-rules
/sbin/udevadm trigger --type=devices --action=change
```

**Array requirements**

Once the NVMe endpoint is created on the array, follow the following steps to
update the endpoint name to adhere to the CSI driver requirements.

- Run `nvme discover --transport=tcp --traddr=<InterfaceAdd> --trsvcid=4420`.
  <InterfaceAdd> is the placeholder for actual IP address of NVMe Endpoint.
- Fetch the _subnqn_, for e.g.,
  _nqn.1988-11.com.dell:PowerMax_2500:00:000120001100_, this will be used as the
  subnqn holder while updating NVMe endpoint name.
- Update the NVMe endpoint name as `<subnqn>:<dir><port>>`. Here is an example
  how it should look,
  _nqn.1988-11.com.dell:PowerMax_2500:00:000120001100:OR1C000_ {{% /tab %}}

{{% tab header="NFS" lang="en" %}}

### NFS Requirements

CSI Driver for Dell PowerMax supports NFS communication. Ensure that the
following requirements are met before you install CSI Driver:

- Configure the NFS network. Please refer
  [here](https://dl.dell.com/content/manual57826791-dell-powermax-file-protocol-guide.pdf?language=en-us&ps=true)
  for more details.
- PowerMax Embedded Management guest to access Unisphere for PowerMax.
- Create the NAS server. Please refer
  [here](https://dl.dell.com/content/manual55638050-dell-powermax-file-quick-start-guide.pdf?language=en-us&ps=true)
  for more details. {{% /tab %}} {{% tab header="Auto RDM" lang="en" %}}

### Auto RDM for vSphere over FC requirements

The CSI Driver for Dell PowerMax supports auto RDM for vSphere over FC. These
requirements are applicable for the clusters deployed on ESX/ESXi using
virtualized environment.

Set up the environment as follows:

- Requires VMware vCenter management software to manage all ESX/ESXis where the
  cluster is hosted.

- Add all FC array ports zoned to the ESX/ESXis to a port group where the
  cluster is hosted .

- Add initiators from all ESX/ESXis to a host(initiator group)/host
  group(cascaded initiator group) where the cluster is hosted.
- Create a secret which contains vCenter privileges. Follow the steps
  [here](#support-for-auto-rdm-for-vsphere-over-fc) to create the same.

### Support for auto RDM for vSphere over FC

This feature is introduced in CSI Driver for PowerMax version 2.5.0.

Support for auto RDM for vSphere over FC feature is optional and by default this
feature is disabled for drivers when installed via CSM operator.

1. To enable this feature, set `X_CSI_VSPHERE_ENABLED` to `true` in the driver
   manifest under controller and node section.

   ```yaml
   # VMware/vSphere virtualization support
   # set X_CSI_VSPHERE_ENABLED to true, if you to enable VMware virtualized environment support via RDM
   # Allowed values:
   #   "true" - vSphere volumes are enabled
   #   "false" - vSphere volumes are disabled
   # Default value: "false"
   - name: 'X_CSI_VSPHERE_ENABLED'
     value: 'false'
   # X_CSI_VSPHERE_PORTGROUP: An existing portGroup that driver will use for vSphere
   # recommended format: csi-x-VC-PG, x can be anything of user choice
   # Allowed value: valid existing port group on the array
   # Default value: "" <empty>
   - name: 'X_CSI_VSPHERE_PORTGROUP'
     value: ''
   # X_CSI_VSPHERE_HOSTNAME: An existing host(initiator group)/ host group(cascaded initiator group) that driver will use for vSphere
   # this host/host group should contain initiators from all the ESXs/ESXi host where the cluster is deployed
   # recommended format: csi-x-VC-HN, x can be anything of user choice
   # Allowed value: valid existing host(initiator group)/ host group(cascaded initiator group) on the array
   # Default value: "" <empty>
   - name: 'X_CSI_VSPHERE_HOSTNAME'
     value: ''
   ```

2. Edit the `Secret` file vcenter-creds
   [here](https://github.com/dell/csi-powermax/blob/main/samples/secret/vcenter-secret.yaml)
   with required values. Example:
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: vcenter-creds
     # Set driver namespace
     namespace: powermax
   type: Opaque
   data:
     # set username to the base64 encoded username
     username: YWRtaW4=
     # set password to the base64 encoded password
     password: YWRtaW4=
   ```
   These values can be obtained using base64 encoding as described in the
   following example:

    ```bash
    echo -n "myusername" | base64
    echo -n "mypassword" | base64
    ```

    where _myusername_ and _mypassword_ are credentials for a user with vCenter
    privileges.

3. Run following command to create the configmap

      ```bash
      kubectl create -f vcenter-secret.yaml
      ```

      > Note: The name of the secret should always be `vcenter-creds`.

{{% /tab %}} {{< /tabpane >}}

Choose your multipathing software between
[Multipath](#linux-multipathing-requirements) &
[PowerPath](#powerpath-for-linux-requirements)

{{< tabpane text=true lang="en" >}}
{{< tab header="Linux Multipathing" lang="en" >}} {{< markdownify >}}

### Linux Multipathing Requirements

Configure Linux multipathing before installing the CSI Driver.

**Supported Multipathing.**

- Dell PowerMax supports Linux multipathing (DM-MPIO) and NVMe native
  multipathing.
- Configure Linux multipathing before installing the CSI Driver.

{{< /markdownify >}}

{{< collapse id="1" title="NVMe" >}}For NVMe connectivity native NVMe
multipathing is used.{{< /collapse >}} <br>
{{< collapse id="2" title="FC/iSCSI" >}}

1. Configuration steps:

   - Install the Device Mapper Multipathing package on all nodes:
     - `dnf install device-mapper-multipath`
     - `apt install multipath-tools`
   - Ensure the `mpathconf` command is available on all Kubernetes nodes.
   - Enable multipathing: `mpathconf --enable --with_multipathd y`
   - Edit `/etc/multipath.conf` to enable `user_friendly_names` and
     `find_multipaths`.

<br>

2.  Best Practices

    Use these options in multipath.conf for efficient path detection:


          path_grouping_policy multibus
          path_checker tur
          features "1 queue_if_no_path"
          path_selector "round-robin 0"
          no_path_retry 10

    <br>
    The following is a sample multipath.conf file. You may have to adjust these values based on your environment.
    <br>

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


    On some distributions the multipathd service for changes to the configuration
    and dynamically reconfigures itself. If you need to manually trigger a reload
    you can run the following command: `sudo systemctl reload multipathd`

{{< /collapse >}}

{{< markdownify >}}

{{< /markdownify >}} {{< /tab >}}

{{% tab header="PowerPath" lang="en" %}}

### PowerPath for Linux requirements

The CSI Driver for Dell PowerMax supports PowerPath for Linux. Configure Linux
PowerPath before installing the CSI Driver.

Follow this procedure to set up PowerPath for Linux:

- All the nodes must have the PowerPath package installed . Download the
  PowerPath archive for the environment from
  [Dell Online Support](https://www.dell.com/support/home/en-in/product-support/product/powerpath-for-linux/drivers).
- `Untar` the PowerPath archive, Copy the RPM package into a temporary folder
  and Install PowerPath using
  `rpm -ivh DellEMCPower.LINUX-<version>-<build>.<platform>.x86_64.rpm`
- Start the PowerPath service using `systemctl start PowerPath`

> Note: Do not install Dell PowerPath if multi-path software is already
> installed, as they cannot co-exist with native multi-path software.
> {{% /tab %}}

{{< /tabpane >}}

### Replication Requirements (Optional)

Applicable only if you decided to enable the Replication feature in
`my-powermax-settings.yaml`

```yaml
replication:
  enabled: true
```

#### Replication CRD's

> **_NOTE:_** As of CSM release 1.14, all Custom Resource Definitions that are
> required for Replication functionality are installed by the CSM Operator
> automatically when a Replication-enabled driver is installed. Manual
> installation is only required when deploying the driver via Helm.

The CRDs for replication can be obtained and installed from the csm-replication
project on Github. Use `csm-replication/deploy/replicationcrds.all.yaml` located
in the [csm-replication repository](https://github.com/dell/csm-replication) for
the installation.

When installing the PowerMax driver via Helm, CRDs should be configured during
replication prepare stage with repctl as described in
[install-repctl](v1/getting-started/installation/helm/modules/replication/install-repctl).

### Certificate validation for Unisphere REST API calls (Optional)

As part of the CSI driver installation, the CSI driver supports an optional
secret that contains the X509 certificates of the CA which signed the Unisphere
SSL certificate in PEM format. This secret is mounted as a volume in the driver
container.

The CSI driver exposes an install parameter `skipCertificateValidation` which
determines if the driver performs client-side verification of the Unisphere
certificates. The `skipCertificateValidation` parameter is set to _true_ by
default, and the driver does not verify the Unisphere certificates.

If the `skipCertificateValidation` parameter is set to _false_ and a previous
installation attempt created an empty secret, then this secret must be deleted
and re-created using the CA certs.

If the Unisphere certificate is self-signed or if you are using an embedded
Unisphere, then perform the following steps:

1. To fetch the certificate, run

   ```bash
   openssl s_client -showcerts -connect [Unisphere IP]:8443 </dev/null 2> /dev/null | openssl x509 -outform PEM > ca_cert.pem
   ```

   _NOTE_: The IP address varies for each user.

2. To create the secret, run

   ```bash
   kubectl create secret generic primary-cert --from-file=cert=ca_cert.pem -n powermax
   ```

   _NOTE_: The above example creates a Secret with name `primary-cert`. Set this
   value in the `certSecret` field during CSI driver installation.
