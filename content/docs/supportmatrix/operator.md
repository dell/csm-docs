---
title: "CSM Operator Compatibility Matrix"
linkTitle: "CSM Operator Compatibility Matrix"
description: Support Matrix for Container Storage Modules
weight: 1 
toc_hide: true
---  
## Container Storage Module Operator compatibility matrix

The table below lists the driver and modules versions installable with the Container Storage Modules Operator:
{{<table "table table-striped table-bordered table-sm">}}
| CSI Driver         | Version | CSM Authorization 1.x.x , 2.x.x | CSM Replication | CSM Observability | CSM Resiliency |
| ------------------ |---------|---------------------------------|-----------------|-------------------|----------------|
| CSI PowerScale     | 2.13.0  | ✔ 1.13.0 , 2.0.0                | ✔ 1.11.0       | ✔ 1.11.0          | ✔ 1.12.0      |
| CSI PowerScale     | 2.12.0  | ✔ 1.12.0 , 2.0.0                | ✔ 1.10.0       | ✔ 1.10.0          | ✔ 1.11.0      |
| CSI PowerScale     | 2.11.0  | ✔ 1.11.0 , ❌                  | ✔ 1.9.0        | ✔ 1.9.0           | ✔ 1.10.0      |
| CSI PowerFlex      | 2.13.0  | ✔ 1.13.0 , 2.0.0                | ✔ 1.11.0       | ✔ 1.11.0          | ✔ 1.12.0      |
| CSI PowerFlex      | 2.12.0  | ✔ 1.12.0 , 2.0.0                | ✔ 1.10.0       | ✔ 1.10.0          | ✔ 1.11.0      |
| CSI PowerFlex      | 2.11.0  | ✔ 1.11.0 , ❌                  | ✔ 1.9.0        | ✔ 1.9.0           | ✔ 1.10.0      |
| CSI PowerStore     | 2.13.0  | ❌ , ❌                        | ❌             | ❌                | ✔ 1.12.0      |
| CSI PowerStore     | 2.12.0  | ❌ , ❌                        | ❌             | ❌                | ✔ 1.11.0      |
| CSI PowerStore     | 2.11.1  | ❌ , ❌                        | ❌             | ❌                | ✔ 1.10.0      |
| CSI PowerMax       | 2.13.0  | ✔ 1.13.0 , 2.0.0                | ✔ 1.11.0       | ✔ 1.11.0          | ✔ 1.12.0      |
| CSI PowerMax       | 2.12.0  | ✔ 1.12.0 , 2.0.0                | ✔ 1.10.0       | ✔ 1.10.0          | ✔ 1.11.0      |
| CSI PowerMax       | 2.11.0  | ✔ 1.11.0 , ❌                  | ✔ 1.9.0        | ✔ 1.9.0           | ✔ 1.10.0      |
| CSI Unity XT       | 2.13.0  | ❌ , ❌                        | ❌             | ❌                | ❌            |
| CSI Unity XT       | 2.12.0  | ❌ , ❌                        | ❌             | ❌                | ❌            |
| CSI Unity XT       | 2.11.1  | ❌ , ❌                        | ❌             | ❌                | ❌            |
{{</table>}}