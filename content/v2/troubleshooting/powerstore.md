---
title: PowerStore
linktitle: PowerStore 
description: Troubleshooting PowerStore Driver
---
| Symptoms | Prevention, Resolution or Workaround |
| --- | --- | 
| When you run the command `kubectl describe pods powerstore-controller-<suffix> –n csi-powerstore`, the system indicates that the driver image could not be loaded. | - If on Kubernetes, edit the daemon.json file found in the registry location and add `{ "insecure-registries" :[ "hostname.cloudapp.net:5000" ] }` <br> - If on OpenShift, run the command `oc edit image.config.openshift.io/cluster` and add registries to yaml file that is displayed when you run the command.|
| The `kubectl logs -n csi-powerstore powerstore-node-<suffix>` driver logs shows that the driver can't connect to PowerStore API. | Check if you've created secret with correct credentials |
