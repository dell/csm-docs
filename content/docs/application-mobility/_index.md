---
title: "Application Mobility"
linkTitle: "Application Mobility"
weight: 9
Description: >
  Application Mobility for Dell Container Storage Modules (CSM)
---

{{% pageinfo color="primary" %}}
Application Mobility is currently in tech-preview and is not supported in production environments
{{% /pageinfo %}}

# Overview
TODO: List of features

# Pre-requisites
- Request a License for Application Mobility: https://app.smartsheet.com/b/form/5e46fad643874d56b1f9cf4c9f3071fb

# Installation
1. Create a namespace where Application Mobility will be installed.
```
kubectl create ns application-mobility
```
1. Create the Secret containing a license file (see Pre-requisites above)
```
kubectl apply -f license.yml
```
1. Add the Dell Helm Charts repo helm repo add dell https://dell.github.io/helm-charts
```
helm repo add dell https://dell.github.io/helm-charts
```

## Configuration

The following table lists the configurable parameters of the Application Mobility Helm chart and their default values.

| Parameter | Description | Default |
| - | - | - |
| `replicaCount` | Number of replicas for the Application Mobility controllers | `1` |
| `image.pullPolicy` | Image pull policy for the Application Mobility controller images | `IfNotPresent` |
| `controller.image` | Location of the csm-application-mobility Docker image | `dell/csm-application-mobility:v0.1.0` |
| `cert-manager.enabled` |  If set to true, cert-manager will be installed during Application Mobility installation | `false` |
| `veleroNamespace` |  If Velero is already installed, set to the namespace where Velero is insatlled | `velero` |
| `licenseName` |  Name of the Secret that contains the License for CSM Application Mobility | `license` |
| `objectstore.secretName` |  If velero is already installed on the cluster, specify the name of the secret in velero namespace that has credentials to access object store | `` |

| `velero.enabled` |  If set to true, Velero will be installed during Application Mobility installation | `true` |
| `velero.use-volume-snapshots` |  If set to true, Velero will use volume snapshots | `false` |
| `velero.deployRestic` |  If set to true, Velero will also deploy Restic | `true` |
| `velero.cleanUpCRDs` |  If set to true, Velero CRDs will be cleaned up | `true` |

| `velero.credentials.existingSecret` |  Optionally, specify the name of the pre-created secret in the release namespace that holds the object store credentials. Either this or secretContents should be specified | `` |
| `velero.credentials.name` |  Optionally, specify the name to be used for secret that will be created to hold object store credentials. Used in conjunction with secretContents. | `` |
| `velero.credentials.secretContents` |  Optionally, specify the object store access credentials to be stored in a secret with key "cloud". Either this or existingSecret should be provided. | `` |


| `velero.configuration.provider` |  Provider to use for Velero. | `aws` |
| `velero.configuration.backupStorageLocation.name` |  Name of the backup storage location for Velero. | `default` |
| `velero.configuration.backupStorageLocation.bucket` |  Name of the object store bucket to use for backups. | `velero-bucket` |
| `velero.configuration.backupStorageLocation.config.region` |  The region for the object store. | `s3` |



# Using dellctl

