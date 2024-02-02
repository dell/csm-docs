---
title: Upgrade
linktitle: Upgrade
weight: 9
description: >
   Upgrade guide
---

CSM Replication module consists of two components: 
* CSM Replication sidecar (installed along with the driver) 
* CSM Replication controller

Those two components should be upgraded separately. When upgrading them ensure that you use the same versions for both sidecar and
controller, because different versions could be incompatible with each other. 

> _**Note**_: While upgrading the module via helm, the `replicas` variable in `myvalues.yaml` can be at most one less than the number of worker nodes.
## Updating CSM Replication sidecar

To upgrade the CSM Replication sidecar that is installed along with the driver, the following steps are required. 

> _**Note**_: These steps refer to the values file and `csi-install.sh` script that was used during the initial installation of the Dell CSI driver.

**Steps**

1. Update the `controller.replication.image` value in the values files to reference the new CSM Replication sidecar image.
2. Run the csi-install script with the option `--upgrade` by running: <br>
      ```bash

      cd ../dell-csi-helm-installer && ./csi-install.sh --namespace <your-namespace> --values ./myvalues.yaml --upgrade
      ```
3. Run the same command on the second Kubernetes cluster if you use multi-cluster replication topology

>For more information on upgrading the CSI driver, please visit the [CSI driver upgrade page](../../csidriver/upgradation).

### PowerScale

On PowerScale systems, an additional step is needed when upgrading to CSM Replication v1.4.0 or later. Because the SyncIQ policy created on the target-side storage array is no longer used, it must be deleted for any existing `DellCSIReplicationGroup` objects after performing the upgrade to the CSM Replication sidecar and PowerScale CSI driver. These steps should be performed before the `DellCSIReplicationGroup` objects are used with the new version of the CSI driver. Until this step is performed, existing `DellCSIReplicationGroup` objects will display an UNKNOWN link state.

1. Log in to the target PowerScale array. 
2. Navigate to the `Data Protection > SyncIQ` page and select the `Policies` tab.
3. Delete disabled, target-side SyncIQ policies that are used for CSM Replication. Such policies will be distinguished by their names, of the format `<prefix>-<kubernetes namespace>-<IP of replication destination>-<RPO duration>`.

## Updating CSM Replication controller

Make sure the appropriate release branch is available on the machine performing the upgrade by running:

```bash
git clone -b v1.7.1 https://github.com/dell/csm-replication.git
```

### Upgrading with Helm

This option will only work if you have previously installed replication via Helm chart, available since version 1.1. If you used simple manifest or `repctl` please use [upgrading with repctl](#upgrading-with-repctl)

**Steps**
1. Update the `image` value in the values files to reference the new CSM Replication controller image or use a new version of the csm-replication Helm chart.
2. Run the install script with the option `--upgrade` by running:

    ```bash

    cd ./scripts && ./install.sh --values ./myvalues.yaml --upgrade
    ```

3. Run the same command on the second Kubernetes cluster if you use multi-cluster replication topology.

> _**Note**_: Upgrade won't override currently existing ConfigMap, even if you change templated values in myvalues.yaml file. If you want to change the logLevel - edit ConfigMap from within the cluster using 
      ```bash 
      kubectl edit cm -n dell-replication-controller dell-replication-controller-config  
      ```


### Upgrading with repctl

> _**Note**_: These steps assume that you already have `repctl` configured to use correct clusters, if you don't know how to do that please refer to [installing with repctl](../deployment/install-repctl) 

**Steps**
1. Find a new version of deployment manifest that can be found in `deploy/controller.yaml`, with newer `image` pointing to the version of CSM Replication controller you want to upgrade to.
2. Apply said manifest using the usual `repctl create` command like so:

      ```bash
      ./repctl create -f ../deploy/controller.yaml
      ``` 

      The output should have this line `Successfully updated existing deployment: dell-replication-controller-manager`
3. Check if everything is OK by querying your Kubernetes clusters using `kubectl` using a `kubectl get`:

      ```bash
      kubectl get pods -n dell-replication-controller`
      ```
      Your pods should be `READY` and `RUNNING`.

### Replication CRD version update

CRD `dellcsireplicationgroups.replication.storage.dell.com` has been updated to version `v1` in CSM Replication v1.4.0. To facilitate the continued use of existing `DellCSIReplicationGroup` CR objects after upgrading to CSM Replication v1.4.0 or later, an `init container` will be deployed during upgrade. The `init container` updates the existing CRs with necessary steps for their continued use.

> _**Note**_: Do not update the CRD as part of upgrade. An `init container` included in the replication controller pod takes care of updating existing CRD and CR versions.

Starting from CSM Replication v1.6.0, the `init container` has been removed. Therefore, when upgrading from versions older than v1.4.0 to v1.6.0 or any later versions, it is mandatory to perform an intermediate upgrade to either v1.4.0 or v1.5.0 before proceeding with any further upgrades.
