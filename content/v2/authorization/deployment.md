---
title: Deployment
linktitle: Deployment 
weight: 2
description: >
  Dell EMC Container Storage Modules (CSM) for Authorization deployment
---

This section outlines the deployment steps for Container Storage Modules (CSM) for Authorization.  The deployment of CSM for Authorization is handled in 2 parts:
- Deploying the CSM for Authorization proxy server, to be controlled by storage administrators
- Configuring one to many [supported](../../authorization#supported-csi-drivers) Dell EMC CSI drivers with CSM for Authorization

## Prerequisites

The CSM for Authorization proxy server requires a Linux host with the following minimum resource allocations:
- 32 GB of memory
- 4 CPU
- 200 GB local storage

## Deploying the CSM Authorization Proxy Server

The first part deploying CSM for Authorization is installing the proxy server.  This activity and the administration of the proxy server will be owned by the storage administrator. 

The CSM for Authorization proxy server is installed using a single binary installer.

### Single Binary Installer

The easiest way to obtain the single binary installer RPM is directly from the [GitHub repository's releases](https://github.com/dell/karavi-authorization/releases) section.  

The single binary installer can also be built from source by cloning the [GitHub repository](https://github.com/dell/karavi-authorization) and using the following Makefile targets to build the installer:

```
make dist build-installer rpm
```

The `build-installer` step creates a binary at `bin/deploy` and embeds all components required for installation. The `rpm` step generates an RPM package and stores it at `deploy/rpm/x86_64/`.
This allows CSM for Authorization to be installed in network-restricted environments.

A Storage Administrator can execute the installer or rpm package as a root user or via `sudo`.

### Installing the RPM

1. Before installing the rpm, some network and security configuration inputs need to be provided in json format. The json file should be created in the location `$HOME/.karavi/config.json` having the following contents:

    ```json
    {
      "web": {
        "sidecarproxyaddr": "docker_registry/sidecar-proxy:latest",
        "jwtsigningsecret": "secret"
      },
      "proxy": {
        "host": ":8080"
      },
      "zipkin": {
        "collectoruri": "http://DNS_host_name:9411/api/v2/spans",
        "probability": 1
      },
      "certificate": {
        "keyFile": "path_to_private_key_file",
        "crtFile": "path_to_host_cert_file",
        "rootCertificate": "path_to_root_CA_file"
      },
      "hostName": "DNS_host_name"
    }
    ```

    In the above template, `DNS_host_name` refers to the hostname of the system in which the CSM for Authorization server will be installed. This hostname can be found by running the below command on the system:

    ```
    nslookup <IP_address>
    ```

2. In order to configure secure grpc connectivity, an additional subdomain in the format `grpc.DNS_host_name` is also required. All traffic from `grpc.DNS_host_name` needs to be routed to `DNS_host_name` address, this can be configured by adding a new DNS entry for `grpc.DNS_host_name` or providing a temporary path in the `/etc/hosts` file.  

    **NOTE:** The certificate provided in `crtFile` should be valid for both the `DNS_host_name` and the `grpc.DNS_host_name` address.  

    For example, create the certificate config file with alternate names (to include example.com and grpc.example.com) and then create the .crt file:  

        ```
        CN = example.com
        subjectAltName = @alt_names
        [alt_names]
        DNS.1 = grpc.example.com

        openssl x509 -req -in cert_request_file.csr -CA root_CA.pem -CAkey private_key_File.key -CAcreateserial -out example.com.crt -days 365 -sha256
        ```

3. To install the rpm package on the system, run the below command:

    ```shell
    rpm -ivh <rpm_file_name>
    ```

4. After installation, application data will be stored on the system under `/var/lib/rancher/k3s/storage/`.

## Configuring the CSM for Authorization Proxy Server

The storage administrator must first configure the proxy server with the following:
- Storage systems
- Tenants
- Roles
- Bind roles to tenants

Run the following commands on the Authorization proxy server:

  ```console
  # Specify any desired name
  export RoleName=""
  export RoleQuota=""
  export TenantName=""

  # Specify info about Array1
  export Array1Type=""
  export Array1SystemID=""
  export Array1User=""
  export Array1Password=""
  export Array1Pool=""
  export Array1Endpoint=""
  
  # Specify info about Array2
  export Array2Type=""
  export Array2SystemID=""
  export Array2User=""
  export Array2Password=""
  export Array2Pool=""
  export Array2Endpoint=""

  # Specify IPs
  export DriverHostVMIP="" 
  export DriverHostVMPassword=""
  export DriverHostVMUser=""

  # Specify Authorization host address. NOTE: this is not the same as IP
  export AuthorizationHost=""

  echo === Creating Storage(s) ===
  # Add array1 to authorization
  karavictl storage create \
            --type ${Array1Type} \
            --endpoint  ${Array1Endpoint} \
            --system-id ${Array1SystemID} \
            --user ${Array1User} \
			      --password ${Array1Password} \
            --insecure
  
  # Add array2 to authorization
   karavictl storage create \
            --type ${Array2Type} \
            --endpoint  ${Array2Endpoint} \
            --system-id ${Array2SystemID} \
            --user ${Array2User} \
			      --password ${Array2Password} \
            --insecure
    
  echo === Creating Tenant ===
  karavictl tenant create -n $TenantName --insecure --addr "grpc.${AuthorizationHost}"

  echo === Creating Role ===
  karavictl role create \
           --role=${RoleName}=${Array1Type}=${Array1SystemID}=${Array1Pool}=${RoleQuota} \
           --role=${RoleName}=${Array2Type}=${Array2SystemID}=${Array2Pool}=${RoleQuota}   

  echo === === Binding Role ===
  karavictl rolebinding create --tenant $TenantName  --role $RoleName --insecure --addr "grpc.${AuthorizationHost}"
  ```

### Generate a Token

After creating the role bindings, the next logical step is to generate the access token. The storage admin is responsible for generating and sending the token to the Kubernetes tenant admin.

  ```
  echo === Generating token ===
  karavictl generate token --tenant $TenantName --insecure --addr "grpc.${AuthorizationHost}" | jq -r '.Token' > token.yaml

  echo === Copy token to Driver Host ===
  sshpass -p $DriverHostPassword scp token.yaml ${DriverHostVMUser}@{DriverHostVMIP}:/tmp/token.yaml 
  ```
  
**Note:** The sample above copies the token directly to the Kubernetes cluster master node. The requirement here is that the token must be copied and/or stored in any location accessible to the Kubernetes tenant admin.

### Copy the karavictl Binary to the Kubernetes Master Node

The karavictl binary is available from the CSM for Authorization proxy server.  This needs to be copied to the Kubernetes master node where Kubernetes tenant admins so they configure the Dell EMC CSI driver with CSM for Authorization.

```
sshpass -p dangerous scp bin/karavictl root@10.247.96.174:/tmp/karavictl
```

**Note:** The storage admin is responsible for copying the binary to a location accessible by the Kubernetes tenant admin.

## Configuring a Dell EMC CSI Driver with CSM for Authorization

The second part of CSM for Authorization deployment is to configure one or more of the [supported](../../authorization#supported-csi-drivers). This is controlled by the Kubernetes tenant admin.

There are currently 2 ways of doing this:  
- Using the [CSM Installer](../../deployment) (*Recommended installation method*)
- Manually by following the steps [below](#configuring-a-dell-emc-csi-driver)

### Configuring a Dell EMC CSI Driver

Given a setup where Kubernetes, a storage system, CSI driver(s), and CSM for Authorization are deployed, follow the steps below to configure the CSI Drivers to work with the Authorization sidecar:

Run the following commands on the CSI Driver host

   ```console
    # Specify Authorization host address. NOTE: this is not the same as IP
    export AuthorizationHost=""

    echo === Applying token token ===
    # It is assumed that array type powermax has the namespace "powermax" and powerflex has the namepace "vxflexos"
    kubectl apply -f /tmp/token.yaml -n powermax
    kubectl apply -f /tmp/token.yaml -n vxflexos

    echo === injecting sidecar in all CSI driver hosts that token has been applied to === 
    sudo curl -k https://${AuthorizationHost}/install | sh
    
    # NOTE: you can also query parameters("namespace" and "proxy-port") with the curl url if you desire a specific behavior.
    # 1) For instance, if you want to inject into just powermax, you can run
    #    sudo curl -k https://${AuthorizationHost}/install?namespace=powermax | sh
    # 2) If you want to specify the proxy-port for powermax to be 900001, you can run
    #    sudo curl -k https://${AuthorizationHost}/install?proxy-port=powermax:900001 | sh
    # 3) You can mix behaviors
    #    sudo curl -k https://${AuthorizationHost}/install?namespace=powermax&proxy-port=powermax:900001&namespace=vxflexos | sh
   ```

## Updating CSM for Authorization Proxy Server Configuration

CSM for Authorization has a subset of configuration parameters that can be updated dynamically:

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| certificate.crtFile | String | "" |Path to the host certificate file |
| certificate.keyFile | String | "" |Path to the host private key file |
| certificate.rootCertificate | String | "" |Path to the root CA file  |
| web.sidecarproxyaddr | String |"127.0.0.1:5000/sidecar-proxy:latest" |Docker registry address of the CSM for Authorization sidecar-proxy |
| web.jwtsigningsecret | String | "secret" |The secret used to sign JWT tokens | 

Updating configuration parameters can be done by editing the `karavi-config-secret` on the CSM for the Authorization Server. The secret can be queried using k3s and kubectl like so: 

`k3s kubectl -n karavi get secret/karavi-config-secret`

To update or add parameters, you must edit the base64 encoded data in the secret. The` karavi-config-secret` data can be decoded like so:

`k3s kubectl -n karavi get secret/karavi-config-secret -o yaml | grep config.yaml | head -n 1 | awk '{print $2}' | base64 -d`

Save the output to a file or copy it to an editor to make changes. Once you are done with the changes, you must encode the data to base64. If your changes are in a file, you can encode it like so:

`cat <file> | base64`

Copy the new, encoded data and edit the `karavi-config-secret` with the new data. Run this command to edit the secret:

`k3s kubectl -n karavi edit secret/karavi-config-secret`

Replace the data in `config.yaml` under the `data` field with your new, encoded data. Save the changes and CSM for Authorization will read the changed secret.

__Note:__ If you are updating the signing secret, the tenants need to be updated with new tokens via the `karavictl generate token` command like so:

`karavictl generate token --tenant $TenantName --insecure --addr "grpc.${AuthorizationHost}" | jq -r '.Token' > kubectl -n $namespace apply -f -`

## CSM for Authorization Proxy Server Dynamic Configuration Settings

Some settings are not stored in the `karavi-config-secret` but in the csm-config-params ConfigMap, such as LOG_LEVEL and LOG_FORMAT. To update the CSM for Authorization logging settings during runtime, run the below command on the K3s cluster, make your changes, and save the updated configmap data.

```
k3s kubectl -n karavi edit configmap/csm-config-params
```

This edit will not update the logging level for the sidecar-proxy containers running in the CSI Driver pods. To update the sidecar-proxy logging levels, you must update the associated CSI Driver ConfigMap in a similar fashion:

```
kubectl -n [CSM_CSI_DRVIER_NAMESPACE] edit configmap/<release_name>-config-params
```

Using PowerFlex as an example, `kubectl -n vxflexos edit configmap/vxflexos-config-params` can be used to update the logging level of the sidecar-proxy and the driver.