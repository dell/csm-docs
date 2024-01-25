---
title: PowerMax
description: Release notes for PowerMax CSI driver
---

## Release Notes - CSI PowerMax v2.9.1

>Note: Auto SRDF group creation is currently not supported in PowerMaxOS 10.1 (6079) Arrays.

> Note: Starting from CSI v2.4.0, Only Unisphere 10.0 REST endpoints are supported. It is mandatory that Unisphere should be updated to 10.0. Please find the instructions [here.](https://dl.dell.com/content/manual34878027-dell-unisphere-for-powermax-10-0-0-installation-guide.pdf?language=en-us&ps=true)

>Note: File Replication for PowerMax is currently not supported 


### New Features/Changes

- [#947 - [FEATURE]: Support for Kubernetes 1.28](https://github.com/dell/csm/issues/947)
- [#1066 - [FEATURE]: Support for Openshift 4.14](https://github.com/dell/csm/issues/1066)
- [#851 - [FEATURE]: Helm Chart Enhancement - Container Images Configurable in values.yaml](https://github.com/dell/csm/issues/851)
- [#905 - [FEATURE]: Add support for CSI Spec 1.6](https://github.com/dell/csm/issues/905)
- [#991 - [FEATURE]:Remove linked proxy mode for PowerMax](https://github.com/dell/csm/issues/991)
- [#996 - [FEATURE]: Dell CSI to Dell CSM Operator Migration Process](https://github.com/dell/csm/issues/996)
- [#1062 - [FEATURE]: CSM PowerMax: Support PowerMax v10.1 ](https://github.com/dell/csm/issues/1062)

### Fixed Issues

- [#983 - [BUG]: storageCapacity can be set in unsupported CSI Powermax with CSM Operator](https://github.com/dell/csm/issues/983)
- [#1014 - [BUG]: Missing error check for os.Stat call during volume publish](https://github.com/dell/csm/issues/1014)
- [#1037 - [BUG]: Document instructions update: Either Multi-Path or the Power-Path software should be enabled for PowerMax ](https://github.com/dell/csm/issues/1037)
- [#1051 - [BUG]: make docker command is failing with error ](https://github.com/dell/csm/issues/1051)
- [#1053 - [BUG]: make gosec is erroring out - Repos PowerMax,PowerStore,PowerScale (gosec is installed)](https://github.com/dell/csm/issues/1053)
- [#1056 - [BUG]: Missing runtime dependencies reference in PowerMax README file.](https://github.com/dell/csm/issues/1056)
- [#1061 - [BUG]: Golint is not installing with go get command](https://github.com/dell/csm/issues/1061)
- [#1110 - [BUG]: Multi Controller defect - sidecars timeout](https://github.com/dell/csm/issues/1110)


### Known Issues

| Issue | Workaround |
|-------|------------|
| Unable to update Host: A problem occurred modifying the host resource | This issue occurs when the nodes do not have unique hostnames or when an IP address/FQDN with same sub-domains are used as hostnames. The workaround is to use unique hostnames or FQDN with unique sub-domains|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | This is a known issue and has been reported at https://github.com/kubernetes-csi/external-attacher/issues/215. Workaround: <br /> 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node |
| If the volume limit is exhausted and there are pending pods and PVCs due to `exceed max volume count`, the pending PVCs will be bound to PVs and the pending pods will be scheduled to nodes when the driver pods are restarted. | It is advised not to have any pending pods or PVCs once the volume limit per node is exhausted on a CSI Driver. There is an open issue reported with kubenetes at https://github.com/kubernetes/kubernetes/issues/95911 with the same behavior. |
| Automatic SRDF group creation is failing with "Unable to get Remote Port on SAN for Auto SRDF" for PowerMaxOS 10.1 arrays | Create the SRDF Group and add it to the storage class |
| [Node stage is failing with error "wwn for FC device not found"](https://github.com/dell/csm/issues/1070)| This is an intermittent issue, rebooting the node will resolve this issue |
| Standby controller pod is in crashloopbackoff state | Scale down the replica count of the controller pod's deployment to 1 using ```kubectl scale deployment <deployment_name> --replicas=1 -n <driver_namespace>``` |
### Note:

- Support for Kubernetes alpha features like Volume Health Monitoring and RWOP (ReadWriteOncePod) access mode will not be available in Openshift environment as Openshift doesn't support enabling of alpha features for Production Grade clusters.
