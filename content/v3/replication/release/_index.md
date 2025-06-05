---
title: "Release notes"
linkTitle: "Release notes"
weight: 9
Description: >
  Dell Container Storage Modules (CSM) release notes for replication
---
## Release Notes - CSM Replication 1.10.0


### New Features/Changes

- [#1472 - [FEATURE]: Support for Kubernetes 1.31](https://github.com/dell/csm/issues/1472)
- [#1473 - [FEATURE]: Add Support for OpenShift Container Platform (OCP) 4.17](https://github.com/dell/csm/issues/1473)
- [#1443 - [FEATURE]: PowerStore Sync / Metro for Block - CSM Replication](https://github.com/dell/csm/issues/1443)

### Fixed Issues

- [#1531 - [BUG]: CSM-Operator resets dell-replication-controller-config configmap](https://github.com/dell/csm/issues/1531)

### Known Issues
| Symptoms | Prevention, Resolution or Workaround |
| --- | --- | 
| When running CSI-PowerMax with Replication in a multi-cluster configuration, the driver on the target cluster fails and the following error is seen in logs: `error="CSI reverseproxy service host or port not found, CSI reverseproxy not installed properly"` | The reverseproxy service needs to be created manually on the target cluster. Follow [the instructions here](v3/deployment/csmoperator/modules/replication#configuration-steps) to create it.|
