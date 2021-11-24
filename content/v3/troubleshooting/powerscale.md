---
title: PowerScale
description: Troubleshooting PowerScale Driver
---

Here are some installation failures that might be encountered and how to mitigate them.

| Symptoms | Prevention, Resolution or Workaround |
|------------|--------------|
|The `kubectl logs isilon-controller-0 -n isilon -c driver` logs shows the driver **cannot authenticate** | Check your secret's username and password for corresponding cluster |
|The `kubectl logs isilon-controller-0 -n isilon -c driver` logs shows the driver failed to connect to the Isilon because it **couldn't verify the certificates** |  Check the isilon-certs-<n> secret and ensure it is not empty and it has the valid certificates. Set `isiInsecure: "true"` for insecure connection. SSL validation is recommended in production environment. |
|The `kubectl logs isilon-controller-0 -n isilon -c driver` logs shows the driver error: **create volume failed, Access denied. create directory as requested** | This situation can happen when the user who created the base path is different from the user configured for the driver. Make sure the user used to deploy CSI-Driver must have enough rights on the base path (i.e. isiPath) to perform all operations. |
