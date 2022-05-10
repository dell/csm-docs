---
title: PowerMax
description: >
  Installing CSI Driver for PowerMax via Operator
---

## Installing CSI Driver for PowerMax via Operator

CSI Driver for Dell PowerMax can be installed via the Dell CSI Operator.

To deploy the Operator, follow the instructions available [here](../).

There are sample manifests provided which can be edited to do an easy installation of the driver. Please note that the deployment of the driver using the operator does not use any Helm charts and the installation and configuration parameters will be slightly different from the ones specified via the Helm installer.

Kubernetes Operators make it easy to deploy and manage the entire lifecycle of complex Kubernetes applications. Operators use Custom Resource Definitions (CRD) which represents the application and use custom controllers to manage them.

### Prerequisite

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
   ```
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
   | X_CSI_POWERMAX_PROXY_SERVICE_NAME | Name of CSI PowerMax ReverseProxy service. Leave blank if not using reverse proxy | No | - |
   | X_CSI_GRPC_MAX_THREADS | Number of concurrent grpc requests allowed per client | No | 4 |
   | X_CSI_POWERMAX_DRIVER_NAME | Set custom CSI driver name. For more details on this feature see the related [documentation](../../../features/powermax/#custom-driver-name) | No | - |
   | X_CSI_HEALTH_MONITOR_ENABLED | Enable/Disable health monitor of CSI volumes from Controller and Node plugin. Provides details of volume status, usage and volume condition. As a prerequisite, external-health-monitor sidecar section should be uncommented in samples which would install the sidecar | No | false |
   | ***Node parameters***|
   | X_CSI_POWERMAX_ISCSI_ENABLE_CHAP | Enable ISCSI CHAP authentication. For more details on this feature see the related [documentation](../../../features/powermax/#iscsi-chap) | No | false |
5. Execute the following command to create the PowerMax custom resource:`kubectl create -f <input_sample_file.yaml>`. The above command will deploy the CSI-PowerMax driver.

### CSI PowerMax ReverseProxy

CSI PowerMax ReverseProxy is an optional component that can be installed with the CSI PowerMax driver. For more details on this feature see the related [documentation](../../../features/powermax#csi-powermax-reverse-proxy).

When you install CSI PowerMax ReverseProxy, dell-csi-operator will create a Deployment and ClusterIP service as part of the installation

**Note** - To use the ReverseProxy with the CSI PowerMax driver, the ReverseProxy service should be created before you install the CSIPowerMax driver.

#### Pre-requisites
Create a TLS secret that holds an SSL certificate and a private key which is required by the reverse proxy server. 
Use a tool such as `openssl` to generate this secret using the example below:

```
    openssl genrsa -out tls.key 2048
    openssl req -new -x509 -sha256 -key tls.key -out tls.crt -days 3650
    kubectl create secret -n powermax tls revproxy-certs --cert=tls.crt --key=tls.key
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
  image: dellemc/csipowermax-reverseproxy:v1.4.0 # <- CSI PowerMax Reverse Proxy image
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
             # If using proxy in the stand alone mode, then the driver must be provided the
             # same secret.
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

    kubectl create -f powermax_reverseproxy.yaml

You can query for the deployment and service created as part of the installation using the following commands:
  
    kubectl get deployment -n <namespace>
    kubectl get svc -n <namespace>

There is a new sample file - `powermax_revproxy_standalone_with_driver.yaml` in the `samples` folder which enables installation of
CSI PowerMax ReverseProxy in `StandAlone` mode along with the CSI PowerMax driver. This mode enables the CSI PowerMax driver to connect
to multiple Unisphere servers for managing multiple PowerMax arrays. Please follow the same steps described above to install ReverseProxy
with this new sample file.

## Dynamic Logging Configuration

This feature is introduced in CSI Driver for powermax version 2.0.0. 

### Operator based installation
As part of driver installation, a ConfigMap with the name `powermax-config-params` is created using the manifest located in the sample file. This ConfigMap contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver. To set the default/initial log level user can set this field during driver installation.

To update the log level dynamically user has to edit the ConfigMap `powermax-config-params` and update `CSI_LOG_LEVEL` to the desired log level.
```
kubectl edit configmap -n powermax powermax-config-params
```  
###  Sample  CRD file for  powermax   

