---
title: "Prerequisite"
linkTitle: "Prerequisite"
weight: 1
Description: >
toc_hide: true
---


### CSI PowerMax Reverse Proxy

The CSI PowerMax Reverse Proxy is a component that will be installed with the CSI PowerMax driver. For more details on this feature, see the related [documentation](../../../../../concepts/csidriver/features/powermax#csi-powermax-reverse-proxy).

Create a TLS secret that holds an SSL certificate and a private key. This is required by the reverse proxy server.

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
```
Make note of the newly created tls.crt and tls.key files as they will be referenced later to create Kubernetes Secret resources.

For the protocol specific prerequisite check below. 
   <br>


   {{< tabpane text=true lang="en" >}}
{{% tab header="Fibre Channel" lang="en" %}}

### Fibre Channel Requirements

The following requirements must be fulfilled in order to successfully use the Fiber Channel protocol with the CSI PowerMax driver:

- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port director must be completed.
- Ensure that the HBA WWNs (initiators) appear on the list of initiators that are logged into the array.
- If the number of volumes that will be published to nodes is high, then configure the maximum number of LUNs for your HBAs on each node. See the appropriate HBA document to configure the maximum number of LUNs. 

</br>

 1. Complete the zoning of each host with the PowerMax Storage Array. Please refer to <a  href="https://elabnavigator.dell.com/vault/pdf/Linux.pdf" target="_blank" style="font-size:0.9rem">Host Connectivity Guide</a> for the guidelines when setting up a Fibre Channel SAN infrastructure.  
 <br>
 2. Verify the initiators of each host are logged in to the PowerMax Storage Array. CSM will perform the Host Registration of each host with the PowerMax Array.
 <br>
 3. Multipathing software configuration
     
     
     a. Configure Device Mapper MPIO for PowerMax FC connectivity

     Use this command to create the machine configuration to configure the DM-MPIO service on all the worker hosts for FC  connectivity.
     ```bash 
     oc apply -f 99-workers-multipath-conf.yaml
     ``` 
     <br> 

     Example:

      ```yaml
      cat <<EOF> multipath.conf
        defaults {
          polling_interval 5
          checker_timeout 15
          disable_changed_wwids yes
          find_multipaths no
        }
        devices {
          device {
            vendor                   DellEMC
            product                  PowerMax
            detect_prio              "yes"
            path_selector            "service-time 0"
            path_grouping_policy     "group_by_prio"
            path_checker             tur
            failback                 immediate
            fast_io_fail_tmo         5
            no_path_retry            3
            rr_min_io_rq             1
            max_sectors_kb           1024
            dev_loss_tmo             10
          }
        }  
      EOF
      ``` 
     <br>
     <br>

     ```yaml

     cat <<EOF> 99-workers-multipath-conf.yaml
     apiVersion: machineconfiguration.openshift.io/v1
     kind: MachineConfig
     metadata:
       name: 99-workers-multipath-conf
       labels:
         machineconfiguration.openshift.io/role: worker
     spec:
       config:
         ignition:
           version: 3.4.0
         storage:
           files:
           - contents:
               source: data:text/plain;charset=utf-8;base64,$(cat multipath.conf | base64 -w0)
               verification: {}
             filesystem: root
             mode: 400
             path: /etc/multipath.conf   
     EOF  
     ``` 

     <br>
     <br>

     b. Enable Linux Device Mapper MPIO

     Use this command to create the machine configuration to enable the DM-MPIO service on all the worker host

     ```bash 
     oc apply -f 99-workers-enable-multipathd.yaml
     ``` 

     <br> 
     
     ```yaml
     cat << EOF > 99-workers-enable-multipathd.yaml 
     apiVersion: machineconfiguration.openshift.io/v1
     kind: MachineConfig
     metadata:
       name: 99-workers-enable-multipathd.yaml
       labels:
         machineconfiguration.openshift.io/role: worker
     spec:
       config:
         ignition:
           version: 3.4.0  
         systemd:
           units:
           - name: "multipathd.service"
             enabled: true
     EOF
     ``` 
     <br>


{{% /tab %}}


{{% tab header="iSCSI" lang="en" %}}

1. Complete the iSCSI network configuration to connect the hosts with the PowerMax Storage array. Please refer to <a  href="https://elabnavigator.dell.com/vault/pdf/Linux.pdf" target="_blank" style="font-size:0.9rem">Host Connectivity Guide</a> for the  best practices for attaching the hosts to a PowerMax storage array.  
<br>
2. Verify the initiators of each host are logged in to the PowerMax Storage Array. CSM will perform the Host Registration of each host with the PowerMax Array.  
<br>
3. Enable iSCSI service
<br>

   Use this command to create the machine configuration to enable the iscsid service.
   ```bash
   oc apply -f 99-workers-enable-iscsid.yaml
   ```
  
   <br>

    Example: 

  ```yaml
  cat <<EOF> 99-workers-enable-iscsid.yaml
  apiVersion: machineconfiguration.openshift.io/v1
  kind: MachineConfig
  metadata:
    name: 99-workers-enable-iscsid
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
  EOF
  ```
<br>

4. Multipathing software configuration
    
    
   a. Configure Device Mapper MPIO for PowerMax FC connectivity

      Use this command to create the machine configuration to configure the DM-MPIO service on all the worker hosts for FC connectivity.

      ```bash 
      oc apply -f 99-workers-multipath-conf.yaml
      ``` 
    <br>
    
    ```yaml
    cat <<EOF> multipath.conf
    defaults {
      polling_interval 5
      checker_timeout 15
      disable_changed_wwids yes
      find_multipaths no
    }
    devices {
      device {
        vendor                   DellEMC
        product                  PowerMax
        detect_prio              "yes"
        path_selector            "service-time 0"
        path_grouping_policy     "group_by_prio"
        path_checker             tur
        failback                 immediate
        fast_io_fail_tmo         5
        no_path_retry            3
        rr_min_io_rq             1
        max_sectors_kb           1024
        dev_loss_tmo             10
      }
    }  
    EOF
    ``` 

    <br>

    ```yaml 
    cat <<EOF> 99-workers-multipath-conf.yaml
    apiVersion: machineconfiguration.openshift.io/v1
    kind: MachineConfig
    metadata:
      name: 99-workers-multipath-conf
      labels:
        machineconfiguration.openshift.io/role: worker
    spec:
      config:
        ignition:
          version: 3.4.0
        storage:
          files:
          - contents:
              source: data:text/plain;charset=utf-8;base64,$(cat multipath.conf | base64 -w0)
              verification: {}
            filesystem: root
            mode: 400
            path: /etc/multipath.conf   
    EOF  
    ``` 

    <br>
    <br>

    b. Enable Linux Device Mapper MPIO 

    Use this command to create the machine configuration to enable the DM-MPIO service on all the worker host

    ```bash 
    oc apply -f 99-workers-enable-multipathd.yaml
    ``` 

    <br> 
    
    ```yaml
    cat << EOF > 99-workers-enable-multipathd.yaml 
    apiVersion: machineconfiguration.openshift.io/v1
    kind: MachineConfig
    metadata:
      name: 99-workers-enable-multipathd.yaml
      labels:
        machineconfiguration.openshift.io/role: worker
    spec:
      config:
        ignition:
          version: 3.4.0  
        systemd:
          units:
          - name: "multipathd.service"
            enabled: true
    EOF
    ``` 
{{% /tab %}}



{{% tab header="NVMeFC" lang="en" %}}


1. Complete the zoning of each host with the PowerMax Storage Array. Please refer to <a  href="https://elabnavigator.dell.com/vault/pdf/Linux.pdf" target="_blank" style="font-size:0.9rem">Host Connectivity Guide</a> for the guidelines when setting a Fibre Channel SAN infrastructure.
 
<br>

2. Verify the initiators of each host are logged in to the PowerMax Storage Array. CSM will perform the Host Registration of each host with the PowerMax Array.

<br>

3. Multipathing software configuration


   ```yaml 
   cat <<EOF> 71-nvmf-iopolicy-dell.rules
   ACTION=="add", SUBSYSTEM=="nvme-subsystem", ATTR{model}=="dellemc-powermax",ATTR{iopolicy}="round-robin"
   EOF
   ``` 
   <br> 
   <br>

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

4. Configure NVMe reconnecting forever 

   ```yaml 
   cat <<EOF> 72-nvmf-ctrl_loss_tmo.rules
   ACTION=="add|change", SUBSYSTEM=="nvme", KERNEL=="nvme*", ATTR{ctrl_loss_tmo}="-1"
   EOF
   ``` 

   <br> 

   ```yaml 
   cat <<EOF> 99-nvmf-ctrl-loss-tmo.yaml
   apiVersion: machineconfiguration.openshift.io/v1
   kind: MachineConfig
   metadata:
     name: 99-nvmf-ctrl-loss-tmo
     labels:
       machineconfiguration.openshift.io/role: worker
   spec:
     config:
       ignition:
         version: 3.4.0
       storage:
         files:
         - contents:
             source: data:text/plain;charset=utf-8;base64,(cat 72-nvmf-ctrl_loss_tmo.rules | base64 -w0)
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

   {{% tab header="NVMeTCP" lang="en" %}} 


   1. Complete the NVMe network configuration to connect the hosts with the PowerMax Storage array. Please refer <a  href="https://elabnavigator.dell.com/vault/pdf/Linux.pdf" target="_blank" style="font-weight:bold; font-size:0.9rem">Host Connectivity Guide</a> for the best practices for attaching the hosts to a PowerMax storage array.
    
   <br> 
  
   2. Verify the initiators of each host are logged in to the PowerMax Storage Array. CSM will perform the Host Registration of each host with the PowerMax Array.

   <br>
  
   3. Configure IO policy for native NVMe multipathing  

      Use this comment to create the machine configuration to configure the native NVMe multipathing IO Policy to round robin. 

      ```bash 
      oc apply -f 99-workers-multipath-round-robin.yaml
      ```
      <br> 
     
      ```yaml 
      cat <<EOF> 71-nvmf-iopolicy-dell.rules
      ACTION=="add", SUBSYSTEM=="nvme-subsystem", ATTR{model}=="dellemc-powermax",ATTR{iopolicy}="round-robin"
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

   4. Configure NVMe reconnecting forever 

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

### Replication Requirements (Optional)

Applicable only if you decided to enable the Replication feature in `my-powermax-settings.yaml`

```yaml
replication:
  enabled: true
```
#### Replication CRD's

The CRDs for replication can be obtained and installed from the csm-replication project on Github. Use `csm-replication/deploy/replicationcrds.all.yaml` located in the csm-replication git repo for the installation.

CRDs should be configured during replication prepare stage with repctl as described in [install-repctl](../../../../../getting-started/installation/kubernetes/powermax/helm/csm-modules/replication/install-repctl/)
