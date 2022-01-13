---
title: Helm
linktitle: Helm
weight: 3
description: >
  Dell EMC Container Storage Modules (CSM) for Observability Helm deployment
---

The Container Storage Modules (CSM) for Observability Helm chart bootstraps an Observability deployment on a Kubernetes cluster using the Helm package manager.

## Prerequisites

- A [supported](../../../csidriver/#features-and-capabilities) CSI Driver is deployed 
- The cert-manager CustomResourceDefinition resources are created.

    ```console
    $ kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.5.3/cert-manager.crds.yaml
    ```

## Copy the CSI Driver Entities

Copy the config Secret from the Dell CSI Driver namespace into the namespace where CSM for Observability is deployed.

### PowerFlex

```console
$ kubectl get secret vxflexos-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

If CSM-Authorization is enabled, perform the following steps.

Copy the driver configuration parameters ConfigMap into the namespace where CSM for Observability is deployed.

```
$ kubectl get configmap vxflexos-config-params -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

Create the `karavi-authorization-config` Secret by following step 2 in [Configuring a Dell EMC CSI Driver](../../../authorization/deployment/#configuring-a-dell-emc-csi-driver) but use the [CSM_NAMESPACE].

Create the `proxy-server-root-certificate` Secret by following step 3 in [Configuring a Dell EMC CSI Driver](../../../authorization/deployment#configuring-a-dell-emc-csi-driver) but use the [CSM_NAMESPACE].

Generate a token and apply it to the [CSM_NAMESPACE] by following [Generate a Token](../../../authorization/deployment/#generate-a-token).

__Note__: The target namespace must exist before executing this command.

### PowerStore

```console
$ kubectl get secret powerstore-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
```

__Note__: The target namespace must exist before executing this command.

## Add the Repo

```console
$ helm repo add dell https://dell.github.io/helm-charts
```

## Installing the Chart

```console
$ helm install karavi-observability dell/karavi-observability -n [CSM_NAMESPACE] --create-namespace
```

The [configuration](#configuration) section below lists all the parameters that can be configured during installation

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
| `karaviMetricsPowerstore.concurrentPowerflexQueries` | The number of simultaneous metrics queries to make to PowerStore (must be less than 10; otherwise, several request errors from PowerStore will ensue.) | `10` |
| `karaviMetricsPowerstore.volumeMetricsEnabled` | Enable PowerStore Volume Metrics Collection | `true` |
| `karaviMetricsPowerstore.endpoint` | Endpoint for pod leader election | `karavi-metrics-powerstore` |
| `karaviMetricsPowerstore.service.type` | Kubernetes service type | `ClusterIP` |
| `karaviMetricsPowerstore.logLevel` | Output logs that are at or above the given log level severity (Valid values: TRACE, DEBUG, INFO, WARN, ERROR, FATAL, PANIC) | `INFO`|
| `karaviMetricsPowerstore.logFormat` | Output logs in the specified format (Valid values: text, json) | `text` |
| `karaviMetricsPowerstore.zipkin.uri` | URI of a Zipkin instance where tracing data can be forwarded | |
| `karaviMetricsPowerstore.zipkin.serviceName` | Service name used for Zipkin tracing data | `metrics-powerstore`|
| `karaviMetricsPowerstore.zipkin.probability` | Percentage of trace information to send to Zipkin (Valid range: 0.0 to 1.0) | `0` |


Specify each parameter using the '--set key=value[,key=value]' and/or '--set-file key=value[,key=value] arguments to 'helm install'. For example:

```console
$ helm install karavi-observability dell/karavi-observability -n [CSM_NAMESPACE] --create-namespace \
    --set-file karaviTopology.certificateFile=<location-of-karavi-topology-certificate-file> \
    --set-file karaviTopology.privateKeyFile=<location-of-karavi-topology-private-key-file> \
    --set-file otelCollector.certificateFile=<location-of-otel-collector-certificate-file> \
    --set-file otelCollector.privateKeyFile=<location-of-otel-collector-private-key-file>
```

Alternatively, a YAML file that specifies the values for the above parameters can be provided while installing the chart. For example:

```console
$ helm install karavi-observability dell/karavi-observability -n [CSM_NAMESPACE] --create-namespace -f values.yaml
 ```

__Note__: You can use the default [values.yaml](https://github.com/dell/helm-charts/blob/main/charts/karavi-observability/values.yaml)