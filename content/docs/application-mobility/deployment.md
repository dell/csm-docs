---
title: "Deployment"
linkTitle: "Deployment"
weight: 1
Description: >
  Deployment for Dell Container Storage Modules (CSM) for Application Mobility
---

## Pre-requisites
- [Request a License for Application Mobility](../../license/)
- Object store bucket accessible by both the source and target clusters

## Installation
1. Create a namespace where Application Mobility will be installed.
    ```
    kubectl create ns application-mobility
    ```
1. Edit the license Secret file (see Pre-requisites above) and set the correct namespace (ex: `namespace: application-mobility`)
1. Create the Secret containing a license file
    ```
    kubectl apply -f license.yml
    ```
1. Add the Dell Helm Charts repository
    ```
    helm repo add dell https://dell.github.io/helm-charts
    ```
1. Either create a values.yml file or provide the `--set` options to the `helm install` to override default values from the [Configuration](#configuration) section.
1. Install the helm chart
    ```
    helm install -n application-mobility dell/csm-application-mobility
    ```


### Configuration

The following table lists the configurable parameters of the Application Mobility Helm chart and their default values.

| Parameter | Description | Default |
| - | - | - |
| `replicaCount` | Number of replicas for the Application Mobility controllers | `1` |
| `image.pullPolicy` | Image pull policy for the Application Mobility controller images | `IfNotPresent` |
| `controller.image` | Location of the csm-application-mobility Docker image | `dell/csm-application-mobility-controller:v0.1.0` |
| `cert-manager.enabled` |  If set to true, cert-manager will be installed during Application Mobility installation | `false` |
| `veleroNamespace` |  If Velero is already installed, set to the namespace where Velero is insatlled | `velero` |
| `licenseName` |  Name of the Secret that contains the License for CSM Application Mobility | `license` |
| `objectstore.secretName` |  If velero is already installed on the cluster, specify the name of the secret in velero namespace that has credentials to access object store | ` ` |
| `velero.enabled` |  If set to true, Velero will be installed during Application Mobility installation | `true` |
| `velero.use-volume-snapshots` |  If set to true, Velero will use volume snapshots | `false` |
| `velero.deployRestic` |  If set to true, Velero will also deploy Restic | `true` |
| `velero.cleanUpCRDs` |  If set to true, Velero CRDs will be cleaned up | `true` |
| `velero.credentials.existingSecret` |  Optionally, specify the name of the pre-created secret in the release namespace that holds the object store credentials. Either this or secretContents should be specified | ` ` |
| `velero.credentials.name` |  Optionally, specify the name to be used for secret that will be created to hold object store credentials. Used in conjunction with secretContents. | ` ` |
| `velero.credentials.secretContents` |  Optionally, specify the object store access credentials to be stored in a secret with key "cloud". Either this or existingSecret should be provided. | ` ` |
| `velero.configuration.provider` |  Provider to use for Velero. | `aws` |
| `velero.configuration.backupStorageLocation.name` |  Name of the backup storage location for Velero. | `default` |
| `velero.configuration.backupStorageLocation.bucket` |  Name of the object store bucket to use for backups. | `velero-bucket` |
| `velero.configuration.backupStorageLocation.config` |  Additional provider-specific configuration. See https://velero.io/docs/v1.9/api-types/backupstoragelocation/ for specific details. | ` ` |
| `velero.initContainers` |  List of plugins used by Velero. Dell Velero plugin is required and plugins for other providers can be added.  | ` ` |
| `velero.initContainers[0].name` |  Name of the Dell Velero plugin.  | `dell-custom-velero-plugin` |
| `velero.initContainers[0].image` |  Location of the Dell Velero plugin image.  | `dellemc/csm-application-mobility-velero-plugin:v0.1.0` |
| `velero.initContainers[0].volumeMounts[0].mountPath` |  Mount path of the volume mount.  | `/target` |
| `velero.initContainers[0].volumeMounts[0].name` |  Name of the volume mount.  | `okygubs` |