---
title: "PowerStore"
tags:
 - upgrade
 - csi-driver
weight: 1
Description: Upgrade PowerStore CSI driver
---

You can upgrade the CSI Driver for Dell PowerStore using Helm.

## Update Driver from v2.8.0 to v2.9.0 using Helm

Note: While upgrading the driver via helm, controllerCount variable in myvalues.yaml can be at most one less than the number of worker nodes.

**Steps**
1. Run `git clone -b v2.9.0 https://github.com/dell/csi-powerstore.git` to clone the git repository and get the driver.
2. Edit `samples/secret/secret.yaml` file and configure connection information for your PowerStore arrays changing the following parameters:
    - *endpoint*: defines the full URL path to the PowerStore API.
    - *globalID*: specifies what storage cluster the driver should use  
    - *username*, *password*: defines credentials for connecting to array.
    - *skipCertificateValidation*: defines if we should use insecure connection or not.
    - *isDefault*: defines if we should treat the current array as a default.
    - *blockProtocol*: defines what transport protocol we should use (FC, ISCSI, NVMeTCP, None, or auto).
    - *nasName*: defines what NAS should be used for NFS volumes.
	- *nfsAcls*: (Optional) defines permissions - POSIX mode bits or NFSv4 ACLs, to be set on NFS target mount directory.
	             NFSv4 ACls are supported for NFSv4 shares on NFSv4 enabled NAS servers only. POSIX ACLs are not supported and only POSIX mode bits are supported for NFSv3 shares.
    
    Add more blocks similar to above for each PowerStore array if necessary. 
3. (optional) create new storage classes using ones from `samples/storageclass` folder as an example and apply them to the Kubernetes cluster by running 
    ```bash
    kubectl create -f <path_to_storageclass_file>
    ```
    
    >Storage classes created by v1.4/v2.0/v2.1/v2.2/v2.3/v2.4/v2.5/v2.6/v2.7 driver will not be deleted, v2.8 driver will use default array to manage volumes provisioned with old storage classes. Thus, if you still have volumes provisioned by v1.4/v2.0/v2.1/v2.2/v2.3/v2.4/v2.5/v2.6/v2.7 in your cluster then be sure to include the same array you have used for the v1.4/v2.0/v2.1/v2.2/v2.3/v2.4/v2.5/v2.6/v2.7 driver and make it default in the `secret.yaml` file.
4. Create the secret by running 
    ```bash
    
    kubectl create secret generic powerstore-config -n csi-powerstore --from-file=config=secret.yaml
    ```
5. Download the default values.yaml file `cd dell-csi-helm-installer && wget -O my-powerstore-settings.yaml https://github.com/dell/helm-charts/raw/csi-powerstore-2.9.0/charts/csi-powerstore/values.yaml` and update parameters as per the requirement.
6. Run the `csi-install` script with the option _\-\-upgrade_ by running: 
     ```bash

     ./csi-install.sh --namespace csi-powerstore --values ./my-powerstore-settings.yaml --upgrade
     ```


## Upgrade using Dell CSM Operator:
**Note:** Upgrading the Operator does not upgrade the CSI Driver.

1. Please upgrade the Dell CSM Operator by following [here](../../../../deployment/csmoperator/#to-upgrade-dell-csm-operator-perform-the-following-steps)
2. Once the operator is upgraded, to upgrade the driver, refer [here](../../../../deployment/csmoperator/#upgrade-driver-using-dell-csm-operator)
