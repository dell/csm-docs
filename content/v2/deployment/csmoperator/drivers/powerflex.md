---
title: PowerFlex
linkTitle: "PowerFlex"
description: >
  Installing Dell CSI Driver for PowerFlex via Dell CSM Operator
---
{{% pageinfo color="primary" %}}
CSM 1.7.1 is applicable to helm based installations of PowerFlex driver.
{{% /pageinfo %}}

## Installing CSI Driver for PowerFlex via Dell CSM Operator

The CSI Driver for Dell PowerFlex can be installed via the Dell CSM Operator.
To deploy the Operator, follow the instructions available [here](../../#installation).

Note that the deployment of the driver using the operator does not use any Helm charts and the installation and configuration parameters will be slightly different from the one specified via the Helm installer.

### Listing installed drivers with the ContainerStorageModule CRD
User can query for all Dell CSI drivers using this command:
```bash
kubectl get csm --all-namespaces
```

### Prerequisites
- If multipath is configured, ensure CSI-PowerFlex volumes are blacklisted by multipathd. See [troubleshooting section](../../../../csidriver/troubleshooting/powerflex) for details.

>NOTE: This step can be skipped with OpenShift.

#### SDC Deployment for Operator 
- This feature deploys the sdc kernel modules on all nodes with the help of an init container.
- For non-supported versions of the OS also do the manual SDC deployment steps given below. Refer to https://hub.docker.com/r/dellemc/sdc for supported versions.
- **Note:** When the driver is created, MDM value for initContainers in driver CR is set by the operator from mdm attributes in the driver configuration file, 
  config.yaml. An example of config.yaml is below in this document. Do not set MDM value for initContainers in the driver CR file manually.
  - Optionally, enable sdc monitor by setting the enable flag for the sdc-monitor to true. Please note: 
    - **If using sidecar**, you will need to edit the value fields under the HOST_PID and MDM fields by filling the empty quotes with host PID and the MDM IPs. 
    - **If not using sidecar**, leave the enabled field set to false.
<<<<<<< Updated upstream
##### Example CR:  [samples/storage_csm_powerflex_v240.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerflex_v240.yaml)
=======
##### Example CR:  [samples/storage_csm_powerflex_v270.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerflex_v270.yaml)
>>>>>>> Stashed changes
```yaml
    sideCars:
    # sdc-monitor is disabled by default, due to high CPU usage 
      - name: sdc-monitor
        enabled: false
        image: dellemc/sdc:3.6.0.6
        envs:
        - name: HOST_PID
          value: "1"
        - name: MDM
          value: "10.xx.xx.xx,10.xx.xx.xx" #provide the same MDM value from secret
```  

#### Manual SDC Deployment

For detailed PowerFlex installation procedure, see the _Dell PowerFlex Deployment Guide_. Install the PowerFlex SDC using this procedure:

**Steps**

1. Download the PowerFlex SDC from [Dell Online support](https://www.dell.com/support). The filename is EMC-ScaleIO-sdc-*.rpm, where * is the SDC name corresponding to the PowerFlex installation version.
2. Export the shell variable _MDM_IP_ in a comma-separated list using `export MDM_IP=xx.xxx.xx.xx,xx.xxx.xx.xx`, where xxx represents the actual IP address in your environment. This list contains the IP addresses of the MDMs.
3. Install the SDC per the _Dell PowerFlex Deployment Guide_:
    - For environments using RPM, run `rpm -iv ./EMC-ScaleIO-sdc-*.x86_64.rpm`, where * is the SDC name corresponding to the PowerFlex installation version.
4. To add more MDM_IP for multi-array support, run `/opt/emc/scaleio/sdc/bin/drv_cfg --add_mdm --ip 10.xx.xx.xx.xx,10.xx.xx.xx`1. Create namespace.
   Execute `kubectl create namespace vxflexos` to create the `vxflexos` namespace (if not already present). Note that the namespace can be any user-defined name, in this example, we assume that the namespace is 'vxflexos'

>NOTE: This step can be skipped with OpenShift CoreOS nodes.

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
      # Required: true
      systemID: "1a99aa999999aa9a"
      # Required: false
      # Previous names used in secret of PowerFlex system. Only needed if PowerFlex System Name has been changed by user 
      # and old resources are still based on the old name. 
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
      # Defines all system names used to create powerflex volumes
      # Required: false
      # Default value: none
      AllSystemNames: "name1,name2"
    - username: "admin"
      password: "Password123"
      systemID: "2b11bb111111bb1b"
      endpoint: "https://127.0.0.2"
      skipCertificateValidation: true 
      mdm: "10.0.0.3,10.0.0.4"
      AllSystemNames: "name1,name2"
    ```

    After editing the file, run this command to create a secret called `test-vxflexos-config`. If you are using a different namespace/secret name, just substitute those into the command.
    ```bash
    
    kubectl create secret generic test-vxflexos-config -n test-vxflexos --from-file=config=config.yaml
    ```

    Use this command to replace or update the secret:

    ```bash
    
    kubectl create secret generic test-vxflexos-config -n test-vxflexos --from-file=config=config.yaml -o yaml --dry-run=client | kubectl replace -f -
    ```

### Install Driver

1. Follow all the [prerequisites](#prerequisite) above
   
2. Create a CR (Custom Resource) for PowerFlex using the sample files provided 
   [here](https://github.com/dell/csm-operator/tree/master/samples). This file can be modified to use custom parameters if needed.

3. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerFlex driver and their default values:

   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | dnsPolicy | Determines the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
   | fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType` | No | "ReadWriteOnceWithFSType" |
   | replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, excess pods will become stay in a pending state. Defaults are 2 which allows for Controller high availability. | Yes | 2 |
   | ***Common parameters for node and controller*** |
   | X_CSI_VXFLEXOS_ENABLELISTVOLUMESNAPSHOT | Enable list volume operation to include snapshots (since creating a volume from a snap actually results in a new snap) | No | false |
   | X_CSI_VXFLEXOS_ENABLESNAPSHOTCGDELETE | Enable this to automatically delete all snapshots in a consistency group when a snap in the group is deleted | No | false |
   | X_CSI_DEBUG | To enable debug mode | No | true |
   | X_CSI_ALLOW_RWO_MULTI_POD_ACCESS | Setting allowRWOMultiPodAccess to "true" will allow multiple pods on the same node to access the same RWO volume. This behavior conflicts with the CSI specification version 1.3. NodePublishVolume description that requires an error to be returned in this case. However, some other CSI drivers support this behavior and some customers desire this behavior. Customers use this option at their own risk. | No | false |

4.  Execute this command to create PowerFlex custom resource:
    ```bash
    kubectl create -f <input_sample_file.yaml>
    ``` 
    This command will deploy the CSI-PowerFlex driver in the namespace specified in the input YAML file.

5.  [Verify the CSI Driver installation](../#verifying-the-driver-installation)
    
**Note** : 
   1. "Kubelet config dir path" is not yet configurable in case of Operator based driver installation.
   2. Also, snapshotter and resizer sidecars are not optional to choose, it comes default with Driver installation. 
