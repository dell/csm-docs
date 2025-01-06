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

{{< hide id="1">}}

For example, if the object name is powerstore:</br>

```bash
kubectl edit csm powerstore -n powerstore
``` 

{{< /hide >}} 

{{< hide id="2" >}}

For example, if the object name is powerscale:</br>

```bash
kubectl edit csm isilon -n isilon
```

{{< /hide >}} 

{{< hide id="3" >}}

For example, if the object name is powerflex:</br>

```bash
kubectl edit csm powerflex -n powerflex
```

{{< /hide >}} 

{{< hide id="4" >}}


For example, if the object name is powermax:</br>

```bash
kubectl edit csm powermax -n powermax
``` 

{{< /hide >}}

{{< hide id="5" >}}


For example, if the object name is unityXT:</br>

```bash
kubectl edit csm unity -n unity
``` 

{{< /hide >}}

Modify the installation as needed, typically updating driver versions, sidecars, and environment variables.

3. Refer how to [upgrade](https://infohub.delltechnologies.com/en-us/p/best-practices-for-deployment-and-life-cycle-management-of-dell-csm-modules-1/#:~:text=Upgrades%20with%20Operator) guide if you have more questions </br>

{{< alert title="Warning" color="warning" >}}
 <span><span/>{{< message text="4" >}}
{{< /alert >}}

#### Supported modifications

* Changing environment variable values for driver
* Updating the image of the driver
* Upgrading the driver version

**NOTES:**
1. If you are trying to upgrade the CSI driver from an older version, make sure to modify the _configVersion_ field if required.
   ```yaml
      driver:
        configVersion: v2.13.0
   ```
{{< alert title="Warning" color="warning" >}}
Don’t update the original CustomResource manifest file with `kubectl apply -f`. It can overwrite important annotations and cause failures.
{{< /alert >}}
