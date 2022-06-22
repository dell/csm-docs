---
title : CSM CLI
linktitle: CSM CLI
weight: 2
description: >
  Dell Container Storage Modules (CSM) Command Line Interface(CLI) Deployment and Management
---
`csm` is a command-line client for installation of Dell Container Storage Modules and CSI Drivers for Kubernetes clusters.

## Pre-requisites

1. [Deploy the Container Storage Modules Installer](../../deployment)
2. Download/Install the  `csm` binary from Github: https://github.com/dell/csm. Alternatively, you can build the binary by: 
   - cloning the `csm` repository 
   - changing into `csm/cmd/csm` directory
   - running `make build`
3. create a `cli_env.sh` file that contains the correct values for the below variables. And export the variables by running `source ./cli_env.sh`

```console
# Change this to CSM API Server IP
export API_SERVER_IP="127.0.0.1"

# Change this to CSM API Server Port
export API_SERVER_PORT="31313"

# CSM API Server protocol - allowed values are https & http
export SCHEME="https"

# Path to store JWT <token>
export AUTH_CONFIG_PATH="/home/user/installer-token/"
```

## Usage

```console
~$ ./csm -h
csm is command line tool for csm application

Usage:
  csm [flags]
  csm [command]

Available Commands:
  add          add cluster, configuration or storage
  approve-task approve task for application
  authenticate authenticate user
  change       change - subcommand is password
  create       create application
  delete       delete storage, cluster, configuration or application
  get          get storage, cluster, application, configuration, supported driver, module, storage type
  help         Help about any command
  reject-task  reject task for an application
  update       update storage, configuration or cluster

Flags:
  -h, --help   help for csm-cli

Use "csm [command] --help" for more information about a command.
```

### Authenticate the User

To begin with, you need to authenticate the user who will be managing the CSM Installer and its components.

```console
./csm authenticate --username=<admin-username> --password=<admin-password>
```
Or more securely, run the above command without `--password` to be prompted for one

```console
./csm authenticate --username=<admin-username>
Enter user's password:

```

### Change Password

To change password follow below command

```console
./csm change password --username=<admin-username>
```

### View Supported Platforms

You can now view the supported DellCSI Drivers

```console
./csm get supported-drivers
```

You can also view the supported Modules

```console
./csm get supported-modules
```

And also view the supported Storage Array Types

```console
./csm get supported-storage-arrays
```

### Add a Cluster

You can now add a cluster by providing cluster detail name and Kubeconfig path 

```console
./csm add cluster --clustername <desire-cluster-name> --configfilepath <path-to-kubeconfig>
```

### Upload Configuration Files

You can now add a configuration file that can be used for creating application  by providing filename and path 

```console
./csm add configuration --filename <name-of-the-desire-file> --filepath <path-to-the-desired-file>
```

### Add a Storage System

You can now add storage endpoints, array type and its unique id 

```console
./csm add storage --endpoint <storage-array-endpoint> --storage-type <storage-array-type> --unique-id <storage-array-unique-id> --username <storage-array-username>
```

The optional `--meta-data` flag can be used to provide additional meta-data for the storage system that is used when creating Secrets for the CSI Driver. These fields include:
 - isDefault: Set to true if this storage system is used as default for multi-array configuration
 - skipCertificateValidation: Set to true to skip certificate validation
 - mdmId: Comma separated list of MDM IPs for PowerFlex
 - nasName: NAS Name for PowerStore
 - blockProtocol: Block Protocol for PowerStore
 - port: Port for PowerScale
 - portGroups: Comma separated list of port group names for PowerMax

### Create an Application

You may now create an application depending on the specific use case. Below are the common use cases:

<details>
   <summary>CSI Driver</summary>

```console
./csm create application --clustername <created-cluster-name> \
   --driver-type powerflex:<tag> --name <desired-application-name> \ 
   --storage-arrays <storage-array-type>
```
</details>

<details>
   <summary>CSI Driver with CSM Authorization</summary>

