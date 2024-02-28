---
title: "Rekey Configuration"
linkTitle: "Rekey Configuration"
weight: 4
Description: >
  Rekey Configuration and Usage
---

## Rekey Controller Installation

The CSM Encryption Rekey CRD Controller is an optional component that, if installed, allows encrypted volumes rekeying in a
Kubernetes cluster. The Rekey Controller can be installed via the Dell Helm charts [repository](https://github.com/dell/helm-charts).

Dell Helm charts can be added with the command `helm repo add dell https://dell.github.io/helm-charts`.

### Kubeconfig Secret

A secret with kubeconfig must be created with the name `cluster-kube-config`. Here is an example:  

```shell

 kubectl create secret generic cluster-kube-config --from-file=config=/root/.kube/config
```

### Helm Chart Values

The Rekey Controller Helm chart defines these values:

```yaml
# Rekey controller image name.
image: "dellemc/csm-encryption-rekey-controller:v0.2.0"

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
| --------- | ----------- | -------- | ------- |
| image | Rekey controller image name. | No | "dellemc/csm-encryption-rekey-controller:v0.2.0" |
| imagePullPolicy | Rekey controller image pull policy. | No | "IfNotPresent" |
| logLevel | Log level of the rekey controller. | No | "info" |
| provisioner | This value is required and must match `encryption.pluginName` value of the corresponding Dell CSI driver. | Yes | |
| port | This value is required and must match `encryption.apiPort` value of the corresponding Dell CSI driver. | Yes | |

### Deployment

Copy the chart's values.yaml to a local file and adjust the values in the local file for the current cluster.
Deploy the controller using a command similar to this:

```shell

helm install --values local-values.yaml rekey-controller dell/csm-encryption-rekey-controller
```

A rekey-controller pod should now be up and running.

## Rekey Usage

Rekeying is initiated and monitored via Kubernetes custom resources of type `rekeys.encryption.storage.dell.com`.
This can be done directly [using kubectl](#rekey-with-kubectl) or in a more user-friendly way [using dellctl](#rekey-with-dellctl).
Creation of a rekey resource for a PV will kick off a rekey process on this PV. The rekey resource will contain the result 
of the operation. Refer to [Rekey Status](#rekey-status) for possible status values.

### Rekey with dellctl

If `dellctl` CLI is installed, rekeying an encrypted volume is simple. 
For example, to rekey a PV with the name `k8s-112a5d41bc` use a command like this:

```shell

dellctl encryption rekey myrekey k8s-112a5d41bc
```
```
INFO rekey request "myrekey" submitted successfully for persistent volume "k8s-112a5d41bc".
INFO Run 'dellctl encryption rekey-status myrekey' for more details.
```

Then to check the status of the newly created rekey with the name `myrekey` use this command:

```shell
dellctl encryption rekey-status myrekey
```
```
INFO Status of rekey request myrekey = completed
```

### Rekey with kubectl

Create a cluster-scoped rekey resource to rekey an encrypted volume. 
For example, to rekey a PV with the name `k8s-09a76734f` use a command like this:

```shell
kubectl create -f - <<EOF
apiVersion: "encryption.storage.dell.com/v1alpha1"
kind: "Rekey"
metadata:
  name: "example-rekey"
spec:
  persistentVolumeName: "k8s-029a76734f"
EOF
```

Once the rekey resource has been created, after some time, the status of 
the rekey can be inspected through the `status.phase` field of the rekey resource.

```shell
echo $(kubectl get rekey example-rekey -o jsonpath='{.status.phase}')
```
```
completed
```

### Rekey Status

The `status.phase` field of a rekey resource can have these values:

| Value | Description |
| ----- | ----------- |
| initialized | The request has been received by the Rekey Controller. |
| started | The request is being processed by the Encryption driver. |
| completed | The request successfully completed and the volume is protected by a new key. |
| rejected | The rekey process has not started, a non-existent or not encrypted PV in the request is a common reason. |
| failed | The rekey process has failed, possibly due to unreachable Encryption driver or an error response from the driver. |
| unknown | The request was sent to the Encryption driver, but no response was received. It is still possible that the rekey succeeded and the volume key has changed. |

### Cleanup

Remove old rekey resources just like any other resource, using `kubectl delete`.
