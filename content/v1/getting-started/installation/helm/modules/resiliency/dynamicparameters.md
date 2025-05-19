--- 
--- 

## Dynamic parameters

CSM for Resiliency has configuration parameters that can be updated dynamically, such as the logging level and format. This can be 
done by editing the Dell CSI Driver's parameters ConfigMap. The ConfigMap can be queried using kubectl. 
For example, the Dell Powerflex CSI Driver ConfigMaps can be found using this command: `kubectl get -n vxflexos configmap`. 
The ConfigMap to edit will have this pattern: <storage>-config-params (e.g., `vxflexos-config-params`).

To update or add parameters, you can use the `kubectl edit` command. For example, `kubectl edit -n vxflexos configmap vxflexos-config-params`.

This is a list of parameters that can be adjusted for CSM for Resiliency:

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| PODMON_CONTROLLER_LOG_FORMAT | String | "text" |Logging format output for the controller podmon sidecar. Should be "text" or "json" |
| PODMON_CONTROLLER_LOG_LEVEL | String | "debug" |Logging level for the controller podmon sidecar. Standard values: 'info', 'error', 'warning', 'debug', 'trace' |
| PODMON_NODE_LOG_FORMAT | String | "text" |Logging format output for the node podmon sidecar. Should be "text" or "json" |
| PODMON_NODE_LOG_LEVEL | String | "debug" |Logging level for the node podmon sidecar. Standard values: 'info', 'error', 'warning', 'debug', 'trace' |
| PODMON_ARRAY_CONNECTIVITY_POLL_RATE | Integer (>0) | 15 |An interval in seconds to poll the underlying array | 
| PODMON_ARRAY_CONNECTIVITY_CONNECTION_LOSS_THRESHOLD | Integer (>0) | 3 |A value representing the number of failed connection poll intervals before marking the array connectivity as lost |
| PODMON_SKIP_ARRAY_CONNECTION_VALIDATION | Boolean | false |Flag to disable the array connectivity check, set to true for NoSchedule or NoExecute taint due to K8S Control Plane failure (kubelet failure) |

Here is an example of the parameters:

```yaml
    PODMON_CONTROLLER_LOG_FORMAT: "text"
    PODMON_CONTROLLER_LOG_LEVEL: "info"
    PODMON_NODE_LOG_FORMAT: "text"
    PODMON_NODE_LOG_LEVEL: "info"
    PODMON_ARRAY_CONNECTIVITY_POLL_RATE: 20
    PODMON_ARRAY_CONNECTIVITY_CONNECTION_LOSS_THRESHOLD: 2
    PODMON_SKIP_ARRAY_CONNECTION_VALIDATION: true
```

