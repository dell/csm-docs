---
title: "COSI Driver installation using Operator"
linkTitle: "Using Operator"
weight: 2
Description: Installation of COSI Driver using Operator
---

The COSI Driver for Dell ObjectScale can be deployed by using the CSM Operator.

{{< accordion id="One" title="Operator Install (OpenShift Console)" markdown="true" >}}
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

{{< accordion id="Two" title="Operator Install (CLI)" markdown="true" >}}
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

{{< accordion id="Three" title="Prerequisites" markdown="true" >}}
### Prerequisites
To use the COSI Driver, you must deploy the following components to your cluster:

- Kubernetes Container Object Storage Interface CRDs
- Container Object Storage Interface Controller

*Note*: The following `kubectl patch` command is required as the current installation procedure for v0.2.1 will use a previous image version. If you are on an OpenShift cluster you can use the `oc` command instead.
```bash
kubectl create -k 'https://github.com/kubernetes-sigs/container-object-storage-interface//?ref=v0.2.1'
kubectl patch deployment container-object-storage-controller -n container-object-storage-system -p '{"spec":{"template":{"spec":{"containers":[{"name":"objectstorage-controller","image":"gcr.io/k8s-staging-sig-storage/objectstorage-controller:release-0.2"}]}}}}'
```
{{< /accordion >}}
<br>

{{< accordion id="Four" title="Driver Install" markdown="true" >}}
**Steps**
1. Ensure that you have created the namespace where you want to install the driver. You can run `kubectl create namespace dell-cosi` to create a new one. The use of _dell-cosi_ as the namespace is just an example. You can choose any name for the namespace.
2. Create a new file called `secret.yaml` with the contents of the [configuration file](./configuration_file#features-and-capabilities). Edit the file with parameters specific to the ObjectScale instance.
3. Create a secret by running `kubectl create secret generic dell-cosi-config -n dell-cosi --from-file=config.yaml=secret.yaml`
4. Create a Custom Resource (CR) for COSI using either minimal resource file or the more configurable sample. Save one of the following YAML blocks to a file.
    ##### Minimal Configuration
    The following represents the minimum CR for installing the COSI driver.
    ```yaml
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
        name: cosi
        namespace: dell-cosi
    spec:
        driver:
        csiDriverType: "cosi"
        configVersion: v1.0.0
        forceRemoveDriver: true
    ```
    ##### Detailed Configuration
    The detailed configuration allows for customization of some attributes of the CR as indicated by the commented sections.
    ```yaml
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
    name: cosi
    namespace: dell-cosi
    spec:
    driver:
        csiDriverType: "cosi"
        configVersion: v1.0.0
        replicas: 2
        forceRemoveDriver: true
        common:
        image: "quay.io/dell/container-storage-modules/cosi:v1.0.0"
        imagePullPolicy: IfNotPresent
        # Node selector for scheduling the COSI driver pod.
        nodeSelector: {}
        # Tolerations for scheduling the COSI driver pod.
        tolerations: []
        envs:
            # COSI driver log level.
            # Options are "PANIC", "FATAL", "ERROR", "WARN", "INFO",
            # "DEBUG", and "TRACE".
            - name: COSI_LOG_LEVEL
            value: "INFO"
            # COSI driver log format
            # Allowed values: "TEXT" or "JSON"
            # Default value: "TEXT"
            - name: COSI_LOG_FORMAT
            value: "TEXT"
            # OTEL_COLLECTOR_ADDRESS is the gRPC endpoint for the OTEL Collector.
            # Example: "otel-collector.namespace:4317"
            # Default: ""
            - name: OTEL_COLLECTOR_ADDRESS
            value: ""
        sideCars:
        - name: objectstorage-provisioner-sidecar
            image: gcr.io/k8s-staging-sig-storage/objectstorage-sidecar:release-0.2
            imagePullPolicy: IfNotPresent
    ```

6. Create the COSI CR from one of the sections shown in step 5.
    ```bash
    kubectl create -f <file>
    ```
    Where file is the name of the CR resource file that you saved in step 5.
7. Validate the installation
    ```terminal
    # kubectl get csm -A
    NAMESPACE   NAME   CREATIONTIME   CSIDRIVERTYPE   CONFIGVERSION   STATE
    dell-cosi   cosi   16s            cosi            v1.0.0          Succeeded

    # kubectl -n dell-cosi get pods
    NAME                   READY   STATUS    RESTARTS   AGE
    cosi-59fbff5ff-m2j5x   2/2     Running   0          32s
    cosi-59fbff5ff-w2sxm   2/2     Running   0          32s

    ```

{{< /accordion >}}
<br>

{{< accordion id="Five" title="Post Install" markdown="true" >}}
{{<include  file="content/docs/concepts/cosidriver/installation/postinstall" >}}{{< /accordion>}}
<br>
