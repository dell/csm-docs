---
title: "CSM Operator Compatibility Matrix"
linkTitle: "CSM Operator Compatibility Matrix"
weight: 1
toc_hide: true
---


The table below lists the driver and modules versions installable with the Container Storage Modules Operator:
{{<table "table table-striped table-bordered table-sm">}}
| CSI Driver         | Version | CSM Authorization 2.x.x | CSM Replication | CSM Observability | CSM Resiliency |
| ------------------ |---------|---------------------------------|-----------------|-------------------|----------------|
| CSI PowerScale     | {{< version-docs key="csi_powerscale_latest_version" >}}  | ✔ {{< version-docs key="csm_authorization_version" >}}                | ✔ {{< version-docs key="csm_replication_version" >}}       | ✔ {{< version-docs key="csm_observability_version" >}}          | ✔ {{< version-docs key="csm_resiliency_version" >}}      |
| CSI PowerFlex      | {{< version-docs key="csi_powerflex_latest_version" >}}  | ✔ {{< version-docs key="csm_authorization_version" >}} , {{< version-docs key="csm_authorization_version" >}}                | ✔ {{< version-docs key="csm_replication_version" >}}       | ✔ {{< version-docs key="csm_observability_version" >}}          | ✔ {{< version-docs key="csm_resiliency_version" >}}      |
| CSI PowerStore     | {{< version-docs key="csi_powerstore_latest_version" >}}  | ❌ , ❌                        | ✔ {{< version-docs key="csm_replication_version" >}}       | ✔ {{< version-docs key="csm_observability_version" >}}          | ✔ {{< version-docs key="csm_resiliency_version" >}}      |
| CSI PowerMax       | {{< version-docs key="csi_powermax_latest_version" >}}  | ✔ {{< version-docs key="csm_authorization_version" >}}                | ✔ {{< version-docs key="csm_replication_version" >}}       | ✔ {{< version-docs key="csm_observability_version" >}}          | ✔ {{< version-docs key="csm_resiliency_version" >}}      |
| CSI Unity XT       | {{< version-docs key="csi_unity_latest_version" >}}  | ❌ , ❌                        | ❌             | ❌                | ❌            |
{{</table>}}
