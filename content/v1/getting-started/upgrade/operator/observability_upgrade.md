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
  - Update the Observability config version, csm-topology image and the driver metrics images(e.g. for CSI PowerScale driver, the metrics driver image would be `csm-metrics-powerscale`)

>NOTE:

- In observability module upgrade, only `n-1` to `n` upgrade is supported, e.g. if the current observability version is `v1.7.x`, it can be upgraded to `1.8.x`.
- Upgrade to csm-operator and csi-driver first which support the corresponding observability module version.
