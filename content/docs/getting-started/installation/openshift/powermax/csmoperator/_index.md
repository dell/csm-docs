---
title: Installation Guide
linkTitle: Operator
no_list: true
weight: 2
description: >
  Installing the CSI Driver for PowerMax via Container Storage Module Operator
---


1. Set up an OpenShift cluster following the official documentation.
2. Proceed to the Prerequisite
3. Complete the base installation.
4. Proceed with module installation.
<br>



{{< accordion id="One" title="Prerequisite" >}}
<br>
{{<include  file="content/docs/getting-started/installation/openshift/powermax/prerequisite/_index.md" >}}

{{< /accordion >}}
<br>

{{< accordion id="Two" title="Base Install" markdown="true" >}}  

</br>

### Operator Installation

</br>
 
1. On the OpenShift console, navigate to **OperatorHub** and use the keyword filter to search for **Dell Container Storage Modules.** 

2. Click **Dell Container Storage Modules** tile 

3. Keep all default settings and click **Install**.

</br>
<ol>

Verify that the operator is deployed 
```terminal 
oc get operators

NAME                                                          AGE
dell-csm-operator-certified.openshift-operators               2d21h
```  

```terminal
oc get pod -n openshift-operators

NAME                                                       READY   STATUS       RESTARTS      AGE
dell-csm-operator-controller-manager-86dcdc8c48-6dkxm      2/2     Running      21 (19h ago)  2d21h
``` 


</ol>
</br>


### CSI Driver Installation
</br>

1. **Create namespace:**
    ```bash
      oc create namespace powermax
    ```
