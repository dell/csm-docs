---
title: PowerScale Metrics
linktitle: PowerScale Metrics
weight: 1
description: >
  Dell Container Storage Modules (CSM) for Observability PowerScale Metrics
---

This section outlines the metrics collected by the Container Storage Modules (CSM) Observability module for PowerScale. The [Grafana reference dashboards](https://github.com/dell/karavi-observability/blob/main/grafana/dashboards/powerscale) for PowerScale metrics can be uploaded to your Grafana instance.

## I/O Performance Metrics

Storage system I/O performance metrics (IOPS, bandwidth) are available by default and broken down by cluster and quota.

To disable these metrics, set the ```performanceMetricsEnabled``` field to false in helm/values.yaml.

The following I/O performance metrics are available from the OpenTelemetry collector endpoint. Please see the [CSM for Observability](../../) for more information on deploying and configuring the OpenTelemetry collector.

| Metric                                                             | Description                                                                         |
|--------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| powerscale_cluster_cpu_use_rate                                    | Average CPU usage for all nodes in the monitored cluster                            |
| powerscale_cluster_disk_read_operation_rate                        | Average rate at which the disks in the cluster servicing data read change requests  |
| powerscale_cluster_disk_write_operation_rate                       | Average rate at which the disks in the cluster servicing data write change requests |
| powerscale_cluster_disk_throughput_read_rate_megabytes_per_second  | Throughput rate of data being read from the disks in the cluster                    |
| powerscale_cluster_disk_throughput_write_rate_megabytes_per_second | Throughput rate of data being written to the disks in the cluster                   |

## Storage Capacity Metrics

Provides visibility into the total, used, and available capacity for PowerScale cluster and quotas.

To disable these metrics, set the ```capacityMetricsEnabled``` field to false in helm/values.yaml.

The following storage capacity metrics are available from the OpenTelemetry collector endpoint. Please see the [CSM for Observability](../../) for more information on deploying and configuring the OpenTelemetry collector.

| Metric                                            | Description                                                      |
|---------------------------------------------------|------------------------------------------------------------------|
| powerscale_cluster_total_capacity_terabytes       | Total cluster capacity (TB)                                      |
| powerscale_cluster_remaining_capacity_terabytes   | Total unused cluster capacity (TB)                               |
| powerscale_cluster_used_capacity_percentage       | Percent of total cluster capacity that has been used             |
| powerscale_cluster_total_hard_quota_gigabytes     | Amount of total capacity allocated in all directory hard quotas  |
| powerscale_cluster_total_hard_quota_percentage    | Percent of total capacity allocated in all directory hard quotas |
| powerscale_volume_quota_subscribed_gigabytes      | Space used of Quota for a directory (GB)                         |
| powerscale_volume_hard_quota_remaining_gigabytes  | Unused spaced below the hard limit for a directory (GB)          |
| powerscale_volume_quota_subscribed_percentage     | Percentage of space used in hard limit for a directory           |
| powerscale_volume_hard_quota_remaining_percentage | Percentage of the remaining space in hard limit for a directory  |
