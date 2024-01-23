---
title: "Deployment of application mobility via helm"
linkTitle: "Deployment of application mobility via helm"
weight: 1
Description: >
  Deployment
---

## Pre-requisites
- [Request a License for Application Mobility](../../license/)
- Object store bucket accessible by both the source and target clusters

## Installation
Repeat the following steps on both clusters:

1. Create a namespace where Application Mobility will be installed.
    ```bash
    kubectl create ns application-mobility
    ```
2. Edit the license Secret file (see Pre-requisites above) and set the correct namespace (ex: `namespace: application-mobility`)
3. Create the Secret containing a license file
    ```bash
    kubectl apply -f license.yml
    ```
4. Add the Dell Helm Charts repository
    ```bash
    helm repo add dell https://dell.github.io/helm-charts
    ```
5. Either create a values.yml file or provide the `--set` options to the `helm install` to override default values from the [Configuration](#configuration) section.
6. Install the helm chart
    ```bash
    
    helm install application-mobility -n application-mobility dell/csm-application-mobility
    ```


### Configuration

This table lists the configurable parameters of the Application Mobility Helm chart and their default values.

| Parameter | Description | Required | Default |
| - | - | - | - |
| `replicaCount` | Number of replicas for the Application Mobility controllers | Yes | `1` |
| `image.pullPolicy` | Image pull policy for the Application Mobility controller images | Yes | `IfNotPresent` |
| `controller.image` | Location of the Application Mobility Docker image | Yes | `dellemc/csm-application-mobility-controller:v0.3.0` |
| `cert-manager.enabled` |  If set to true, cert-manager will be installed during Application Mobility installation | Yes | `false` |
| `veleroNamespace` |  If Velero is already installed, set to the namespace where Velero is installed | No | `velero` |
| `licenseName` |  Name of the Secret that contains the License for Application Mobility | Yes | `license` |
| `objectstore.secretName` |  If velero is already installed on the cluster, specify the name of the secret in velero namespace that has credentials to access object store | No | ` ` |
| `velero.enabled` |  If set to true, Velero will be installed during Application Mobility installation | Yes | `true` |
| `velero.use-volume-snapshots` |  If set to true, Velero will use volume snapshots | Yes | `false` |
| `velero.deployRestic` |  If set to true, Velero will also deploy Restic | Yes | `true` |
| `velero.cleanUpCRDs` |  If set to true, Velero CRDs will be cleaned up | Yes | `true` |
| `velero.credentials.existingSecret` |  Optionally, specify the name of the pre-created secret in the release namespace that holds the object store credentials. Either this or secretContents should be specified | No | ` ` |
| `velero.credentials.name` |  Optionally, specify the name to be used for secret that will be created to hold object store credentials. Used in conjunction with secretContents. | No | ` ` |
| `velero.credentials.secretContents` |  Optionally, specify the object store access credentials to be stored in a secret with key "cloud". Either this or existingSecret should be provided. | No | ` ` |
| `velero.configuration.provider` |  Provider to use for Velero. | Yes | `aws` |
| `velero.configuration.backupStorageLocation.name` |  Name of the backup storage location for Velero. | Yes | `default` |
| `velero.configuration.backupStorageLocation.bucket` |  Name of the object store bucket to use for backups. | Yes | `velero-bucket` |
| `velero.configuration.backupStorageLocation.config` |  Additional provider-specific configuration. See https://velero.io/docs/v1.9/api-types/backupstoragelocation/ for specific details. | Yes | ` ` |
| `velero.initContainers` |  List of plugins used by Velero. Dell Velero plugin is required and plugins for other providers can be added.  | Yes | ` ` |
| `velero.initContainers[0].name` |  Name of the Dell Velero plugin.  | Yes | `dell-custom-velero-plugin` |
| `velero.initContainers[0].image` |  Location of the Dell Velero plugin image.  | Yes | `dellemc/csm-application-mobility-velero-plugin:v0.3.0` |
| `velero.initContainers[0].volumeMounts[0].mountPath` |  Mount path of the volume mount.  | Yes | `/target` |
| `velero.initContainers[0].volumeMounts[0].name` |  Name of the volume mount.  | Yes | `plugins` |
| `velero.restic.privileged` | If set to true, Restic Pods will be run in privileged mode. Note: Set to true when using Red Hat OpenShift | No | `false` | 
