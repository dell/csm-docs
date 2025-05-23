---
title: "Observability"
linkTitle: "Observability"
no_list: true 
weight: 5
Description: >
  Container Storage Modules (CSM) for Observability
---

 [Container Storage Modules](https://github.com/dell/csm) for Observability is part of the open-source suite of Kubernetes storage enablers for Dell products.

 It is an OpenTelemetry agent that collects array-level metrics for Dell storage so they can be exported into a Prometheus database. With Container Storage Modules for Observability, you will gain visibility not only on the capacity of the volumes/file shares you manage with Dell CSM CSI (Container Storage Interface) drivers but also their performance in terms of bandwidth, IOPS, and response time.

 Thanks to pre-packaged Grafana dashboards, you will be able to go through these metrics history and see the topology between a Kubernetes PV (Persistent Volume) and its translation as a LUN or file share in the backend array. This module also allows Kubernetes admins to collect array level metrics to check the overall capacity and performance directly from the Prometheus/Grafana tools rather than interfacing directly with the storage system itself.

Metrics data is collected and pushed to the [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector), so it can be processed, and exported in a format consumable by Prometheus. SSL certificates for TLS between nodes are handled by [cert-manager](https://github.com/jetstack/cert-manager).

Container Storage Modules for Observability is composed of several services, each residing in its own GitHub repository, that can be installed following one of the four deployments we support [here](../../getting-started/installation/kubernetes/powermax/helm/csm-modules/observability/). Contributions can be made to this repository or any of the Container Storage Modules for Observability repositories listed below.

{{<table "table table-striped table-bordered table-sm tdleft">}}
| Name | Repository | Description |
| ---- | ---------  | ----------- |
| Metrics for PowerFlex | [Container Storage Modules Metrics for PowerFlex](https://github.com/dell/karavi-metrics-powerflex) | Metrics for PowerFlex captures telemetry data about Kubernetes storage usage and performance obtained through the CSI (Container Storage Interface) Driver for PowerFlex. The metrics service pushes it to the OpenTelemetry Collector, so it can be processed, and exported in a format consumable by Prometheus. Prometheus can then be configured to scrape the OpenTelemetry Collector exporter endpoint to provide metrics, so they can be visualized in Grafana. Please visit the repository for more information. |
| Metrics for PowerStore | [Container Storage Modules Metrics for PowerStore](https://github.com/dell/csm-metrics-powerstore) | Metrics for PowerStore captures telemetry data about Kubernetes storage usage and performance obtained through the CSI (Container Storage Interface) Driver for PowerStore. The metrics service pushes it to the OpenTelemetry Collector, so it can be processed, and exported in a format consumable by Prometheus. Prometheus can then be configured to scrape the OpenTelemetry Collector exporter endpoint to provide metrics, so they can be visualized in Grafana. Please visit the repository for more information. |
| Metrics for PowerScale | [Container Storage Modules Metrics for PowerScale](https://github.com/dell/csm-metrics-powerscale) | Metrics for PowerScale captures telemetry data about Kubernetes storage usage and performance obtained through the CSI (Container Storage Interface) Driver for PowerScale. The metrics service pushes it to the OpenTelemetry Collector, so it can be processed, and exported in a format consumable by Prometheus. Prometheus can then be configured to scrape the OpenTelemetry Collector exporter endpoint to provide metrics, so they can be visualized in Grafana. Please visit the repository for more information. |
| Metrics for PowerMax | [Container Storage Modules Metrics for PowerMax](https://github.com/dell/csm-metrics-powermax) | Metrics for PowerMax captures telemetry data about Kubernetes storage usage and performance obtained through the CSI (Container Storage Interface) Driver for PowerMax. The metrics service pushes it to the OpenTelemetry Collector, so it can be processed, and exported in a format consumable by Prometheus. Prometheus can then be configured to scrape the OpenTelemetry Collector exporter endpoint to provide metrics, so they can be visualized in Grafana. Please visit the repository for more information. |
| Volume Topology | [Container Storage Modules Topology](https://github.com/dell/karavi-topology) | Topology provides Kubernetes administrators with the topology data related to containerized storage that is provisioned by a CSI (Container Storage Interface) Driver for Dell storage products. The Topology service is enabled by default as part of the Container Storage Modules for Observability Helm Chart [values file](https://github.com/dell/helm-charts/blob/main/charts/karavi-observability/values.yaml). Please visit the repository for more information. |
{{</table>}}

## Container Storage Modules for Observability Capabilities

Container Storage Modules for Observability provides the following capabilities:

{{<table "table table-striped table-bordered table-sm">}}
| Capability | PowerStore | PowerScale |PowerFlex |PowerMax| Unity XT |
| - | :-: | :-: | :-: | :-: | :-: |
| <div style="text-align: left">  Collect and expose Volume Metrics via the OpenTelemetry Collector | Yes | Yes | Yes | Yes | No |
| <div style="text-align: left">  Collect and expose File System Metrics via the OpenTelemetry Collector | Yes |  No | No | No | No |
| <div style="text-align: left">  Collect and expose export (k8s) node metrics via the OpenTelemetry Collector | Yes |  No | No | Yes | No |
| <div style="text-align: left">  Collect and expose block storage metrics via the OpenTelemetry Collector | Yes | No | Yes | Yes | No |
| <div style="text-align: left">  Collect and expose file storage metrics via the OpenTelemetry Collector | Yes | Yes | No | No | No |
| <div style="text-align: left">  Non-disruptive config changes | Yes |  Yes | Yes | Yes | No |
| <div style="text-align: left">  Non-disruptive log level changes | Yes |  Yes | Yes | Yes | No |
| <div style="text-align: left">  Grafana Dashboards for displaying metrics and topology data | Yes |  Yes | Yes | Yes | No |
{{</table>}}

## Topology Data

Container Storage Modules for Observability provides Kubernetes administrators with the topology data related to containerized storage. This topology data is visualized using Grafana:
{{<table "table table-striped table-bordered table-sm tdleft">}}
| Field                      | Description                                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Namespace                  | The namespace associated with the persistent volume claim                                                                                          |
| Persistent Volume Claim    | The name of the persistent volume claim associated with the persistent volume                                                                      |
| Persistent Volume          | The name of the persistent volume                                                                                                                  |
| Storage Class              | The storage class associated with the persistent volume                                                                                            |
| Provisioned Size           | The provisioned size of the persistent volume                                                                                                      |
| Status                     | The status of the persistent volume. "Released" indicates the persistent volume does not have a claim. </br> "Bound" indicates the persistent volume has a claim |
| Created                    | The date the persistent volume was created                                                                                                         |
| Storage System             | The storage system ID or IP address the volume is associated with                                                                                  |
| Protocol                   | The storage system protocol type the volume/storage class is associated with                                                                       |
| Storage Pool               | The storage pool name the volume/storage class is associated with                                                                                  |
| Storage System Volume Name | The name of the volume on the storage system that is associated with the persistent volume                                                         |
{{</table>}}

## TLS Encryption

Container Storage Modules for Observability deployment relies on [cert-manager](https://github.com/jetstack/cert-manager) to manage SSL certificates that are used to encrypt communication between various components. When [deploying Container Storage Modules for Observability](../../getting-started/installation/kubernetes/powermax/helm/csm-modules/observability/), cert-manager is installed and configured automatically.  The cert-manager components listed below will be installed alongside Container Storage Modules for Observability.

{{<table "table table-striped table-bordered table-sm tdleft">}}
| Component |
| --------- |
| <div style="text-align: left"> cert-manager |
| cert-manager-cainjector |
| cert-manager-webhook |
{{</table>}}

If desired you may provide your own certificate key pair to be used inside the cluster by providing the path to the certificate and key in the Helm chart config. If you do not provide a certificate, one will be generated for you on installation.
> __NOTE__: The certificate provided must be a CA certificate. This is to facilitate automated certificate rotation.

## Viewing Logs

Logs can be viewed by using the `kubectl logs` CLI command to output logs for a specific Pod or Deployment.

For example, the following script will capture logs of all Pods in the CSM namespace and save the output to one file per Pod.

```bash
#!/bin/bash

namespace=[CSM_NAMESPACE]
for pod in $(kubectl get pods -n $namespace -o name); do
  logFileName=$(echo $pod | tr / -).txt
  kubectl logs -n $namespace $pod --all-containers > $logFileName
done
```
