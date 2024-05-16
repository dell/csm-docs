---
title: Authorization - v2.0 Tech Preview
linktitle: v2.0 Tech Preview
weight: 4
Description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization v2.0 Tech Preview.
tags: 
 - csm-authorization
---

>> NOTE: This tech-preview release is not intended for use in production environment.

>> NOTE: Only supported on PowerFlex.

The following diagram shows a high-level overview of CSM for Authorization with a `tenant-app` that is using a CSI driver to perform storage operations through the CSM for Authorization `proxy-server` to access the a Dell storage system. All requests from the CSI driver will contain the token for the given tenant that was granted by the Storage Administrator.

This is the introduction to a Stateless Architecture for Authorization. The creation of storage, roles and tenants are purely done through k8s objects which are tracked and contained within authorization. The underlying communication is consistent from the previous architecture which makes creation of volumes seemless.
