---
title: "Prerequisite"
linkTitle: "Prerequisite"
weight: 1
Description: >
toc_hide: true
---  

Before you install CSI Driver for Unity XT, verify the requirements that are mentioned in this topic are installed and configured.

### Requirements

* Install Kubernetes or OpenShift (see [supported versions](../../../../../concepts/csidriver/#features-and-capabilities))
* To use FC protocol, the host must be zoned with Unity XT array and Multipath needs to be configured
* To use iSCSI protocol, iSCSI initiator utils packages needs to be installed and Multipath needs to be configured
* To use NFS protocol, there is no prerequisite on Openshift

{{< tabpane text=true lang="en" >}}
{{% tab header="FC" lang="en" %}}

1. Complete the zoning of each host with the Unity Storage Array. Please refer the <a  href="https://elabnavigator.dell.com/vault/pdf/Linux.pdf" target="_blank" style="font-weight:bold; font-size:0.9rem">Host Connectivity Guide</a> for the guidelines when setting a Fibre Channel SAN infrastructure.  
<br> 

2. Verify the initiators of each host are logged in to the Unity Storage Array. CSM will perform the Host Registration of each host with the Unity Array. 

<br> 

3. Multipathing software configuration 
    
    
    a. Configure Device Mapper MPIO for Unity FC connectivity

    Use this command to create the machine configuration to configure the DM-MPIO service on all the worker hosts for FC connectivity.
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
        product                  Unity
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


 1. Complete the iSCSI network configuration to connect the hosts with the Unity Storage array. Please refer the [host connectivity guide](https://www.delltechnologies.com/asset/en-us/products/storage/technical-support/docu5128.pdf). for the  best practices for attaching the hosts to a Unity storage array.  
 <br>
 2. Verify the initiators of each host are logged in to the Unity Storage Array. CSM will perform the Host Registration of each host with the Unity Array.  
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
     
     
    a. Configure Device Mapper MPIO for Unity iSCSI connectivity 

       Use this command to create the machine configuration to configure the DM-MPIO service on all the worker hosts for iSCSI  connectivity.

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
         product                  Unity
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
{{< /tabpane >}}   


<!--
The CSI Driver for Unity XT supports iSCSI connectivity.

3. Multipathing software configuration
        
    a. Configure Device Mapper MPIO for Unity FC connectivity

For more information about configuring iSCSI, see [Dell Host Connectivity guide](https://www.delltechnologies.com/asset/en-us/products/storage/technical-support/docu5128.pdf). 
-->
