---
title: "Authorization"
linkTitle: "Authorization"
weight: 4
Description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization
---

[Container Storage Modules](https://github.com/dell/csm) (CSM) for Authorization is part of the open-source suite of Kubernetes storage enablers for Dell products.

CSM for Authorization provides storage and Kubernetes administrators the ability to apply RBAC for Dell CSI Drivers. It does this by deploying a proxy between the CSI driver and the storage system to enforce role-based access and usage rules.

Storage administrators of compatible storage platforms will be able to apply quota and RBAC rules that instantly and automatically restrict cluster tenants usage of storage resources. Users of storage through CSM for Authorization do not need to have storage admin root credentials to access the storage system.

Kubernetes administrators will have an interface to create, delete, and manage roles/groups that storage rules may be applied. Administrators and/or users may then generate authentication tokens that may be used by tenants to use storage with proper access policies being automatically enforced.

Currently, we have two versions of Authorization, **v1.x** and **v2.x**. **v2.x is not backward compatible with v1.x versions**.

**Starting with CSM 1.13, Authorization v1.x will be deprecated and will be officially discontinued by CSM 1.15 in September 2025. Please migrate to Authorization v2.0 before then to avoid any issues using the v2 Migration guide linked below.**
