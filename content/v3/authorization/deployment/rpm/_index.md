---
title: RPM
linktitle: RPM 
weight: 2
description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization RPM deployment
---

{{% pageinfo color="primary" %}}
The CSM Authorization karavictl CLI is no longer actively maintained or supported. It will be deprecated in CSM 2.0.
{{% /pageinfo %}}

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

The container-selinux RPMs for CentOS/RedHat 7 and 8 can be downloaded from [https://centos.pkgs.org/7/centos-extras-x86_64/](https://centos.pkgs.org/7/centos-extras-x86_64/) and [https://centos.pkgs.org/8-stream/centos-appstream-x86_64/](https://centos.pkgs.org/8-stream/centos-appstream-x86_64/), respectively.

## Deploying the CSM Authorization Proxy Server

The first part of deploying CSM for Authorization is installing the proxy server.  This activity and the administration of the proxy server will be owned by the storage administrator. 

The CSM for Authorization proxy server is installed using a shell script after extracting from a tar archive.

If CSM for Authorization is being installed on a system where SELinux is enabled, you must ensure the proper SELinux policies have been installed.

### Shell Script Installer

The easiest way to obtain the tar archive with the shell script installer is directly from the [GitHub repository's releases](https://github.com/dell/karavi-authorization/releases) section.  

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

The first part of CSM for Authorization deployment is to configure the proxy server. This is controlled by the Storage Administrator.

Please follow the steps outlined in the [proxy server](../../configuration/proxy-server) configuration.

## Configuring a Dell CSI Driver with CSM for Authorization

The second part of CSM for Authorization deployment is to configure one or more of the [supported](../../../authorization#supported-csi-drivers) CSI drivers. This is controlled by the Kubernetes tenant administrator.

Please follow the steps outlined in [PowerFlex](../../configuration/powerflex), [PowerMax](../../configuration/powermax), or [PowerScale](../../configuration/powerscale) to configure the CSI Driver to work with the Authorization sidecar.

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

>__Note__: If you are updating the signing secret, the tenants need to be updated with new tokens via the `karavictl generate token` command like so. The `--insecure` flag is required if certificates were not provided in `$HOME/.karavi/config.json`

`karavictl generate token --tenant $TenantName --insecure --addr grpc.DNS-hostname:443 | sed -e 's/"Token": //' -e 's/[{}"]//g' -e 's/\\n/\n/g' | kubectl -n $namespace apply -f -`

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
