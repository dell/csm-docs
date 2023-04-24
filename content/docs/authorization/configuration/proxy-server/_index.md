---
title: Proxy Server
linktitle: Proxy Server
description: >
  Configuring the CSM for Authorization Proxy Server
---

## Configuring the CSM for Authorization Proxy Server

The storage administrator must first configure Authorization with the following via `karavictl`:
- Generate admin token
- Storage systems
- Tenants
- Roles
- Bind roles to tenants

>__Note__:
> - The address of the Authorization proxy-server must be specified when executing `karavictl`. For the `RPM deployment`, the address is the DNS-hostname of the machine where the RPM
is installed. For the `Helm/Operator deployment`, the address is the Ingress host of the `proxy-server` with the port of the exposed Ingress Controller.

### Configuring Admin Token

Generate an admin token that will be required to run `karavictl` commands except generating `admin token` and `cluster-info`.

```
$ karavictl admin token --name admin --access-token-expiration 30s --refresh-token-expiration 120m > admintoken.yaml
$ Enter JWT Signing Secret:
$ cat admintoken.yaml
{
  "Access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjc20iLCJleHAiOjE2ODIzNDg0MzEsImdyb3VwIjoiYWRtaW4iLCJpc3MiOiJjb20uZGVsbC5jc20iLCJyb2xlcyI6IiIsInN1YiI6ImNzbS1hZG1pbiJ9.OxTL48c1VLKSY6oVnYw_jmQ7XHX4UEfwIRkfLQh9beA",
  "Refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjc20iLCJleHAiOjE2ODQ5NDAzNzEsImdyb3VwIjoiYWRtaW4iLCJpc3MiOiJjb20uZGVsbC5jc20iLCJyb2xlcyI6IiIsInN1YiI6ImNzbS1hZG1pbiJ9._ELmuc2qprZPeuW22wISiw0pvuM6rhyabDOybakqs68"
}

```
Alternatively, JWT signing secret can be specified with the CLI.

```
$ karavictl admin token --name admin  --jwt-signing-secret supersecret --access-token-expiration 30s --refresh-token-expiration 120m > admintoken.yaml
$ cat admintoken.yaml
{
  "Access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjc20iLCJleHAiOjE2ODIzNDg2MTEsImdyb3VwIjoiYWRtaW4iLCJpc3MiOiJjb20uZGVsbC5jc20iLCJyb2xlcyI6IiIsInN1YiI6ImNzbS1hZG1pbiJ9.C6c9DrlOE95_soFm0YEyzs08ye2TL_koYsp4qJFEglI",
  "Refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjc20iLCJleHAiOjE2ODIzNTU3ODEsImdyb3VwIjoiYWRtaW4iLCJpc3MiOiJjb20uZGVsbC5jc20iLCJyb2xlcyI6IiIsInN1YiI6ImNzbS1hZG1pbiJ9.XMcOVIuJ56JhuJrfGqQ_DUqXDyHLxrOrkvQJUxAOst4"
}

```


### Configuring Storage

A `storage` entity in CSM Authorization consists of the storage type (PowerFlex, PowerMax, PowerScale), the system ID, the API endpoint, and the credentials. For example, to create PowerFlex storage:


```yaml
# RPM Deployment
karavictl storage create --type powerflex --endpoint ${powerflexIP} --system-id ${systemID} --user ${user} --password ${password} --array-insecure --insecure --addr DNS-hostname --admin-token admintoken.yaml

# Helm/Operator Deployment
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

```yaml
# RPM Deployment
karavictl tenant create --name Finance --insecure --addr DNS-hostname --admin-token admintoken.yaml

# Helm/Operator Deployment
karavictl tenant create --name Finance --insecure --addr csm-authorization.com:<ingress-controller-port> --admin-token admintoken.yaml
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the Authorization proxy-server.
> - The `addr` flag is the address of the Authorization proxy-server. 
> - Run `karavictl tenant create --help` for help.

> - For the Powerflex Pre-approved Guid feature, the `approvesdc` boolean flag is `true` by default. If the `approvesdc` flag is false for a tenant, the proxy server will deny the requests to approve SDC if the SDCs are already in not-approved state. Inorder to change this flag for an already created tenant, see `tenant update` command in CLI section.

```yaml
# RPM Deployment
karavictl tenant create --name Finance --approvesdc=false --insecure --addr DNS-hostname --admin-token admintoken.yaml

# Helm/Operator Deployment
karavictl tenant create --name Finance --approvesdc=false --insecure --addr csm-authorization.com:<ingress-controller-port> --admin-token admintoken.yaml
```

### Configuring Roles

A `role` consists of a name, the storage to use, and the quota limit for the storage pool to be used. For example, to create a role named `FinanceRole` using the PowerFlex storage created above with a quota limit of 100GB in storage pool `myStoragePool`:

```yaml
# RPM Deployment
karavictl role create --role=FinanceRole=powerflex=${systemID}=myStoragePool=100GB --insecure --addr DNS-hostname --admin-token admintoken.yaml

# Helm/Operator Deployment
karavictl role create --role=FinanceRole=powerflex=${systemID}=myStoragePool=100GB --insecure --addr csm-authorization.com:<ingress-controller-port> --admin-token admintoken.yaml
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the Authorization proxy-server.
> - The `addr` flag is the address of the Authorization proxy-server.
> - Run `karavictl role create --help` for help.

### Configuring Role Bindings

A `role binding` binds a role to a tenant. For example, to bind the `FinanceRole` to the `Finance` tenant:

```yaml
# RPM Deployment
karavictl rolebinding create --tenant Finance --role FinanceRole --insecure --addr DNS-hostname --admin-token admintoken.yaml

# Helm/Operator Deployment
karavictl rolebinding create --tenant Finance --role FinanceRole --insecure --addr csm-authorization.com:<ingress-controller-port> --admin-token admintoken.yaml
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the Authorization proxy-server.
> - The `addr` flag is the address of the Authorization proxy-server. 
> - Run `karavictl rolebinding create --help` for help.

### Generate a Token

After creating the role bindings, the next logical step is to generate the access token. The storage admin is responsible for generating and sending the token to the Kubernetes tenant admin.

```yaml
# RPM Deployment
karavictl generate token --tenant Finance --insecure --addr DNS-hostname --admin-token admintoken.yaml > token.yaml

# Helm/Operator Deployment
karavictl generate token --tenant Finance --insecure --addr csm-authorization.com:<ingress-controller-port> --admin-token admintoken.yaml > token.yaml
```

`token.yaml` will have a Kubernetes secret manifest that looks like this:

```
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
