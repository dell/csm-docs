---
title: PowerFlex
description: >
  Installing CSI Driver for PowerFlex via Operator
---
## Installing CSI Driver for PowerFlex via Operator

The CSI Driver for Dell EMC PowerFlex can be installed via the Dell CSI Operator.

To deploy the Operator, follow the instructions available [here](../).

There are sample manifests provided which can be edited to do an easy installation of the driver. Note that the deployment of the driver using the operator does not use any Helm charts. The installation and configuration parameters will be slightly different from the ones specified via the Helm installer.

Kubernetes Operators make it easy to deploy and manage the entire lifecycle of complex Kubernetes applications. Operators use Custom Resource Definitions (CRD) which represents the application and use custom controllers to manage them.

### Prerequisites:
#### SDC Deployment for Operator 
- This feature deploys the sdc kernel modules on all nodes with the help of an init container.
- For non-supported versions of the OS also do the manual SDC deployment steps given below. Refer to https://hub.docker.com/r/dellemc/sdc for supported versions.
- **Note:** When the driver is created, MDM value for initContainers in driver CR is set by the operator from mdm attributes in the driver configuration file, 
  config.yaml. An example of config.yaml is below in this document. Do not set MDM value for initContainers in the driver CR file manually.
- **Note:** To use an sdc-binary module from customer ftp site:
  - Create a secret, sdc-repo-secret.yaml to contain the credentials for the private repo. To generate the base64 encoding of a credential:
 ```yaml
      echo -n <credential>| base64 -i
``` 
   secret sample to use:
 ```yaml
      apiVersion: v1
      kind: Secret
      metadata:
        name: sdc-repo-creds
        namespace: vxflexos
      type: Opaque
      data:
        # set username to the base64 encoded username, sdc default is
          username: <username in base64>
        # set password to the base64 encoded password, sdc default is
          password: <password in base64>
```  
  - Create secret for FTP side by using the command `kubectl create -f sdc-repo-secret.yaml`.
  - Optionally, enable sdc monitor by uncommenting the section for sidecar in manifest yaml. Please note the following: 
    - **If using sidecar**, you will need to edit the value fields under the HOST_PID and MDM fields by filling the empty quotes with host PID and the MDM IPs. 
    - **If not using sidecar**, please leave this commented out -- otherwise, the empty fields will cause errors.
##### Example CR:  [config/samples/vxflex_v200_ops_47.yaml](https://github.com/dell/dell-csi-operator/blob/master/samples/vxflex_v200_ops_47.yaml)
```yaml
        sideCars:
    # Comment the following section if you don't want to run the monitoring sidecar
      - name: sdc-monitor
        envs:
        - name: HOST_PID
          value: "1"
        - name: MDM
          value: ""
    initContainers:
      - image: dellemc/sdc:3.6
        imagePullPolicy: IfNotPresent
        name: sdc
        envs:
          - name: MDM
            value: "10.x.x.x,10.x.x.x"
```  

### Manual SDC Deployment

For detailed PowerFlex installation procedure, see the _Dell EMC PowerFlex Deployment Guide_. Install the PowerFlex SDC as follows:

**Steps**

