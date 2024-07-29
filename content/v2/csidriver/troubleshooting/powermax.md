---
title: PowerMax
linktitle: PowerMax 
description: Troubleshooting PowerMax Driver
---
| Symptoms | Prevention, Resolution or Workaround |
|------------|--------------|
| `kubectl describe pod powermax-controller-<xyz> –n <namespace>` indicates that the driver image could not be loaded | You may need to put an insecure-registries entry in `/etc/docker/daemon.json` or log in to the docker registry |
| `kubectl logs powermax-controller-<xyz> –n <namespace> driver` logs show that the driver cannot authenticate | Check your secret’s username and password |
| `kubectl logs powermax-controller-<xyz> –n <namespace> driver` logs show that the driver failed to connect to the U4P because it could not verify the certificates | Check the powermax-certs secret and ensure it is not empty or it has the valid certificates|
|Driver install or upgrade fails because of an incompatible Kubernetes version, even though the version seems to be within the range of compatibility. For example: Error: UPGRADE FAILED: chart requires kubeVersion: >= 1.23.0 < 1.27.0 which is incompatible with Kubernetes V1.23.11-mirantis-1 | If you are using an extended Kubernetes version, please see the [helm Chart](https://github.com/dell/helm-charts/blob/main/charts/csi-powermax/Chart.yaml) and use the alternate kubeVersion check that is provided in the comments. Please note that this is not meant to be used to enable the use of pre-release alpha and beta versions, which are not supported.|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node. |
| When attempting a driver upgrade, you see: ```spec.fsGroupPolicy: Invalid value: "xxx": field is immutable``` | You cannot upgrade between drivers with different fsGroupPolicies. See [upgrade documentation](../../upgradation/drivers/powermax) for more details |
| Ater the migration group is in “migrated” state but unable to move to “commit ready” state because the new paths are not being discovered on the cluster nodes.| Run the following commands manually on the cluster nodes `rescan-scsi-bus.sh  -i`  `rescan-scsi-bus.sh  -a`|
| `Failed to fetch details for array: 000000000000. [Unauthorized]`" | Please make sure that correct encrypted username and password in secret files are used, also ensure whether the RBAC is enabled for the user |
| `Error looking up volume for idempotence check: Not Found` or `Get Volume step fails for: (000000000000) symID with error (Invalid Response from API)`| Make sure that Unisphere endpoint doesn't end with front slash |
|`FailedPrecondition desc = no topology keys could be generate`| Make sure that FC or iSCSI connectivity to the arrays are proper |
| CreateHost failed with error `initiator is already part of different host.` | Update modifyHostName to true in values.yaml Or Remove the initiator from existing host |
| `kubectl logs powermax-controller-<xyz> –n <namespace>` driver logs says connection refused and the reverseproxy logs says "Failed to setup server.(secrets \"secret-name\" not found)" | Make sure the given secret <secret-name> exist on the cluster |
| nodestage is failing with error `Error invalid IQN Target iqn.EMC.0648.SE1F` | 1. Update initiator name to full default name , ex: iqn.1993-08.org.debian:01:e9afae962192 <br> 2.Ensure that the iSCSI initiators are available on all the nodes where the driver node plugin will be installed and it should be full default name. |
| Volume mount is failing on few OS(ex:VMware Virtual Platform) during node publish with error `wrong fs type, bad option, bad superblock` | 1. Check the multipath configuration(if enabled) 2. Edit Vm Advanced settings->hardware and add the param `disk.enableUUID=true` and reboot the node |
| Standby controller pod is in crashloopbackoff state | Scale down the replica count of the controller pod's deployment to 1 using ```kubectl scale deployment <deployment_name> --replicas=1 -n <driver_namespace>``` |  
