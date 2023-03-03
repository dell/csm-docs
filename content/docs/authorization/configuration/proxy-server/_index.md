---
title: Proxy Server
linktitle: Proxy Server
description: >
  Configuring the CSM for Authorization Proxy Server
---

## Configuring the CSM for Authorization Proxy Server

The storage administrator must first configure the proxy server with the following:
- Storage systems
- Tenants
- Roles
- Bind roles to tenants

>__Note__:
> - The `RPM deployment` will use the address and port of the server (i.e. grpc.<DNS-hostname>:443).
> - The `Helm deployment` will use the address and port of the Ingress hosts for the storage, tenant, and role services.

### Configuring Storage

A `storage` entity in CSM Authorization consists of the storage type (PowerFlex, PowerMax, PowerScale), the system ID, the API endpoint, and the credentials. For example, to create PowerFlex storage:


```yaml
# RPM Deployment
karavictl storage create --type powerflex --endpoint ${powerflexIP} --system-id ${systemID} --user ${user} --password ${password} --array-insecure

# Helm Deployment
karavictl storage create --type powerflex --endpoint ${powerflexIP} --system-id ${systemID} --user ${user} --password ${password} --insecure --array-insecure --addr storage.csm-authorization.com:<ingress-nginx-controller-port>
```

>__Note__:
> - The `insecure` flag specifies to skip certificate validation when connecting to the CSM Authorization storage service.
> - The `array-insecure` flag specifies to skip certificate validation when proxy-service connects to the backend storage array. Run `karavictl storage create --help` for help.
> - The `powerflexIP` is the endpoint to your powerflex machine. You can find the `systemID` at the `https://<your_powerflex_ip_address>/dashboard/performance` near the `System` title.
> - The `user` and `password` arguments are credentials to the powerflex UI. 

### Configuring Tenants

A `tenant` is a Kubernetes cluster that a role will be bound to. For example, to create a tenant named `Finance`:

```yaml
# RPM Deployment
karavictl tenant create --name Finance --insecure --addr grpc.<DNS-hostname>:443

# Helm Deployment
karavictl tenant create --name Finance --insecure --addr tenant.csm-authorization.com:<ingress-nginx-controller-port>
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the tenant service. Run `karavictl tenant create --help` for help.
> - `DNS-hostname` refers to the hostname of the system in which the CSM for Authorization server will be installed. This hostname can be found by running `nslookup <IP_address>`

> - For the Powerflex Pre-approved Guid feature, the `approvesdc` boolean flag is `true` by default. If the `approvesdc` flag is false for a tenant, the proxy server will deny the requests to approve SDC if the SDCs are already in not-approved state. Inorder to change this flag for an already created tenant, see `tenant update` command in CLI section.

```yaml
# RPM Deployment
karavictl tenant create --name Finance --approvesdc=false --insecure --addr grpc.DNS-hostname:443

# Helm Deployment
karavictl tenant create --name Finance --approvesdc=false --insecure --addr tenant.csm-authorization.com:<ingress-nginx-controller-port>
```

### Configuring Roles

A `role` consists of a name, the storage to use, and the quota limit for the storage pool to be used. For example, to create a role named `FinanceRole` using the PowerFlex storage created above with a quota limit of 100GB in storage pool `myStoragePool`:

```yaml
# RPM Deployment
karavictl role create --role=FinanceRole=powerflex=${systemID}=myStoragePool=100GB

# Helm Deployment
karavictl role create --insecure --addr role.csm-authorization.com:30016 --role=FinanceRole=powerflex=${systemID}=myStoragePool=100GB
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the role service. Run `karavictl role create --help` for help.

### Configuring Role Bindings

A `role binding` binds a role to a tenant. For example, to bind the `FinanceRole` to the `Finance` tenant:

```yaml
# RPM Deployment
karavictl rolebinding create --tenant Finance --role FinanceRole --insecure --addr grpc.<DNS-hostname>:443

# Helm Deployment
karavictl rolebinding create --tenant Finance --role FinanceRole --insecure --addr tenant.csm-authorization.com:<ingress-nginx-controller-port>
```

>__Note__: 
> - The `insecure` flag specifies to skip certificate validation when connecting to the tenant service. Run `karavictl rolebinding create --help` for help.

### Generate a Token