``` yaml
apiVersion: storage.dell.com/v1
kind: CSIPowerMax
metadata:
  name: test-powermax
  namespace: test-powermax
spec:
  driver:
    # Config version for CSI PowerMax v2.3.0 driver
    configVersion: v2.3.0
    # replica: Define the number of PowerMax controller nodes
    # to deploy to the Kubernetes release
    # Allowed values: n, where n > 0
    # Default value: None
    replicas: 2
    dnsPolicy: ClusterFirstWithHostNet
    forceUpdate: false
    common:
      # Image for CSI PowerMax driver v2.3.0
      image: dellemc/csi-powermax:v2.3.0
      # imagePullPolicy: Policy to determine if the image should be pulled prior to starting the container.
      # Allowed values:
      #  Always: Always pull the image.
      #  IfNotPresent: Only pull the image if it does not already exist on the node.
      #  Never: Never pull the image.
      # Default value: None
      imagePullPolicy: IfNotPresent
      envs:
        # X_CSI_MANAGED_ARRAYS: Serial ID of the arrays that will be used for provisioning
        # Default value: None
        # Examples: "000000000001", "000000000002"
        - name: X_CSI_MANAGED_ARRAYS
          value: "000000000000,000000000001"
        # X_CSI_POWERMAX_ENDPOINT: Address of the Unisphere server that is managing the PowerMax arrays
        # Default value: None
        # Example: https://0.0.0.1:8443
        - name: X_CSI_POWERMAX_ENDPOINT
          value: "https://0.0.0.0:8443/"
        # X_CSI_K8S_CLUSTER_PREFIX: Define a prefix that is appended onto
        # all resources created in the Array
        # This should be unique per K8s/CSI deployment
        # maximum length of this value is 3 characters
        # Default value: None
        # Examples: "XYZ", "EMC"
        - name: X_CSI_K8S_CLUSTER_PREFIX
          value: "XYZ"
        # X_CSI_POWERMAX_PORTGROUPS: Define the set of existing port groups that the driver will use.
        # It is a comma separated list of portgroup names.
        # Required only in case of iSCSI port groups
        # Allowed values: iSCSI Port Group names
        # Default value: None
        # Examples: "pg1", "pg1, pg2"
        - name: "X_CSI_POWERMAX_PORTGROUPS"
          value: ""
        # "X_CSI_TRANSPORT_PROTOCOL" can be "FC" or "FIBRE" for fibrechannel,
        # "ISCSI" for iSCSI, or "" for autoselection.
        # Allowed values:
        #   "FC"    - Fiber Channel protocol
        #   "FIBER" - Fiber Channel protocol
        #   "ISCSI" - iSCSI protocol
        #   ""      - Automatic selection of transport protocol
        # Default value: "" <empty>
        - name: "X_CSI_TRANSPORT_PROTOCOL"
          value: ""
        # X_CSI_POWERMAX_PROXY_SERVICE_NAME: Refers to the name of the proxy service in kubernetes
        # Set this to "powermax-reverseproxy" if you are installing the proxy
        # Allowed values: "powermax-reverseproxy"
        # default values: "" <empty>
        - name: "X_CSI_POWERMAX_PROXY_SERVICE_NAME"
          value: ""
        # X_CSI_GRPC_MAX_THREADS: Defines the maximum number of concurrent grpc requests.
        # Set this value to a higher number (max 50) if you are using the proxy
        # Allowed values: n, where n > 4
        # default values: None
        - name: "X_CSI_GRPC_MAX_THREADS"
          value: "4"

    sideCars:
      # Uncomment the following to install 'external-health-monitor' sidecar to enable health monitor of CSI volumes from Controller plugin.
      # Also set the env variable controller.envs.X_CSI_HEALTH_MONITOR_ENABLED to "true" for controller plugin.
      # Also set the env variable node.envs.X_CSI_HEALTH_MONITOR_ENABLED to "true" for node plugin.
      #- name: external-health-monitor
      #  args: ["--monitor-interval=300s"]

    controller:
      envs:
        # X_CSI_HEALTH_MONITOR_ENABLED: Determines if the controller plugin will monitor health of CSI volumes- volume status, volume condition
        # Install the 'external-health-monitor' sidecar accordingly.
        # Allowed values:
        #   true: enable checking of health condition of CSI volumes
        #   false: disable checking of health condition of CSI volumes
        # Default value: false
        - name: X_CSI_HEALTH_MONITOR_ENABLED
          value: "false"
    node:
      envs:
        # X_CSI_POWERMAX_ISCSI_ENABLE_CHAP: Determine if the node plugin is going to configure
        # ISCSI node databases on the nodes with the CHAP credentials
        # If enabled, the CHAP secret must be provided in the credentials secret
        # and set to the key "chapsecret"
        # Allowed values:
        #   "true"  - CHAP is enabled
        #   "false" - CHAP is disabled
        # Default value: "false"
        - name: "X_CSI_POWERMAX_ISCSI_ENABLE_CHAP"
          value: "false"
        # X_CSI_HEALTH_MONITOR_ENABLED: Enable/Disable health monitor of CSI volumes from node plugin- volume usage, volume condition
        # Allowed values:
        #   true: enable checking of health condition of CSI volumes
        #   false: disable checking of health condition of CSI volumes
        # Default value: false
        - name: X_CSI_HEALTH_MONITOR_ENABLED
          value: "false"
---
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


Note: 
 - `dell-csi-operator` does not support the installation of CSI PowerMax ReverseProxy as a sidecar to the controller Pod. This facility is
    only present with `dell-csi-helm-installer`.
 - `Kubelet config dir path` is not yet configurable in case of Operator based driver installation.
 - Also, snapshotter and resizer sidecars are not optional to choose, it comes default with Driver installation.

## Volume Health Monitoring
This feature is introduced in CSI Driver for PowerMax version 2.2.0.

### Operator based installation
Volume Health Monitoring feature is optional and by default this feature is disabled for drivers when installed via operator.

To enable this feature, set  `X_CSI_HEALTH_MONITOR_ENABLED` to `true` in the driver manifest under controller and node section. Also, install the `external-health-monitor` from `sideCars` section for controller plugin.
To get the volume health state `value` under controller should be set to true as seen below. To get the volume stats `value` under node should be set to true.
   
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
