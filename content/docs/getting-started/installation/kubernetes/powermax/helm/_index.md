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

1. Clone the csi-powermax repository, using the latest release branch. This will include the Helm charts and dell-csi-helm-installer scripts.
    ```bash
    git clone -b {{< version-docs key="PMax_latestVersion" >}} https://github.com/dell/csi-powermax.git
    cd ./csi-powermax
    ```
2. Create a namespace in which the driver will be installed.
    ```bash
    kubectl create namespace powermax
    ```
3. Edit the `samples/secret/secret.yaml` file, referencing the details below, to provide the necessary information for connecting the driver to the desired Unisphere instances.
    ```bash
    vi ./samples/secret/secret.yaml
    ```

    Example: `samples/secret/secret.yaml`

    ```yaml
    storageArrays:
      - storageArrayId: "000000000001"
        primaryEndpoint: https://primary-1.unisphe.re:8443
        backupEndpoint: https://backup-1.unisphe.re:8443
    managementServers:
      - endpoint: https://primary-1.unisphe.re:8443
        username: admin
        password: password
        skipCertificateValidation: true
        limits:
          maxActiveRead: 10
          maxActiveWrite: 10
          maxOutstandingRead: 10
          maxOutstandingWrite: 10
      - endpoint: https://backup-1.unisphe.re:8443
        username: admin2
        password: password2
        skipCertificateValidation: false
        certSecret: my-unishpere-cert-secret
    ```

    - *storageArrays*: A list of storage arrays and their associated details.
      - *storageArrayId*: A unique PowerMax Symmetrix ID.
      - *primaryEndpoint*: The URL of the Unisphere server managing this storage array.
      - **backupEndpoint*: The URL of the backup Unisphere server managing this storage array; utilized if the primary server is unreachable.
    - *managementServers*: A list of Unisphere management server endpoints and resources used to make connections with those servers.
      - *endpoint*: The URL of the Unisphere server (primary or backup). This should match one of the URLs listed under `storageArrays`.
      - *username*: The username to be used when connecting to the `endpoint`.
      - *password*: The password to be used when connecting to the `endpoint`.
      - *skipCertificateValidation*: Set to `false` to perform client-side TLS certificate verification for the Unisphere instance, `true` to skip verification.
      - *certSecret*: The name of the secret in the same namespace containing the CA certificates of the Unisphere server. This field is not required if `skipCertificatValidation` is set to `false`.
      - **limits*: A set of various limits for Reverse Proxy, outlined below.
        - **maxActiveRead*: This refers to the maximum concurrent READ request handled by the reverse proxy.
        - **maxActiveWrite*: This refers to the maximum concurrent WRITE request handled by the reverse proxy.
        - **maxOutstandingRead*: This refers to maximum queued READ request when reverse proxy receives more than _maxActiveRead_ requests.
        - **maxOutstandingWrite*: This refers to maximum queued WRITE request when reverse proxy receives more than _maxActiveWrite_ requests.
> The Secret fields marked with an asterisk (*) are optional and can be omitted from the Secret if they are not required.
4. Create the `powermax-config` Secret.
    ```bash
    kubectl create secret generic powermax-config --namespace powermax --from-file=config=samples/secret/secret.yaml
    ```
5. Download the default values.yaml file.
    ```bash
    cd dell-csi-helm-installer
    wget -O my-powermax-settings.yaml https://github.com/dell/helm-charts/raw/csi-powermax-2.14.0/charts/csi-powermax/values.yaml
    ```
6. Ensure the unisphere have 10.0 REST endpoint support by clicking on Unisphere -> Help (?) -> About in Unisphere for PowerMax GUI.
7. Edit the newly created file and provide values for the following parameters.
    ```bash
    vi my-powermax-settings.yaml
    ```
