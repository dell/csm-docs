---
title: "Prerequisite"
linkTitle: "Prerequisite"
weight: 1
Description: >

---  

Before you install CSI Driver for Unity XT, verify the requirements that are mentioned in this topic are installed and configured.

### Requirements

* Install Kubernetes or OpenShift (see [supported versions](../../../../../concepts/csidriver/#features-and-capabilities))
* To use FC protocol, the host must be zoned with Unity XT array and Multipath needs to be configured
* To use iSCSI protocol, iSCSI initiator utils packages needs to be installed and Multipath needs to be configured
* To use NFS protocol, NFS utility packages needs to be installed
* Mount propagation is enabled on container runtime that is being used

### Fibre Channel requirements

Unity XT supports Fibre Channel communication. If you use the Fibre Channel protocol, ensure that the
following requirement is met before you install the CSI Driver for Unity XT:
- Zoning of the Host Bus Adapters (HBAs) to the Fibre Channel port must be done.

### Set up the iSCSI Initiator

The CSI Driver for Unity XT supports iSCSI connectivity.

If you use the iSCSI protocol, set up the iSCSI initiators as follows:
- Ensure that each Kubernetes worker node has network connectivity to an iSCSI port on the Unity XT array, allowing access via IP interfaces. Manually create the necessary IP routes.
- Ensure that the necessary iSCSI initiator utilities are installed on each Kubernetes worker node. This typically includes the _iscsi-initiator-utils_ package for RHEL or _open-iscsi_ package for Ubuntu.
- Enable and start the _iscsid_ service on each Kubernetes worker node. This service is responsible for managing the iSCSI initiator. You can enable the service by running the following command on all worker nodes: `systemctl enable --now iscsid`
- Ensure that the unique initiator name is set in _/etc/iscsi/initiatorname.iscsi_.

**Note**: The Dell CSI driver supports both iSCSI and FC protocols simultaneously.If both iSCSI IQNs and 
FC WWNs are present, then the Host registrations on the Unity system will include all initiators. 
    To limit the initiators, ensure only the desired initiators are configured on the worker nodes.

For more information about configuring iSCSI, see [Dell Host Connectivity guide](https://www.delltechnologies.com/asset/en-us/products/storage/technical-support/docu5128.pdf).

### Linux multipathing requirements

Unity XT supports Linux multipathing. Configure Linux multipathing before installing the CSI Driver for Unity XT.

Set up Linux multipathing as follows:
- Ensure that all nodes have the _Device Mapper Multipathing_ package installed.
> You can install it by running `yum install device-mapper-multipath` on RHEL or `apt install multipath-tools` on Ubuntu. This package should create a multipath configuration file located in `/etc/multipath.conf`.
- Enable multipathing using the `mpathconf --enable --with_multipathd y` command.
- Enable `user_friendly_names` and `find_multipaths` in the `multipath.conf` file.
- Ensure that the multipath command for `multipath.conf` is available on all Kubernetes nodes.

As a best practice, use the following options to help the operating system and the mulitpathing software detect path changes efficiently:

```text
path_grouping_policy multibus
path_checker tur
features "1 queue_if_no_path"
path_selector "round-robin 0"
no_path_retry 10
```
