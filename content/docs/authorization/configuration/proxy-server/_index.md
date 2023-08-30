---
title: Proxy Server
linktitle: Proxy Server
description: >
  Configuring the CSM for Authorization Proxy Server
---

{{% pageinfo color="primary" %}}
The CSM Authorization karavictl CLI is no longer actively maintained or supported. It will be deprecated in CSM 1.9.
{{% /pageinfo %}}

## Configuring the CSM for Authorization Proxy Server

The storage administrator must first configure Authorization with the following via `karavictl`:
- Karavictl admin token
- Storage systems
- Tenants
- Roles
- Role bindings

>__Note__:
> - The address of the Authorization proxy-server must be specified when executing `karavictl`. For the `RPM deployment`, the address is the DNS-hostname of the machine where the RPM
is installed. For the `Helm/Operator deployment`, the address is the Ingress host of the `proxy-server` with the port of the exposed Ingress Controller.

### Configuring Admin Token

An admin token is required for executing `karavictl` commands, with the exception of `admin token` and `cluster-info`. For example, to generate an admin token and redirect the output to a file:

```bash

$ karavictl admin token --name admin --access-token-expiration 30s --refresh-token-expiration 120m > admintoken.yaml
$ Enter JWT Signing Secret:
$ cat admintoken.yaml
{
  "Access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjc20iLCJleHAiOjE2ODIzNDg0MzEsImdyb3VwIjoiYWRtaW4iLCJpc3MiOiJjb20uZGVsbC5jc20iLCJyb2xlcyI6IiIsInN1YiI6ImNzbS1hZG1pbiJ9.OxTL48c1VLKSY6oVnYw_jmQ7XHX4UEfwIRkfLQh9beA",
  "Refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjc20iLCJleHAiOjE2ODQ5NDAzNzEsImdyb3VwIjoiYWRtaW4iLCJpc3MiOiJjb20uZGVsbC5jc20iLCJyb2xlcyI6IiIsInN1YiI6ImNzbS1hZG1pbiJ9._ELmuc2qprZPeuW22wISiw0pvuM6rhyabDOybakqs68"
}

```
Alternatively, the JWT signing secret can be specified with the CLI.

```bash

$ karavictl admin token --name admin  --jwt-signing-secret supersecret --access-token-expiration 30s --refresh-token-expiration 120m > admintoken.yaml
$ cat admintoken.yaml
{
  "Access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjc20iLCJleHAiOjE2ODIzNDg2MTEsImdyb3VwIjoiYWRtaW4iLCJpc3MiOiJjb20uZGVsbC5jc20iLCJyb2xlcyI6IiIsInN1YiI6ImNzbS1hZG1pbiJ9.C6c9DrlOE95_soFm0YEyzs08ye2TL_koYsp4qJFEglI",
  "Refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjc20iLCJleHAiOjE2ODIzNTU3ODEsImdyb3VwIjoiYWRtaW4iLCJpc3MiOiJjb20uZGVsbC5jc20iLCJyb2xlcyI6IiIsInN1YiI6ImNzbS1hZG1pbiJ9.XMcOVIuJ56JhuJrfGqQ_DUqXDyHLxrOrkvQJUxAOst4"
}

```

>__Note__:
> - The `karavictl admin token` command is an exception where you do not need to specify the address of the proxy-server.

### Configuring Storage

A `storage` entity in CSM Authorization consists of the storage type (PowerFlex, PowerMax, PowerScale), the system ID, the API endpoint, and the credentials. For example, to create PowerFlex storage:

#RPM Deployment
```bash

karavictl storage create --type powerflex --endpoint ${powerflexIP} --system-id ${systemID} --user ${user} --password ${password} --array-insecure --insecure --addr DNS-hostname --admin-token admintoken.yaml
```
#Helm/Operator Deployment
```bash

karavictl storage create --type powerflex --endpoint ${powerflexIP} --system-id ${systemID} --user ${user} --password ${password} --array-insecure  --insecure --addr csm-authorization.com:<ingress-controller-port> --admin-token admintoken.yaml
```

>__Note__:
> - The `insecure` flag specifies to skip certificate validation when connecting to the Authorization proxy-server.
> - The `addr` flag is the address of the Authorization proxy-server. 
> - The `array-insecure` flag specifies to skip certificate validation when proxy-service connects to the backend storage array.
> - The `powerflexIP` is the API endpoint of your PowerFlex. You can find the `systemID` at the `https://<powerflex_gui_address>/dashboard/performance` near the `System` title.
> - The `user` and `password` arguments are credentials to the powerflex UI. 
> - Run `karavictl storage create --help` for help.

### Configuring Tenants

