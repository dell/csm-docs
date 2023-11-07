---
title: PowerMax
description: >
  Installing CSI Driver for PowerMax via Operator
---
{{% pageinfo color="primary" %}}
The Dell CSI Operator is no longer actively maintained or supported. It will be deprecated in CSM 1.9. It is highly recommended that you use [CSM Operator](../../../../deployment/csmoperator) going forward.

Please follow the steps below to migrate from Dell CSI Operator to CSM Operator
* Step1: Backup the CRD to save the settings used
* Step2: Map and update the settings in CRD in step1 to the relevant CRD in CSM Operator
* Step3: Keep the secret and namespace for the driver
* Step4: Keep the Storage Class and Volume Snapshot Class
* Step5: Uninstall the CRD from the CSI Operator
* Step6: Uninstall the CSI Operator itself
* Step7: Install the CSM Operator
* Step8: Install the CRD updated in Step 2

{{% /pageinfo %}}
{{% pageinfo color="primary" %}} Linked Proxy mode for CSI reverse proxy is no longer actively maintained or supported. It will be deprecated in CSM 1.9. It is highly recommended that you use stand alone mode going forward. {{% /pageinfo %}}

## Installing CSI Driver for PowerMax via Operator

CSI Driver for Dell PowerMax can be installed via the Dell CSI Operator.

To deploy the Operator, follow the instructions available [here](../).

There are sample manifests provided which can be edited to do an easy installation of the driver. Please note that the deployment of the driver using the operator does not use any Helm charts and the installation and configuration parameters will be slightly different from the ones specified via the Helm installer.

Kubernetes Operators make it easy to deploy and manage the entire lifecycle of complex Kubernetes applications. Operators use Custom Resource Definitions (CRD) which represents the application and use custom controllers to manage them.

### Prerequisite

#### Fibre Channel Requirements

CSI Driver for Dell PowerMax supports Fibre Channel communication. Ensure that the following requirements are met before you install CSI Driver:
- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port director must be completed.
- Ensure that the HBA WWNs (initiators) appear on the list of initiators that are logged into the array.
- If the number of volumes that will be published to nodes is high, then configure the maximum number of LUNs for your HBAs on each node. See the appropriate HBA document to configure the maximum number of LUNs.

#### iSCSI Requirements

The CSI Driver for Dell PowerMax supports iSCSI connectivity. These requirements are applicable for the nodes that use iSCSI initiator to connect to the PowerMax arrays.

Set up the iSCSI initiators as follows:
- All Kubernetes nodes must have the _iscsi-initiator-utils_ package installed.
- Ensure that the iSCSI initiators are available on all the nodes where the driver node plugin will be installed.
- Kubernetes nodes should have access (network connectivity) to an iSCSI director on the Dell PowerMax array that has IP interfaces. Manually create IP routes for each node that connects to the Dell PowerMax if required.
- Ensure that the iSCSI initiators on the nodes are not a part of any existing Host (Initiator Group) on the Dell PowerMax array.
- The CSI Driver needs the port group names containing the required iSCSI director ports. These port groups must be set up on each Dell PowerMax array. All the port group names supplied to the driver must exist on each Dell PowerMax with the same name.

