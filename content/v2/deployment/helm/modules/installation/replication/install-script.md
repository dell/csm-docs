---
title: Installation using script
linktitle: Installation using script
weight: 4
description: Installation of CSM for Replication using script (Helm chart)
---

## Install Replication Walkthrough
> **_NOTE:_**  These steps should be repeated on all Kubernetes clusters where you want to configure replication.

```shell
git clone -b v1.9.0 https://github.com/dell/csm-replication.git
cd csm-replication
kubectl create ns dell-replication-controller
# Download and modify the default values.yaml file if you wish to customize your deployment in any way
wget -O myvalues.yaml https://raw.githubusercontent.com/dell/helm-charts/csm-replication-1.9.0/charts/csm-replication/values.yaml
bash scripts/install.sh --values ./myvalues.yaml
```
>Note: Current installation method allows you to specify custom `<FQDN>:<IP>` entries to be appended to controller's `/etc/hosts` file. It can be useful if controller is being deployed in private environment where DNS is not set up properly, but kubernetes clusters use FQDN as API server's address.
> The feature can be enabled by modifying `values.yaml`.
>``` hostAliases:
> - ip: "10.10.10.10"
>   hostnames:
>     - "foo.bar"
> - ip: "10.10.10.11"
>   hostnames:
>     - "foo.baz"

This script will do the following:
1. Install `DellCSIReplicationGroup` CRD in your cluster
2. Install `dell-replication-controller`

After the installation ConfigMap will consist of only the `logLevel` field, to add the rest configuration to the cluster do the following:
* Update the configuration in `deploy/config.yaml` after going through the guide [here](../configmap-secrets)
* Run the following commands to update and complete the installation
```shell
    cd csm-replication
    kubectl create configmap dell-replication-controller-config --namespace dell-replication-controller --from-file deploy/config.yaml -o yaml --dry-run | kubectl apply -f -
```
