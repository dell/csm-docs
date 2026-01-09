---
title: "COSI Driver installation using Operator"
linkTitle: "Operator"
weight: 2
Description: Installation of COSI Driver using Operator
---

The COSI Driver for Dell ObjectScale can be deployed by using the CSM Operator.

1. Set up an OpenShift cluster following the official documentation.
2. Proceed to the Prerequisites.
3. Complete the driver installation.

{{< accordion id="One" title="Prerequisite" >}}
<br>
{{<include  file="content/docs/getting-started/installation/kubernetes/cosi/prerequisite/_index.md" >}}

{{< /accordion >}}

<br>

{{< accordion id="Two" title="Driver Install" markdown="true" >}}

</br>


### Operator Installation

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
</br>

### Install COSI Driver
1. Ensure that you have created the namespace where you want to install the driver. You can run `kubectl create namespace dell-cosi` to create a new one. The use of _dell-cosi_ as the namespace is just an example. You can choose any name for the namespace.
2. Create a new file called `secret.yaml` with the contents of the [configuration file](../../../kubernetes/cosi/configuration#configuration-file-example). Edit the file with parameters specific to the ObjectScale instance.
```yaml
cat <<EOF > secret.yaml
connections:
  - objectscale:
      id: objectscale
      credentials:
        username: namespaceamdin
        password: namespaceadminpassword
      namespace: ns1
      mgmt-endpoint: https://mgmt-endpoint-address:4443
      emptyBucket: true
      protocols:
        s3:
          endpoint: https://s3-endpoint-address:9021
      tls:
        insecure: true
EOF
```
3. Create a secret by running
```bash
kubectl create secret generic dell-cosi-config -n dell-cosi --from-file=config.yaml=secret.yaml
```
4. Create a Custom Resource (CR) for COSI using either minimal resource file or the more configurable sample. Save one of the following YAML blocks to a file.
{{< collapse id="1" title="Minimal Configuration">}}
```yaml
cat <<EOF > csm-cosi.yaml
apiVersion: storage.dell.com/v1
kind: ContainerStorageModule
metadata:
  name: cosi
  namespace: cosi
spec:
  driver:
    csiDriverType: "cosi"
    configVersion: v1.0.0
    forceRemoveDriver: true
EOF
```
{{< /collapse >}}
{{< collapse id="2" title="Detailed Configuration">}}
```yaml
cat <<EOF > csm-cosi.yaml
apiVersion: storage.dell.com/v1
kind: ContainerStorageModule
metadata:
  name: cosi
  namespace: cosi
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
EOF
```
{{< /collapse >}}
5. Create the COSI CR using the CR.
    ```bash
    kubectl create -f csm-cosi.yaml
    ```
    You should see the following output:
    ```terminal
    containerstoragemodule.storage.dell.com/cosi created
    ```
6. Validate the installation
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
