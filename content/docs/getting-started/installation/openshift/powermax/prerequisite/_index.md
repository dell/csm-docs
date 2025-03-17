---
title: "Prerequisite"
linkTitle: "Prerequisite"
weight: 1
Description: >

--- 

1. Create a user in the PowerStore Navigate in the PowerStore Manager Settings -> Users -> Add 
   <br> 
   <br>
   Username: csmadmin <br>
   User Role: Storage Operator 


2. (Optional) Create NAS server Navigate in the PowerStore Manager Storage -> Nas Servers -> Create 

<br> 

3. For the protocol specific prerequisite check below. 
   <br>


   {{< tabpane text=true lang="en" >}}
   {{% tab header="FC" lang="en" %}}

   1. Complete the zoning of each host with the PowerStore Storage Array. Please refer the <a  href="https://elabnavigator.dell.com/vault/pdf/Linux.pdf" target="_blank" style="font-weight:bold; font-size:0.9rem">Host Connectivity Guide</a> for the guidelines when setting a Fibre Channel SAN infrastructure.  
   <br> 

   2. Verify the initiators of each host are logged in to the PowerStore Storage Array. CSM will perform the Host Registration of each host with the PowerStore Array. 

   <br> 

   3. Multipathing software configuration 
       
       
       a. Configure Device Mapper MPIO for PowerStore FC connectivity

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
           product                  PowerStore
           detect_prio              "yes"
           path_selector            "queue-length 0"
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


   1. Complete the iSCSI network configuration to connect the hosts with the PowerStore Storage array. Please refer the <a  href="https://elabnavigator.dell.com/vault/pdf/Linux.pdf" target="_blank" style="font-weight:bold; font-size:0.9rem">Host Connectivity Guide</a> for the  best practices for attaching the hosts to a PowerStore storage array.  
   <br>
   2. Verify the initiators of each host are logged in to the PowerStore Storage Array. CSM will perform the Host Registration of each host with the PowerStore Array.  
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
       ```
   <br>
   <br>

   4. Multipathing software configuration 
       
       
      a. Configure Device Mapper MPIO for PowerStore iSCSI connectivity 

         Use this command to create the machine configuration to configure the DM-MPIO service on all the worker hosts for iSCSI  connectivity.

         ```bash 
         oc apply -f 99-workers-multipath-conf.yaml
         ``` 
       <br>
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
           product                  PowerStore
           detect_prio              "yes"
           path_selector            "queue-length 0"
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



       <br>

   {{% /tab %}}

   {{% tab header="NVMeFC" lang="en" %}}


   1. Complete the zoning of each host with the PowerStore Storage Array. Please refer the <a  href="https://elabnavigator.dell.com/vault/pdf/Linux.pdf" target="_blank" style="font-weight:bold; font-size:0.9rem">Host Connectivity Guide</a> for the guidelines when setting a Fibre Channel SAN infrastructure. 
    
   <br> 
   <br>

   2. Verify the initiators of each host are logged in to the PowerStore Storage Array. CSM will perform the Host Registration of each host with the PowerStore Array.

   <br>
   <br>

   3. Configure IO policy for native NVMe multipathing  

      Use this comment to create the machine configuration to configure the native NVMe multipathing IO Policy to round robin. 

      ```bash 
      oc apply -f 99-workers-multipath-round-robin.yaml
      ```
      <br> 
      <br>
  
      ```yaml 
      cat <<EOF> 71-nvmf-iopolicy-dell.rules
      ACTION=="add", SUBSYSTEM=="nvme-subsystem", ATTR{model}=="dellemc-powerstore",ATTR{iopolicy}="round-robin"
      EOF
      ``` 
      <br> 
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
   <br>

   4. Configure NVMe reconnecting forever 

      Use this command to create the machine configuration to configure the NVMe reconnect

      ```bash 
      oc apply -f 99-workers-nvmf-ctrl-loss-tmo.yaml 
      ```

      <br> 
      <br>

      ```yaml 
      cat <<EOF> 72-nvmf-ctrl_loss_tmo.rules
      ACTION=="add|change", SUBSYSTEM=="nvme", KERNEL=="nvme*", ATTR{ctrl_loss_tmo}="-1"
      EOF
      ``` 

      <br> 
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

   {{% /tab %}} 

   {{% tab header="NVMeTCP" lang="en" %}} 


   1. Complete the NVMe network configuration to connect the hosts with the PowerStore Storage array. Please refer <a  href="https://elabnavigator.dell.com/vault/pdf/Linux.pdf" target="_blank" style="font-weight:bold; font-size:0.9rem">Host Connectivity Guide</a> for the best practices for attaching the hosts to a PowerStore storage array.
    
   <br> 
   <br>

   2. Verify the initiators of each host are logged in to the PowerStore Storage Array. CSM will perform the Host Registration of each host with the PowerStore Array.

   <br>
   <br>

   3. Configure IO policy for native NVMe multipathing  

      Use this comment to create the machine configuration to configure the native NVMe multipathing IO Policy to round robin. 

      ```bash 
      oc apply -f 99-workers-multipath-round-robin.yaml
      ```
      <br> 
      <br>
  
      ```yaml 
      cat <<EOF> 71-nvmf-iopolicy-dell.rules
      ACTION=="add", SUBSYSTEM=="nvme-subsystem", ATTR{model}=="dellemc-powerstore",ATTR{iopolicy}="round-robin"
      EOF
      ``` 
      <br> 
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
   <br>

   4. Configure NVMe reconnecting forever 

      Use this command to create the machine configuration to configure the NVMe reconnect

      ```bash 
      oc apply -f 99-workers-nvmf-ctrl-loss-tmo.yaml 
      ```

      <br> 
      <br>

      ```yaml 
      cat <<EOF> 72-nvmf-ctrl_loss_tmo.rules
      ACTION=="add|change", SUBSYSTEM=="nvme", KERNEL=="nvme*", ATTR{ctrl_loss_tmo}="-1"
      EOF
      ``` 

      <br> 
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

   {{% /tab %}} 


   {{< /tabpane >}}   


<!--
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


 1. Complete the zoning of each host with the PowerMax Storage Array. Please refer the <a  href="https://elabnavigator.dell.com/vault/pdf/Linux.pdf" target="_blank" style="font-weight:bold; font-size:0.9rem">Host Connectivity Guide</a> for the guidelines when setting a Fibre Channel SAN infrastructure.  
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
         path_selector            "queue-length 0"
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

1. Complete the iSCSI network configuration to connect the hosts with the PowerMax Storage array. Please refer the [host connectivity guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf) for the  best practices for attaching the hosts to a PowerMax storage array.  
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
    ```
