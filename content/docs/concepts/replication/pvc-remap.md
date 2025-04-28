---
title: PVC Remap
linktitle: PVC Remap
weight: 6
description: >
  Automated Failover and PVC Attachment on Kubernetes Stretched Clusters
---

This feature automatically attaches the Persistent Volume Claim (PVC) to the active volume/Persistent Volume (PV) without requiring manual intervention on a Kubernetes single stretched cluster using CSM replication.

## Prerequisites

This feature is enabled by default.

### Users can disable it at time of the installation

* For installation done via `helm-charts`, user can set the argument `disablePVCRemap` to `true` in `values.yaml`. You can refer to the following excerpt:

    ```yaml
    disablePVCRemap: "true"
    ```

* For installation done via csm-operator, user can set the argument `DISABLE_PVC_REMAP` to `true` in `values.yaml`. You can refer to the following excerpt:

    ```yaml
    - name: "DISABLE_PVC_REMAP"
        value: "true"
    ```

* For installation done via csm-replication, user can set the argument `disable-pvc-remap` to `true` in `deploy/controller.yaml`.

### Users can disable after the installation is done

To disable this feature, set the argument `disable-pvc-remap` to `true` in the deployment:

```shell
kubectl edit dell-replication-controller-manager -n dell-replication-controller
```

```shell
disable-pvc-remap=true
```
