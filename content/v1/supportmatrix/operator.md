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
| CSI PowerScale     | {{< version-v1 key="PScale_latestVersion" >}}  | ✔ {{< version-v1 key="Authv2" >}}                | ✔ {{< version-v1 key="Replication" >}}       | ✔ {{< version-v1 key="Observability" >}}          | ✔ {{< version-v1 key="Resiliency" >}}      |
| CSI PowerFlex      | {{< version-v1 key="PFlex_latestVersion" >}}  | ✔ {{< version-v1 key="Authv1" >}} , {{< version-v1 key="Authv2" >}}                | ✔ {{< version-v1 key="Replication" >}}       | ✔ {{< version-v1 key="Observability" >}}          | ✔ {{< version-v1 key="Resiliency" >}}      |
| CSI PowerStore     | {{< version-v1 key="PStore_latestVersion" >}}  | ❌ , ❌                        | ✔ {{< version-v1 key="Replication" >}}       | ✔ {{< version-v1 key="Observability" >}}          | ✔ {{< version-v1 key="Resiliency" >}}      |
| CSI PowerMax       | {{< version-v1 key="PMax_latestVersion" >}}  | ✔ {{< version-v1 key="Authv2" >}}                | ✔ {{< version-v1 key="Replication" >}}       | ✔ {{< version-v1 key="Observability" >}}          | ✔ {{< version-v1 key="Resiliency" >}}      |
| CSI Unity XT       | {{< version-v1 key="PUnity_latestVersion" >}}  | ❌ , ❌                        | ❌             | ❌                | ❌            |
{{</table>}}
