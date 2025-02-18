---
title: "Helm"
linkTitle: "Helm"
no_list: true
description: Helm Installation
weight: 3
---

### Install Helm 3

Install Helm 3 on the master node before you install CSI Driver for PowerMax.

**Steps**

  Run the command to install Helm 3.
   ```bash
   curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash 
   ```
{{< accordion id="One" title="CSM Installation Wizard" markdown="true" >}}  
{{<include  file="content/docs/getting-started/installation/installationwizard/helm.md" Var="powermax" hideIds="2">}}
{{< /accordion >}}

<br>

{{< accordion id="Two" title="CSI Driver" markdown="true" >}}  
### Volume Snapshot Requirements (Optional)
  For detailed snapshot setup procedure, [click here.](docs/concepts/snapshots/#helm-optional-volume-snapshot-requirements)
      
## Install Driver

**Steps**

1. Run `git clone -b {{< version-docs key="PMax_latestVersion" >}} https://github.com/dell/csi-powermax.git` to clone the git repository. This will include the Helm charts and dell-csi-helm-installer scripts.
2. Ensure that you have created a namespace where you want to install the driver. You can run `kubectl create namespace powermax` to create a new one
3. Edit the `samples/secret/secret.yaml` file,to point to the correct namespace, and replace the values for the username and password parameters.
    These values can be obtained using base64 encoding as described in the following example:
    ```bash
    echo -n "myusername" | base64
    echo -n "mypassword" | base64
    ```
   where *myusername* and *mypassword* are credentials for a user with PowerMax privileges.
4. Create the secret by running
    ```bash
    kubectl create -f samples/secret/secret.yaml
    ```
5. Download the default values.yaml file
    ```bash
    cd dell-csi-helm-installer && wget -O my-powermax-settings.yaml https://github.com/dell/helm-charts/raw/csi-powermax-2.13.0/charts/csi-powermax/values.yaml
    ```
6. Ensure the unisphere have 10.0 REST endpoint support by clicking on Unisphere -> Help (?) -> About in Unisphere for PowerMax GUI.
7. Edit the newly created file and provide values for the following parameters
    ```bash
    vi my-powermax-settings.yaml
    ```  
<ul>
{{< collapse id="1" title="Parameters">}}
| Parameter | Description                                                                                                                                                                                                                                                                                                                                                                     | Required   | Default  |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|----------|
| **global**| This section refers to configuration options for both CSI PowerMax Driver and Reverse Proxy                                                                                                                                                                                                                                                                                     | - | - |
|defaultCredentialsSecret| This secret name refers to:<br> 1 The proxy credentials if the driver is installed with proxy.<br>2. The default Unisphere credentials if credentialsSecret is not specified for a management server.                                                                                                                                                        | Yes | powermax-creds |
| storageArrays| This section refers to the list of arrays managed by the driver and Reverse Proxy.                                                                                                                                                                                                                                                                           | - | - |
| storageArrayId | This refers to PowerMax Symmetrix ID.                                                                                                                                                                                                                                                                                                                                           | Yes | 000000000001|
| endpoint | This refers to the URL of the Unisphere server managing _storageArrayId_. If authorization is enabled, endpoint should be the HTTPS localhost endpoint that the authorization sidecar will listen on                                                                                                                                                                            | Yes | https\://primary-1.unisphe.re:8443 |
| backupEndpoint | This refers to the URL of the backup Unisphere server managing _storageArrayId_, if Reverse Proxy is installed. If authorization is enabled, backupEndpoint should be the HTTPS localhost endpoint that the authorization sidecar will listen on                                                                                                           | Yes | https\://backup-1.unisphe.re:8443 |
| managementServers | This section refers to the list of configurations for Unisphere servers managing powermax arrays.                                                                                                                                                                                                                                                                               | - | - |
| endpoint | This refers to the URL of the Unisphere server. If authorization is enabled, endpoint should be the HTTPS localhost endpoint that the authorization sidecar will listen on                                                                                                                                                                                                      | Yes | https\://primary-1.unisphe.re:8443 |
| credentialsSecret| This refers to the user credentials for _endpoint_                                                                                                                                                                                                                                                                                                                              | Yes| primary-unisphere-secret-1|
| skipCertificateValidation | This parameter should be set to false if you want to do client-side TLS verification of Unisphere for PowerMax SSL certificates.                                                                                                                                                                                                                                                | No | "True"       |
| certSecret    | The name of the secret in the same namespace containing the CA certificates of the Unisphere server                                                                                                                                                                                                                                                                             | Yes, if skipCertificateValidation is set to false | Empty|
| limits | This refers to various limits for Reverse Proxy                                                                                                                                                                                                                                                                                                                                 | No | - |
| maxActiveRead | This refers to the maximum concurrent READ request handled by the reverse proxy.                                                                                                                                                                                                                                                                                                | No | 5 |
| maxActiveWrite | This refers to the maximum concurrent WRITE request handled by the reverse proxy.                                                                                                                                                                                                                                                                                               | No | 4 |
| maxOutStandingRead | This refers to maximum queued READ request when reverse proxy receives more than _maxActiveRead_ requests.                                                                                                                                                                                                                                                                      | No | 50 |
| maxOutStandingWrite| This refers to maximum queued WRITE request when reverse proxy receives more than _maxActiveWrite_ requests.                                                                                                                                                                                                                                                                    | No | 50 |
| kubeletConfigDir | Specify kubelet config dir path                                                                                                                                                                                                                                                                                                                                                 | Yes | /var/lib/kubelet |
| imagePullPolicy | The default pull policy is IfNotPresent which causes the Kubelet to skip pulling an image if it already exists.                                                                                                                                                                                                                                                                 | Yes | IfNotPresent |
| clusterPrefix | Prefix that is used during the creation of various masking-related entities (Storage Groups, Masking Views, Hosts, and Volume Identifiers) on the array. The value that you specify here must be unique. Ensure that no other CSI PowerMax driver is managing the same arrays that are configured with the same prefix. The maximum length for this prefix is three characters. | Yes  | "ABC" |
| logLevel | CSI driver log level. Allowed values: "error", "warn"/"warning", "info", "debug".                                                                                                                                                                                                                                                                                               | Yes | "debug" |
| logFormat | CSI driver log format. Allowed values: "TEXT" or "JSON".                                                                                                                                                                                                                                                                                                                        | Yes | "TEXT" |
| kubeletConfigDir | kubelet config directory path. Ensure that the config.yaml file is present at this path.                                                                                                                                                                                                                                                                                        | Yes | /var/lib/kubelet |
| defaultFsType | Used to set the default FS type for external provisioner                                                                                                                                                                                                                                                                                                                        | Yes | ext4 |
| portGroups | List of comma-separated port group names. Any port group that is specified here must be present on all the arrays that the driver manages.                                                                                                                                                                                                                                      | For iSCSI Only | "PortGroup1, PortGroup2, PortGroup3" |
| skipCertificateValidation | Skip client-side TLS verification of Unisphere certificates                                                                                                                                                                                                                                                                                                                     | No | "True" |
| transportProtocol  | Set the preferred transport protocol for the Kubernetes cluster which helps the driver choose between FC, iSCSI and NVMeTCP, when a node has multiple protocol connectivity to a PowerMax array.                                                                                                                                                                                | No | Empty|
| nodeNameTemplate | Used to specify a template that will be used by the driver to create Host/IG names on the PowerMax array. To use the default naming convention, leave this value empty.                                                                                                                                                                                                         | No | Empty|
| modifyHostName | Change any existing host names. When nodenametemplate is set, it changes the name to the specified format else it uses driver default host name format.                                                                                                                                                                                                                         | No | false |
| powerMaxDebug | Enables low level and http traffic logging between the CSI driver and Unisphere. Don't enable this unless asked to do so by the support team.                                                                                                                                                                                                                                   | No | false |
| enableCHAP | Determine if the driver is going to configure SCSI node databases on the nodes with the CHAP credentials. If enabled, the CHAP secret must be provided in the credentials secret and set to the key "chapsecret"                                                                                                                                                                | No | false |
| fsGroupPolicy | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`                                                                                                                                                                                                                                                                         | No | "ReadWriteOnceWithFSType" |
| version | Current version of the driver. Don't modify this value as this value will be used by the install script.                                                                                                                                                                                                                                                                        | Yes | v2.10.0 |
| images | List all the images used by the CSI driver and CSM. If you use a private repository, change the registries accordingly.                                                                                                                                                                                                                                                         | Yes | "" || driverRepository | Defines the registry of the container image used for the driver. | Yes | dellemc |
| maxPowerMaxVolumesPerNode | Specifies the maximum number of volume that can be created on a node.                                                                                                                                                                                                                                                                                                           | Yes| 0 |
| **controller** | Allows configuration of the controller-specific parameters.                                                                                                                                                                                                                                                                                                                     | - | - |
| controllerCount | Defines the number of csi-powerscale controller pods to deploy to the Kubernetes release                                                                                                                                                                                                                                                                                        | Yes | 2 |
| volumeNamePrefix | Defines a string prefix for the names of PersistentVolumes created                                                                                                                                                                                                                                                                                                              | Yes | "k8s" |
| snapshot.enabled | Enable/Disable volume snapshot feature                                                                                                                                                                                                                                                                                                                                          | Yes | true |
| snapshot.snapNamePrefix | Defines a string prefix for the names of the Snapshots created                                                                                                                                                                                                                                                                                                                  | Yes | "snapshot" |
| resizer.enabled | Enable/Disable volume expansion feature                                                                                                                                                                                                                                                                                                                                         | Yes | true |
| healthMonitor.enabled | Allows to enable/disable volume health monitor                                                                                                                                                                                                                                                                                                                                  | No | false |
| healthMonitor.interval | Interval of monitoring volume health condition                                                                                                                                                                                                                                                                                                                                  | No | 60s |
| nodeSelector | Define node selection constraints for pods of controller deployment                                                                                                                                                                                                                                                                                                             | No | |
| tolerations | Define tolerations for the controller deployment, if required                                                                                                                                                                                                                                                                                                                   | No | |
| **node** | Allows configuration of the node-specific parameters.                                                                                                                                                                                                                                                                                                                           | - | - |
| tolerations | Add tolerations as per requirement                                                                                                                                                                                                                                                                                                                                              | No | - |
| nodeSelector | Add node selectors as per requirement                                                                                                                                                                                                                                                                                                                                           | No | - |
| healthMonitor.enabled | Allows to enable/disable volume health monitor                                                                                                                                                                                                                                                                                                                                  | No | false |
| topologyControl.enabled | Allows to enable/disable topology control to filter topology keys                                                                                                                                                                                                                                                                                                               | No | false |
| **csireverseproxy**| This section refers to the configuration options for CSI PowerMax Reverse Proxy                                                                                                                                                                                                                                                                                                 |  -  | - |
| tlsSecret | This refers to the TLS secret of the Reverse Proxy Server.                                                                                                                                                                                                                                                                                                                      | Yes | csirevproxy-tls-secret |
| deployAsSidecar | If set to _true_, the Reverse Proxy is installed as a sidecar to the driver's controller pod otherwise it is installed as a separate deployment.                                                                                                                                                                                                                                | Yes | "True" |
| port  | Specify the port number that is used by the NodePort service created by the CSI PowerMax Reverse Proxy installation                                                                                                                                                                                                                                                             | Yes | 2222 |
| **certManager** | Auto-create TLS certificate for csi-reverseproxy                                                                                                                                                                                                                                                                                                                                | - | - |
| selfSignedCert | Set selfSignedCert to use a self-signed certificate                                                                                                                                                                                                                                                                                                                             | No | true |
| certificateFile | certificateFile has tls.key content in encoded format                                                                                                                                                                                                                                                                                                                           | No | tls.crt.encoded64 |
| privateKeyFile | privateKeyFile has tls.key content in encoded format                                                                                                                                                                                                                                                                                                                            | No | tls.key.encoded64 |
| **authorization** | [Authorization](./csm-modules/authorizationv2.0/) is an optional feature to apply credential shielding of the backend PowerMax.                                                                                                                                                                                                               | - | - |
| enabled                  | A boolean that enables/disables authorization feature.                                                                                                                                                                                                                                                                                                                          |  No      |   false   |
| proxyHost | Hostname of the csm-authorization server.                                                                                                                                                                                                                                                                                                                                       | No | Empty |
| skipCertificateValidation | A boolean that enables/disables certificate validation of the csm-authorization proxy server.                                                                                                                                                                                                                                                                                   | No | true |
| **migration** | [Migration](../../../../../concepts/replication/migration/migrating-volumes-same-array) is an optional feature to enable migration between storage classes                                                                                                                                                                                                                               | - | - |
| enabled                  | A boolean that enables/disables migration feature.                                                                                                                                                                                                                                                                                                                              |  No      |   false   |
| image | Image for dell-csi-migrator sidecar.                                                                                                                                                                                                                                                                                                                                            | No | " " |
| nodeRescanSidecarImage | Image for node rescan sidecar which rescans nodes for identifying new paths.                                                                                                                                                                                                                                                                                                    | No | " " |
| migrationPrefix | enables migration sidecar to read required information from the storage class fields                                                                                                                                                                                                                                                                                            | No | migration.storage.dell.com |
| **replication** | [Replication](./csm-modules/replication/) is an optional feature to enable replication & disaster recovery capabilities of PowerMax to Kubernetes clusters.                                                                                                                                                                               | - | - |
| enabled                  | A boolean that enables/disables replication feature.                                                                                                                                                                                                                                                                                                                            |  No      |   false   |
| replicationContextPrefix | enables side cars to read required information from the volume context                                                                                                                                                                                                                                                                                                          | No | powermax |
| replicationPrefix | Determine if replication is enabled                                                                                                                                                                                                                                                                                                                                             | No | replication.storage.dell.com |
| **storageCapacity** | It is an optional feature that enable storagecapacity & helps the scheduler to check whether the requested capacity is available on the PowerMax array and allocate it to the nodes.                                                                                                                                                                                            | - | - |
| enabled                  | A boolean that enables/disables storagecapacity feature.                                                                                                                                                                                                                                                                                                                        |  -      |   true   |
| pollInterval | It configure how often external-provisioner polls the driver to detect changed capacity                                                                                                                                                                                                                                                                                         | - | 5m |
| **vSphere**| This section refers to the configuration options for VMware virtualized environment support via RDM                                                                                                                                                                                                                                                                             |  -  | - |
| enabled                  | A boolean that enables/disables VMware virtualized environment support.                                                                                                                                                                                                                                                                                                         |  No      |   false   |
| fcPortGroup                  | Existing portGroup that driver will use for vSphere.                                                                                                                                                                                                                                                                                                                            |  Yes      |   ""   |
| fcHostGroup                  | Existing host(initiator group)/hostgroup(cascaded initiator group) that driver will use for vSphere.                                                                                                                                                                                                                                                                            |  Yes      |   ""   |
| vCenterHost                  | URL/endpoint of the vCenter where all the ESX are present                                                                                                                                                                                                                                                                                                                       |  Yes      |   ""   |
| vCenterCredSecret                  | Secret name for the vCenter credentials.                                                                                                                                                                                                                                                                                                                                        |  Yes      |   ""   |
{{< /collapse >}}
</ul>

8. Install the driver using `csi-install.sh` bash script by running
    ```bash
    cd ../dell-csi-helm-installer && ./csi-install.sh --namespace powermax --values ./my-powermax-settings.yaml --helm-charts-version <version>
    ```
9. Or you can also install the driver using standalone helm chart using the command
   ```bash
   helm install --values  my-powermax-settings.yaml --namespace powermax powermax ./csi-powermax
   ```

*Note:*
- The parameter `--helm-charts-version` is optional and if you do not specify the flag, by default the `csi-install.sh` script will clone the version of the helm chart that is specified in the driver's [csi-install.sh](https://github.com/dell/csi-powermax/blob/main/dell-csi-helm-installer/csi-install.sh#L52) file. If you wish to install the driver using a different version of the helm chart, you need to include this flag. Also, remember to delete the `helm-charts` repository present in the `csi-powermax` directory if it was cloned before.
- For detailed instructions on how to run the install scripts, see the readme document in the dell-csi-helm-installer folder.
- There are a set of samples provided [here](#sample-values-file) to help you configure the driver with reverse proxy
- This script also runs the verify.sh script in the same directory. You will be prompted to enter the credentials for each of the Kubernetes nodes. The `verify.sh` script needs the credentials to check if the iSCSI initiators have been configured on all nodes. You can also skip the verification step by specifying the `--skip-verify-node` option
- In order to enable authorization, there should be an authorization proxy server already installed.
- PowerMax Array username must have role as `StorageAdmin` to be able to perform CRUD operations.
- If the user is using complex K8s version like “v1.24.3-mirantis-1”, use this kubeVersion check in [helm Chart](https://github.com/dell/helm-charts/blob/main/charts/csi-powermax/Chart.yaml) file. kubeVersion: “>= 1.24.0-0 < 1.29.0-0”.
- User should provide all boolean values with double-quotes. This applies only for values.yaml. Example: “true”/“false”.
- controllerCount parameter value should be <= number of nodes in the kubernetes cluster else install script fails.
- Endpoint should not have any special character at the end apart from port number.

## Storage Classes

A wide set of annotated storage class manifests has been provided in the `samples/storageclass` folder. Please use these samples to create new storage classes to provision storage.

## Volume Snapshot Class

Starting with CSI PowerMax v1.7.0, `dell-csi-helm-installer` will not create any Volume Snapshot Class during the driver installation. There is a sample Volume Snapshot Class manifest present in the _samples/volumesnapshotclass_ folder. Please use this sample to create a new Volume Snapshot Class to create Volume Snapshots.

## Sample values file

The following sections have useful snippets from `values.yaml` file which provides more information on how to configure the CSI PowerMax driver along with CSI PowerMax ReverseProxy.

### CSI PowerMax driver with Proxy

This is the most advanced configuration which provides you with the capability to connect to Multiple Unisphere servers.
You can specify primary and backup Unisphere servers for each storage array. If you have different credentials for your Unisphere servers, you can also specify different credential secrets.

```yaml
global:
  defaultCredentialsSecret: powermax-creds
  storageArrays:
    - storageArrayId: "000000000001"
      endpoint: https://primary-1.unisphe.re:8443
      backupEndpoint: https://backup-1.unisphe.re:8443
    - storageArrayId: "000000000002"
      endpoint: https://primary-2.unisphe.re:8443
      backupEndpoint: https://backup-2.unisphe.re:8443
  managementServers:
    - endpoint: https://primary-1.unisphe.re:8443
      credentialsSecret: primary-unisphere-secret-1
      skipCertificateValidation: false
      certSecret: primary-cert
      limits:
        maxActiveRead: 5
        maxActiveWrite: 4
        maxOutStandingRead: 50
        maxOutStandingWrite: 50
    - endpoint: https://backup-1.unisphe.re:8443
      credentialsSecret: backup-unisphere-secret-1
      skipCertificateValidation: true
    - endpoint: https://primary-2.unisphe.re:8443
      credentialsSecret: primary-unisphere-secret-2
      skipCertificateValidation: true
    - endpoint: https://backup-2.unisphe.re:8443
      credentialsSecret: backup-unisphere-secret-2
      skipCertificateValidation: true

# "csireverseproxy" refers to the subchart csireverseproxy
csireverseproxy:
  tlsSecret: csirevproxy-tls-secret
  deployAsSidecar: true
  port: 2222
```

>Note: If the credential secret is missing from any management server details, the installer will try to use the defaultCredentialsSecret

{{< /accordion >}}


<br> 

{{< accordion id="Three" title="CSM Modules">}}  


{{< cardcontainer >}}
    {{< customcard link1="./csm-modules/authorizationv1.x"  image="1" title="Authorization v1.x" >}}

    {{< customcard link1="./csm-modules/authorizationv2.0"   image="1" title="Authorization v2.0"  >}}

    {{< customcard  link1="./csm-modules/observability"   image="1" title="Observability"  >}}

    {{< customcard  link1="./csm-modules/replication"  image="1" title="Replication"  >}} 

    {{< customcard link1="./csm-modules/resiliency"   image="1" title="Resiliency"  >}}

{{< /cardcontainer >}}

{{< /accordion >}}

