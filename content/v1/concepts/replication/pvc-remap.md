---
title: PVC Remap
linktitle: PVC Remap
weight: 6
description: >
  Automated Failover and PVC Attachment on Kubernetes Stretched Clusters
---

This feature automatically attaches the Persistent Volume Claim (PVC) to the active volume/Persistent Volume (PV)
without requiring manual intervention for failover scenarios on a Kubernetes stretched cluster using CSM replication.

## Prerequisites

This feature is enabled by default.

### Users can disable it at the time of installation

* For installation done via `helm-charts`, user can set the argument `disablePVCRemap` to `true` in `values.yaml`. You can refer to the following selection:

    ```yaml
    disablePVCRemap: "true"
    ```

* For installation done via csm-operator, user can set the argument `DISABLE_PVC_REMAP` to `true` in sample files. eg. `storage_csm_powerflex_xxxxx.yaml`. You can refer to the following selection:

    ```yaml
    - name: "DISABLE_PVC_REMAP"
        value: "true"
    ```

* User can disable this feature by setting the argument `disable-pvc-remap` to `true` in `deploy/controller.yaml`.

### Users can disable after the installation is done

To disable this feature, set the argument `disable-pvc-remap` to `true` in the deployment:

```shell
kubectl edit dell-replication-controller-manager -n dell-replication-controller
```

```shell
disable-pvc-remap=true
```
