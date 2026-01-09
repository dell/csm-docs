---
title: "Uninstallation"
linkTitle: "Uninstallation"
weight: 4
description: Methods to uninstall Dell COSI Driver
---

## Uninstall COSI driver installed via CSM Operator

```bash
kubectl -n dell-cosi delete csm cosi
```

## Uninstall COSI driver installed via Helm

To uninstall a driver use a helm uninstall command:

```bash
helm uninstall dell-cosi --namespace dell-cosi
```
