---
title: PowerMax
description: >
  Installing PowerMax CSI Driver via Operator
---

## Installing PowerMax CSI Driver via Operator

The CSI Driver for Dell EMC PowerMax can be installed via the Dell CSI Operator.

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
   Create a file called powermax-creds.yaml with the following content
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
   | ***Common parameters for node and controller*** |
   | X_CSI_K8S_CLUSTER_PREFIX | Define a prefix that is appended to all resources created in the array; unique per K8s/CSI deployment; max length - 3 characters | Yes | XYZ |
   | X_CSI_POWERMAX_ENDPOINT | IP address of the Unisphere for PowerMax | Yes | https://0.0.0.0:8443 |
   | X_CSI_TRANSPORT_PROTOCOL | Choose what transport protocol to use (ISCSI, FC, auto or None)	| Yes | auto |
   | X_CSI_POWERMAX_PORTGROUPS |List of comma-separated port groups (ISCSI only). Example: "PortGroup1,PortGroup2" | No | - | 
   | X_CSI_MANAGED_ARRAYS | List of comma-separated array id(s) which will be managed by the driver | Yes | - |
   | X_CSI_POWERMAX_PROXY_SERVICE_NAME | Name of CSI PowerMax ReverseProxy service. Leave blank if not using reverse proxy | No | - |
   | X_CSI_GRPC_MAX_THREADS | Number of concurrent grpc requests allowed per client | No | 4 |
   | X_CSI_POWERMAX_DRIVER_NAME | Set custom CSI driver name. For more details on this feature see the related [documentation](../../../features/powermax/#custom-driver-name-experimental-feature) | No | - |
   | X_CSI_IG_NODENAME_TEMPLATE | Template used for creating hosts on PowerMax. Example: "a-b-c-%foo%-xyz" where the text between the % symbols(foo) is replaced by the actual host name | No | - |
   | X_CSI_IG_MODIFY_HOSTNAME | Determines if the node plugin can rename any existing host on the PowerMax array. Use it with the node name template to rename the existing hosts | No | false 
   | X_CSI_POWERMAX_DEBUG | Determines if HTTP Request/Response is logged | No | false |
   | ***Node parameters***|
   | X_CSI_POWERMAX_ISCSI_ENABLE_CHAP | Enable ISCSI CHAP authentication. For more details on this feature see the related [documentation](../../../features/powermax/#iscsi-chap) | No | false |
5.  Execute the following command to create PowerMax custom resource:`kubectl create -f <input_sample_file.yaml>`. The above command will deploy the CSI-PowerMax driver.

>Note: There is a new mandatory env - `X_CSI_MANAGED_ARRAYS` which has to be set while installing or upgrading the driver.

### CSI PowerMax ReverseProxy

CSI PowerMax ReverseProxy is an optional component that can be installed along with the CSI PowerMax driver. For more details on this feature see the related [documentation](../../../features/powermax#csi-powermax-reverse-proxy).

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

>Note: Only one of the `Linked` or `StandAlone` config needs to be supplied. The appropriate `mode` needs to set in the spec as well.

Here is a sample manifest with each field annotated. A copy of this manifest is provided in the `samples` folder
```yaml
apiVersion: storage.dell.com/v1
kind: CSIPowerMaxRevProxy
metadata:
  name: powermax-reverseproxy # <- Name of the CSIPowerMaxRevProxy object
  namespace: test-powermax # <- Set the namespace to where you will install the CSI PowerMax driver
spec:
  # Image for CSI PowerMax ReverseProxy
  image: dellemc/csipowermax-reverseproxy:v1.3.0 # <- CSI PowerMax Reverse Proxy image 
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

There is a new sample file - `powermax_revproxy_standalone_with_driver.yaml` present in the `samples` folder which enables installation of
CSI PowerMax ReverseProxy in `StandAlone` mode along with the CSI PowerMax driver. This mode enables the CSI PowerMax driver to connect
to multiple Unisphere servers for managing multiple PowerMax arrays. Please follow the same steps described above to install ReverseProxy
with this new sample file.

>Note: `dell-csi-operator` doesn't support the installation of CSI PowerMax ReverseProxy as a sidecar to the controller pod. This facility is
> only present with the `dell-csi-helm-installer`