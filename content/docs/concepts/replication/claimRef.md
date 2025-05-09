---
title: Allow PVC creation on target cluster & claimRef update on remote PV 
linktitle: Allow PVC creation on target cluster & claimRef update on remote PV
weight: 6
description: >
  Allow PVC creation on target cluster & claimRef update on remote PV
---

Enabled: It creates a corresponding PVC on target cluster same as source cluster.
         Applicable only on multi cluster scenarios.

Disabled: It updates `claimRef` on remote PV, so it cannot be claimed unless `claimRef` is removed or updated with expected claim details. 
```yaml
claimRef:                                       
  apiVersion: v1
  kind: PersistentVolumeClaim
  name: reserved
  namespace: reserved
```          

## Prerequisites

This feature is disabled by default.

### Users can enable it at the time of installation

* For installation done via `helm-charts`, user can set the argument `allowPvcCreationOnTarget` to `true` or `false` in `values.yaml`. 
  You can refer to the following selection:

    ```yaml
    allowPvcCreationOnTarget: "true"
    ```

* For installation done via csm-operator, user can set the argument `REPLICATION_ALLOW_PVC_CREATION_ON_TARGET` to `true` or `false` in sample files. 
  eg. `storage_csm_powerflex_xxxxx.yaml`  You can refer to the following selection:

    ```yaml
    - name: "REPLICATION_ALLOW_PVC_CREATION_ON_TARGET"
      value: "true"
    ```

* User can enable/disable this feature by setting the argument `allow-pvc-creation-on-target` to `true` or `false` in `deploy/controller.yaml`.
