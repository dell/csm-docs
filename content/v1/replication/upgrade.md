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

> Note: While upgrading the module via helm, the `replicas` variable in `myvalues.yaml` can be at most one less than the number of worker nodes.
## Updating CSM Replication sidecar

To upgrade the CSM Replication sidecar that is installed along with the driver, the following steps are required. 

>Note: These steps refer to the values file and `csi-install.sh` script that was used during the initial installation of the Dell CSI driver.
**Steps**

1. Update the `controller.replication.image` value in the values files to reference the new CSM Replication sidecar image.
2. Run the csi-install script with the option `--upgrade` by running: `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace <your-namespace> --values ./myvalues.yaml --upgrade`
3. Run the same command on the second Kubernetes cluster if you use multi-cluster replication topology


## Updating CSM Replication controller

### Upgrading with Helm

This option will only work if you have previously installed replication with helm chart available since version 1.1. If you used simple manifest or `repctl` please use [upgrading with repctl](#upgrading-with-repctl)

**Steps**
1. Update the `image` value in the values files to reference the new CSM Replication sidecar image or use a new version of the csm-replication helm chart
2. Run the install script with the option `--upgrade` by running: `cd ./scripts && ./install.sh --values ./myvalues.yaml --upgrade`
3. Run the same command on the second Kubernetes cluster if you use multi-cluster replication topology

> Note: Upgrade won't override currently existing ConfigMap, even if you change templated values in myvalues.yaml file. If you want to change the logLevel - edit ConfigMap from within the cluster using `kubectl edit cm -n dell-replication-controller dell-replication-controller-config`


### Upgrading with repctl

> Note: These steps assume that you already have `repctl` configured to use correct clusters, if you don't know how to do that please refer to [installing with repctl](../deployment/install-repctl) 

**Steps**
1. Find a new version of deployment manifest that can be found in `deploy/controller.yaml`, with newer `image` pointing to the version of CSM Replication controller you want to upgrade to 
2. Apply said manifest using the usual `repctl create` command like so 
`./repctl create -f ./deploy/controller.yaml`. The output should have this line `Successfully updated existing deployment: dell-replication-controller-manager` 
3. Check if everything is OK by querying your Kubernetes clusters using `kubectl` like this `kubectl get pods -n dell-replication-controller`, your pods should READY and RUNNING
