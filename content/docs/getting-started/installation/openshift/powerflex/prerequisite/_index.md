---
title: "Prerequisite"
linkTitle: "Prerequisite"
weight: 1
Description: >
toc_hide: true
---

The following requirements must be met before installing the CSI Driver for Dell PowerFlex:

- Enable Zero Padding on PowerFlex (see [details below](../prerequisite/#enable-zero-padding-on-powerflex))
- Mount propagation is enabled on container runtime that is being used
- If using Snapshot feature, satisfy all Volume Snapshot requirements
- A user must exist on the array with a role _>= FrontEndConfigure_
- If enabling CSM for Authorization, please refer to the [Authorization deployment steps](docs/getting-started/installation/helm/modules/authorizationv2-0/) first
- If multipath is configured, ensure CSI-PowerFlex volumes are blacklisted by multipathd. See [troubleshooting section](../../../../../concepts/csidriver/troubleshooting/powerflex) for details
- For NVMe support the preferred multipath solution is NVMe native multipathing. The Dell Host Connectivity Guide describes the details of each configuration option.
- Secure boot is not supported; ensure that secure boot is disabled in the BIOS.

{{< tabpane text=true lang="en" >}}

{{% tab header="SDC" lang="en" %}}

### SDC Support

The CSI Driver for PowerFlex requires you to have installed the PowerFlex Storage Data Client (SDC) on all Kubernetes nodes which run the node portion of the CSI driver.

SDC could be installed automatically by CSI driver install on Kubernetes nodes with OS platform which support automatic SDC deployment; for Red Hat CoreOS (RHCOS) and RHEL. On Kubernetes nodes with OS version not supported by automatic install, you must perform the Manual SDC Deployment steps [below](../prerequisite/#manual-deployment).

Refer to https://quay.io/repository/dell/storage/powerflex/sdc for supported OS versions. 

Please visit [E-Lab Navigator](https://elabnavigator.dell.com/eln/modernHomeSSM) for specific Dell Storage platform host operating system level support matrices.

> **Note**: For NVMe/TCP, SDC must be disabled. If SDC is enabled, it takes precedence over NVMe/TCP and the driver will treat the node as an SDC node.

#### **SDC Deployment Options**

##### **Automatic Deployment**
To install CSI driver for Powerflex with automated SDC deployment, you need below two packages on worker nodes.
- `libaio`
- `numactl-libs`
**Optional:** For a typical install, you will pull SDC kernel modules from the Dell FTP site, which is set up by default. Some users might want to mirror this repository to a local location. The [PowerFlex KB article](https://www.dell.com/support/kbdoc/en-us/000184206/how-to-use-a-private-repository-for) has instructions on how to do this.

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

### NVMe/TCP Requirements


   1. Complete the NVMe network configuration to connect the hosts with the PowerFlex Storage array. Please refer <a  href="https://elabnavigator.dell.com/vault/pdf/Linux.pdf" target="_blank" style="font-weight:bold; font-size:0.9rem">Host Connectivity Guide</a> for the best practices for attaching the hosts to a PowerFlex storage array.
    
   <br> 
  
   2. Verify the initiators of each host are logged in to the PowerFlex Storage Array. CSM will perform the Host Registration of each host with the PowerFlex Array.

   <br> 

   3. To ensure successful integration of NVMe protocols with the CSI Driver, the following conditions must be met:
      - Each OpenShift node that connects to Dell storage arrays must have a unique NVMe Qualified Name (NQN).
      - By default, the OpenShift deployment process for CoreOS assigns the same host NQN to all nodes. This value is stored in the file: /etc/nvme/hostnqn.
      - To resolve this and guarantee unique host NQNs across nodes, you can apply a machine configuration to your OpenShift Container Platform (OCP) cluster. One recommended approach is to  add   the following machine config:
      
      <br>
      
      ```yaml
      cat <<EOF > 99-worker-custom-nvme-hostnqn.yaml
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
      EOF
      ```
   <br>
  
   4. Configure IO policy for native NVMe multipathing  

      Use this comment to create the machine configuration to configure the native NVMe multipathing IO Policy to round robin. 

      ```bash 
      oc apply -f 99-workers-multipath-round-robin.yaml
      ```
      <br> 
     
      ```yaml 
      cat <<EOF> 71-nvmf-iopolicy-dell.rules
      ACTION=="add", SUBSYSTEM=="nvme-subsystem", ATTR{model}=="dellemc-PowerFlex",ATTR{iopolicy}="round-robin"
      EOF
      ``` 
      <br> 
  
        Example: 

      ```yaml 
      cat <<EOF> 99-workers-multipath-round-robin.yaml
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
                source: data:text/plain;charset=utf-8;base64,$(cat 71-nvmf-iopolicy-dell.rules | base64 -w0)
                verification: {}
              filesystem: root
              mode: 420
              path: /etc/udev/rules.d/71-nvme-io-policy.rules 
      EOF
      ``` 
   <br> 

   5. Configure NVMe reconnecting forever 

      Use this command to create the machine configuration to configure the NVMe reconnect

      ```bash 
      oc apply -f 99-workers-nvmf-ctrl-loss-tmo.yaml 
      ```

      <br> 
   
      ```yaml 
      cat <<EOF> 72-nvmf-ctrl_loss_tmo.rules
      ACTION=="add|change", SUBSYSTEM=="nvme", KERNEL=="nvme*", ATTR{ctrl_loss_tmo}="-1"
      EOF
      ``` 

      <br> 
  
      ```yaml 
      cat <<EOF> 99-workers-nvmf-ctrl-loss-tmo.yaml
      apiVersion: machineconfiguration.openshift.io/v1
      kind: MachineConfig
      metadata:
        name: 99-workers-nvmf-ctrl-loss-tmo
        labels:
          machineconfiguration.openshift.io/role: worker
      spec:
        config:
          ignition:
            version: 3.4.0
          storage:
            files:
            - contents:
                source: data:text/plain;charset=utf-8;base64,$(cat 72-nvmf-ctrl_loss_tmo.rules | base64 -w0)
                verification: {}
              filesystem: root
              mode: 420
              path: /etc/udev/rules.d/72-nvmf-ctrl_loss_tmo.rules
      EOF
      ```
</br>

**Cluster requirements**

All OpenShift nodes connecting to Dell storage arrays must use unique host NVMe Qualified Names (NQNs).

> The OpenShift deployment process for CoreOS will set the same host NQN for all nodes. The host NQN is stored in the file /etc/nvme/hostnqn. One possible solution to ensure unique host NQNs is to add the following machine config to your OCP cluster:

  ```yaml
  cat <<EOF> 99-worker-custom-nvme-hostnqn.yaml
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
  EOF
  ```
{{% /tab %}}
{{% tab header="NFS" lang="en" %}}

### NFS Requirements

- Ensure that your nodes support mounting NFS volumes if using NFS.

{{% /tab %}}
{{< /tabpane >}}

### Enable Zero Padding on PowerFlex

Verify that zero padding is enabled on the PowerFlex storage pools that will be used. Use PowerFlex GUI or the PowerFlex CLI to check this setting. For more information to configure this setting, see [Dell PowerFlex documentation](https://www.dell.com/support/manuals/en-us/scaleio/pfx_powerflex_config_customize_3.6.x/enable-or-disable-zero-padding-policy?guid=guid-d32bdff7-3014-4894-8e1e-2a31a86d343a&lang=en-us).

### Volume Snapshot Requirements
For detailed snapshot setup procedure, [click here.](docs/concepts/snapshots/#helm-optional-volume-snapshot-requirements)
