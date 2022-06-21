---
title: "Troubleshooting"
linkTitle: "Troubleshooting"
weight: 3
Description: >
  Troubleshooting guide
---

## Frequently Asked Questions

  - [Why does the installation fail due to an invalid cipherKey value?](#why-does-the-installation-fail-due-to-an-invalid-cipherkey-value)
  - [Why does the cluster-init pod show the error "cluster has already been initialized"?](#why-does-the-cluster-init-pod-show-the-error-cluster-has-already-been-initialized)
  - [Why does the precheck fail when creating an application?](#why-does-the-precheck-fail-when-creating-an-application)
  - [How can I view detailed logs for the CSM Installer?](#how-can-i-view-detailed-logs-for-the-csm-installer)
  - [After deleting an application, why can't I re-create the same application?](#after-deleting-an-application-why-cant-i-re-create-the-same-application)
  - [How can I upgrade CSM if I've used the CSM Installer to deploy CSM 1.0?](#how-can-i-upgrade-csm-if-ive-used-the-csm-installer-to-deploy-csm-10)

### Why does the installation fail due to an invalid cipherKey value?
The `cipherKey` value used during deployment of the CSM Installer must be exactly 32 characters in length and contained within quotes.

### Why does the cluster-init pod show the error "cluster has already been initialized"?
During the initial start-up of the CSM Installer, the database will be initialized by the cluster-init job. If the CSM Installer is uninstalled and then re-installed on the same cluster, this error may be shown due to the Persistent Volume for the database already containing an initialized database. The CSM Installer will function as normal and the cluster-init job can be ignored.

If a clean installation of the CSM Installer is required, the `dbVolumeDirectory` (default location `/var/lib/cockroachdb`) must be deleted from the worker node which is hosting the Persistent Volume. After this directory is deleted, the CSM Installer can be re-installed. 

Caution: Deleting the `dbVolumeDirectory` location will remove any data persisted by the CSM Installer including clusters, storage systems, and installed applications.

### Why does the precheck fail when creating an application?
Each CSI Driver and CSM Module has required software or CRDs that must be installed before the application can be deployed in the cluster. These prechecks are verified when the `csm create application` command is executed. If the error message "create application failed" is displayed, [review the CSM Installer logs](#how-can-i-view-detailed-logs-for-the-csm-installer) to view details about the failed prechecks.

If the precheck fails due to required software (e.g. iSCSI, NFS, SDC) not installed on the cluster nodes, follow these steps to address the issue:
1. Delete the cluster from the CSM Installer using the `csm delete cluster` command.
2. Update the nodes in the cluster by installing required software.
3. Add the cluster to the CSM Installer using the `csm add cluster` command.

### How can I view detailed logs for the CSM Installer?
Detailed logs of the CSM Installer can be displayed using the following command:
```
kubectl logs -f -n <namespace> deploy/dell-csm-installer
```

### After deleting an application, why can't I re-create the same application?
After deleting an application using the `csm delete application` command, the namespace and other non-application resources including Secrets are not deleted from the cluster. This is to prevent removing any resources that may not have been created by the CSM Installer. The namespace must be manually deleted before attempting to re-create the same application using the CSM Installer.

### How can I upgrade CSM if I've used the CSM Installer to deploy CSM 1.0?
The CSM Installer currently does not support upgrade.  If you used the CSM Installer to deploy CSM 1.0 you will need to perform the following steps to upgrade:
1. Using the CSM installer, [delete](../csmcli#delete-applicationtask) any driver/module applications that were installed (ex: `csm delete application --name <created-application-name>`). 
2. Uninstall the CSM Installer (ex: helm delete -n <namespace> <csm-installer-app-name> )
3. Follow the deployment instructions [here](../../) to redeploy the CSI driver and modules.