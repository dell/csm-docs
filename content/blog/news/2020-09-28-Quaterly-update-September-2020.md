
---
title:  CSI drivers Volume expansion and beta Snapshot support update !
linkTitle: "CSI drivers Volume expansion and beta Snapshot support update"
date: 2020-09-28
---

The quaterly update for Dell CSI Driver is there !
- [New features](#new-features)
  - [Across portfolio](#across-portfolio)
  - [Volume Cloning](#volume-cloning)
  - [Volume Expansion online and offline](#volume-expansion-online-and-offline)
  - [Raw Block Support](#raw-block-support)
  - [RedHat CoreOS](#redhat-coreos)
  - [Docker EE 3.1](#docker-ee-31)
  - [Dell CSI Operator](#dell-csi-operator)
  - [CSI Driver for PowerMax](#csi-driver-for-powermax)
  - [CSI Driver for PowerStore](#csi-driver-for-powerstore)
  - [CSI Driver for PowerFlex](#csi-driver-for-powerflex)
- [One more thing ; Ansible for PowerStore v1.1](#one-more-thing--ansible-for-powerstore-v11)
- [Useful links](#useful-links)

# New features
## Across portfolio
This release gives for every driver the :
* Support of OpenShift 4.4 as well as Kubernetes 1.17, 1.18, 1.19
* Support for Kubernetes [Volume Snapshot Beta API](https://kubernetes.io/blog/2019/12/09/kubernetes-1-17-feature-cis-volume-snapshot-beta/)<i class="fas fa-dharmachakra"></i>
* New installer !

With Volume Snapshot's promotion to beta, one significant change is the CSI external-snapshotter sidecar has been split into two controllers, a common snapshot controller and a CSI external-snapshotter sidecar.

The new install script available under `dell-csi-helm-installer/csi-install.sh` will :
* By default, install of the external-snaphotter for CSI driver.
* Optionally, install the beta snapshot CRD when the option `--snapshot-crd` is set during the initial installation.

Most recent Kubernetes distributions like OpenShift or GKE come with the common snapshotter controller installed.

For Kubernetes vanilla, you have to deploy the common snapshotter manually. The instructions are available [here](https://github.com/kubernetes-csi/external-snapshotter/tree/release-2.1#usage)<i class="fab fa-github"></i>.

> /!\ The drivers have validated the external-snapshotter **version 1.2** and not the bleeding-edge version

## Volume Cloning
Volume cloning is now available for every driver, but PowerFlex (that feature is on the roadmap).

It never has been easier [to spin a new environement from the production](({% post_url {% post_url note/dell/2020-05-29-gitlab-powermax %})).

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
 name: clone-pvc-0
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: powermax
  dataSource:
    kind: PersistentVolumeClaim
    name: pvc-0
```

In the PVC definition you must make sure the source of the clone has the same `storageClassName`, `request.storage` size, `namespace` and `accessModes`.

## Volume Expansion online and offline
That feature was already present in [csi-powerscale](https://github.com/dell/csi-powerscale)<i class="fab fa-github"></i> ; it is now available for every Dell CSI driver.

To expand a volume, you just have to edit the PV size ; blazing fast example below:
![Image](assets/img/volume_expansion.gif){: .size-small}

## Raw Block Support
The [Raw Block](https://kubernetes-csi.github.io/docs/raw-block.html)<i class="fas fa-dharmachakra"></i> Support was already available with [csi-powermax](https://github.com/dell/csi-powermax/)<i class="fab fa-github"></i> ; it is now available in [csi-vxflexos](https://github.com/dell/csi-vxflexos)<i class="fab fa-github"></i> and [csi-powerstore](https://github.com/dell/csi-powerstore)<i class="fab fa-github"></i>.

That feature can be used if your application needs a filesystem different from xfs or ext4 or applications that can take advantage of a block device (like HDFS, Oracle ASM, etc.).

## RedHat CoreOS
But for PowerFlex, every driver has been qualified with OpenShift 4.3 and 4.4 on CoreOS type of nodes !

## Docker EE 3.1
Docker Enterprise Edition (now part of [Mirantis](https://www.mirantis.com/software/docker/docker-enterprise/)) makes his appearance to the list of officially supported by [support.dell.com](https://support.dell.com/) Kubernetes distributions.

The first drivers to qualify Docker EE are : [csi-powerscale](https://github.com/dell/csi-powerscale)<i class="fab fa-github"></i>, [csi-unity](https://github.com/dell/csi-unity) and [csi-vxflexos](https://github.com/dell/csi-vxflexos)<i class="fab fa-github"></i>.

## Dell CSI Operator
The [dell-csi-operator](https://github.com/dell/dell-csi-operator) adds support for the installation of the [csi-powerstore](https://github.com/dell/csi-powerstore)<i class="fab fa-github"></i> and the multi-array support for [csi-unity](https://github.com/dell/csi-unity).

> At the moment of the publication, the new operator is under the RedHat certification process to get official support.
> The version 1.1 is not  available yet in [OperatorHub.io](https://operatorhub.io/operator/dell-csi-operator)<i class="fab fa-redhat"></i> or OpenShift UI. Stay tuned for the update.

## CSI Driver for PowerMax
Upon installation, we can enable the CSI PowerMax Reverse Proxy service. The CSI PowerMax Reverse Proxy is a reverse proxy that forwards CSI driver requests to Unisphere servers.

It can be used to improve reliability by having redundant Unisphere, or scale-up the number of requests to be sent to Unisphere and the managed PowerMax arrays.

## CSI Driver for PowerStore
The [csi-powerstore](https://github.com/dell/csi-powerstore)<i class="fab fa-github"></i> adds NFS to the list of supported protocols. It has all the features that iSCSI and Fiber Channel storage classes have.

If you need concurrent filesystem access (i.e. `ReadWriteMany` access mode) you can use the NFS protocol.

## CSI Driver for PowerFlex
The [csi-vxflexos](https://github.com/dell/csi-vxflexos)<i class="fab fa-github"></i> is the first driver to bring topology support. It avoids the driver tried to mount a volume when the SDC is not installed (I see you non-CoreOS support ;-))

# One more thing ; Ansible for PowerStore v1.1
The biggest "hot new feature" is the support for file operation in [ansible-powerstore](https://github.com/dell/ansible-powerstore)<i class="fab fa-github"></i>; this means we have access to new modules for: 
* File system Snapshot 
* File system
* NAS server
* NFS export
* SMB Share
* Quota

And of course all the modules conform to Ansible Idempotency requirement.

# Useful links

For more details you can check :
* The product guides and release notes in the repositories for [csi-powermax](https://github.com/dell/csi-powermax/)<i class="fab fa-github"></i>, [csi-powerscale](https://github.com/dell/csi-powerscale)<i class="fab fa-github"></i>, [csi-powerstore](https://github.com/dell/csi-powerstore)<i class="fab fa-github"></i>, [csi-unity](https://github.com/dell/csi-unity), [csi-vxflexos](https://github.com/dell/csi-vxflexos)<i class="fab fa-github"></i> and [ansible-powerstore](https://github.com/dell/ansible-powerstore/blob/master/dellemc_ansible/docs/Ansible%20Modules%20for%20Dell%20EMC%20PowerStore%20Version%201.1%20Product%20Guide.pdf)<i class="fab fa-github"></i>. 
* The FAQs on on [Dell container community website](https://www.dell.com/community/Containers/)<i class="fas fa-laptop-code"></i>:
  * [FAQ for CSI Driver for PowerMax](https://www.dell.com/community/Containers/FAQ-CSI-Driver-for-PowerMax/m-p/7377675/highlight/true#M38)<i class="fas fa-laptop-code"></i>
  * [FAQ for CSI Driver for PowerScale](https://www.dell.com/community/Containers/FAQ-CSI-Driver-for-Isilon-v1-1/m-p/7430920/highlight/true#M50)<i class="fas fa-laptop-code"></i>
  * [FAQ for CSI Driver for PowerStore](https://www.dell.com/community/Containers/FAQ-CSI-for-PowerStore/m-p/7561551/highlight/true#M146)<i class="fas fa-laptop-code"></i>
  * [FAQ for CSI Driver for PowerFlex](https://www.dell.com/community/Containers/FAQ-CSI-Driver-for-VxFlexOS/m-p/7285716/highlight/true#M5)<i class="fas fa-laptop-code"></i>
  * [FAQ for CSI Driver for Unity](https://www.dell.com/community/Containers/FAQ-CSI-Driver-for-Unity/m-p/7422312/highlight/true#M45)<i class="fas fa-laptop-code"></i>