- [RPM Deployment](#rpm)
- [Helm Deployment](#helm)

#### RPM
After creating the role bindings, the next logical step is to generate the access token. The storage admin is responsible for generating and sending the token to the Kubernetes tenant admin.

>__Note__: 
> - The `--insecure` flag is required if certificates were not provided in `$HOME/.karavi/config.json`.
> - This sample copies the token directly to the Kubernetes cluster master node. The requirement here is that the token must be copied and/or stored in any location accessible to the Kubernetes tenant admin.

  ```
  echo === Generating token ===
  karavictl generate token --tenant ${tenantName} --insecure --addr grpc.<DNS-hostname>:443 | sed -e 's/"Token": //' -e 's/[{}"]//g' -e 's/\\n/\n/g' > token.yaml

  echo === Copy token to Driver Host ===
  sshpass -p ${DriverHostPassword} scp token.yaml ${DriverHostVMUser}@{DriverHostVMIP}:/tmp/token.yaml 
  ```

#### Helm

Now that the tenant is bound to a role, a JSON Web Token can be generated for the tenant. For example, to generate a token for the `Finance` tenant:

```
karavictl generate token --tenant Finance --insecure --addr tenant.csm-authorization.com:<ingress-nginx-controller-port>

{
  "Token": "\napiVersion: v1\nkind: Secret\nmetadata:\n  name: proxy-authz-tokens\ntype: Opaque\ndata:\n  access: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKcllYSmhkbWtpTENKbGVIQWlPakUyTlRNek1qUXhPRFlzSW1keWIzVndJam9pWm05dklpd2lhWE56SWpvaVkyOXRMbVJsYkd3dWEyRnlZWFpwSWl3aWNtOXNaWE1pT2lKaVlYSWlMQ0p6ZFdJaU9pSnJZWEpoZG1rdGRHVnVZVzUwSW4wLmJIODN1TldmaHoxc1FVaDcweVlfMlF3N1NTVnEyRzRKeGlyVHFMWVlEMkU=\n  refresh: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKcllYSmhkbWtpTENKbGVIQWlPakUyTlRVNU1UWXhNallzSW1keWIzVndJam9pWm05dklpd2lhWE56SWpvaVkyOXRMbVJsYkd3dWEyRnlZWFpwSWl3aWNtOXNaWE1pT2lKaVlYSWlMQ0p6ZFdJaU9pSnJZWEpoZG1rdGRHVnVZVzUwSW4wLkxNbWVUSkZlX2dveXR0V0lUUDc5QWVaTy1kdmN5SHAwNUwyNXAtUm9ZZnM=\n"
}
```

Process the above response to filter the secret manifest. For example using sed you can run the following:

```
karavictl generate token --tenant Finance --insecure --addr tenant.csm-authorization.com:<ingress-nginx-controller-port> | sed -e 's/"Token": //' -e 's/[{}"]//g' -e 's/\\n/\n/g'
apiVersion: v1
kind: Secret
metadata:
  name: proxy-authz-tokens
type: Opaque
data:
  access: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKcllYSmhkbWtpTENKbGVIQWlPakUyTlRNek1qUTFOekVzSW1keWIzVndJam9pWm05dklpd2lhWE56SWpvaVkyOXRMbVJsYkd3dWEyRnlZWFpwSWl3aWNtOXNaWE1pT2lKaVlYSWlMQ0p6ZFdJaU9pSnJZWEpoZG1rdGRHVnVZVzUwSW4wLk4tNE42Q1pPbUptcVQtRDF5ZkNGdEZqSmRDRjcxNlh1SXlNVFVyckNOS1U=
  refresh: ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhkV1FpT2lKcllYSmhkbWtpTENKbGVIQWlPakUyTlRVNU1UWTFNVEVzSW1keWIzVndJam9pWm05dklpd2lhWE56SWpvaVkyOXRMbVJsYkd3dWEyRnlZWFpwSWl3aWNtOXNaWE1pT2lKaVlYSWlMQ0p6ZFdJaU9pSnJZWEpoZG1rdGRHVnVZVzUwSW4wLkVxb3lXNld5ZEFLdU9mSmtkMkZaMk9TVThZMzlKUFc0YmhfNHc5R05ZNmM=
```

This secret must be applied in the driver namespace.