<br>

4. Multipathing software configuration 
    
    
   a. Configure Device Mapper MPIO for PowerMax FC connectivity 

      Use this command to create the machine configuration to configure the DM-MPIO service on all the worker hosts for FC  connectivity.

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
        path_selector            "queue-length 0"
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



    <br>

{{% /tab %}}



{{% tab header="NVMeFC" lang="en" %}}


1. Complete the zoning of each host with the PowerMax Storage Array. Please refer the <a  href="https://elabnavigator.dell.com/vault/pdf/Linux.pdf" target="_blank" style="font-weight:bold; font-size:0.9rem">Host Connectivity Guide</a> for the guidelines when setting a Fibre Channel SAN infrastructure. 
 
<br>

2. Verify the initiators of each host are logged in to the PowerMax Storage Array. CSM will perform the Host Registration of each host with the PowerMax Array.

<br>

3. Multipathing software configuration 


   ```yaml 
   cat <<EOF> 71-nvmf-iopolicy-dell.rules
   ACTION=="add", SUBSYSTEM=="nvme-subsystem", ATTR{model}=="dellemc-powermax",ATTR{iopolicy}="round-robin"
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

   ``` 
<br> 

4. Configure NVMe reconnecting forever 


   ```yaml 
   cat <<EOF> 72-nvmf-ctrl_loss_tmo.rules
   ACTION=="add|change", SUBSYSTEM=="nvme", KERNEL=="nvme*", ATTR{ctrl_loss_tmo}="-1"
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
   ```

{{% /tab %}} 

{{% tab header="NVMeTCP" lang="en" %}}
{{% /tab %}} 

{{% tab header="NFS" lang="en" %}}

### NFS Requirements

CSI Driver for Dell PowerMax supports NFS communication. Ensure that the following requirements are met before you install CSI Driver:
- Configure the NFS network. Please refer [here](https://dl.dell.com/content/manual57826791-dell-powermax-file-protocol-guide.pdf?language=en-us&ps=true) for more details.
- PowerMax Embedded Management guest to access Unisphere for PowerMax.
- Create the NAS server. Please refer [here](https://dl.dell.com/content/manual55638050-dell-powermax-file-quick-start-guide.pdf?language=en-us&ps=true) for more details.
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

-->
