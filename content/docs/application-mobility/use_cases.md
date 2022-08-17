---
title: "Use Cases"
linkTitle: "Use Cases"
weight: 3
Description: >
  Application Mobility for Dell Container Storage Modules (CSM)
---

{{% pageinfo color="primary" %}}
Application Mobility is currently in tech-preview and is not supported in production environments
{{% /pageinfo %}}

# Use Cases

After Application Mobility is installed, the [dellctl CLI](../cli/) can be used to register clusters and manage backups and restores of applications.

## Backup and Restore an Application
The following example details the steps when an application in namespace `demo1` is being backed up and then later restored to either the same cluster or another cluster. In this sample, both Application Mobility and Velero were installed in the `application-mobility` namespace.

1. If Velero is not installed in the default `velero` namespace, set the following environment variable to the namespace where it is running:
    ```
    export VELERO_NAMESPACE=application-mobility 
    ```
1. On the source cluster, create a Backup by providing a name and the included namespace where the application is running. The application and its data will be available in the object store bucket and can be restored at a later time.
    ```
    dellctl backup create backup1 --include-namespaces demo1 --namespace application-mobility
    ```
1. Monitor the backup status until it is marked as Completed.
    ```
    dellctl backup get --namespace application-mobility
    ```
1. The application and its data can be restored on either the same cluster or another cluster by referring to the backup name and providing an optional mapping of the original namespace to the target namespace.
    ```
    dellctl restore create restore1 --from-backup backup1 \
        --namespace-mappings "demo1:restorens1" --namespace application-mobility
    ```
1. Monitor the restore status until it is marked as Completed.
    ```
    dellctl restore get --namespace application-mobility
    ```

## Clone an Application
The following example details the steps when an application in namespace `demo1` is cloned from a source cluster to a target cluster in a single operation. In this sample, both Application Mobility and Velero were installed in the `application-mobility` namespace.

1. If Velero is not installed in the default `velero` namespace, set the following environment variable to the namespace where it is running:
    ```
    export VELERO_NAMESPACE=application-mobility 
    ```

1. Register both the source and target clusters
    ```
    dellctl cluster add -n cluster1 -f ~/kubeconfigs/cluster1-kubeconfig
    dellctl cluster add -n cluster2 -f ~/kubeconfigs/cluster2-kubeconfig
    ```
1. On the source cluster, create a Backup by providing a name and the included namespace where the application is running. The application and its data will be available in the object store bucket and can be restored at a later time.
    ```
    dellctl backup create backup1 --include-namespaces demo1 --cluster-id cluster1 \
        --clones "cluster2/demo1:restore-ns2" --namespace application-mobility
    ```
1. Monitor the backup status until it is marked as Completed.
    ```
    dellctl backup get --namespace application-mobility
    ```

## Using dellctl

Check the [CLI documentation]