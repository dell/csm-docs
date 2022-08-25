---
title: "Troubleshooting"
linkTitle: "Troubleshooting"
weight: 4
Description: >
  Troubleshooting
---

## Frequently Asked Questions
1. [How can I diagnose an issue with Application Mobility?](#how-can-i-diagnose-an-issue-with-application-mobility)
2. [How can I view logs?](#how-can-i-view-logs)
3. [How can I debug and troubleshoot issues with Kubernetes?](#how-can-i-debug-and-troubleshoot-issues-with-kubernetes)
4. [Why are there error logs about a license?](#why-are-there-error-logs-about-a-license)

### How can I diagnose an issue with Application Mobility?

Once you have attempted to install Application Mobility to your Kubernetes or OpenShift cluster, the first step in troubleshooting is locating the problem. 

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

### Why are there error logs about a license?

Application Mobility requires a license in order to function. See the [Deployment](../deployment) instructions for steps to request a license.

There will be errors in the logs about the license for these cases:
- License does not exist
- License is not valid for the current Kubernetes cluster
- License has expired