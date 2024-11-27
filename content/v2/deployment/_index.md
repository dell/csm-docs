---
title: "Deployment"
linkTitle: "Deployment"
no_list: true
description: Deployment of CSM
weight: 2
---

The Container Storage Modules along with the required CSI Drivers can each be deployed using CSM operator.

{{% cardpane %}}
  {{< card header="[**CSM Operator**](csmoperator/)"
          footer="Supported drivers: [PowerScale](csmoperator/drivers/powerscale/), [PowerStore](csmoperator/drivers/powerstore/), [PowerFlex](csmoperator/drivers/powerflex/), [PowerMax](csmoperator/drivers/powermax/), [Unity XT](csmoperator/drivers/unity/) <br> Supported modules: [Authorization](csmoperator/modules/authorization/), [Replication](csmoperator/modules/replication/), [Observability](csmoperator/modules/observability/)">}}
  Dell CSM Operator is a Kubernetes Operator, which can be used to install and manage the CSI Drivers and CSM Modules provided by Dell for various storage platforms. This operator is available as a community operator for upstream Kubernetes and can be deployed using OperatorHub.io. The operator can be installed using OLM (Operator Lifecycle Manager) or manually.
[...More on installation instructions](csmoperator/)
  {{< /card >}}
{{% /cardpane %}}
The Container Storage Modules and the required CSI Drivers can each be deployed following the links below:


{{% cardpane %}}
  {{< card header="[Dell CSI Drivers Installation via Helm](helm/drivers)"
          footer="Installs [PowerStore](helm/drivers/installation/powerstore/) [PowerMax](helm/drivers/installation/powermax/) [PowerScale](helm/drivers/installation/isilon/) [PowerFlex](helm/drivers/installation/powerflex/) [Unity XT](helm/drivers/installation/unity/)">}}
   Dell CSI Helm installer installs the CSI Driver components using the provided Helm charts.
   [...More on installation instructions](helm/drivers/installation/)
  {{< /card >}}
  {{< card header="[CSM Installation Wizard](csminstallationwizard/)"
          footer="Generates manifest file for installation">}}
   CSM Installation Wizard generates manifest files to install Dell CSI Drivers and supported modules.
   [...More on installation instructions](csminstallationwizard)
  {{< /card >}}
   {{< card header="[Dell CSI Drivers Installation via offline installer](offline/)"
          footer="[Offline installation for all drivers](offline/) [Offline installation with Operator](csmoperator/#offline-bundle-installation-on-a-cluster-without-olm)">}}
  Both Helm and Dell CSM operator supports offline installation of the Dell CSI Storage Providers via `csi-offline-bundle.sh` or `csm-offline-bundle.sh` script, respectively, by creating a usable package.
   [...More on installation instructions](offline/drivers)
  {{< /card >}}
{{% /cardpane %}}
{{% cardpane %}}
  {{< card header="[Dell Container Storage Module for Observability](helm/modules/installation/observability/)"
          footer="Installs Observability Module">}}
  CSM for Observability can be deployed either via Helm/CSM operator/CSM for Observability Installer/CSM for Observability Offline Installer
  [...More on installation instructions](helm/modules/installation/observability/)
  {{< /card >}}
   {{< card header="[Dell Container Storage Module for Authorization](helm/modules/installation/authorization/)"
          footer="Installs Authorization Module">}}
  CSM Authorization can be installed by using the provided Helm v3 charts on Kubernetes platforms or CSM operator. 
  [...More on installation instructions](helm/modules/installation/authorization/)
  {{< /card >}}
{{% /cardpane %}}
{{% cardpane %}}
  {{< card header="[Dell Container Storage Module for Resiliency](helm/modules/installation/resiliency)"
          footer="Installs Resiliency Module">}}
  CSI drivers that support Helm chart installation allow CSM for Resiliency to be _optionally_ installed by variables in the chart. It can be updated via _podmon_ block specified in the _values.yaml_. It can be installed via CSM operator as well. 
  [...More on installation instructions](helm/modules/installation/resiliency)
  {{< /card >}}
   {{< card header="[Dell Container Storage Module for Replication](helm/modules/installation/replication)"
          footer="Installs Replication Module">}}
  Replication module can be installed by installing repctl,Container Storage Modules (CSM) for Replication Controller,CSI driver after enabling replication. It can be installed via CSM operator as well.
   [...More on installation instructions](helm/modules/installation/replication)
  {{< /card >}}
{{% /cardpane %}}
{{% cardpane %}}
  {{< card header="[Dell Container Storage Module for Encryption](helm/modules/installation/encryption)"
          footer="Installs Encryption Module">}}
  Encryption can be optionally installed via the PowerScale CSI driver Helm chart.
   [...More on installation instructions](helm/modules/installation/encryption)
  {{< /card >}}
{{% /cardpane %}}
