---
title: "Google Anthos announcements"
linkTitle: "Google Anthos announcements"
date: 2020-10-30
---
The partnership between Dell Technologies and Google to support Anthos as an on-prem/hybrid Kubernetes platform tightens and expands.

- [Anthos 1.5](#anthos-15)
  - [PowerMax v1.4](#powermax-v14)
  - [PowerStore v1.1](#powerstore-v11)
- [Anthos bare metal](#anthos-bare-metal)
  - [PowerMax](#powermax)
  - [PowerStore](#powerstore)
  - [asdf-bmctl](#asdf-bmctl)
- [Go further](#go-further)

# Anthos 1.5
First let us talk about Anthos 1.5 that runs on top of VMware hypervisor. Dell is a storage and platform partner since the version 1.1 and it continues !

Both drivers ([csi-powermax](https://github.com/dell/csi-powermax) and [csi-powerstore](https://github.com/dell/csi-powerstore) are qualified for iSCSI.

To ensure the iSCSI daemon is started, you can use the following `DaemonSet` to take care of it :
```
kubectl create -f https://raw.githubusercontent.com/coulof/ds-iscsi/master/ds-iscsi.yaml
```

## PowerMax v1.4
As discussed in [that post](https://storage-chaos.io/Quaterly-update-September-2020.html#across-portfolio) we provide a new installer script for every driver.

It never have been easier to install the CSI driver on Anthos. To do so, simply follow the steps of the [Product Guide](https://github.com/dell/csi-powermax/blob/master/CSI%20Driver%20for%20Dell%20EMC%20PowerMax%20Product%20Guide.pdf) and add `--skip-verify` for the install command line : 
```
./csi-install.sh --namespace powermax --values my-powermax-settings.yaml --skip-verify
```

If you come from an existing installation, there is nothing else to do.

## PowerStore v1.1
For the first time, it is my pleasure to announce [csi-powerstore](https://github.com/dell/csi-powerstore) qualifies for Anthos v1.5 for iSCSI protocol (NFS will come later).

PowerStore storage fits particularly well workloads that are on the Edge. Same here the installation on Anthos is the same as what is documented in the product guide with the addition  `--skip-verify` option: 
```
./csi-install.sh --namespace csi-powerstore --values ./my-powerstoresettings.yaml --skip-verify
```

# Anthos bare metal
Google recently [announced the Anthos for bare metal](https://cloud.google.com/blog/topics/hybrid-cloud/anthos-on-bare-metal-is-now-ga), which, as its name indicates, brings support for Anthos Kubernetes engine on bare-metal server. This is a great opportunity to leverage specialized hardware or get rid of any kind of constraint on the VM hypervisor.


## PowerMax
Thanks to the CSI driver can take full advantage of your Fiber Channel infrastructure and PowerMax end-to-end NVMe capability on Anthos bare metal. That type of architecture fits well with IO intensive workload and business critical application, often tight to transactional data.

Checkout the installation process in video:

{{< video src="/csm-docs/videos/anthos-bm-0.6-powermax.mp4" width="800" height=auto >}}

## PowerStore
The save level of service is given to PowerStore with a full support for Anthos bare metal.

Checkout the installation process in video:

{{< video  src="/csm-docs/videos/anthos-bm-0.6-powerstore.mp4"  width="800" height=auto >}}

## [asdf-bmctl](https://github.com/coulof/asdf-bmctl)
During the qualification process I had to juggle with at least 3 different versions of the Anthos bare metal installer.

Being sick of doing symlinks anytime I needed to change version, I wrote an [asdf](https://github.com/asdf-vm/asdf) plugin to list the available versions, install them, and attach an Anthos bare metal configuration to a specific version.

You can :
* install it with `asdf plugin-add bmctl git@eos2git.cec.lab.emc.com:coulof/asdf-bmctl.git`
* list the versions with `asdf list-all bmctl` 
* install them with `asdf install bmctl 1.6.0` 
* and then you can set your version locally `asdf local bmctl 1.6.0` 
* or globally `asdf global bmctl 1.6.0`.

# Go further
If you need a demo or have any question on Dell CSI drivers with Anthos reach out the [Dell container community website](https://www.dell.com/community/Containers/bd-p/Containers)

