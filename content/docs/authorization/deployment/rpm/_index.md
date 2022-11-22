---
title: RPM
linktitle: RPM 
weight: 2
description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization RPM deployment
---

This section outlines the deployment steps for Container Storage Modules (CSM) for Authorization.  The deployment of CSM for Authorization is handled in 2 parts:
- Deploying the CSM for Authorization proxy server, to be controlled by storage administrators
- Configuring one to many [supported](../../../authorization#supported-csi-drivers) Dell CSI drivers with CSM for Authorization

## Prerequisites

The CSM for Authorization proxy server requires a Linux host with the following minimum resource allocations:
- 32 GB of memory
- 4 CPU
- 200 GB local storage

The following package needs to be installed on the Linux host:
- container-selinux

Use the appropriate package manager on the machine to install the package.

### Using yum on CentOS/RedHat 7:

yum install -y container-selinux

### Using yum on CentOS/RedHat 8:

yum install -y container-selinux

### Dark Sites

For environments where `yum` will not work, obtain the supported version of container-selinux for your OS version and install it.

The container-selinux RPMs for CentOS/RedHat 7 and 8 can be downloaded from [https://centos.pkgs.org/7/centos-extras-x86_64/](https://centos.pkgs.org/7/centos-extras-x86_64/) and [https://centos.pkgs.org/8/centos-appstream-x86_64/](https://centos.pkgs.org/8/centos-appstream-x86_64/), respectively.

## Deploying the CSM Authorization Proxy Server

The first part of deploying CSM for Authorization is installing the proxy server.  This activity and the administration of the proxy server will be owned by the storage administrator. 

The CSM for Authorization proxy server is installed using a shell script after extracting from a tar archive.

If CSM for Authorization is being installed on a system where SELinux is enabled, you must ensure the proper SELinux policies have been installed.

### Shell Script Installer

As of version 1.5.0, the easiest way to obtain the tar archive with the shell script installer is directly from the [GitHub repository's releases](https://github.com/dell/karavi-authorization/releases) section.  

Alternatively, the tar archive can be built from source by cloning the [GitHub repository](https://github.com/dell/karavi-authorization) and using the following Makefile targets to build the installer:

```
make dist build-installer rpm package
```

The `build-installer` step creates a binary at `karavi-authorization/bin/deploy` and embeds all components required for installation. The `rpm` step generates an RPM package and stores it at `karavi-authorization/deploy/rpm/x86_64/`. The `package` step bundles the install script, authorization package, pre-downloaded K3s-SELinux packages, and policies folder together for the installation in the `packages/` directory.
This allows CSM for Authorization to be installed in network-restricted environments.

A Storage Administrator can execute the shell script, install_karavi_auth.sh as a root user or via `sudo`.

### Installing the RPM

1. Before installing the rpm, some network and security configuration inputs need to be provided in json format. The json file should be created in the location `$HOME/.karavi/config.json` having the following contents: 

    ```json
    {
      "web": {
        "jwtsigningsecret": "secret"
      },
      "proxy": {
        "host": ":8080"
      },
      "zipkin": {
        "collectoruri": "http://DNS-hostname:9411/api/v2/spans",
        "probability": 1
      },
      "certificate": {
        "keyFile": "path_to_private_key_file",
        "crtFile": "path_to_host_cert_file",
        "rootCertificate": "path_to_root_CA_file"
      },
      "hostname": "DNS-hostname"
    }
    ```

    In an instance where a secure deployment is not required, an insecure deployment is possible. Please note that self-signed certificates will be created for you using cert-manager to allow TLS encryption for communication on the CSM for Authorization proxy server. However, this is not recommended for production environments. For an insecure deployment, the json file in the location `$HOME/.karavi/config.json` only requires the following contents:

    ```json
    {
      "hostname": "DNS-hostname"
    }
    ```

>__Note__:
> - `DNS-hostname` refers to the hostname of the system in which the CSM for Authorization server will be installed. This hostname can be found by running `nslookup <IP_address>`
> - There are a number of ways to create certificates. In a production environment, certificates are usually created and managed by an IT administrator. Otherwise, certificates can be created using OpenSSL.

2. In order to configure secure grpc connectivity, an additional subdomain in the format `grpc.DNS-hostname` is also required. All traffic from `grpc.DNS-hostname` needs to be routed to `DNS-hostname` address, this can be configured by adding a new DNS entry for `grpc.DNS-hostname` or providing a temporary path in the systems `/etc/hosts` file. 

>__Note__: The certificate provided in `crtFile` should be valid for both the `DNS-hostname` and the `grpc.DNS-hostname` address. 

    For example, create the certificate config file with alternate names (to include DNS-hostname and grpc.DNS-hostname) and then create the .crt file: 

      ```
      CN = DNS-hostname
      subjectAltName = @alt_names
      [alt_names]
      DNS.1 = grpc.DNS-hostname.com

      $ openssl x509 -req -in cert_request_file.csr -CA root_CA.pem -CAkey private_key_File.key -CAcreateserial -out DNS-hostname.com.crt -days 365 -sha256
      ```

3. To install the rpm package on the system, you must first extract the contents of the tar file with the command:

    ```shell
    tar -xvf karavi_authorization_<version>
    ```

4. Afterwards, you must enter the extracted folder's directory and run the shell script:

    ```shell
    cd karavi_authorization_<version>
    sh install_karavi_auth.sh
    ```

5. After installation, application data will be stored on the system under `/var/lib/rancher/k3s/storage/`.

If errors occur during installation, review the [Troubleshooting](../../troubleshooting) section.

## Configuring the CSM for Authorization Proxy Server

The storage administrator must first configure the proxy server with the following:
- Storage systems
- Tenants
- Roles
- Bind roles to tenants

Run the following commands on the Authorization proxy server:
>__Note__: The `--insecure` flag is only necessary if certificates were not provided in `$HOME/.karavi/config.json`.

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

  # Specify Authorization proxy host address. NOTE: this is not the same as IP
  export AuthorizationProxyHost=""

  echo === Creating Storage(s) ===
  # Add array1 to authorization
  karavictl storage create \
            --type ${Array1Type} \
            --endpoint  ${Array1Endpoint} \
            --system-id ${Array1SystemID} \
            --user ${Array1User} \
			      --password ${Array1Password} \
            --array-insecure
  
  # Add array2 to authorization
   karavictl storage create \
            --type ${Array2Type} \
            --endpoint  ${Array2Endpoint} \
            --system-id ${Array2SystemID} \
            --user ${Array2User} \
			      --password ${Array2Password} \
            --array-insecure
    
  echo === Creating Tenant ===
  karavictl tenant create -n $TenantName --insecure --addr "grpc.${AuthorizationProxyHost}"

  echo === Creating Role ===
  karavictl role create \
           --role=${RoleName}=${Array1Type}=${Array1SystemID}=${Array1Pool}=${RoleQuota} \
           --role=${RoleName}=${Array2Type}=${Array2SystemID}=${Array2Pool}=${RoleQuota}   

  echo === === Binding Role ===
  karavictl rolebinding create --tenant $TenantName  --role $RoleName --insecure --addr "grpc.${AuthorizationProxyHost}"
  ```

### Generate a Token

After creating the role bindings, the next logical step is to generate the access token. The storage admin is responsible for generating and sending the token to the Kubernetes tenant admin.

>__Note__: 
> - The `--insecure` flag is only necessary if certificates were not provided in `$HOME/.karavi/config.json`.
> - This sample copies the token directly to the Kubernetes cluster master node. The requirement here is that the token must be copied and/or stored in any location accessible to the Kubernetes tenant admin.

  ```
  echo === Generating token ===
  karavictl generate token --tenant $TenantName --insecure --addr "grpc.${AuthorizationProxyHost}" | sed -e 's/"Token": //' -e 's/[{}"]//g' -e 's/\\n/\n/g' > token.yaml

  echo === Copy token to Driver Host ===
  sshpass -p ${DriverHostPassword} scp token.yaml ${DriverHostVMUser}@{DriverHostVMIP}:/tmp/token.yaml 
  ```

### Copy the karavictl Binary to the Kubernetes Master Node

The karavictl binary is available from the CSM for Authorization proxy server.  This needs to be copied to the Kubernetes master node for Kubernetes tenant admins so the Kubernetes tenant admins can configure the Dell CSI driver with CSM for Authorization.

```
sshpass -p ${DriverHostPassword} scp bin/karavictl root@{DriverHostVMIP}:/tmp/karavictl
```

>__Note__: The storage admin is responsible for copying the binary to a location accessible by the Kubernetes tenant admin.

## Configuring a Dell CSI Driver with CSM for Authorization

The second part of CSM for Authorization deployment is to configure one or more of the [supported](../../../authorization#supported-csi-drivers) CSI drivers. This is controlled by the Kubernetes tenant admin.

### Configuring a Dell CSI Driver

Given a setup where Kubernetes, a storage system, and the CSM for Authorization Proxy Server are deployed, follow the steps below to configure the CSI Drivers to work with the Authorization sidecar:

1. Create the secret token in the namespace of the driver.

    ```console
    # It is assumed that array type powermax has the namespace "powermax", powerflex has the namepace "vxflexos", and powerscale has the namespace "isilon".
    kubectl apply -f /tmp/token.yaml -n powermax
    kubectl apply -f /tmp/token.yaml -n vxflexos
    kubectl apply -f /tmp/token.yaml -n isilon
   ```

2. Edit the following parameters in samples/secret/karavi-authorization-config.json file in [CSI PowerFlex](https://github.com/dell/csi-powerflex/tree/main/samples), [CSI PowerMax](https://github.com/dell/csi-powermax/tree/main/samples/secret), or [CSI PowerScale](https://github.com/dell/csi-powerscale/tree/main/samples/secret) driver and update/add connection information for one or more backend storage arrays. In an instance where multiple CSI drivers are configured on the same Kubernetes cluster, the port range in the *endpoint* parameter must be different for each driver.

  | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | username | Username for connecting to the backend storage array. This parameter is ignored. | No | - |
   | password | Password for connecting to to the backend storage array. This parameter is ignored. | No | - |
   | intendedEndpoint | HTTPS REST API endpoint of the backend storage array. | Yes | - |
   | endpoint | HTTPS localhost endpoint that the authorization sidecar will listen on. | Yes | https://localhost:9400 |
   | systemID | System ID of the backend storage array. | Yes | " " |
   | skipCertificateValidation | A boolean that enables/disables certificate validation of the backend storage array. This parameter is not used. | No | true |
   | isDefault | A boolean that indicates if the array is the default array. This parameter is not used. | No | default value from values.yaml |


Create the karavi-authorization-config secret using the following command:

`kubectl -n [CSI_DRIVER_NAMESPACE] create secret generic karavi-authorization-config --from-file=config=samples/secret/karavi-authorization-config.json -o yaml --dry-run=client | kubectl apply -f -`

>__Note__:  
> - Create the driver secret as you would normally except update/add the connection information for communicating with the sidecar instead of the backend storage array and scrub the username and password
> - For PowerScale, the *systemID* will be the *clusterName* of the array. 
>   - The *isilon-creds* secret has a *mountEndpoint* parameter which must be set to the hostname or IP address of the PowerScale OneFS API server, for example, 10.0.0.1.
3. Create the proxy-server-root-certificate secret.

    If running in *insecure* mode, create the secret with empty data:

      `kubectl -n [CSI_DRIVER_NAMESPACE] create secret generic proxy-server-root-certificate --from-literal=rootCertificate.pem= -o yaml --dry-run=client | kubectl apply -f -`

    Otherwise, create the proxy-server-root-certificate secret with the appropriate file:

      `kubectl -n [CSI_DRIVER_NAMESPACE] create secret generic proxy-server-root-certificate --from-file=rootCertificate.pem=/path/to/rootCA -o yaml --dry-run=client | kubectl apply -f -`


>__Note__: Follow the steps below for additional configurations to one or more of the supported CSI drivers. 
#### PowerFlex

Please refer to step 5 in the [installation steps for PowerFlex](../../../csidriver/installation/helm/powerflex) to edit the parameters in samples/config.yaml file to communicate with the sidecar.

1. Update *endpoint* to match the endpoint set in samples/secret/karavi-authorization-config.json

2. Create vxflexos-config secret using the following command:

    `kubectl create secret generic vxflexos-config -n vxflexos --from-file=config=config.yaml -o yaml --dry-run=client | kubectl apply -f -`

Please refer to step 9 in the [installation steps for PowerFlex](../../../csidriver/installation/helm/powerflex) to edit the parameters in *myvalues.yaml* file to communicate with the sidecar.

3. Enable CSM for Authorization and provide *proxyHost* address 

4. Install the CSI PowerFlex driver
#### PowerMax

Please refer to step 7 in the [installation steps for PowerMax](../../../csidriver/installation/helm/powermax) to edit the parameters in *my-powermax-settings.yaml* to communicate with the sidecar. 

1. Update *endpoint* to match the endpoint set in samples/secret/karavi-authorization-config.json

2. Enable CSM for Authorization and provide *proxyHost* address

3. Install the CSI PowerMax driver

#### PowerScale

Please refer to step 5 in the [installation steps for PowerScale](../../../csidriver/installation/helm/isilon) to edit the parameters in *my-isilon-settings.yaml* to communicate with the sidecar. 

1. Update *endpointPort* to match the endpoint port number set in samples/secret/karavi-authorization-config.json

*Notes:*
> - In *my-isilon-settings.yaml*, endpointPort acts as a default value. If endpointPort is not specified in *my-isilon-settings.yaml*, then it should be specified in the *endpoint* parameter of samples/secret/secret.yaml.
> - The *isilon-creds* secret has a *mountEndpoint* parameter which must be set to the hostname or IP address of the PowerScale OneFS API server, for example, 10.0.0.1.

2. Enable CSM for Authorization and provide *proxyHost* address 

Please refer to step 6 in the [installation steps for PowerScale](../../../csidriver/installation/helm/isilon) to edit the parameters in samples/secret/secret.yaml file to communicate with the sidecar.

3. Update *endpoint* to match the endpoint set in samples/secret/karavi-authorization-config.json

>__Note__: Only add the endpoint port if it has not been set in *my-isilon-settings.yaml*.

4. Create the isilon-creds secret using the following command:

    `kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml -o yaml --dry-run=client | kubectl apply -f -`
   
5. Install the CSI PowerScale driver
## Updating CSM for Authorization Proxy Server Configuration

CSM for Authorization has a subset of configuration parameters that can be updated dynamically:

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
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

>__Note__: If you are updating the signing secret, the tenants need to be updated with new tokens via the `karavictl generate token` command like so. The `--insecure` flag is only necessary if certificates were not provided in `$HOME/.karavi/config.json`

`karavictl generate token --tenant $TenantName --insecure --addr "grpc.${AuthorizationProxyHost}" | sed -e 's/"Token": //' -e 's/[{}"]//g' -e 's/\\n/\n/g' | kubectl -n $namespace apply -f -`

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