CSM Authorization requires a `token.yaml` issued by storage Admin from the CSM Authorization Server, a certificate file, and the <proxyHost-address> of the authorization server. The `token.yaml` and `cert` should be added by following the steps in [adding configuration file](#upload-configuration-files). CSM Authorization does not yet support all CSI Drivers/platforms(See [supported platforms documentation](../../authorization/#supported-platforms) or [supported platforms via CLI](#view-supported-platforms))).
Finally, run the command below:

```console
./csm create application --clustername <created-cluster-name> \
	--driver-type powerflex:<tag>  --name <desired-application-name> \
	--storage-arrays <storage-array-unique-id> \
	--module-type authorization:<tag> \
	--module-configuration "karaviAuthorizationProxy.proxyAuthzToken.filename=<filename-for-token>,karaviAuthorizationProxy.rootCertificate.filename=<filename-for-cert>,karaviAuthorizationProxy.proxyHost=<proxyHost-address>"

```
</details>

<details>
   <summary>CSM Observability(Standalone)</summary>

CSM Observability depends on driver config secret(s) corresponding to the metric(s) you want to enable. Please see [CSM Observability](../../observability/metrics) for all Supported   Metrics. For the sake of demonstration, assuming we want to enable [CSM Metrics for PowerFlex](../../observability/metrics/powerflex), the PowerFlex secret yaml should be added by following the steps in [adding configuration file](#upload-configuration-files).
Once this is done, run the command below:

```console 
./csm create application --clustername <created-cluster-name> \
	--name <desired-application-name> \
	--module-type observability:<tag> \
	--module-configuration "karaviMetricsPowerflex.driverConfig.filename=<filename-for-powerflex-config>,karaviMetricsPowerflex.enabled=true"
```
</details>

<details>
   <summary>CSM Observability(Standalone) with CSM Authorization</summary>

See the individual steps for configuaration file pre-requisites for CSM Observability (Standalone) with CSM Authorization

```console
./csm create application --clustername <created-cluster-name> \
	--name <desired-application-name> \
	--module-type "observability:<tag>,authorization:<tag>" \
	--module-configuration "karaviMetricsPowerflex.driverConfig.filename=<filename-for-powerflex-config>,karaviMetricsPowerflex.enabled=true,karaviAuthorizationProxy.proxyAuthzToken.filename=<filename-for-token>,karaviAuthorizationProxy.rootCertificate.filename=<filename-for-cert>,karaviAuthorizationProxy.proxyHost=<proxyHost-address>"
```
</details>

<details>
   <summary>CSI Driver for Dell PowerMax with reverse proxy module</summary>
   
   To deploy CSI Driver for Dell PowerMax with reverse proxy module, first upload reverse proxy tls crt and tls key via [adding configuration file](#upload-configuration-files). Then, use the below command to create application:

```console
./csm create application --clustername <created-cluster-name> \
   --driver-type powermax:<tag> --name  <desired-application-name> \
   --storage-arrays <powermax-unique-id> \
   --module-type reverse-proxy:<tag> \
   --module-configuration reverseProxy.tlsSecretKeyFile=<revprotlskey>,reverseProxy.tlsSecretCertFile=<revprotlscert>
```
</details>

<details>
   <summary>CSI Driver with replication module</summary>
   
   To deploy CSI driver with replication module, first add a target cluster through [adding cluster](#add-a-cluster). Then, use the below command(this command is an example to deploy CSI Driver for Dell PowerStore with replication module) to create application::

```console
./csm create application --clustername <created-cluster-name> \
     --driver-type powerstore:<tag> --name <desired-application-name> \
	 --storage-arrays <storage-array-unique-id> \
	 --module-configuration target_cluster=<created-target-cluster-name> \
	 --module-type replication:<tag>
```
</details>


<details>
   <summary>CSI Driver with other module(s) not covered above</summary>
   
   Assuming you want to deploy a driver with `module A` and `module B`. If they have specific configurations of `A.image="docker:v1"`,`A.filename=hello`, and `B.namespace=world`.

```console
./csm create application --clustername <created-cluster-name> \
	--driver-type powerflex:<tag>  --name <desired-application-name> \
	--storage-arrays <storage-array-unique-id> \
	--module-type "module A:<tag>,module B:<tag>" \
	--module-configuration "A.image=docker:v1,A.filename=hello,B.namespace=world"	
```
</details>
<br />

> __Note__:
 - `--driver-type` and `--module-type` flags in create application command MUST match the values from the [supported CSM platforms](#view-supported-platforms)
 - Replication module supports only using a pair of clusters at a time (source and a target/or single cluster) from CSM installer, However `repctl` can be used if needed to add multiple pairs of target clusters. Using replication module with other modules during application creation is not yet supported.

### Approve application/task

You may now approve the task so that you can continue to work with the application

```console
./csm approve-task --applicationname <created-application-name>
```

### Reject application/task

You may want to reject a task or application to discontinue the ongoing process

```console
./csm reject-task --applicationname <created-application-name>
```

### Delete application/task

If you want to delete an application 

```console
./csm delete application --name <created-application-name>
```

> __Note__: When deleting an application, the namespace and Secrets are not deleted. These resources need to be deleted manually. See more in [Troubleshooting](../troubleshooting#after-deleting-an-application-why-cant-i-re-create-the-same-application).

> __Note__: All commands and associated syntax can be displayed with -h or --help

