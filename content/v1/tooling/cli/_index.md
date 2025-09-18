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
quay.io/dell/container-storage-modules/csi-vxflexos:v2.13.0     k8s1.32,k8s1.31,k8s1.30,ocp4.18,ocp4.17 registry.k8s.io/sig-storage/csi-attacher:{{< version-v1 key="csi_attacher_latest_version" >}}
                                                                        registry.k8s.io/sig-storage/csi-provisioner:{{< version-v1 key="csi_provisioner_latest_version" >}}
                                                                        registry.k8s.io/sig-storage/csi-external-health-monitor-controller:{{< version-v1 key="csi_health_monitor_controller_latest_version" >}}
                                                                        registry.k8s.io/sig-storage/csi-snapshotter:{{< version-v1 key="csi_snapshotter_latest_version" >}}
                                                                        registry.k8s.io/sig-storage/csi-resizer:{{< version-v1 key="csi_resizer_latest_version" >}}
                                                                        registry.k8s.io/sig-storage/csi-node-driver-registrar:{{< version-v1 key="csi_node_driver_registrar_latest_version" >}}
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
