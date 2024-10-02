---
title: Upgrade
linktitle: Upgrade
description: Upgrading COSI Driver
weight: 5
---

## Update Driver from v0.1.0 to v0.1.1 using Helm
**Steps**
1. Run `git clone https://github.com/dell/helm-charts.git` to clone the git repository and get the newest helm chart.
2. Run the `helm upgrade`:
   ```bash
   helm upgrade <release_name> ./helm-charts/charts/cosi/ -n <namespace>
   ```
