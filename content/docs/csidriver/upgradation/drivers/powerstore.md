---
title: "PowerStore"
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerStore CSI driver
---

You can upgrade the CSI Driver for Dell EMC PowerStore using Helm or Dell CSI Operator.

## Update Driver from v2.0 to v2.1 using Helm

Note: While upgrading the driver via helm, controllerCount variable in myvalues.yaml can be at most one less than the number of worker nodes.

**Steps**
1. Run `git clone -b v2.1.0 https://github.com/dell/csi-powerstore.git` to clone the git repository and get the driver.
2. Edit `helm/config.yaml` file and configure connection information for your PowerStore arrays changing the following parameters:
    - *endpoint*: defines the full URL path to the PowerStore API.
    - *globalID*: specifies what storage cluster the driver should use  
    - *username*, *password*: defines credentials for connecting to array.
    - *skipCertificateValidation*: defines if we should use insecure connection or not.
    - *isDefault*: defines if we should treat the current array as a default.
    - *blockProtocol*: defines what SCSI transport protocol we should use (FC, ISCSI, None, or auto).
    - *nasName*: defines what NAS should be used for NFS volumes.
    
    Add more blocks similar to above for each PowerStore array if necessary. 
3. (optional) create new storage classes using ones from `samples/storageclass` folder as an example and apply them to the Kubernetes cluster by running `kubectl create -f <path_to_storageclass_file>`
    >Storage classes created by v1.4/v2.0 driver will not be deleted, v2.1 driver will use default array to manage volumes provisioned with old storage classes. Thus, if you still have volumes provisioned by v1.4/v2.0 in your cluster then be sure to include the same array you have used for the v1.4/v2.0 driver and make it default in the `config.yaml` file.
4. Create the secret by running ```kubectl create secret generic powerstore-config -n csi-powerstore --from-file=config=secret.yaml```
5. Copy the default values.yaml file `cp ./helm/csi-powerstore/values.yaml ./dell-csi-helm-installer/my-powerstore-settings.yaml` and update parameters as per the requirement.
6. Run the `csi-install` script with the option _\-\-upgrade_ by running: `./dell-csi-helm-installer/csi-install.sh --namespace csi-powerstore --values ./my-powerstore-settings.yaml --upgrade`.

## Upgrade using Dell CSI Operator:

Note: While upgrading the driver via operator, replicas count in sample CR yaml can be at most one less than the number of worker nodes.

1. Please upgrade the Dell CSI Operator by following [here](./../operator).
2. Once the operator is upgraded, to upgrade the driver, refer [here](./../../../installation/operator/#update-csi-drivers).

