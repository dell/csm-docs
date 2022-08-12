---
title: "Troubleshooting"
linkTitle: "Troubleshooting"
weight: 3
Description: >
  Troubleshooting guide
---

{{% pageinfo color="primary" %}}
Application Mobility is currently in tech-preview and is not supported in production environments
{{% /pageinfo %}}

## Frequently Asked Questions
1. [How can I diagnose an issue with Container Storage Modules (CSM) for Application Mobility?](#how-can-i-diagnose-an-issue-with-csm-for-observability)
2. [How can I view logs?](#how-can-i-view-logs)
3. [How can I debug and troubleshoot issues with Kubernetes?](#how-can-i-debug-and-troubleshoot-issues-with-kubernetes)

### How can I diagnose an issue with CSM for Application Mobility?

Once you have attempted to install CSM for Application Mobility to your Kubernetes or OpenShift cluster, the first step in troubleshooting is locating the problem. 

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

### How can I debug and troubleshoot issues with Kubernetes?

* To debug your application that may not be behaving correctly, please reference Kubernetes [troubleshooting applications guide](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-application/). 

* For tips on debugging your cluster, please see this [troubleshooting guide](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-cluster/).