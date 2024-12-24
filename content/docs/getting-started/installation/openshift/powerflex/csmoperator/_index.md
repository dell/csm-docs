---
title: "Operator"
linktitle: "Operator"
no_list: true
description: CSM Operator Installation
weight: 2
---

## Installing the Operator
To deploy the Operator, follow the instructions available [here](../../../operator/operatorinstallation_openshift.md).

{{< accordion id="Two" title="CSI Driver" markdown="true" >}}  

### Prerequisites
- If multipath is configured, ensure CSI-PowerFlex volumes are blacklisted by multipathd. See [troubleshooting section](../../../../csidriver/troubleshooting/powerflex) for details.

>NOTE: This step can be skipped with OpenShift.

#### SDC Deployment for Operator

- This feature deploys the sdc kernel modules on all nodes with the help of an init container.
- Powerflex can be deployed with or without SDC. SDC deployment can be enabled and disabled by setting `X_CSI_SDC_ENABLED` value in CR file. By default, driver is deployed with SDC enabled.
- For non-supported versions of the OS also do the manual SDC deployment steps given below. Refer to https://hub.docker.com/r/dellemc/sdc for supported versions.
- **Note:** When the driver is created, MDM value for initContainers in driver CR is set by the operator from mdm attributes in the driver configuration file,
  config.yaml. An example of config.yaml is below in this document. Do not set MDM value for initContainers in the driver CR file manually.
  - Optionally, enable sdc monitor by setting the enable flag for the sdc-monitor to true. Please note:
    - **If using sidecar**, you will need to edit the value fields under the HOST_PID and MDM fields by filling the empty quotes with host PID and the MDM IPs.
    - **If not using sidecar**, leave the enabled field set to false.
##### Example CR: [samples/storage_csm_powerflex_v2130.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerflex_v2130.yaml)
```yaml
    sideCars:
    # sdc-monitor is disabled by default, due to high CPU usage
      - name: sdc-monitor
        enabled: false
        image: quay.io/dell/storage/powerflex/sdc:4.5.2.1
        envs:
        - name: HOST_PID
          value: "1"
        - name: MDM
          value: "10.xx.xx.xx,10.xx.xx.xx" #provide the same MDM value from secret
```

#### Create Secret

1. Create namespace:
   Execute `kubectl create namespace vxflexos` to create the `vxflexos` namespace (if not already present). Note that the namespace can be any user-defined name, in this example, we assume that the namespace is 'vxflexos'
2. Prepare the secret.yaml for driver configuration.

    Example: secret.yaml

    ```yaml
      # Username for accessing PowerFlex system.
      # If authorization is enabled, username will be ignored.
    - username: "admin"
      # Password for accessing PowerFlex system.
      # If authorization is enabled, password will be ignored.
      password: "password"
      # System name/ID of PowerFlex system.
      systemID: "1a99aa999999aa9a"
      # Previous names used in secret of PowerFlex system.
      allSystemNames: "pflex-1,pflex-2"
      # REST API gateway HTTPS endpoint for PowerFlex system.
      # If authorization is enabled, endpoint should be the HTTPS localhost endpoint that
      # the authorization sidecar will listen on
      endpoint: "https://127.0.0.1"
      # Determines if the driver is going to validate certs while connecting to PowerFlex REST API interface.
      # Allowed values: true or false
      # Default value: true
      skipCertificateValidation: true
      # indicates if this array is the default array
      # needed for backwards compatibility
      # only one array is allowed to have this set to true
      # Default value: false
      isDefault: true
      # defines the MDM(s) that SDC should register with on start.
      # Allowed values:  a list of IP addresses or hostnames separated by comma.
      # Default value: none
      mdm: "10.0.0.1,10.0.0.2"
      # NFS is only supported on PowerFlex storage system 4.0.x
      # nasName: name of NAS server used for NFS volumes
      # nasName value must be specified in secret for performing NFS (file) operations.
      # Allowed Values: string
      # Default Value: "none"
      nasName: "nas-server"
    - username: "admin"
      password: "Password123"
      systemID: "2b11bb111111bb1b"
      endpoint: "https://127.0.0.2"
      skipCertificateValidation: true
      mdm: "10.0.0.3,10.0.0.4"
    ```

    If replication feature is enabled, ensure the secret includes all the PowerFlex arrays involved in replication.

    After editing the file, run this command to create a secret called `vxflexos-config`.

    ```bash
    kubectl create secret generic vxflexos-config -n vxflexos --from-file=config=secret.yaml
    ```

    Use this command to replace or update the secret:

    ```bash
    kubectl create secret generic vxflexos-config -n vxflexos --from-file=config=secret.yaml -o yaml --dry-run=client | kubectl replace -f -
    ```

