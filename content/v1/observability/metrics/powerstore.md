---
title: PowerStore Metrics
linktitle: PowerStore Metrics
weight: 1
description: >
  Dell EMC Container Storage Modules (CSM) for Observability PowerStore Metrics
---

This section outlines the metrics collected by the Container Storage Modules (CSM) Observability module for PowerStore. The [Grafana reference dashboards](https://github.com/dell/karavi-observability/blob/main/grafana/dashboards/powerstore) for PowerStore metrics can be uploaded to your Grafana instance.

## I/O Performance Metrics

Storage system I/O performance metrics (IOPS, bandwidth, latency) are available by default and broken down by export node and volume.

To disable these metrics, set the ```karaviMetricsPowerstore.volumeMetricsEnabled``` field to false in helm/values.yaml.

The following I/O performance metrics are available from the OpenTelemetry collector endpoint. Please see the [CSM for Observability](../../) for more information on deploying and configuring the OpenTelemetry collector.

| Metric | Description |
| - | - |
| powerstore_volume_read_bw_megabytes_per_second	| The volume read bandwidth (MB/s) |
| powerstore_volume_write_bw_megabytes_per_second | The volume write bandwidth (MB/s) |
| powerstore_volume_read_latency_milliseconds | The time (in ms) to complete read operations to a volume |
| powerstore_volume_write_latency_milliseconds | The time (in ms) to complete write operations to a volume |
| powerstore_volume_read_iops_per_second | The number of read operations performed against a volume (per second) |
| powerstore_volume_write_iops_per_second | The number of write operations performed against a volume (per second) |
| powerstore_filesystem_read_bw_megabytes_per_second | The filesystem read bandwidth MB/s |
| powerstore_filesystem_write_bw_megabytes_per_second | The filesystem write bandwidth (MB/s) |
| powerstore_filesystem_read_iops_per_second |  The number of read operations performed against a filesystem (per second) |
| powerstore_filesystem_write_iops_per_second | The number of write operations performed against a filesystem (per second) |
| powerstore_filesystem_read_latency_milliseconds | The time (in ms) to complete read operations to a filesystem |
| powerstore_filesystem_write_latency_milliseconds | The time (in ms) to complete write operations to a filesystem |

## Storage Capacity Metrics

Provides visibility into the total, used, and available capacity for a storage class and associated underlying storage construct.

To disable these metrics, set the ```enable_powerstore_metrics``` field to false in helm/values.yaml.

The following storage capacity metrics are available from the OpenTelemetry collector endpoint. Please see the [CSM for Observability](../../) for more information on deploying and configuring the OpenTelemetry collector.

| Metric | Description |
| - | - |
| powerstore_array_logical_provisioned_megabytes | Total provisioned logical storage on a given array managed by CSI driver |
| powerstore_array_logical_used_megabytes | Total used logical storage on a given array |
| powerstore_storage_class_logical_provisioned_megabytes | Total provisioned logical storage for a given storage class |
| powerstore_storage_class_logical_used_megabytes | Total used logical storage for a given storage class |
| powerstore_volume_logical_provisioned_megabytes | Logical provisioned storage for a volume |
| powerstore_volume_logical_used_megabytes | Logical used storage for a volume |
| powerstore_filesystem_logical_provisioned_megabytes | Logical provisioned storage for a filesystem |
| powerstore_filesystem_logical_used_megabytes | Logical used storage for a filesystem |