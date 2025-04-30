---
title: "Offline Dependencies"
linkTitle: "Offline Dependencies"
no_list: true
description: Offline Dependencies
weight: 4
--- 
{{% pageinfo color="primary" %}}
{{< message text="3" >}}
{{% /pageinfo %}}
The `csi-offline-bundle.sh` script creates a package for offline installation of Dell CSI Storage Providers using Helm or the Dell CSM Operator. 

## Dependencies

* Multiple Linux systems may be needed.
  * One system with Internet access to create the bundle:Clone a GitHub repository.
  * Run a script using Docker or Podman to pull and save container images.
  * One system with access to an image registry to : Run a script using Docker or Podman to restore and push images to the registry.
* RedHat credentials to pull `openshift4/ose-kube-rbac-proxy-rhel9` image from `registry.redhat.io` (no unauthenticated access).

If one system has both Internet access and registry access, it can be used for both steps.

## Dependencies and Usage

Preparing an offline bundle requires the following utilities: 

<div class="tdleft">

| **Dependency**            | **Usage** |
| ------------------------- | ----- |
| **`docker` or `podman`**  | Used to pull images from public registries, tag them, and push to a private registry.   |
|                           | Required on both the system building the offline bundle and the system preparing for installation.  |
|                           |Tested versions: docker 19.03+ and podman 1.6.4+.
| **`git`**                 | Used to manually clone repositories to create an offline bundle. 
|                           | Needed only on the system preparing the offline bundle. 
|                           | Tested versions: git 1.8+ (any version should work).

</div>