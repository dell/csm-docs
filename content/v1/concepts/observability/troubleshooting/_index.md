---
title: "Troubleshooting"
linkTitle: "Troubleshooting" 
toc_hide: false
weight: 4
Description: >
  Troubleshooting guide
---

## Frequently Asked Questions
1. [How can I diagnose an issue with Container Storage Modules (CSM) for Observability?](#how-can-i-diagnose-an-issue-with-csm-for-observability)
2. [How can I create a ServiceMonitor object for Prometheus if I'm using Rancher monitoring stack?](#how-can-i-create-a-servicemonitor-object-for-prometheus-if-im-using-rancher-monitoring-stack)
3. [How can I debug and troubleshoot issues with Kubernetes?](#how-can-i-debug-and-troubleshoot-issues-with-kubernetes)
4. [How can I troubleshoot latency problems with CSM for Observability?](#how-can-i-troubleshoot-latency-problems-with-csm-for-observability)
5. [Why does the Observability installation timeout with pods stuck in 'ContainerCreating'/'CrashLoopBackOff'/'Error' stage?](#why-does-the-observability-installation-timeout-with-pods-stuck-in-containercreatingcrashloopbackofferror-stage)
6. [Why do I see FailedMount warnings when describing pods in my cluster?](#why-do-i-see-failedmount-warnings-when-describing-pods-in-my-cluster)
7. [Why do I see 'Failed calling webhook' error when reinstalling CSM for Observability?](#why-do-i-see-failed-calling-webhook-error-when-reinstalling-CSM-for-Observability)

### How can I diagnose an issue with Container Storage Modules for Observability?

Once you have attempted to install Container Storage Modules for Observability to your Kubernetes or OpenShift cluster, the first step in troubleshooting is locating the problem. 

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

The ServiceMonitor allows us to define how a set of services should be monitored by Prometheus. Please see our [prometheus](v1/getting-started/installation/kubernetes/powermax/helm/csm-modules/observability/postinstallation/#prometheus) documentation for creating a ServiceMonitor. 

### How can I debug and troubleshoot issues with Kubernetes?

* To debug your application that may not be behaving correctly, please reference Kubernetes [troubleshooting applications guide](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-application/). 

* For tips on debugging your cluster, please see this [troubleshooting guide](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-cluster/).

### How can I troubleshoot latency problems with Container Storage Modules for Observability?

CContainer Storage ModuleSM for Observability is instrumented to report trace data to [Zipkin](https://zipkin.io/).  Please see [Tracing](v1/getting-started/installation/kubernetes/powermax/helm/csm-modules/observability/postinstallation/#tracing) for more information on enabling tracing for CSM for Observability.

### Why does the Observability installation timeout with pods stuck in 'ContainerCreating'/'CrashLoopBackOff'/'Error' stage?

Check the pods in the Container Storage Modules for Observability namespace. If the pod starting with 'karavi-observability-cert-manager-cainjector-*' is in 'CrashLoopBackOff' or 'Error" stage with a number of restarts, check if the logs for that pod show the below error:
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

### Why do I see 'Failed calling webhook' error when reinstalling Container Storage Modules for Observability?
This warning can occur when a user uninstalls Observability by deleting the Kubernetes namespace before properly cleaning up by running `helm delete` on the Observability Helm installation. This results in the credential manager failing to properly integrate with Observability on future installations. The user may see the following error in the module pods upon reinstallation:

```
Error: INSTALLATION FAILED: failed to create resource: Internal error occurred: failed calling webhook "webhook.cert-manager.io": failed to call webhook: Post "https://karavi-observability-cert-manager-webhook.karavi-observability.svc:443/mutate?timeout=10s": dial tcp 10.106.44.80:443: connect: connection refused
```

To resolve this, leave the CSM namespace in place after a failed installation, and run the below command:

```bash
helm delete karavi-observability --namespace [CSM_NAMESPACE]
```

Then delete the namespace `kubectl delete ns [CSM_NAMESPACE]`. Wait until namespace is fully deleted, recreate the namespace, and reinstall Observability again. 
