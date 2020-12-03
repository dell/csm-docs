---
title: PowerScale
description: Troubleshooting PowerScale Driver
---

Here are some installation failures that might be encountered and how to mitigate them.

- `kubectl logs isilon-controller-0 -n isilon -c driver` logs shows the driver **cannot authenticate** (check your secret's username and password).
- `kubectl logs isilon-controller-0 -n isilon -c driver` logs shows the driver failed to connect to the Isilon because it **couldn't verify the certificates**, then check the isilon-certs secret and ensure it is not empty and it has the valid certificates. Set `isiInsecure: "true"` for insecure connection. SSL validation is recommended in production environment.

