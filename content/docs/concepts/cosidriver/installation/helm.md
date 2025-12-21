---
title: "COSI Driver installation using Helm"
linkTitle: "Using Helm"
weight: 2
Description: Installation of COSI Driver using Helm
---

The COSI Driver for Dell ObjectScale can be deployed by using the provided Helm v3 charts on Kubernetes platform.

The Helm chart installs the following components in a _Deployment_ in the specified namespace:
- COSI Driver for ObjectScale

## Dependencies

Installing any of the CSI Driver components using Helm requires a few utilities to be installed on the system running the installation.

{{<table "table table-striped table-bordered table-sm">}}
| Dependency | Usage                                                                                                                |
|------------|----------------------------------------------------------------------------------------------------------------------|
| `kubectl`  | Kubectl is used to validate that the Kubernetes system meets the requirements of the driver.                         |
| `helm`     | Helm v3 is used as the deployment tool for Charts. Go [here](https://helm.sh/docs/intro/install/) to install Helm 3. |
{{</table>}}

> ℹ️ **NOTE:**
> To use these tools, a valid `KUBECONFIG` is required. Ensure that either a valid configuration is in the default location, or, that the `KUBECONFIG` environment variable points to a valid configuration before using these tools.

## Prerequisites

- Install Kubernetes cluster (see [supported versions](../../../cosidriver/#features-and-capabilities))

## Install the Driver

**Steps**
1. Run `git clone -b main https://github.com/dell/helm-charts.git` to clone the git repository.
2. Ensure that you have created the namespace where you want to install the driver. You can run `kubectl create namespace dell-cosi` to create a new one. The use of _dell-cosi_  as the namespace is just an example. You can choose any name for the namespace.
3. TODO: Create the Secret.
4. Copy the _charts/cosi/values.yaml_ into a new location with name _my-cosi-values.yaml_, to customize settings for installation.
5. Create new file called _my-cosi-configuration.yaml_, and copy the settings available in the [Configuration File](../configuration_file/) page.
6. Edit *my-cosi-values.yaml* to set the following parameters for your installation:
   The following table lists the primary configurable parameters of the COSI driver Helm chart and their default values. More detailed information can be found in the [`values.yaml`](https://github.com/dell/helm-charts/blob/master/charts/cosi/values.yaml) file in this repository.

{{<table "table table-striped table-bordered table-sm">}}
   | Parameter                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Required | Default                                                                        |
   |------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------:|--------------------------------------------------------------------------------|
   | images.provisioner.image | COSI driver provisioner container image.                                                                                                                                                                                                                                                                                                                                                                                                                     |   yes    | `"quay.io/dell/container-storage-modules/cosi:v1.0.0"`                                                        |
   | images.sidecar.image        | COSI driver sidecar container image.                                                                                                                                                                                                                                                                                                                                                                                                                            |   yes    | `"gcr.io/k8s-staging-sig-storage/objectstorage-sidecar:release-0.2"`                                                                     |
   | logLevel         | The logging level for the COSI driver provisioner.                                                                                                                                                                                                                                                                                                                                                                                                                      |   yes    | `info`                                                                         |
   | logFormat        | The logging format for the COSI driver provisioner.                                                                                                                                                                                                                                                                                                                                                                                                                     |   yes    | `"TEXT"`                                                                       |
   | imagePullPolicy | COSI driver provisioner container image pull policy. Maps 1-to-1 with [Kubernetes image pull policy](https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy).                                                                                                                                                                                                                                                                                         |   yes    | `"IfNotPresent"`                                                               |
{{</table>}}


7. Install the driver by running the following command (assuming that the current working directory is _charts_ and _my-cosi-settings.yaml_ is also present in _charts_ directory).

```bash
helm install dell-cosi ./cosi --namespace=dell-cosi --values ./my-cosi-values.yaml
```

## Bucket Classes, Bucket Access Classes

The COSI driver for Dell ObjectScale, `dell-csi-helm-installer` does not create any _Bucket Classes_ nor _Bucket Access Classes_ as part of the driver installation. A sample class manifests are available at `samples/bucketclass/objectscale.yaml` and `samples/bucketaccessclass/objectscale.yaml`. Use this sample manifest to create a _Bucket Classes_ to provision storage. Remember to uncomment/update the manifest as per the requirements.
