---
title: "Installation Guide"
linktitle: "Operator"
no_list: true
description: CSM Operator Installation
weight: 2
---

1. Set up a Kubernetes cluster following the official documentation.
3. Complete the base installation.
4. Proceed with module installation.

## Operator Installation

To deploy the Operator, follow the instructions available [here](../../../operator/operatorinstallation_kubernetes.md).

{{< accordion id="Two" title="Base Install" markdown="true" >}}  

### Prerequisites

- If multipath is configured, ensure CSI-PowerFlex volumes are blacklisted by multipathd. See [troubleshooting section](../../../../../concepts//csidriver/troubleshooting/powerflex) for details.


##### **SDC Deployment for Operator**

- **Overview:**
This feature deploys the SDC kernel modules on all nodes using an init container. PowerFlex can be deployed with or without SDC.

- **Enable/Disable SDC:**
Set the `X_CSI_SDC_ENABLED` value in the CR file. By default, SDC is enabled.

-  **Manual Deployment:**
For unsupported OS versions, follow the manual SDC deployment steps. Refer to https://hub.docker.com/r/dellemc/sdc for supported versions.

- **MDM Value:**
The operator sets the MDM value for initContainers in the driver CR from the `mdm` attributes in `config.yaml`. Do not set this manually.

-  **SDC Monitor:**
Enable the SDC monitor by setting the `enable` flag to `true`.
   - **With Sidecar**: Edit the `HOST_PID` and `MDM` fields with the host PID and MDM IPs.
   - **Without Sidecar**: Leave the `enabled` field set to `false`.

   Example CR: [samples/storage_csm_powerflex_{{< version-v1 key="sample_sc_pflex" >}}.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerflex_{{< version-v1 key="sample_sc_pflex" >}}.yaml)

```yaml
    sideCars:
    # sdc-monitor is disabled by default, due to high CPU usage
      - name: sdc-monitor
        enabled: false
        image: quay.io/dell/storage/powerflex/sdc:4.5.2.1
        envs:
        - name: HOST_PID
          value: "1"
        - name: MDM
          value: "10.xx.xx.xx,10.xx.xx.xx" #provide the same MDM value from secret
```

##### **Manual SDC Deployment**

For detailed PowerFlex installation procedure, see the [Dell PowerFlex Deployment Guide](https://docs.delltechnologies.com/bundle/VXF_DEPLOY/page/GUID-DD20489C-42D9-42C6-9795-E4694688CC75.html). Install the PowerFlex SDC using this procedure:

**Steps**

1. **Download SDC:** 
Download the PowerFlex SDC from [Dell Online support](https://www.dell.com/support). The filename is EMC-ScaleIO-sdc-*.rpm, where * is the SDC name corresponding to the PowerFlex installation version.
2. **Set MDM IPs:** 
  Export the MDM IPs as a comma-separated list: 
    ```bash
     export MDM_IP=xx.xxx.xx.xx,xx.xxx.xx.xx
    ``` 
   where xxx represents the actual IP address in your environment. 

3. **Install SDC:**   
Install the SDC per the _Dell PowerFlex Deployment Guide_: 

    - For RPM environments, run:
     ```bash
     rpm -iv ./EMC-ScaleIO-sdc-*.x86_64.rpm 
     ``` 
     Replace * with the SDC name corresponding to the PowerFlex version. 

4. **Add MDM IPs for Multi-Array support:** 
run `/opt/emc/scaleio/sdc/bin/drv_cfg --add_mdm --ip 10.xx.xx.xx.xx,10.xx.xx.xx`.


### CSI Driver Installation
<br>

1. **Create namespace:**

   ```bash 
      kubectl create namespace powerflex
   ```
   This command creates a namespace called `powerflex`. You can replace `powerflex` with any name you prefer.

2. **Create `secret.yaml`.** 
   
   a. Create a file called `secret.yaml` or pick a [sample](https://github.com/dell/csi-powerflex/blob/main/samples/secret.yaml) that has Powerflex array connection details: 

   ```yaml
    - username: "admin"
      password: "password"
      systemID: "2b11bb111111bb1b"
      endpoint: "https://127.0.0.2"
      skipCertificateValidation: true
      mdm: "10.0.0.3,10.0.0.4"
   ```
      - **Update Parameters:** Replace placeholders with actual values for your Powerflex array.
      - **Add Blocks:** If you have multiple Powerflex arrays, add similar blocks for each one.
      - **Replication:** If replication is enabled, make sure the `secret.yaml` includes all involved Powerflex arrays.
   <br>   
   b. After editing the file, **run this command to create a secret** called `powerflex-config`.

    ```bash
      kubectl create secret generic powerflex-config -n powerflex --from-file=config=secret.yaml
    ```
     Use this command to **replace or update** the secret:

    ```bash
      kubectl create secret generic powerflex-config -n powerflex --from-file=config=secret.yaml -o yaml --dry-run=client | kubectl replace -f -
    ```

3. **Install driver:**

   i. **Create a CR (Custom Resource)** for PowerFlex using the sample files provided

      a. **Minimal Configuration:** 
    ```yaml
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
      name: vxflexos
      namespace: powerflex
    spec:
      driver:
        csiDriverType: "powerflex"
        configVersion: {{< version-v1 key="PFlex_latestVersion" >}}
        forceRemoveDriver: true
    ```   
     Refer the [sample file](https://github.com/dell/csm-operator/blob/main/samples/minimal-samples/powerflex_{{< version-v1 key="sample_sc_pflex" >}}.yaml). Modify if needed.

    [OR]                                                

    b. **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerflex_{{< version-v1 key="sample_sc_pflex" >}}.yaml) for detailed settings.

- Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerFlex driver and their default values: 
<ul>
{{< collapse id="1" title="Parameters">}}
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   |<div style="text-align: left"> namespace |<div style="text-align: left"> Specifies namespace where the driver will be installed | Yes | "vxflexos" |
   |<div style="text-align: left"> dnsPolicy |<div style="text-align: left"> Determines the DNS Policy of the Node service | Yes | ClusterFirstWithHostNet |
   |<div style="text-align: left"> fsGroupPolicy |<div style="text-align: left"> Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field. | No | "File" |
   |<div style="text-align: left"> replicas |<div style="text-align: left"> Controls the number of controller pods you deploy. If the number of controller pods is greater than the number of available nodes, excess pods will become stay in a pending state. | Yes | 1 |
   |<div style="text-align: left"> storageCapacity.enabled |<div style="text-align: left"> Enable/Disable storage capacity tracking | No | true |
   |<div style="text-align: left"> storageCapacity.pollInterval |<div style="text-align: left"> Configure how often the driver checks for changed capacity | No | 5m |
   |<div style="text-align: left"> enableQuota |<div style="text-align: left"> a boolean that, when enabled, will set quota limit for a newly provisioned NFS volume | No | none |
   |<div style="text-align: left"> maxVxflexosVolumesPerNode |<div style="text-align: left"> Specify default value for maximum number of volumes that controller can publish to the node.If value is zero CO SHALL decide how many volumes of this type can be published by the controller to the node | Yes | 0 |
   |<div style="text-align: left"> ***Common parameters for node and controller*** |
   |<div style="text-align: left"> X_CSI_VXFLEXOS_ENABLELISTVOLUMESNAPSHOT |<div style="text-align: left"> Enable list volume operation to include snapshots (since creating a volume from a snap actually results in a new snap) | No | false |
   |<div style="text-align: left"> X_CSI_VXFLEXOS_ENABLESNAPSHOTCGDELETE |<div style="text-align: left"> Enable this to automatically delete all snapshots in a consistency group when a snap in the group is deleted | No | false |
   |<div style="text-align: left"> X_CSI_ALLOW_RWO_MULTI_POD_ACCESS |<div style="text-align: left"> Setting allowRWOMultiPodAccess to "true" will allow multiple pods on the same node to access the same RWO volume. This behavior conflicts with the CSI specification version 1.3. NodePublishVolume description that requires an error to be returned in this case. However, some other CSI drivers support this behavior and some customers desire this behavior. Customers use this option at their own risk. | No | false |
   |<div style="text-align: left"> INTERFACE_NAMES |<div style="text-align: left"> A mapping of node names to interface names. Only necessary when SDC is disabled. | No | none |
   |<div style="text-align: left"> CSI_LOG_LEVEL |<div style="text-align: left"> Sets the logging level of the driver. | No | INFO |
   |<div style="text-align: left"> GOSCALEIO_DEBUG |<div style="text-align: left"> Enable/Disable goscaleio library-level debugging. | No | false |
   |<div style="text-align: left"> GOSCALEIO_SHOWHTTP |<div style="text-align: left"> Enable/Disable goscaleio library-level REST request logging. Enabling will also **enable** GOSCALEIO_DEBUG regardless of GOSCALEIO_DEBUG setting. | No | false |
   |<div style="text-align: left"> ***Controller parameters*** |
   |<div style="text-align: left"> X_CSI_POWERFLEX_EXTERNAL_ACCESS |<div style="text-align: left"> allows specifying additional entries for hostAccess of NFS volumes. Both single IP address and subnet are valid entries | No | empty |
   |<div style="text-align: left"> X_CSI_HEALTH_MONITOR_ENABLED |<div style="text-align: left"> Enable/Disable health monitor of CSI volumes from Controller plugin - volume condition | No | false |
   |<div style="text-align: left"> ***Node parameters*** |
   |<div style="text-align: left"> X_CSI_RENAME_SDC_ENABLED |<div style="text-align: left"> Enable this to rename the SDC with the given prefix. The new name will be ("prefix" + "worker_node_hostname") and it should not exceed 31 chars. | Yes | false |
   |<div style="text-align: left"> X_CSI_APPROVE_SDC_ENABLED |<div style="text-align: left"> Enable this to to approve restricted SDC by GUID during setup | Yes | false |
   |<div style="text-align: left"> X_CSI_HEALTH_MONITOR_ENABLED |<div style="text-align: left"> Enable/Disable health monitor of CSI volumes from Node plugin - volume condition | No | false |
   |<div style="text-align: left"> X_CSI_SDC_ENABLED |<div style="text-align: left"> Enable/Disable installation of the SDC. | Yes | true |
   |<div style="text-align: left"> ***Sidecar parameters*** |
   |<div style="text-align: left">  volume-name-prefix |<div style="text-align: left">  The volume-name-prefix will be used by provisioner sidecar as a prefix for all the volumes created  | Yes | k8s |
   |<div style="text-align: left"> volume-name-prefix |<div style="text-align: left">  The volume-name-prefix will be used by provisioner sidecar as a prefix for all the volumes created  | Yes | k8s |
   |<div style="text-align: left">  monitor-interval |<div style="text-align: left">  The monitor-interval will be used by external-health-monitor as an interval for health checks  | Yes | 60s |
{{< /collapse >}}

ii . **Run this command to create** a PowerFlex custom resource:

```bash
  kubectl create -f <input_sample_file.yaml>
```

   This command will deploy the CSI-PowerFlex driver in the namespace specified in the input YAML file.
</ul> 

4. **Verify the installation:**

    * Check if ContainerStorageModule CR is created successfully using the command below:
        ```bash
        kubectl get csm/powerflex -n powerflex
        ```
    * Check the status of the CR to verify if the driver installation is in the `Succeed` state. If the status is not `Succeed`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.

 <br>

5. **Create Storage class:** 
   ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: vxflexos
      annotations:
        storageclass.kubernetes.io/is-default-class: "true"
    provisioner: csi-vxflexos.dellemc.com
    reclaimPolicy: Delete
    allowVolumeExpansion: true
    parameters:
      storagepool: <STORAGE_POOL>
      systemID: <SYSTEM_ID>
      csi.storage.k8s.io/fstype: ext4
    volumeBindingMode: WaitForFirstConsumer
    allowedTopologies:
      - matchLabelExpressions:
          - key: csi-vxflexos.dellemc.com/<SYSTEM_ID>
            values:
              - csi-vxflexos.dellemc.com
   ```
     Refer [Storage Class](https://github.com/dell/csi-powerflex/tree/main/samples/storageclass) for different sample files.
    
    **Run this command to create** a storage class
    
   ```bash
     kubectl create -f < storage-class.yaml >
   ```

6. **Create Volume Snapshot Class:** 
    ```yaml
      apiVersion: snapshot.storage.k8s.io/v1
      kind: VolumeSnapshotClass
      metadata:
        name: vxflexos-snapclass
      deletionPolicy: Delete 
      ```
      Refer [Volume Snapshot Class](https://github.com/dell/csi-powerflex/tree/main/samples/volumesnapshotclass/) sample file.

     **Run this command to create** a volume snapshot class

   ```bash
    kubectl create -f < volume-snapshot-class.yaml >
   ```

**Note** :
   - Snapshotter and resizer sidecars are installed by default.

{{< /accordion >}}  

<br>

{{< accordion id="Three" title="Modules">}}
 <br>  

{{< markdownify >}}
The driver and modules versions installable with the Container Storage Modules Operator [Click Here](../../../../../supportmatrix/#operator-compatibility-matrix)
{{< /markdownify >}}

<br>   

{{< cardcontainer >}}
    {{< customcard link1="./csm-modules/authorizationv1-x"  image="6" title="Authorization v1.x" >}}

    {{< customcard link1="./csm-modules/authorizationv2-0"   image="6" title="Authorization v2.0"  >}}

    {{< customcard  link1="./csm-modules/observability"   image="6" title="Observability"  >}}

    {{< customcard  link1="./csm-modules/replication"  image="6" title="Replication"  >}} 

    {{< customcard link1="./csm-modules/resiliency"   image="6" title="Resiliency"  >}}

{{< /cardcontainer >}}
{{< /accordion >}}  
