---
title: Uninstallation
linktitle: Uninstallation
weight: 2
description: >
  Uninstallation for Dell Container Storage Modules (CSM) for Application Mobility
---

This section outlines the uninstallation steps for Container Storage Modules (CSM) for Application Mobility.

## Uninstall the CSM for Application Mobility Helm Chart

This command removes all the Kubernetes components associated with the chart.

```
$ helm delete [APPLICATION_MOBILITY_NAME] --namespace [APPLICATION_MOBILITY_NAMESPACE]
```
