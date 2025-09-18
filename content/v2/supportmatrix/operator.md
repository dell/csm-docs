---
title: "CSM Operator Compatibility Matrix"
linkTitle: "CSM Operator Compatibility Matrix"
weight: 1
toc_hide: true
---


The table below lists the driver and modules versions installable with the Container Storage Modules Operator:
{{<table "table table-striped table-bordered table-sm">}}
| CSI Driver         | Version | CSM Authorization 1.x.x , 2.x.x | CSM Replication | CSM Observability | CSM Resiliency |
| ------------------ |---------|---------------------------------|-----------------|-------------------|----------------|
| CSI PowerScale     | {{< version-v2 key="PScale_latestVersion" >}}  | ✔ {{< version-v2 key="Authv1" >}} , {{< version-v2 key="Authv2" >}}                | ✔ {{< version-v2 key="Replication" >}}       | ✔ {{< version-v2 key="Observability" >}}          | ✔ {{< version-v2 key="Resiliency" >}}      |
| CSI PowerFlex      | {{< version-v2 key="PFlex_latestVersion" >}}  | ✔ {{< version-v2 key="Authv1" >}} , {{< version-v2 key="Authv2" >}}                | ✔ {{< version-v2 key="Replication" >}}       | ✔ {{< version-v2 key="Observability" >}}          | ✔ {{< version-v2 key="Resiliency" >}}      |
| CSI PowerStore     | {{< version-v2 key="PStore_latestVersion" >}}  | ❌ , ❌                        | ❌             | ❌                | ✔ {{< version-v2 key="Resiliency" >}}      |
| CSI PowerMax       | {{< version-v2 key="PMax_latestVersion" >}}  | ✔ {{< version-v2 key="Authv1" >}} , {{< version-v2 key="Authv2" >}}                | ✔ {{< version-v2 key="Replication" >}}       | ✔ {{< version-v2 key="Observability" >}}          | ✔ {{< version-v2 key="Resiliency" >}}      |
| CSI Unity XT       | {{< version-v2 key="PUnity_latestVersion" >}}  | ❌ , ❌                        | ❌             | ❌                | ❌            |
{{</table>}}
