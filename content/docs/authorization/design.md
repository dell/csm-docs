---
title: Design
linktitle: Design
weight: 1
description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization design
---

{{% pageinfo color="primary" %}}
The CSM Authorization karavictl CLI is no longer actively maintained or supported. It will be deprecated in CSM 1.9.
{{% /pageinfo %}}

Container Storage Modules (CSM) for Authorization is designed as a service mesh solution and consists of many internal components that work together in concert to achieve its overall functionality.

This document provides an overview of the major components, including how they fit together and pointers to implementation details.

If you are a developer who is new to CSM for Authorization and want to build a mental map of how it works, you're in the right place.

## Terminology

* **Service Mesh** - An infrastructure layer consisting of proxies that intercept and route requests between existing services.
* **CSI** - Acronym for the Container Storage Interface.
* **Proxy (L7)** - A gateway between networked services that inspects request traffic.
* **Sidecar Proxy** - A service mesh proxy that runs alongside existing services, rather than within them.
* **Pod** - A Kubernetes abstraction for a set of related containers that are to be considered as one unit.
* **Tenant** - A named persona who owns a Kubernetes cluster and is considered the "client-side" user.
* **Storage Administrator** - A named persona who owns a storage array and is considered the admin user.

## Bird's Eye View

```
+-----------------------------------+                                                                                 
|   Kubernetes                      |                                                                                 
|                                   |                                                                                 
|  +---------+         +---------+  |            +---------------+                                            
|  | CSI     |         | Sidecar |  |            | CSM           |              +---------+        
|  | Driver  |---------> Proxy   |---------------> Authorization |--------------> Storage |                              
|  +---------+         +---------+  |            | Server        |              | Array   |                              
|                                   |            +---------------+              +---------+                              
+-----------------------------------+                  ^                                                              
                                                       |                                                              
                                                       |                                                              
                                                       |                                                              
                                                 +------------+                                                       
                                                 |  karavictl |                                                       
                                                 |  CLI       |                                                       
                                                 +------------+                                                 
```

**NOTE:** Arrows indicate request or connection initiation, not necessarily data flow direction.

The sections below explain each component in the diagram.

### Kubernetes

The architecture assumes a Kubernetes cluster that intends to offer external storage to applications hosted therein.
The mechanism for managing this storage would utilize a CSI Driver.

**Architecture Invariant**: We assume there may be many Kubernetes clusters, potentially containing multiple CSI Drivers each with their own Sidecar Proxy.

### CSI Driver

A CSI Driver supports the Container Service Interface (CSI) specification. Dell provides customers with CSI Drivers for its various storage arrays.
CSM for Authorization intends to support a majority, if not all, of these drivers.

A CSI Driver will typically be configured to communicate directly to its intended storage array and as such will be limited in using only the authentication
methods supported by the Storage Array itself, e.g. Basic authentication over TLS.

**Architecture Invariant**: We try to avoid having to make any code changes to the CSI Driver when adding support for it. Any CSI Driver should ideally not be aware that it is communicating to the Sidecar Proxy.

### Sidecar Proxy

The CSM for Authorization Sidecar Proxy is deployed as a sidecar in the CSI Driver's Pod. It acts as a proxy and forwards all requests to a
CSM Authorization Server.

The [CSI Driver section](#csi-driver) noted the limitation of a CSI Driver using Storage Array supported authentication methods only. By nature of being a proxy, the CSM for Authorization
Sidecar Proxy is able to override the Authorization HTTP header for outbound requests to use Bearer tokens. Such tokens are managed by CSM for Authorization as will
be described later in this document.

### CSM for Authorization Server

The CSM for Authorization Server is, at its core, a Layer 7 proxy for intercepting traffic between a CSI Driver and a Storage Array.

Inbound requests are expected to originate from the CSM for Authorization Sidecar Proxy, for the following reasons:

* Processing a set of agreed upon HTTP headers (added by the CSM for Authorization Sidecar Proxy) to assist in routing traffic to the intended Storage Array.
* Inspection of CSM-specific Authorization Bearer tokens.

### CSM for Authorization CLI

The [*karavictl*](../cli) CLI (Command Line Interface) application allows Storage Admins to manage and interact with a running CSM for Authorization Server.

### Storage Array

A Storage Array is typically considered to be one of the various Dell storage offerings, e.g. Dell PowerFlex which is supported by CSM for Authorization
today.  Support for more Storage Arrays will come in the future.

## How it Works

CSM for Authorization intends to override the existing authorization methods between a CSI Driver and its Storage Array. This may be desirable for several reasons, if:

* The CSI Driver requires privileged login credentials (e.g. "root") in order to function.
* The Storage Array does not natively support the concept of RBAC and/or multi-tenancy.

This section of of the document describes how CSM for Authorization provides a solution to these problems.

### Bearer Tokens

CSM for Authorization overrides any existing authorization mechanism between a CSI Driver and its corresponding Storage Array with the use of JSON Web Tokens (JWTs). The CSI Driver and Storage Array will not be aware of this taking place.

In the context of [RFC-6749](https://tools.ietf.org/html/rfc6749#section-1.5) there are two such JWTs that are used:

* Access token: a single token valid for a short period of time.
* Refresh token: a single token used to obtain access tokens.  Typically valid for a longer period of time.

Both tokens are opaque to the client, yet provide meaningful information to the server, specifically:

* The Tenant for whom the token is associated with.
* The Roles that are bound to the Tenant.

Tokens encode the following set of claims:

```json
{
  "aud": "karavi",
  "exp": 1915585883,
  "iss": "com.dell.karavi",
  "sub": "karavi-tenant",
  "roles": "role-a,role-b,role-c",
  "group": "Tenant-1"
}
```

Both tokens are signed using a server-side secret preventing the risk of tampering by any client. For example, a bad-actor is unable to modify a token to give themselves a role that they should not have, at least without knowing the server-side secret.

The refresh approach is beneficial for the following reasons:

* Accidental exposure of an access token poses a lesser security concern, given the set expiration time is short (e.g. 30 seconds).
* The CSM for Authorization Server can fully trust the access token without having to perform a database check on each request (doing so would nullify the benefits of using tokens in the first place).
* The CSM for Authorization Server can defer Tenant checks at refresh time only, e.g. do not allow refresh if the Tenant's access has been revoked by a Storage Admin. There may be a short time window in between revocation and enforcement, depending on the access token's expiration time.

The following diagram shows the access and refresh tokens in play and how a valid access token is required for a request to be proxied to the intended Storage Array.

```
  +---------+                                           +---------------+
  |         |                                           |               |
  |         |                                           |               |       +----------+
  |         |--(A)------------ Access Token ----------->|               |------>|          |
  |         |                                           |     CSM       |       |          |
  |         |<-(B)---------- Protected Resource --------| Authorization |<------|  Storage |
  | Sidecar |                                           |     Server    |       |   Array  |
  | Proxy   |--(C)------------ Access Token ----------->|               |       |          |
  |         |                                           |               |       |          |
  |         |<-(D)------ Invalid Token Error -----------|               |       |          |
  |         |                                           |               |       +----------+
  |         |                                           |               |
  |         |--(E)----------- Refresh Token ----------->|               |
  |         |            & Expired Access Token         |               |
  |         |<-(F)----------- Access Token -------------|               |
  +---------+                                           +---------------+
```

* A) CSI Driver makes a request to the Storage Array:
  * request is intercepted by the Sidecar Proxy to add the access token.
  * The CSM for Authorization Server deems the access token valid.
  * The CSM for Authorization Server permits the request to be proxied to the intended Storage Array.
* B) Storage Array response is sent back as expected.
* C) CSI Driver makes a request to the Storage Array:
  * request is intercepted by the Sidecar Proxy to add the access token.
  * The CSM for Authorization Server deems the access token is invalid; it has since expired.