<ul>
{{< collapse id="1" title="Parameters">}}
| Parameter | Description                                                                                                                                                                                                                                                                                                                                                                     | Required   | Default  |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|----------|
| **global**| This section refers to configuration options for both CSI PowerMax Driver and Reverse Proxy                                                                                                                                                                                                                                                                                     | - | - |
| &nbsp;&nbsp; defaultCredentialsSecret | The name of the Secret, created in [installation step 3](#installation), used to specify PowerMax storage arrays and their login credentials. Formerly used to provide the name of the Secret containing storage admin login credentials. | Yes | powermax-config |
| &nbsp;&nbsp; useSecret | Defines if the reverseproxy and driver containers should use the Secret instead of the deprecated powermax-reverseproxy-config ConfigMap. If set to `true`, the contents of the Secret specified by `global.defaultCredentialsSecret` will be used, in the new format, to specify Unisphere for PowerMax endpoints, array IDs, and login credentials. If set to `false`, the deprecated powermax-reverseprpoxy-config ConfigMap will be used, and `global.defaultCredentialsSecret` will be used in the deprecated format to provide storage admin login credentials. | Yes | false |
| &nbsp;&nbsp; ~~**storageArrays**~~ | **Deprecated**. Refer to [installation step 3](#installation) to configure storage arrays. <br> This section refers to the list of arrays managed by the driver and Reverse Proxy.                                                                                                                                                                                                                                                                           | - | - |
| &nbsp;&nbsp;&nbsp;&nbsp; ~~storageArrayId~~ | **Deprecated**. Refer to [installation step 3](#installation) to configure storage arrays. <br> This refers to PowerMax Symmetrix ID.                                                                                                                                                                                                                                                                                                                                           | Yes | 000000000001|
| &nbsp;&nbsp;&nbsp;&nbsp; ~~endpoint~~ | **Deprecated**. Refer to [installation step 3](#installation) to configure storage arrays. <br> This refers to the URL of the Unisphere server managing _storageArrayId_. If authorization is enabled, endpoint should be the HTTPS localhost endpoint that the authorization sidecar will listen on                                                                                                                                                                            | Yes | https\://primary-1.unisphe.re:8443 |
| &nbsp;&nbsp;&nbsp;&nbsp; ~~backupEndpoint~~ | **Deprecated**. Refer to [installation step 3](#installation) to configure storage arrays. <br> This refers to the URL of the backup Unisphere server managing _storageArrayId_, if Reverse Proxy is installed. If authorization is enabled, backupEndpoint should be the HTTPS localhost endpoint that the authorization sidecar will listen on                                                                                                           | Yes | https\://backup-1.unisphe.re:8443 |
| &nbsp;&nbsp; ~~**managementServers**~~ | **Deprecated**. Refer to [installation step 3](#installation) to configure management servers. <br> This section refers to the list of configurations for Unisphere servers managing powermax arrays.                                                                                                                                                                                                                                                                               | - | - |
| &nbsp;&nbsp;&nbsp;&nbsp; ~~endpoint~~ | **Deprecated**. Refer to [installation step 3](#installation) to configure management servers. <br> This refers to the URL of the Unisphere server. If authorization is enabled, endpoint should be the HTTPS localhost endpoint that the authorization sidecar will listen on                                                                                                                                                                                                      | Yes | https\://primary-1.unisphe.re:8443 |
| &nbsp;&nbsp;&nbsp;&nbsp; ~~credentialsSecret~~ | **Deprecated**. Refer to [installation step 3](#installation) to configure management servers. <br> This refers to the user credentials for _endpoint_                                                                                                                                                                                                                                                                                                                              | Yes| primary-unisphere-secret-1|
| &nbsp;&nbsp;&nbsp;&nbsp; ~~skipCertificateValidation~~ | **Deprecated**. Refer to [installation step 3](#installation) to configure management servers. <br> This parameter should be set to false if you want to do client-side TLS verification of Unisphere for PowerMax SSL certificates.                                                                                                                                                                                                                                                | No | "True"       |
| &nbsp;&nbsp;&nbsp;&nbsp; ~~certSecret~~ | **Deprecated**. Refer to [installation step 3](#installation) to specify the `certSecret`.<br>The name of the secret in the same namespace containing the CA certificates of the Unisphere server. | Yes, if skipCertificateValidation is set to false | Empty|
| &nbsp;&nbsp;&nbsp;&nbsp; ~~limits~~ | **Deprecated**. Refer to [installation step 3](#installation) to configure reverse proxy `limits`.<br>This refers to various limits for Reverse Proxy                                                                                                                                                                                                                                                                                                                                 | No | - |
| &nbsp;&nbsp;&nbsp;&nbsp; ~~maxActiveRead~~ | **Deprecated**. Refer to [installation step 3](#installation) to configure read limits. <br>This refers to the maximum concurrent READ request handled by the reverse proxy.                                                                                                                                                                                                                                                                                                | No | 5 |
| &nbsp;&nbsp;&nbsp;&nbsp; ~~maxActiveWrite~~| **Deprecated**. Refer to [installation step 3](#installation) to configure write limits. <br>This refers to the maximum concurrent WRITE request handled by the reverse proxy.                                                                                                                                                                                                                                                                                               | No | 4 |
| &nbsp;&nbsp;&nbsp;&nbsp; ~~maxOutStandingRead~~ | **Deprecated**. Refer to [installation step 3](#installation) to configure read limits. <br>This refers to maximum queued READ request when reverse proxy receives more than _maxActiveRead_ requests.                                                                                                                                                                                                                                                                      | No | 50 |
| &nbsp;&nbsp;&nbsp;&nbsp; ~~maxOutStandingWrite~~ | **Deprecated**. Refer to [installation step 3](#installation) to configure write limits. <br>This refers to maximum queued WRITE request when reverse proxy receives more than _maxActiveWrite_ requests.                                                                                                                                                                                                                                                                    | No | 50 |
| &nbsp;&nbsp; logLevel | CSI driver log level. Allowed values: "error", "warn"/"warning", "info", "debug".                                                                                                                                                                                                                                                                                               | Yes | "debug" |
| &nbsp;&nbsp; logFormat | CSI driver log format. Allowed values: "TEXT" or "JSON".                                                                                                                                                                                                                                                                                                                        | Yes | "TEXT" |
| imagePullPolicy | The default pull policy is IfNotPresent which causes the Kubelet to skip pulling an image if it already exists.                                                                                                                                                                                                                                                                 | Yes | IfNotPresent |
| clusterPrefix | Prefix that is used during the creation of various masking-related entities (Storage Groups, Masking Views, Hosts, and Volume Identifiers) on the array. The value that you specify here must be unique. Ensure that no other CSI PowerMax driver is managing the same arrays that are configured with the same prefix. The maximum length for this prefix is three characters. | Yes  | "ABC" |
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
| version | Current version of the driver. Don't modify this value as this value will be used by the install script.                                                                                                                                                                                                                                                                        | Yes | v2.14.0 |
| images | List all the images used by the CSI driver and CSM. If you use a private repository, change the registries accordingly.                                                                                                                                                                                                                                                         | Yes | "" || driverRepository | Defines the registry of the container image used for the driver. | Yes | dellemc |
| maxPowerMaxVolumesPerNode | Specifies the maximum number of volume that can be created on a node.                                                                                                                                                                                                                                                                                                           | Yes| 0 |
| **controller** | Allows configuration of the controller-specific parameters.                                                                                                                                                                                                                                                                                                                     | - | - |
| &nbsp;&nbsp; controllerCount | Defines the number of csi-powerscale controller pods to deploy to the Kubernetes release                                                                                                                                                                                                                                                                                        | Yes | 2 |
| &nbsp;&nbsp; volumeNamePrefix | Defines a string prefix for the names of PersistentVolumes created                                                                                                                                                                                                                                                                                                              | Yes | "k8s" |
| &nbsp;&nbsp; snapshot.enabled | Enable/Disable volume snapshot feature                                                                                                                                                                                                                                                                                                                                          | Yes | true |
| &nbsp;&nbsp; snapshot.snapNamePrefix | Defines a string prefix for the names of the Snapshots created                                                                                                                                                                                                                                                                                                                  | Yes | "snapshot" |
| &nbsp;&nbsp; resizer.enabled | Enable/Disable volume expansion feature                                                                                                                                                                                                                                                                                                                                         | Yes | true |
| &nbsp;&nbsp; healthMonitor.enabled | Allows to enable/disable volume health monitor                                                                                                                                                                                                                                                                                                                                  | No | false |
| &nbsp;&nbsp; healthMonitor.interval | Interval of monitoring volume health condition                                                                                                                                                                                                                                                                                                                                  | No | 60s |
| &nbsp;&nbsp; nodeSelector | Define node selection constraints for pods of controller deployment                                                                                                                                                                                                                                                                                                             | No | |
| &nbsp;&nbsp; tolerations | Define tolerations for the controller deployment, if required                                                                                                                                                                                                                                                                                                                   | No | |
| **node** | Allows configuration of the node-specific parameters.                                                                                                                                                                                                                                                                                                                           | - | - |
| &nbsp;&nbsp; tolerations | Add tolerations as per requirement                                                                                                                                                                                                                                                                                                                                              | No | - |
| &nbsp;&nbsp; nodeSelector | Add node selectors as per requirement                                                                                                                                                                                                                                                                                                                                           | No | - |
| &nbsp;&nbsp; healthMonitor.enabled | Allows to enable/disable volume health monitor                                                                                                                                                                                                                                                                                                                                  | No | false |
| &nbsp;&nbsp; topologyControl.enabled | Allows to enable/disable topology control to filter topology keys                                                                                                                                                                                                                                                                                                               | No | false |
| **csireverseproxy**| This section refers to the configuration options for CSI PowerMax Reverse Proxy                                                                                                                                                                                                                                                                                                 |  -  | - |
| &nbsp;&nbsp; tlsSecret | This refers to the TLS secret of the Reverse Proxy Server.                                                                                                                                                                                                                                                                                                                      | Yes | csirevproxy-tls-secret |
| &nbsp;&nbsp; deployAsSidecar | If set to _true_, the Reverse Proxy is installed as a sidecar to the driver's controller pod otherwise it is installed as a separate deployment.                                                                                                                                                                                                                                | Yes | "True" |
| &nbsp;&nbsp; port | Specify the port number that is used by the NodePort service created by the CSI PowerMax Reverse Proxy installation                                                                                                                                                                                                                                                             | Yes | 2222 |
| &nbsp;&nbsp; **certManager** | Auto-create TLS certificate for csi-reverseproxy                                                                                                                                                                                                                                                                                                                                | - | - |
| &nbsp;&nbsp;&nbsp;&nbsp; selfSignedCert | Set selfSignedCert to `true` to use a self-signed certificate                                                                                                                                                                                                                                                                                                                             | No | true |
| &nbsp;&nbsp;&nbsp;&nbsp; certificateFile | certificateFile contains the tls.key contents in base64 encoded format                                                                                                                                                                                                                                                                                                                           | No | tls.crt.encoded64 |
| &nbsp;&nbsp;&nbsp;&nbsp; privateKeyFile | privateKeyFile contains the tls.key contents in base64 encoded format                                                                                                                                                                                                                                                                                                                            | No | tls.key.encoded64 |
| **authorization** | [Authorization](../../../../../deployment/helm/modules/installation/authorization-v2.0/) is an optional feature to apply credential shielding of the backend PowerMax.                                                                                                                                                                                                               | - | - |
| &nbsp;&nbsp; enabled                  | A boolean that enables/disables authorization feature.                                                                                                                                                                                                                                                                                                                          |  No      |   false   |
| &nbsp;&nbsp; proxyHost | Hostname of the csm-authorization server.                                                                                                                                                                                                                                                                                                                                       | No | Empty |
| &nbsp;&nbsp; skipCertificateValidation | A boolean that enables/disables certificate validation of the csm-authorization proxy server.                                                                                                                                                                                                                                                                                   | No | true |
| **migration** | [Migration](../../../../../replication/migration/migrating-volumes-same-array) is an optional feature to enable migration between storage classes                                                                                                                                                                                                                               | - | - |
| &nbsp;&nbsp; enabled                  | A boolean that enables/disables migration feature.                                                                                                                                                                                                                                                                                                                              |  No      |   false   |
| &nbsp;&nbsp; image | Image for dell-csi-migrator sidecar.                                                                                                                                                                                                                                                                                                                                            | No | " " |
| &nbsp;&nbsp; nodeRescanSidecarImage | Image for node rescan sidecar which rescans nodes for identifying new paths.                                                                                                                                                                                                                                                                                                    | No | " " |
| &nbsp;&nbsp; migrationPrefix | enables migration sidecar to read required information from the storage class fields                                                                                                                                                                                                                                                                                            | No | migration.storage.dell.com |
| **replication** | [Replication](../../../../../deployment/helm/modules/installation/replication/) is an optional feature to enable replication & disaster recovery capabilities of PowerMax to Kubernetes clusters.                                                                                                                                                                               | - | - |
| &nbsp;&nbsp; enabled                  | A boolean that enables/disables replication feature.                                                                                                                                                                                                                                                                                                                            |  No      |   false   |
| &nbsp;&nbsp; replicationContextPrefix | enables side cars to read required information from the volume context                                                                                                                                                                                                                                                                                                          | No | powermax |
| &nbsp;&nbsp; replicationPrefix | Determine if replication is enabled                                                                                                                                                                                                                                                                                                                                             | No | replication.storage.dell.com |
| **storageCapacity** | It is an optional feature that enable storagecapacity & helps the scheduler to check whether the requested capacity is available on the PowerMax array and allocate it to the nodes.                                                                                                                                                                                            | - | - |
| &nbsp;&nbsp; enabled                  | A boolean that enables/disables storagecapacity feature.                                                                                                                                                                                                                                                                                                                        |  -      |   true   |
| &nbsp;&nbsp; pollInterval | It configure how often external-provisioner polls the driver to detect changed capacity                                                                                                                                                                                                                                                                                         | - | 5m |
| **vSphere**| This section refers to the configuration options for VMware virtualized environment support via RDM                                                                                                                                                                                                                                                                             |  -  | - |
| &nbsp;&nbsp; enabled                  | A boolean that enables/disables VMware virtualized environment support.                                                                                                                                                                                                                                                                                                         |  No      |   false   |
| &nbsp;&nbsp; fcPortGroup                  | Existing portGroup that driver will use for vSphere.                                                                                                                                                                                                                                                                                                                            |  Yes      |   ""   |
| &nbsp;&nbsp; fcHostGroup                  | Existing host(initiator group)/hostgroup(cascaded initiator group) that driver will use for vSphere.                                                                                                                                                                                                                                                                            |  Yes      |   ""   |
| &nbsp;&nbsp; vCenterHost                  | URL/endpoint of the vCenter where all the ESX are present                                                                                                                                                                                                                                                                                                                       |  Yes      |   ""   |
| &nbsp;&nbsp; vCenterCredSecret                  | Secret name for the vCenter credentials.                                                                                                                                                                                                                                                                                                                                        |  Yes      |   ""   |
{{< /collapse >}}
</ul>

8. Make sure to provide the base64 encoded TLS certificate and key contents created in the [CSI PowerMax Reverse Proxy](#csi-powermax-reverse-proxy) prerequisite step above.
    ```yaml
    csireverseproxy:
      tlsSecret: csirevproxy-tls-secret
      deployAsSidecar: false
      port: 2222
      useSecret: true
      certManager:
        selfSignedCert: false
        certificateFile: |
          dGhpcyBzdHJpbmcgc2VydmVzIGFzIGFuIGV4YW1wbGUgb2Ygd2hhdCBhIGJhc2U2NCBlbmNvZGVk
          IGNlcnRpZmljYXRlIGZpbGUgbWlnaHQgbG9vayBsaWtlIGluIG15LXBvd2VybWF4LXNldHRpbmdz
          LnlhbWwgZmlsZQo=
        privateKeyFile: |
          dGhpcyBzdHJpbmcgc2VydmVzIGFzIGFuIGV4YW1wbGUgb2Ygd2hhdCBhIGJhc2U2NCBlbmNvZGVk
          IHByaXZhdGUga2V5IG1pZ2h0IGxvb2sgbGlrZSBpbiBteS1wb3dlcm1heC1zZXR0aW5ncy55YW1s
          IGZpbGUK
    ```
9. Install the driver using `csi-install.sh` bash script in the `dell-csi-helm-installer` directory by running
    ```bash
    ./csi-install.sh --namespace powermax --values ./my-powermax-settings.yaml --helm-charts-version <version>
    ```
  > Alternatively, you can also install the driver using the standalone helm chart.
  > ```bash
  > helm install powermax ./csi-powermax --namespace powermax --values my-powermax-settings.yaml
  > ```

> Notes:
> - The parameter `--helm-charts-version` is optional and if you do not specify the flag, by default the `csi-install.sh` script will clone the version of the helm chart that is specified in the driver's [csi-install.sh](https://github.com/dell/csi-powermax/blob/main/dell-csi-helm-installer/csi-install.sh#L52) file. If you wish to install the driver using a different version of the helm chart, you need to include this flag. Also, remember to delete the `helm-charts` repository present in the `csi-powermax` directory if it was cloned before.
> - For detailed instructions on how to run the install scripts, see the README document in the dell-csi-helm-installer folder.
> - There are a set of samples provided [here](#sample-values-file) to help you configure the driver with reverse proxy
> - This script also runs the verify.sh script in the same directory. You will be prompted to enter the credentials for each of the Kubernetes nodes. The `verify.sh` script needs the credentials to check if the iSCSI initiators have been configured on all nodes. You can also skip the verification step by specifying the `--skip-verify-node` option
> - In order to enable CSM Authorization, there should be an authorization proxy server already installed.
> - PowerMax Array username must have role as `StorageAdmin` to be able to perform CRUD operations.
> - If the user is using complex K8s version like “v1.24.3-mirantis-1”, use this kubeVersion check in [helm Chart](https://github.com/dell/helm-charts/blob/main/charts/csi-powermax/Chart.yaml) file. `kubeVersion: “>= 1.24.0-0 < 1.29.0-0”`.
> - User should provide all boolean values with double-quotes. This applies only for `my-powermax-settings.yaml`. Example: “true”/“false”.
> - The `controllerCount` parameter value should be <= number of nodes in the kubernetes cluster, otherwise the install script will fail.
> - Endpoints should not have any special characters at the end (e.g. trailing forward slash) apart from port number.

## Storage Classes

A wide set of annotated storage class manifests has been provided in the `samples/storageclass` folder. Please use these samples to create new storage classes to provision storage.

## Volume Snapshot Class

Starting with CSI PowerMax v1.7.0, `dell-csi-helm-installer` will not create any Volume Snapshot Class during the driver installation. There is a sample Volume Snapshot Class manifest present in the _samples/volumesnapshotclass_ folder. Please use this sample to create a new Volume Snapshot Class to create Volume Snapshots.

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