2. **Create PowerMax credentials:**

   Create a file called `config.yaml` or pick a [sample](https://github.com/dell/csi-powermax/blob/main/samples/secret/secret.yaml).

    ```yaml
    cat << EOF > config.yaml
    storageArrays:
      - storageArrayId: "000000000001"
        primaryEndpoint: https://primary-1.unisphe.re:8443
        backupEndpoint: https://backup-1.unisphe.re:8443
    managementServers:
      - endpoint: https://primary-1.unisphe.re:8443
        username: admin
        password: password
        skipCertificateValidation: true
      - endpoint: https://backup-1.unisphe.re:8443
        username: admin2
        password: password2
        skipCertificateValidation: false
        certSecret: primary-cert
    EOF
    ```

    Edit the file, then run the command to create the `powermax-creds`.

    ```bash
      oc create secret generic powermax-creds --from-file=config=config.yaml -n powermax --dry-run=client -oyaml > secret-powermax-config.yaml
    ```

    Use this command to `create` the config:
    ```bash
      oc apply -f secret-powermax-config.yaml
    ```

    Use this command to `replace or update` the config:
    ```bash
      oc replace -f secret-powermax-config.yaml --force
    ```

    Verify config secret is created.
    ```terminal
      oc get secret -n powermax

      NAME                 TYPE        DATA   AGE
      powermax-creds       Opaque      1      3h7m
    ```

3. **Create Powermax Array Configmap:**
  
    **Note:** `powermax-array-config` is deprecated and remains for backward compatibility only. You can skip creating it and instead add values for X_CSI_MANAGED_ARRAYS, X_CSI_TRANSPORT_PROTOCOL, and X_CSI_POWERMAX_PORTGROUPS in the sample files.

    Create a configmap using the sample file [here](https://github.com/dell/csi-powermax/blob/main/samples/configmap/powermax-array-config.yaml). Fill in the appropriate values for driver configuration.
    ```yaml
    # To create this configmap use: kubectl create -f powermax-array-config.yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: powermax-array-config
      namespace: powermax
    data:
      powermax-array-config.yaml: |
        # List of comma-separated port groups (ISCSI only). Example: PortGroup1, portGroup2 Required for iSCSI only
        X_CSI_POWERMAX_PORTGROUPS: ""
        # Choose which transport protocol to use (ISCSI, FC, NVMETCP, auto) defaults to auto if nothing is specified
        X_CSI_TRANSPORT_PROTOCOL: ""
        # IP address of the Unisphere for PowerMax (Required), Defaults to https://0.0.0.0:8443
        X_CSI_POWERMAX_ENDPOINT: "https://10.0.0.0:8443"
        # List of comma-separated array ID(s) which will be managed by the driver (Required)
        X_CSI_MANAGED_ARRAYS: "000000000000,000000000000,"
    ```

4. **Create the Reverse Proxy TLS Secret**

    Referencing the TLS certificate and key created in the [CSI PowerMax Reverse Proxy](./#csi-powermax-reverse-proxy) prerequisite, create the `csirevproxy-tls-secret` secret.
    ```bash
    oc create secret -n powermax tls csirevproxy-tls-secret --cert=tls.crt --key=tls.key
    ```

5. **Create a CR (Custom Resource)** for PowerMax using the sample files provided

    a. **Minimal Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/release/{{< version-docs key="csm-operator_latest_version">}}/samples/{{< version-docs key="csm-operator_latest_samples_dir" >}}/minimal-samples/powermax_{{< version-docs key="Min_sample_operator_pmax" >}}.yaml) for default settings. If using the secret above, ensure that the secret name of the secret created is `powermax-creds`.

    [OR]

    b. **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/release/{{< version-docs key="csm-operator_latest_version">}}/samples/{{< version-docs key="csm-operator_latest_samples_dir" >}}/storage_csm_powermax_{{< version-docs key="Det_sample_operator_pmax" >}}.yaml) for detailed settings or use [Wizard](./installationwizard#generate-manifest-file) to generate the sample file. 
    .

    Beginning with CSM version 1.16, the sample Custom Resource (CR) files include a new field, spec.version,      which identifies the target CSM release to be deployed. When this field is defined, users can supply container images using either the ConfigMap-based image specification or the custom registry configuration. These approaches eliminate the need to hardcode image references directly within the CR.<br><br>
    Detailed guidance for both image management methods is available in the [NOTES](docs/getting-started/installation/kubernetes/powerstore/csmoperator/installationwizard/#installation-using-operator) section of the **Installation Using Operator**  documentation.<br><br>
    **If neither method is configured, the operator automatically falls back to using the default image set associated with the corresponding drivers and modules.**<br>

    c. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerMax driver and their default values:

<ul>
{{< collapse id="1" title="Parameters">}}
   | Parameter                                       | Description                                                                                                                                                                                                                                                              | Required | Default                        |
   |-------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|--------------------------------|
   | dnsPolicy                                       | Determines the DNS Policy of the Node service                                                                                                                                                                                                                            | Yes      | ClusterFirstWithHostNet        |
   | replicas                                        | Controls the number of controller Pods you deploy. If controller Pods are greater than the number of available nodes, excess Pods will become stuck in pending. The default is 2 which allows for Controller high availability.                                          | Yes      | 2                              |
   | fsGroupPolicy                                   | Defines which FS Group policy mode to be used, Supported modes `None, File and ReadWriteOnceWithFSType`. In OCP <= 4.16 and K8s <= 1.29, fsGroupPolicy is an immutable field.                                                                                                                                                                  | No       | "ReadWriteOnceWithFSType"      |
   | ***Common parameters for node and controller*** |                                                                                                                                                                                                                                                                          |          |                                |
   | X_CSI_K8S_CLUSTER_PREFIX                        | Define a prefix that is appended to all resources created in the array; unique per K8s/CSI deployment; max length - 3 characters                                                                                                                                         | No      | CSM                            |
   | X_CSI_POWERMAX_PROXY_SERVICE_NAME               | Name of CSI PowerMax ReverseProxy service.                                                                                                                                                                                                                               | Yes      | csipowermax-reverseproxy       |
   | X_CSI_IG_MODIFY_HOSTNAME                        | Change any existing host names. When node name template is set, it changes the name to the specified format else it uses driver default host name format.                                                                                                                  | No       | false                          |
   | X_CSI_IG_NODENAME_TEMPLATE                      | Provide a template for the CSI driver to use while creating the Host/IG on the array for the nodes in the cluster. It is of the format a-b-c-%foo%-xyz where foo will be replaced by host name of each node in the cluster.                                              | No       | -                              |
   | X_CSI_POWERMAX_DRIVER_NAME                      | Set custom CSI driver name. For more details on this feature see the related [documentation](../../../../../concepts/csidriver/features/powermax/#custom-driver-name)                                                                                                                             | No       | -                              |
   | X_CSI_HEALTH_MONITOR_ENABLED                    | Enable/Disable health monitor of CSI volumes from Controller and Node plugin. Provides details of volume status, usage and volume condition. As a prerequisite, external-health-monitor sidecar section should be uncommented in samples which would install the sidecar | No       | false                          |
   | X_CSI_VSPHERE_ENABLED                           | Enable VMware virtualized environment support via RDM                                                                                                                                                                                                                    | No       | false                          |
   | X_CSI_VSPHERE_PORTGROUP                         | Existing portGroup that driver will use for vSphere                                                                                                                                                                                                                      | Yes      | ""                             |
   | X_CSI_VSPHERE_HOSTNAME                          | Existing host(initiator group)/host group(cascaded initiator group) that driver will use for vSphere                                                                                                                                                                     | Yes      | ""                             |
   | X_CSI_VCenter_HOST                              | URL/endpoint of the vCenter where all the ESX are present                                                                                                                                                                                                                | Yes      | ""                             |
   | X_CSI_REVPROXY_USE_SECRET | Define whether or not to use the new secret format for the PowerMax and the Reverse Proxy. The secret format will be determined by the contents of the secret specified in the `authSecret`. **Note:** If this parameter remains `false`, PowerMax and the reverse proxy will use the configMap approach. | Yes      | "false" |
   | X_CSI_DYNAMIC_SG_ENABLED | Enable/Disable creation of multiple storage groups with a single storage class. When enabled, driver dynamically creates multiple storage groups when the existing storage groups reach the maximum volume limit. | Yes      | "false" |
   | ***Node parameters***                           |                                                                                                                                                                                                                                                                          |          |                                |
   | X_CSI_POWERMAX_ISCSI_ENABLE_CHAP                | Enable ISCSI CHAP authentication. For more details on this feature see the related [documentation](../../../../../concepts/csidriver/features/powermax/#iscsi-chap)                                                                                                                               | No       | false                          |
   | X_CSI_TOPOLOGY_CONTROL_ENABLED                  | Enable/Disable topology control. It filters out arrays, associated transport protocol available to each node and creates topology keys based on any such user input.                                                                                                      | No       | false                          |
   | ***CSI Reverseproxy Module***                   |                                                                                                                                                                                                                                                                          |          |                                |
   | X_CSI_REVPROXY_TLS_SECRET                       | Name of TLS secret defined in config map                                                                                                                                                                                                                                 | Yes      | "csirevproxy-tls-secret"       |
   | X_CSI_REVPROXY_PORT                             | Port number where reverseproxy will listen as defined in config map                                                                                                                                                                                                      | Yes      | "2222"                         |
   | X_CSI_CONFIG_MAP_NAME                           | Name of config map as created for CSI PowerMax                                                                                                                                                                                                                           | Yes      | "powermax-reverseproxy-config" |
  {{< /collapse >}}

  i. Confirm that value of `X_CSI_REVPROXY_USE_SECRET` is set to `true`.

  ii. **Create PowerMax custom resource**:

  ```bash
  oc create -f <input_sample_file.yaml>
  ```

  This command will deploy the CSI PowerMax driver in the namespace specified in the input YAML file.

  Check if ContainerStorageModule CR is created successfully:
  ```bash
  oc get csm powermax -n powermax

  NAME        CREATIONTIME   CSIDRIVERTYPE   CONFIGVERSION   STATE
  powermax    3h             powermax        {{< version-docs key="PMax_latestVersion" >}}         Succeeded      
  ```

  Check the status of the CR to verify if the driver installation is in the `Succeeded` state. If the status is not `Succeeded`, see the [Troubleshooting guide](../troubleshooting/#my-dell-csi-driver-install-failed-how-do-i-fix-it) for more information.
</ul>

6. Refer [Volume Snapshot Class](https://github.com/dell/csi-powermax/tree/main/samples/volumesnapshotclass) and [Storage Class](https://github.com/dell/csi-powermax/tree/main/samples/storageclass) for the sample files.

## Other features to enable
### Dynamic Logging Configuration

This feature is introduced in CSI Driver for powermax version 2.0.0.

As part of driver installation, a ConfigMap with the name `powermax-config-params` is created using the manifest located in the sample file. This ConfigMap contains an attribute `CSI_LOG_LEVEL` which specifies the current log level of the CSI driver. To set the default/initial log level user can set this field during driver installation.

To update the log level dynamically user has to edit the ConfigMap `powermax-config-params` and update `CSI_LOG_LEVEL` to the desired log level.
```bash
kubectl edit configmap -n powermax powermax-config-params
```

### Volume Health Monitoring
This feature is introduced in CSI Driver for PowerMax version 2.2.0.

Volume Health Monitoring feature is optional and by default this feature is disabled for drivers when installed via CSM operator.

To enable this feature, set  `X_CSI_HEALTH_MONITOR_ENABLED` to `true` in the driver manifest under controller and node section. Also, install the `external-health-monitor` from `sideCars` section for controller plugin.
To get the volume health state `value` under controller should be set to true as seen below. To get the volume stats `value` under node should be set to true.
```yaml
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

### Support for custom topology keys

This feature is introduced in CSI Driver for PowerMax version 2.3.0.

Support for custom topology keys is optional and by default this feature is disabled for drivers when installed via CSM operator.

X_CSI_TOPOLOGY_CONTROL_ENABLED provides a way to filter topology keys on a node based on array and transport protocol. If enabled, user can create custom topology keys by editing node-topology-config configmap.

1. To enable this feature, set  `X_CSI_TOPOLOGY_CONTROL_ENABLED` to `true` in the driver manifest under node section.

   ```yaml
      # X_CSI_TOPOLOGY_CONTROL_ENABLED provides a way to filter topology keys on a node based on array and transport protocol
           # if enabled, user can create custom topology keys by editing node-topology-config configmap.
           # Allowed values:
           #   true: enable the filtration based on config map
           #   false: disable the filtration based on config map
           # Default value: false
           - name: X_CSI_TOPOLOGY_CONTROL_ENABLED
             value: "false"
   ```
2. Edit the sample config map "node-topology-config" as described [here](https://github.com/dell/csi-powermax/blob/main/samples/configmap/topologyConfig.yaml) with appropriate values:
   Example:
   ```yaml
           kind: ConfigMap
           metadata:
             name: node-topology-config
             namespace: powermax
           data:
             topologyConfig.yaml: |
               allowedConnections:
                 - nodeName: "node1"
                   rules:
                     - "000000000001:FC"
                     - "000000000002:FC"
                 - nodeName: "*"
                   rules:
                     - "000000000002:FC"
               deniedConnections:
                 - nodeName: "node2"
                   rules:
                     - "000000000002:*"
                 - nodeName: "node3"
                   rules:
                     - "*:*"

     ```
  <ul>
   {{< collapse id="2" title="Parameters">}}
   | Parameter | Description  |
   |-----------|--------------|
   | allowedConnections | List of node, array and protocol info for user allowed configuration |
   | allowedConnections.nodeName | Name of the node on which user wants to apply given rules |
   | allowedConnections.rules | List of StorageArrayID:TransportProtocol pair |
   | deniedConnections | List of node, array and protocol info for user denied configuration |
   | deniedConnections.nodeName | Name of the node on which user wants to apply given rules  |
   | deniedConnections.rules | List of StorageArrayID:TransportProtocol pair |
   {{< /collapse >}}
  </ul>
<br>

3. Run following command to create the configmap
   ```bash
   kubectl create -f topologyConfig.yaml
   ```
 >Note: Name of the configmap should always be `node-topology-config`.



{{< /accordion >}}   

<br>

{{< accordion id="Three" title="Modules" >}}

<br>   

{{< cardcontainer >}}

    {{< customcard link1="./csm-modules/authorizationv2-0"   image="1" title="Authorization v2.0" >}}
    {{< customcard  link1="./csm-modules/observability"   image="1" title="Observability" >}}
    {{< customcard  link1="./csm-modules/replication"  image="1" title="Replication" >}}
    {{< customcard link1="./csm-modules/resiliency"   image="1" title="Resiliency" >}}

{{< /cardcontainer >}}
{{< /accordion >}}  
