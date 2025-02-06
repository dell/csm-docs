---
title: PowerMax
linkTitle: "PowerMax"
description: >
  Installing Dell CSI Driver for PowerMax via Dell CSM Operator
---

The CSI Driver for Dell PowerMax can be installed via the Dell CSM Operator.
To deploy the Operator, follow the instructions available [here](../../#installation).

Note that the deployment of the driver using the operator does not use any Helm charts and the installation and configuration parameters will be slightly different from the one specified via the Helm installer.

## Prerequisites
The CSI Driver for Dell PowerMax can create PVC with different storage protocols access :
* direct Fiber Channel
* direct iSCSI
* NFS
* Fiber Channel via VMware Raw Device Mapping
In most cases, you will use one protocol only; therefore you should comply with the according prerequisites and not the others.
* If enabling CSM Replication, both source and target storage systems must be locally managed by Unisphere.
  * _Example_: When using two Unisphere instances, the first Unisphere instance should be configured with the source storage system as locally
  managed and target storage system as remotely managed. The second Unisphere configuration should mirror the first — locally managing the target storage system and
  remotely managing the source storage system.


### Listing installed drivers with the ContainerStorageModule CRD
User can query for all Dell CSI drivers using this command:
```bash
kubectl get csm --all-namespaces
```


### Fibre Channel Requirements

CSI Driver for Dell PowerMax supports Fibre Channel communication. Ensure that the following requirements are met before you install CSI Driver:
- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port director must be completed.
- Ensure that the HBA WWNs (initiators) appear on the list of initiators that are logged into the array.
- If the number of volumes that will be published to nodes is high, then configure the maximum number of LUNs for your HBAs on each node. See the appropriate HBA document to configure the maximum number of LUNs.

### iSCSI Requirements

The CSI Driver for Dell PowerMax supports iSCSI connectivity. These requirements are applicable for the nodes that use iSCSI initiator to connect to the PowerMax arrays.

Set up the iSCSI initiators as follows:
- All Kubernetes nodes must have the _iscsi-initiator-utils_ package installed.
- Ensure that the iSCSI initiators are available on all the nodes where the driver node plugin will be installed.
- Kubernetes nodes should have access (network connectivity) to an iSCSI director on the Dell PowerMax array that has IP interfaces. Manually create IP routes for each node that connects to the Dell PowerMax if required.
- Ensure that the iSCSI initiators on the nodes are not a part of any existing Host (Initiator Group) on the Dell PowerMax array.
- The CSI Driver needs the port group names containing the required iSCSI director ports. These port groups must be set up on each Dell PowerMax array. All the port group names supplied to the driver must exist on each Dell PowerMax with the same name.

For more information about configuring iSCSI, see [Dell Host Connectivity guide](https://elabnavigator.dell.com/vault/pdf/Linux.pdf?key=1725374107988).

##### iscsi-daemon `MachineConfig`
To configure iSCSI in Red Hat OpenShift clusters, you can create a `MachineConfig` object using the console or `oc` to ensure that the iSCSI daemon starts on all the Red Hat CoreOS nodes. Here is an example of a `MachineConfig` object:

```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: 99-iscsid
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 3.2.0
    systemd:
      units:
      - name: "iscsid.service"
        enabled: true
```
Once the `MachineConfig` object has been deployed, CoreOS will ensure that `iscsid.service` starts automatically.

Alternatively, you can check the status of the iSCSI service by entering the following command on each worker node in the cluster:

```bash
sudo systemctl status iscsid
```

The service should be up and running (i.e. should be active state).

If the `iscsid.service` is not running, then perform the following steps on each worker node in the cluster
1. `Login` to worker nodes and check if the file /etc/iscsi/initiatorname.iscsi has been created properly
2. If the file doesn't exist or it doesn't contain a valid ISCSI IQN, then make sure it exists with valid entries
3. Ensure that iscsid service is running - Enable ```sudo systemctl enable iscsid``` & restart ```sudo systemctl restart iscsid``` iscsid if necessary.
Note: If your worker nodes are running Red Hat CoreOS, make sure that automatic ISCSI login at boot is configured. Please contact RedHat for more details.

### NFS requirements

CSI Driver for Dell PowerMax supports NFS communication. Ensure that the following requirements are met before you install CSI Driver:
- Configure the NFS network. Please refer [here](https://dl.dell.com/content/manual57826791-dell-powermax-file-protocol-guide.pdf?language=en-us&ps=true) for more details.
- PowerMax Embedded Management guest to access Unisphere for PowerMax.
- Create the NAS server. Please refer [here](https://dl.dell.com/content/manual55638050-dell-powermax-file-quick-start-guide.pdf?language=en-us&ps=true) for more details.

### Linux multipathing requirements

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

#### multipathd `MachineConfig`

If you are installing a CSI Driver which requires the installation of the Linux native Multipath software - _multipathd_, please follow the below instructions

To enable multipathd on RedHat CoreOS nodes you need to prepare a working configuration encoded in base64.

```bash echo 'defaults {
user_friendly_names yes
find_multipaths yes
}
blacklist {
}' | base64 -w0
```

Use the base64 encoded string output in the following `MachineConfig` yaml file (under source section)
```yaml
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: workers-multipath-conf-default
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 3.2.0
    storage:
      files:
      - contents:
          source: data:text/plain;charset=utf-8;base64,ZGVmYXVsdHMgewp1c2VyX2ZyaWVuZGx5X25hbWVzIHllcwpmaW5kX211bHRpcGF0aHMgeWVzCn0KCmJsYWNrbGlzdCB7Cn0K
          verification: {}
        filesystem: root
        mode: 400
        path: /etc/multipath.conf
```
After deploying this`MachineConfig` object, CoreOS will start multipath service automatically.
Alternatively, you can check the status of the multipath service by entering the following command in each worker nodes.
`sudo multipath -ll`

If the above command is not successful, ensure that the /etc/multipath.conf file is present and configured properly. Once the file has been configured correctly, enable the multipath service by running the following command:
`sudo /sbin/mpathconf –-enable --with_multipathd y`

Finally, you have to restart the service by providing the command
`sudo systemctl restart multipathd`

For additional information refer to official documentation of the multipath configuration.


#### PowerPath for Linux requirements

CSI Driver for Dell PowerMax supports PowerPath for Linux. Configure Linux PowerPath before installing the CSI Driver.

Follow this procedure to set up PowerPath for Linux:

- All the nodes must have the PowerPath package installed . Download the PowerPath archive for the environment from [Dell Online Support](https://www.dell.com/support/home/en-in/product-support/product/powerpath-for-linux/drivers).
- `Untar` the PowerPath archive, Copy the RPM package into a temporary folder and Install PowerPath using `rpm -ivh DellEMCPower.LINUX-<version>-<build>.<platform>.x86_64.rpm`
- Start the PowerPath service using `systemctl start PowerPath`

>Note: Do not install Dell PowerPath if multi-path software is already installed, as they cannot co-exist with native multi-path software.


### Auto RDM for vSphere over FC requirements

The CSI Driver for Dell PowerMax supports auto RDM for vSphere over FC. These requirements are applicable for the clusters deployed on ESX/ESXi using virtualized environment.

Set up the environment as follows:

- Requires VMware vCenter management software to manage all ESX/ESXis where the cluster is hosted.

- Add all FC array ports zoned to the ESX/ESXis to a port group where the cluster is hosted .

- Add initiators from all ESX/ESXis to a host(initiator group)/host group(cascaded initiator group) where the cluster is hosted.
- Create a secret which contains vCenter privileges. Follow the steps [here](#support-for-auto-rdm-for-vsphere-over-fc) to create the same.

### CSI PowerMax ReverseProxy

CSI PowerMax ReverseProxy is a component that will be installed with the CSI PowerMax driver. For more details on this feature, see the related [documentation](https://dell.github.io/csm-docs/docs/csidriver/features/powermax/#csi-powermax-reverse-proxy).

#### Pre-requisites
Create a TLS secret that holds an SSL certificate and a private key. This is required by the reverse proxy server.
Use a tool such as `openssl` to generate this secret using the example below:

```bash
openssl genrsa -out tls.key 2048
openssl req -new -x509 -sha256 -key tls.key -out tls.crt -days 3650
kubectl create secret -n <namespace> tls csirevproxy-tls-secret --cert=tls.crt --key=tls.key
```

## Installation

### (Optional) Create secret for client-side TLS verification
Create a secret named powermax-certs in the namespace where the CSI PowerMax driver will be installed. This is an optional step and is only required if you are setting the env variable X_CSI_POWERMAX_SKIP_CERTIFICATE_VALIDATION to false. See the detailed documentation on how to create this secret [here](../../../helm/drivers/installation/powermax#certificate-validation-for-unisphere-rest-api-calls).


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
3. Create a configmap using sample [here](https://github.com/dell/csm-operator/tree/master/samples/csireverseproxy). Fill in the appropriate values for driver configuration.
   Example: config.yaml
   ```yaml
   mode: StandAlone # Mode for the reverseproxy, should not be changed
   port: 2222 # Port on which reverseproxy will listen
   logLevel: debug
   logFormat: text
   standAloneConfig:
     storageArrays:
        - storageArrayId: "000000000001" # arrayID
          primaryURL: https://primary-1.unisphe.re:8443 # primary unisphere for arrayID
          backupURL: https://backup-1.unisphe.re:8443   # backup unisphere for arrayID
          proxyCredentialSecrets:
            - proxy-secret-11 # credential secret for primary unisphere, e.g., powermax-creds
            - proxy-secret-12 # credential secret for backup unisphere, e.g., powermax-creds
        - storageArrayId: "000000000002"
          primaryURL: https://primary-2.unisphe.re:8443
          backupURL: https://backup-2.unisphe.re:8443
          proxyCredentialSecrets:
           - proxy-secret-21
           - proxy-secret-22
     managementServers:
       - url: https://primary-1.unisphe.re:8443 # primary unisphere endpoint
         arrayCredentialSecret: primary-1-secret # primary credential secret e.g., powermax-creds
         skipCertificateValidation: true
       - url: https://backup-1.unisphe.re:8443 # backup unisphere endpoint
         arrayCredentialSecret: backup-1-secret # backup credential secret e.g., powermax-creds
         skipCertificateValidation: false # value false, to verify unisphere certificate and provide certSecret
         certSecret: primary-certs # unisphere verification certificate
       - url: https://primary-2.unisphe.re:8443
         arrayCredentialSecret: primary-2-secret
         skipCertificateValidation: true
       - url: https://backup-2.unisphe.re:8443
         arrayCredentialSecret: backup-2-secret
         skipCertificateValidation: false
         certSecret: primary-certs
   ```
   After editing the file, run this command to create a secret called `powermax-reverseproxy-config`. If you are using a different namespace/secret name, just substitute those into the command.
    ```bash
    kubectl create configmap powermax-reverseproxy-config --from-file config.yaml -n powermax
    ```

4. Create a CR (Custom Resource) for PowerMax using the sample files provided [here](https://github.com/dell/csm-operator/tree/master/samples). This file can be modified to use custom parameters if needed.
5. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerMax driver and their default values:

   | Parameter | Description | Required | Default |
   |-----------|-------------|----------|---------|
   | namespace | Specifies namespace where the driver will be installed | Yes | "powermax" |
   | dnsPolicy | Determines the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
   | replicas  | Controls the number of controller Pods you deploy. If controller Pods are greater than the number of available nodes, excess Pods will become stuck in pending. The default is 2 which allows for Controller high availability.                                          | Yes      | 2                              |
   | fsGroupPolicy                                   | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field.                                                                                                                                                                  | No       | "ReadWriteOnceWithFSType"      |
   | ***Common parameters for node and controller*** |                                                                                                                                                                                                                                                                          |          |                                |
   | X_CSI_K8S_CLUSTER_PREFIX                        | Define a prefix that is appended to all resources created in the array; unique per K8s/CSI deployment; max length - 3 characters                                                                                                                                         | Yes      | XYZ                            |
   | X_CSI_POWERMAX_ENDPOINT                         | IP address of the Unisphere for PowerMax                                                                                                                                                                                                                                 | Yes      | https://0.0.0.0:8443           |
   | X_CSI_TRANSPORT_PROTOCOL                        | Choose which transport protocol to use (ISCSI, FC, auto)	                                                                                                                                                                                                        | Yes      | auto                           |
   | X_CSI_POWERMAX_PORTGROUPS                       | List of comma-separated port groups (ISCSI only). Example: "PortGroup1,PortGroup2"                                                                                                                                                                                       | No       | -                              |
   | X_CSI_MANAGED_ARRAYS                            | List of comma-separated array ID(s) which will be managed by the driver                                                                                                                                                                                                  | Yes      | -                              |
   | X_CSI_POWERMAX_PROXY_SERVICE_NAME               | Name of CSI PowerMax ReverseProxy service.                                                                                                                                                                                                                               | Yes      | csipowermax-reverseproxy       |
   | X_CSI_IG_MODIFY_HOSTNAME                        | Change any existing host names. When nodenametemplate is set, it changes the name to the specified format else it uses driver default host name format.                                                                                                                  | No       | false                          |
   | X_CSI_IG_NODENAME_TEMPLATE                      | Provide a template for the CSI driver to use while creating the Host/IG on the array for the nodes in the cluster. It is of the format a-b-c-%foo%-xyz where foo will be replaced by host name of each node in the cluster.                                              | No       | -                              |
   | X_CSI_POWERMAX_DRIVER_NAME                      | Set custom CSI driver name. For more details on this feature see the related [documentation](../../../../csidriver/features/powermax/#custom-driver-name)                                                                                                                             | No       | -                              |
   | X_CSI_HEALTH_MONITOR_ENABLED                    | Enable/Disable health monitor of CSI volumes from Controller and Node plugin. Provides details of volume status, usage and volume condition. As a prerequisite, external-health-monitor sidecar section should be uncommented in samples which would install the sidecar | No       | false                          |
   | X_CSI_VSPHERE_ENABLED                           | Enable VMware virtualized environment support via RDM                                                                                                                                                                                                                    | No       | false                          |
   | X_CSI_VSPHERE_PORTGROUP                         | Existing portGroup that driver will use for vSphere                                                                                                                                                                                                                      | Yes      | ""                             |
   | X_CSI_VSPHERE_HOSTNAME                          | Existing host(initiator group)/host group(cascaded initiator group) that driver will use for vSphere                                                                                                                                                                     | Yes      | ""                             |
   | X_CSI_VCenter_HOST                              | URL/endpoint of the vCenter where all the ESX are present                                                                                                                                                                                                                | Yes      | ""                             |
   | ***Node parameters***                           |                                                                                                                                                                                                                                                                          |          |                                |
   | X_CSI_POWERMAX_ISCSI_ENABLE_CHAP                | Enable ISCSI CHAP authentication. For more details on this feature see the related [documentation](../../../../csidriver/features/powermax/#iscsi-chap)                                                                                                                               | No       | false                          |
   | X_CSI_TOPOLOGY_CONTROL_ENABLED                  | Enable/Disable topology control. It filters out arrays, associated transport protocol available to each node and creates topology keys based on any such user input.                                                                                                      | No       | false                          |
   | ***CSI Reverseproxy Module***                   |                                                                                                                                                                                                                                                                          |          |                                |
   | X_CSI_REVPROXY_TLS_SECRET                       | Name of TLS secret defined in config map                                                                                                                                                                                                                                 | Yes      | "csirevproxy-tls-secret"       |
   | X_CSI_REVPROXY_PORT                             | Port number where reverseproxy will listen as defined in config map                                                                                                                                                                                                      | Yes      | "2222"                         |
   | X_CSI_CONFIG_MAP_NAME                           | Name of config map as created for CSI PowerMax                                                                                                                                                                                                                           | Yes      | "powermax-reverseproxy-config" |
   | ***Sidecar parameters*** |
   | volume-name-prefix | The volume-name-prefix will be used by provisioner sidecar as a prefix for all the volumes created  | Yes | pmax |
   | monitor-interval | The monitor-interval will be used by external-health-monitor as an interval for health checks  | Yes | 60s |

6. Execute the following command to create the PowerMax custom resource:`kubectl create -f <input_sample_file.yaml>`. The above command will deploy the CSI-PowerMax driver.
7. The mandatory module CSI PowerMax Reverseproxy will be installed automatically with the same command.
8. Refer https://github.com/dell/csi-powermax/tree/main/samples for the sample files.

## Other features to enable
### Dynamic Logging Configuration

This feature is introduced in CSI Driver for powermax version 2.0.0.

As part of driver installation, a ConfigMap with the name `powermax-config-params` is created using the manifest located in the sample file. This ConfigMap contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver. To set the default/initial log level user can set this field during driver installation.

To update the log level dynamically user has to edit the ConfigMap `powermax-config-params` and update `CSI_LOG_LEVEL` to the desired log level.
```bash
kubectl edit configmap -n powermax powermax-config-params
```

### Volume Health Monitoring
This feature is introduced in CSI Driver for PowerMax version 2.2.0.

Volume Health Monitoring feature is optional and by default this feature is disabled for drivers when installed via CSM operator.

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

### Support for custom topology keys

This feature is introduced in CSI Driver for PowerMax version 2.3.0.

Support for custom topology keys is optional and by default this feature is disabled for drivers when installed via CSM operator.

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
2. Edit the sample config map "node-topology-config" as described [here](https://github.com/dell/csi-powermax/blob/main/samples/configmap/topologyConfig.yaml) with appropriate values:
   Example:
   ```yaml
           kind: ConfigMap
           metadata:
             name: node-topology-config
             namespace: powermax
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
   | Parameter | Description  |
   |-----------|--------------|
   | allowedConnections | List of node, array and protocol info for user allowed configuration |
   | allowedConnections.nodeName | Name of the node on which user wants to apply given rules |
   | allowedConnections.rules | List of StorageArrayID:TransportProtocol pair |
   | deniedConnections | List of node, array and protocol info for user denied configuration |
   | deniedConnections.nodeName | Name of the node on which user wants to apply given rules  |
   | deniedConnections.rules | List of StorageArrayID:TransportProtocol pair |
<br>

3. Run following command to create the configmap
  ```bash
  kubectl create -f topologyConfig.yaml
  ```
 >Note: Name of the configmap should always be `node-topology-config`.

### Support for auto RDM for vSphere over FC

This feature is introduced in CSI Driver for PowerMax version 2.5.0.

Support for auto RDM for vSphere over FC feature is optional and by default this feature is disabled for drivers when installed via CSM operator.

1. To enable this feature, set  `X_CSI_VSPHERE_ENABLED` to `true` in the driver manifest under controller and node section.

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
           # X_CSI_VSPHERE_HOSTNAME: An existing host(initiator group)/ host group(cascaded initiator group) that driver will use for vSphere
           # this host/host group should contain initiators from all the ESXs/ESXi host where the cluster is deployed
           # recommended format: csi-x-VC-HN, x can be anything of user choice
           # Allowed value: valid existing host(initiator group)/ host group(cascaded initiator group) on the array
           # Default value: "" <empty>
           - name: "X_CSI_VSPHERE_HOSTNAME"
             value: ""
   ```
2. Edit the `Secret` file vcenter-creds [here](https://github.com/dell/csi-powermax/blob/main/samples/secret/vcenter-secret.yaml) with required values.
Example:
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: vcenter-creds
     # Set driver namespace
     namespace: powermax
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
3.
4. Run following command to create the configmap
  ```bash
  kubectl create -f vcenter-secret.yaml
  ```
>Note: Name of the secret should always be `vcenter-creds`.
