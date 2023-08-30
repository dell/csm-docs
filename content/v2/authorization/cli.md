---
title: CLI
linktitle: CLI 
weight: 4
description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization CLI
---

{{% pageinfo color="primary" %}}
The CSM Authorization karavictl CLI is no longer actively maintained or supported. It will be deprecated in CSM 1.9.
{{% /pageinfo %}}

karavictl is a command-line interface (CLI) used to interact with and manage your Container Storage Modules (CSM) Authorization deployment.
This document outlines all karavictl commands, their intended use, options that can be provided to alter their execution, and expected output from those commands.

If you feel that something is unclear or missing in this document, please open up an [issue](https://github.com/dell/csm/issues).

| Command | Description |
| - | - |
| [karavictl](#karavictl) | karavictl is used to interact with CSM Authorization Server |
| [karavictl cluster-info](#karavictl-cluster-info) | Display the state of resources within the cluster |
| [karavictl generate](#karavictl-generate) | Generate resources for use with CSM |
| [karavictl generate token](#karavictl-generate-token) | Generate tokens |
| [karavictl role](#karavictl-role) | Manage role |
| [karavictl role get](#karavictl-role-get) | Get role |
| [karavictl role list](#karavictl-role-list) | List roles |
| [karavictl role create](#karavictl-role-create) | Create one or more CSM roles |
| [karavictl role update](#karavictl-role-update) | Update the quota of one or more CSM roles |
| [karavictl role delete](#karavictl-role-delete ) | Delete role |
| [karavictl rolebinding](#karavictl-rolebinding) | Manage role bindings |
| [karavictl rolebinding create](#karavictl-rolebinding-create) | Create a rolebinding between role and tenant |
| [karavictl rolebinding delete](#karavictl-rolebinding-delete) | Delete a rolebinding between role and tenant |
| [karavictl storage](#karavictl-storage) | Manage storage systems |
| [karavictl storage get](#karavictl-storage-get) | Get details on a registered storage system |
| [karavictl storage list](#karavictl-storage-list) | List registered storage systems |
| [karavictl storage create](#karavictl-storage-create) | Create and register a storage system |
| [karavictl storage update](#karavictl-storage-update) | Update a registered storage system |
| [karavictl storage delete](#karavictl-storage-delete) | Delete a registered storage system |
| [karavictl tenant ](#karavictl-tenant) | Manage tenants |
| [karavictl tenant create](#karavictl-tenant-create) | Create a tenant resource within CSM |
| [karavictl tenant get](#karavictl-tenant-get) | Get a tenant resource within CSM |
| [karavictl tenant list](#karavictl-tenant-list) | Lists tenant resources within CSM |
| [karavictl tenant revoke](#karavictl-tenant-revoke) | Get a tenant resource within CSM |
| [karavictl tenant delete](#karavictl-tenant-delete) | Deletes a tenant resource within CSM |


## General Commands

### karavictl

karavictl is used to interact with CSM Authorization Server

##### Synopsis

karavictl provides security, RBAC, and quota limits for accessing Dell
storage products from Kubernetes clusters

##### Options

```
      --config string   config file (default is $HOME/.karavictl.yaml)
  -h, --help            help for karavictl
  -t, --toggle          Help message for toggle
```

##### Output

Outputs help text



---



### karavictl cluster-info

Display the state of resources within the cluster

##### Synopsis

Prints table of resources within the cluster, including their readiness

```
karavictl cluster-info [flags]
```

##### Options

```
  -h, --help    help for cluster-info
  -w, --watch   Watch for changes
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl cluster-info
NAME                   READY   UP-TO-DATE   AVAILABLE   AGE
github-auth-provider   1/1     1            1           59m
tenant-service         1/1     1            1           59m
redis-primary          1/1     1            1           59m
proxy-server           1/1     1            1           59m
redis-commander        1/1     1            1           59m
```



---



### karavictl generate

Generate resources for use with CSM

##### Synopsis

Generates resources for use with CSM

```
karavictl generate [flags]
```

##### Options

```
  -h, --help   help for generate
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

Outputs help text



---



### karavictl generate token

Generate tokens

##### Synopsis

Generate tokens for use with the CSI Driver when in proxy mode
The tokens are output as a Kubernetes Secret resource, so the results may
be piped directly to kubectl:

Example: karavictl generate token | kubectl apply -f -

```
karavictl generate token [flags]
```

##### Options

```
      --addr string            host:port address (default "grpc.gatekeeper.cluster:443")
      --from-config string     File providing self-generated token information
  -h, --help                   help for token
      --tenant                 Tenant name 
      --shared-secret string   Shared secret for token signing
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl generate token --shared-secret supersecret

apiVersion: v1
kind: Secret
metadata:
  name: proxy-authz-tokens
  namespace: vxflexos
type: Opaque
data:
  access: <ACCESS-TOKEN>
  refresh: <REFRESH-TOKEN>
```


Usually, you will want to pipe the output to kubectl to apply the secret
```
$ karavictl generate token --shared-secret supersecret | kubectl apply -f -
```



## Role Commands



### karavictl role

Manage roles

##### Synopsis

Manage roles

```
karavictl role [flags]
```

##### Options

```
  -h, --help   help for role
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

Outputs help text



---



### karavictl role get

Get role

##### Synopsis

Get role

```
karavictl role get [flags]
```

##### Options

```
  -h, --help   help for get
      --insecure           insecure skip verify flag for Helm deployment
      --addr               address of the container for Helm deployment (pod:port)
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl role get CSISilver

{
  "Name": "CSISilver",
  "StorageSystem": "3000000000011111",
  "PoolQuotas": [
    {
      "Pool": "mypool",
      "Quota": "16 GB"
    }
  ]
}
```



---



### karavictl role list

List roles

##### Synopsis

List roles

```
karavictl role list [flags]
```

##### Options

```
  -h, --help   help for list
      --insecure           insecure skip verify flag for Helm deployment
      --addr               address of the container for Helm deployment (pod:port)
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl role list

{
  "CSIGold": [
    {
      "storage_system_id": "3000000000011111",
      "pool_quotas": [
        {
          "pool": "mypool",
          "quota": 32000000
        }
      ]
    }
  ],
  "CSISilver": [
    {
      "storage_system_id": "3000000000011111",
      "pool_quotas": [
        {
          "pool": "mypool",
          "quota": 16000000
        }
      ]
    }
  ]
}
```



---



### karavictl role create

Create one or more CSM roles

##### Synopsis

Creates one or more CSM roles

```
karavictl role create [flags]
```

##### Options

```
  -f, --from-file string   role data from a file
      --role strings       role in the form <name>=<type>=<id>=<pool>=<quota>
      --insecure           insecure skip verify flag for Helm deployment
      --addr               address of the container for Helm deployment (pod:port)
  -h, --help               help for create
```

*NOTE:* 
  - For PowerScale, set the `quota` to 0 as CSM for Authorization does not enforce quota limits.

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl role create --from-file roles.json
```
On success, there will be no output. You may run `karavictl role get <role-name>` to confirm the creation occurred.

Alternatively, you can create a role in-line using:

```
$ karavictl role create --role=role-name=system-type=000000000001=mypool=200000000
```

---



### karavictl role update

Update the quota of one or more CSM roles

##### Synopsis

Updates the quota of one or more CSM roles

```
karavictl role update [flags]
```

##### Options

```
  -f, --from-file string   role data from a file
      --role strings       role in the form <name>=<type>=<id>=<pool>=<quota>
      --insecure           insecure skip verify flag for Helm deployment
      --addr               address of the container for Helm deployment (pod:port)
  -h, --help               help for update
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl role update --from-file roles.json
```
On success, there will be no output. You may run `karavictl role get <role-name>` to confirm the update occurred.

Alternatively, you can update existing roles in-line using:

```
$ karavictl role update --role=role-name=system-type=000000000001=mypool=400000000
```
---



### karavictl role delete

Delete role

##### Synopsis

Delete role

```
karavictl role delete <role-name> [flags]
```

##### Options

```
  -h, --help   help for delete
      --insecure           insecure skip verify flag for Helm deployment
      --addr               address of the container for Helm deployment (pod:port)
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl role delete CSISilver
```
On success, there will be no output. You may run `karavictl role get <role-name>` to confirm the deletion occurred.



---



### karavictl rolebinding

Manage role bindings

##### Synopsis

Management for role bindings

```
karavictl rolebinding [flags]
```

##### Options

```
  -h, --help   help for rolebinding
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

Outputs help text



---



### karavictl rolebinding create

Create a rolebinding between role and tenant

##### Synopsis

Creates a rolebinding between role and tenant

```
karavictl rolebinding create [flags]
```

##### Options

```
  -h, --help   help for create
  -r, --role string       Role name
  -t, --tenant string     Tenant name
      --insecure boolean  insecure skip verify flag for Helm deployment
```

##### Options inherited from parent commands

```
      --addr string     Address of the server (default "localhost:443")
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl rolebinding create --role CSISilver --tenant Alice
```
On success, there will be no output. You may run `karavictl tenant get --name <tenant-name>` to confirm the rolebinding creation occurred.


---



### karavictl rolebinding delete

Delete a rolebinding between role and tenant

##### Synopsis

Deletes a rolebinding between role and tenant

```
karavictl rolebinding delete [flags]
```

##### Options

```
  -h, --help   help for create
  -r, --role string      Role name
  -t, --tenant string    Tenant name
      --insecure boolean insecure skip verify flag for Helm deployment
```

##### Options inherited from parent commands

```
      --addr string     Address of the server (default "localhost:443")
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl rolebinding delete --role CSISilver --tenant Alice
```
On success, there will be no output. You may run `karavictl tenant get --name <tenant-name>` to confirm the rolebinding deletion occurred.



## Storage Commands



### karavictl storage

Manage storage systems

##### Synopsis

Manages storage systems

```
karavictl storage [flags]
```

##### Options

```
  -h, --help   help for storage
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

Outputs help text



---



### karavictl storage get

Get details on a registered storage system.

##### Synopsis

Gets details on a registered storage system.

```
karavictl storage get [flags]
```

##### Options

```
  -h, --help               help for get
  -s, --system-id string   System identifier (default "systemid")
  -t, --type string        Type of storage system ("powerflex", "powermax")
      --insecure           insecure skip verify flag for Helm deployment
      --addr               address of the container for Helm deployment (pod:port)
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl storage get --type powerflex --system-id 3000000000011111
{
  "User": "admin",
  "Password": "(omitted)",
  "Endpoint": "https://1.1.1.1",
  "Insecure": true
}
```



---



### karavictl storage list

List registered storage systems.

##### Synopsis

Lists registered storage systems.

```
karavictl storage list [flags]
```

##### Options

```
  -h, --help   help for list
      --insecure           insecure skip verify flag for Helm deployment
      --addr               address of the container for Helm deployment (pod:port)
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl storage list

{
  "storage": {
    "powerflex": {
      "3000000000011111": {
        "Endpoint": "https://1.1.1.1",
        "Insecure": true,
        "Password": "(omitted)",
        "User": "admin"
      }
    }
  }
}
```



---



### karavictl storage create

Create and register a storage system.

##### Synopsis

Creates and registers a storage system.

```
karavictl storage create [flags]
```

##### Options

```
  -e, --endpoint string    Endpoint of REST API gateway
  -h, --help               help for create
  -a, --array-insecure     Array insecure skip verify
  -p, --password string    Password (default "****")
  -s, --system-id string   System identifier (default "systemid")
  -t, --type string        Type of storage system ("powerflex", "powermax")
  -u, --user string        Username (default "admin")
      --insecure           insecure skip verify flag for Helm deployment
      --addr               address of the container for Helm deployment (pod:port)
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl storage create --endpoint https://1.1.1.1 --insecure --array-insecure --system-id 3000000000011111 --type powerflex --user admin --password ********
```
On success, there will be no output. You may run `karavictl storage get --type <storage-system-type> --system-id <storage-system-id>` to confirm the creation occurred.


---



### karavictl storage update

Update a registered storage system.

##### Synopsis

Updates a registered storage system.

```
karavictl storage update [flags]
```

##### Options

```
  -e, --endpoint string    Endpoint of REST API gateway
  -h, --help               help for update
  -a, --array-insecure     Array insecure skip verify
  -p, --pass string        Password (default "****")
  -s, --system-id string   System identifier (default "systemid")
  -t, --type string        Type of storage system ("powerflex", "powermax")
  -u, --user string        Username (default "admin")
      --insecure           insecure skip verify flag for Helm deployment
      --addr               address of the container for Helm deployment (pod:port)
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl storage update --endpoint https://1.1.1.1 --insecure --array-insecure --system-id 3000000000011111 --type powerflex --user admin --password ********
```
On success, there will be no output. You may run `karavictl storage get --type <storage-system-type> --system-id <storage-system-id>` to confirm the update occurred.



---



### karavictl storage delete

Delete a registered storage system.

##### Synopsis

Deletes a registered storage system.

```
karavictl storage delete [flags]
```

##### Options

```
  -h, --help               help for delete
  -s, --system-id string   System identifier (default "systemid")
  -t, --type string        Type of storage system ("powerflex", "powermax")
      --insecure           insecure skip verify flag for Helm deployment
      --addr               address of the container for Helm deployment (pod:port)
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output
```
$ karavictl storage delete --type powerflex --system-id 3000000000011111
```
On success, there will be no output. You may run `karavictl storage get --type <storage-system-type> --system-id <storage-system-id>` to confirm the deletion occurred.



## Tenant Commands



### karavictl tenant

Manage tenants

##### Synopsis

Management for tenants

```
karavictl tenant [flags]
```

##### Options

```
  -h, --help   help for tenant
```

##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

Outputs help text



---



### karavictl tenant create

Create a tenant resource within CSM

##### Synopsis

Creates a tenant resource within CSM

```
karavictl tenant create [flags]
```

##### Options

```
  -h, --help   help for create
  -n, --name string   Tenant name
      --insecure      insecure skip verify flag for Helm deployment
```

##### Options inherited from parent commands

```
      --addr string     Address of the server (default "localhost:443")
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output
```
$ karavictl tenant create --name Alice
```
On success, there will be no output. You may run `karavictl tenant get --name <tenant-name>` to confirm the creation occurred.



---




### karavictl tenant get

Get a tenant resource within CSM

##### Synopsis

Gets a tenant resource and its assigned roles within CSM

```
karavictl tenant get [flags]
```

##### Options

```
  -h, --help   help for create
  -n, --name string   Tenant name
      --insecure      insecure skip verify flag for Helm deployment
```

##### Options inherited from parent commands

```
      --addr string     Address of the server (default "localhost:443")
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl tenant get --name Alice

{
  "name": "Alice"
  "roles": "role-1,role-2"
}

```



---



### karavictl tenant list

Lists tenant resources within CSM

##### Synopsis

Lists tenant resources within CSM

```
karavictl tenant list [flags]
```

##### Options

```
  -h, --help   help for create
      --insecure      insecure skip verify flag for Helm deployment
```

##### Options inherited from parent commands

```
      --addr string     Address of the server (default "localhost:443")
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```
$ karavictl tenant list

{
  "tenants": [
    {
      "name": "Alice"
    }
  ]
}

```



---



### karavictl tenant revoke

Revokes access for a tenant

##### Synopsis

Revokes access to storage resources for a tenant

```
karavictl tenant revoke [flags]
```

##### Options

```
  -h, --help   help for create
  -n, --name string   Tenant name
      --insecure      insecure skip verify flag for Helm deployment
```

##### Options inherited from parent commands

```
      --addr string     Address of the server (default "localhost:443")
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output
```
$ karavictl tenant revoke --name Alice
```
On success, there will be no output.



---



### karavictl tenant delete

Deletes a tenant resource within CSM

##### Synopsis

Deletes a tenant resource within CSM

```
karavictl tenant delete [flags]
```

##### Options

```
  -h, --help   help for create
  -n, --name string   Tenant name
      --insecure      insecure skip verify flag for Helm deployment
```

##### Options inherited from parent commands

```
      --addr string     Address of the server (default "localhost:443")
      --config string   config file (default is $HOME/.karavictl.yaml)
```

##### Output
```
$ karavictl tenant delete --name Alice
```
On success, there will be no output. You may run `karavictl tenant get --name <tenant-name>` to confirm the deletion occurred.
