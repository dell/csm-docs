---
title: Replication
linkTitle: 'Replication'
description: >
  Installing Replication via Container Storage Modules Operator
---

{{% pageinfo color="primary" %}} {{< message text="1" >}} {{% /pageinfo %}}

The Container Storage Modules Operator installs the Replication module for
supported Dell CSI Drivers, deploying the Replication sidecar and Controller
Manage.

## Prerequisites

To configure Replication prior to installation via Container Storage Modules
Operator, you need:

- a source cluster, which is the main cluster
- a target cluster, which will serve as the disaster recovery cluster

  > **_NOTE:_** If using a single Kubernetes cluster in a stretched
  > configuration, there will be only one cluster. The source cluster is also
  > the target cluster.

- _(Optional)_ If Container Storage Modules Replication is being deployed using
  two clusters in an environment where the DNS is not configured, and the
  cluster API endpoints are FQDNs, it is necessary to add the `<FQDN>:<IP>`
  mapping in the /etc/hosts file in order to resolve queries to the remote API
  server. This change will need to be made to the /etc/hosts file on:

  - The bastion node(s) (or wherever `repctl` is used).
  - Either the Container Storage Modules Operator Deployment or
    ClusterServiceVersion custom resource if using an Operator Lifecycle Manager
    (such as with an OperatorHub install).
  - Both dell-replication-controller-manager deployments covered in
    [Configuration Steps](../replication/#configuration-steps) below.

  Update the ClusterServiceVersion before continuing. Execute the command below,
  replacing the fields for the remote cluster's FQDN and IP.

  ```shell
     kubectl patch clusterserviceversions.operators.coreos.com -n <operator-namespace> dell-csm-operator-certified.v1.3.0 \
     --type=json -p='[{"op": "add", "path": "/spec/install/spec/deployments/0/spec/template/spec/hostAliases", "value": [{"ip":"<remote-IP>","hostnames":["<remote-FQDN>"]}]}]'
  ```

### Cloning the GitHub Repository and Building repctl

The [csm-replication](https://github.com/dell/csm-replication.git) GitHub
repository is cloned to your source cluster as part of the installation. On your
source cluster run the following to clone and build the repctl tool:

```shell
git clone -b {{< version-v1 key="Replication" >}} https://github.com/dell/csm-replication.git
cd csm-replication/repctl
make build
```

Alternately, you can download a pre-built repctl binary from our
[Releases](https://github.com/dell/csm-replication/releases) page.

```shell
wget https://github.com/dell/csm-replication/releases/download/{{< version-v1 key="Replication" >}}/repctl-linux-amd64
mv repctl-linux-amd64 repctl
chmod +x repctl
```

The rest of the instructions will assume that your current working directory is
the `csm-replication/repctl` directory.

## Configuration Steps

To configure Replication perform the following steps:

1. Collect the cluster admin configurations for each of the clusters. In the
   following example the source cluster, `cluster-1` uses configuration
   `/root/.kube/config-1` and the target cluster, `cluster-2` uses the
   configuration `/root/.config/config-2`. Use repctl to add the clusters:

   ```shell
   ./repctl cluster add -f "/root/.kube/config-1","/root/.kube/config-2" -n "cluster-1","cluster-2"
   ```

   > **_NOTE:_** If using a single Kubernetes cluster in a stretched
   > configuration there will be only one cluster. Adding this cluster to repctl
   > and performing the service account configuration injection in step 3 are
   > still mandatory.

2. Inject the service account's configuration into the clusters.

   ```shell
   ./repctl cluster inject
   ```

   > **_NOTE:_** To inject the service account's configuration for each cluster
   > individually, use the following command:

   ```shell
   ./repctl cluster inject --custom-configs $HOME/.repctl/clusters/<config-name>
   ```

   **_Example:_**

   ```shell
    ./repctl cluster inject --custom-configs "/root/.repctl/clusters/config-1"
   ```

3. Customize the `examples/<storage>_example_values.yaml` sample config. Set the
   values for sourceClusterID and targetClusterID to the same names used in
   step 1. For a stretched cluster set both fields to `self`.

4. Create the replication storage classes using the modified configuration from
   step 3:

   ```shell
   ./repctl create sc --from-config ./examples/<storage>_example_values.yaml
   ```

5. On both source and target clusters, configure any driver-specific
   [prerequisites](../../../csmoperator) for deploying the driver via Dell CSM
   Operator.

6. Install the CSI driver for your chosen storage platform on the source cluster
   according to the instructions for
   [installing the drivers using CSM Operator](../../../csmoperator).
   Ensure that replication is set to `enabled` in the custom resource YAML used
   to install the driver, under the `components` field.

   > **_NOTE:_** As of CSM release 1.14, all Custom Resource Definitions that
   > are required for Replication functionality are installed by the CSM
   > Operator automatically when a Replication-enabled driver is installed.

7. Repeat the installation of the CSI driver for your chosen storage platform on
   the target cluster. Again, ensure that replication is set to `enabled` in the
   custom resource YAML used for installation, under the `components` field.
   _This is not necessary in stretched-cluster configurations that do not have a
   separate target cluster._

8. _(Optional)_ If CSM Replication is deployed using two clusters in an
   environment where the DNS is not configured, it is necessary to update the
   dell-replication-controller-manager Kubernetes deployment to map the API
   endpoint FQDN to an IP address by adding the `hostAliases` field and
   associated FQDN:IP mappings.

   To update the dell-replication-controller-manager deployment, execute the
   command below, replacing the fields for the remote cluster's FQDN and IP.
   Make sure to update the deployment on both the primary and disaster recovery
   clusters.

   ```shell
   kubectl patch deployment -n dell-replication-controller dell-replication-controller-manager \
   -p '{"spec":{"template":{"spec":{"hostAliases":[{"hostnames":["<remote-FQDN>"],"ip":"<remote-IP>"}]}}}}'
   ```
