---
title: "PowerStore"
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerStore CSI driver
---

You can upgrade the CSI Driver for Dell EMC PowerStore using Helm or Dell CSI Operator.

## Update Driver from v1.3 to v1.4 using Helm

**Steps**
1. Run `git clone https://github.com/dell/csi-powerstore.git` to clone the git repository and get the v1.4 driver.
2. Edit `helm/config.yaml` file and configure connection information for your PowerStore arrays changing the following parameters:
    - *endpoint*: defines the full URL path to the PowerStore API.
    - *username*, *password*: defines credentials for connecting to array.
    - *insecure*: defines if we should use insecure connection or not.
    - *default*: defines if we should treat the current array as a default.
    - *block-protocol*: defines what SCSI transport protocol we must use (FC, ISCSI, None, or auto).
    - *nas-name*: defines what NAS should be used for NFS volumes.
    
    Add more blocks similar to above for each PowerStore array if necessary. 
3. (optional) create new storage classes using ones from `helm/samples/storageclass` folder as an example and apply them to the Kubernetes cluster by running `kubectl create -f <path_to_storageclass_file>`
    >Storage classes created by v1.3 driver will not be deleted, v1.4 driver will use default array to manage volumes provisioned with old storage classes. Thus, if you still have volumes provisioned by v1.3 in your cluster then be sure to include the same array you have used for the v1.3 driver and make it default in the `config.yaml` file.
4. Create the secret by running ```sed "s/CONFIG_YAML/`cat helm/config.yaml | base64 -w0`/g" helm/secret.yaml | kubectl apply -f -```
5. Update values file as needed.
6. Run the `csi-install` script with the option _\-\-upgrade_ by running: `cd ../dell-csi-helm-installer && ./csi-install.sh --namespace csi-powerstore --values ./my-powerstore-settings.yaml --upgrade`.

## Upgrade using Dell CSI Operator:

1. Clone the [Dell CSI Operator repository](https://github.com/dell/dell-csi-operator).

2. Execute `bash scripts/install.sh --upgrade`
This command will install the latest version of the operator.
>Note: Dell CSI Operator version 1.4.0 and higher would install to the 'dell-csi-operator' namespace by default.

3. To upgrade the drive, refer [here](./../../../installation/operator/#update-csi-drivers).
