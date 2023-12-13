---
title: "Troubleshooting"
linkTitle: "Troubleshooting"
weight: 4
Description: >
  Troubleshooting guide
---

## Frequently Asked Questions
1. [Why do I see a certificate problem when accessing the topology service outside of my Kubernetes cluster?](#why-do-i-see-a-certificate-problem-when-accessing-the-topology-service-outside-of-my-kubernetes-cluster)
2. [How can I diagnose an issue with Container Storage Modules (CSM) for Observability?](#how-can-i-diagnose-an-issue-with-csm-for-observability)
3. [How can I create a ServiceMonitor object for Prometheus if I'm using Rancher monitoring stack?](#how-can-i-create-a-servicemonitor-object-for-prometheus-if-im-using-rancher-monitoring-stack)
4. [How can I debug and troubleshoot issues with Kubernetes?](#how-can-i-debug-and-troubleshoot-issues-with-kubernetes)
5. [How can I troubleshoot latency problems with CSM for Observability?](#how-can-i-troubleshoot-latency-problems-with-csm-for-observability)
6. [Why does the Observability installation timeout with pods stuck in 'ContainerCreating'/'CrashLoopBackOff'/'Error' stage?](#why-does-the-observability-installation-timeout-with-pods-stuck-in-containercreatingcrashloopbackofferror-stage)
7. [Why do I see FailedMount warnings when describing pods in my cluster?](#why-do-i-see-failedmount-warnings-when-describing-pods-in-my-cluster)
8. [Why do I see 'Failed calling webhook' error when reinstalling CSM for Observability?](#why-do-i-see-failed-calling-webhook-error-when-reinstalling-CSM-for-Observability)


### Why do I see a certificate problem when accessing the topology service outside of my Kubernetes cluster?

This issue can arise when the topology service manifest is updated to expose the service as NodePort and a client makes a request to the service. Karavi-toplogy is configured with a self-signed or custom certificate and when a client does not recognize a server's certificate, it shows an error and pings the server(karavi-topology) with the error.  You would see the issue when accessing the service through a browser or curl:

#### Browser experience

A user who tries to connect to `karavi-topology` on any browser may receive an error/warning message about the certificate. The message may vary depending on the browser. For instance, in Internet Explorer, you'll see:

```
There is a problem with this website's security certificate. 
The security certificate presented by this website was not
issued by a trusted certificate authority
```

While this certificate problem may indicate an attempt to fool you or intercept data you send to the server, see [resolution](#resolution) on how to fix it

#### Curl experience

A user who tries to connect to `karavi-topology` by using `curl` may receive the following warning or error message:

```console
curl -v https://<karavi-topology-cluster-IP>:<port?/query
```
```
*   Trying ***********...
* TCP_NODELAY set
* Connected to *********** (***********) port 31433 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* successfully set certificate verify locations:
*   CAfile: /etc/ssl/certs/ca-certificates.crt
  CApath: /etc/ssl/certs
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS Unknown, Certificate Status (22):
* TLSv1.3 (IN), TLS handshake, Unknown (8):
* TLSv1.3 (IN), TLS Unknown, Certificate Status (22):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (OUT), TLS alert, Server hello (2):
* SSL certificate problem: unable to get local issuer certificate
* stopped the pause stream!
* Closing connection 0
curl: (60) SSL certificate problem: unable to get local issuer certificate
More details here: https://curl.haxx.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.
```

#### Kubernetes Admin experience

Due to the error above, the client pings the topology server with a **TLS handshake error** which is logged in `karavi-topology` pod. For instance,

```console
kubectl  logs  -n powerflex karavi-topology-5d4669d6dd-trzxw
```
```
2021/04/27 09:38:28 Set DriverNames to [csi-vxflexos.dellemc.com]
2021/04/28 07:15:05 http: TLS handshake error from 10.42.0.0:58450: local error: tls: bad record MAC
2021/04/28 07:16:14 http: TLS handshake error from 10.42.0.0:55311: local error: tls: bad record MAC
```

#### Resolution

To resolve this issue, we need to configure the client to be aware of the karavi-topology certificate (this includes all custom SSL certificate that are not issued from a trusted Certificate Authority (CA))

##### Get a copy of the certificate used by karavi-topology

If we supplied a custom certificate during installing karavi-topology, we can simply open the `.crt` and copy the text. However, if it was assigned by cert-manager, you can get a copy of the certificate by running the following `kubectl` command on the clusters.

```console

kubectl -n <namespace> get secret karavi-topology-tls -o jsonpath='{.data.tls\.crt}' | base64 -d
```
```
-----BEGIN CERTIFICATE-----
RaNDOMcErTifCATeRaNDOMcErTifCATe..RaNDOMcErTifCATe
RaNDOMcErTifCATe..RaNDOMcErTifCATeRaNDOMcErTifCATe
RaNDOMcErTifCATeRaNDOMcErTifCATe..RaNDOMcErTifCATe
RaNDOMcErTifCATeRaNDOMcErTifCATe..RaNDOMcErTifCATe
RaNDOMcErTifCATe..RaNDOMcErTifCATeRaNDOMcErTifCATe
RaNDOMcErTifCATeRaNDOMcErTifCATe..RaNDOMcErTifCATe
RaNDOMcErTifCATeRaNDOMcErTifCATe..RaNDOMcErTifCATe
RaNDOMcErTifCATe..RaNDOMcErTifCATeRaNDOMcErTifCATe
RaNDOMcErTifCATeRaNDOMcErTifCATe..RaNDOMcErTifCATe
-----END CERTIFICATE-----
```

##### Configure your client to accept the above certificate

A workaround on most browsers is to accept the `karavi-topology` certificate by clicking **Continue to this website (not recommended)**. This will make all other successive communication to not cause any certificate error. Anyhow, you will need to read the documentation for your specific client to configure the above certificate. For Grafana, here are two ways to configure the karavi-topology datasource to use the above certificate:

  <details>
   <summary>Deploy certificate with new Grafana instance</summary>
 Please follow the steps in <a href="../deployment#grafana-deployment">Sample Grafana Deployment</a> but attach the certificate to your `grafana-values.yaml` before deploying. The file should look like:

```yaml
# grafana-values.yaml 
image:
  repository: grafana/grafana
  tag: 7.3.0
  sha: ""
  pullPolicy: IfNotPresent
service:
  type: NodePort

## Administrator credentials when not using an existing Secret
adminUser: admin
adminPassword: admin

## Pass the plugins you want installed as a list.
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
        tlsAuthWithCACert: true
      secureJsonData:
       tlsCaCert: |
      -----BEGIN CERTIFICATE-----
      RaNDOMcErTifCATeRaNDOMcErTifCATe..RaNDOMcErTifCATe
      RaNDOMcErTifCATe..RaNDOMcErTifCATeRaNDOMcErTifCATe
      RaNDOMcErTifCATeRaNDOMcErTifCATe..RaNDOMcErTifCATe
      RaNDOMcErTifCATeRaNDOMcErTifCATe..RaNDOMcErTifCATe
      RaNDOMcErTifCATe..RaNDOMcErTifCATeRaNDOMcErTifCATe
      RaNDOMcErTifCATeRaNDOMcErTifCATe..RaNDOMcErTifCATe
      RaNDOMcErTifCATeRaNDOMcErTifCATe..RaNDOMcErTifCATe
      RaNDOMcErTifCATe..RaNDOMcErTifCATeRaNDOMcErTifCATe
      RaNDOMcErTifCATeRaNDOMcErTifCATe..RaNDOMcErTifCATe
      -----END CERTIFICATE-----
    - name: Prometheus
      type: prometheus
      access: proxy
      url: 'http://prometheus:9090'
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

## Additional grafana server ConfigMap mounts
## Defines additional mounts with ConfigMap. ConfigMap must be manually created in the namespace.
extraConfigmapMounts: []
```
  </details>

<details>
   <summary>Add certificate to an existing Grafana instance</summary>
-  This only happens if you configure jsonData to not skip tls verification. If this is the case, you'll need to re-deploy grafana as shown above or, form Grafana UI, edit Karavi-Topology datasource to use the certificate. To do the latter:

1. Visit your Grafana UI on a browser
2. Navigate to setting and go to Data Sources
3. Click on `Karavi-Topology`
4. Ensure that `Skip TLS Verify` is already off
5. Switch on `With CA Cert`
6. Copy the above certificate into the `TLS Auth Details` text box that appears
7. Click `Save & Test` and validate that everything is working fine when a green bar showing `Data source is working` appears

</details>

### How can I diagnose an issue with CSM for Observability?

Once you have attempted to install CSM for Observability to your Kubernetes or OpenShift cluster, the first step in troubleshooting is locating the problem. 

Get information on the state of your Pods.
```console
kubectl get pods -n $namespace 
```
Get verbose output of the current state of a Pod.
```console
kubectl describe pod -n $namespace $pod
```
### How can I view logs?

View pod container logs. Output logs to a file for further debugging.
```console
kubectl logs -n $namespace $pod $container
kubectl logs -n $namespace $pod $container > $logFileName
```
More information for viewing logs can be found [here](../#viewing-logs). 

### How can I create a ServiceMonitor object for Prometheus if I'm using Rancher monitoring stack?

The ServiceMonitor allows us to define how a set of services should be monitored by Prometheus. Please see our [prometheus](../deployment#prometheus) documentation for creating a ServiceMonitor. 

### How can I debug and troubleshoot issues with Kubernetes?

* To debug your application that may not be behaving correctly, please reference Kubernetes [troubleshooting applications guide](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-application/). 

* For tips on debugging your cluster, please see this [troubleshooting guide](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-cluster/).

### How can I troubleshoot latency problems with CSM for Observability?

CSM for Observability is instrumented to report trace data to [Zipkin](https://zipkin.io/).  Please see [Tracing](../deployment/#tracing) for more information on enabling tracing for CSM for Observability.

### Why does the Observability installation timeout with pods stuck in 'ContainerCreating'/'CrashLoopBackOff'/'Error' stage?

Check the pods in the CSM for Observability namespace. If the pod starting with 'karavi-observability-cert-manager-cainjector-*' is in 'CrashLoopBackOff' or 'Error" stage with a number of restarts, check if the logs for that pod show the below error:
```console
kubectl logs -n $namespace $cert-manager-cainjector-podname
```
```
error registering secret controller: no matches for kind "MutatingWebhookConfiguration" in version "admissionregistration.k8s.io/v1beta1"
```

If the Kubernetes cluster version is 1.22.2 (or higher), this error is due to an incompatible [cert-manager](https://github.com/jetstack/cert-manager) version. Please upgrade to the latest CSM for Observability release (v1.0.1 or higher).

### Why do I see FailedMount warnings when describing pods in my cluster?

The warning can arise when a self-signed certificate for otel-collector is issued. It takes a few minutes or less for the signed certificate to generate and be consumed in the namespace. Once the certificate is consumed, the FailedMount warnings are resolved and the containers start properly. 
```console
kubectl describe pod -n $namespace $pod
```
```
MountVolume.SetUp failed for volume "tls-secret" : secret "otel-collector-tls" not found
Unable to attach or mount volumes: unmounted volumes=[tls-secret], unattached volumes=[vxflexos-config-params vxflexos-config tls-secret karavi-metrics-powerflex-configmap kube-api-access-4fqgl karavi-authorization-config proxy-server-root-certificate]: timed out waiting for the condition
```

### Why do I see 'Failed calling webhook' error when reinstalling CSM for Observability?
This warning can occur when a user uninstalls Observability by deleting the Kubernetes namespace before properly cleaning up by running `helm delete` on the Observability Helm installation. This results in the credential manager failing to properly integrate with Observability on future installations. The user may see the following error in the module pods upon reinstallation:

```
Error: INSTALLATION FAILED: failed to create resource: Internal error occurred: failed calling webhook "webhook.cert-manager.io": failed to call webhook: Post "https://karavi-observability-cert-manager-webhook.karavi-observability.svc:443/mutate?timeout=10s": dial tcp 10.106.44.80:443: connect: connection refused
```

To resolve this, leave the CSM namespace in place after a failed installation, and run the below command:

```bash
helm delete karavi-observability --namespace [CSM_NAMESPACE]
```

<<<<<<< Updated upstream
Then delete the namespace `kubectl delete ns [CSM_NAMESPACE]`. Wait until namespace is fully deleted, recreate the namespace, and reinstall Observability again. 
=======
Then delete the namespace `kubectl delete ns [CSM_NAMESPACE]`. Wait until namespace is fully deleted, recreate the namespace, and reinstall Observability again.

### Other issues and workarounds

| Symptoms | Prevention, Resolution or Workaround |
| --- | --- |
| karavi-metrics pod crashes for all the supported platforms whenever there are PVs without claim in the cluster | Work around is to create PVCs using the PVs which are not in bound state or delete the PVs without claims |
>>>>>>> Stashed changes
