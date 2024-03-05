---
title: "Cluster Topologies"
linkTitle: "Cluster Topologies"
weight: 3
Description: >
  Supported Cluster Topologies with CSM Replication
---

## Replication Cluster Topologies

Container Storage Modules (CSM) for Replication project supports the replication of volumes within a single Kubernetes cluster or between two different
Kubernetes clusters. The replication controller can support multiple clusters at once, but a single volume can be replicated to a maximum of two clusters.

Each cluster should be assigned the unique identifier `clusterId`. The rules for naming are as follows:
* must be 63 characters or fewer (cannot be empty)
* must begin and end with an alphanumeric character ([a-z, 0-9, A-Z])
* could contain dashes (-), underscores (_), dots (.), and alphanumerics between
* must be unique across clusters

### Single Cluster Replication

#### Cluster Configuration

When configuring replication within a single cluster, you need to create a ConfigMap with at least the `clusterId`
field configured to point to the current cluster:
```yaml
apiVersion: v1
data:
  config.yaml: |
    clusterId: cluster-A
    targets: []
kind: ConfigMap
metadata:
  name: dell-replication-controller-config
  namespace: dell-replication-controller
```
Note that the `targets` parameter is left empty since we don't require any target clusters to work within a single cluster.
This also means that you don't need to create any Secrets that contain connection information to such clusters, since in this use case, we
are limited to a single cluster.

You can find more info about configs and secrets for cluster communication in [configmaps-secrets](../deployment/configmap-secrets/).

#### Storage Class Configuration

To create volumes that would be replicated within a single cluster, you need to create a special StorageClass.
This StorageClass should contain the usual replication parameter `replication.storage.dell.com/remoteClusterID`, and it should
be set to `self` to indicate that we want to replicate the volume inside the current cluster.

Also, you would need to create another storage class in the same cluster that would serve as a `target` storage class. This means that all replicated volumes would be derived from it. Its `replication.storage.dell.com/remoteClusterID` parameter should be also set to `self`.

You can find out more about replication StorageClasses and replication specific parameters in [storageclasses](../deployment/storageclasses).

#### Replicated Resources

When creating PersistentVolumeClaims using StorageClass for a single cluster replication, replicated resources (PersistentVolumes,
ReplicationGroups) would be created in the same cluster with the `replicated-` prefix added to them. For example:
```shell
kubectl get pv 
```
```
NAME                           CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      STORAGECLASS                 AGE
csivol-06d51bfcc5              3Gi        RWO            Retain           Bound       powerstore-replication       23s
replicated-csivol-06d51bfcc5   3Gi        RWO            Retain           Available   powerstore-replication-tgt   23s
```
```shell
kubectl get rg
```
```
NAME                                                 AGE   STATE   LINK STATE     LAST LINKSTATE UPDATE
replicated-rg-240721b0-12fb-4151-8dd8-94794ae2493e   34s   Ready   SYNCHRONIZED   2021-08-03T11:23:18Z
rg-240721b0-12fb-4151-8dd8-94794ae2493e              34s   Ready   SYNCHRONIZED   2021-08-03T11:22:18Z
```

### Multiple Cluster Replication

#### Cluster Configuration

Similar to a single cluster scenario, you need to create ConfigMap, but this time you need to provide at least one target
cluster. You can provide as many as you like, but be mindful that a single volume can be replicated to only one of them.

For example:
```yaml
apiVersion: v1
data:
  config.yaml: |
    clusterId: cluster-A
    targets: 
      - clusterId: cluster-B
        address: 192.168.111.21
        secretRef: secretClusterB
kind: ConfigMap
metadata:
  name: dell-replication-controller-config
  namespace: dell-replication-controller
```
Note that target cluster information contains a field called `secretRef`. This field points to a secret available in the current cluster that contains connection information of `cluster-B` in the form of a kubeconfig file.

You can find more information about how to create such secrets in [configmaps-secrets](../deployment/configmap-secrets/#communication-between-clusters).

#### Storage Class Configuration

To create replicated volumes in the multi-cluster configuration you still need to have a special storage class.
Replication parameter `replication.storage.dell.com/remoteClusterID` should be set to the cluster-id of whatever cluster you
want to replicate your volumes.

For multi-cluster replication, we can choose one of the target cluster ids we specified in
ConfigMap. In our example replication parameter, the target cluster id should be equal to `cluster-B`.

You can find more information about other replication parameters available in storage classes [here](../deployment/storageclasses/#common-parameters).

#### Replicated Resources

When creating PersistentVolumeClaims using StorageClass for a multi-cluster replication, replicated resources would be
created in both `source` and `target` clusters under the same names. For example:


>[CLUSTER-A]
```shell
kubectl get pv
```
```
NAME                           CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      STORAGECLASS                 AGE
csivol-06d51bfcc5              3Gi        RWO            Retain           Bound       powerstore-replication       23s
```
```shell
kubectl get rg
```
```
NAME                                      AGE   STATE   LINK STATE     LAST LINKSTATE UPDATE
rg-240721b0-12fb-4151-8dd8-94794ae2493e   34s   Ready   SYNCHRONIZED   2021-08-03T11:22:18Z
```
>[CLUSTER-B]
```shell
kubectl get pv
```
```
NAME                           CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS          STORAGECLASS                 AGE
csivol-06d51bfcc5              3Gi        RWO            Retain           Available       powerstore-replication       18s
```
```shell
kubectl get rg
```
```
NAME                                      AGE   STATE   LINK STATE     LAST LINKSTATE UPDATE
rg-240721b0-12fb-4151-8dd8-94794ae2493e   30s   Ready   SYNCHRONIZED   2021-08-03T11:22:18Z
```
