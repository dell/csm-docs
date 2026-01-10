---
title: "COSI Driver installation using Helm"
linkTitle: "Helm"
weight: 2
Description: Installation of COSI Driver using Helm
---

1. Set up a Kubernetes cluster following the official documentation.
2. Proceed to the [Prerequisites](../prerequisite/_index.md).
3. Complete the driver installation.

### Install Helm 3.x

Install Helm 3.x on the master node before you install the CSI Driver for Dell PowerFlex.

**Steps**

  Run the command to install Helm 3.x.

  ```bash
  curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
 ```

{{< accordion id="Three" title="Driver Install" markdown="true" >}}
### Install the Driver

**Steps**
1. Run `git clone -b main https://github.com/dell/helm-charts.git` to clone the git repository.
2. Ensure that you have created the namespace where you want to install the driver. <br>You can run `kubectl create namespace dell-cosi` to create a new one.<br>The use of _dell-cosi_ as the namespace is just an example. You can choose any name for the namespace.
3. Create a new file called `secret.yaml` with the contents of the [configuration file](../configuration#configuration-file-example).<br>Edit the file with parameters specific to the ObjectScale instance.
```yaml
cat <<EOF > secret.yaml
connections:
  - objectscale:
      id: objectscale
      credentials:
        username: namespaceadmin
        password: namespaceadminpassword
      namespace: ns1
      mgmt-endpoint: https://mgmt-endpoint-address:4443
      emptyBucket: true
      protocols:
        s3:
          endpoint: https://s3-endpoint-address:9021
      tls:
        insecure: true
EOF
```
4. Create a secret by running
```bash
kubectl create secret generic dell-cosi-config -n dell-cosi --from-file=config.yaml=secret.yaml
```
5. Copy the _charts/cosi/values.yaml_ into a new location with name _my-cosi-values.yaml_, to customize settings for installation.
6. Edit *my-cosi-values.yaml* to set the following parameters for your installation.<br>
   The following table lists the primary configurable parameters of the COSI driver Helm chart and their default values.<br>More detailed information can be found in the [`values.yaml`](https://github.com/dell/helm-charts/blob/master/charts/cosi/values.yaml) file in this repository.
<ul>
{{< collapse id="1" title="Parameters">}}
| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
|<div style="text-align: left"> images.provisioner.image |<div style="text-align: left"> COSI driver provisioner container image. | Yes | "quay.io/dell/container-storage-modules/cosi:v1.0.0" |
|<div style="text-align: left"> images.sidecar.image |<div style="text-align: left"> COSI driver sidecar container image.| Yes | "gcr.io/k8s-staging-sig-storage/objectstorage-sidecar:release-0.2" |
|<div style="text-align: left"> logLevel |<div style="text-align: left"> The logging level for the COSI driver provisioner.| Yes | "info" |
|<div style="text-align: left"> logFormat |<div style="text-align: left"> The logging format for the COSI driver provisioner.| Yes | "TEXT" |
|<div style="text-align: left"> imagePullPolicy |<div style="text-align: left"> COSI driver provisioner container image pull policy. Maps 1-to-1 with [Kubernetes image pull policy](https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy).| Yes | "IfNotPresent" |
{{< /collapse >}}
</ul>
7. Install the driver by running the following command (assuming that the current working directory is _charts_ and _my-cosi-settings.yaml_ is also present in _charts_ directory).

```bash
helm install dell-cosi ./cosi --namespace=dell-cosi --values ./my-cosi-values.yaml
```
{{< /accordion>}}
