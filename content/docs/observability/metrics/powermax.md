---
title: PowerMax Metrics
linktitle: PowerMax Metrics
weight: 1
description: >
  Dell Container Storage Modules (CSM) for Observability PowerMax Metrics
---

This section outlines the metrics collected by the Container Storage Modules (CSM) Observability module for PowerMax. The [Grafana reference dashboards](https://github.com/dell/karavi-observability/blob/main/grafana/dashboards/powermax) for PowerMax metrics can be uploaded to your Grafana instance.

## Prerequisites
-  Unisphere user credentials must have PERF_MONITOR permissions.
-  Ensure time synchronization for Kubernetes cluster and PowerMax Unisphere by using Network Time Protocol (NTP).

## I/O Performance Metrics

Storage system I/O performance metrics (IOPS, bandwidth, latency) are available by default and broken down by storage group and volume.

To disable these metrics, set the ```performanceMetricsEnabled``` field under ```karaviMetricsPowermax``` to false in helm/values.yaml.

The following I/O performance metrics are available from the OpenTelemetry collector endpoint. Please see the [CSM for Observability](../../) for more information on deploying and configuring the OpenTelemetry collector.

| Metric                                                      | Description                                                                                             |
|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| powermax_storage_group_read_bw_megabytes_per_second         | The storage group read bandwidth (MB/s)                                                                 |
| powermax_storage_group_write_bw_megabytes_per_second        | The storage group write bandwidth (MB/s)                                                                |
| powermax_storage_group_read_latency_milliseconds            | The time (in ms) to complete read operations within PowerMax system by the storage group                |
| powermax_storage_group_write_latency_milliseconds           | The time (in ms) to complete write operations within PowerMax system by the storage group               |
| powermax_storage_group_read_iops_per_second                 | The number of read operations performed by a storage group (per second)                                 |
| powermax_storage_group_write_iops_per_second                | The number of write operations performed by a storage group (per second)                                |
| powermax_storage_group_average_io_size_megabytes_per_second | The storage group average IO sizes (MB/s)                                                               |
| powermax_volume_read_bw_megabytes_per_second                | The volume read bandwidth (MB/s)                                                                        |
| powermax_volume_write_bw_megabytes_per_second               | The volume write bandwidth (MB/s)                                                                       |
| powermax_volume_read_latency_milliseconds                   | The time (in ms) to complete read operations to a volume                                                |
| powermax_volume_write_latency_milliseconds                  | The time (in ms) to complete write operations to a volume                                               |
| powermax_volume_read_iops_per_second                        | The number of read operations performed against a volume (per second)                                   |
| powermax_volume_write_iops_per_second                       | The number of write operations performed against a volume (per second)                                  |

## Storage Capacity Metrics

Provides visibility into the total, used, and available capacity for a storage class and associated underlying storage construct.

To disable these metrics, set the ```capacityMetricsEnabled``` field under ```karaviMetricsPowermax``` to false in helm/values.yaml.

The following storage capacity metrics are available from the OpenTelemetry collector endpoint. Please see the [CSM for Observability](../../) for more information on deploying and configuring the OpenTelemetry collector.

| Metric                                          | Description                                                             |
|-------------------------------------------------|-------------------------------------------------------------------------|
| powermax_storage_class_total_capacity_gigabytes | Total capacity for a given storage class (GB)                           |
| powermax_storage_class_used_capacity_gigabytes  | Total used capacity for a given storage class (GB)                      |
| powermax_storage_class_used_capacity_percentage | Used capacity of a storage class in percent                             |
| powermax_array_total_capacity_gigabytes         | Total capacity on a given array managed by CSI driver (GB)              |
| powermax_array_used_capacity_gigabytes          | Total used capacity on a given array managed by CSI driver (GB)         |
| powermax_array_used_capacity_percentage         | Total used capacity on a given array managed by CSI driver in percent   |
| powermax_storage_group_total_capacity_gigabytes | Total capacity for a given storage group (GB)                           |
| powermax_storage_group_used_capacity_gigabytes  | Total used capacity for a given storage group  (GB)                     |
| powermax_storage_group_used_capacity_percentage | Used capacity of a storage group in percent                             |
| powermax_srp_total_capacity_gigabytes           | Total capacity of the storage resource pool in GB managed by CSI driver |
| powermax_srp_used_capacity_gigabytes            | Used capacity of a storage resource pool in GB managed by CSI driver    |
| powermax_srp_used_capacity_percentage           | Used capacity of a storage resource pool in percent                     |
| powermax_volume_total_capacity_gigabytes        | Total capacity of the volume in GB                                      |
| powermax_volume_used_capacity_gigabytes         | Used capacity of a volume in GB                                         |
| powermax_volume_used_capacity_percentage        | Used capacity of a volume in percent                                    |
