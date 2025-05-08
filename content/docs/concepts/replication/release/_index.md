---
title: "Release notes"
toc_hide: true
linkTitle: "Release notes"
weight: 9
Description: >
  Container Storage Modules (CSM) release notes for replication
---
## CSM Replication v1.12.0

### New Features/Changes

- [#1749 - [FEATURE]: CSM Operator - CSM Operator must manage the CRD only on the K8S cluster where the Operator is deployed](https://github.com/dell/csm/issues/1749)
- [#1750 - [FEATURE]: Kubernetes 1.33 Qualification](https://github.com/dell/csm/issues/1750)
- [#1756 - [FEATURE]: CSM Replication - Controller reattach failover PV to PVC automatically on stretched cluster](https://github.com/dell/csm/issues/1756)
- [#1757 - [FEATURE]: CSM Replication - Test replication failover by creating remote snaps and PVCs/PVs from the snaps](https://github.com/dell/csm/issues/1757)
- [#1850 - [FEATURE]: Controller reattach failover PV to PVC automatically on stretched cluster](https://github.com/dell/csm/issues/1850)
- [#1862 - [FEATURE]: CSM Replication - Add claimRef to the target PV](https://github.com/dell/csm/issues/1862)

### Fixed Issues

- [#1775 - [BUG]: CSI+Rep using Operator for PMAX failing during deployment.](https://github.com/dell/csm/issues/1775)

### Known Issues
| Symptoms | Prevention, Resolution or Workaround |
| --- | --- | 
| When running CSI-PowerMax with Replication in a multi-cluster configuration, the driver on the target cluster fails and the following error is seen in logs: `error="CSI reverseproxy service host or port not found, CSI reverseproxy not installed properly"` | The reverseproxy service needs to be created manually on the target cluster. Follow [the instructions here](docs/getting-started/installation/kubernetes/powermax/csmoperator/csm-modules/replication/) to create it.|
