---
title: "Operator Upgrade"
linkTitle: "Operator Upgrade"
description: 
toc_hide: true 
weight: 2
--- 
### Upgrading Drivers with Dell CSM Operator

You can update CSI Drivers installed by the Dell CSM Operator like any Kubernetes resource:

1. </b>Get the driver-object details using kubectl command:</b></br>

```bash
kubectl get <driver-object> -n <driver-namespace>
```

2. Replace `<driver-namespace>` with the appropriate namespace:</br>
```bash
kubectl get csm -n <driver-namespace>
```

Use the object name in the kubectl edit command: </br>

```bash
kubectl edit csm <object-name> -n <driver-namespace>
```

For example, if the object name is powerstore:</br>

```bash
kubectl edit csm powerstore -n <driver-namespace>
```

Modify the installation as needed, typically updating driver versions, sidecars, and environment variables.

3. Refer how to [upgrade](https://infohub.delltechnologies.com/en-us/p/best-practices-for-deployment-and-life-cycle-management-of-dell-csm-modules-1/#:~:text=Upgrades%20with%20Operator) guide if you have more questions </br>

{{< alert title="Warning" color="warning" >}}
Starting with CSM 1.12, use images from [quay.io](https://quay.io/organization/dell). From CSM 1.14 (May 2025), editing the CSM object will fail if using images from [Docker Hub](https://hub.docker.com/r/dellemc/).
{{< /alert >}}