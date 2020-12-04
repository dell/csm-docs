---
title: PowerFlex
description: >
  Installing PowerFlex CSI Driver via Operator
---
## Installing PowerFlex CSI Driver via Operator

The CSI Driver for Dell EMC PowerFlex can be installed via the Dell CSI Operator.

To deploy the Operator, follow the instructions available [here](../).

There are sample manifests provided which can be edited to do an easy installation of the driver. Note that the deployment of the driver using the operator does not use any Helm charts. The installation and configuration parameters will be slightly different from the ones specified via the Helm installer.

Kubernetes Operators make it easy to deploy and manage entire lifecycle of complex Kubernetes applications. Operators use Custom Resource Definitions (CRD) which represents the application and use custom controllers to manage them.

### Prerequisites:
#### Automated SDC Deployment for Operator 
- This applies to OpenShift with RHCOS Nodes **_Only_**.
- This feature deploys the sdc kernel modules on CoreOS nodes with the help of an init container.
- **Required:** MDM value need to be provided in CR file for the sdc init container to work. Expect error if not in proper format.
- To use a specific image from ftp site, pass in repo url, repo password and repo username.
  - Repo username and repo password are to be encrypted by a secret and passed in.
  - Create secret for FTP side by using the command `kubectl create -f sdc-repo-secret.yaml`.
- Optionally, enable sdc monitor by uncommenting the section for sidecar in manifest yaml.
##### Example CR:  [config/samples/vxflexos_v130_ops_46.yaml](https://github.com/dell/dell-csi-operator/blob/master/samples/vxflexos_v130_ops_46.yaml)
```yaml
    #sideCars:
    # Uncomment the following section if you want to run the monitoring sidecar
    #  - name: sdc-monitor
    #    envs:
    #    - name: HOST_PID
    #      value: "1"
    initContainers:
      - image: dellemc/sdc:3.6.0.176-3.5.1000.176
        imagePullPolicy: IfNotPresent
        name: sdc
        envs:
          - name: MDM
            value: "10.xx.xx.xx,10.xx.xx.xx"
```  

### Install Driver

1. Create namespace: 
   Run `kubectl create namespace <driver-namespace>` command using the desired name to create the namespace.
2. Create PowerFlex credentials:
   Create a file called vxflexos-creds.yaml with the following content
     ```yaml
        apiVersion: v1
	      kind: Secret
	      metadata:
          name: vxflexos-creds
	        # Replace driver-namespace with the namespace where driver is being deployed
	        namespace: <driver-namespace>
	      type: Opaque
	      data:
	        # set username to the base64 encoded username
	        username: <base64 username>
	        # set password to the base64 encoded password
	        password: <base64 password>
     ```
   Replace the values for the username and password parameters. These values can be optioned using base64 encoding as described in the following example:
   ```
   echo -n "myusername" | base64
   echo -n "mypassword" | base64
   ```
   Run `kubectl create -f vxflexos-creds.yaml` command to create the secret.
3. Create a Custom Resource (CR) for PowerFlex using the sample files provided    [here](https://github.com/dell/dell-csi-operator/tree/master/samples) .
4. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the PowerFlex driver and their default values:
   
   | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | replicas | Controls the amount of controller pods you deploy. If controller pods is greater than number of available nodes, excess pods will become stuck in pending. Defaults is 2 which allows for Controller high availability. | Yes | 2 |
   | ***Common parameters for node and controller*** |
   | X_CSI_VXFLEXOS_SYSTEMNAME | Defines the name of the PowerFlex system from which volumes will be provisioned. This must either be set to the PowerFlex system name or system ID | Yes | systemname |
   | X_CSI_VXFLEXOS_ENDPOINT | Defines the PowerFlex REST API endpoint, with full URL, typically leveraging HTTPS. You must set this for your PowerFlex installations REST gateway | Yes | https://127.0.0.1 |
   | CSI_ENDPOINT | The UNIX socket address for handling gRPC calls	| No |/var/run/csi/csi.sock |
   | X_CSI_VXFLEXOS_ENABLELISTVOLUMESNAPSHOT | Enable list volume operation to include snapshots (since creating a volume from a snap actually results in a new snap) | No | false |
   | X_CSI_VXFLEXOS_ENABLESNAPSHOTCGDELETE | Enable this to automatically delete all snapshots in a consistency group when a snap in the group is deleted | No | false |
   | X_CSI_DEBUG | To enable debug mode | No | false |
   | ***StorageClass parameters*** |
   | storagePool | Defines the PowerFlex storage pool from which this driver will provision volumes. You must set this for the primary storage pool to be used | Yes | pool1 |
   | allowVolumeExpansion | Once the allowed topology is modified in storage class, pods/and volumes will always be scheduled on nodes that have access to the storage | No | true |
   | allowedTopologies:key | This is to enable topology to allow pods/and volumes to always be scheduled on nodes that have access to the storage. You need to replace the X_CSI_VXFLEXOS_SYSTEMNAME in the key with the actual systemname value | No | X_CSI_VXFLEXOS_SYSTEMNAME |
   | initContainers:value | Set the MDM IP's here if installing on CoreOS to enable automatic SDC installation | Yes (OpenShift) | "10.xx.xx.xx,10.xx.xx.xx"|
5.  Execute the `kubectl create -f <input_sample_file.yaml>` command to create PowerFlex custom resource. This command will deploy the CSI-PowerFlex driver.
