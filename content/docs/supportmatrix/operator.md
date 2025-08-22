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
| CSI PowerScale     | {{< version-docs key="PScale_latestVersion" >}}  | ✔ {{< version-docs key="Authv2" >}}                | ✔ {{< version-docs key="Replication" >}}       | ✔ {{< version-docs key="Observability" >}}          | ✔ {{< version-docs key="Resiliency" >}}      |
| CSI PowerFlex      | {{< version-docs key="PFlex_latestVersion" >}}  | ✔ {{< version-docs key="Authv1" >}} , {{< version-docs key="Authv2" >}}                | ✔ {{< version-docs key="Replication" >}}       | ✔ {{< version-docs key="Observability" >}}          | ✔ {{< version-docs key="Resiliency" >}}      |
| CSI PowerStore     | {{< version-docs key="PStore_latestVersion" >}}  | ❌ , ❌                        | ✔ {{< version-docs key="Replication" >}}       | ✔ {{< version-docs key="Observability" >}}          | ✔ {{< version-docs key="Resiliency" >}}      |
| CSI PowerMax       | {{< version-docs key="PMax_latestVersion" >}}  | ✔ {{< version-docs key="Authv2" >}}                | ✔ {{< version-docs key="Replication" >}}       | ✔ {{< version-docs key="Observability" >}}          | ✔ {{< version-docs key="Resiliency" >}}      |
| CSI Unity XT       | {{< version-docs key="PUnity_latestVersion" >}}  | ❌ , ❌                        | ❌             | ❌                | ❌            |
{{</table>}}
