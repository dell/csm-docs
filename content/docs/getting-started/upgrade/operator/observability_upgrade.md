---
title: Observability
linktitle: Observability
description: >
toc_hide: true 

  
---

## Upgrade Observability

The Observability module installed by the Dell CSM Operator can be updated like any Kubernetes resource.

- Modifying the existing driver and module installation directly via `kubectl edit`

  ```bash
  kubectl get <driver-object> -n <driver-namespace>
  ```

  For example - If the CSI PowerScale driver is installed then run this command to get the object name

  ```bash
  # Replace driver-namespace with the namespace where the CSI PowerScale driver is installed
  $ kubectl get csm -n <driver-namespace>
  ```

  use the object name in `kubectl edit` command.

  ```bash
  kubectl edit csm <driver-object>/<object-name> -n <driver-namespace>
  ```

  For example - If the object name is isilon then use the name as isilon

  ```bash
  # Replace object-name with the isilon
  kubectl edit csm isilon -n <driver-namespace>
  ```

- Modify the installation

  - Update the driver config version and image tag
  - Update the Observability config version and the driver metrics images(e.g. for CSI PowerScale driver, the metrics driver image would be `csm-metrics-powerscale`)
  - Follow the additional steps to upgrade to Observability module v1.13.0:
      - Remove the karavi-topology component:

          The collection of topology data is now handled by the driver metrics. Therefore, the karavi-topology component is no longer required and should be removed.

      - Configure Environment Variables:

          To enable and customize the collection of topology data, add the following environment variables to your custom resource. Or apply the [latest custom resource](https://github.com/dell/csm-operator/blob/main/samples/v2.15.0/). By default, `POWERSCALE_TOPOLOGY_METRICS_ENABLED` is true and `POWERSCALE_TOPOLOGY_METRICS_POLL_FREQUENCY` is 30 seconds.
          ```bash
          - name: "POWERSCALE_TOPOLOGY_METRICS_ENABLED"
            value: "true"
          - name: "POWERSCALE_TOPOLOGY_METRICS_POLL_FREQUENCY"
            value: "30"
          ```
      - Delete older observability version deployments and services from karavi namespace.
        ```bash
        kubectl delete deployment karavi-metrics-powerscale -n karavi
        kubectl delete deployment karavi-topology -n karavi
        kubectl delete deployment otel-collector -n karavi
        kubectl delete service karavi-metrics-powerscale -n karavi
        kubectl delete service karavi-topology -n karavi
        kubectl delete service otel-collector -n karavi
        ```

>NOTE:

- In observability module upgrade, only `n-1` to `n` upgrade is supported, e.g. if the current observability version is `v1.12.x`, it can be upgraded to `1.13.x`.
- Upgrade to csm-operator and csi-driver first which support the corresponding observability module version.
