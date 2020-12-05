---
title: "Docker EE"
Description: "About Docker Enterprise Edition" 
---

The Dell CSI Drivers support Docker Enterprise Edition (EE) and deployment on clusters bootstrapped with Docker Universal Control Plane (UCP).

The installation process for the drivers on such clusters remains the same as the installation process on regular Kubernetes clusters.

On UCP based clusters, kubectl may not be installed by default, it is important that kubectl is installed prior to the installation of the driver.

The worker nodes on UCP backed clusters may run any of the OSs which we support with upstream clusters.

## Docker EE UI Examples

![](/storage-plugin-docs/images/first.png)

![](/storage-plugin-docs/images/second.png)

![](/storage-plugin-docs/images/third.png)
