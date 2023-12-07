---
title: PowerMax
linktitle: PowerMax 
description: Troubleshooting PowerMax Driver
---
| Symptoms | Prevention, Resolution or Workaround |
|------------|--------------|
| Warning about feature gates | Double check that you have applied all the features to the indicated processes. Restart kubelet when remediated.|
| `kubectl describe pod powermax-controller-<xyz> –n <namespace>` indicates that the driver image could not be loaded | You may need to put an insecure-registries entry in `/etc/docker/daemon.json` or log in to the docker registry |
| `kubectl logs powermax-controller-<xyz> –n <namespace> driver` logs show that the driver cannot authenticate | Check your secret’s username and password |
| `kubectl logs powermax-controller-<xyz> –n <namespace> driver` logs show that the driver failed to connect to the U4P because it could not verify the certificates | Check the powermax-certs secret and ensure it is not empty or it has the valid certificates|
|Driver install or upgrade fails because of an incompatible Kubernetes version, even though the version seems to be within the range of compatibility. For example: Error: UPGRADE FAILED: chart requires kubeVersion: >= 1.22.0 < 1.25.0 which is incompatible with Kubernetes V1.22.11-mirantis-1 | If you are using an extended Kubernetes version, please see the [helm Chart](https://github.com/dell/helm-charts/blob/main/charts/csi-powermax/Chart.yaml) and use the alternate kubeVersion check that is provided in the comments. Please note that this is not meant to be used to enable the use of pre-release alpha and beta versions, which is not supported.|
| When a node goes down, the block volumes attached to the node cannot be attached to another node | 1. Force delete the pod running on the node that went down <br /> 2. Delete the volumeattachment to the node that went down. <br /> Now the volume can be attached to the new node. |
| When attempting a driver upgrade, you see: ```spec.fsGroupPolicy: Invalid value: "xxx": field is immutable``` | You cannot upgrade between drivers with different fsGroupPolicies. See [upgrade documentation](../../upgradation/drivers/powermax) for more details |
