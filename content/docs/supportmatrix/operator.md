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
| CSI PowerScale     | {{< version-docs key="PScale_latestVersion" >}}  | ✔ {{< version-docs key="csm_authorization_version" >}}                | ✔ {{< version-docs key="csm_replication_version" >}}       | ✔ {{< version-docs key="csm_observability_version" >}}          | ✔ {{< version-docs key="csm_resiliency_version" >}}      |
| CSI PowerFlex      | {{< version-docs key="PFlex_latestVersion" >}}  | ✔ {{< version-docs key="csm_authorization_version" >}} , {{< version-docs key="csm_authorization_version" >}}                | ✔ {{< version-docs key="csm_replication_version" >}}       | ✔ {{< version-docs key="csm_observability_version" >}}          | ✔ {{< version-docs key="csm_resiliency_version" >}}      |
| CSI PowerStore     | {{< version-docs key="PStore_latestVersion" >}}  | ❌ , ❌                        | ✔ {{< version-docs key="csm_replication_version" >}}       | ✔ {{< version-docs key="csm_observability_version" >}}          | ✔ {{< version-docs key="csm_resiliency_version" >}}      |
| CSI PowerMax       | {{< version-docs key="PMax_latestVersion" >}}  | ✔ {{< version-docs key="csm_authorization_version" >}}                | ✔ {{< version-docs key="csm_replication_version" >}}       | ✔ {{< version-docs key="csm_observability_version" >}}          | ✔ {{< version-docs key="csm_resiliency_version" >}}      |
| CSI Unity XT       | {{< version-docs key="PUnity_latestVersion" >}}  | ❌ , ❌                        | ❌             | ❌                | ❌            |
{{</table>}}
