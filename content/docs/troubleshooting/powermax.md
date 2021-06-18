---
title: PowerMax
linktitle: PowerMax 
description: Troubleshooting PowerMax Driver
---
| Symptoms | Prevention, Resolution or Workaround |
|------------|--------------|
| Warning about feature gates | Double check that you have applied all the features to the indicated processes. Restart kubelet when remediated.|
| `kubectl describe pod powermax-controller-<xyz> –n <namespace>` indicates the driver image could not be loaded | You may need to put an insecure-registries entry in `/etc/docker/daemon.json` or login to the docker registry |
| `kubectl logs powermax-controller-<xyz> –n <namespace> driver` logs show the driver cannot authenticate | Check your secret’s username and password |
| `kubectl logs powermax-controller-<xyz> –n <namespace> driver` logs show the driver failed to connect to the U4P because it couldn’t verify the certificates | Check the powermax-certs secret and ensure it is not empty or it has the valid certificates|
