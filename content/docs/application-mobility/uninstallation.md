---
title: Uninstallation
linktitle: Uninstallation
weight: 2
description: >
  Dell Container Storage Modules (CSM) for Application Mobility Uninstallation
---

{{% pageinfo color="primary" %}}
Application Mobility is currently in tech-preview and is not supported in production environments
{{% /pageinfo %}}

This section outlines the uninstallation steps for Container Storage Modules (CSM) for Application Mobility.

## Uninstall the CSM for Application Mobility Helm Chart

The command below removes all the Kubernetes components associated with the chart.

```console
$ helm delete application-mobility --namespace [APPLICATION_MOBILITY_NAMESPACE]
```
