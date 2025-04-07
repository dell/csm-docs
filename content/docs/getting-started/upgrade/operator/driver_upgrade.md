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

{{< hide class="4" >}}
   As of CSI PowerMax v2.14.0, the csi reverse proxy configuration and connectivity information has been migrated from a ConfigMap to a Secret. If the `powermax-creds` secret format was not previously updated, reference **Step 2** in [CSI Driver installation steps](../../../../installation/kubernetes/powermax/csmoperator/#install-driver).

   Set the `authSecret` to the name of the secret created, `powermax-creds`. Also, set `X_CSI_REVPROXY_USE_SECRET: true` in your CSM file to use the new secret configuration.

   **Note:** The `powermax-reverseproxy-config` remains for backward compatibility only. Use of the `powermax-creds` Secret, as outlined above, is recommended.

   If you would like to continue using the `powemax-reverseproxy-config` ConfigMap, set `X_CSI_REVPROXY_USE_SECRET: false` in your CSM file, and skip the creation of this Secret.

   Additionally, the powermax-array-config is deprecated and can be deleted. Its values have been
   migrated to Powermax [sample](https://github.com/dell/csm-operator/blob/main/samples).
   
   To continue using powermax-array-config, follow Step 3 in the CSI Driver installation steps. If not using it, add values to X_CSI_MANAGED_ARRAYS, X_CSI_POWERMAX_PORTGROUPS, and X_CSI_TRANSPORT_PROTOCOL in the sample yaml.
 
   **Note:** powermax-array-config is kept for backward compatibility only.


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
        configVersion: v2.14.0
   ```
{{< alert title="Warning" color="warning" >}}
Don’t update the original CustomResource manifest file with `kubectl apply -f`. It can overwrite important annotations and cause failures.
{{< /alert >}}
