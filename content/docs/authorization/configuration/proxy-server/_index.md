---
title: Proxy Server
linktitle: Proxy Server
description: >
  Configuring the CSM for Authorization Proxy Server
---

## Configuring the CSM for Authorization Proxy Server

The storage administrator must first configure Authorization with the following via `karavictl`:
- Storage systems
- Tenants
- Roles
- Role bindings

>__Note__:
> - The address of the Authorization proxy-server must be specified when executing `karavictl`. For the `RPM deployment`, the address is the DNS-hostname of the machine where the RPM
is installed. For the `Helm/Operator deployment`, the address is the Ingress host of the `proxy-server` with the port of the exposed Ingress Controller.

### Configuring Storage

A `storage` entity in CSM Authorization consists of the storage type (PowerFlex, PowerMax, PowerScale), the system ID, the API endpoint, and the credentials. For example, to create PowerFlex storage:

#RPM Deployment
```bash

```yaml
# RPM Deployment
karavictl storage create --type powerflex --endpoint ${powerflexIP} --system-id ${systemID} --user ${user} --password ${password} --array-insecure --insecure --addr DNS-hostname

# Helm/Operator Deployment
karavictl storage create --type powerflex --endpoint ${powerflexIP} --system-id ${systemID} --user ${user} --password ${password} --array-insecure  --insecure --addr csm-authorization.com:<ingress-controller-port>
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

```yaml
# RPM Deployment
karavictl tenant create --name Finance --insecure --addr DNS-hostname

# Helm/Operator Deployment
karavictl tenant create --name Finance --insecure --addr csm-authorization.com:<ingress-controller-port>
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the Authorization proxy-server.
> - The `addr` flag is the address of the Authorization proxy-server. 
> - Run `karavictl tenant create --help` for help.

> - For the Powerflex Pre-approved Guid feature, the `approvesdc` boolean flag is `true` by default. If the `approvesdc` flag is false for a tenant, the proxy server will deny the requests to approve SDC if the SDCs are already in not-approved state. Inorder to change this flag for an already created tenant, see `tenant update` command in CLI section.

```yaml
# RPM Deployment
karavictl tenant create --name Finance --approvesdc=false --insecure --addr DNS-hostname

# Helm/Operator Deployment
karavictl tenant create --name Finance --approvesdc=false --insecure --addr csm-authorization.com:<ingress-controller-port>
```

### Configuring Roles

A `role` consists of a name, the storage to use, and the quota limit for the storage pool to be used. For example, to create a role named `FinanceRole` using the PowerFlex storage created above with a quota limit of 100GB in storage pool `myStoragePool`:

```yaml
# RPM Deployment
karavictl role create --role=FinanceRole=powerflex=${systemID}=myStoragePool=100GB --insecure --addr DNS-hostname

# Helm/Operator Deployment
karavictl role create --role=FinanceRole=powerflex=${systemID}=myStoragePool=100GB --insecure --addr csm-authorization.com:<ingress-controller-port>
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the Authorization proxy-server.
> - The `addr` flag is the address of the Authorization proxy-server.
> - Run `karavictl role create --help` for help.

### Configuring Role Bindings

A `role binding` binds a role to a tenant. For example, to bind the `FinanceRole` to the `Finance` tenant:

```yaml
# RPM Deployment
karavictl rolebinding create --tenant Finance --role FinanceRole --insecure --addr DNS-hostname

# Helm/Operator Deployment
karavictl rolebinding create --tenant Finance --role FinanceRole --insecure --addr csm-authorization.com:<ingress-controller-port>
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the Authorization proxy-server.
> - The `addr` flag is the address of the Authorization proxy-server. 
> - Run `karavictl rolebinding create --help` for help.

### Generate a Token

After creating the role bindings, the next logical step is to generate the access token. The storage admin is responsible for generating and sending the token to the Kubernetes tenant admin.

```yaml
# RPM Deployment
karavictl generate token --tenant Finance --insecure --addr DNS-hostname | sed -e 's/"Token": //' -e 's/[{}"]//g' -e 's/\\n/\n/g' > token.yaml

# Helm/Operator Deployment
karavictl generate token --tenant Finance --insecure --addr csm-authorization.com:<ingress-controller-port> | sed -e 's/"Token": //' -e 's/[{}"]//g' -e 's/\\n/\n/g' > token.yaml
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
