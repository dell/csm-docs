---
title: "Offline Dependecies"
linkTitle: "Offline Dependencies"
no_list: true
description: Offline Dependencies
weight: 4
--- 
{{% pageinfo color="primary" %}}
{{< message text="3" >}}
{{% /pageinfo %}}
The `csi-offline-bundle.sh` script can be used to create a package usable for offline installation of the Dell CSI Storage Providers, via either Helm or the Dell CSM Operator. 

## Dependencies

Multiple Linux-based systems may be required to create and process an offline bundle for use.
* One Linux-based system, with Internet access, will be used to create the bundle. This involved the user cloning a git repository hosted on github.com and then invoking a script that utilizes `docker` or `podman` to pull and save container images to file.
* One Linux-based system, with access to an image registry, to invoke a script that uses `docker` or `podman` to restore container images from file and push them to a registry
* RedHat credentials to pull `openshift4/ose-kube-rbac-proxy-rhel9` image from `registry.redhat.io` (This registry does not support unauthenticated access)

If one Linux system has both Internet access and access to an internal registry, that system can be used for both steps.

Preparing an offline bundle requires the following utilities:

| Dependency            | Usage |
| --------------------- | ----- |
| `docker` or `podman`  | `docker` or `podman` will be used to pull images from public image registries, tag them, and push them to a private registry.  |
|                       | One of these will be required on both the system building the offline bundle as well as the system preparing for installation. |
|                       | Tested version(s) are `docker` 19.03+ and `podman` 1.6.4+
| `git`                 | `git` will be used to manually clone one of the above repositories in order to create an offline bundle.
|                       | This is only needed on the system preparing the offline bundle.
|                       | Tested version(s) are `git` 1.8+ but any version should work.
