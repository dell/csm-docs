---
title: Replication
linkTitle: "Replication"
description: >
  Installing Replication via Dell CSM Operator
---

The CSM Replication module for supported Dell CSI Drivers can be installed via the Dell CSM Operator. Dell CSM Operator will deploy the CSM Replication sidecar and the CSM Replication Controller Manager.

## Prerequisites
To configure Replication prior to installation via CSM Operator, you need:

- a source cluster which is the main cluster
- a target cluster which will serve as the disaster recovery cluster
> **_NOTE:_**  If using a single Kubernetes cluster in a stretched configuration, there will be only one cluster. The source cluster is also the target cluster.

### Cloning the GitHub Repository and Building repctl
The [csm-replication](https://github.com/dell/csm-replication.git) GitHub repository is cloned to your source cluster as part of the installation. On your source cluster run the following to clone and build the repctl tool:

```bash
git clone -b v1.6.0 https://github.com/dell/csm-replication.git
cd csm-replication/repctl
make build
```

Alternately, you can download a pre-built repctl binary from our [Releases](https://github.com/dell/csm-replication/releases) page.
```shell
wget https://github.com/dell/csm-replication/releases/download/v1.6.0/repctl-linux-amd64
mv repctl-linux-amd64 repctl
chmod +x repctl
```

The rest of the instructions will assume that your current working directory is the csm-replication/repctl directory.
## Configuration Steps
To configure Replication perform the following steps:

1. On your main cluster collect the cluster admin configurations for each of the clusters. In the following example the source cluster, `cluster-1` uses configuration `/root/.kube/config-1` and the target cluster, `cluster-2` uses the configuration `/root/.config/config-2`. Use repctl to add the clusters:
    ```shell
      ./repctl cluster add -f "/root/.kube/config-1","/root/.kube/config-2" -n "cluster-1","cluster-2"
    ```
  > **_NOTE:_**  If using a single Kubernetes cluster in a stretched configuration there will be only one cluster.
2. Install the replication controller CRDs:
    ```shell
    ./repctl create -f ../deploy/replicationcrds.all.yaml
    ```
3. Inject the service account's configuration into the clusters.
    ```shell
    ./repctl cluster inject
    ```
4. Customize the `examples/<storage>_example_values.yaml` sample config. Set the values for sourceClusterID and targetClusterID to the same names used in step 1. For a stretched cluster set both fields to `self`:

5. Create the replication storage classes using the modified configuration from step 4:
    ```shell
    ./repctl create sc --from-config ./examples/<storage>_example_values.yaml
    ```
6. On the target cluster, configure the [prerequisites](../../../csmoperator/drivers/#pre-requisites-for-installation-of-the-csi-drivers) for deploying the driver via Dell CSM Operator.

7. Install the CSI driver for your chosen storage platform on the source cluster according to the instructions for [installing the drivers using CSM Operator](../../../csmoperator/drivers/#installing-csi-driver-via-operator).
