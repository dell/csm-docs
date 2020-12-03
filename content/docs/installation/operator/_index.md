---
title: "Dell CSI Operator Installation Process"
linkTitle: "Using Operator"
weight: 4
description: >
  Installation of Dell EMC CSI drivers using Dell CSI Operator
---

The Dell CSI Operator is a Kubernetes Operator, which can be used to install and manage the CSI Drivers provided by Dell EMC for various storage platforms. This operator is available as a community operator for upstream Kubernetes and can be deployed using OperatorHub.io. It is also available as a certified operator for OpenShift clusters and can be deployed using OpenShift Container Platform. Both these methods of installation use OLM (Operator Lifecycle Manager).  The operator can also be deployed manually.

- For installing via OperatorHub.io on Kubernetes, go to the [OperatorHub page](../../partners/operator/).
- For installing via OpenShift with the certified Operator, go to the [OpenShift page](../../partners/redhat/).
- For installing manually, follow the instructions below.

### Manual Installation

#### Pre-requisites
Dell CSI Operator has been tested and qualified with 

- Upstream Kubernetes cluster v1.17, v1.18, v1.19
- OpenShift Clusters 4.5, 4.6 with RHEL 7.x & RHCOS worker nodes
- For upstream k8s clusters, make sure to install 
   - Beta VolumeSnapshot CRDs (can be installed using the Operator installation script)
   - External Volume Snapshot Controller

#### Steps

1. Clone the [Dell CSI Operator repository](https://github.com/dell/dell-csi-operator)
2. Run 'bash scripts/install.sh' to install the operator
{{< imgproc non-olm-1.jpg Resize "2500x" >}}{{< /imgproc >}}
3. Run the command 'oc get pods' to validate the install completed
    - Should be able to see the operator related pod on default namespace
{{< imgproc non-olm-2.jpg Resize "3500x800" >}}{{< /imgproc >}}

![](openshift1.jpg)
## Driver Install via Dell CSI Operator
For information on how to install the CSI drivers via the Dell CSI Operator, please refer to the sub-pages below for each driver.