### Install Driver

1. Follow all the [prerequisites](#prerequisites) above

2. Create a CR (Custom Resource) for PowerFlex using the sample files provided

    a. **Default Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/minimal-samples/powerflex_v2130.yaml) for default settings. Modify if needed.

    [OR]                                                

    b. **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerflex_v2130.yaml) for detailed settings.

3. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerFlex driver and their default values:
{{< collapse id="1" title="Parameters">}}
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | dnsPolicy | Determines the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
   | fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No | "ReadWriteOnceWithFSType" |
   | replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, excess pods will become stay in a pending state. Defaults are 2 which allows for Controller high availability. | Yes | 2 |
   | storageCapacity.enabled | Enable/Disable storage capacity tracking | No | true |
   | storageCapacity.pollInterval | Configure how often the driver checks for changed capacity | No | 5m |
   | enableQuota | a boolean that, when enabled, will set quota limit for a newly provisioned NFS volume | No | none |
   | maxVxflexosVolumesPerNode | Specify default value for maximum number of volumes that controller can publish to the node.If value is zero CO SHALL decide how many volumes of this type can be published by the controller to the node | Yes | 0 |
   | ***Common parameters for node and controller*** |
   | X_CSI_VXFLEXOS_ENABLELISTVOLUMESNAPSHOT | Enable list volume operation to include snapshots (since creating a volume from a snap actually results in a new snap) | No | false |
   | X_CSI_VXFLEXOS_ENABLESNAPSHOTCGDELETE | Enable this to automatically delete all snapshots in a consistency group when a snap in the group is deleted | No | false |
   | X_CSI_DEBUG | To enable debug mode | No | true |
   | X_CSI_ALLOW_RWO_MULTI_POD_ACCESS | Setting allowRWOMultiPodAccess to "true" will allow multiple pods on the same node to access the same RWO volume. This behavior conflicts with the CSI specification version 1.3. NodePublishVolume description that requires an error to be returned in this case. However, some other CSI drivers support this behavior and some customers desire this behavior. Customers use this option at their own risk. | No | false |
   | INTERFACE_NAMES | A mapping of node names to interface names. Only necessary when SDC is disabled. | No | none |
   | ***Controller parameters*** |
   | X_CSI_POWERFLEX_EXTERNAL_ACCESS | allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | empty |
   | X_CSI_HEALTH_MONITOR_ENABLED | Enable/Disable health monitor of CSI volumes from Controller plugin - volume condition | No | false |
   | ***Node parameters*** |
   | X_CSI_RENAME_SDC_ENABLED | Enable this to rename the SDC with the given prefix. The new name will be ("prefix" + "worker_node_hostname") and it should not exceed 31 chars. | Yes | false |
   | X_CSI_APPROVE_SDC_ENABLED | Enable this to to approve restricted SDC by GUID during setup | Yes | false |
   | X_CSI_HEALTH_MONITOR_ENABLED | Enable/Disable health monitor of CSI volumes from Node plugin - volume condition | No | false |
   | X_CSI_SDC_ENABLED | Enable/Disable installation of the SDC. | Yes | true |
{{< /collapse >}}

4. Execute this command to create PowerFlex custom resource:
    ```bash
    kubectl create -f <input_sample_file.yaml>
    ```
    This command will deploy the CSI-PowerFlex driver in the namespace specified in the input YAML file.

5. Once the driver `Custom Resource (CR)` is created, you can verify the installation as mentioned below

    * Check if ContainerStorageModule CR is created successfully using the command below:
        ```bash
        kubectl get csm/<name-of-custom-resource> -n <driver-namespace> -o yaml
        ```
    * Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.
    
6. Refer [Volume Snapshot Class](https://github.com/dell/csi-powerflex/tree/main/samples/volumesnapshotclass) and [Storage Class](https://github.com/dell/csi-powerflex/tree/main/samples/storageclass) for the sample files. 

**Note** :
   1. Snapshotter and resizer sidecars are installed by default.
{{< /accordion >}}  

<br>

{{< accordion id="Three" title="CSM Modules">}}
<br>  

{{< cardcontainer >}}
    {{< customcard link1="./csm-modules/authorizationv1.x"  image="1" title="Authorization v1.x" >}}

    {{< customcard link1="./csm-modules/authorizationv2.0"   image="1" title="Authorization v2.0"  >}}

    {{< customcard  link1="./csm-modules/observability"   image="1" title="Observability"  >}}

    {{< customcard  link1="./csm-modules/replication"  image="1" title="Replication"  >}} 

    {{< customcard link1="./csm-modules/resiliency"   image="1" title="Resiliency"  >}}

{{< /cardcontainer >}}


{{< /accordion >}}  
