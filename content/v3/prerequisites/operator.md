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
| CSI PowerScale     | 2.11.0  | ✔ 1.11.0 , ❌                  | ✔ 1.9.0        | ✔ 1.9.0           | ✔ 1.10.0      |
| CSI PowerFlex      | 2.11.0  | ✔ 1.11.0 , ❌                  | ✔ 1.9.0        | ✔ 1.9.0           | ✔ 1.10.0      |
| CSI PowerStore     | 2.11.1  | ❌ , ❌                        | ❌             | ❌                | ✔ 1.10.0      |
| CSI PowerMax       | 2.11.0  | ✔ 1.11.0 , ❌                  | ✔ 1.9.0        | ✔ 1.9.0           | ✔ 1.10.0      |
| CSI Unity XT       | 2.11.1  | ❌ , ❌                        | ❌             | ❌                | ❌            |
{{</table>}} 

## CSM Component Versions

{{<table "table table-striped table-bordered table-sm">}}
| Component | Image Version |
| - | - |
|<div style="text-align:left"> CSI PowerFlex | v2.11.0 |
|<div style="text-align:left"> CSI PowerStore | v2.11.1 |
|<div style="text-align:left"> CSI PowerMax | v2.11.0 |
|<div style="text-align:left"> CSI PowerScale | v2.11.0 |
|<div style="text-align:left"> CSI Unity XT | v2.11.1 |
|<div style="text-align:left"> CSM Authorization | v1.11.0 |
|<div style="text-align:left"> CSM Observability | v1.9.0 |
|<div style="text-align:left"> CSM Replication | v1.9.0 |
|<div style="text-align:left"> CSM Resiliency | v1.10.0 |
|<div style="text-align:left"> CSM Application Mobility | v1.1.0 |
{{</table>}}