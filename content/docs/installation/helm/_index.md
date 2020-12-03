---
title: "CSI Driver installation using Helm"
linkTitle: "Using Helm"
weight: 2
Description: >
  Installation of Dell EMC CSI drivers using Helm installer
---

This section provides the details and instructions on how to install the Dell EMC CSI drivers using the provided Helm charts and the Dell CSI Helm Installer.
## Dependencies

Installing any of the Dell EMC CSI Drivers using Helm requires a few utilities to be installed on the system running the installation.

| Dependency | Usage |
|------------|-------|
| `kubectl`  | Kubectl is used to validate that the Kubernetes system meets the requirements of the driver. |
| `helm`     | Helm v3 is used as the deployment tool for Charts. Go [here](https://helm.sh/docs/intro/install/) to install Helm 3.|

\
**Note:** To use these tools, a valid `KUBECONFIG` is required. Ensure that either a valid configuration is in the default location, or, that the `KUBECONFIG` environment variable points to a valid configuration before using these tools.
