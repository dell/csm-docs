---
title: "Dell CSI Operator Installation Process"
linkTitle: "Using Operator"
weight: 4
description: >
  Installation of Dell EMC CSI drivers using Dell CSI Operator
---

The Dell CSI Operator is a Kubernetes Operator, which can be used to install and manage the CSI Drivers provided by Dell EMC for various storage platforms. This operator is available as a community operator for upstream Kubernetes and can be deployed using OperatorHub.io. It is also available as a certified operator for OpenShift clusters and can be deployed using OpenShift Container Platform. Both these methods of installation use OLM (Operator Lifecycle Manager).  The operator can also be deployed manually.


## Installation
Dell CSI Operator has been tested and qualified with 
- Upstream Kubernetes or OpenShift (see [supported versions](../../dell-csi-driver/))

#### Before you begin
If you have installed an old version of the `dell-csi-operator` which was available with the name _CSI Operator_, please refer this [section](#replacing-csi-operator-with-dell-csi-operator) before continuing.

#### Full list of CSI Drivers and versions supported by the Dell CSI Operator
| CSI Driver         | Version | ConfigVersion | Kubernetes Version       | OpenShift Version |
| ------------------ | ------  | --------------| ------------------------ | ----------------- |
| CSI PowerMax       | 1.5     | v4            | 1.17, 1.18, 1.19         | 4.4, 4.5, 4.6     |
| CSI PowerMax       | 1.6     | v5            | 1.18, 1.19, 1.20         | 4.6, 4.7          |
| CSI PowerFlex      | 1.3     | v3            | 1.17, 1.18, 1.19         | 4.4, 4.5, 4.6     |
| CSI PowerFlex      | 1.4     | v4            | 1.18, 1.19, 1.20         | 4.6, 4.7          |
| CSI PowerScale     | 1.4     | v4            | 1.17, 1.18, 1.19         | 4.4, 4.5, 4.6     |
| CSI PowerScale     | 1.5     | v5            | 1.18, 1.19, 1.20         | 4.6, 4.7          |
| CSI Unity          | 1.4     | v3            | 1.17, 1.18, 1.19         | 4.4, 4.5, 4.6     |
| CSI Unity          | 1.5     | v4            | 1.18, 1.19, 1.20         | 4.6, 4.7          |
| CSI PowerStore     | 1.2     | v2            | 1.17, 1.18, 1.19         | 4.5, 4.6          |
| CSI PowerStore     | 1.3     | v3            | 1.18, 1.19, 1.20         | 4.6, 4.7          |

</br>

**Dell CSI Operator can be installed via OLM (Operator Lifecycle Manager) and manual installation.**

### Installation Using Operator Lifecycle Manager
`dell-csi-operator` can be installed using Operator Lifecycle Manager (OLM) on upstream Kubernetes clusters & Red Hat OpenShift Clusters.  
The installation process involves creation of a `Subscription` object either via the _OperatorHub_ UI or using `kubectl/oc`. While creating the `Subscription` you can set the Approval strategy for the `InstallPlan` for the Operator to - 
* _Automatic_ - If you want the Operator to be automatically installed or upgraded (once an upgrade becomes available)
* _Manual_ - If you want a Cluster Administrator to manually review and approve the `InstallPlan` for installation/upgrades

#### Pre-Requisite for installation with OLM
Please run the following commands for creating the required `ConfigMap` before installing the `dell-csi-operator` using OLM.  
```
$ git clone github.com/dell/dell-csi-operator
$ cd dell-csi-operator
$ tar -czf config.tar.gz driverconfig/
# Replace operator-namespace in the below command with the actual namespace where the operator will be deployed by OLM
$ kubectl create configmap dell-csi-operator-config --from-file config.tar.gz -n <operator-namespace>
```
##### Upstream Kubernetes
- For installing via OperatorHub.io on Kubernetes, go to the [OperatorHub page](../../partners/operator/).
##### Red Hat OpenShift Clusters
- For installing via OpenShift with the Operator, go to the [OpenShift page](../../partners/redhat/).

### Manual Installation

#### Steps

1. Clone the [Dell CSI Operator repository](https://github.com/dell/dell-csi-operator)
2. Run 'bash scripts/install.sh' to install the operator
{{< imgproc non-olm-1.jpg Resize "2500x" >}}{{< /imgproc >}}
3. Run the command 'oc get pods' to validate the install completed, should be able to see the operator related pod on default namespace
{{< imgproc non-olm-2.jpg Resize "3500x800" >}}{{< /imgproc >}}

## Custom Resource Definitions
As part of the Dell CSI Operator installation, a CRD representing each driver installation is also installed.  
List of CRDs which are installed in API Group `storage.dell.com`
* csipowermax
* csiunity
* csivxflexos
* csiisilon
* csipowerstore
* csipowermaxrevproxy

For installation of the supported drivers, a `CustomResource` has to be created in your cluster.

## Pre-Requisites for installation of the CSI Drivers

### Pre-requisites for upstream Kubernetes Clusters
On upstream Kubernetes clusters, make sure to install
* VolumeSnapshot CRDs
  * On clusters running v1.20, make sure to install v1 VolumeSnapshot CRDs
  * On clusters running v1.18 & v1.19, make sure to install v1beta1 VolumeSnapshot CRDs
* External Volume Snapshot Controller with correct version

### Pre-requisites for Red Hat OpenShift Clusters
#### iSCSI
If you are installing a CSI driver which is going to use iSCSI as the transport protocol, please follow the following instructions.  
In Red Hat OpenShift clusters, you can create a `MachineConfig` object using the console or `oc` to ensure that the iSCSI daemon starts on all the Red Hat CoreOS nodes. Here is an example of a `MachineConfig` object:

```
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: 99-iscsid
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 2.2.0  
    systemd:
      units:
      - name: "iscsid.service"
        enabled: true
```
Once the `MachineConfig` object has been deployed, CoreOS will ensure that `iscsid.service` starts automatically.

Alternatively, you can check the status of iSCSI service by entering the following command on each worker node in the cluster:

`sudo systemctl status iscsid`

The service should be up and running (i.e. should be in active state).

If the `iscsid.service` is not running, then perform the following steps on each worker node in the cluster
1. `Login` to worker nodes and check if the file /etc/iscsi/initiatorname.iscsi has been created properly
2. If the file doesn't exist or it doesn't contain a valid ISCSI IQN, then make sure it exists with valid entries
3. Ensure that iscsid service is running - Enable ```sudo systemctl enable iscsid``` & restart ```sudo systemctl restart iscsid``` iscsid if necessary. 
   Note: If your worker nodes are running on Red Hat CoreOS , you can refer the URL https://coreos.com/os/docs/latest/iscsi.html#enable-automatic-iscsi-login-at-boot for additional information.

#### MultiPath
If you are installing a CSI Driver which requires the installation of the Linux native Multipath software - _multipathd_, please follow the below instructions

To enable multipathd on RedHat CoreOS nodes you need to prepare a working configuration encoded in base64.

`echo 'defaults {
user_friendly_names yes
find_multipaths yes
}
blacklist {
}' | base64 -w0`

Use the base64 encoded string output in the following `MachineConfig` yaml file (under source section)
```
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  name: workers-multipath-conf-default
  labels:
    machineconfiguration.openshift.io/role: worker
spec:
  config:
    ignition:
      version: 2.2.0
    storage:
      files:
      - contents:
          source: data:text/plain;charset=utf-8;base64,ZGVmYXVsdHMgewp1c2VyX2ZyaWVuZGx5X25hbWVzIHllcwpmaW5kX211bHRpcGF0aHMgeWVzCn0KCmJsYWNrbGlzdCB7Cn0K
          verification: {}
        filesystem: root
        mode: 400
        path: /etc/multipath.conf
```
After deploying this`MachineConfig` object, CoreOS will start multipath service automatically.  
Alternatively you can check the status of multipath service by entering the following command in each worker nodes.  
`sudo multipath -ll`

If the above command is not successful, ensure that the /etc/multipath.conf file is present and configured properly. Once the file has been configured correctly, enable the multipath service by running the following command: 
`sudo /sbin/mpathconf –-enable --with_multipathd y`

Finally , you have to restart the service by providing the command
`sudo systemctl restart multipathd`

For additional information refer official documentation of multipath configuration.

## Replacing CSI Operator with Dell CSI Operator
`Dell CSI Operator` was previously available, with the name `CSI Operator`, for both manual and OLM installation.  
`CSI Operator` has been discontinued and has been renamed to `Dell CSI Operator`.  This is just a name change and as a result,
the Kubernetes resources created as part of the Operator deployment will use the name `dell-csi-operator` instead of `csi-operator`.

Before proceeding with the installation of the new `Dell CSI Operator`, any existing `CSI Operator` installation has to be completely 
removed from the cluster.

Note - This **doesn't** impact any of the CSI Drivers which have been installed in the cluster

If the old `CSI Operator` was installed manually, then run the following command from the root of the repository which was used 
originally for installation

    bash scripts/undeploy.sh

If you don't have the original repository available, then run the following commands

    git clone https://github.com/dell/dell-csi-operator.git
    cd dell-csi-operator
    git checkout csi-operator-v1.0.0
    bash scripts/undeploy.sh

Note - Once you have removed the old `CSI Operator`, then for installing the new `Dell CSI Operator`, you will need to pull/checkout the latest code

If you had installed old CSI Operator using OLM, then please follow un-installation instructions provided by OperatorHub. This will mostly involve:

    * Deleting the CSI Operator Subscription  
    * Deleting the CSI Operator CSV  


## Install CSI Driver

To install CSI drivers using Dell CSI Operator, please refer [here](./installdriver)

**NOTE:** For more information on pre-requisites and parameters, please refer to the sub-pages below for each driver.



