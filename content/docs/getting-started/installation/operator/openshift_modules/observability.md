---
title: Observability
linktitle: Observability
description: >
  Installing Observability via Container Storage Modules Operator
---

1. Verify the Cert-Manager is deployed and configured on the OpenShift Cluster. Please review the Red Hat documentation for the procedure.

<br>

2. Verify the user workload monitoring is enabled and configured on the OpenShift Cluster. Please review Red Hat documentation for the procedure to configure user workload monitoring on the OpenShift Cluster. 

<br>

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
       configVersion: {{< version-docs key="PFlex-latestVersion" >}}
     module:
     - name: observability
       enabled: true
       components:
       - name: topology
         enabled: true
       - name: otel-collector
         enabled: true
       - name: metrics-{{Var}}
         enabled: true
   EOF
   ```

    Verify the Observability Pods are created. 
<ol> 
{{< hide class="1" >}}

```terminal
oc get pod -n isilon

NAME                                         READY   STATUS    RESTARTS   AGE
karavi-metrics-powerscale-69855dbdd5-5mshq   1/1     Running   0          2m54s
karavi-topology-b7c9f6fc7-zk7l8              1/1     Running   0          2m55s
otel-collector-b496d8c4d-gp6zz               2/2     Running   0          2m55s 
```
{{< /hide >}}
</ol>
<ol> 
{{< hide class="2" >}}

```terminal
oc get pod -n vxflexos

NAME                                         READY   STATUS    RESTARTS   AGE
karavi-metrics-powerflex-69855dbdd5-5mshq    1/1     Running   0          2m54s
karavi-topology-b7c9f6fc7-zk7l8              1/1     Running   0          2m55s
otel-collector-b496d8c4d-gp6zz               2/2     Running   0          2m55s 


```
{{< /hide >}}
</ol> 

   <br>
   
    

<ol>

Verify the Observability Services.

{{< hide class="1" >}}

```terminal 
oc get svc -n isilon
NAME                           TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)              AGE
karavi-metrics-powerscale      ClusterIP   172.30.169.86    <none>        2222/TCP             3m29s
karavi-topology                ClusterIP   172.30.66.155    <none>        8443/TCP             3m29s
otel-collector                 ClusterIP   172.30.127.237   <none>        55680/TCP,8443/TCP   3m29s 
``` 

{{< /hide >}} 

</ol> 

<ol>
{{< hide class="2" >}}

 ```terminal 
 oc get svc -n vxflexos
 NAME                           TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)              AGE
 karavi-metrics-powerflex       ClusterIP   172.30.169.86    <none>        2222/TCP             3m29s
 karavi-topology                ClusterIP   172.30.66.155    <none>        8443/TCP             3m29s
 otel-collector                 ClusterIP   172.30.127.237   <none>        55680/TCP,8443/TCP   3m29s 
 ``` 

{{< /hide >}}
</ol>

<br> 

5. Create Service Monitor to scrap the Observability module by the OpenShift Observability. 

   Use this command to create the ServiceMonitor. 

   ```bash 
   oc apply -f smon-otel-collector.yaml
   ```

   <br> 
   
   Example:
   <ol>
   {{< hide class="1" >}}
   ```yaml 
   cat <<EOF> smon-otel-collector.yaml
   apiVersion: monitoring.coreos.com/v1
   kind: ServiceMonitor
   metadata:
     name: otel-collector
     namespace: isilon
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
    {{< /hide >}} 
    </ol>
    
       <ol>
   {{< hide class="2" >}}
   ```yaml 
   cat <<EOF> smon-otel-collector.yaml
   apiVersion: monitoring.coreos.com/v1
   kind: ServiceMonitor
   metadata:
     name: otel-collector
     namespace: vxflexos
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
    {{< /hide >}} 
    </ol>

   Verify the ServiceMonitor is created. 

  <ol>
  {{< hide class="1" >}}
   ```yaml 
    ```terminal
    oc get smon -n isilon
    NAME             AGE
    otel-collector   44h 
    ``` 
  {{< /hide >}} 
  </ol>

  <ol>
  {{< hide class="1" >}}
   ```yaml 
    ```terminal
    oc get smon -n vxflexos
    NAME             AGE
    otel-collector   44h 
    ``` 
  {{< /hide >}} 
  </ol>
  
6. Verify the PowerFlex metrics are visible in the OpenShift Console. 

   On the OpenShift Console, navigate to Observer and then Metrics, search for PowerFlex metric.
