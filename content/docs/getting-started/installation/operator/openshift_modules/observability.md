---
title: Observability
linktitle: Observability
description: >
  Installing Observability via Container Storage Modules Operator
---

1. Verify the Cert-Manager is deployed and configured on the OpenShift Cluster. Please review the Red Hat documentation for the procedure.

2. Verify the user workload monitoring is enabled and configured on the OpenShift Cluster. Please review Red Hat documentation for the procedure to configure user workload monitoring on the OpenShift Cluster.

3. Enable Observability module in the CSM  

   Use this command to create the **ContainerStorageModule** custom resource with Observability enabled.
  
   ```bash
   oc create -f csm-{{labels}}.yaml
   ```

   Example:

   ```yaml
   cat <<EOF> csm-{{labels}}.yaml
   apiVersion: storage.dell.com/v1
   kind: ContainerStorageModule
   metadata:
     name: {{labels}}
     namespace: {{labels}}
   spec:
     driver:
       csiDriverType: "{{Var}}"
       configVersion: {{< version-docs key="PFlex_latestVersion" >}}
     module:
     - name: observability
       enabled: true
       components:
       - name: otel-collector
         enabled: true
       - name: metrics-{{Var}}
         enabled: true
   EOF
   ```

    Verify the Observability Pods are created.

    ```terminal
    oc get pod -n {{labels}}

    NAME                                         READY   STATUS    RESTARTS   AGE
    karavi-metrics-{{Var}}-69855dbdd5-5mshq     1/1     Running   0          2m54s
    otel-collector-b496d8c4d-gp6zz               2/2     Running   0          2m55s 
    ```

    Verify the Observability Services.

    ```terminal
    oc get svc -n {{labels}}
    NAME                           TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)              AGE
    karavi-metrics-{{Var}}        ClusterIP   172.30.169.86    <none>        2222/TCP             3m29s
    otel-collector                 ClusterIP   172.30.127.237   <none>        55680/TCP,8443/TCP   3m29s 
    ```

4. Create Service Monitor to scrape the Observability module by the OpenShift Observability.

    Use this command to create the ServiceMonitor.

    ```bash
    oc apply -f smon-otel-collector.yaml
    ```

    Example:

    ```yaml
    cat <<EOF> smon-otel-collector.yaml
    apiVersion: monitoring.coreos.com/v1
    kind: ServiceMonitor
    metadata:
      name: otel-collector
      namespace: {{labels}}
    spec:
      endpoints:
      - path: /metrics
        port: exporter-https
        scheme: https
        tlsConfig:
          insecureSkipVerify: true
      selector:
        matchLabels:
          app.kubernetes.io/instance: karavi-observability
          app.kubernetes.io/name: otel-collector 
    EOF
    ```

    Verify the ServiceMonitor is created.

    ```terminal
    oc get smon -n {{labels}}
    NAME             AGE
    otel-collector   44h 
    ```

{{< hide class="1" >}}
5. Verify the PowerScale metrics are visible in the OpenShift Console.

   On the OpenShift Console, navigate to Observer and then Metrics, search for PowerScale metrics.
{{< /hide >}}

{{< hide class="2" >}}
5. Verify the PowerFlex metrics are visible in the OpenShift Console.

   On the OpenShift Console, navigate to Observer and then Metrics, search for PowerFlex metrics.

### Installing OpenShift Virtualization and Accessing KubeVirt Metrics

User can follow the official guide to [install Openshift Virtualization in OCP cluster](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/virtualization/installing#installing-virt-operator_installing-virt). Once installed, OpenShift Virtualization automatically creates the ServiceMonitor required by Prometheus to scrape KubeVirt metrics.

On the OpenShift Console, navigate to Observer and then Metrics, search for kubevirt metrics. 
User can use PromQL join queries to correlate KubeVirt metrics with CSI storage metrics for advanced insights. For example, for each VM disk, find its allocated size of the underlying PowerFlex volume, using the following query:
 

 ```bash
 label_replace(kubevirt_vm_disk_allocated_size_bytes, "Namespace", "$1", "namespace", "(.*)") * on(persistentvolumeclaim, Namespace) group_left(PersistentVolumeName) label_replace(powerflex_volume_read_bw_megabytes_per_second, "persistentvolumeclaim", "$1", "PersistentVolumeClaimName", "(.*)")
 ```

{{< /hide >}}
{{< hide class="3" >}}
5. Verify the PowerMax metrics are visible in the OpenShift Console.

   On the OpenShift Console, navigate to Observer and then Metrics, search for PowerMax metrics.

   ### Installing OpenShift Virtualization and Accessing KubeVirt Metrics

User can follow the official guide to [install Openshift Virtualization in OCP cluster](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/virtualization/installing#installing-virt-operator_installing-virt). Once installed, OpenShift Virtualization automatically creates the ServiceMonitor required by Prometheus to scrape KubeVirt metrics.

On the OpenShift Console, navigate to Observer and then Metrics, search for kubevirt metrics. 
User can use PromQL join queries to correlate KubeVirt metrics with CSI storage metrics for advanced insights. For example, for each VM disk, find its allocated size of the underlying PowerMax volume, using the following query:
 

 ```bash
 label_replace(kubevirt_vm_disk_allocated_size_bytes, "Namespace", "$1", "namespace", "(.*)") * on(persistentvolumeclaim, Namespace) group_left(PersistentVolumeName) label_replace(powermax_volume_read_bw_megabytes_per_second, "persistentvolumeclaim", "$1", "PersistentVolumeClaimName", "(.*)")
 ```
{{< /hide >}}
{{< hide class="4" >}}
5. Verify the PowerStore metrics are visible in the OpenShift Console.

   On the OpenShift Console, navigate to Observer and then Metrics, search for PowerStore metrics.

   ### Installing OpenShift Virtualization and Accessing KubeVirt Metrics

User can follow the official guide to [install Openshift Virtualization in OCP cluster](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/virtualization/installing#installing-virt-operator_installing-virt). Once installed, OpenShift Virtualization automatically creates the ServiceMonitor required by Prometheus to scrape KubeVirt metrics.

On the OpenShift Console, navigate to Observer and then Metrics, search for kubevirt metrics. 
User can use PromQL join queries to correlate KubeVirt metrics with CSI storage metrics for advanced insights. For example, for each VM disk, find its allocated size of the underlying PowerStore volume, using the following query:
 

 ```bash
 label_replace(kubevirt_vm_disk_allocated_size_bytes, "Namespace", "$1", "namespace", "(.*)") * on(persistentvolumeclaim, Namespace) group_left(PersistentVolumeName) label_replace(powerstore_volume_read_bw_megabytes_per_second, "persistentvolumeclaim", "$1", "PersistentVolumeClaimName", "(.*)")
 ```
{{< /hide >}}
