---
title: CLI
linktitle: CLI 
weight: 4
description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) for Authorization CLI
---

karavictl is a command-line interface (CLI) used to interact with and manage your Container Storage Modules (CSM) Authorization deployment.
This document outlines all karavictl commands, their intended use, options that can be provided to alter their execution, and expected output from those commands.

If you feel that something is unclear or missing in this document, please open up an [issue](https://github.com/dell/csm/issues).

| Command | Description |
| - | - |
| [karavictl](#karavictl) | karavictl is used to interact with CSM Authorization Server |
| [karavictl admin token](#karavictl-admin-token) | Generate admin tokens |
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
| [karavictl tenant update](#karavictl-tenant-update) | Updates a tenant resource within CSM |


## General Commands

### karavictl

karavictl is used to interact with CSM Authorization Server

##### Synopsis

karavictl provides security, RBAC, and quota limits for accessing Dell
storage products from Kubernetes clusters

##### Commands

```
  admin        Generate admin token for use with CSM Authorization
  cluster-info Display the state of resources within the cluster
  completion   Generate the autocompletion script for the specified shell
  generate     Generate resources for use with Karavi
  help         Help about any command
  role         Manage roles
  rolebinding  Manage role bindings
  storage      Manage storage systems
  tenant       Manage tenants
```

##### Options

```
      --config      string   config file (default is $HOME/.karavictl.yaml)
  -h, --help                 help for karavictl
  -t, --toggle               Help message for toggle
  -f, --admin-token string   Specify the admin token file
```

##### Output

Outputs help text



---

### karavictl admin token

Generate admin tokens

##### Synopsis

Generate admin token for use with CSM Authorization commands.
The tokens output in YAML format, which can be saved in a file.

```bash
karavictl admin token [flags]
```

##### Options
```
  -h, --help                                 help for token
  -s, --jwt-signing-secret        string     Specify JWT signing secret, or omit to use stdin
  -n, --name                      string     Administration name
      --refresh-token-expiration  duration   Expiration time of the refresh token, e.g. 48h (default 720h0m0s)
      --access-token-expiration   duration   Expiration time of the access token, e.g. 1m30s (default 1m0s)

```

##### Output
```bash

$ karavictl admin token --name admin --access-token-expiration 30s --refresh-token-expiration 120m
$ Enter JWT Signing Secret: ***********

{
  "Access": <ACCESS-TOKEN>,
  "Refresh": <REFRESH-TOKEN>
}

```
Alternatively, one can supply JWT signing secret with command.

```bash

$ karavictl admin token --name admin --jwt-signing-secret secret --access-token-expiration 30s --refresh-token-expiration 120m
{
  "Access": <ACCESS-TOKEN>,
  "Refresh": <REFRESH-TOKEN>
}

```
##### Options inherited from parent commands

```
      --config string   config file (default is $HOME/.karavictl.yaml)
```
---



### karavictl cluster-info

Display the state of resources within the cluster

##### Synopsis

Prints table of resources within the cluster, including their readiness

```bash
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

```bash
karavictl cluster-info
```
```
NAME                   READY   UP-TO-DATE   AVAILABLE   AGE
github-auth-provider   1/1     1            1           59m
tenant-service         1/1     1            1           59m
redis-primary          1/1     1            1           59m
proxy-server           1/1     1            1           59m
redis-commander        1/1     1            1           59m
storage-service        1/1     1            1           59m
role-service           1/1     1            1           59m
```


---



### karavictl generate

Generate resources for use with CSM

##### Synopsis

Generates resources for use with CSM

```bash
karavictl generate [flags]
```

##### Options

```
  -h, --help   help for generate
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   config file (default is $HOME/.karavictl.yaml)
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

Example: 
```bash 

karavictl generate token --tenant Alice --admin-token admintoken.yaml | kubectl apply -f -
```
```bash
karavictl generate token [flags]
```

##### Options

```
  -h, --help                              help for token
  -t, --tenant                 string     Tenant name
   --access-token-expiration   duration   Expiration time of the access token, e.g. 1m30s (default 1m0s)
   --refresh-token-expiration  duration   Expiration time of the refresh token, e.g. 48h (default 720h0m0s)
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
      --config      string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```bash
karavictl generate token --tenant Alice --admin-token admintoken.yaml
```
```yaml
apiVersion: v1
data:
  access: <ACCESS-TOKEN>
  refresh: <REFRESH-TOKEN>
kind: Secret
metadata:
  creationTimestamp: null
  name: proxy-authz-tokens
type: Opaque
```


Usually, you will want to pipe the output to kubectl to apply the secret
```bash

karavictl generate token --tenant Alice --admin-token admintoken.yaml | kubectl apply -f -
```



## Role Commands



### karavictl role

Manage roles

##### Synopsis

Manage roles

```bash
karavictl role [flags]
```

##### Options

```
  -h, --help   Help for role
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   Config file (default is $HOME/.karavictl.yaml)
```

##### Output

Outputs help text



---



### karavictl role get 

Get role

##### Synopsis

Get role

```bash
karavictl role get [flags]
```

##### Options

```
  -h, --help   help for get
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   Config file (default is $HOME/.karavictl.yaml)
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
```

##### Output

```bash
karavictl role get CSISilver --admin-token admintoken.yaml
```
```yaml
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

```bash
karavictl role list [flags]
```

##### Options

```
  -h, --help   Help for list
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   Config file (default is $HOME/.karavictl.yaml)
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
```

##### Output

```bash
karavictl role list --admin-token admintoken.yaml
```
```yaml
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

```bash
karavictl role create [flags]
```

##### Options

```
  -f, --from-file string   Role data from a file
      --role      strings  Role in the form <name>=<type>=<id>=<pool>=<quota>
  -h, --help               Help for create
```

*NOTE:* 
  - For PowerScale, set the `quota` to 0 as CSM for Authorization does not enforce quota limits.

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   Config file (default is $HOME/.karavictl.yaml)
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
```

##### Output

```bash
karavictl role create --from-file roles.json --admin-token admintoken.yaml
```
On success, there will be no output. You may run `karavictl role get <role-name>` to confirm the creation occurred.

Alternatively, you can create a role in-line using:

```bash

karavictl role create --role=role-name=system-type=000000000001=mypool=200000000 --admin-token admintoken.yaml
```

---



### karavictl role update

Update the quota of one or more CSM roles

##### Synopsis

Updates the quota of one or more CSM roles

```bash
karavictl role update [flags]
```

##### Options

```
  -f, --from-file string   Role data from a file
      --role      strings  Role in the form <name>=<type>=<id>=<pool>=<quota>
  -h, --help               Help for update
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   config file (default is $HOME/.karavictl.yaml)
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
```

##### Output

```bash

karavictl role update --from-file roles.json --admin-token admintoken.yaml
```
On success, there will be no output. You may run `karavictl role get <role-name>` to confirm the update occurred.

Alternatively, you can update existing roles in-line using:

```bash

karavictl role update --role=role-name=system-type=000000000001=mypool=400000000 --admin-token admintoken.yaml
```
---



### karavictl role delete

Delete role

##### Synopsis

Delete role

```bash
karavictl role delete <role-name> [flags]
```

##### Options

```
  -h, --help   Help for delete
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   Config file (default is $HOME/.karavictl.yaml)
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
```

##### Output

```bash
karavictl role delete CSISilver --admin-token admintoken.yaml
```
On success, there will be no output. You may run `karavictl role get <role-name>` to confirm the deletion occurred.



---



### karavictl rolebinding

Manage role bindings

##### Synopsis

Management for role bindings

```bash
karavictl rolebinding [flags]
```

##### Options

```
  -h, --help   help for rolebinding
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

Outputs help text



---



### karavictl rolebinding create

Create a rolebinding between role and tenant

##### Synopsis

Creates a rolebinding between role and tenant

```bash
karavictl rolebinding create [flags]
```

##### Options

```
  -h, --help   help for create
  -r, --role string       Role name
  -t, --tenant string     Tenant name
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
      --config      string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```bash

karavictl rolebinding create --role CSISilver --tenant Alice --admin-token admintoken.yaml
```
On success, there will be no output. You may run `karavictl tenant get --name <tenant-name>` to confirm the rolebinding creation occurred.


---



### karavictl rolebinding delete

Delete a rolebinding between role and tenant

##### Synopsis

Deletes a rolebinding between role and tenant

```bash
karavictl rolebinding delete [flags]
```

##### Options

```
  -h, --help   help for delete
  -r, --role string      Role name
  -t, --tenant string    Tenant name
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
      --config      string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```bash

karavictl rolebinding delete --role CSISilver --tenant Alice --admin-token admintoken.yaml
```
On success, there will be no output. You may run `karavictl tenant get --name <tenant-name>` to confirm the rolebinding deletion occurred.



## Storage Commands



### karavictl storage

Manage storage systems

##### Synopsis

Manages storage systems

```bash
karavictl storage [flags]
```

##### Options

```
      --addr      string   Address of the server (default "localhost")
  -h, --help               Help for storage
      --insecure           Skip certificate validation
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

Outputs help text



---



### karavictl storage get

Get details on a registered storage system.

##### Synopsis

Gets details on a registered storage system.

```bash
karavictl storage get [flags]
```

##### Options

```
  -h, --help               Help for get
  -s, --system-id string   System identifier (default "systemid")
  -t, --type string        Type of storage system ("powerflex", "powermax")
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --addr        string   Address of the server (default "localhost")
      --config      string   Config file (default is $HOME/.karavictl.yaml)
      --insecure             Skip certificate validation
```

##### Output

```bash

karavictl storage get --type powerflex --system-id 3000000000011111 --admin-token admintoken.yaml
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

```bash
karavictl storage list [flags]
```

##### Options

```
  -h, --help          Help for list
  -t, --type string   Type of storage system
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   Config file (default is $HOME/.karavictl.yaml)
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
```

##### Output

```bash
karavictl storage list --admin-token admintoken.yaml

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

```bash
karavictl storage create [flags]
```

##### Options

```
  -e, --endpoint string    Endpoint of REST API gateway
  -h, --help               Help for create
  -a, --array-insecure     Array insecure skip verify
  -p, --password string    Password (default "****")
  -s, --system-id string   System identifier (default "systemid")
  -t, --type string        Type of storage system ("powerflex", "powermax")
  -u, --user string        Username (default "admin")
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   Config file (default is $HOME/.karavictl.yaml)
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
```

##### Output

```bash

karavictl storage create --endpoint https://1.1.1.1 --insecure --array-insecure --system-id 3000000000011111 --type powerflex --user admin --password ******** --admin-token admintoken.yaml
```
On success, there will be no output. You may run `karavictl storage get --type <storage-system-type> --system-id <storage-system-id>` to confirm the creation occurred.


---



### karavictl storage update

Update a registered storage system.

##### Synopsis

Updates a registered storage system.

```bash
karavictl storage update [flags]
```

##### Options

```
  -e, --endpoint string    Endpoint of REST API gateway
  -h, --help               Help for update
  -a, --array-insecure     Array insecure skip verify
  -p, --pass string        Password (default "****")
  -s, --system-id string   System identifier (default "systemid")
  -t, --type string        Type of storage system ("powerflex", "powermax")
  -u, --user string        Username (default "admin")
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   Config file (default is $HOME/.karavictl.yaml)
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
```

##### Output

```bash

karavictl storage update --endpoint https://1.1.1.1 --insecure --array-insecure --system-id 3000000000011111 --type powerflex --user admin --password ******** --admin-token admintoken.yaml
```
On success, there will be no output. You may run `karavictl storage get --type <storage-system-type> --system-id <storage-system-id>` to confirm the update occurred.



---



### karavictl storage delete

Delete a registered storage system.

##### Synopsis

Deletes a registered storage system.

```bash
karavictl storage delete [flags]
```

##### Options

```
  -h, --help               Help for delete
  -s, --system-id string   System identifier (default "systemid")
  -t, --type      string   Type of storage system ("powerflex", "powermax")
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   Config file (default is $HOME/.karavictl.yaml)
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
```

##### Output
```bash

karavictl storage delete --type powerflex --system-id 3000000000011111 --admin-token admintoken.yaml
```
On success, there will be no output. You may run `karavictl storage get --type <storage-system-type> --system-id <storage-system-id>` to confirm the deletion occurred.



## Tenant Commands



### karavictl tenant

Manage tenants

##### Synopsis

Management for tenants

```bash
karavictl tenant [flags]
```

##### Options

```
  -h, --help   help for tenant
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --config      string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

Outputs help text



---



### karavictl tenant create

Create a tenant resource within CSM

##### Synopsis

Creates a tenant resource within CSM

```bash
karavictl tenant create [flags]
```

##### Options

```
  -a, --approvesdc    To allow/deny SDC approval requests (default true | This flag is only applicable to PowerFlex. This flag will Approve/Deny a tenant's SDC request)
  -h, --help   help for create
  -n, --name string   Tenant name
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
      --config      string   config file (default is $HOME/.karavictl.yaml)
```

##### Output
```bash
karavictl tenant create --name Alice --admin-token admintoken.yaml
```
On success, there will be no output. You may run `karavictl tenant get --name <tenant-name>` to confirm the creation occurred.



---




### karavictl tenant get

Get a tenant resource within CSM

##### Synopsis

Gets a tenant resource and its assigned roles within CSM

```bash
karavictl tenant get [flags]
```

##### Options

```
  -h, --help          help for get
  -n, --name string   Tenant name
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --addr        string   Address of the server (default "localhost")
      --config      string   config file (default is $HOME/.karavictl.yaml)
      --insecure             Skip certificate validation
```

##### Output

```bash
karavictl tenant get --name Alice --admin-token admintoken.yaml

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

```bash
karavictl tenant list [flags]
```

##### Options

```
  -h, --help   help for list
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
      --config      string   config file (default is $HOME/.karavictl.yaml)
```

##### Output

```bash
karavictl tenant list --admin-token admintoken.yaml

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

```bash
karavictl tenant revoke [flags]
```

##### Options

```
  -c, --cancel        Cancel a previous tenant revocation
  -h, --help   help for create
  -n, --name string   Tenant name
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --addr        string   Address of the server (default "localhost")
      --insecure             Skip certificate validation
      --config      string   config file (default is $HOME/.karavictl.yaml)
```

##### Output
```bash
karavictl tenant revoke --name Alice --admin-token admintoken.yaml
```
On success, there will be no output.



---



### karavictl tenant delete

Deletes a tenant resource within CSM

##### Synopsis

Deletes a tenant resource within CSM

```bash
karavictl tenant delete [flags]
```

##### Options

```
  -h, --help   help for delete
  -n, --name string   Tenant name
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --addr        string   Address of the server (default "localhost")
      --config      string   config file (default is $HOME/.karavictl.yaml)
      --insecure             Skip certificate validation
```

##### Output
```bash
karavictl tenant delete --name Alice --admin-token admintoken.yaml
```
On success, there will be no output. You may run `karavictl tenant get --name <tenant-name>` to confirm the deletion occurred.



---



### karavictl tenant update

Updates a tenant's resource within CSM

##### Synopsis

Updates a tenant resource within CSM

```bash
karavictl tenant update [flags]
```

#### Options

```
  -a, --approvesdc    To allow/deny SDC approval requests (default true | This flag is only applicable to PowerFlex. This flag will Approve/Deny a tenant's SDC request)
  -h, --help   help for update
  -n, --name string   Tenant name
```

##### Options inherited from parent commands

```
  -f, --admin-token string   Specify the admin token file
      --addr        string   Address of the server (default "localhost")
      --config      string   config file (default is $HOME/.karavictl.yaml)
      --insecure             Skip certificate validation
```

##### Output
```bash

karavictl tenant update --name Alice --approvesdc=false --admin-token admintoken.yaml
```
On success, there will be no output. You may run `karavictl tenant get --name <tenant-name>` to confirm the update was persisted.