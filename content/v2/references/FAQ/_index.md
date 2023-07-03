---
title: "CSM FAQ"
linktitle: "FAQ"
description: Frequently asked questions of Dell Technologies (Dell) Container Storage Modules 
weight: 1
---

- [What are Dell Container Storage Modules (CSM)? How different is it from a CSI driver?](#what-are-dell-container-storage-modules-csm-how-different-is-it-from-a-csi-driver)
- [Where do I start with Dell Container Storage Modules (CSM)?](#where-do-i-start-with-dell-container-storage-modules-csm)
- [What are the prerequisites for deploying Container Storage Modules?](#what-are-the-prerequisites-for-deploying-container-storage-modules)
- [How do I uninstall or disable a module?](#how-do-i-uninstall-or-disable-a-module)
- [How do I troubleshoot Container Storage Modules?](#how-do-i-troubleshoot-container-storage-modules)
- [Can I use the CSM functionality like Prometheus collection or Authorization quotas for my non-Kubernetes storage clients?](#can-i-use-the-csm-functionality-like-prometheus-collection-or-authorization-quotas-for-my-non-kubernetes-storage-clients)
- [Should I install the module in the same namespace as the driver or another?](#should-i-install-the-module-in-the-same-namespace-as-the-driver-or-another)
- [Which Kubernetes distributions are supported?](#which-kubernetes-distributions-are-supported)
- [How do I get a list of Container Storage Modules deployed in my cluster with their versions?](#how-do-i-get-a-list-of-container-storage-modules-deployed-in-my-cluster-with-their-versions)
- [Do all Container Storage Modules need to be the same version, or can I mix and match?](#do-all-container-storage-modules-need-to-be-the-same-version-or-can-i-mix-and-match)
- [Can I run Container Storage Modules in a production environment?](#can-i-run-container-storage-modules-in-a-production-environment)
- [Is Dell Container Storage Modules (CSM) supported by Dell Technologies?](#is-dell-container-storage-modules-csm-supported-by-dell-technologies)
- [Can I modify a module or contribute to the project?](#can-i-modify-a-module-or-contribute-to-the-project)
- [What is coming next?](#what-is-coming-next)

### What are Dell Container Storage Modules (CSM)? How different is it from a CSI driver?
Dell **C**ontainer **S**torage **M**odules  are a set of modules that aim to extend features beyond what is available in the [CSI specification](https://kubernetes-csi.github.io/docs/).

The main goal with CSM modules is to expose storage array enterprise features directly within Kubernetes so developers are empowered to leverage them for their deployment in a seamless way.

### Where do I start with Dell Container Storage Modules (CSM)?
The umbrella repository for every Dell Container Storage Module is: [https://github.com/dell/csm](https://github.com/dell/csm).

### What are the prerequisites for deploying Container Storage Modules?
Prerequisites can be found on the respective module deployment pages:
- [Dell Container Storage Module for Observability Deployment](../observability/deployment/#prerequisites)
- [Dell Container Storage Module for Authorization Deployment](../../authorization/deployment/rpm/#prerequisites)
- [Dell Container Storage Module for Resiliency Deployment](../../resiliency/deployment)
- [Dell Container Storage Module for Replication Deployment](../replication/deployment/installation/#before-you-begin)

Prerequisites for deploying the Dell CSI drivers can be found here:
- [Dell CSI Drivers Deployment](../../csidriver/installation/)

### How do I uninstall or disable a module?
- [Dell Container Storage Module for Authorization](../../authorization/uninstallation)
- [Dell Container Storage Module for Observability](../observability/uninstall/)
- [Dell Container Storage Module for Resiliency](../../resiliency/uninstallation)

### How do I troubleshoot Container Storage Modules?
- [Dell CSI Drivers](../../csidriver/troubleshooting/)
- [Dell Container Storage Module for Authorization](../../authorization/troubleshooting)
- [Dell Container Storage Module for Observability](../observability/troubleshooting/)
- [Dell Container Storage Module for Replication](../replication/troubleshooting/)
- [Dell Container Storage Module for Resiliency](../../resiliency/troubleshooting)

### Can I use the CSM functionality like Prometheus collection or Authorization quotas for my non-Kubernetes storage clients?
No, all the modules have been designed to work inside Kubernetes with Dell CSI drivers.

### Should I install the module in the same namespace as the driver or another?
It is recommended to install CSM for Observability in a namespace separate from the Dell CSI drivers because it works across multiple drivers.  All other modules either run as standalone or with the Dell CSI driver as a sidecar.

### Which Kubernetes distributions are supported?
The supported Kubernetes distributions for Container Storage Modules are documented:
- [Dell Container Storage Module for Authorization](../../authorization#supported-operating-systemscontainer-orchestrator-platforms)
- [Dell Container Storage Module for Observability](../observability/#supported-operating-systemscontainer-orchestrator-platforms)
- [Dell Container Storage Module for Replication](../replication/#supported-operating-systemscontainer-orchestrator-platforms)
- [Dell Container Storage Module for Resiliency](../../resiliency#supported-operating-systemscontainer-orchestrator-platforms)

The supported distros for the Dell CSI Drivers are located [here](../../csidriver/#supported-operating-systemscontainer-orchestrator-platforms).

### How do I get a list of Container Storage Modules deployed in my cluster with their versions?
The easiest way to find the module version is to check the image tag for the module. For all the namespaces you can execute the following:
```
kubectl get pods -A -o jsonpath="{..image}" | tr -s '[[:space:]]' '\n' | grep 'csm\|karavi' | sort | uniq -c
```
Or if you know the namespace:
```
kubectl get deployment,daemonset -o wide -n {{namespace}}
```

### Do all Container Storage Modules need to be the same version, or can I mix and match?
It is advised to comply with the support matrices (links below) and not deviate from it with mixed versions.
- [Dell Container Storage Module for Authorization](../../authorization#supported-operating-systemscontainer-orchestrator-platforms)
- [Dell Container Storage Module for Observability](../observability/#supported-operating-systemscontainer-orchestrator-platforms)
- [Dell Container Storage Module for Replication](../replication/#supported-operating-systemscontainer-orchestrator-platforms)
- [Dell Container Storage Module for Resiliency](../../resiliency#supported-operating-systemscontainer-orchestrator-platforms)
- [Dell CSI Drivers](../csidriver/#supported-operating-systemscontainer-orchestrator-platforms)

### Can I run Container Storage Modules in a production environment?
As of CSM 1.0, the Container Storage Modules are GA and ready for production systems.

### Is Dell Container Storage Modules (CSM) supported by Dell Technologies?
Yes!

If you find an issue, please follow our [support process](../../support/)

### Can I modify a module or contribute to the project?
Yes!

All Container Storage Modules are released as open-source projects under Apache-2.0 License. You are free to contribute directly following the [contribution guidelines](https://github.com/dell/csm/blob/main/docs/CONTRIBUTING.md), fork the projects, modify them, and of course share feedback or open tickets ;-)

### What is coming next?
This is just the beginning of the journey for Dell Container Storage Modules, and there is a full roadmap with more to come, which you can check under the [GitHub Milestones](https://github.com/dell/csm/milestones) page.
