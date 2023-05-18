---
title: "Observability"
linkTitle: "Observability"
weight: 5
Description: >
  Dell Container Storage Modules (CSM) for Observability
---

 [Container Storage Modules](https://github.com/dell/csm) (CSM) for Observability is part of the open-source suite of Kubernetes storage enablers for Dell products.
 
 It is an OpenTelemetry agent that collects array-level metrics for Dell storage so they can be scraped into a Prometheus database. With CSM for Observability, you will gain visibility not only on the capacity of the volumes/file shares you manage with Dell CSM CSI (Container Storage Interface) drivers but also their performance in terms of bandwidth, IOPS, and response time. 
 
 Thanks to pre-packaged Grafana dashboards, you will be able to go through these metrics history and see the topology between a Kubernetes PV (Persistent Volume) and its translation as a LUN or file share in the backend array. This module also allows Kubernetes admins to collect array level metrics to check the overall capacity and performance directly from the Prometheus/Grafana tools rather than interfacing directly with the storage system itself.

Metrics data is collected and pushed to the [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector), so it can be processed, and exported in a format consumable by Prometheus. SSL certificates for TLS between nodes are handled by [cert-manager](https://github.com/jetstack/cert-manager).

CSM for Observability is composed of several services, each living in its own GitHub repository, that can be installed following one of the four deployments we support [here](deployment). Contributions can be made to this repository or any of the CSM for Observability repositories listed below. 

{{<table "table table-striped table-bordered table-sm">}}
| Name | Repository | Description |
| ---- | ---------  | ----------- |
| Metrics for PowerFlex | [CSM Metrics for PowerFlex](https://github.com/dell/karavi-metrics-powerflex) | Metrics for PowerFlex captures telemetry data about Kubernetes storage usage and performance obtained through the CSI (Container Storage Interface) Driver for Dell PowerFlex. The metrics service pushes it to the OpenTelemetry Collector, so it can be processed, and exported in a format consumable by Prometheus. Prometheus can then be configured to scrape the OpenTelemetry Collector exporter endpoint to provide metrics, so they can be visualized in Grafana. Please visit the repository for more information. |
| Metrics for PowerStore | [CSM Metrics for PowerStore](https://github.com/dell/csm-metrics-powerstore) | Metrics for PowerStore captures telemetry data about Kubernetes storage usage and performance obtained through the CSI (Container Storage Interface) Driver for Dell PowerStore. The metrics service pushes it to the OpenTelemetry Collector, so it can be processed, and exported in a format consumable by Prometheus. Prometheus can then be configured to scrape the OpenTelemetry Collector exporter endpoint to provide metrics, so they can be visualized in Grafana. Please visit the repository for more information. |
| Metrics for PowerScale | [CSM Metrics for PowerScale](https://github.com/dell/csm-metrics-powerscale) | Metrics for PowerScale captures telemetry data about Kubernetes storage usage and performance obtained through the CSI (Container Storage Interface) Driver for Dell PowerScale. The metrics service pushes it to the OpenTelemetry Collector, so it can be processed, and exported in a format consumable by Prometheus. Prometheus can then be configured to scrape the OpenTelemetry Collector exporter endpoint to provide metrics, so they can be visualized in Grafana. Please visit the repository for more information. |
| Metrics for PowerMax | [CSM Metrics for PowerMax](https://github.com/dell/csm-metrics-powermax) | Metrics for PowerMax captures telemetry data about Kubernetes storage usage and performance obtained through the CSI (Container Storage Interface) Driver for Dell PowerMax. The metrics service pushes it to the OpenTelemetry Collector, so it can be processed, and exported in a format consumable by Prometheus. Prometheus can then be configured to scrape the OpenTelemetry Collector exporter endpoint to provide metrics, so they can be visualized in Grafana. Please visit the repository for more information. |
| Volume Topology | [CSM Topology](https://github.com/dell/karavi-topology) | Topology provides Kubernetes administrators with the topology data related to containerized storage that is provisioned by a CSI (Container Storage Interface) Driver for Dell storage products. The Topology service is enabled by default as part of the CSM for Observability Helm Chart [values file](https://github.com/dell/helm-charts/blob/main/charts/karavi-observability/values.yaml). Please visit the repository for more information. |
{{</table>}}

## CSM for Observability Capabilities

CSM for Observability provides the following capabilities:

{{<table "table table-striped table-bordered table-sm">}}
| Capability | PowerMax | PowerFlex | Unity XT | PowerScale | PowerStore |
| - | :-: | :-: | :-: | :-: | :-: |
| Collect and expose Volume Metrics via the OpenTelemetry Collector | yes | yes | no | yes | yes |
| Collect and expose File System Metrics via the OpenTelemetry Collector | no |  no | no | no | yes |
| Collect and expose export (k8s) node metrics via the OpenTelemetry Collector | no |  yes | no | no | no |
| Collect and expose block storage metrics via the OpenTelemetry Collector | yes | yes | no | no | yes |
| Collect and expose file storage metrics via the OpenTelemetry Collector | no | no | no | yes | yes |
| Non-disruptive config changes | yes |  yes | no | yes | yes |
| Non-disruptive log level changes | yes |  yes | no | yes | yes |
| Grafana Dashboards for displaying metrics and topology data | yes |  yes | no | yes | yes |
{{</table>}}

## Supported Operating Systems/Container Orchestrator Platforms

{{<table "table table-striped table-bordered table-sm">}}
| COP/OS | Supported Versions |
|-|-|
| Kubernetes    | 1.22, 1.23, 1.24, 1.25, 1.26 |
| Red Hat OpenShift | 4.9, 4.10, 4.11 |
| Rancher Kubernetes Engine | yes | 
| RHEL          |     7.x, 8.x      |
| CentOS        |     7.8, 7.9     |
{{</table>}}

## Supported Storage Platforms

{{<table "table table-striped table-bordered table-sm">}}
|               | PowerFlex | PowerStore | PowerScale | PowerMax |
|---------------|:-------------------:|:----------------:|:----------------:|:----------------:|
| Storage Array | 3.5.x, 3.6.x, 4.0 | 1.0.x, 2.0.x, 2.1.x, 3.0, 3.2 | OneFS 8.1, 8.2, 9.0, 9.1, 9.2, 9.3, 9.4, 9.5 | PowerMax 2000/8000 <br> PowerMax 2500/8500 <br> 5978.479.479, 5978.711.711, 6079.xxx.xxx<br>Unisphere 10.0 |
{{</table>}}

## Supported CSI Drivers

CSM for Observability supports the following CSI drivers and versions.
{{<table "table table-striped table-bordered table-sm">}}
| Storage Array | CSI Driver | Supported Versions |
| ------------- | ---------- | ------------------ |
| CSI Driver for Dell PowerFlex | [csi-powerflex](https://github.com/dell/csi-powerflex) | v2.0 + |
| CSI Driver for Dell PowerStore | [csi-powerstore](https://github.com/dell/csi-powerstore) | v2.0 + |
| CSI Driver for Dell PowerScale | [csi-powerscale](https://github.com/dell/csi-powerscale) | v2.0 + |
| CSI Driver for Dell PowerMax | [csi-powermax](https://github.com/dell/csi-powermax) | v2.5 + |
{{</table>}}

## Topology Data

CSM for Observability provides Kubernetes administrators with the topology data related to containerized storage. This topology data is visualized using Grafana:
{{<table "table table-striped table-bordered table-sm">}}
| Field                      | Description                                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Namespace                  | The namespace associated with the persistent volume claim                                                                                          |
| Persistent Volume Claim    | The name of the persistent volume claim associated with the persistent volume                                                                      |
| Persistent Volume          | The name of the persistent volume                                                                                                                  |
| Storage Class              | The storage class associated with the persistent volume                                                                                            |
| Provisioned Size           | The provisioned size of the persistent volume                                                                                                      |
| Status                     | The status of the persistent volume. "Released" indicates the persistent volume does not have a claim. "Bound" indicates the persistent volume has a claim |
| Created                    | The date the persistent volume was created                                                                                                         |
| Storage System             | The storage system ID or IP address the volume is associated with                                                                                  |
| Protocol                   | The storage system protocol type the volume/storage class is associated with                                                                       |
| Storage Pool               | The storage pool name the volume/storage class is associated with                                                                                  |
| Storage System Volume Name | The name of the volume on the storage system that is associated with the persistent volume                                                         |
{{</table>}}
## TLS Encryption

CSM for Observability deployment relies on [cert-manager](https://github.com/jetstack/cert-manager) to manage SSL certificates that are used to encrypt communication between various components. When [deploying CSM for Observability](./deployment), cert-manager is installed and configured automatically.  The cert-manager components listed below will be installed alongside CSM for Observability.

{{<table "table table-striped table-bordered table-sm">}}
| Component |
| --------- |
| cert-manager |
| cert-manager-cainjector |
| cert-manager-webhook |
{{</table>}}

If desired you may provide your own certificate key pair to be used inside the cluster by providing the path to the certificate and key in the Helm chart config. If you do not provide a certificate, one will be generated for you on installation.
> __NOTE__: The certificate provided must be a CA certificate. This is to facilitate automated certificate rotation.

## Viewing Logs

Logs can be viewed by using the `kubectl logs` CLI command to output logs for a specific Pod or Deployment.

For example, the following script will capture logs of all Pods in the CSM namespace and save the output to one file per Pod.

```
#!/bin/bash

namespace=[CSM_NAMESPACE]
for pod in $(kubectl get pods -n $namespace -o name); do
  logFileName=$(echo $pod | tr / -).txt
  kubectl logs -n $namespace $pod --all-containers > $logFileName
done
```
