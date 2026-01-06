---
title: Prerequisites
linkTitle: Prerequisites
weight: 1
description: >
  Prerequisites for installing the PowerFlex CSI Driver
---

The following requirements must be met before installing the CSI Driver for Dell PowerFlex:

- Install Kubernetes cluster (see [supported versions](../../../../../supportmatrix/_index.md#container-orchestrator-platforms))
- Enable Zero Padding on PowerFlex (see [details below](#enable-zero-padding-on-powerflex))
- Mount propagation is enabled on container runtime that is being used
- If using Snapshot feature, satisfy all Volume Snapshot requirements
- A user must exist on the array with a role _>= FrontEndConfigure_
- If enabling CSM for Authorization, please refer to the Authorization deployment steps first
- If multipath is configured, ensure CSI-PowerFlex volumes are blacklisted by multipathd. See [troubleshooting section](../../../../../concepts/csidriver/troubleshooting/powerflex) for details
- For NVMe support the preferred multipath solution is NVMe native multipathing. The Dell Host Connectivity Guide describes the details of each configuration option.
- Secure boot is not supported; ensure that secure boot is disabled in the BIOS.

{{< tabpane text=true lang="en" >}}

{{% tab header="SDC" lang="en" %}}

### SDC Support

The CSI Driver for PowerFlex requires you to have installed the PowerFlex Storage Data Client (SDC) on all Kubernetes nodes which run the node portion of the CSI driver.

SDC could be installed automatically by CSI driver install on Kubernetes nodes with OS platform which support automatic SDC deployment; for Red Hat CoreOS (RHCOS) and RHEL. On Kubernetes nodes with OS version not supported by automatic install, you must perform the Manual SDC Deployment steps [below](#manual-deployment).

Refer to https://quay.io/repository/dell/storage/powerflex/sdc for supported OS versions. 

Please visit [E-Lab Navigator](https://elabnavigator.dell.com/eln/modernHomeSSM) for specific Dell Storage platform host operating system level support matrices.

> **Note**: For NVMe/TCP, SDC must be disabled. If SDC is enabled, it takes precedence over NVMe/TCP and the driver will treat the node as an SDC node.

#### **SDC Deployment Options**

##### **Automatic Deployment**
To install CSI driver for Powerflex with automated SDC deployment, you need below two packages on worker nodes.
- `libaio`
- `numactl-libs`

**Optional:** For a typical install, you will pull SDC kernel modules from the Dell FTP site, which is set up by default. Some users might want to mirror this repository to a local location. The [PowerFlex KB article](https://www.dell.com/support/kbdoc/en-us/000184206/how-to-use-a-private-repository-for) has instructions on how to do this.

**For Helm:**
*   SDC deployment is enabled by default.
*   To disable SDC (e.g., for NVMe/TCP), set `sdc.enabled` to `false` in `myvalues.yaml`.

**For CSM Operator:**
*   **Enable/Disable SDC:** Set the `X_CSI_SDC_ENABLED` value in the CR file to `true` (default) or `false`.
*   **MDM Value:** The operator sets the MDM value for initContainers in the driver CR from the `mdm` attributes in `config.yaml`. Do not set this manually.
*   **SDC Monitor:** Enable the SDC monitor by setting the `enabled` flag to `true` in the sidecar configuration.
    *   **With Sidecar**: Edit the `HOST_PID` and `MDM` fields with the host PID and MDM IPs.
    *   **Without Sidecar**: Leave the `enabled` field set to `false`.

    Example Sidecar config:
    ```yaml
    sideCars:
    # sdc-monitor is disabled by default, due to high CPU usage
      - name: sdc-monitor
        enabled: false
        image: quay.io/dell/storage/powerflex/sdc:4.5.4
        envs:
         - name: HOST_PID
          value: "1"
        - name: MDM
          value: "10.xx.xx.xx,10.xx.xx.xx" #provide the same MDM value from secret
    ```

##### **Manual Deployment**

For operating systems not supported by automatic installation, or if you prefer to manage SDC manually:
*   Refer to [Quay](https://quay.io/repository/dell/storage/powerflex/sdc) for supported OS versions.
*   **Manual SDC Deployment Steps**:
    1.  **Download SDC:** Download the PowerFlex SDC from [Dell Online support](https://www.dell.com/support). The filename is `EMC-ScaleIO-sdc-*.rpm`, where `*` is the SDC name corresponding to the PowerFlex installation version.
    2.  **Set MDM IPs:** Export the shell variable `MDM_IP` in a comma-separated list:
        ```bash
        export MDM_IP=xx.xxx.xx.xx,xx.xxx.xx.xx
        ```
        where `xxx` represents the actual IP address in your environment.
    3.  **Install SDC:** Install the SDC per the _Dell PowerFlex Deployment Guide_. For Red Hat Enterprise Linux, run:
        ```bash
        rpm -iv ./EMC-ScaleIO-sdc-*.x86_64.rpm
        ```
        Replace `*` with the SDC name corresponding to the PowerFlex installation version.
    4.  **Multi-Array Support:** To add more `MDM_IP` for multi-array support, run:
        ```bash
        /opt/emc/scaleio/sdc/bin/drv_cfg --add_mdm --ip 10.xx.xx.xx.xx,10.xx.xx.xx
        ```
{{% /tab %}}
{{% tab header="NVMeTCP" lang="en" %}}

### NVMeTCP Requirements

The following requirements must be fulfilled in order to successfully use the NVMe protocols with the CSI PowerFlex driver:

- All Kubernetes nodes connecting to Dell storage arrays must use unique host NVMe Qualified Names (NQNs).

- The driver requires the NVMe command-line interface (nvme-cli) to manage the NVMe clients and targets. The NVMe CLI tool is installed in the host using the following command on RPM oriented Linux distributions.

  ```bash
  sudo dnf -y install nvme-cli
  ```
<br>

- Modules including the nvme, nvme_core, nvme_fabrics, and nvme_tcp are required for using NVMe over Fabrics using TCP. Load the NVMe and NVMe-OF Modules using the below commands:
  ```bash
  modprobe nvme
  modprobe nvme_tcp
  ``` 
  <br>

- The NVMe modules may not be available after a node reboot. Loading the modules at startup is recommended.

- Support for NVMe requires native NVMe multipathing to be configured on each worker node in the cluster. Please refer to the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for more details on NVMe multipathing requirements. To determine if the worker nodes are configured for native NVMe multipathing run the following command on each worker node:

  ```bash
  cat /sys/module/nvme_core/parameters/multipath
  ```

  >If the result of the command displays Y then NVMe native multipathing is enabled in the kernel. If the output is N then native NVMe multipating is disabled. Consult the [Dell Host Connectivity Guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for Linux to enable native NVMe multipathing.

**Configure the IO policy**

- The default NVMeTCP native multipathing policy is "numa". The preferred IO policy for NVMe devices used for PowerFlex is round-robin. You can use udev rules to enable the round robin policy on all worker nodes. To view the IO policy you can use the following command:
  - Find your NVMe subsystem name(s)
    ```bash
    nvme list-subsys
    ```
  - Check the I/O policy for a specific subsystem
    ```bash
    cat /sys/class/nvme-subsystem/<subsystem-name>/iopolicy
    ``` 
- To change the IO policy to round-robin you can add a udev rule on each worker node. Place a config file in /etc/udev/rules.d with the name 71-nvme-io-policy.rules with the following contents:

  ```text
  ACTION=="add|change", SUBSYSTEM=="nvme-subsystem", ATTR{iopolicy}="round-robin"
  ```

  In order to change the rules on a running kernel you can run the following commands:

  ```bash
  /sbin/udevadm control --reload-rules
  /sbin/udevadm trigger --type=devices --action=change
  ``` 
<br> 
{{% /tab %}}
{{% tab header="NFS" lang="en" %}}

### NFS Requirements

- Ensure that your nodes support mounting NFS volumes if using NFS.

{{% /tab %}}
{{< /tabpane >}}

### Installation Wizard prerequisite, secret update:
When the driver is installed using values generated by installation wizard, then the user needs to update the secret for driver by patching the MDM keys, as follows:
```bash
echo -n '<MDM_IPS>' | base64
kubectl patch secret vxflexos-config -n vxflexos -p "{\"data\": { \"MDM\": \"<GENERATED_BASE64>\"}}"
```

### Enable Zero Padding on PowerFlex

Verify that zero padding is enabled on the PowerFlex storage pools that will be used. Use PowerFlex GUI or the PowerFlex CLI to check this setting. For more information to configure this setting, see [Dell PowerFlex documentation](https://www.dell.com/support/manuals/en-us/scaleio/pfx_powerflex_config_customize_3.6.x/enable-or-disable-zero-padding-policy?guid=guid-d32bdff7-3014-4894-8e1e-2a31a86d343a&lang=en-us).

### Volume Snapshot Requirements
For detailed snapshot setup procedure, [click here.](docs/concepts/snapshots/#helm-optional-volume-snapshot-requirements)
