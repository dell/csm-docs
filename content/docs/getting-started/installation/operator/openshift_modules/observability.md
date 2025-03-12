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

3. Create a Project for deploying Observability Module 
   
 

   Use this command to create new project. You must use the project name as karavi  
   ```bash
   oc new-project karavi 
   ```

4. Enable Observability module in the CSM  
   

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
       configVersion: v2.13.0
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

    ```terminal
    oc get pod -n karavi

    NAME                                        READY   STATUS    RESTARTS   AGE
    karavi-metrics-{{Var}}-69855dbdd5-5mshq   1/1     Running   0          2m54s
    karavi-topology-b7c9f6fc7-zk7l8             1/1     Running   0          2m55s
    otel-collector-b496d8c4d-gp6zz              2/2     Running   0          2m55s 


    ``` 
    
   <br>
  
   Verify the Observability Servcies. 

    ```terminal 
    oc get svc -n karavi
    NAME                           TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)              AGE
    karavi-metrics-{{Var}}      ClusterIP   172.30.169.86    <none>        2222/TCP             3m29s
    karavi-topology                ClusterIP   172.30.66.155    <none>        8443/TCP             3m29s
    otel-collector                 ClusterIP   172.30.127.237   <none>        55680/TCP,8443/TCP   3m29s 
    ``` 

<br> 

5. Create Service Monitor to scrap the Observability module by the OpenShift Observability. 

   Use this commend to create the ServiceMonitor. 

   ```bash 
   oc apply -f smon-otel-collector.yaml
   ```

   <br> 
   
   Example:
   ```yaml 
   cat <<EOF> smon-otel-collector.yaml
   apiVersion: monitoring.coreos.com/v1
   kind: ServiceMonitor
   metadata:
     name: otel-collector
     namespace: karavi
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
    oc get smon -n karavi
    NAME             AGE
    otel-collector   44h 
    ``` 

6. Verify the PowerFlex metrics are visible in the OpenShift Console. 

   On the OpenShift Console, navigate to Observer and then Metrics, search for PowerFlex metric.



    

