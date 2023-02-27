---
title: Replication
linkTitle: "Replication"
description: >
  Pre-requisite for Installing Replication via Dell CSM Operator
---

The CSM Replication module for supported Dell CSI Drivers can be installed via the Dell CSM Operator. Dell CSM Operator will deploy CSM Replication sidecar and the complemental CSM Replication controller manager.

## Prerequisite

To use Replication, you need at least two clusters:

- a source cluster which is the main cluster
- one or more target clusters which will serve as diaster recovery clusters for the main cluster

To configure all the clusters, follow the steps below:

1. On your main cluster, follow the instructions available in CSM Replication for [Installation using repctl](../../../../replication/deployment/install-repctl). NOTE: On step 4 of the link above, you MUST use the command below to automatically package all clusters' `.kube` config as a secret:           

```shell
  ./repctl cluster inject 
```

CSM Operator needs this admin configs instead of the service accounts’ configs  to be able to properly manage the target clusters. The default service account that'll be used is the CSM Operator service account.

2. On each of the target clusters, configure the prerequisites for deploying the driver via Dell CSM Operator. For example, PowerScale has the following [prerequisites for deploying PowerScale via Dell CSM Operator](../../drivers/powerscale/#prerequisite)