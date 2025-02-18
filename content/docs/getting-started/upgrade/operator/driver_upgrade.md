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

{{< hide class="1" >}}
```bash
kubectl get csm -n powerstore
```
{{< /hide >}} 

{{< hide class="2" >}}
```bash
kubectl get csm -n isilon 
``` 
{{< /hide  >}} 

{{< hide class="3" >}}
```bash
kubectl get csm -n vxflexos
``` 
{{< /hide >}} 

{{< hide class="4" >}}
```bash
kubectl get csm -n powermax
``` 
{{< /hide >}} 

{{< hide class="5" >}}
```bash
kubectl get csm -n unity
```
{{< /hide >}} 

2. Use the object name in the kubectl edit command: </br>

{{< hide class="1">}}
```bash
kubectl edit csm powerstore -n powerstore
``` 
{{< /hide >}}  

{{< hide class="2" >}}
```bash
kubectl edit csm isilon -n isilon
```
{{< /hide >}} 

{{< hide class="3" >}}
```bash
kubectl edit csm vxflexos -n vxflexos
```
{{< /hide >}} 

{{< hide class="4" >}}
```bash
kubectl edit csm powermax -n powermax
```
{{< /hide >}}  

{{< hide class="5" >}}
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
