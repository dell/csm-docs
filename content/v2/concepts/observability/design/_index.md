---
title: Design
linktitle: Design
weight: 1
description: >
  Container Storage Modules for Observability Design
---

The solution takes the approach that each storage system that Container Storage Modules for Observability supports will have their own metrics deployments in the Kubernetes cluster.

- Metrics Deployment: Queries the Kubernetes API to gather information about storage resources and then queries the storage system's REST API to gather specific metrics. These metrics are then exported to the [OTEL collector](https://github.com/open-telemetry/opentelemetry-collector).
- Each supported storage system will have their own Deployment for metrics. They will each follow a similar pattern of querying the Kubernetes and StorageSystem APIs to gather information about storage resources (ex: volumes, storage pools, etc) and their metrics. Metrics will be exported directly to the OTEL collector.

A single topology deployment will query the Kubernetes API to gather mapping information between Persistent Volumes and storage resources located on multiple storage systems. This information is queried directly from Grafana and displayed in a custom dashboard.

## Required Components

The following prerequisites must be deployed into the namespace where Container Storage Modules for Observability is located to support the storage system metrics and topology deployments:

- Prometheus for scraping the metrics from the OTEL collector.
- Grafana for visualizing the metrics from Prometheus and Topology services using custom dashboards.
- Container Storage Modules for Observability will use secrets to get details about the storage systems used by the CSI drivers. These secrets should be copied from the namespaces where the drivers are deployed. 
  - CSI PowerFlex driver uses the 'vxflexos-config' secret. 
  - CSI PowerStore driver uses the 'powerstore-config' secret. 
  - CSI PowerScale driver uses the 'isilon-creds' secret.
  - CSI PowerMax driver uses the secrets in configmap 'powermax-reverseproxy-config'.

## Deployment Architectures

Container Storage Modules for Observability can be deployed to either direct storage system requests directly to the storage system or through the [Container Storage Modules for Authorization](../../authorization) proxy.  The CSI driver must be configured to route storage system requests through the Container Storage Modules for Authorization proxy in order for Container Storage Modules for Observability to do the same.

### Default Deployment of Container Storage Modules for Observability

![Default Deployment](../../../../images/observability/obs_architecture1.png)

### Deployment of Container Storage Modules for Observability with Container Storage Modules for Authorization

![Container Storage Modules for Observability with Container Storage Modules for Authorization](../../../../images/observability/obs_architecture2.png)
