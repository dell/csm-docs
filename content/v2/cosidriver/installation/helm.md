---
title: "COSI Driver installation using Helm"
linkTitle: "Using Helm"
weight: 2
Description: Installation of COSI Driver using Helm
---

The COSI Driver for Dell ObjectScale can be deployed by using the provided Helm v3 charts on Kubernetes platform.

The Helm chart installs the following components in a _Deployment_ in the specified namespace:
- COSI Driver for ObjectScale

> **Notational Conventions**
>
> The keywords "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in [RFC 2119](http://tools.ietf.org/html/rfc2119) (Bradner, S., "Key words for use in RFCs to Indicate Requirement Levels", BCP 14, RFC 2119, March 1997).

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

- Install Kubernetes (see [supported versions](../../../cosidriver/#features-and-capabilities))

## Install the Driver

**Steps**
1. Run `git clone -b main https://github.com/dell/helm-charts.git` to clone the git repository.
2. Ensure that you have created the namespace where you want to install the driver. You can run `kubectl create namespace dell-cosi` to create a new one. The use of _dell-cosi_  as the namespace is just an example. You can choose any name for the namespace.
3. Copy the _charts/cosi/values.yaml_ into a new location with name _my-cosi-values.yaml_, to customize settings for installation.
4. Create new file called _my-cosi-configuration.yaml_, and copy the settings available in the [Configuration File](../configuration_file) page.
5. Edit *my-cosi-values.yaml* to set the following parameters for your installation:
   The following table lists the primary configurable parameters of the COSI driver Helm chart and their default values. More detailed information can be found in the [`values.yaml`](https://github.com/dell/helm-charts/blob/master/charts/cosi/values.yaml) file in this repository.

{{<table "table table-striped table-bordered table-sm">}}
   | Parameter                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Required | Default                                                                        |
   |------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------:|--------------------------------------------------------------------------------|
   | provisioner.logLevel         | The logging level for the COSI driver provisioner.                                                                                                                                                                                                                                                                                                                                                                                                                      |   yes    | `4`                                                                            |
   | provisioner.logFormat        | The logging format for the COSI driver provisioner.                                                                                                                                                                                                                                                                                                                                                                                                                     |   yes    | `"text"`                                                                       |
   | provisioner.image.reposiotry | COSI driver provisioner container image repository.                                                                                                                                                                                                                                                                                                                                                                                                                     |   yes    | `"docker.io/dell/cosi"`                                                        |
   | provisioner.image.tag        | COSI driver provisioner container image tag.                                                                                                                                                                                                                                                                                                                                                                                                                            |   yes    | `"v0.1.0"`                                                                     |
   | provisioner.image.pullPolicy | COSI driver provisioner container image pull policy. Maps 1-to-1 with [Kubernetes image pull policy](https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy).                                                                                                                                                                                                                                                                                         |   yes    | `"IfNotPresent"`                                                               |
   | sidecar.verbosity            | The logging verbosity for the COSI driver sidecar, higher values are more verbose, possible values are integers from _-2,147,483,648_ to _2,147,483,647_. Generally the range used is between -4 and 12. However, there may be cases where numbers outside that range might provide more information. For additional information, refer to the [COSI sidecar documentation](https://github.com/kubernetes-sigs/container-object-storage-interface-provisioner-sidecar). |   yes    | `5`                                                                            |
   | sidecar.image.reposiotry     | COSI driver sidecar container image repository.                                                                                                                                                                                                                                                                                                                                                                                                                         |   yes    | `"gcr.io/k8s-staging-sig-storage/objectstorage-sidecar/objectstorage-sidecar"` |
   | sidecar.image.tag            | COSI driver sidecar container image tag.                                                                                                                                                                                                                                                                                                                                                                                                                                |   yes    | `"v20230130-v0.1.0-24-gc0cf995"`                                               |
   | sidecar.image.pullPolicy     | COSI driver sidecar container image pull policy. Maps 1-to-1 with [Kubernetes image pull policy](https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy).                                                                                                                                                                                                                                                                                             |   yes    | `"IfNotPresent"`                                                               |
   | configuration.create         | Specifies whether a secret with driver configuration should be created If set to false, you must set `configuration.secretName` field to an existing configuration secret name.                                                                                                                                                                                                                                                                                         |   yes    | `true`                                                                         |
   | configuration.secretName     | Name can be used to specify an existing secret name to use for the driver configuration or override the generated name.                                                                                                                                                                                                                                                                                                                                                 |    no    | `"cosi-config"`                                                                |
   | configuration.data           | Data should be provided when installing chart, it will be used to create the Secret with the driver configuration. `configuration.create` must be set to `true` for this to work.                                                                                                                                                                                                                                                                                       |    no    | `""`                                                                           |
{{</table>}}

> ℹ️ **NOTE:**
> - Whenever the *configuration.secretName* parameter changes in *my-cosi-values.yaml* user needs to reinstall the driver.
> - Whenever the *configuration.data* parameter changes in *my-cosi-values.yaml* user needs to reinstall the driver.

6. Install the driver by running the following command (assuming that the current working directory is _charts_ and _my-cosi-settings.yaml_ is also present in _charts_ directory).

```sh
helm install dell-cosi ./cosi --namespace=dell-cosi --values ./my-cosi-values.yaml --set-file configuration.data=./my-cosi-configuration.yaml
```

## Bucket Classes, Bucket Access Classes

The COSI driver for Dell ObjectScale version 1.2, `dell-csi-helm-installer` does not create any _Bucket Classes_ nor _Bucket Access Classes_ as part of the driver installation. A sample class manifests are available at `samples/bucketclass/objectscale.yaml` and `samples/bucketaccessclass/objectscale.yaml`. Use this sample manifest to create a _Bucket Classes_ to provision storage. Remember to uncomment/update the manifest as per the requirements.
