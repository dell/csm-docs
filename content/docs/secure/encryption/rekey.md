---
title: "Rekey Configuration"
linkTitle: "Rekey Configuration"
weight: 4
Description: >
  Rekey Configuration and Usage
---

## Rekey Controller Installation

The CSM Encryption Rekey CRD Controller is an optional component that, if installed, allows encrypted volumes rekeying in a
Kubernetes cluster. The Rekey Controller can be installed via the standard Dell Helm Chart repository available 
at https://github.com/dell/helm-charts.

Dell Helm charts can also be added with the command `helm repo add dell https://dell.github.io/helm-charts`.

A secret of the cluster config must be created with the name ``cluster-kube-config`` typically from the .kube/config. Here is an example:  

```shell
 kubectl create secret generic cluster-kube-config --from-file=/home/root/.kube/config
```

The Rekey Controller Helm chart defines these values:


```yaml
# Rekey controller image name.
image: dellemc/csm-encryption-rekey-controller:v0.1.0

# Rekey controller image pull policy.
# Allowed values:
#  Always: Always pull the image.
#  IfNotPresent: Only pull the image if it does not already exist on the node.
#  Never: Never pull the image.
imagePullPolicy: IfNotPresent

# logLevel: Log level of the rekey controller.
# Allowed values: "error", "warning", "info", "debug", "trace".
logLevel: "info"

# This value is required and must match encryption.pluginName value
# of the corresponding Dell CSI driver.
provisioner:

# This value is required and must match encryption.apiPort value
# of the corresponding Dell CSI driver.
port:
```

| Parameter | Description | Required | Default |
| --------- |-------------|----------|--|
| image | Rekey controller image name. | No | dellemc/csm-encryption-rekey-controller:v0.1.0 |
| imagePullPolicy | Rekey controller image pull policy. | No | IfNotPresent |
| logLevel | Log level of the rekey controller. | No | info |
| provisioner | This value is required and must match `encryption.pluginName` value of the corresponding Dell CSI driver. | Yes |  |
| port | This value is required and must match `encryption.apiPort` value of the corresponding Dell CSI driver. | Yes |  |

## Deploy Rekey Controller

Copy the values.yaml to a local file. Once the CSM Encryption Rekey Controller local values.yaml file has been
adjusted for the current cluster, deploy the controller by installing the Helm chart. As an example:

``` helm install --values local-values.yaml rekey-controller dell/csm-encryption-rekey-controller```

A rekey-controller pod should now be up and running.


## Rekey Controller Usage

The general procedure for rekeying is to create a rekey custom resource via a simple yaml configuration. This 
will kick off a rekey process on the PV specified as the `volume`in the resource. 

### Rekey with dellctl

If dellctl CLI is installed, rekey'ing a volume is simple. First, identify a volume with a PV that is encrypted with the CSM Encryption driver
provisioner.

For example, let's rekey an encrypted PV with the name ``k8s-112a5d41bc``, and call our rekey object `myrekey`:

```shell
$ dellctl encryption rekey myrekey k8s-112a5d41bc
INFO rekey request "myrekey" submitted successfully for persistent volume "k8s-112a5d41bc".
INFO Run 'dellctl encryption rekey-status myrekey' for more details.
```

Then to check the status of the newly created rekey with the name `myrekey`:

```shell
$ dellctl encryption rekey-status myrekey
INFO Status of rekey request myrekey = completed
```

See [below](../rekey#status-of-the-rekey) for possible Status values and explanations.

### Rekey with manually created Rekey CRs

Identify a volume with a PV that is encrypted with the CSM Encryption driver provisioner.

Now create a Rekey Custom Resource to start the rekey of a volume. For example, there is a PV with a name
`k8s-09a76734f`. An associated example Rekey CR for this volume:
```yaml 
apiVersion: "encryption.storage.dell.com/v1alpha1"
kind: "Rekey"
metadata:
  name: "example-rekey"
spec:
  persistentVolumeName: "k8s-029a76734f"
```

Apply this CR yaml file to start the rekey process:

```shell 
kubectl create -f my-example-rekey.yaml
```

### Inspect Status of Rekey
Once the CR has been created, after some time, the status of the rekey can be
inspected through the `status.phase` field of the rekey custom resource.

```shell
$ echo $(kubectl get rekey example-rekey -o jsonpath='{.status.phase}')
completed
```

If `status.phase` has been set to `completed`, then the rekey was successful.


### Status of the Rekey
The `status.phase` field can have the following possible values:

| status.phase    | **Description** |
|-----------------|-----------------|
| **initialized** | The request has been received by rekey controller. 
| **started**     | The Rekey process preconditions are satisfied. 
| **unknown**     | Request was sent but no response was received, and it is possible that the rekey was successfull. 
| **failed**      | The Rekey process has failed, possibly due to no reachable CSM Encryption driver. 
| **rejected**    | Rekey was not done. The volume may have no associated PV, or may not be encrypted. 
| **completed**   | The Rekey successfully completed. 



## Remove old rekeys

To remove old rekeys, one can obtain the list and remove them just like any resource, using ```kubectl```.