* D) The CSM for Authorization Server responds with HTTP 401 Unauthorized.
* E) Sidecar Proxy requests a new access token by passing both refresh token and expired token.
* F) The CSM for Authorization Server processes the request:
  * is the refresh token valid?
  * is the access token expired?
  * has the Tenant had access revoked?
  * a new access token is sent in response if the checks pass.

### Roles

So we know a token encodes both the identification of a Tenant and their Roles, but what's in a Role?

A role can be defined as follows:

* It has a name, e.g. "role-a".
* It can be bound to a Tenant
* It can be unbound from a Tenant.
* It determines access to zero or more storage pools and assigns a storage quota for each.
  * Quota represents the upper-limit of the total aggregation of used storage capacity for a Tenant's resources in a storage pool.
* It prevents ambiguity by identifying each storage pool in the form of *system-type:system-id:pool-name*.

Below is an example of how roles are represented internally in JSON:

```json
{
  "Developer": {
    "system_types": {
      "powerflex": {
        "system_ids": {
          "542a2d5f5122210f": {
            "pool_quotas": {
              "bronze": 99000000
            }
          }
        }
      }
    }
  }
}
```

This role says _Allow Tenants with the Developer role access to the bronze pool on PowerFlex system 542a2d5f5122210f, and cap their total capacity usage at 99000000Kb (99Gb)._

### Policy

CSM for Authorization leverages the [Open Policy Agent](https://www.openpolicyagent.org/) to use a policy-as-code approach to policy management. It stores a collection of policy files written in Rego language.  Each policy file defines a set of policy rules that form the basis of a policy decision. A policy decision is made by processing the inputs provided. For CSM for Authorization, the inputs are:

* The set of roles defined by the Storage Admin.
* The claims section of a validated JWT.
* The JSON payload of the storage request.

Given these inputs, many decisions can be made to answer questions like "Can Tenant X, with _these_ roles provision _this_ volume of size Y?".  The result of the policy decision will determine whether or not the request is proxied.

```
                 +----------------+                   
                  |   Open Policy  |                   
                  |     Agent      |                   
                  |                |                   
  JWT             |   +--------+   |                   
 Claims ------\   |   | Policy | ----------> Allow/Deny
               -----> | (Rego) |   |                   
 Storage       -----> +--------+   |                   
 Request -----/   +-------^--------+                   
                          |                            
                          |                            
                          |                            
                        Role                           
                        Data                           
```

### Quota & Volume Ownership

Policy decisions based on the current request and set of roles alone are not enough.  CSM for Authorization must maintain a cache of volumes approved for creation and deletion in order to know if a Tenant has already consumed their quota on a given storage pool.

A Redis database is used to store this volume data and their relationship with a Tenant, Storage Array and Pool. The use of composite keys provide fast, constant time look up of volumes, e.g. `quota:powerflex:542a2d5f5122210f:bronze:Tenant-1:data` is a Redis hash with volume data as its values.

## Cross-Cutting Concerns

This section documents the pieces of code that are general in nature and shared across multiple packages.

### Logging

CSM for Authorization uses the [Logrus](https://github.com/sirupsen/logrus) package when logging messages.

## Observability

Both the CSM for Authorization Server and Sidecar Proxy are long-running processes, so it's important to understand what's going on inside. We use OpenTelemetry (otel) to help with that.

The following otel exporters are used:

* ```bash
  go.opentelemetry.io/otel/exporters/metric/prometheus
  ```
* ```bash
  go.opentelemetry.io/otel/exporters/trace/zipkin
  ```
* ```bash

  go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp    
  ```