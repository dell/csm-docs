---
title: "Deployment"
linkTitle: "Deployment"
no_list: true
description: Deployment of CSM
weight: 1
---

The Container Storage Modules along with the required CSI Drivers can each be deployed using CSM operator.

{{< cardpane >}}
  {{< card header="[**CSM Operator**](csmoperator/)"
          footer="Supported drivers: [PowerScale](csmoperator/drivers/powerscale/), [PowerStore](csmoperator/drivers/powerstore/), [PowerFlex](csmoperator/drivers/powerflex/), [PowerMax](csmoperator/drivers/powermax/), [Unity XT](csmoperator/drivers/unity/) <br> Supported modules: [Authorization](csmoperator/modules/authorization/), [Replication](csmoperator/modules/replication/), [Observability](csmoperator/modules/observability/)">}}
  Dell CSM Operator is a Kubernetes Operator, which can be used to install and manage the CSI Drivers and CSM Modules provided by Dell for various storage platforms. This operator is available as a community operator for upstream Kubernetes and can be deployed using OperatorHub.io. The operator can be installed using OLM (Operator Lifecycle Manager) or manually.
[...More on installation instructions](csmoperator/)
  {{< /card >}}
{{< /cardpane >}}
The Container Storage Modules and the required CSI Drivers can each be deployed following the links below:


{{< cardpane >}}
  {{< card header="[Dell CSI Drivers Installation via Helm](../csidriver/installation/helm)"
          footer="Installs [PowerStore](../csidriver/installation/helm/powerstore/) [PowerMax](../csidriver/installation/helm/powermax/) [PowerScale](../csidriver/installation/helm/isilon/) [PowerFlex](../csidriver/installation/helm/powerflex/) [Unity XT](../csidriver/installation/helm/unity/)">}}
   Dell CSI Helm installer installs the CSI Driver components using the provided Helm charts.
   [...More on installation instructions](../csidriver/installation/helm)
  {{< /card >}}
  {{< card header="[CSM Installation Wizard](csminstallationwizard/)"
          footer="Generates manifest file for installation">}}
   CSM Installation Wizard generates manifest files to install Dell CSI Drivers and supported modules.
   [...More on installation instructions](csminstallationwizard)
  {{< /card >}}
   {{< card header="[Dell CSI Drivers Installation via offline installer](../csidriver/installation/offline)"
          footer="[Offline installation for all drivers](../csidriver/installation/offline) [Offline installation with Operator](csmoperator/#offline-bundle-installation-on-a-cluster-without-olm)">}}
  Both Helm and Dell CSM operator supports offline installation of the Dell CSI Storage Providers via `csi-offline-bundle.sh` or `csm-offline-bundle.sh` script, respectively, by creating a usable package.
   [...More on installation instructions](../csidriver/installation/offline)
  {{< /card >}}
{{< /cardpane >}}
{{< cardpane >}}
  {{< card header="[Dell Container Storage Module for Observability](../observability/deployment)"
          footer="Installs Observability Module">}}
  CSM for Observability can be deployed either via Helm/CSM operator/CSM for Observability Installer/CSM for Observability Offline Installer
  [...More on installation instructions](../observability/deployment)
  {{< /card >}}
   {{< card header="[Dell Container Storage Module for Authorization](../authorization/deployment)"
          footer="Installs Authorization Module">}}
  CSM Authorization can be installed by using the provided Helm v3 charts on Kubernetes platforms or CSM operator. 
  [...More on installation instructions](../authorization/deployment)
  {{< /card >}}
{{< /cardpane >}}
{{< cardpane >}}
  {{< card header="[Dell Container Storage Module for Resiliency](../resiliency/deployment)"
          footer="Installs Resiliency Module">}}
  CSI drivers that support Helm chart installation allow CSM for Resiliency to be _optionally_ installed by variables in the chart. It can be updated via _podmon_ block specified in the _values.yaml_. It can be installed via CSM operator as well. 
  [...More on installation instructions](../resiliency/deployment)
  {{< /card >}}
   {{< card header="[Dell Container Storage Module for Replication](../replication/deployment)"
          footer="Installs Replication Module">}}
  Replication module can be installed by installing repctl,Container Storage Modules (CSM) for Replication Controller,CSI driver after enabling replication. It can be installed via CSM operator as well.
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
