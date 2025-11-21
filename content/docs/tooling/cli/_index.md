---
title: "CLI"
linkTitle: "CLI"
weight: 4
Description: >
  CLI for Dell Container Storage Modules (CSM)
---
dellctl is a common command line interface(CLI) used to interact with and manage your [Container Storage Modules](https://github.com/dell/csm) (CSM) resources.
This document outlines all dellctl commands, their intended use, options that can be provided to alter their execution, and expected output from those commands.
{{<table "table table-striped table-bordered table-sm tdleft">}}
| Command | Description |
| - | - |
| [dellctl](../cli/#dellctl) | dellctl is used to interact with Container Storage Modules |
| [dellctl install](../cli/#dellctl-install) | Install a CSI Driver |
| [dellctl install powerstore](../cli/#dellctl-install-powerstore) | Install CSI Powerstore |
| [dellctl cluster](../cli/#dellctl-cluster) | Manipulate one or more k8s cluster configurations |
| [dellctl cluster add](../cli/#dellctl-cluster-add) | Add a k8s cluster to be managed by dellctl |
| [dellctl cluster remove](../cli/#dellctl-cluster-remove) | Removes a k8s cluster managed by dellctl |
| [dellctl cluster get](../cli/#dellctl-cluster-get) | List all clusters currently being managed by dellctl |
| [dellctl backup](../cli/#dellctl-backup) | Allows you to manipulate application backups/clones |
| [dellctl backup create](../cli/#dellctl-backup-create) | Create an application backup/clones |
| [dellctl backup delete](../cli/#dellctl-backup-delete) | Delete application backups |
| [dellctl backup get](../cli/#dellctl-backup-get) | Get application backups |
| [dellctl restore](../cli/#dellctl-restore) | Allows you to manipulate application restores |
| [dellctl restore create](../cli/#dellctl-restore-create) | Restore an application backup |
| [dellctl restore delete](../cli/#dellctl-restore-delete) | Delete application restores |
| [dellctl restore get](../cli/#dellctl-restore-get) | Get application restores |
| [dellctl images](../cli/#dellctl-images) | List the container images needed by csi driver |
| [dellctl volume get](../cli/#dellctl-volume-get) | Gets driver volume information for a given tenant on a local cluster |
| [dellctl snapshot get](../cli/#dellctl-snapshot-get) | Gets driver snapshot information for a given tenant on a local cluster |
| [dellctl admin token](../cli/#dellctl-admin-token) | Generate an administrator token for administrating CSM Authorization v2 |
| [dellctl generate token](../cli/#dellctl-generate-token) | Generate a tenant token for configuring a Dell CSI Driver with CSM Authorization v2 |
{{</table>}}

## Installation instructions

1. Download `dellctl` from [here](https://github.com/dell/csm/releases/latest/download/dellctl).
2. chmod +x dellctl
3. Move `dellctl` to `/usr/local/bin` or add `dellctl`'s containing directory path to PATH environment variable.
4. Run `dellctl --help` to know available commands or run `dellctl command --help` to know more about a specific command.

By default, the `dellctl` runs against local cluster(referenced by `KUBECONFIG` environment variable or by a kube config file present at default location).
The user can register one or more remote clusters for `dellctl`, and run any `dellctl` command against these clusters by specifying the registered cluster id to the command.

## General Commands

### dellctl

dellctl is a CLI tool for managing Dell Container Storage Resources.

##### Flags

```bash
  -h, --help      help for dellctl
  -v, --version   version for dellctl  
```

##### Output

Outputs help text

---

### dellctl install

Installs a Dell CSI Driver and optionally installs protocol prerequisites and validates data path connectivity.

##### Available Commands

```bash
  powerstore         Install the Dell CSI Powerstore driver
```
{{< collapse id="dellctl-install-cli-params" title="CLI Parameters" card="false" >}}
{{<table install-flags >}}
| Flag               | Description | Default | Mandatory |
|:-------------------|:------------|:--------|:-----------
| certified                                 | The certified images from registry.connect.redhat.com are used instead of the quay.io images. | false | No |
| config-version <string>                   | Version of Container Storage Modules to install. | {{VERSION}} | No |
| csi-node-prefix <string>                  | The prefix for all CSI nodes provisioned by the driver. | csi-node | No |
| csi-volume-prefix <string>                | The prefix for all CSI volumes provisioned by the driver. | csivol | No |
| csm-authorization-proxy-hostname <string> | If deploying CSM Authorization, the hostname of the Authorization Proxy Server.  | "" | No |
| force                                     | The existing Container Storage Module resources are deleted and then recreated.  | false | No |
| from-file <string>                        | Path to a YAML file containing configuration details for installing the CSM.  | "" | No |
| machineconfig                             | Configure pre-requisities based on the provided block-protocol parameter. See the relevant orchestrator and platform [installation page](../../getting-started/installation/) for which prerequisites are configured.  | false | No |
| modules <stringArray>                     | Container Storage Modules modules to install. This is provided as a comma-separated string. Supported modules are: authorization, observability, resiliency.  | "" | No |
| namespace <string>                        | Namespace to install into (lowercase alphanumeric, may include dashes, must start/end with alphanumeric).  | "namespace" | Yes |
| operator-install                          | Container Storage Modules Custom Resource Definitions will be installed.  | false | No |
| output                                    | Output from dellctl install. This dumps every generated yaml to the console. | false | No |
| registry-url <string>                     | Registry URL to use for images.  | "" | No |
| skip-cert-validation-authz                | Skip certificate validation when connecting to the CSM Authorization proxy server. | false | No |
| snapshot-controller                       | Configure snapshot CRDs and controller.  | false | No |
| storage <stringArray>                   | Storage endpoint configuration in the form 'endpoint=<IP\|hostname>,username=<user>[,otherKey=otherValue]'. Can be provided multiple times.  |  "" | Yes |
| tenant-token                              | Path to a YAML file containing Authorization tenant token (proxy-authz-token secret). | "" | No |
| validate-connectivity                     | Run a DaemonSet on all nodes to verify connectivity to storage systems.  | false | No |
{{</table >}}
{{< /collapse >}}

> **NOTES:**
> - `--machineconfig` is applicable for both OpenShift and Kubernetes.
> - Replication is not supported via CLI flags. [From-File](#from-file-parameters) must be used to install Replication.

{{< collapse id="dellctl-install-cli-params" title="From-File Parameters" card="false" >}}
{{<table install-flags >}}
| Parameter               | Description | Default | Mandatory |
|:-------------------|:------------|:--------|:-----------
| certified                                  | The certified images from registry.connect.redhat.com are used instead of the quay.io images. | false | No |
| config-version <string>                    | Version of Container Storage Modules to install. | {{VERSION}} | No |
| csi-node-prefix <string>                   | The prefix for all CSI nodes provisioned by the driver. | csi-node | No |
| csi-volume-prefix <string>                 | The prefix for all CSI volumes provisioned by the driver. | csivol | No |
| force                                      | The existing Container Storage Module resources are deleted and then recreated.  | false | No |
| from-file <string>                         | Path to a YAML file containing configuration details for installing the CSM.  | "" | No |
| machineconfig                              | Configure pre-requisities based on the provided block-protocol parameter. See the relevant orchestrator and platform [installation page](../../getting-started/installation/_index.md) for which prerequisites are configured.  | false | No |
| modules <stringArray>                      | Container Storage Modules modules to install. Supported modules are: replication, authorization, observability, resiliency.  | "" | No |
| namespace <string>                         | Namespace to install into (lowercase alphanumeric, may include dashes, must start/end with alphanumeric).  | "namespace" | Yes |
| operator-install                           | Container Storage Modules Custom Resource Definitions will be installed.  | false | No |
| output                                     | Output from dellctl install. This dumps every generated yaml to the console. | false | No |
| registry-url <string>                      | Registry URL to use for images.  | "" | No |
| snapshot-controller                        | Configure snapshot CRDs and controller.  | false | No |
| validate-connectivity                      | Run a DaemonSet on all nodes to verify connectivity to storage systems.  | false | No |
| **storage**                                | This section configures the storage systems. It is provided as an array. | - | - |
| storage.endpoint                           | The IP address or hostname of the storage system endponit (i.e., 10.0.0.1). | "" | Yes |
| storage.username                           | Username for accessing PowerFlex system. If authorization is enabled, username will be ignored. | "" | Yes |
| storage.block-protocol                     | Transport protocol for block storage (Fc, ISCSI, NVMeTCP, NVMeFC, None, auto) | FC | No |
| storage.nfs-acls                           | NFS ACLs used if NFS is being used on the array. | 0777 | No |
| storage.skip-certificate-validation        | Enable or disable validadting the storage system certificate. | false | No |
| storage.primary                            | Replicated storage classes will this cluster as the primary site. | false | No |
| storage.secondary                          | Replicated storage classes will this cluster as the secondary site. | false | No |
| **storage.storage-class**                  | This section configures the storage classes. It is provided as an array. | - | - |
| storage.storage-class.fsType               | The file system type of the provisioned volume. | ext4 | No |
| storage.storage-class.reclaimPolicy        | The reclaim policy of the provisioned volume. | Delete | No |
| storage.storage-class.volumeBindingMode    | The binding mode of the provisioned volume. | WaitForFirstConsumer | No |
| storage.storage-class.allowVolumeExpansion | Enable or disable expansion of the provisioned volume. | true | No |
| storage.storage-class.<br>allowedTopologies.matchLabelExpressions    | The allowed topologies of the provisioned volume. This is provided as an array. | - | No |
| storage.storage-class.allowedTopologies.key    | The key of the allowed topology. | "" | No |
| storage.storage-class.allowedTopologies.values | The values of the allowed topology. This is provided as an array. | "" | No |
| **storage.metro-replication**              | This section configures metro replication. | - | - |
| storage.metro-replication.hostConnectivity.local.<br>nodeSelectorTerms.matchExpressions | The label expressions to describe a node whose host should be registered. This is provided as an array.  | - | No |
| storage.metro-replication.hostConnectivity.local.<br>nodeSelectorTerms.matchExpressions.key | The label key of the label expression.  | "" | No |
| storage.metro-replication.hostConnectivity.local.<br>nodeSelectorTerms.matchExpressions.operator | The operator for the values.  | "" | No |
| storage.metro-replication.hostConnectivity.local.<br>nodeSelectorTerms.matchExpressions.values | The values of the key. This is provided as an array.  | "" | No |
| storage.metro-replication.hostConnectivity.metro.<br>colocatedLocal.<br>nodeSelectorTerms.matchExpressions | The label expressions to describe a node whose host should be registered. This is provided as an array.  | - | No |
| storage.metro-replication.hostConnectivity.metro.<br>colocatedLocal.nodeSelectorTerms.<br>matchExpressions.key | The label key of the label expression.  | "" | No |
| storage.metro-replication.hostConnectivity.metro.<br>colocatedLocal.nodeSelectorTerms.<br>matchExpressions.operator | The operator for the values.  | "" | No |
| storage.metro-replication.hostConnectivity.metro.<br>colocatedLocal.nodeSelectorTerms.<br>matchExpressions.values | The values of the key. This is provided as an array.  | "" | No |
| storage.metro-replication.hostConnectivity.metro.<br>colocatedRemote.<br>nodeSelectorTerms.matchExpressions | The label expressions to describe a node whose host should be registered. This is provided as an array.  | - | No |
| storage.metro-replication.hostConnectivity.metro.<br>colocatedRemote.nodeSelectorTerms.<br>matchExpressions.key | The label key of the label expression.  | "" | No |
| storage.metro-replication.hostConnectivity.metro.<br>colocatedRemote.nodeSelectorTerms.<br>matchExpressions.operator | The operator for the values.  | "" | No |
| storage.metro-replication.hostConnectivity.metro.<br>colocatedRemote.nodeSelectorTerms.<br>matchExpressions.values | The values of the key. This is provided as an array.  | "" | No |
| storage.metro-replication.hostConnectivity.metro.<br>colocatedBoth.nodeSelectorTerms.matchExpressions | The label expressions to describe a node whose host should be registered. This is provided as an array.  | - | No |
| storage.metro-replication.hostConnectivity.metro.<br>colocatedBoth.nodeSelectorTerms.<br>matchExpressions.key | The label key of the label expression.  | "" | No |
| storage.metro-replication.hostConnectivity.metro.<br>colocatedBoth.nodeSelectorTerms.<br>matchExpressions.operator | The operator for the values.  | "" | No |
| storage.metro-replication.hostConnectivity.metro.<br>colocatedBoth.nodeSelectorTerms.<br>matchExpressions.values | The values of the key. This is provided as an array.  | "" | No |
| **replication**                            | This sections configures replication. | - | - |
| replication.sourceClusterID                | The source cluster ID. | "" | No |
| replication.targetClusterID                | The target cluster ID. | "" | No |
| replication.parameters.rpo                 | The recovery point objective. | Five_Minutes | No |
| replication.parameters.mode                | The replication mode (ASYNC, SYNC). | ASYNC | No |
| replication.parameters.ignoreNamespaces    |  Ignore the namespace in which the persistent volume claim resides and put every volume created into a single volume group. This parameter is not applicable for Metro mode. | false | No |
| replication.parameters.volumeGroupPrefix   | The string appended to the volume group name. | csi | No |
| **authorization**                          | This section configures authorization. | - | - |
| authorization.authorizationProxyHostname                     | The hostname of the CSM Authorization proxy-server. | "" | No |
| authorization.skipCertificateValidation    | Enable or disable validadting the CSM Authorization proxy-server certificate. | false | No |
| authorization.tenantTokenPath              | The path to the tenant token file. | "" | No |
{{</table >}}
{{< /collapse >}}

---

### dellctl install powerstore

This command deploys the CSI PowerStore driver and optional modules in your Kubernetes or OpenShift environment. 

{{< collapse id="dellctl-install-powerstore-examples" title="CLI Flag Examples" card="false" >}}
{{< collapse id="dellctl-install-powerstore-without-machineconfig-validate" title="Install" card="false" >}}
Without installing and configuring protocol prerequisites and validating data path connectivity
```bash
dellctl install powerstore --namespace=powerstore --operator-install=true \
                           --storage "endpoint=10.0.0.1,username=username" \
                           --storage "endpoint=10.0.0.2,username=username"
```

With installing and configuring protocol prerequisites and validating data path connectivity
```bash
dellctl install powerstore --machineconfig --validate-connectivity --namespace=powerstore --operator-install=true \
                           --storage "endpoint=10.0.0.1,username=username" \
                           --storage "endpoint=10.0.0.2,username=username"
```
{{< /collapse >}}
{{< collapse id="dellctl-install-powerstore-without-machineconfig-validate-geneerate" title="Output the YAML to install" card="false" >}}
Output the YAML to install CSI Powerstore to the console
```bash
dellctl install powerstore --namespace=powerstore --output \
                           --storage "endpoint=10.0.0.1,username=username" \
                           --storage "endpoint=10.0.0.2,username=username"
```
{{< /collapse >}}
{{< collapse id="dellctl-install-powerstore-resiliency" title="Install with Resiliency" card="false" >}}
Install CSI Powerstore with CSM Resiliency
```bash
dellctl install powerstore --modules=resiliency --namespace=powerstore --operator-install=true \
                           --storage "endpoint=10.0.0.1,username=username" \
                           --storage "endpoint=10.0.0.2,username=username"
```
{{< /collapse >}}
{{< collapse id="dellctl-install-powerstore-observability" title="Install with Observability" card="false" >}}
Install CSI Powerstore with CSM Observability
```bash
dellctl install powerstore --modules=observability --namespace=powerstore --operator-install=true \
                           --storage "endpoint=10.0.0.1,username=username" \
                           --storage "endpoint=10.0.0.2,username=username"
```
{{< /collapse >}}
{{< collapse id="dellctl-install-powerstore-authorization" title="Install with Authorization" card="false" >}}
Install CSI Powerstore with CSM Authorization
```bash
dellctl install powerstore  --modules=authorization --namespace=powerstore --operator-install=true \
                           --csm-authorization-proxy-hostname=csm-authorization.com \
                           --tenant-token=/tmp/token.yaml \
                           --storage "endpoint=10.0.0.1,username=username" \
                           --storage "endpoint=10.0.0.2,username=username"
```
{{< /collapse >}}
{{< /collapse >}}

{{< collapse id="dellctl-install-powerstore-examples" title="From File Examples" card="false" >}}
```bash
dellctl install powerstore --from-file=config.yaml
```
{{< collapse id="dellctl-install-powerstore-without-machineconfig-validate" title="Install" card="false" >}}

Without installing and configuring protocol prerequisites and validating data path connectivity
```yaml
# Global Driver parameters
namespace: powerstore
operator-install: true
 
# Parameters for each PowerStore system
storage:
  - endpoint: 10.0.0.1
    username: user
  - endpoint: 10.0.0.2
    username: user
```

With installing and configuring protocol prerequisites and validating data path connectivity
```yaml
# Global Driver parameters
namespace: powerstore
operator-install: true
machineconfig: true
validate-connectivity: true
 
# Parameters for each PowerStore system
storage:
  - endpoint: 10.0.0.1
    username: user
  - endpoint: 10.0.0.2
    username: user
```
{{< /collapse >}}
{{< collapse id="dellctl-install-powerstore-without-machineconfig-validate-output" title="Output the YAML to install" card="false" >}}
Output the YAML to install CSI Powerstore to the console
```yaml
# Global Driver parameters
namespace: powerstore
operator-install: true
output: true
 
# Parameters for each PowerStore system
storage:
  - endpoint: 10.0.0.1
    username: user
  - endpoint: 10.0.0.2
    username: user
```
{{< /collapse >}}
{{< collapse id="dellctl-install-powerstore-resiliency" title="Install CSI Powerstore with Resiliency" card="false" >}}
Install CSI Powerstore with CSM Resiliency
```yaml
# Global Driver parameters
namespace: powerstore
operator-install: true
modules: resiliency
 
# Parameters for each PowerStore system
storage:
  - endpoint: 10.0.0.1
    username: user
  - endpoint: 10.0.0.2
    username: user
```
{{< /collapse >}}
{{< collapse id="dellctl-install-powerstore-observability" title="Install CSI Powerstore with Observability" card="false" >}}
Install CSI Powerstore with CSM Observability
```yaml
# Global Driver parameters
namespace: powerstore
operator-install: true
modules: observability
 
# Parameters for each PowerStore system
storage:
  - endpoint: 10.0.0.1
    username: user
  - endpoint: 10.0.0.2
    username: user
```
{{< /collapse >}}
{{< collapse id="dellctl-install-powerstore-authorization" title="Install CSI Powerstore with Authorization" card="false" >}}
Install CSI Powerstore with CSM Authorization
```yaml
# Global Driver parameters
namespace: powerstore
operator-install: true
modules: authorization
 
# Parameters for each PowerStore system
storage:
  - endpoint: 10.0.0.1
    username: user
  - endpoint: 10.0.0.2
    username: user

authorization:
  hostname: csm-authorization.com
  skipCertificateValidation: false
  tenantTokenPath: /tmp/token.yaml
```
{{< /collapse >}}
{{< collapse id="dellctl-install-powerstore-replication" title="Install CSI Powerstore with Replication" card="false" >}}
Install CSI Powerstore with CSM Replication
```yaml
# Global Driver parameters
namespace: powerstore
operator-install: true
modules: replciation
 
# Parameters for each PowerStore system
storage:
  - endpoint: 10.0.0.1
    username: user
  - endpoint: 10.0.0.2
    username: user

replication:
  sourceClusterID: "cluster-1"
  targetClusterID: "cluster-2"
  parameters:
    rpo: "Five_Minutes"
    mode: "ASYNC"
    ignoreNamespaces: false
    volumeGroupPrefix: "csi"
```
{{< /collapse >}}
{{< collapse id="dellctl-install-powerstore-replication" title="Install CSI Powerstore Metro with Replication" card="false" >}}
Install CSI Powerstore with CSM Metro Replication
```yaml
# Global Driver parameters
namespace: powerstore
operator-install: true
modules: replciation
 
# Parameters for each PowerStore system
storage:
  - endpoint: 10.0.0.1
    username: user
    metro-replication:
      - hostConnectivity:
          local:
            nodeSelectorTerms:
              - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "NotIn"
                  values:
                    - "zone-a"
                    - "zone-b"
                    - "zone-ab"
          metro:
            colocatedLocal:
              nodeSelectorTerms:
                - matchExpressions:
                  - key: "topology.kubernetes.io/zone"
                    operator: "In"
                    values:
                      - "zone-a"
            colocatedRemote:
              nodeSelectorTerms:
                - matchExpressions:
                  - key: "topology.kubernetes.io/zone"
                    operator: "In"
                    values:
                      - "zone-b"
            colocatedBoth:
              nodeSelectorTerms:
                - matchExpressions:
                    - key: "topology.kubernetes.io/zone"
                      operator: "In"
                      values:
                        - "zone-ab"
  - endpoint: 10.0.0.2
    username: user
    metro-replication:
      - hostConnectivity:
          local:
            nodeSelectorTerms:
              - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "NotIn"
                  values:
                    - "zone-a"
                    - "zone-b"
                    - "zone-ab"
          metro:
            colocatedLocal:
              nodeSelectorTerms:
                - matchExpressions:
                  - key: "topology.kubernetes.io/zone"
                    operator: "In"
                    values:
                      - "zone-a"
            colocatedRemote:
              nodeSelectorTerms:
                - matchExpressions:
                  - key: "topology.kubernetes.io/zone"
                    operator: "In"
                    values:
                      - "zone-b"
            colocatedBoth:
              nodeSelectorTerms:
                - matchExpressions:
                    - key: "topology.kubernetes.io/zone"
                      operator: "In"
                      values:
                        - "zone-ab"

replication:
  sourceClusterID: "cluster-1"
  targetClusterID: "cluster-2"
  parameters:
    rpo: "Five_Minutes"
    mode: "ASYNC"
    ignoreNamespaces: false
    volumeGroupPrefix: "csi"
```
{{< /collapse >}}
{{< collapse id="dellctl-install-powerstore-full-config" title="Configuration with all available storage parameters" card="false" >}}
```yaml
# Global Driver parameters
namespace: powerstore
config-version: {{VERSION}}
csi-volume-prefix: myvol
csi-node-prefix: nodepre
operator-install: true
machineconfig: true
snapshot-controller: true
validate-connectivity: true
registry-url: my.registry.com:5000/dell/csm
modules: replication,authorization,observability,resiliency
 
# Parameters for each PowerStore system
storage:
  - endpoint: 10.0.0.1
    username: user
    block-protocol: FC
    nfs-acls: 0777
    skip-certificate-validation: true
    primary: true
    storage-class:
      - fsType: ext4
        reclaimPolicy: Delete
        volumeBindingMode: WaitForFirstConsumer
        allowVolumeExpansion: true
        allowedTopologies:
          - matchLabelExpressions:
              - key: csi-powerstore.dellemc.com/10.0.0.1-fc
                values:
                  - true
    metro-replication:
      - hostConnectivity:
          local:
            nodeSelectorTerms:
              - matchExpressions:
                - key: "topology.kubernetes.io/zone"
                  operator: "NotIn"
                  values:
                    - "zone-a"
                    - "zone-b"
                    - "zone-ab"
          metro:
            colocatedLocal:
              nodeSelectorTerms:
                - matchExpressions:
                  - key: "topology.kubernetes.io/zone"
                    operator: "In"
                    values:
                      - "zone-a"
            colocatedRemote:
              nodeSelectorTerms:
                - matchExpressions:
                  - key: "topology.kubernetes.io/zone"
                    operator: "In"
                    values:
                      - "zone-b"
            colocatedBoth:
              nodeSelectorTerms:
                - matchExpressions:
                    - key: "topology.kubernetes.io/zone"
                      operator: "In"
                      values:
                        - "zone-ab"
    include-nas-servers:
      - nas-1
    exclude-nas-servers:
      - nas-2
 
  - endpoint: 10.0.0.2
    username: user
    block-protocol: FC
    nfs-acls: 0777
    skip-certificate-validation: false
    secondary: true
    storage-class:
      - fsType: xfs
        reclaimPolicy: Delete
        volumeBindingMode: Immediate
        allowVolumeExpansion: true
        allowedTopologies:
          - key: value
    include-nas-servers:
      - nas-3
    exclude-nas-servers:
      - nas-4
```
{{< /collapse >}}
{{< /collapse >}}

---

### dellctl cluster

Allows you to manipulate one or more k8s cluster configurations

##### Available Commands

```bash
  add         Adds a k8s cluster to be managed by dellctl
  remove      Removes a k8s cluster managed by dellctl
  get         List all clusters currently being managed by dellctl  
```

##### Flags

```bash
  -h, --help   help for cluster  
```

##### Output

Outputs help text

---

### dellctl cluster add

Add one or more k8s clusters to be managed by dellctl

##### Flags

```bash
Flags:
  -n, --names strings   cluster names
  -f, --files strings   paths for kube config files
  -u, --uids strings    uids of the kube-system namespaces in the clusters
      --force           forcefully add cluster
  -h, --help            help for add
```

##### Output

```bash
dellctl cluster add -n cluster1 -f ~/kubeconfigs/cluster1-kubeconfig
```

```bash
 INFO Adding clusters ...
 INFO Cluster: cluster1
 INFO Successfully added cluster cluster1 in /root/.dellctl/clusters/cluster1 folder.
```

Add a cluster with it's uid

```bash
dellctl cluster add -n cluster2 -f ~/kubeconfigs/cluster2-kubeconfig -u "035133aa-5b65-4080-a813-34a7abe48180"
```

```bash
 INFO Adding clusters ...
 INFO Cluster: cluster2
 INFO Successfully added cluster cluster2 in /root/.dellctl/clusters/cluster2 folder.
```

---

### dellctl cluster remove

Removes a k8s cluster by name from the list of clusters being managed by dellctl

##### Aliases

```bash
  remove, rm
```

##### Flags

```bash
  -h, --help          help for remove
  -n, --name string   cluster name
```

##### Output

```bash
dellctl cluster remove -n cluster1
```

```bash
 INFO Removing cluster with id cluster1
 INFO Removed cluster with id cluster1
```

---

### dellctl cluster get

List all clusters currently being managed by dellctl

##### Aliases

```bash
  get, ls
```

##### Flags

```bash
  -h, --help   help for get
```

##### Output

```bash
dellctl cluster get
```

```bash
CLUSTER ID      VERSION URL                             UID
cluster1        v1.22   https://1.2.3.4:6443
cluster2        v1.22   https://1.2.3.5:6443            035133aa-5b65-4080-a813-34a7abe48180
```

---


### dellctl images

List the container images needed by csm components

**NOTE.**:

#### Supported CSM Components

[csi-vxflexos,csi-isilon,csi-powerstore,csi-unity,csi-powermax,csm-authorization]

#### Aliases

```bash
images,imgs
```

#### Flags

```bash
  Flags:
  -c, --component string   csm-component name
  -h, --help               help for images
```

#### Output

```bash
dellctl images --component csi-vxflexos
```

```bash
Driver/Module Image             Supported Orchestrator Versions         Sidecar Images
quay.io/dell/container-storage-modules/csi-vxflexos:v2.13.0     k8s1.32,k8s1.31,k8s1.30,ocp4.18,ocp4.17 registry.k8s.io/sig-storage/csi-attacher:{{< version-docs key="csi_attacher_latest_version" >}}
                                                                        registry.k8s.io/sig-storage/csi-provisioner:{{< version-docs key="csi_provisioner_latest_version" >}}
                                                                        registry.k8s.io/sig-storage/csi-external-health-monitor-controller:{{< version-docs key="csi_health_monitor_controller_latest_version" >}}
                                                                        registry.k8s.io/sig-storage/csi-snapshotter:{{< version-v1 key="csi_snapshotter_latest_version" >}}
                                                                        registry.k8s.io/sig-storage/csi-resizer:{{< version-docs key="csi_resizer_latest_version" >}}
                                                                        registry.k8s.io/sig-storage/csi-node-driver-registrar:{{< version-docs key="csi_node_driver_registrar_latest_version" >}}
                                                                        quay.io/dell/storage/powerflex/sdc:4.5.2.1

```

```bash
dellctl images --component csm-authorization
```

```bash
Driver/Module Image                             Supported Orchestrator Versions Sidecar Images
quay.io/dell/container-storage-modules/csm-authorization-sidecar:v1.13.0        k8s1.32,k8s1.31,k8s1.30         jetstack/cert-manager-cainjector:v1.6.1
                                                                                jetstack/cert-manager-controller:v1.6.1
                                                                                jetstack/cert-manager-webhook:v1.6.1
                                                                                ingress-nginx/controller:v1.4.0
                                                                                ingress-nginx/kube-webhook-certgen:v20220916-gd32f8c343
```

---

### dellctl volume get

Gets the drivers volume information from the authorization proxy for a given tenant on a local cluster

##### Aliases

  get, ls, list

##### Flags

```bash
  -h, --help                           help for get
      --insecure optionalBool[=true]   provide flag to skip certificate validation
      --namespace string               namespace of the secret for the given tenant
      --proxy string                   auth proxy endpoint to use
```

##### Output

Gets the drivers volume information for a given tenant on a local cluster. The namespace is the namespace where tenant secret is created.

```bash
dellctl volume get --proxy <proxy.dell.com> --namespace <namespace>
```

```bash
# dellctl volume get --proxy <proxy.dell.com> --namespace vxflexos
NAME                 VOLUME ID          SIZE       POOL    SYSTEM ID          PV NAME          PV STATUS   STORAGE CLASS   PVC NAME                NAMESPACE            SNAPSHOT COUNT
tn1-k8s-82b35df793   c6c98e30000000d3   8.000000   pool1   636468e3638c840f                                                                                             0
tn1-k8s-e0e7958ee0   c6cf35ba000001a3   8.000000   pool1   636468e3638c840f   k8s-e0e7958ee0   Bound       vxflexos        pvol-vxflexos           default              2
tn1-k8s-bc83d4c626   c6cf35c1000001a1   8.000000   pool1   636468e3638c840f   k8s-bc83d4c626   Bound       vxflexos        vol-create-test-xbgnr   snap-test-057de678   3
```

---

### dellctl snapshot get

Gets the drivers snapshot information from the authorization proxy for a given tenant on a local cluster

##### Aliases

  get, ls, list

##### Flags

```bash
  -h, --help                            help for get
      --insecure optionalBool[=true]    provide flag to skip certificate validation
      --namespace string                namespace of the secret for the given tenant
      --proxy string                    auth proxy endpoint to use
```

##### Output

Get the drivers snapshot information for a given tenant on a local cluster. The namespace is the namespace where the tenant secret is created.

```bash
dellctl snapshot get --proxy <proxy.dell.com> --namespace <namespace>
```

```bash
# dellctl snapshot get --proxy <proxy.dell.com> --namespace vxflexos
NAME                              SNAPSHOT ID        SIZE       POOL    SYSTEM ID          ACCESS MODE   SOURCE VOLUME ID
tn1-sn-8e51dfa6-6f64-4cac-a776-   c6cf35c4000001aa   8.000000   pool1   636468e3638c840f   ReadWrite     c6cf35c1000001a1
tn1-sn-27ff7d0c-b60d-4f5d-be2e-   c6cf35c2000001a2   8.000000   pool1   636468e3638c840f   ReadWrite     c6cf35c1000001a1
tn1-sn-85e32ce4-379b-4a9e-948b-   c6cf35c3000001a9   8.000000   pool1   636468e3638c840f   ReadWrite     c6cf35c1000001a1
tn1-sn-59c272f4-babd-4e24-951a-   c6cf35bb000001a4   8.000000   pool1   636468e3638c840f   ReadWrite     c6cf35ba000001a3
tn1-sn-2d1580a4-60ec-4082-8234-   c6cf35bc000001a6   8.000000   pool1   636468e3638c840f   ReadWrite     c6cf35ba000001a3

```

---

### dellctl admin token

Generate an administrator token for administrating CSM Authorization v2

##### Flags

```bash
      --access-token-expiration duration    Expiration time of the access token, e.g. 1m30s (default 1m0s)
  -h, --help                                help for token
  -s, --jwt-signing-secret string           Specify JWT signing secret, or omit to use stdin
  -n, --name string                         Admin name
      --refresh-token-expiration duration   Expiration time of the refresh token, e.g. 48h (default 720h0m0s)
```

##### Output

```bash
dellctl admin token -n <administrator-name> --jwt-signing-secret <signing-secret>
```

```bash
# dellctl admin token -n admin --jwt-signing-secret secret
{
  "Access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjc20iLCJleHAiOjE3MjA3MDk1MTcsImdyb3VwIjoiYWRtaW4iLCJpc3MiOiJjb20uZGVsbC5jc20iLCJyb2xlcyI6IiIsInN1YiI6ImNzbS1hZG1pbiJ9.WS5NSxrCoMn90ohOZZyyGoBias583xYumeKvmIrCqSs",
  "Refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjc20iLCJleHAiOjE3MjMzMDE0NTcsImdyb3VwIjoiYWRtaW4iLCJpc3MiOiJjb20uZGVsbC5jc20iLCJyb2xlcyI6IiIsInN1YiI6ImNzbS1hZG1pbiJ9.MJ9ajrB-nLEQKdAA-H8n78kS9QiX1yW_-m7K4Tmu7Mg"
}
```

---

### dellctl generate token

Generate a tenant token for configuring a Dell CSI Driver with CSM Authorization v2

##### Flags

```bash
      --access-token-expiration duration    Expiration time of the access token, e.g. 1m30s (default 1m0s)
  -h, --help                                help for token
      --refresh-token-expiration duration   Expiration time of the refresh token, e.g. 48h (default 720h0m0s)
  -t, --tenant string                       Tenant name

Global Flags:
      --addr string          Address of the CSM Authorization Proxy Server; required
  -f, --admin-token string   Path to admin token file; required
      --insecure             Skip certificate validation of the CSM Authorization Proxy Server
```

##### Output

```bash
dellctl generate token --admin-token <admin-token-file> --addr <csm-authorization-address> --tenant <tenant-name>
```

```bash
# dellctl admin token -n admin --jwt-signing-secret secret
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
