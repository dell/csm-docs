---
title: ConfigMap & Secrets
linktitle: ConfigMap & Secrets
weight: 3
description: >
  Configuration
---

##  Communication between clusters
Container Storage Modules (CSM) for Replication Controller requires access to remote clusters for replicating various objects. There are two ways to set up this communication:
1. Using Normal Kubernetes users
2. Using ServiceAccount token

You need to create secrets (using either of the two methods) in each cluster involved in replication and provide their references in `ConfigMap` objects which are used to configure
the respective CSM Replication Controllers.

>Important: Direct network visibility between clusters required for CSM-Replication to work.
> Cluster-1's API URL has to be pingable from cluster-2 pods and vice versa. If private networks are used and/or DNS is not set up properly - you may need to modify `/etc/hosts` file from within controller's pod.
> This can be achieved by using helm installation method. Refer to this [link.](../installation/#using-the-installation-script)


>Note: If you are using a single stretched cluster, then you can skip all the following steps

### Inject configuration using repctl
This is the simplest way to configure CSM Replication Controller.
`repctl` simplifies the complex configuration process greatly by enabling creation of secrets and updating their references in multiple clusters.

#### Recommended method
Use `repctl` to create secrets using service account tokens and update ConfigMaps in multiple clusters in one command.
Run the following command:
```shell
repctl cluster inject --use-sa
```
This will create secrets using the token for the `dell-replication-controller-sa` ServiceAccount and update the ConfigMap in all the clusters
which have been configured for `repctl`.

#### Inject KubeConfigs from repctl configuration
`repctl` is usually configured to communicate with multiple Kubernetes clusters and is provided with a set of KubeConfig files for each cluster.
You can use `repctl` to inject secrets created using these files in each of the configured cluster.
Run the following command:
```shell
repctl cluster inject
```

>Note: For a detailed walkthrough of the simplified installation process using `repctl`, please refer this [link](../install-repctl)

### Understanding the Config file
If you are setting up replication between two clusters (ex: Cluster A & Cluster B), a suitable configuration file (deploy/config.yaml) should look like this:

#### Cluster A
```yaml
clusterId: cluster-A # This cluster's Identifier
targets: 
  - clusterId: cluster-B # Identifier for the remote cluster B
    address: 192.168.111.21 # Address of the remote cluster
    secretRef: secretClusterB # Name of the secret required for communication with Cluster B
```
#### Cluster B
```yaml
clusterId: cluster-B # This cluster's Identifier
targets: 
  - clusterId: cluster-A # Identifier for the remote cluster A
    address: 192.168.111.20 # Address of the remote cluster
    secretRef: secretClusterA # Name of the secret required for communication with Cluster A
```

### Manual configuration

#### Generating KubeConfig
We provide a helper script which can help create KubeConfig files for a normal user as well as a Service Account.
* Using a Certificate Signing Request for a user
```shell
    cd scripts
    ./gen_kubeconfig.sh -u <CN user> -c <CSR> -k <key>  # where "CN user" is the name of the user & key is the private key of the user
```
* Create kubeconfig file for a Service Account
```shell
       cd scripts
       ./gen_kubeconfig.sh -s <sa-name> -n <namespace>
```
Once you have created the KubeConfig file, you can use it to create the secret.

#### Secrets using normal Kubernetes users
You can create a normal Kubernetes [user](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#users-in-kubernetes) for your remote
Kubernetes cluster and use it for inter cluster communication.  The process of creating `users` is outside the scope of this document.
Once you have the user created, you can provide it the RBAC privileges required by the controller.

##### Example
Continuing from our earlier example with Cluster A & Cluster B:
1. Create a user in _Cluster B_ & generate a kubeconfig file for it using the helper script
2. Create a ClusterRole in _Cluster B_ using the following command:
    ```shell
    kubectl apply -f deploy/role.yaml
    ```
3. Create a ClusterRoleBinding in _Cluster B_ for the user:
   ```shell
   kubectl create clusterrolebinding <name> --clusterrole=dell-replication-manager-role --user=<user-name>
   ```
4. Create a secret in _Cluster A_ using the kubeconfig file for this user:
   ```shell
   kubectl create secret generic <secret-name> --from-file=data=<kubeconfig_file_user> --namespace dell-replication-controller
   ```

#### Secrets using ServiceAccount tokens
You can use service account tokens to establish communication between various clusters.
We recommend using the token for the `dell-replication-controller-sa` service account in the `dell-replication-controller` namespace after the installation as it
already has all the required RBAC privileges.

##### Example
Use the following command to first create a KubeConfig file using the helper script in _Cluster B_:
```shell
./gen_kubeconfig.sh -s dell-replication-controller-sa -n dell-replication-controller
```
Once the KubeConfig file has been generated successfully, use the following command in _Cluster A_ to to create the secret:
```shell
kubectl create secret generic <secret-name> --from-file=data=<kubeconfig_file_user> --namespace dell-replication-controller
```