1. Download the PowerFlex SDC from [Dell EMC Online support](https://www.dell.com/support). The filename is EMC-ScaleIO-sdc-*.rpm, where * is the SDC name corresponding to the PowerFlex installation version.
2. Export the shell variable _MDM_IP_ in a comma-separated list using `export MDM_IP=xx.xxx.xx.xx,xx.xxx.xx.xx`, where xxx represents the actual IP address in your environment. This list contains the IP addresses of the MDMs.
3. Install the SDC per the _Dell EMC PowerFlex Deployment Guide_:
    - For Red Hat Enterprise Linux and CentOS, run `rpm -iv ./EMC-ScaleIO-sdc-*.x86_64.rpm`, where * is the SDC name corresponding to the PowerFlex installation version.
4. To add more MDM_IP for multi-array support, run `/opt/emc/scaleio/sdc/bin/drv_cfg --add_mdm --ip 10.xx.xx.xx.xx,10.xx.xx.xx`

### Install Driver

1. Create namespace: 
   Run `kubectl create namespace <driver-namespace>` command using the desired name to create the namespace.
2. Prepare the config.yaml for driver configuration.

    Example: config.yaml

     ```yaml
      # Username for accessing PowerFlex system.	
      # Required: true
     - username: "admin"
      # Password for accessing PowerFlex system.	
      # Required: true
      password: "password"
      # System name/ID of PowerFlex system.	
      # Required: true
      systemID: "ID1"
      # REST API gateway HTTPS endpoint for PowerFlex system.
      # Required: true
      endpoint: "https://127.0.0.1"
      # Determines if the driver is going to validate certs while connecting to PowerFlex REST API interface.
      # Allowed values: true or false
      # Required: true
      # Default value: true
      skipCertificateValidation: true 
      # indicates if this array is the default array
      # needed for backwards compatibility
      # only one array is allowed to have this set to true 
      # Required: false
      # Default value: false
      isDefault: true
      # defines the MDM(s) that SDC should register with on start.
      # Allowed values:  a list of IP addresses or hostnames separated by comma.
      # Required: true
      # Default value: none 
      mdm: "10.0.0.1,10.0.0.2"
      # Defines all system names used to create powerflex volumes
      # Required: false
      # Default value: none
      AllSystemNames: "name1,name2"
    - username: "admin"
      password: "Password123"
      systemID: "ID2"
      endpoint: "https://127.0.0.2"
      skipCertificateValidation: true 
      mdm: "10.0.0.3,10.0.0.4"
      AllSystemNames: "name1,name2"
    ```

    After editing the file, run the following command to create a secret called `vxflexos-config`
    `kubectl create secret generic vxflexos-config -n <driver-namespace> --from-file=config=config.yaml`

    Use the following command to replace or update the secret:

    `kubectl create secret generic vxflexos-config -n <driver-namespace> --from-file=config=config.yaml -o yaml --dry-run=client | kubectl replace -f -`

    *Note:* 
    
      - System ID, MDM configuration, etc. now are taken directly from config.yaml. MDM provided in the input_sample_file.yaml will be overidden with MDM values in config.yaml.

3. Create a Custom Resource (CR) for PowerFlex using the sample files provided    [here](https://github.com/dell/dell-csi-operator/tree/master/samples).
4. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerFlex driver and their default values:
   
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | replicas | Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, excess pods will become stay in a pending state. Defaults are 2 which allows for Controller high availability. | Yes | 2 |
   | ***Common parameters for node and controller*** |
   | X_CSI_VXFLEXOS_ENABLELISTVOLUMESNAPSHOT | Enable list volume operation to include snapshots (since creating a volume from a snap actually results in a new snap) | No | false |
   | X_CSI_VXFLEXOS_ENABLESNAPSHOTCGDELETE | Enable this to automatically delete all snapshots in a consistency group when a snap in the group is deleted | No | false |
   | X_CSI_DEBUG | To enable debug mode | No | true |
   | X_CSI_ALLOW_RWO_MULTI_POD_ACCESS | Setting allowRWOMultiPodAccess to "true" will allow multiple pods on the same node to access the same RWO volume. This behavior conflicts with the CSI specification version 1.3. NodePublishVolume description that requires an error to be returned in this case. However, some other CSI drivers support this behavior and some customers desire this behavior. Customers use this option at their own risk. | No | false |
5.  Execute the `kubectl create -f <input_sample_file.yaml>` command to create PowerFlex custom resource. This command will deploy the CSI-PowerFlex driver.
    - Example CR for PowerFlex Driver
      ```yaml
      apiVersion: storage.dell.com/v1
      kind: CSIVXFlexOS
      metadata:
        name: test-vxflexos
        namespace: test-vxflexos
      spec:
        driver:
          configVersion: v6
          replicas: 1
          dnsPolicy: ClusterFirstWithHostNet
          forceUpdate: false
          common:
            image: "dellemc/csi-vxflexos:v2.0.0"
            imagePullPolicy: IfNotPresent
            envs:
              - name: X_CSI_VXFLEXOS_ENABLELISTVOLUMESNAPSHOT
                value: "false"
              - name: X_CSI_VXFLEXOS_ENABLESNAPSHOTCGDELETE
                value: "false"
              - name: X_CSI_DEBUG
                value: "true"
              - name: X_CSI_ALLOW_RWO_MULTI_POD_ACCESS
                value: "false"
          #sideCars:
          # Uncomment the following section if you want to run the monitoring sidecar
          #  - name: sdc-monitor
          #    envs:
          #    - name: HOST_PID
          #      value: "1"
          #    - name: MDM
          #      value: ""
          initContainers:
            - image: dellemc/sdc:3.6
              imagePullPolicy: IfNotPresent
              name: sdc
              envs:
                - name: MDM
                  value: "10.x.x.x,10.x.x.x"  #provide MDM value
      ---
      apiVersion: v1
      kind: ConfigMap
      metadata:
        name: vxflexos-config-params
        namespace: test-vxflexos
      data:
        driver-config-params.yaml: |
          CSI_LOG_LEVEL: "debug"
          CSI_LOG_FORMAT: "TEXT"
      ```
 ### Pre-Requisite for installation with OLM
     Please run the following commands for creating the required ConfigMap before installing the dell-csi-operator using OLM.
     
       1. git clone https://github.com/dell/dell-csi-operator.git 
       2. cd dell-csi-operator 
       3. tar -czf config.tar.gz driverconfig/ 
       # Replace operator-namespace in the below command with the actual namespace where the operator will be deployed by OLM 
       4. kubectl create configmap dell-csi-operator-config --from-file config.tar.gz -n <operator-namespace>
