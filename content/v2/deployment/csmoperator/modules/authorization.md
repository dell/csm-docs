---
title: Authorization
linkTitle: "Authorization"
description: >
  Installing Authorization via Dell CSM Operator
---

{{% pageinfo color="primary" %}}
The CSM Authorization karavictl CLI is no longer actively maintained or supported. It will be deprecated in CSM 2.0.
{{% /pageinfo %}}

## Install CSM Authorization via Dell CSM Operator

The CSM Authorization module for supported Dell CSI Drivers can be installed via the Dell CSM Operator.
To deploy the Operator, follow the instructions available [here](../../#installation).

### Prerequisite

1. Execute `kubectl create namespace authorization` to create the authorization namespace (if not already present). Note that the namespace can be any user-defined name, in this example, we assume that the namespace is 'authorization'. 

2. Install cert-manager CRDs 
```bash

kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.6.1/cert-manager.crds.yaml
```

3. Prepare `samples/authorization/config.yaml` provided [here](https://github.com/dell/csm-operator/blob/main/samples/authorization/config.yaml) which contains the JWT signing secret. The following table lists the configuration parameters.

    | Parameter | Description                                                  | Required | Default |
    | --------- | ------------------------------------------------------------ | -------- | ------- |
    | web.jwtsigningsecret  | String used to sign JSON Web Tokens                       | true     | secret       |.

    Example:

    ```yaml
    web:
      jwtsigningsecret: randomString123
    ```

    After editing the file, run this command to create a secret called `karavi-config-secret`:
    
    ```bash

    kubectl create secret generic karavi-config-secret -n authorization --from-file=config.yaml=samples/authorization/config.yaml
    ```

    Use this command to replace or update the secret:

    ```bash
    
    kubectl create secret generic karavi-config-secret -n authorization --from-file=config.yaml=samples/authorization/config.yaml -o yaml --dry-run=client | kubectl replace -f -
    ```

4. Create the `karavi-storage-secret` using the file provided [here](https://github.com/dell/csm-operator/blob/main/samples/authorization/karavi-storage-secret.yaml) to store storage system credentials.

    Use this command to create the secret:

    ```bash

    kubectl create -f samples/authorization/karavi-storage-secret.yaml
    ```

5. Prepare a storage class for Redis to use for persistence. If not supplied, the default storage class in your environment is used. 

    Example, if using CSM Authorization for PowerScale:

    ```yaml
      apiVersion: storage.k8s.io/v1
      kind: StorageClass
      metadata:
        name: isilon
      provisioner: csi-isilon.dellemc.com
      reclaimPolicy: Delete
      allowVolumeExpansion: true
      parameters:
        # The name of the access zone a volume can be created in
        # Optional: true
        # Default value: default value specified in values.yaml
        # Examples: System, zone1
        AccessZone: System

        # The base path for the volumes to be created on PowerScale cluster.
        # Ensure that this path exists on PowerScale cluster.
        # Allowed values: unix absolute path
        # Optional: true
        # Default value: value specified in values.yaml for isiPath
        # Examples: /ifs/data/csi, /ifs/engineering
        IsiPath: /ifs/data/csi

        # The permissions for isi volume directory path
        # This value overrides the isiVolumePathPermissions attribute of corresponding cluster config in secret, if present
        # Allowed values: valid octal mode number
        # Default value: "0777"
        # Examples: "0777", "777", "0755"
        #IsiVolumePathPermissions: "0777"

        # AccessZone groupnet service IP. Update AzServiceIP if different than endpoint.
        # Optional: true
        # Default value: endpoint of the cluster ClusterName
        #AzServiceIP : 192.168.2.1

        # When a PVC is being created, this parameter determines, when a node mounts the PVC,
        # whether to add the k8s node to the "Root clients" field or "Clients" field of the NFS export
        # Allowed values:
        #   "true": adds k8s node to the "Root clients" field of the NFS export
        #   "false": adds k8s node to the "Clients" field of the NFS export
        # Optional: true
        # Default value: "false"
        RootClientEnabled: "false"

        # Name of PowerScale cluster, where pv will be provisioned.
        # This name should match with name of one of the cluster configs in isilon-creds secret.
        # If this parameter is not specified, then default cluster config in isilon-creds secret
        # will be considered if available.
        # Optional: true
        #ClusterName: <cluster_name>

        # Sets the filesystem type which will be used to format the new volume
        # Optional: true
        # Default value: None
        #csi.storage.k8s.io/fstype: "nfs"

      # volumeBindingMode controls when volume binding and dynamic provisioning should occur.
      # Allowed values:
      #   Immediate: indicates that volume binding and dynamic provisioning occurs once the
      #   PersistentVolumeClaim is created
      #   WaitForFirstConsumer: will delay the binding and provisioning of a PersistentVolume
      #   until a Pod using the PersistentVolumeClaim is created
      # Default value: Immediate
      volumeBindingMode: Immediate

      # allowedTopologies helps scheduling pods on worker nodes which match all of below expressions.
      # If enableCustomTopology is set to true in helm values.yaml, then do not specify allowedTopologies
      # Change all instances of <ISILON_IP> to the IP of the PowerScale OneFS API server
      #allowedTopologies:
      #  - matchLabelExpressions:
      #      - key: csi-isilon.dellemc.com/<ISILON_IP>
      #        values:
      #          - csi-isilon.dellemc.com

      # specify additional mount options for when a Persistent Volume is being mounted on a node.
      # To mount volume with NFSv4, specify mount option vers=4. Make sure NFSv4 is enabled on the Isilon Cluster
      #mountOptions: ["<mountOption1>", "<mountOption2>", ..., "<mountOptionN>"]
    ```

    Save the file and create it by using 
    ```bash
    kubectl create -f <input_file.yaml>
    ```

### Install CSM Authorization Proxy Server

1. Follow all the [prerequisites](#prerequisite).

2. Create a CR (Custom Resource) for Authorization using the sample file provided [here](https://github.com/dell/csm-operator/blob/main/samples/authorization/csm_authorization_proxy_server_v1100.yaml). This file can be modified to use custom parameters if needed.

3. Users should configure the parameters in the CR. This table lists the primary configurable parameters of the Authorization Proxy Server and their default values:

   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | **authorization** | This section configures the CSM-Authorization components. | - | - |
   | PROXY_HOST | The hostname to configure the self-signed certificate (if applicable), and the proxy service Ingress. | Yes | csm-authorization.com |
   | PROXY_INGRESS_CLASSNAME | The ingressClassName of the proxy-service Ingress. | Yes | nginx |
   | PROXY_INGRESS_HOSTS | Additional host rules to be applied to the proxy-service Ingress.  | No | authorization-ingress-nginx-controller.authorization.svc.cluster.local |
   | REDIS_STORAGE_CLASS | The storage class for Redis to use for persistence. If not supplied, the default storage class is used. | Yes | - |
   | **ingress-nginx** | This section configures the enablement of the NGINX Ingress Controller. | - | - |
   | enabled | Enable/Disable deployment of the NGINX Ingress Controller. Set to false if you already have an Ingress Controller installed. | No | true |
   | **cert-manager** | This section configures the enablement of cert-manager. | - | - |
   | enabled | Enable/Disable deployment of cert-manager. Set to false if you already have cert-manager installed. | No | true |

**Optional:**
To enable reporting of trace data with [Zipkin](https://zipkin.io/), use the `csm-config-params` configMap in the sample CR or dynamically by editing the configMap.

  Add the Zipkin values to the configMap where `ZIPKIN_ADDRESS` is the IP address or hostname of the Zipkin server.
  ```bash
  ZIPKIN_URI: "http://ZIPKIN_ADDRESS:9411/api/v2/spans"
  ZIPKIN_PROBABILITY: "1.0"
  ```

4. Execute this command to create the Authorization CR:

    ```bash
    
    kubectl create -f samples/authorization/csm_authorization_proxy_server_v1100.yaml
    ```

  >__Note__:  
  > - This command will deploy the Authorization Proxy Server in the namespace specified in the input YAML file.

5. Create the `karavi-auth-tls` secret using your own certificate or by using a self-signed certificate generated via cert-manager. 

    If using your own certificate that is valid for each Ingress hostname, use this command to create the `karavi-auth-tls` secret:

    ```bash

    kubectl create secret tls karavi-auth-tls -n authorization --key <location-of-private-key-file> --cert <location-of-certificate-file>
    ```

    If using a self-signed certificate, prepare `samples/authorization/certificate_v1100.yaml` provided [here](https://github.com/dell/csm-operator/blob/main/samples/authorization/certificate_v1100.yaml). An entry for each hostname specified in the CR must be added under `dnsNames` for the certificate to be valid for each Ingress. 

    Use this command to create the `karavi-auth-tls` secret:

    ```bash
    kubectl create -f samples/authorization/certificate_v1100.yaml
    ```

### Verify Installation of the CSM Authorization Proxy Server
Once the Authorization CR is created, you can verify the installation as mentioned below:

  ```bash
  kubectl describe csm/<name-of-custom-resource> -n <namespace>
  ```

### Install Karavictl

Follow the instructions available in CSM Authorization for [Installing karavictl](../../../../authorization/deployment/helm/#install-karavictl).

### Configuring the CSM Authorization Proxy Server

Follow the instructions available in CSM Authorization for [Configuring the CSM Authorization Proxy Server](../../../../authorization/configuration/proxy-server/#configuring-the-csm-authorization-proxy-server).

### Configuring a Dell CSI Driver with CSM Authorization

Follow the instructions available in CSM Authorization for [Configuring a Dell CSI Driver with CSM for Authorization](../../../../authorization/configuration/#configuring-a-dell-csi-driver-with-csm-for-authorization).