A `tenant` is a Kubernetes cluster that a role will be bound to. For example, to create a tenant named `Finance`:
#RPM Deployment
```bash

karavictl tenant create --name Finance --insecure --addr DNS-hostname --admin-token admintoken.yaml
```
#Helm/Operator Deployment
```bash

karavictl tenant create --name Finance --insecure --addr csm-authorization.com:<ingress-controller-port> --admin-token admintoken.yaml
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the Authorization proxy-server.
> - The `addr` flag is the address of the Authorization proxy-server. 
> - Run `karavictl tenant create --help` for help.

> - For the Powerflex Pre-approved Guid feature, the `approvesdc` boolean flag is `true` by default. If the `approvesdc` flag is false for a tenant, the proxy server will deny the requests to approve SDC if the SDCs are already in not-approved state. Inorder to change this flag for an already created tenant, see `tenant update` command in CLI section.

#RPM Deployment
```bash

karavictl tenant create --name Finance --approvesdc=false --insecure --addr DNS-hostname --admin-token admintoken.yaml
```
#Helm/Operator Deployment
```bash

karavictl tenant create --name Finance --approvesdc=false --insecure --addr csm-authorization.com:<ingress-controller-port> --admin-token admintoken.yaml
```

### Configuring Roles

A `role` consists of a name, the storage to use, and the quota limit for the storage pool to be used. For example, to create a role named `FinanceRole` using the PowerFlex storage created above with a quota limit of 100GB in storage pool `myStoragePool`:

#RPM Deployment
```bash

karavictl role create --role=FinanceRole=powerflex=${systemID}=myStoragePool=100GB --insecure --addr DNS-hostname --admin-token admintoken.yaml
```
#Helm/Operator Deployment
```bash
karavictl role create --role=FinanceRole=powerflex=${systemID}=myStoragePool=100GB --insecure --addr csm-authorization.com:<ingress-controller-port> --admin-token admintoken.yaml
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the Authorization proxy-server.
> - The `addr` flag is the address of the Authorization proxy-server.
> - Run `karavictl role create --help` for help.

### Configuring Role Bindings

A `role binding` binds a role to a tenant. For example, to bind the `FinanceRole` to the `Finance` tenant:

#RPM Deployment
```bash

karavictl rolebinding create --tenant Finance --role FinanceRole --insecure --addr DNS-hostname --admin-token admintoken.yaml
```
#Helm/Operator Deployment
```bash

karavictl rolebinding create --tenant Finance --role FinanceRole --insecure --addr csm-authorization.com:<ingress-controller-port> --admin-token admintoken.yaml
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the Authorization proxy-server.
> - The `addr` flag is the address of the Authorization proxy-server. 
> - Run `karavictl rolebinding create --help` for help.

### Generate a Token

Once rolebindings are created, an access/refresh token pair can be created for the tenant. The storage admin is responsible for generating and sending the token to the Kubernetes tenant admin.

#RPM Deployment
```bash

karavictl generate token --tenant Finance --insecure --addr DNS-hostname --admin-token admintoken.yaml > token.yaml
```
#Helm/Operator Deployment
```bash

karavictl generate token --tenant Finance --insecure --addr csm-authorization.com:<ingress-controller-port> --admin-token admintoken.yaml > token.yaml
```

`token.yaml` will have a Kubernetes secret manifest that looks like this:

```yaml
apiVersion: v1
data:
  access: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKamMyMGlMQ0psZUhBaU9qRTJPREl3TVRBeU5UTXNJbWR5YjNWd0lqb2labTl2SWl3aWFYTnpJam9pWTI5dExtUmxiR3d1WTNOdElpd2ljbTlzWlhNaU9pSmlZWElpTENKemRXSWlPaUpqYzIwdGRHVnVZVzUwSW4wLjlSYkJISzJUS2dZbVdDX0paazBoSXV0N0daSDV4NGVjQVk2ekdaUDNvUWs=
  refresh: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKamMyMGlMQ0psZUhBaU9qRTJPRFEyTURJeE9UTXNJbWR5YjNWd0lqb2labTl2SWl3aWFYTnpJam9pWTI5dExtUmxiR3d1WTNOdElpd2ljbTlzWlhNaU9pSmlZWElpTENKemRXSWlPaUpqYzIwdGRHVnVZVzUwSW4wLkxQcDQzbXktSVJudTFjdmZRcko4M0pMdTR2NXlWQlRDV2NjWFpfWjROQkU=
kind: Secret
metadata:
  creationTimestamp: null
  name: proxy-authz-tokens
type: Opaque
```

This secret must be applied in the driver namespace.

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the Authorization proxy-server.
> - The `addr` flag is the address of the Authorization proxy-server.
> - Run `karavictl generate token --help` for help.
