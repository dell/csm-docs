---
title: Observability
linktitle: Observability
description: >
  Installing Observability via Container Storage Modules Operator
---

1. Make sure the Cert-Manager is deployed and configured ont he Openshift cluster

2. Make sure the user workload monitoring is configured on the OpenShift cluster 

3. Create a Project for deploying Observability Module
  
   ```bash
   oc new-project karavi 
   ```

4. Enable Observability module in the CSM 

   ```yaml
   apiVersion: storage.dell.com/v1
   kind: ContainerStorageModule
   metadata:
     name: vxflexos
     namespace: vxflexos
   spec:
     driver:
       csiDriverType: "powerflex"
       configVersion: v2.13.0
     module:
     - name: observability
       enabled: true
       components:
       - name: topology
         enabled: true
       - name: otel-collector
         enabled: true
       - name: metrics-powerflex
         enabled: true
      ``` 

5. Create Service Monitor to scrap the Observability module by the OpenShift Observability. 

   ```yaml
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
    ```