For more information about configuring iSCSI, see [Dell Host Connectivity guide](https://www.delltechnologies.com/asset/zh-tw/products/storage/technical-support/docu5128.pdf).

#### Auto RDM for vSphere over FC requirements

The CSI Driver for Dell PowerMax supports auto RDM for vSphere over FC. These requirements are applicable for the clusters deployed on ESX/ESXi using virtualized environement.

Set up the environment as follows: 

- Requires VMware vCenter management software to manage all ESX/ESXis where the cluster is hosted.

- Add all FC array ports zoned to the ESX/ESXis to a port group where the cluster is hosted .

- Add initiators from all ESX/ESXis to a host(initiator group)/host group(cascaded initiator group) where the cluster is hosted.
- Create a secret which contains vCenter privileges. Follow the steps [here](#support-for-auto-rdm-for-vsphere-over-fc) to create the same. 

>Note: Hostgroups support with vSphere environment will be only available on csm-operator.

#### Linux multipathing requirements

CSI Driver for Dell PowerMax supports Linux multipathing. Configure Linux multipathing before installing the CSI Driver.

Set up Linux multipathing as follows:

- All the nodes must have the _Device Mapper Multipathing_ package installed.  
  *NOTE:* When this package is installed it creates a multipath configuration file which is located at `/etc/multipath.conf`. Please ensure that this file always exists.
- Enable multipathing using `mpathconf --enable --with_multipathd y`
- Enable `user_friendly_names` and `find_multipaths` in the `multipath.conf` file.

As a best practice, use these options to help the operating system and the mulitpathing software detect path changes efficiently:
```text
path_grouping_policy multibus
path_checker tur
features "1 queue_if_no_path"
path_selector "round-robin 0"
no_path_retry 10
```

#### PowerPath for Linux requirements

CSI Driver for Dell PowerMax supports PowerPath for Linux. Configure Linux PowerPath before installing the CSI Driver.

Follow this procedure to set up PowerPath for Linux:

- All the nodes must have the PowerPath package installed . Download the PowerPath archive for the environment from [Dell Online Support](https://www.dell.com/support/home/en-in/product-support/product/powerpath-for-linux/drivers).
- `Untar` the PowerPath archive, Copy the RPM package into a temporary folder and Install PowerPath using `rpm -ivh DellEMCPower.LINUX-<version>-<build>.<platform>.x86_64.rpm`
- Start the PowerPath service using `systemctl start PowerPath`

#### Create secret for client-side TLS verification (Optional)
Create a secret named powermax-certs in the namespace where the CSI PowerMax driver will be installed. This is an optional step and is only required if you are setting the env variable X_CSI_POWERMAX_SKIP_CERTIFICATE_VALIDATION to false. See the detailed documentation on how to create this secret [here](../../helm/powermax#certificate-validation-for-unisphere-rest-api-calls).


### Install Driver

1. Create namespace:
   Run `kubectl create namespace <driver-namespace>` using the desired name to create the namespace.
2. Create PowerMax credentials:
   Create a file called powermax-creds.yaml with the following content:
     ```yaml
        apiVersion: v1
        kind: Secret
        metadata:
          name: powermax-creds
            # Replace driver-namespace with the namespace where driver is being deployed
          namespace: <driver-namespace>
        type: Opaque
        data:
          # set username to the base64 encoded username
          username: <base64 username>
          # set password to the base64 encoded password
          password: <base64 password>
          # Uncomment the following key if you wish to use ISCSI CHAP authentication (v1.3.0 onwards)
          # chapsecret: <base64 CHAP secret>
     ```
   Replace the values for the username and password parameters. These values can be obtained using base64 encoding as described in the following example:
   ```BASH
   echo -n "myusername" | base64
   echo -n "mypassword" | base64
   # If mychapsecret is the ISCSI CHAP secret
   echo -n "mychapsecret" | base64

   ```
   Run the `kubectl create -f powermax-creds.yaml` command to create the secret.
3. Create a Custom Resource (CR) for PowerMax using the sample files provided [here](https://github.com/dell/dell-csi-operator/tree/master/samples). 
4. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerMax driver and their default values:
   
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | replicas | Controls the number of controller Pods you deploy. If controller Pods are greater than the number of available nodes, excess Pods will become stuck in pending. The default is 2 which allows for Controller high availability. | Yes | 2 |
   | fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType` | No | "ReadWriteOnceWithFSType" |
   | ***Common parameters for node and controller*** |
   | X_CSI_K8S_CLUSTER_PREFIX | Define a prefix that is appended to all resources created in the array; unique per K8s/CSI deployment; max length - 3 characters | Yes | XYZ |
   | X_CSI_POWERMAX_ENDPOINT | IP address of the Unisphere for PowerMax | Yes | https://0.0.0.0:8443 |
   | X_CSI_TRANSPORT_PROTOCOL | Choose which transport protocol to use (ISCSI, FC, auto or None)	| Yes | auto |
   | X_CSI_POWERMAX_PORTGROUPS |List of comma-separated port groups (ISCSI only). Example: "PortGroup1,PortGroup2" | No | - | 
   | X_CSI_MANAGED_ARRAYS | List of comma-separated array ID(s) which will be managed by the driver | Yes | - |
   | X_CSI_POWERMAX_PROXY_SERVICE_NAME | Name of CSI PowerMax ReverseProxy service. | Yes | powermax-reverseproxy |
   | X_CSI_GRPC_MAX_THREADS | Number of concurrent grpc requests allowed per client | No | 4 |
   | X_CSI_IG_MODIFY_HOSTNAME | Change any existing host names. When nodenametemplate is set, it changes the name to the specified format else it uses driver default host name format. | No | false |
   | X_CSI_IG_NODENAME_TEMPLATE | Provide a template for the CSI driver to use while creating the Host/IG on the array for the nodes in the cluster. It is of the format a-b-c-%foo%-xyz where foo will be replaced by host name of each node in the cluster. | No | - |
   | X_CSI_POWERMAX_DRIVER_NAME | Set custom CSI driver name. For more details on this feature see the related [documentation](../../../features/powermax/#custom-driver-name) | No | - |
   | X_CSI_HEALTH_MONITOR_ENABLED | Enable/Disable health monitor of CSI volumes from Controller and Node plugin. Provides details of volume status, usage and volume condition. As a prerequisite, external-health-monitor sidecar section should be uncommented in samples which would install the sidecar | No | false |
   | X_CSI_VSPHERE_ENABLED | Enable VMware virtualized environment support via RDM | No | false |
   | X_CSI_VSPHERE_PORTGROUP | Existing portGroup that driver will use for vSphere | Yes | "" |
   | X_CSI_VSPHERE_HOSTNAME | Existing host(initiator group)/host group(cascaded initiator group) that driver will use for vSphere | Yes | "" |
   | X_CSI_VCenter_HOST | URL/endpoint of the vCenter where all the ESX are present | Yes | "" |
   | ***Node parameters***|
   | X_CSI_POWERMAX_ISCSI_ENABLE_CHAP | Enable ISCSI CHAP authentication. For more details on this feature see the related [documentation](../../../features/powermax/#iscsi-chap) | No | false |
   | X_CSI_TOPOLOGY_CONTROL_ENABLED | Enable/Disabe topology control. It filters out arrays, associated transport protocol available to each node and creates topology keys based on any such user input. | No | false |
   
5. Execute the following command to create the PowerMax custom resource:`kubectl create -f <input_sample_file.yaml>`. The above command will deploy the CSI-PowerMax driver.

**Note** - If CSI driver is getting installed using OCP UI , create these two configmaps manually using the command `oc create -f <configfilename>`
1. Configmap name powermax-config-params
     ```yaml
      apiVersion: v1
      kind: ConfigMap
      metadata:
         name: powermax-config-params
         namespace: test-powermax
      data:
         driver-config-params.yaml: |
            CSI_LOG_LEVEL: "debug"
            CSI_LOG_FORMAT: "JSON"
     ```
 2. Configmap name node-topology-config
     ```yaml
        apiVersion: v1
        kind: ConfigMap
        metadata:
          name: node-topology-config
          namespace: test-powermax
        data:
          topologyConfig.yaml: |
            allowedConnections:
              - nodeName: "node1"
                rules:
                  - "000000000001:FC"
                  - "000000000002:FC"
              - nodeName: "*"
                rules:
                  - "000000000002:FC"
            deniedConnections:
              - nodeName: "node2"
                rules:
                  - "000000000002:*"
              - nodeName: "node3"
                rules:
                  - "*:*"
      
     ```



### CSI PowerMax ReverseProxy

CSI PowerMax ReverseProxy is component that will be installed along with the CSI PowerMax driver. For more details on this feature see the related [documentation](../../../features/powermax#csi-powermax-reverse-proxy).

Deployment and ClusterIP service will be created by dell-csi-operator.

#### Pre-requisites
Create a TLS secret that holds an SSL certificate and a private key which is required by the reverse proxy server. 
Use a tool such as `openssl` to generate this secret using the example below:

```bash
openssl genrsa -out tls.key 2048
openssl req -new -x509 -sha256 -key tls.key -out tls.crt -days 3650
kubectl create secret -n <namespace> tls revproxy-certs --cert=tls.crt --key=tls.key
kubectl create secret -n <namespace> tls csirevproxy-tls-secret --cert=tls.crt --
key=tls.key
```

#### Set the following parameters in the CSI PowerMaxReverseProxy Spec
* **tlsSecret** : Provide the name of the TLS secret. If using the above example, it should be set to `revproxy-certs`  
* **config** : This section contains the details of the Reverse Proxy configuration  
* **mode** : This value is set to `Linked` by default. Do not change this value  
* **linkConfig** : This section contains the configuration of the `Linked` mode  
* **primary** : This section holds details for the primary Unisphere which the Reverse Proxy will connect to
* **backup** : This optional section holds details for a backup Unisphere which the Reverse Proxy can connect 
to if the primary Unisphere is unreachable  
* **url** : URL of the Unisphere server  
* **skipCertificateValidation**: This setting determines if the client-side Unisphere certificate validation is required  
* **certSecret**: Secret name which holds the CA certificates which was used to sign Unisphere SSL certificates. Mandatory if skipCertificateValidation is set to `false`  
* **standAloneConfig** : This section contains the configuration of the `StandAlone` mode. Refer to the sample below for the detailed config

>Note: Only one of the `Linked` or `StandAlone` configurations needs to be supplied. The appropriate `mode` needs to be set in the spec as well.

Here is a sample manifest with each field annotated. A copy of this manifest is provided in the `samples` folder
```yaml
apiVersion: storage.dell.com/v1
kind: CSIPowerMaxRevProxy
metadata:
  name: powermax-reverseproxy # <- Name of the CSIPowerMaxRevProxy object
  namespace: test-powermax # <- Set the namespace to where you will install the CSI PowerMax driver
spec:
  # Image for CSI PowerMax ReverseProxy
  image: dellemc/csipowermax-reverseproxy:v2.3.0 # <- CSI PowerMax Reverse Proxy image
  imagePullPolicy: Always
  # TLS secret which contains SSL certificate and private key for the Reverse Proxy server
  tlsSecret: csirevproxy-tls-secret
  config:
    mode: Linked
    linkConfig:
      primary:
        url: https://0.0.0.0:8443 #Unisphere URL
        skipCertificateValidation: true # This setting determines if client side Unisphere certificate validation is to be skipped
        certSecret: "" # Provide this value if skipCertificateValidation is set to false
      backup: # This is an optional field and lets you configure a backup unisphere which can be used by proxy server
        url: https://0.0.0.0:8443 #Unisphere URL
        skipCertificateValidation: true
    standAloneConfig: # Set mode to "StandAlone" in order to use this config
       storageArrays:
          - storageArrayId: "000000000001"
            # Unisphere server managing the PowerMax array
            primaryURL: https://unisphere-1-addr:8443
            # proxyCredentialSecrets are used by the clients of the proxy to connect to it
            # If using proxy in the stand alone mode, then the driver must be provided the same secret.
            # The format of the proxy credential secret are exactly the same as the unisphere credential secret
            # For using the proxy with the driver, use the same proxy credential secrets for
            # all the managed storage arrays
            proxyCredentialSecrets:
	           - proxy-creds
          - storageArrayId: "000000000002"
            primaryURL: https://unisphere-2-addr:8443
             # An optional backup Unisphere server managing the same array
             # This can be used by the proxy to fall back to in case the primary
             # Unisphere is inaccessible temporarily
            backupURL: unisphere-3-addr:8443
            proxyCredentialSecrets:
               - proxy-creds
       managementServers:
          - url: https://unisphere-1-addr:8443
            # Secret containing the credentials of the Unisphere server
            arrayCredentialSecret: unsiphere-1-creds
            skipCertificateValidation: true
          - url: https://unisphere-2-addr:8443
            arrayCredentialSecret: unsiphere-2-creds
            skipCertificateValidation: true
          - url: https://unisphere-3-addr:8443
            arrayCredentialSecret: unsiphere-3-creds
            skipCertificateValidation: true

```

#### Installation
Copy the sample file - `powermax_reverseproxy.yaml` from the `samples` folder or use the sample available in the `OperatorHub` UI  
Edit and input all required parameters and then use the `OperatorHub` UI or run the following command to install the CSI PowerMax Reverse Proxy service:
```bash
  kubectl create -f powermax_reverseproxy.yaml
```
You can query for the deployment and service created as part of the installation using the following commands:
```bash  
  kubectl get deployment -n <namespace>
  kubectl get svc -n <namespace>
```
There is a new sample file - `powermax_revproxy_standalone_with_driver.yaml` in the `samples` folder which enables installation of
CSI PowerMax ReverseProxy in `StandAlone` mode along with the CSI PowerMax driver. This mode enables the CSI PowerMax driver to connect
to multiple Unisphere servers for managing multiple PowerMax arrays. Please follow the same steps described above to install ReverseProxy
with this new sample file.

## Dynamic Logging Configuration

This feature is introduced in CSI Driver for powermax version 2.0.0. 

### Operator based installation
As part of driver installation, a ConfigMap with the name `powermax-config-params` is created using the manifest located in the sample file. This ConfigMap contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver. To set the default/initial log level user can set this field during driver installation.

To update the log level dynamically user has to edit the ConfigMap `powermax-config-params` and update `CSI_LOG_LEVEL` to the desired log level.
```bash
kubectl edit configmap -n powermax powermax-config-params
```  
###  Sample  CRD file for  powermax  
You can find the sample CRD file [here](https://github.com/dell/dell-csi-operator/blob/main/samples/powermax_v260_k8s_126.yaml) 

>Note: 
 - `Kubelet config dir path` is not yet configurable in case of Operator based driver installation.
 - Also, snapshotter and resizer sidecars are not optional to choose, it comes default with Driver installation.

## Volume Health Monitoring
This feature is introduced in CSI Driver for PowerMax version 2.2.0.

### Operator based installation
Volume Health Monitoring feature is optional and by default this feature is disabled for drivers when installed via operator.

To enable this feature, set  `X_CSI_HEALTH_MONITOR_ENABLED` to `true` in the driver manifest under controller and node section. Also, install the `external-health-monitor` from `sideCars` section for controller plugin.
To get the volume health state `value` under controller should be set to true as seen below. To get the volume stats `value` under node should be set to true.
```yaml   
     # Install the 'external-health-monitor' sidecar accordingly.
        # Allowed values:
        #   true: enable checking of health condition of CSI volumes
        #   false: disable checking of health condition of CSI volumes
        # Default value: false
     controller:
       envs:
         - name: X_CSI_HEALTH_MONITOR_ENABLED
           value: "true"
     node:
       envs:
        # X_CSI_HEALTH_MONITOR_ENABLED: Enable/Disable health monitor of CSI volumes from node plugin - volume usage
        # Allowed values:
        #   true: enable checking of health condition of CSI volumes
        #   false: disable checking of health condition of CSI volumes
        # Default value: false
         - name: X_CSI_HEALTH_MONITOR_ENABLED
           value: "true"
```

## Support for custom topology keys 

This feature is introduced in CSI Driver for PowerMax version 2.3.0.

### Operator based installation

Support for custom topology keys is optional and by default this feature is disabled for drivers when installed via operator.

X_CSI_TOPOLOGY_CONTROL_ENABLED provides a way to filter topology keys on a node based on array and transport protocol. If enabled, user can create custom topology keys by editing node-topology-config configmap.

1. To enable this feature, set  `X_CSI_TOPOLOGY_CONTROL_ENABLED` to `true` in the driver manifest under node section. 

```yaml
   # X_CSI_TOPOLOGY_CONTROL_ENABLED provides a way to filter topology keys on a node based on array and transport protocol
        # if enabled, user can create custom topology keys by editing node-topology-config configmap.
        # Allowed values:
        #   true: enable the filtration based on config map
        #   false: disable the filtration based on config map
        # Default value: false
        - name: X_CSI_TOPOLOGY_CONTROL_ENABLED
          value: "false"
```
2. Edit the sample config map "node-topology-config" present in [sample CRD](#sample--crd-file-for--powermax) with appropriate values:

   | Parameter | Description  |  
   |-----------|--------------|
   | allowedConnections | List of node, array and protocol info for user allowed configuration |  
   | allowedConnections.nodeName | Name of the node on which user wants to apply given rules |
   | allowedConnections.rules | List of StorageArrayID:TransportProtocol pair |
   | deniedConnections | List of node, array and protocol info for user denied configuration |  
   | deniedConnections.nodeName | Name of the node on which user wants to apply given rules  |
   | deniedConnections.rules | List of StorageArrayID:TransportProtocol pair |
<br>
   
 >Note: Name of the configmap should always be `node-topology-config`.

## Support for auto RDM for vSphere over FC 

This feature is introduced in CSI Driver for PowerMax version 2.5.0.

### Operator based installation
Support for auto RDM for vSphere over FC feature is optional and by default this feature is disabled for drivers when installed via operator.

To enable this feature, set  `X_CSI_VSPHERE_ENABLED` to `true` in the driver manifest under controller and node section. 

```yaml
# VMware/vSphere virtualization support
        # set X_CSI_VSPHERE_ENABLED to true, if you to enable VMware virtualized environment support via RDM
        # Allowed values:
        #   "true" - vSphere volumes are enabled
        #   "false" - vSphere volumes are disabled
        # Default value: "false"
        - name: "X_CSI_VSPHERE_ENABLED"
          value: "false"
        # X_CSI_VSPHERE_PORTGROUP: An existing portGroup that driver will use for vSphere
        # recommended format: csi-x-VC-PG, x can be anything of user choice
        # Allowed value: valid existing port group on the array
        # Default value: "" <empty>
        - name: "X_CSI_VSPHERE_PORTGROUP"
          value: ""
        # X_CSI_VSPHERE_HOSTNAME: An existing host(initiator group)/ host group(cascaded intiator group) that driver will use for vSphere
        # this host/host group should contain initiators from all the ESXs/ESXi host where the cluster is deployed
        # recommended format: csi-x-VC-HN, x can be anything of user choice
        # Allowed value: valid existing host(initiator group)/ host group(cascaded intiator group) on the array
        # Default value: "" <empty>
        - name: "X_CSI_VSPHERE_HOSTNAME"
          value: ""
```
Edit the section in the driver manifest having the sample for the following `Secret` with required values.
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: vcenter-creds
  # Set driver namespace
  namespace: test-powermax
type: Opaque
data:
  # set username to the base64 encoded username
  username: YWRtaW4=
  # set password to the base64 encoded password
  password: YWRtaW4=
```
These values can be obtained using base64 encoding as described in the following example:
```bash
echo -n "myusername" | base64
echo -n "mypassword" | base64
```
where *myusername* and *mypassword* are credentials for a user with vCenter privileges.
