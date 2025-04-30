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
| CSI PowerScale     | 2.13.0  | ✔ 1.13.0 , 2.1.0                | ✔ 1.11.0       | ✔ 1.11.0          | ✔ 1.12.0      |
| CSI PowerFlex      | 2.13.0  | ✔ 1.13.0 , 2.1.0                | ✔ 1.11.0       | ✔ 1.11.0          | ✔ 1.12.0      |
| CSI PowerStore     | 2.13.0  | ❌ , ❌                        | ❌             | ❌                | ✔ 1.12.0      |
| CSI PowerMax       | 2.13.0  | ✔ 1.13.0 , 2.1.0                | ✔ 1.11.0       | ✔ 1.11.0          | ✔ 1.12.0      |
| CSI Unity XT       | 2.13.0  | ❌ , ❌                        | ❌             | ❌                | ❌            |
{{</table>}}
