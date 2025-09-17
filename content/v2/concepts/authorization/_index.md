---
title: "Authorization"
linkTitle: "Authorization"
no_list: true 
weight: 4
Description: >
  Container Storage Modules (CSM) for Authorization
---

{{% pageinfo color="primary" %}}
{{< message text="5" >}} 
{{% /pageinfo %}}

Container Storage Modules for Authorization is part of the open-source suite of Kubernetes storage enablers for Dell products.

Container Storage Modules for Authorization provides storage and Kubernetes administrators the ability to apply RBAC for Dell CSI Drivers. It does this by deploying a proxy between the CSI driver and the storage system to enforce role-based access and usage rules.

Storage administrators of compatible storage platforms will be able to apply quota and RBAC rules that instantly and automatically restrict cluster tenants usage of storage resources. Users of storage through Container Storage Modules for Authorization do not need to have storage admin root credentials to access the storage system.

Kubernetes administrators will have an interface to create, delete, and manage roles/groups that storage rules may be applied. Administrators and/or users may then generate authentication tokens that may be used by tenants to use storage with proper access policies being automatically enforced.

Currently, we have two versions of Authorization, **v1.x** and **v2.x**. **v2.x is not backward compatible with v1.x versions**.


{{< cardcontainer >}} 

    {{< customcard link="./v1.x"  title="v1.x"  >}} 

    {{< customcard   link="./v2.x"  title="v2.x" >}} 

    {{< customcard  link="./migration-guide-from-v1-to-v2"  title="Migration from v1 to v2"  >}} 

{{< /cardcontainer >}}