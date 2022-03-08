---
title: Monitoring
linktitle: Monitoring
weight: 6
description: >
  DellCSIReplicationGroup Monitoring
---

The dell-csm-replicator supports monitoring of DellCSIReplicationGroup Custom Resources (CRs).

Each RG is polled at a pre-defined interval and for each RG, a gRPC call is made to the driver which returns the status of 
the protection group on the array. 

If an RG doesn't have any PVs associated with it, the driver will not receive any monitoring request for that RG.

This status can be obtained from the RG as under:

```
NAME                                                 AGE     STATE   LINK STATE     LAST LINKSTATE UPDATE
replicated-rg-240721b0-12fb-4151-8dd8-94794ae2493e   51d     Ready   SUSPENDED      2021-09-10T10:48:09Z
```


