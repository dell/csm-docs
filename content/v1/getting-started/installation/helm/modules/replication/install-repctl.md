---
title: Installation using repctl
linktitle: Installation using repctl
weight: 4
description: Installation of CSM for Replication using repctl
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

## Install Replication Walkthrough

> **_NOTE:_**  These steps should not be used when installing using Dell CSM Operator.

### Set up repctl tool

Before you begin, make sure you have the repctl tool available.

You can download a pre-built repctl binary from our [Releases](https://github.com/dell/csm-replication/releases) page.

```shell
wget https://github.com/dell/csm-replication/releases/download/{{< version-v1 key="Replication" >}}/repctl-linux-amd64
mv repctl-linux-amd64 repctl
chmod +x repctl
```

Alternately, if you want to build the binary yourself, you can follow these steps:

```shell
git clone -b {{< version-v1 key="Replication" >}} https://github.com/dell/csm-replication.git
cd csm-replication/repctl
make build
```

### Installation steps

> **_NOTE:_**  The repctl commands only have to be run from one Kubernetes cluster. Repctl does the appropriate configuration on both clusters, when installing replication with it.

You can start using Container Storage Modules for Replication with help from `repctl` using these simple steps:

1. Prepare admin Kubernetes clusters configs
2. Add admin configs as clusters to `repctl`:
      ```shell

      ./repctl cluster add -f "/root/.kube/config-1","/root/.kube/config-2" -n "cluster-1","cluster-2"
      ```
   > **_NOTE:_**  If using a single Kubernetes cluster in a stretched configuration there will be only one cluster.
3. Install replication CRDs:
      ```shell
      ./repctl create -f ../deploy/replicationcrds.all.yaml
      ```
4. Install replication controller:

   Update `allow-pvc-creation-on-target` arg to `true` or `false` as required.  
   Default: `false`

     `true`: It replicates the PVC on target cluster (in case of `multi cluster`)

     `false`: It updates the `claimRef` on remote PV 
      ```shell
      ./repctl create -f ../deploy/controller.yaml
      ```
   > **_NOTE:_**  The controller will report that configmap is invalid. This is expected behavior.
   > The message should disappear once you inject the kubeconfigs (next step).
5. (Choose one)
    1. (More secure) Inject service accounts' configs into clusters:
          ```shell
          ./repctl cluster inject --use-sa
          ```
    2. (Less secure) Inject admin configs into clusters:
          ```shell
          ./repctl cluster inject
          ```
    > **_NOTE:_**  After running this command, dell-replication-controller will be replicated to the target cluster.
6. Modify `csm-replication/repctl/examples/<storage>_example_values.yaml` config with replication information:
   > **_NOTE:_**  `clusterID` should match names you gave to clusters in step 2
7. Create replication storage classes using config:
      ```shell

      ./repctl create sc --from-config ./examples/<storage>_example_values.yaml
      ```
8. Install CSI driver for your chosen storage on source and target cluster and provision replicated volumes
9. (optional) Create PVCs on target cluster from Replication Group:
      ```shell
      
      ./repctl create pvc --rg <rg-name> -t <target-namespace> --dry-run=false
      ```

> ℹ️ **NOTE:**: all `repctl` output is saved in a `repctl.log` file in the current working directory and can be attached to any installation troubleshooting requests.
