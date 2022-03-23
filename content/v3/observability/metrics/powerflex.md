---
title: PowerFlex Metrics
linktitle: PowerFlex Metrics
weight: 1
description: >
  Dell EMC Container Storage Modules (CSM) for Observability PowerFlex Metrics
---

This section outlines the metrics collected by the Container Storage Modules (CSM) Observability module for PowerFlex. The [Grafana reference dashboards](https://github.com/dell/karavi-observability/blob/main/grafana/dashboards/powerflex) for PowerFlex metrics can be uploaded to your Grafana instance.

## I/O Performance Metrics

Storage system I/O performance metrics (IOPS, bandwidth, latency) are available by default and broken down by export node and volume.

To disable these metrics, set the ```sdc_metrics_enabled``` field to false in helm/values.yaml.

The following I/O performance metrics are available from the OpenTelemetry collector endpoint. Please see the [CSM for Observability](../../) for more information on deploying and configuring the OpenTelemetry collector.

| Metric | Description |
| - | - |
| powerflex_export_node_read_bw_megabytes_per_second | The export node read bandwidth (MB/s) within PowerFlex system |
| powerflex_export_node_write_bw_megabytes_per_second | The export node write bandwidth (MB/s) |
| powerflex_export_node_read_latency_milliseconds | The time (in ms) to complete read operations within PowerFlex system by the export node |
| powerflex_export_node_write_latency_milliseconds | The time (in ms) to complete write operations within PowerFlex system by the export host |
| powerflex_export_node_read_iops_per_second | The number of read operations performed by an export node (per second) |
| powerflex_export_node_write_iops_per_second | The number of write operations performed by an export node (per second) |
| powerflex_volume_read_bw_megabytes_per_second | The volume read bandwidth (MB/s) |
| powerflex_volume_write_bw_megabytes_per_second | The volume write bandwidth (MB/s) |
| powerflex_volume_read_latency_milliseconds | The time (in ms) to complete read operations to a volume |
| powerflex_volume_write_latency_milliseconds | The time (in ms) to complete write operations to a volume |
| powerflex_volume_read_iops_per_second | The number of read operations performed against a volume (per second) |
| powerflex_volume_write_iops_per_second | The number of write operations performed against a volume (per second) |

## Storage Capacity Metrics

Provides visibility into the total, used, and available capacity for a storage class and associated underlying storage construct.

To disable these metrics, set the ```storage_class_pool_metrics_enabled``` field to false in helm/values.yaml.

The following storage capacity metrics are available from the OpenTelemetry collector endpoint. Please see the [CSM for Observability](../../) for more information on deploying and configuring the OpenTelemetry collector.

| Metric | Description |
| - | - |
| powerflex_storage_pool_total_logical_capacity_gigabytes | The logical capacity (size) of a storage pool (GB) |
| powerflex_storage_pool_logical_capacity_available_gigabytes | The capacity available for use (GB) |
| powerflex_storage_pool_logical_capacity_in_use_gigabytes | The logical capacity of a storage pool in use (GB) |
| powerflex_storage_pool_logical_provisioned_gigabytes | The total size of volumes (thick and thin) provisioned in a storage pool (GB) |
