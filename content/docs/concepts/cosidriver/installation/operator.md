---
title: "COSI Driver installation using Operator"
linkTitle: "Using Operator"
weight: 2
Description: Installation of COSI Driver using Operator
---

The COSI Driver for Dell ObjectScale can be deployed by using the CSM Operator.

{{< accordion id="One" title="Operator Install (OpenShift)" markdown="true" >}}
### Installation via the OpenShift Console

</br>

1. On the OpenShift console, navigate to **OperatorHub** and use the keyword filter to search for **Dell Container Storage Modules.**

2. Click **Dell Container Storage Modules** tile

3. Keep all default settings and click **Install**.
</br>
<ol>

Verify that the operator is deployed
```terminal
oc get operators

NAME                                                          AGE
dell-csm-operator-certified.openshift-operators               2d21h
```

```terminal
oc get pod -n openshift-operators

NAME                                                       READY   STATUS       RESTARTS      AGE
dell-csm-operator-controller-manager-86dcdc8c48-6dkxm      2/2     Running      21 (19h ago)  2d21h
```
</ol>
{{< /accordion >}}
<br>

{{< accordion id="Two" title="Operator Install (manual)" markdown="true" >}}
### Manual Installation on a cluster without OLM

1. Clone and checkout the required csm-operator version using
```bash
git clone -b {{< version-docs key="csm-operator_latest_version" >}} https://github.com/dell/csm-operator.git
```
2. Change the working directory to the csmoperator directory
```bash
cd csm-operator
```
3. _(Optional)_ The Container Storage Modules Operator might need more resources if users have larger environment (>1000 Pods). You can modify the default resource requests and limits in the files `deploy/operator.yaml`, `config/manager/manager.yaml`  and increase the values for cpu and memory. More information on setting the resource requests and limits can be found [here](https://sdk.operatorframework.io/docs/best-practices/managing-resources/). Current default values are set as below:
```yaml
    resources:
        limits:
        cpu: 200m
        memory: 512Mi
        requests:
        cpu: 100m
        memory: 192Mi
```
4. Run `bash scripts/install.sh` to install the operator.

>NOTE: CSM Operator will be installed in the `dell-csm-operator` namespace.

<img src="/csm-docs/images/deployment/install.jpg" width="2500px"  style="border: 2px solid #ccc; padding: 10px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

5. Validate the installation
```bash
kubectl get pods -n dell-csm-operator
```
If installed successfully, you should be able to see the operator pod in the `dell-csm-operator` namespace.

<img src="/csm-docs/images/deployment/install_pods.jpg" width="2500px"  style="border: 2px solid #ccc; padding: 10px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
{{< /accordion >}}
<br>

{{< accordion id="Three" title="Driver Install" markdown="true" >}}
{{< /accordion >}}
