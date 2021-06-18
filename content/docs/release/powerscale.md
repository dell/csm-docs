---
title: PowerScale
description: Release notes for PowerScale CSI driver
---

## Release Notes - CSI Driver for PowerScale v1.6.0

### New Features/Changes
- Added support for Kubernetes 1.21.
- Added support for Red Hat Enterprise Linux (RHEL) 8.4.
- Added support for CSI Spec 1.3.
- Added support for Volume Limit.
- Added support for node selector functionality to helm template.
- Added support for secret in YAML format.
- Added support for Dynamic log level changes.
- Added support to make dnsPolicy of node component configurable via Helm

### Fixed Issues

There are no fixed issues in this release.

### Known Issues
   | Issue | Resolution or workaround, if known |
   | ----- | ---------------------------------- |
   | Creating snapshot fails if the parameter IsiPath in volume snapshot class and related storage class is not the same. The driver uses the incorrect IsiPath parameter and tries to locate the source volume due to the inconsistency. | Ensure IsiPath in VolumeSnapshotClass yaml and related storageClass yaml are the same. |
   | While deleting a volume, if there are files or folders created on the volume that are owned by different users. If the Isilon credentials used are for a nonprivileged Isilon user, the delete volume action fails. It is due to the limitation in Linux permission control. | To perform the delete volume action, the user account must be assigned a role that has the privilege ISI_PRIV_IFS_RESTORE. The user account must have the following set of privileges to ensure that all the CSI Isilon driver capabilities work properly:<br> * ISI_PRIV_LOGIN_PAPI<br> * ISI_PRIV_NFS<br> * ISI_PRIV_QUOTA<br> * ISI_PRIV_SNAPSHOT<br> * ISI_PRIV_IFS_RESTORE<br> * ISI_PRIV_NS_IFS_ACCESS<br> In some cases, ISI_PRIV_BACKUP is also required, for example, when files owned by other users have mode bits set to 700. |
   | If the hostname is mapped to loopback IP in /etc/hosts file, and pods are created using 1.3.0.1 release, after upgrade to 1.4.0 there is a possibility of "localhost" as a stale entry in export | We recommend you not to map a hostname to loopback IP in /etc/hosts file |
   | If the length of the nodeID exceeds 128 characters, the driver fails to update the CSINode object and installation fails. This is due to a limitation set by CSI spec which doesn't allow nodeID to be greater than 128 characters. | The CSI PowerScale driver uses the hostname for building the nodeID which is set in the CSINode resource object, hence we recommend not having very long hostnames in order to avoid this issue. This current limitation of 128 characters is likely to be relaxed in future Kubernetes versions as per this issue in the community: https://github.com/kubernetes-sigs/gcp-compute-persistent-disk-csi-driver/issues/581 |
   | CSI Driver installation fails with the error message "error getting FQDN". | Map IP address of host with its FQDN in /etc/hosts file. |


