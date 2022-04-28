---
title: Deployment
linktitle: Deployment 
weight: 3
description: >
  Dell Container Storage Modules (CSM) for Observability Deployment
---

CSM for Observability can be deployed in one of three ways:  

- [Helm](./helm)
- [CSM for Observability Installer](./online)
- [CSM for Observability Offline Installer](./offline)

## Post Installation Dependencies

The following third-party components are required in the same Kubernetes cluster where CSM for Observability has been deployed:

* [Prometheus](#prometheus)
* [Grafana](#grafana)
* [Other Deployment Methods](#other-deployment-methods)

There are various ways to deploy these components. We recommend following the Helm deployments according to the specifications defined below. 

**Tip**: CSM for Observability must be deployed first. Once the module has been deployed, you can proceed to deploying/configuring Prometheus and Grafana.

### Prometheus

The Prometheus service should be running on the same Kubernetes cluster as the CSM for Observability services. As part of the CSM for Observability deployment, the OpenTelemetry Collector gets deployed. CSM for Observability pushes metrics to the OpenTelemetry Collector where the metrics are consumed by Prometheus. Prometheus must be configured to scrape the metrics data from the OpenTelemetry Collector.

| Supported Version | Image                   | Helm Chart                                                   |
| ----------------- | ----------------------- | ------------------------------------------------------------ |
| 2.34.0           | prom/prometheus:v2.34.0 | [Prometheus Helm chart](https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus) |  

**Note**: It is the user's responsibility to provide persistent storage for Prometheus if they want to preserve historical data.

#### Prometheus Helm Deployment 

Here is a sample minimal configuration for Prometheus. Please note that the configuration below uses insecure skip verify. If you wish to properly configure TLS, you will need to provide a ca_file in the Prometheus configuration. The certificate provided as part of the CSM for Observability deployment should be signed by this same CA. For more information about Prometheus configuration, see [Prometheus configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration).

1. Create a values file named `prometheus-values.yaml`.

    ```yaml
    # prometheus-values.yaml
    alertmanager:
      enabled: false
    nodeExporter:
      enabled: false
    pushgateway:
      enabled: false
    kubeStateMetrics:
      enabled: false
    configmapReload:
      prometheus:
        enabled: false
    server:
      enabled: true
      image:
        repository: quay.io/prometheus/prometheus
        tag: v2.34.0
        pullPolicy: IfNotPresent
      persistentVolume:
        enabled: false
      service:
        type: NodePort
        servicePort: 9090
    extraScrapeConfigs: |
      - job_name: 'karavi-metrics-[CSI_DRIVER]'
        scrape_interval: 5s
        scheme: https
        static_configs:
          - targets: ['otel-collector:8443']
        tls_config:
          insecure_skip_verify: true
   ```

2. If using Rancher, create a ServiceMonitor.

    ```yaml
    apiVersion: monitoring.coreos.com/v1
    kind: ServiceMonitor
    metadata:
      name: otel-collector
      namespace: powerflex
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

3. Add the Prometheus Helm chart repository. 

    On your terminal, run each of the commands below:

    ```terminal
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo add stable https://charts.helm.sh/stable
    helm repo update
    ```

4. Install the Helm chart. 

    On your terminal, run the command below:

    ```terminal
    helm install prometheus prometheus-community/prometheus -n [CSM_NAMESPACE] -f prometheus-values.yaml
    ```

### Grafana

The Grafana dashboards require Grafana to be deployed in the same Kubernetes cluster as CSM for Observability.  Below are the configuration details required to properly set up Grafana to work with CSM for Observability.

| Supported Version | Helm Chart                                                |
| ----------------- | --------------------------------------------------------- |
| 8.5.0      | [Grafana Helm chart](https://github.com/grafana/helm-charts/tree/main/charts/grafana) |

Grafana must be configured with the following data sources/plugins:

| Name                   | Additional Information                                                     |
| ---------------------- | -------------------------------------------------------------------------- |
| Prometheus data source | [Prometheus data source](https://grafana.com/docs/grafana/latest/features/datasources/prometheus/)   |
| Data Table plugin      | [Data Table plugin](https://grafana.com/grafana/plugins/briangann-datatable-panel) |
| Pie Chart plugin       | [Pie Chart plugin](https://grafana.com/grafana/plugins/grafana-piechart-panel)                 |
| SimpleJson data source | [SimpleJson data source](https://grafana.com/grafana/plugins/grafana-simple-json-datasource)                 |

Settings for the Grafana Prometheus data source:

| Setting | Value                     | Additional Information                          |
| ------- | ------------------------- | ----------------------------------------------- |
| Name    | Prometheus                |                                                 |
| Type    | prometheus                |                                                 |
| URL     | http://PROMETHEUS_IP:PORT | The IP/PORT of your running Prometheus instance |
| Access  | Proxy                     |                                                 |

Settings for the Grafana SimpleJson data source:

| Setting             | Value                             |
| ------------------- | --------------------------------- |
| Name                | Karavi-Topology |
| URL                 | Access CSM for Observability Topology service at https://karavi-topology.*namespace*.svc.cluster.local:8443 |
| Skip TLS Verify     | Enabled (If not using CA certificate) |
| With CA Cert        | Enabled (If using CA certificate) |


#### Grafana Helm Deployment

Below are the steps to deploy a new Grafana instance into your Kubernetes cluster:

1. Create a ConfigMap. 

    When using a network that requires a decryption certificate, the Grafana server MUST be configured with the necessary certificate. If no certificate is required, skip to step 2.
    * Create a Config file named `grafana-configmap.yaml` The file should look like this:

    ```yaml
    # grafana-configmap.yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: certs-configmap
      namespace: [CSM_NAMESPACE]
      labels:
        certs-configmap: "1"
    data:
      ca-certificates.crt: |-
        -----BEGIN CERTIFICATE-----
      ReplaceMeWithActualCaCERT=
        -----END CERTIFICATE-----
    ```

    **NOTE**: you need an actual CA Cert for it to work

    On your terminal, run the commands below:

    ```terminal
    kubectl create -f grafana-configmap.yaml
    ```


2. Create a values file.

    Create a Config file named `grafana-values.yaml` The file should look like this:

    ```yaml
    # grafana-values.yaml 
    image:
      repository: grafana/grafana
      tag: 8.5.0
      sha: ""
      pullPolicy: IfNotPresent
    service:
      type: NodePort

    ## Administrator credentials when not using an existing Secret
    adminUser: admin
    adminPassword: admin

    ## Pass the plugins you want to be installed as a list.
    ##
    plugins:
      - grafana-simple-json-datasource
      - briangann-datatable-panel
      - grafana-piechart-panel

    ## Configure grafana datasources
    ## ref: http://docs.grafana.org/administration/provisioning/#datasources
    ##
    datasources:
      datasources.yaml:
        apiVersion: 1
        datasources:
        - name: Karavi-Topology
          type: grafana-simple-json-datasource
          access: proxy
          url: 'https://karavi-topology:8443'
          isDefault: null
          version: 1
          editable: true
          jsonData:
            tlsSkipVerify: true
        - name: Prometheus
          type: prometheus
          access: proxy
          url: 'http://prometheus-server:9090'
          isDefault: null
          version: 1
          editable: true
    testFramework:
      enabled: false
    sidecar:
      datasources:
        enabled: true
      dashboards:
        enabled: true

    ## Additional grafana server CofigMap mounts
    ## Defines additional mounts with CofigMap. CofigMap must be manually created in the namespace.
    extraConfigmapMounts: [] # If you created a ConfigMap on the previous step, delete [] and uncomment the lines below 
    #  - name: certs-configmap
    #    mountPath: /etc/ssl/certs/ca-certificates.crt
    #    subPath: ca-certificates.crt
    #    configMap: certs-configmap
    #    readOnly: true
    ```

3. Add the Grafana Helm chart repository.

    On your terminal, run each of the commands below:

    ```terminal
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo update
    ```

4. Install the Helm chart.

    On your terminal, run the commands below:

    ```terminal
    helm install grafana grafana/grafana -n [CSM_NAMESPACE] -f grafana-values.yaml
    ```

### Other Deployment Methods

- [Grafana Labs Operator Deployment](https://grafana.com/docs/grafana-cloud/kubernetes/prometheus/prometheus_operator/)
- [Rancher Monitoring and Alerting Deployment](https://rancher.com/docs/rancher/v2.6/en/monitoring-alerting/)

## Importing CSM for Observability Dashboards

Once Grafana is properly configured, you can import the pre-built observability dashboards. Log into Grafana and click the + icon in the side menu. Then click Import. From here you can upload the JSON files or paste the JSON text directly into the text area.  Below are the locations of the dashboards that can be imported:

| Dashboard           | Description |
| ------------------- | --------------------------------- |
| [PowerFlex: I/O Performance by Kubernetes Node](https://github.com/dell/karavi-observability/blob/main/grafana/dashboards/powerflex/sdc_io_metrics.json) | Provides visibility into the I/O performance metrics (IOPS, bandwidth, latency) by Kubernetes node |
| [PowerFlex: I/O Performance by Provisioned Volume](https://github.com/dell/karavi-observability/blob/main/grafana/dashboards/powerflex/volume_io_metrics.json) | Provides visibility into the I/O performance metrics (IOPS, bandwidth, latency) by volume |
| [PowerFlex: Storage Pool Consumption By CSI Driver](https://github.com/dell/karavi-observability/blob/main/grafana/dashboards/powerflex/storage_consumption.json) | Provides visibility into the total, used, and available capacity for a storage class and associated underlying storage construct. |
| [PowerStore: I/O Performance by Provisioned Volume](https://github.com/dell/karavi-observability/blob/main/grafana/dashboards/powerstore/volume_io_metrics.json) | *As of Release 0.4.0:* Provides visibility into the I/O performance metrics (IOPS, bandwidth, latency) by volume |
| [CSI Driver Provisioned Volume Topology](https://github.com/dell/karavi-observability/blob/main/grafana/dashboards/topology/topology.json) | Provides visibility into Dell CSI (Container Storage Interface) driver provisioned volume characteristics in Kubernetes correlated with volumes on the storage system. |

## Dynamic Configuration

Some parameters can be configured/updated during runtime without restarting the CSM for Observability services. These parameters will be stored in ConfigMaps that can be updated on the Kubernetes cluster. This will automatically change the settings on the services.  

| ConfigMap | Observability Service | Parameters |
| - | - | - |
| karavi-metrics-powerflex-configmap | karavi-metrics-powerflex | <ul><li>COLLECTOR_ADDR</li><li>PROVISIONER_NAMES</li><li>POWERFLEX_SDC_METRICS_ENABLED</li><li>POWERFLEX_SDC_IO_POLL_FREQUENCY</li><li>POWERFLEX_VOLUME_IO_POLL_FREQUENCY</li><li>POWERFLEX_VOLUME_METRICS_ENABLED</li><li>POWERFLEX_STORAGE_POOL_METRICS_ENABLED</li><li>POWERFLEX_STORAGE_POOL_POLL_FREQUENCY</li><li>POWERFLEX_MAX_CONCURRENT_QUERIES</li><li>LOG_LEVEL</li><li>LOG_FORMAT</li></ul> |
| karavi-metrics-powerstore-configmap | karavi-metrics-powerstore | <ul><li>COLLECTOR_ADDR</li><li>PROVISIONER_NAMES</li><li>POWERSTORE_VOLUME_METRICS_ENABLED</li><li>POWERSTORE_VOLUME_IO_POLL_FREQUENCY</li><li>POWERSTORE_SPACE_POLL_FREQUENCY</li><li>POWERSTORE_ARRAY_POLL_FREQUENCY</li><li>POWERSTORE_FILE_SYSTEM_POLL_FREQUENCY</li><li>POWERSTORE_MAX_CONCURRENT_QUERIES</li><li>LOG_LEVEL</li><li>LOG_FORMAT</li><li>ZIPKIN_URI</li><li>ZIPKIN_SERVICE_NAME</li><li>ZIPKIN_PROBABILITY</li></ul> |
| karavi-topology-configmap | karavi-topology | <ul><li>PROVISIONER_NAMES</li><li>LOG_LEVEL</li><li>LOG_FORMAT</li><li>ZIPKIN_URI</li><li>ZIPKIN_SERVICE_NAME</li><li>ZIPKIN_PROBABILITY</li></ul> |

To update any of these settings, run the following command on the Kubernetes cluster then save the updated ConfigMap data.

```console
kubectl edit configmap [CONFIG_MAP_NAME] -n [CSM_NAMESPACE]
```

## Tracing

CSM for Observability is instrumented to report trace data to [Zipkin](https://zipkin.io/). This helps gather timing data needed to troubleshoot latency problems with CSM for Observability. Follow the instructions below to enable the reporting of trace data:

1. Deploy a Zipkin instance in the CSM namespace and expose the service as NodePort for external access.

    ```console
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: zipkin
      labels:
        app.kubernetes.io/name: zipkin
        app.kubernetes.io/instance: zipkin-instance
        app.kubernetes.io/managed-by: zipkin-service
    spec:
      replicas: 1
      selector:
        matchLabels:
          app.kubernetes.io/name: zipkin
          app.kubernetes.io/instance: zipkin-instance
      template:
        metadata:
          labels:
            app.kubernetes.io/name: zipkin
            app.kubernetes.io/instance: zipkin-instance
        spec:
          containers:
            - name: zipkin
              image: "openzipkin/zipkin"
              imagePullPolicy: IfNotPresent
              env:
              - name: "STORAGE_TYPE"
                value: "mem"
              - name: "TRANSPORT_TYPE"
                value: "http"

    ---

    apiVersion: v1
    kind: Service
    metadata:
      name: zipkin
      labels:
        app.kubernetes.io/name: zipkin
        app.kubernetes.io/instance: zipkin-instance
        app.kubernetes.io/managed-by: zipkin-service
    spec:
      ports:
        - port: 9411
          targetPort: 9411
          protocol: TCP
      type: "NodePort"
      selector:
        app.kubernetes.io/name: zipkin
        app.kubernetes.io/instance: zipkin-instance
    ```

2. Add the Zipkin URI to the CSM for Observability ConfigMaps. Based on the manifest above, Zipkin will be running on port 9411.

    __Note__: Zipkin tracing is currently not supported for the collection of PowerFlex metrics. 

    Update the ConfigMaps from the [table above](#dynamic-configuration). Here is an example updating the karavi-topology-configmap based on the deployment manifest above.
   
    ```console
    kubectl edit configmap/karavi-topology-configmap -n [CSM_NAMESPACE]
    ```
    
    Update the ZIPKIN_URI and ZIPKIN_PROBABILITY values and save the ConfigMap.
   
    ```console
    ZIPKIN_URI: "http://zipkin:9411/api/v2/spans"
    ZIPKIN_SERVICE_NAME: "karavi-topology"
    ZIPKIN_PROBABILITY: "1.0"
    ```
    
    Once the ConfigMaps are updated, the changes will automatically be applied and tracing can be seen by accessing Zipkin on the exposed port.

## Updating Storage System Credentials

If the storage system credentials have been updated in the relevant CSI Driver, CSM for Observability must be updated with those new credentials as follows:

### When CSM for Observability uses the Authorization module

In this case, all storage system requests made by CSM for Observability will be routed through the Authorization module. The following must be performed:

#### Update the Authorization Module Token

1. Delete the current `proxy-authz-tokens` Secret from the CSM namespace.
    ```console
    $ kubectl delete secret proxy-authz-tokens -n [CSM_NAMESPACE]
    ```

2. Copy the `proxy-authz-tokens` Secret from a CSI Driver to the CSM namespace.
    ```console
    $ kubectl get secret proxy-authz-tokens -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSM_CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
    ```

#### Update Storage Systems
If the list of storage systems managed by a Dell CSI Driver have changed, the following steps can be performed to update CSM for Observability to reference the updated systems:

1. Delete the current `karavi-authorization-config` Secret from the CSM namespace.
    ```console
    $ kubectl delete secret proxy-authz-tokens -n [CSM_NAMESPACE]
    ```

2. Copy the `karavi-authorization-config` Secret from the CSI Driver namespace to CSM for Observability namespace.
    ```console
    $ kubectl get secret karavi-authorization-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSM_CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
    ```

### When CSM for Observability does not use the Authorization module

In this case all storage system requests made by CSM for Observability will not be routed through the Authorization module. The following must be performed:

#### CSI Driver for Dell PowerFlex

1. Delete the current `vxflexos-config` Secret from the CSM namespace.
    ```console
    $ kubectl delete secret vxflexos-config -n [CSM_NAMESPACE]
    ```

2. Copy the `vxflexos-config` Secret from the CSI Driver for Dell PowerFlex namespace to the CSM namespace.
    ```console
    $ kubectl get secret vxflexos-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
    ```

### CSI Driver for Dell PowerStore

1. Delete the current `powerstore-config` Secret from the CSM namespace.
    ```console
    $ kubectl delete secret powerstore-config -n [CSM_NAMESPACE]
    ```

2. Copy the `powerstore-config` Secret from the CSI Driver for Dell PowerStore namespace to the CSM namespace.
    ```console
    $ kubectl get secret powerstore-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
    ```
