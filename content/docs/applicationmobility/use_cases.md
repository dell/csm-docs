---
title: "Use Cases"
linkTitle: "Use Cases"
weight: 3
Description: >
  Use Cases
---

After Application Mobility is installed, the [dellctl CLI](../support/cli) can be used to register clusters and manage backups and restores of applications. These examples also provide references for using the Application Mobility Custom Resource Definitions (CRDs) to define Custom Resources (CRs) as an alternative to using the `dellctl` CLI.

## Backup and Restore an Application
This example details the steps when an application in namespace `demo1` is being backed up and then later restored to either the same cluster or another cluster. In this sample, both Application Mobility and Velero are installed in the `application-mobility` namespace.

1. If Velero is not installed in the default `velero` namespace and `dellctl` is being used, set this environment variable to the namespace where it is installed:
    ```bash
    export VELERO_NAMESPACE=application-mobility 
    ```
1. On the source cluster, create a Backup by providing a name and the included namespace where the application is installed. The application and its data will be available in the object store bucket and can be restored at a later time.
    
    Using dellctl:
    ```bash

    dellctl backup create backup1 --include-namespaces demo1 --namespace application-mobility
    ```
    Using Backup Custom Resource:
    ```yaml
    apiVersion: mobility.storage.dell.com/v1alpha1
    kind: Backup
    metadata:
      name: backup1
      namespace: application-mobility
    spec:
      includedNamespaces: [demo1]
      datamover: Restic
      clones: []
    ```
1. Monitor the backup status until it is marked as Completed.

    Using dellctl:
    ```bash
    dellctl backup get --namespace application-mobility
    ```

    Using kubectl:
    ```bash

    kubectl describe backups.mobility.storage.dell.com/backup1 -n application-mobility
    ```

1. If the Storage Class name on the target cluster is different than the Storage Class name on the source cluster where the backup was created, a mapping between source and target Storage Class names must be defined. See [Changing PV/PVC Storage Classes](#changing-pvpvc-storage-classes).
1. The application and its data can be restored on either the same cluster or another cluster by referring to the backup name and providing an optional mapping of the original namespace to the target namespace.

    Using dellctl:
    ```bash
    dellctl restore create restore1 --from-backup backup1 \
        --namespace-mappings "demo1:restorens1" --namespace application-mobility
    ```

    Using Restore Custom Resource:
    ```yaml
    apiVersion: mobility.storage.dell.com/v1alpha1
    kind: Restore
    metadata:
      name: restore1
      namespace: application-mobility
    spec:
      backupName: backup1
      namespaceMapping:
        "demo1" : "restorens1"
    ```
1. Monitor the restore status until it is marked as Completed.

    Using dellctl:
    ```bash
    dellctl restore get --namespace application-mobility
    ```

    Using kubectl:
    ```bash

    kubectl describe restores.mobility.storage.dell.com/restore1 -n application-mobility
    ```


## Clone an Application
This example details the steps when an application in namespace `demo1` is cloned from a source cluster to a target cluster in a single operation. In this sample, both Application Mobility and Velero are installed in the `application-mobility` namespace.

1. If Velero is not installed in the default `velero` namespace and `dellctl` is being used, set this environment variable to the namespace where it is installed:
    ```bash
    export VELERO_NAMESPACE=application-mobility 
    ```
1. Register the target cluster if using `dellctl`
    ```bash

    dellctl cluster add -n targetcluster -u <kube-system-namespace-uuid> -f ~/kubeconfigs/target-cluster-kubeconfig
    ```
1. If the Storage Class name on the target cluster is different than the Storage Class name on the source cluster where the backup was created, a mapping between source and target Storage Class names must be defined. See [Changing PV/PVC Storage Classes](#changing-pvpvc-storage-classes).
1. Create a Backup by providing a name, the included namespace where the application is installed, and the target cluster and namespace mapping where the application will be restored.
    
    Using dellctl:
    ```bash

    dellctl backup create backup1 --include-namespaces demo1 --clones "targetcluster/demo1:restore-ns2" \
        --namespace application-mobility
    ```

    Using Backup Custom Resource:
    ```yaml
    apiVersion: mobility.storage.dell.com/v1alpha1
    kind: Backup
    metadata:
      name: backup1
      namespace: application-mobility
    spec:
      includedNamespaces: [demo1]
      datamover: Restic
      clones:
        - namespaceMapping:
            "demo1": "restore-ns2" 
          restoreOnceAvailable: true
          targetCluster: targetcluster
    ```

1. Monitor the restore status on the target cluster until it is marked as Completed.

    Using dellctl:
    ```bash
    dellctl restore get --namespace application-mobility
    ```

    Using kubectl:
    ```bash

    kubectl get restores.mobility.storage.dell.com -n application-mobility
    kubectl describe restores.mobility.storage.dell.com/<restore-name> -n application-mobility
    ```

## Changing PV/PVC Storage Classes
Create a ConfigMap on the target cluster in the same namespace where Application Mobility is installed. The data field must contain a mapping of source Storage Class name to target Storage Class name. See Velero's documentation for [Changing PV/PVC Storage Classes](https://velero.io/docs/v1.9/restore-reference/#changing-pvpvc-storage-classes) for additional details.
```yaml 
apiVersion: v1
kind: ConfigMap
metadata:
    name: change-storage-class-config
    namespace: <application-mobility-namespace>
    labels:
        velero.io/plugin-config: ""
        velero.io/change-storage-class: RestoreItemAction
data:
    <source-storage-class-name>: <target-storage-class-name>
```
