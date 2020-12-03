---
title: PowerScale
description: Release notes for PowerScale CSI driver
---

## Release Notes - CSI Driver for PowerScale v1.4.0

### New Features/Changes
- Added support for OpenShift 4.6 with RHEL and CoreOS worker nodes
- Added support for Red Hat Enterprise Linux (RHEL) 7.9
- Added support for Ubuntu 20.04
- Added support for Controller high availability (multiple-controllers)
- Added Topology support
- Added support for CSI Ephemeral Inline Volumes
- Added support for mount options
- Enhancements to volume creation from data source
- Enhanced support for Docker EE 3.1

### Fixed Issues
   | Problem summary | Found in version | Resolved in version |
   | --------------- | ---------------- | ------------------- |
   | POD creation fails in OpenShift and Kubernetes environments, if hostname is not an FQDN | v1.3.0 | v1.4.0 |
   | When creating volume from a snapshot or volume from volume, the owner of the new files or folders that are copied from the source snapshot is the Isilon user who is specified in secret.yaml. So the original owner of a file or folder might not be the owner of the newly created file or folder. | | v1.4.0 |

### Known Issues
   | Issue | Resolution or workaround, if known |
   | ----- | ---------------------------------- |
   | Creating snapshot fails if the parameter IsiPath in volume snapshot class and related storage class are not the same. The driver uses the incorrect IsiPath parameter and tries to locate the source volume due to the inconsistency. | Ensure IsiPath in VolumeSnapshotClass yaml and related storageClass yaml are the same. |
   | While deleting a volume, if there are files or folders created on the volume that are owned by different users. If the Isilon credentials used are for a nonprivileged Isilon user, the delete volume action fails. It is due to the limitation in Linux permission control. | To perform the delete volume action, the user account must be assigned a role that has the privilege ISI_PRIV_IFS_RESTORE. The user account must have the following set of privileges to ensure that all the CSI Isilon driver capabilities work properly:<br> * ISI_PRIV_LOGIN_PAPI<br> * ISI_PRIV_NFS<br> * ISI_PRIV_QUOTA<br> * ISI_PRIV_SNAPSHOT<br> * ISI_PRIV_IFS_RESTORE<br> * ISI_PRIV_NS_IFS_ACCESS<br> * ISI_PRIV_LOGIN_SSH<br> In some cases, ISI_PRIV_BACKUP is also required, for example, when files owned by other users have mode bits set to 700. |
