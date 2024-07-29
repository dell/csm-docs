---
title: "Documentation"
linkTitle: "Documentation"
---

{{% pageinfo color="primary" %}}
This document version is no longer actively maintained. The site that you are currently viewing is an archived snapshot. For up-to-date documentation, see the [latest version](/csm-docs/)
The CSM Authorization RPM will be deprecated in a future release. It is highly recommended that you use CSM Authorization Helm deployment or CSM Operator going forward.
{{% /pageinfo %}}

The Dell Technologies (Dell) Container Storage Modules (CSM) enables simple and consistent integration and automation experiences, extending enterprise storage capabilities to Kubernetes for cloud-native stateful applications. It reduces management complexity so developers can independently consume enterprise storage with ease and automate daily operations such as provisioning, snapshotting, replication, observability, authorization, application mobility, encryption, and resiliency.

<img src="csm_hexagon.png" alt="CSM Hex Diagram" width="500"/>

<br> <br>
CSM is made up of multiple components including modules (enterprise capabilities), CSI drivers (storage enablement), and other related applications (deployment, feature controllers, etc).

{{< cardpane >}}
  {{< card header="[**Authorization**](authorization/)"
          footer="Supports [PowerFlex](csidriver/features/powerflex/) [PowerScale](csidriver/features/powerscale/) [PowerMax](csidriver/features/powermax/)">}}
  CSM for Authorization provides storage and Kubernetes administrators the ability to apply RBAC for Dell CSI Drivers. It does this by deploying a proxy between the CSI driver and the storage system to enforce role-based access and usage rules.<br>
[...Learn more](authorization/)

  {{< /card >}}
  {{< card header="[**Replication**](replication/)"
          footer="Supports [PowerFlex](csidriver/features/powerflex/) [PowerStore](csidriver/features/powerstore/) [PowerScale](csidriver/features/powerscale/) [PowerMax](csidriver/features/powermax/)">}}
  CSM for Replication project aims to bring Replication & Disaster Recovery capabilities of Dell Storage Arrays to Kubernetes clusters. It helps you replicate groups of volumes and can provide you a way to restart applications in case of both planned and unplanned migration.
[...Learn more](replication/)
{{< /card >}}
{{< /cardpane >}}
{{< cardpane >}}
{{< card header="[**Resiliency**](resiliency/)"
          footer="Supports [PowerFlex](csidriver/features/powerflex/) [PowerScale](csidriver/features/powerscale/) [Unity](csidriver/features/unity/) [PowerStore](csidriver/features/powerstore/)">}}
  CSM for Resiliency is designed to make Kubernetes Applications, including those that utilize persistent storage, more resilient to various failures.
[...Learn more](resiliency/)
  {{< /card >}}
{{< card header="[**Observability**](observability/)"
          footer="Supports [PowerFlex](csidriver/features/powerflex/) [PowerStore](csidriver/features/powerstore/) [PowerScale](csidriver/features/powerscale/) [PowerMax](csidriver/features/powermax/)">}}
 CSM for Observability provides visibility on the capacity of the volumes/file shares that is being managed with Dell CSM CSI (Container Storage Interface) drivers along with their performance in terms of bandwidth, IOPS, and response time.
[...Learn more](observability/)
  {{< /card >}}
{{< /cardpane >}}
{{< cardpane >}}
{{< card header="[**Application Mobility**](applicationmobility/)"
          footer="Supports all platforms">}}
  Container Storage Modules for Application Mobility provide Kubernetes administrators the ability to clone their stateful application workloads and application data to other clusters, either on-premise or in the cloud.
  [...Learn more](applicationmobility/)
  {{< /card >}}
   {{< card header="[**Encryption**](secure/encryption)"
          footer="Supports PowerScale">}}
  Encryption provides the capability to encrypt user data residing on volumes created by Dell CSI Drivers.
   [...Learn more](secure/encryption/)
  {{< /card >}}
{{< /cardpane >}}
{{< cardpane >}}
   {{< card header="[License](support/license/)"
          footer="Required for [Application Mobility](applicationmobility/) & [Encryption](secure/encryption/)">}}
  The tech-preview releases of Application Mobility and Encryption require a license.
  Request a license using the [Container Storage Modules License Request](https://app.smartsheet.com/b/form/5e46fad643874d56b1f9cf4c9f3071fb) by providing the requested details.
   [...Learn more](support/license/)
  {{< /card >}}
{{< /cardpane >}}