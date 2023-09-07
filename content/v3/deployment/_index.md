---
title: "Deployment"
linkTitle: "Deployment"
no_list: true
description: Deployment of CSM for Replication
weight: 1
---
The Container Storage Modules along with the required CSI Drivers can each be deployed using CSM operator.

{{< cardpane >}}
  {{< card header="[**CSM Operator**](csmoperator/)"
          footer="Supports driver [PowerScale](csmoperator/drivers/powerscale/), modules [Authorization](csmoperator/modules/authorization/) [Replication](csmoperator/modules/replication/)">}}
  Dell CSM Operator is a Kubernetes Operator, which can be used to install and manage the CSI Drivers and CSM Modules provided by Dell for various storage platforms. This operator is available as a community operator for upstream Kubernetes and can be deployed using OperatorHub.io. The operator can be installed using OLM (Operator Lifecycle Manager) or manually.
[...More on installation instructions](csmoperator/)
  {{< /card >}}
{{< /cardpane >}}
The Container Storage Modules and the required CSI Drivers can each be deployed following the links below:


{{< cardpane >}}
  {{< card header="[Dell CSI Drivers Installation via Helm](../csidriver/installation/helm)"
          footer="Installs [PowerStore](../csidriver/installation/helm/powerstore/) [PowerMax](../csidriver/installation/helm/powermax/) [PowerScale](../csidriver/installation/helm/isilon/) [PowerFlex](../csidriver/installation/helm/powerflex/) [Unity](../csidriver/installation/helm/unity/)">}}
   Dell CSI Helm installer installs the CSI Driver components using the provided Helm charts.
   [...More on installation instructions](../csidriver/installation/helm)
  {{< /card >}}
   {{< card header="[Dell CSI Drivers Installation via offline installer](../csidriver/installation/offline)"
          footer="[Offline installation for all drivers](../csidriver/installation/offline)">}}
  Both Helm and Dell CSI opetor supports offline installation of the Dell CSI Storage Providers via `csi-offline-bundle.sh` script by creating a usable package.
   [...More on installation instructions](../csidriver/installation/offline)
  {{< /card >}}
{{< /cardpane >}}
{{< cardpane >}}
  {{< card header="[Dell CSI Drivers Installation via operator](../csidriver/installation/operator)"
          footer="Installs [PowerStore](../csidriver/installation/operator/powerstore/) [PowerMax](../csidriver/installation/operator/powermax/) [PowerScale](../csidriver/installation/operator/isilon/) [PowerFlex](../csidriver/installation/operator/powerflex/) [Unity](../csidriver/installation/operator/unity/)">}}
   Dell CSI Operator is a Kubernetes Operator, which can be used to install and manage the CSI Drivers provided by Dell for various storage platforms. This operator is available as a community operator for upstream Kubernetes and can be deployed using OperatorHub.io. It is also available as a certified operator for OpenShift clusters and can be deployed using the OpenShift Container Platform. Both these methods of installation use OLM (Operator Lifecycle Manager).  The operator can also be deployed manually.
   [...More on installation instructions](../csidriver/installation/operator)
  {{< /card >}}
{{< /cardpane >}}
{{< cardpane >}}
  {{< card header="[Dell Container Storage Module for Observability](../observability/deployment)"
          footer="Installs Observability Module">}}
  CSM for Observability can be deployed either via Helm or  CSM for Observability Installer or CSM for Observability Offline Installer
  [...More on installation instructions](../observability/deployment)
  {{< /card >}}
   {{< card header="[Dell Container Storage Module for Authorization](../authorization/deployment)"
          footer="Installs Authorization Module">}}
  CSM Authorization can be installed by using the provided Helm v3 charts on Kubernetes platforms. 
  [...More on installation instructions](../authorization/deployment)
  {{< /card >}}
{{< /cardpane >}}
{{< cardpane >}}
  {{< card header="[Dell Container Storage Module for Resiliency](../resiliency/deployment)"
          footer="Installs Resiliency Module">}}
  CSI drivers that support Helm chart installation allow CSM for Resiliency to be _optionally_ installed by variables in the chart. It can be updated via _podmon_ block specified in the _values.yaml_ 
  [...More on installation instructions](../resiliency/deployment)
  {{< /card >}}
   {{< card header="[Dell Container Storage Module for Replication](../replication/deployment)"
          footer="Installs Replication Module">}}
  Replication module can be installed by installing repctl,Container Storage Modules (CSM) for Replication Controller,CSI driver after enabling replication.
   [...More on installation instructions](../replication/deployment)
  {{< /card >}}
{{< /cardpane >}}
{{< cardpane >}}
  {{< card header="[Dell Container Storage Module for Application Mobility](../applicationmobility/deployment)"
          footer="Installs Application Mobility Module">}}
  Application mobility module can be installed via helm charts. This is a tech preview release and it requires a license for installation.
  [...More on installation instructions](../applicationmobility/deployment)
  {{< /card >}}
  {{< card header="[Dell Container Storage Module for Encryption](../secure/encryption/deployment)"
          footer="Installs Encryption Module">}}
  Encryption can be optionally installed via the PowerScale CSI driver Helm chart.
   [...More on installation instructions](../secure/encryption//deployment)
  {{< /card >}}
{{< /cardpane >}}
