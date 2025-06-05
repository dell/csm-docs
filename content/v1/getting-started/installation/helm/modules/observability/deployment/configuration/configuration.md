--- 

--- 

5. Configure the [parameters](#configuration) and install the CSM for Observability Helm Chart

   A default values.yaml file is located [here](https://github.com/dell/helm-charts/blob/main/charts/karavi-observability/values.yaml) that can be used for installation. This can be copied into a file named `myvalues.yaml` and either used as is or modified accordingly.

   __Note:__
{{< hide id="0">}}- The default `values.yaml` deploys the CSM for Observability Topology service.{{< /hide >}}
{{< hide id="1">}}- For CSI PowerFlex with Authorization, configure `karaviMetricsPowerflex.authorization` in `myvalues.yaml`.{{< /hide >}}
{{< hide id="2">}}- For CSI PowerScale with Authorization, configure `karaviMetricsPowerscale.authorization` in `myvalues.yaml`.{{< /hide >}}
{{< hide id="3">}}- For CSI PowerMax with Authorization, configure `karaviMetricsPowerMax.authorization` in `myvalues.yaml`{{< /hide >}}

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

The following table lists the configurable parameters of the Container Storage Modules for Observability Helm chart and their default values.

**Topology:** 

| Parameter | Description | Default |
| - | - | - |
| `karaviTopology.image` | Location of the csm-topology Container image | `quay.io/dell/container-storage-modules/csm-topology:{{< version-v1 key="Observability_csm_topology_image" >}}` |
| `karaviTopology.enabled` | Enable the CSM for Observability Topology service | `true` |
| `karaviTopology.provisionerNames` | Provisioner Names used to filter the Persistent Volumes created on the Kubernetes cluster (must be a comma-separated list) | ` csi-vxflexos.dellemc.com` |
| `karaviTopology.service.type` | Kubernetes service type | `ClusterIP` |
| `karaviTopology.certificateFile` | Optional valid CA public certificate file that will be used to deploy the Topology service. Must use domain name 'karavi-topology'. | |
| `karaviTopology.privateKeyFile` | Optional public certificate's associated private key file that will be used to deploy the Topology service. Must use domain name 'karavi-topology'. | |
| `karaviTopology.logLevel` | Output logs that are at or above the given log level severity (Valid values: TRACE, DEBUG, INFO, WARN, ERROR, FATAL, PANIC) | `INFO` |
| `karaviTopology.logFormat` | Output logs in the specified format (Valid values: text, json) | `text` | 

<br>

**Otel:**

| Parameter | Description | Default |
| - | - | - |
| `otelCollector.certificateFile` | Optional valid CA public certificate file that will be used to deploy the OpenTelemetry Collector. Must use domain name 'otel-collector'. | |
| `otelCollector.privateKeyFile` | Optional public certificate's associated private key file that will be used to deploy the OpenTelemetry Collector. Must use domain name 'otel-collector'. |  |
| `otelCollector.service.type` | Kubernetes service type | `ClusterIP` |

<br> 

{{< hide id="4" >}}
**Metrics:** 

| Parameter | Description | Default |
| - | - | - |
| `karaviMetricsPowerflex.image` |  CSM Metrics for PowerFlex Service image | `quay.io/dell/container-storage-modules/csm-metrics-powerflex:{{< version-v1 key="Observability_csm_metrics_PFlex_image" >}}` |
| `karaviMetricsPowerflex.enabled` | Enable CSM Metrics for PowerFlex service | `true` |
| `karaviMetricsPowerflex.collectorAddr` | Metrics Collector accessible from the Kubernetes cluster | `otel-collector:55680`  |
| `karaviMetricsPowerflex.provisionerNames` | Provisioner Names used to filter for determining PowerFlex SDC nodes( Must be a Comma-separated list) | ` csi-vxflexos.dellemc.com` |
| `karaviMetricsPowerflex.sdcPollFrequencySeconds` | The polling frequency (in seconds) to gather SDC metrics | `10` |
| `karaviMetricsPowerflex.volumePollFrequencySeconds` | The polling frequency (in seconds) to gather volume metrics | `10` |
| `karaviMetricsPowerflex.storageClassPoolPollFrequencySeconds` | The polling frequency (in seconds) to gather storage class/pool metrics | `10` |
| `karaviMetricsPowerflex.concurrentPowerflexQueries` | The number of simultaneous metrics queries to make to Powerflex(MUST be less than 10; otherwise, several request errors from Powerflex will ensue. | `10` |
| `karaviMetricsPowerflex.authorization.enabled` | [Authorization](v1/getting-started/installation/helm/modules/authorizationv2-0) is an optional feature to apply credential shielding of the backend PowerFlex. | `false` |
| `karaviMetricsPowerflex.authorization.proxyHost` | Hostname of the csm-authorization server. |  |
| `karaviMetricsPowerflex.authorization.skipCertificateValidation` | A boolean that enables/disables certificate validation of the csm-authorization server. |  |
| `karaviMetricsPowerflex.sdcMetricsEnabled` | Enable PowerFlex SDC Metrics Collection | `true` |
| `karaviMetricsPowerflex.volumeMetricsEnabled` | Enable PowerFlex Volume Metrics Collection | `true` |
| `karaviMetricsPowerflex.storageClassPoolMetricsEnabled` | Enable PowerFlex  Storage Class/Pool Metrics Collection | `true` |
| `karaviMetricsPowerflex.endpoint` | Endpoint for pod leader election | `karavi-metrics-powerflex` |
| `karaviMetricsPowerflex.service.type` | Kubernetes service type | `ClusterIP` |
| `karaviMetricsPowerflex.logLevel` | Output logs that are at or above the given log level severity (Valid values: TRACE, DEBUG, INFO, WARN, ERROR, FATAL, PANIC) | `INFO`|
| `karaviMetricsPowerflex.logFormat` | Output logs in the specified format (Valid values: text, json) | `text`| 
{{< /hide >}}

{{< hide id="5" >}}
**Metrics:** 

| Parameter | Description | Default |
| - | - | - |
| `karaviMetricsPowerstore.image` |  CSM Metrics for PowerStore Service image | `quay.io/dell/container-storage-modules/csm-metrics-powerstore:{{< version-v1 key="Observability_csm_metrics_PStore_image" >}}`|
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
{{< /hide >}}

{{< hide id="6">}} 

**Metrics:** 

| Parameter | Description | Default |
| - | - | - |
| `karaviMetricsPowerscale.image` |  CSM Metrics for PowerScale Service image | `quay.io/dell/container-storage-modules/csm-metrics-powerscale:{{< version-v1 key="Observability_csm_metrics_PScale_image" >}}`|
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
| `karaviMetricsPowerscale.authorization.enabled` | [Authorization](v1/getting-started/installation/helm/modules/authorizationv2-0) is an optional feature to apply credential shielding of the backend PowerScale. | `false` | 
| `karaviMetricsPowerscale.authorization.proxyHost` | Hostname of the csm-authorization server. |  |
| `karaviMetricsPowerscale.authorization.skipCertificateValidation` | A boolean that enables/disables certificate validation of the csm-authorization server. |  | 
{{< /hide >}} 

{{< hide id="7">}}

**Metrics:** 

| Parameter | Description | Default |
| - | - | - |
| `karaviMetricsPowerMax.capacityMetricsEnabled` | Enable PowerMax capacity metric Collection | `true` |
| `karaviMetricsPowerMax.performanceMetricsEnabled` | Enable PowerMax performance metric Collection | `true` |
| `karaviMetricsPowerMax.capacityPollFrequencySeconds` | The polling frequency (in seconds) to gather capacity metrics | `20` |
| `karaviMetricsPowerMax.performancePollFrequencySeconds` | The polling frequency (in seconds) to gather performance metrics | `20` |
| `karaviMetricsPowerMax.concurrentPowerMaxQueries` | The number of simultaneous metrics queries to make to PowerMax (MUST be less than 10; otherwise, several request errors from PowerMax will ensue.) | `10` |
| `karaviMetricsPowerMax.authorization.enabled` | [Authorization](v1/getting-started/installation/helm/modules/authorizationv2-0) is an optional feature to apply credential shielding of the backend PowerMax. | `false` |
| `karaviMetricsPowerMax.authorization.proxyHost` | Hostname of the csm-authorization server. |  |
| `karaviMetricsPowerMax.authorization.skipCertificateValidation` | A boolean that enables/disables certificate validation of the csm-authorization server. |  |
{{< /hide >}}