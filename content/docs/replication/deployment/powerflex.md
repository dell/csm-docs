---
title: PowerFlex
linktitle: PowerFlex
weight: 6
description: Enabling Replication feature for CSI PowerFlex
---
## Enabling Replication In CSI PowerFlex

Container Storage Modules (CSM) Replication sidecar is a helper container that is installed alongside a CSI driver to facilitate replication functionality. Such CSI drivers must implement `dell-csi-extensions` calls.

CSI driver for Dell PowerFlex supports necessary extension calls from `dell-csi-extensions`. To be able to provision replicated volumes you would need to do the steps described in the following sections.

### Before Installation

#### On Storage Array