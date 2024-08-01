---
title: Installation using repctl
linktitle: Installation using repctl
weight: 4
description: Installation of CSM for Replication using repctl
---

## Install Replication Walkthrough
> **_NOTE:_**  These steps should not be used when installing using Dell CSM Operator.

### Set up repctl tool
Before you begin, make sure you have the repctl tool available.

You can download a pre-built repctl binary from our [Releases](https://github.com/dell/csm-replication/releases) page.
```shell
wget https://github.com/dell/csm-replication/releases/download/v1.9.0/repctl-linux-amd64
mv repctl-linux-amd64 repctl
chmod +x repctl
```

Then clone the repository with:
```shell
git clone -b v1.9.0 https://github.com/dell/csm-replication.git
cd csm-replication
```

Alternately, if you want to build the binary yourself, you can follow these steps:
```shell
cd ./repctl
make build
```

### Installation steps
> **_NOTE:_**  The repctl commands only have to be run from one Kubernetes cluster. Repctl does the appropriate configuration on both clusters, when installing replication with it.

You can start using Container Storage Modules (CSM) for Replication with help from `repctl` using these simple steps:

1. Prepare admin Kubernetes clusters configs
2. Add admin configs as clusters to `repctl`:
      ```shell
      ./repctl cluster add -f "/root/.kube/config-1","/root/.kube/config-2" -n "cluster-1","cluster-2"
      ```
   > **_NOTE:_**  If using a single Kubernetes cluster in a stretched configuration there will be only one cluster.
3. Install replication controller and CRDs:
      ```shell
      ./repctl create -f ./deploy/replicationcrds.all.yaml
      ./repctl create -f ./deploy/controller.yaml
      ```
   > **_NOTE:_**  The controller will report that configmap is invalid. This is expected behavior.
   > The message should disappear once you inject the kubeconfigs (next step).
4. (Choose one)
    1. (More secure) Inject service accounts' configs into clusters:
          ```shell
          ./repctl cluster inject --use-sa
          ```
    2. (Less secure) Inject admin configs into clusters:
          ```shell
          ./repctl cluster inject
          ```
5. Modify `csm-replication/repctl/examples/<storage>_example_values.yaml` config with replication information:
   > **_NOTE:_**  `clusterID` should match names you gave to clusters in step 2
6. Create replication storage classes using config:
      ```shell

      ./repctl create sc --from-config ./examples/<storage>_example_values.yaml
      ```
7. Install CSI driver for your chosen storage in source cluster and provision replicated volumes
8. (optional) Create PVCs on target cluster from Replication Group:
      ```shell
      
      ./repctl create pvc --rg <rg-name> -t <target-namespace> --dry-run=false
      ```


> Note: all `repctl` output is saved in a `repctl.log` file in the current working directory and can be attached to any installation troubleshooting requests.
