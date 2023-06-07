---
title: Helm
linktitle: Helm
weight: 3
description: >
  Dell Container Storage Modules (CSM) for Observability Helm deployment
---

The Container Storage Modules (CSM) for Observability Helm chart bootstraps an Observability deployment on a Kubernetes cluster using the Helm package manager.

## Prerequisites

- Helm 3.3
- The deployment of one or more [supported](../../#supported-csi-drivers) Dell CSI drivers

## Install the CSM for Observability Helm Chart
**Steps**
1. Create a namespace where you want to install the module 
   ```bash
   kubectl create namespace karavi
   ```

2. Install cert-manager CRDs 
   ```bash

   kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.10.0/cert-manager.crds.yaml
   ```

3. Add the Dell Helm Charts repo 
   ```bash
     helm repo add dell https://dell.github.io/helm-charts
   ```

4. Copy only the deployed CSI driver entities to the Observability namespace

    ### PowerFlex

    1. Copy the config Secret from the CSI PowerFlex namespace into the CSM for Observability namespace:

       ```bash
       
       kubectl get secret vxflexos-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

       If the CSI driver secret name is not the default `vxflexos-config`, please use the following command to copy secret:

       ```bash
       
       kubectl get secret [VXFLEXOS-CONFIG] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [VXFLEXOS-CONFIG]/name: vxflexos-config/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

    If [CSM for Authorization is enabled](../../../authorization/deployment/#configuring-a-dell-csi-driver-with-csm-for-authorization) for CSI PowerFlex, perform the following steps:

    2. Copy the driver configuration parameters ConfigMap from the CSI PowerFlex namespace into the CSM for Observability namespace:
    
       ```bash
       
       kubectl get configmap vxflexos-config-params -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```
   
       If the CSI driver configmap name is not the default `vxflexos-config-params`, please use the following command to copy configmap:

       ```bash
       
       kubectl get configmap [VXFLEXOS-CONFIG-PARAMS] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [VXFLEXOS-CONFIG-PARAMS]/name: vxflexos-config-params/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

    3. Copy the `karavi-authorization-config`, `proxy-server-root-certificate`, `proxy-authz-tokens` Secret from the CSI PowerFlex namespace into the CSM for Observability namespace:

        ```bash
        
        kubectl get secret karavi-authorization-config proxy-server-root-certificate proxy-authz-tokens -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
        ```

    ### PowerStore

    1. Copy the config Secret from the CSI PowerStore namespace into the CSM for Observability namespace:

       ```bash
       
       kubectl get secret powerstore-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

       If the CSI driver secret name is not the default `powerstore-config`, please use the following command to copy secret:  

       ```bash
       
       kubectl get secret [POWERSTORE-CONFIG] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [POWERSTORE-CONFIG]/name: powerstore-config/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```
   
    ### PowerScale

    1. Copy the config Secret from the CSI PowerScale namespace into the CSM for Observability namespace:

       ```bash
       
       kubectl get secret isilon-creds -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```
   
       If the CSI driver secret name is not the default `isilon-creds`, please use the following command to copy secret:  

       ```bash
       
       kubectl get secret [ISILON-CREDS] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [ISILON-CREDS]/name: isilon-creds/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

    If [CSM for Authorization is enabled](../../../authorization/deployment/#configuring-a-dell-csi-driver-with-csm-for-authorization) for CSI PowerScale, perform these steps:

    2. Copy the driver configuration parameters ConfigMap from the CSI PowerScale namespace into the CSM for Observability namespace:

       ```bash

       kubectl get configmap isilon-config-params -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```
   
       If the CSI driver configmap name is not the default `isilon-config-params`, please use the following command to copy configmap:

       ```bash
       
       kubectl get configmap [ISILON-CONFIG-PARAMS] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [ISILON-CONFIG-PARAMS]/name: isilon-config-params/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

    3. Copy the `karavi-authorization-config`, `proxy-server-root-certificate`, `proxy-authz-tokens` Secret from the CSI PowerScale namespace into the CSM for Observability namespace:

       ```bash
       
       kubectl get secret karavi-authorization-config proxy-server-root-certificate proxy-authz-tokens -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | sed 's/name: karavi-authorization-config/name: isilon-karavi-authorization-config/' | sed 's/name: proxy-server-root-certificate/name: isilon-proxy-server-root-certificate/' | sed 's/name: proxy-authz-tokens/name: isilon-proxy-authz-tokens/' | kubectl create -f -
       ```  

    ### PowerMax

    1. Copy the configmap `powermax-reverseproxy-config` from the CSI Driver for Dell PowerMax namespace to the CSM namespace.  
       __Note:__ Observability for PowerMax works only with [CSI PowerMax driver with Proxy in StandAlone mode](../../../csidriver/installation/helm/powermax/#csi-powermax-driver-with-proxy-in-standalone-mode).  

       ```bash

       kubectl get configmap powermax-reverseproxy-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```
   
       If the CSI driver configmap name is not the default `powermax-reverseproxy-config`, please use the following command to copy configmap:

       ```bash
       
       kubectl get configmap [POWERMAX-REVERSEPROXY-CONFIG] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [POWERMAX-REVERSEPROXY-CONFIG]/name: powermax-reverseproxy-config/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

    2. Copy the secrets in `powermax-reverseproxy-config` from the CSI Driver for Dell PowerMax namespace to the CSM namespace.  
       ```console

       for secret in $(kubectl get configmap powermax-reverseproxy-config -n [CSI_DRIVER_NAMESPACE] -o jsonpath="{.data.config\.yaml}" | grep arrayCredentialSecret | awk 'BEGIN{FS=":"}{print $2}' | uniq)
       do
          kubectl get secret $secret -n [CSI_DRIVER_NAMESPACE] -o yaml | sed "s/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/" | kubectl create -f -
       done
       ```
       
       If the CSI driver configmap name is not the default `powermax-reverseproxy-config`, please use the following command to copy secrets:
       ```console

       for secret in $(kubectl get configmap [POWERMAX-REVERSEPROXY-CONFIG] -n [CSI_DRIVER_NAMESPACE] -o jsonpath="{.data.config\.yaml}" | grep arrayCredentialSecret | awk 'BEGIN{FS=":"}{print $2}' | uniq)
       do
          kubectl get secret $secret -n [CSI_DRIVER_NAMESPACE] -o yaml | sed "s/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/" | kubectl create -f -
       done
       ```

       If [CSM for Authorization is enabled](../../../authorization/deployment/#configuring-a-dell-csi-driver-with-csm-for-authorization) for CSI PowerMax, perform these steps:

    3. Copy the driver configuration parameters ConfigMap from the CSI PowerMax namespace into the CSM for Observability namespace:

       ```bash

       kubectl get configmap powermax-config-params -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```
   
       If the CSI driver configmap name is not the default `powermax-config-params`, please use the following command to copy configmap:  

       ```bash
       
       kubectl get configmap [POWERMAX-CONFIG-PARAMS] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [POWERMAX-CONFIG-PARAMS]/name: powermax-config-params/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

    4. Copy the `karavi-authorization-config`, `proxy-server-root-certificate`, `proxy-authz-tokens` Secret from the CSI PowerMax namespace into the CSM for Observability namespace:

       ```bash
       
       kubectl get secret karavi-authorization-config proxy-server-root-certificate proxy-authz-tokens -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | sed 's/name: karavi-authorization-config/name: powermax-karavi-authorization-config/' | sed 's/name: proxy-server-root-certificate/name: powermax-proxy-server-root-certificate/' | sed 's/name: proxy-authz-tokens/name: powermax-proxy-authz-tokens/' | kubectl create -f -
       ``` 


    5. Configure the [parameters](#configuration) and install the CSM for Observability Helm Chart

       A default values.yaml file is located [here](https://github.com/dell/helm-charts/blob/main/charts/karavi-observability/values.yaml) that can be used for installation. This can be copied into a file named `myvalues.yaml` and either used as is or modified accordingly. 

       __Note:__ 
       - The default `values.yaml` is configured to deploy the CSM for Observability Topology service on install.
       - If CSM for Authorization is enabled for CSI PowerFlex, the `karaviMetricsPowerflex.authorization` parameters must be properly configured in your values file for CSM Observability. 
       - If CSM for Authorization is enabled for CSI PowerScale, the `karaviMetricsPowerscale.authorization` parameters must be properly configured in your values file for CSM Observability.
       - If CSM for Authorization is enabled for CSI PowerMax, the `karaviMetricsPowerMax.authorization` parameters must be properly configured in your values file for CSM Observability.

       ```console

       helm install karavi-observability dell/karavi-observability -n [CSM_NAMESPACE] -f myvalues.yaml
       ```

       Alternatively, you can specify each parameter using the '--set key=value[,key=value]' and/or '--set-file key=value[,key=value] arguments to 'helm install'. For example:

       ```console

       helm install karavi-observability dell/karavi-observability -n [CSM_NAMESPACE] \
        --set-file karaviTopology.certificateFile=<location-of-karavi-topology-certificate-file> \
        --set-file karaviTopology.privateKeyFile=<location-of-karavi-topology-private-key-file> \
        --set-file otelCollector.certificateFile=<location-of-otel-collector-certificate-file> \
        --set-file otelCollector.privateKeyFile=<location-of-otel-collector-private-key-file>
       ```

## Configuration

The following table lists the configurable parameters of the CSM for Observability Helm chart and their default values.

| Parameter | Description | Default |
| - | - | - |
| `karaviTopology.image` | Location of the csm-topology Docker image | `dellemc/csm-topology:v1.0` |
| `karaviTopology.enabled` | Enable the CSM for Observability Topology service | `true` |
| `karaviTopology.provisionerNames` | Provisioner Names used to filter the Persistent Volumes created on the Kubernetes cluster (must be a comma-separated list) | ` csi-vxflexos.dellemc.com` |
| `karaviTopology.service.type` | Kubernetes service type | `ClusterIP` |
| `karaviTopology.certificateFile` | Optional valid CA public certificate file that will be used to deploy the Topology service. Must use domain name 'karavi-topology'. | |
| `karaviTopology.privateKeyFile` | Optional public certificate's associated private key file that will be used to deploy the Topology service. Must use domain name 'karavi-topology'. | |
| `karaviTopology.logLevel` | Output logs that are at or above the given log level severity (Valid values: TRACE, DEBUG, INFO, WARN, ERROR, FATAL, PANIC) | `INFO` |
| `karaviTopology.logFormat` | Output logs in the specified format (Valid values: text, json) | `text` |
| `otelCollector.certificateFile` | Optional valid CA public certificate file that will be used to deploy the OpenTelemetry Collector. Must use domain name 'otel-collector'. | |
| `otelCollector.privateKeyFile` | Optional public certificate's associated private key file that will be used to deploy the OpenTelemetry Collector. Must use domain name 'otel-collector'. |  |                                                   
| `otelCollector.service.type` | Kubernetes service type | `ClusterIP` |
| `karaviMetricsPowerflex.image` |  CSM Metrics for PowerFlex Service image | `dellemc/csm-metrics-powerflex:v1.0` |
| `karaviMetricsPowerflex.enabled` | Enable CSM Metrics for PowerFlex service | `true` |
| `karaviMetricsPowerflex.collectorAddr` | Metrics Collector accessible from the Kubernetes cluster | `otel-collector:55680`  |
| `karaviMetricsPowerflex.provisionerNames` | Provisioner Names used to filter for determining PowerFlex SDC nodes( Must be a Comma-separated list) | ` csi-vxflexos.dellemc.com` |
| `karaviMetricsPowerflex.sdcPollFrequencySeconds` | The polling frequency (in seconds) to gather SDC metrics | `10` |
| `karaviMetricsPowerflex.volumePollFrequencySeconds` | The polling frequency (in seconds) to gather volume metrics | `10` |
| `karaviMetricsPowerflex.storageClassPoolPollFrequencySeconds` | The polling frequency (in seconds) to gather storage class/pool metrics | `10` |
| `karaviMetricsPowerflex.concurrentPowerflexQueries` | The number of simultaneous metrics queries to make to Powerflex(MUST be less than 10; otherwise, several request errors from Powerflex will ensue. | `10` |
| `karaviMetricsPowerflex.authorization.enabled` | [Authorization](../../../authorization) is an optional feature to apply credential shielding of the backend PowerFlex. | `false` |
| `karaviMetricsPowerflex.authorization.proxyHost` | Hostname of the csm-authorization server. |  |
| `karaviMetricsPowerflex.authorization.skipCertificateValidation` | A boolean that enables/disables certificate validation of the csm-authorization server. |  |
| `karaviMetricsPowerflex.sdcMetricsEnabled` | Enable PowerFlex SDC Metrics Collection | `true` |
| `karaviMetricsPowerflex.volumeMetricsEnabled` | Enable PowerFlex Volume Metrics Collection | `true` |
| `karaviMetricsPowerflex.storageClassPoolMetricsEnabled` | Enable PowerFlex  Storage Class/Pool Metrics Collection | `true` |
| `karaviMetricsPowerflex.endpoint` | Endpoint for pod leader election | `karavi-metrics-powerflex` |
| `karaviMetricsPowerflex.service.type` | Kubernetes service type | `ClusterIP` |
| `karaviMetricsPowerflex.logLevel` | Output logs that are at or above the given log level severity (Valid values: TRACE, DEBUG, INFO, WARN, ERROR, FATAL, PANIC) | `INFO`|
| `karaviMetricsPowerflex.logFormat` | Output logs in the specified format (Valid values: text, json) | `text`|
| `karaviMetricsPowerstore.image` |  CSM Metrics for PowerStore Service image | `dellemc/csm-metrics-powerstore:v1.0`|
| `karaviMetricsPowerstore.enabled` | Enable CSM Metrics for PowerStore service | `true` |
| `karaviMetricsPowerstore.collectorAddr` | Metrics Collector accessible from the Kubernetes cluster | `otel-collector:55680` |
| `karaviMetricsPowerstore.provisionerNames` | Provisioner Names used to filter for determining PowerStore volumes (must be a Comma-separated list) | `csi-powerstore.dellemc.com` |
| `karaviMetricsPowerstore.volumePollFrequencySeconds` | The polling frequency (in seconds) to gather volume metrics | `10` |
| `karaviMetricsPowerstore.concurrentPowerstoreQueries` | The number of simultaneous metrics queries to make to PowerStore (must be less than 10; otherwise, several request errors from PowerStore will ensue.) | `10` |
| `karaviMetricsPowerstore.volumeMetricsEnabled` | Enable PowerStore Volume Metrics Collection | `true` |
| `karaviMetricsPowerstore.endpoint` | Endpoint for pod leader election | `karavi-metrics-powerstore` |
| `karaviMetricsPowerstore.service.type` | Kubernetes service type | `ClusterIP` |
| `karaviMetricsPowerstore.logLevel` | Output logs that are at or above the given log level severity (Valid values: TRACE, DEBUG, INFO, WARN, ERROR, FATAL, PANIC) | `INFO`|
| `karaviMetricsPowerstore.logFormat` | Output logs in the specified format (Valid values: text, json) | `text` |
| `karaviMetricsPowerstore.zipkin.uri` | URI of a Zipkin instance where tracing data can be forwarded | |
| `karaviMetricsPowerstore.zipkin.serviceName` | Service name used for Zipkin tracing data | `metrics-powerstore`|
| `karaviMetricsPowerstore.zipkin.probability` | Percentage of trace information to send to Zipkin (Valid range: 0.0 to 1.0) | `0` |
| `karaviMetricsPowerscale.image` |  CSM Metrics for PowerScale Service image | `dellemc/csm-metrics-powerscale:v1.0`|
| `karaviMetricsPowerscale.enabled` | Enable CSM Metrics for PowerScale service | `true` |
| `karaviMetricsPowerscale.collectorAddr` | Metrics Collector accessible from the Kubernetes cluster | `otel-collector:55680` |
| `karaviMetricsPowerscale.provisionerNames` | Provisioner Names used to filter for determining PowerScale volumes (must be a Comma-separated list) | `csi-isilon.dellemc.com` |
| `karaviMetricsPowerscale.capacityMetricsEnabled` | Enable PowerScale capacity metric Collection | `true` |
| `karaviMetricsPowerscale.performanceMetricsEnabled` | Enable PowerScale performance metric Collection | `true` |
| `karaviMetricsPowerscale.clusterCapacityPollFrequencySeconds` | The polling frequency (in seconds) to gather cluster capacity metrics | `30` |
| `karaviMetricsPowerscale.clusterPerformancePollFrequencySeconds` | The polling frequency (in seconds) to gather cluster performance metrics | `20` |
| `karaviMetricsPowerscale.quotaCapacityPollFrequencySeconds` | The polling frequency (in seconds) to gather volume capacity metrics | `30` |
| `karaviMetricsPowerscale.concurrentPowerscaleQueries` | The number of simultaneous metrics queries to make to PowerScale(MUST be less than 10; otherwise, several request errors from PowerScale will ensue.) | `10` |
| `karaviMetricsPowerscale.endpoint` | Endpoint for pod leader election | `karavi-metrics-powerscale` |
| `karaviMetricsPowerscale.service.type` | Kubernetes service type | `ClusterIP` |
| `karaviMetricsPowerscale.logLevel` | Output logs that are at or above the given log level severity (Valid values: TRACE, DEBUG, INFO, WARN, ERROR, FATAL, PANIC) | `INFO`|
| `karaviMetricsPowerscale.logFormat` | Output logs in the specified format (Valid values: text, json) | `text` |
| `karaviMetricsPowerscale.isiClientOptions.isiSkipCertificateValidation` | Skip OneFS API server's certificates | `true` |
| `karaviMetricsPowerscale.isiClientOptions.isiAuthType` | 0 to enable session-based Authentication; 1 to enables basic Authentication | `1` |
| `karaviMetricsPowerscale.isiClientOptions.isiLogVerbose` | Decide High/Medium/Low content of the OneFS REST API message | `0` |
| `karaviMetricsPowerscale.authorization.enabled` | [Authorization](../../../authorization) is an optional feature to apply credential shielding of the backend PowerScale. | `false` |
| `karaviMetricsPowerscale.authorization.proxyHost` | Hostname of the csm-authorization server. |  |
| `karaviMetricsPowerscale.authorization.skipCertificateValidation` | A boolean that enables/disables certificate validation of the csm-authorization server. |  |
| `karaviMetricsPowerMax.capacityMetricsEnabled` | Enable PowerMax capacity metric Collection | `true` |
| `karaviMetricsPowerMax.performanceMetricsEnabled` | Enable PowerMax performance metric Collection | `true` |
| `karaviMetricsPowerMax.capacityPollFrequencySeconds` | The polling frequency (in seconds) to gather capacity metrics | `20` |
| `karaviMetricsPowerMax.performancePollFrequencySeconds` | The polling frequency (in seconds) to gather performance metrics | `20` |
| `karaviMetricsPowerMax.concurrentPowerMaxQueries` | The number of simultaneous metrics queries to make to PowerMax (MUST be less than 10; otherwise, several request errors from PowerMax will ensue.) | `10` |
| `karaviMetricsPowerMax.authorization.enabled` | [Authorization](../../../authorization) is an optional feature to apply credential shielding of the backend PowerMax. | `false` |
| `karaviMetricsPowerMax.authorization.proxyHost` | Hostname of the csm-authorization server. |  |
| `karaviMetricsPowerMax.authorization.skipCertificateValidation` | A boolean that enables/disables certificate validation of the csm-authorization server. |  |
