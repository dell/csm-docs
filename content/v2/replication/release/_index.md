---
title: "Release notes"
linkTitle: "Release notes"
weight: 9
Description: >
  Dell Container Storage Modules (CSM) release notes for replication
---
## Release Notes - CSM Replication 1.11.0




### New Features/Changes

- [#1560 - [FEATURE]: CSM support for OpenShift 4.18](https://github.com/dell/csm/issues/1560)
- [#1561 - [FEATURE]: Added support for Kubernetes 1.32 ](https://github.com/dell/csm/issues/1561)
- [#1563 - [FEATURE]: Support KubeVirt for CSM modules](https://github.com/dell/csm/issues/1563)
- [#1610 - [FEATURE]: Added support for PowerStore 4.1 ](https://github.com/dell/csm/issues/1610)
- [#1611 - [FEATURE]: Added support for PowerScale 9.10](https://github.com/dell/csm/issues/1611)

### Fixed Issues

- [#1535 - [BUG]: Issue with CSM replication and unable to choose the target cluster certificate](https://github.com/dell/csm/issues/1535)
- [#1667 - [BUG]: Labels versions and maintainer update for CSM images ](https://github.com/dell/csm/issues/1667)

### Known Issues
| Symptoms | Prevention, Resolution or Workaround |
| --- | --- | 
| When running CSI-PowerMax with Replication in a multi-cluster configuration, the driver on the target cluster fails and the following error is seen in logs: `error="CSI reverseproxy service host or port not found, CSI reverseproxy not installed properly"` | The reverseproxy service needs to be created manually on the target cluster. Follow [the instructions here](v2/deployment/csmoperator/modules/replication#configuration-steps) to create it.|
