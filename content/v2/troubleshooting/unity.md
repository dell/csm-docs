---
title: Unity
description: Troubleshooting Unity Driver
---

---
| Symptoms | Prevention, Resolution or Workaround |
| --- | --- |
| When you run the command `kubectl describe pods unity-controller-<suffix> –n unity`, the system indicates that the driver image could not be loaded. | You may need to put an insecure-registries entry in `/etc/docker/daemon.json` or login to the docker registry |
| The `kubectl logs -n unity unity-node-<suffix>` driver logs shows that the driver can't connect to Unity - Authentication failure. | Check if you've created secret with correct credentials |
