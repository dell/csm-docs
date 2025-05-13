---
title: "Prerequisite"
linkTitle: "Prerequisite"
weight: 1
Description: >
toc_hide: true
---

1. Create a user in the PowerStore Navigate in the PowerStore Manager Settings -> Users -> Add
   <br>
   <br>
   Username: csmadmin <br>
   User Role: Storage Operator


2. (Optional) Create NAS server Navigate in the PowerStore Manager Storage -> Nas Servers -> Create

<br>

3. (Optional) For "Shared NFS", install necessary nfs-utils package and ensure nfs-server and nfs-mountd services are active and running on all nodes.

<br>

4. For the protocol specific prerequisite check below.
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
