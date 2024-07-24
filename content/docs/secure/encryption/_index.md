---
title: "Encryption"
linkTitle: "Encryption"
weight: 1
Description: >
  CSI Volumes Encryption
---

**NOTE:**  Encryption is not supported for CSM 1.10.x release. Please refer to the [release notes](./release/) for more details.

Encryption provides the capability to encrypt user data residing on volumes created by Dell CSI Drivers.



> **NOTE:** This tech-preview release is not intended for use in production environment.

> **NOTE:** Encryption requires a time-based license to create new encrypted volumes. Request a [trial license](../../support/license) prior to deployment.
> 
> After the license expiration, existing encrypted volume can still be unlocked and used, but no new encrypted volumes can be created.

The volume data is encrypted on the Kubernetes worker host running the application workload, transparently for the application. 

Under the hood, *gocryptfs*, an open-source FUSE based encryptor, is used to encrypt both files content and the names of files and directories.

Files content is encrypted using AES-256-GCM and names are encrypted using AES-256-EME.

*gocryptfs* needs a password to initialize and to unlock the encrypted file system. 
Encryption generates 32 random bytes for the password and stores them in Hashicorp Vault.

For detailed information on the cryptography behind gocryptfs, see [gocryptfs Cryptography](https://nuetzlich.net/gocryptfs/forward_mode_crypto).

When a CSI Driver is installed with the Encryption feature enabled, two provisioners are registered in the cluster:

**Provisioner for unencrypted volumes**

This provisioner belongs to the storage driver and does not depend on the Encryption feature. Use a storage class with this provisioner to create regular unencrypted volumes. 

**Provisioner for encrypted volumes**

This provisioner belongs to Encryption and registers with the name [`encryption.pluginName`](../../deployment/helm/modules/installation/encryption/#helm-chart-values) when Encryption is enabled. Use a storage class with this provisioner to create encrypted volumes.

## Capabilities


| Feature | PowerScale |
| ------- | ---------- |
| Dynamic provisionings of new volumes | Yes |
| Static provisioning of new volumes | Yes |
| Volume snapshot creation | Yes |
| Volume creation from snapshot | Yes |
| Volume cloning | Yes |
| Volume expansion | Yes |
| Encrypted volume unlocking in a different cluster | Yes |
| User file and directory names encryption | Yes |
{.table-sm .table-bordered .table-striped}

## Limitations

- Only file system volumes are supported.
- Existing volumes with data cannot be encrypted.<br/>
  **Workaround:** create a new encrypted volume of the same size and copy/move the data from the original *unencrypted* volume to the new *encrypted* volume.
- Encryption cannot be disabled in-place.<br/>
  **Workaround:** create a new unencrypted volume of the same size and copy/move the data from the original *encrypted* volume to the new *unencrypted* volume.
- Encrypted volume content can be seen in clear text through root access to the worker node or by obtaining shell access into the Encryption driver container.
- When deployed with PowerScale CSI driver, `controllerCount` has to be set to 1.
- No other CSM component can be enabled simultaneously with Encryption.
- The only supported authentication method for Vault is AppRole.
- Encryption secrets, config maps and encryption related values cannot be updated while the CSI driver is running: 
the CSI driver must be restarted to pick up the change.

## Supported Operating Systems/Container Orchestrator Platforms


| COP/OS | Supported Versions |
|-|-|
| Kubernetes | 1.26, 1.27, 1.28 |
| Red Hat OpenShift  | 4.13, 4.14 |
{.table-sm .table-bordered .table-striped}

## Supported Storage Platforms


|               | PowerScale |
| ------------- | ---------- |
| Storage Array | OneFS 9.3, 9.4, 9.5.0.5, 9.5.0.6 |
{.table-sm .table-bordered .table-striped}

## Supported CSI Drivers

Encryption supports these CSI drivers and versions:

| Storage Array | CSI Driver | Supported Versions |
| ------------- | ---------- | ------------------ |
| CSI Driver for Dell PowerScale | [csi-powerscale](https://github.com/dell/csi-powerscale) | v2.8 + |
{.table-sm .table-bordered .table-striped}

### PowerScale

When enabling Encryption for PowerScale CSI Driver, make sure these requirements are met:
- PowerScale CSI Driver uses root credentials for the storage array where encrypted volumes will be placed
- OneFS NFS export configuration does not have root user mapping enabled
- All other CSM features like Authorization, Replication, Resiliency are disabled
- Health Monitor feature is disabled
- CSI driver `controllerCount` is set to 1

## Hashicorp Vault Support

**Supported Vault version is 1.9.3 and newer.**

Vault server (or cluster) is typically deployed in a dedicated Kubernetes cluster, but for the purpose of Encryption, it can be located anywhere.
Even the simplest standalone single instance server with in-memory storage will suffice for testing.

> **NOTE:** Properly deployed and configured Vault is crucial for security of the volumes encrypted with Encryption. 
Please refer to the Hashicorp Vault documentation regarding recommended deployment options.

> **CAUTION:** Compromised Vault server or Vault storage back-end may lead to unauthorized access to the volumes encrypted with Encryption.

> **CAUTION:** Destroyed Vault storage back-end or the encryption key stored in it, will make it impossible to unlock the volume encrypted with Encryption. 
Access to the data will be lost for ever.

Refer to [Vault Configuration section](../../deployment/helm/modules/installation/encryption/vault) for minimal configuration steps required to support Encryption and other configuration considerations.

## Key Rotation (rekey)
This preview of Encryption includes the ability to change the KEK (Key Encryption Key) of an encrypted volume, an operation commonly known as Shallow Rekey, or 
Shallow Key Rotation. The KEK is the 256-bit key that encrypts the Data Encryption Key which encrypts the data on the volume. 

## Kubernetes Worker Hosts Requirements

- Each Kubernetes worker host should have SSH server running.
- SSH server should have SSH public key authentication enabled for user *root*. 
- SSH server should remain running all the time whenever an application with an encrypted volume is running on the host.
> **NOTE:** Stopping the SSH server on the worker host makes any encrypted volume attached to this host [inaccessible](troubleshooting#ssh-stopped).
- Each Kubernetes worker host should have commands `fusermount` and `mount.fuse`. They are pre-installed in most Linux distros.
To install package *fuse* in Ubuntu/Debian run command similar to `apt install fuse`.
To install package *fuse* in SUSE run command similar to `zypper install fuse`.
 

