---
title: Proxy Server
linktitle: Proxy Server
description: >
  Configuring the CSM for Authorization Proxy Server
---

## Configuring the CSM for Authorization Proxy Server

The storage administrator must first configure Authorization with the following via `karavictl`:
- Karavictl admin token
- Storage systems
- Tenants
- Roles
- Role bindings

>__Note__:
> - The `RPM deployment` will use the address of the server.
> - The `Helm deployment` will use the address and port of the Ingress hosts for the proxy-server and role services.

### Configuring Storage

A `storage` entity in CSM Authorization consists of the storage type (PowerFlex, PowerMax, PowerScale), the system ID, the API endpoint, and the credentials. For example, to create PowerFlex storage:

#RPM Deployment
```bash

karavictl storage create --type powerflex --endpoint ${powerflexIP} --system-id ${systemID} --user ${user} --password ${password} --array-insecure --insecure --addr DNS-hostname --admin-token admintoken.yaml
```
#Helm/Operator Deployment
```bash

# Helm Deployment
karavictl storage create --type powerflex --endpoint ${powerflexIP} --system-id ${systemID} --user ${user} --password ${password} --insecure --array-insecure --addr csm-authorization.com:<ingress-nginx-controller-port>
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

# Helm Deployment
karavictl tenant create --name Finance --insecure --addr csm-authorization.com:<ingress-nginx-controller-port>
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the Authorization proxy-server.
> - The `addr` flag is the address of the Authorization proxy-server. 
> - Run `karavictl tenant create --help` for help.

> - For the Powerflex Pre-approved Guid feature, the `approvesdc` boolean flag is `true` by default. If the `approvesdc` flag is false for a tenant, the proxy server will deny the requests to approve SDC if the SDCs are already in not-approved state. Inorder to change this flag for an already created tenant, see `tenant update` command in CLI section.

```yaml
# RPM Deployment
karavictl tenant create --name Finance --approvesdc=false --insecure --addr DNS-hostname

# Helm Deployment
karavictl tenant create --name Finance --approvesdc=false --insecure --addr csm-authorization.com:<ingress-nginx-controller-port>
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

```yaml
# RPM Deployment
karavictl rolebinding create --tenant Finance --role FinanceRole --insecure --addr DNS-hostname

# Helm Deployment
karavictl rolebinding create --tenant Finance --role FinanceRole --insecure --addr csm-authorization.com:<ingress-nginx-controller-port>
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to CSM Authorization. Run `karavictl rolebinding create --help` for help.

### Generate a Token

Once rolebindings are created, an access/refresh token pair can be created for the tenant. The storage admin is responsible for generating and sending the token to the Kubernetes tenant admin.

#### RPM
After creating the role bindings, the next logical step is to generate the access token. The storage admin is responsible for generating and sending the token to the Kubernetes tenant admin.

>__Note__: 
> - The `--insecure` flag is required if certificates were not provided in `$HOME/.karavi/config.json`.
> - This sample copies the token directly to the Kubernetes cluster master node. The requirement here is that the token must be copied and/or stored in any location accessible to the Kubernetes tenant admin.

  ```
  echo === Generating token ===
  karavictl generate token --tenant ${tenantName} --insecure --addr DNS-hostname | sed -e 's/"Token": //' -e 's/[{}"]//g' -e 's/\\n/\n/g' > token.yaml

  echo === Copy token to Driver Host ===
  sshpass -p ${DriverHostPassword} scp token.yaml ${DriverHostVMUser}@{DriverHostVMIP}:/tmp/token.yaml 
  ```

#### Helm

Now that the tenant is bound to a role, a JSON Web Token can be generated for the tenant. For example, to generate a token for the `Finance` tenant:

karavictl generate token --tenant Finance --insecure --addr DNS-hostname --admin-token admintoken.yaml > token.yaml
```
karavictl generate token --tenant Finance --insecure --addr csm-authorization.com:<ingress-nginx-controller-port>

karavictl generate token --tenant Finance --insecure --addr csm-authorization.com:<ingress-controller-port> --admin-token admintoken.yaml > token.yaml
```

`token.yaml` will have a Kubernetes secret manifest that looks like this:

```
karavictl generate token --tenant Finance --insecure --addr csm-authorization.com:<ingress-nginx-controller-port> | sed -e 's/"Token": //' -e 's/[{}"]//g' -e 's/\\n/\n/g'
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
