---
title: Test Unity XT CSI Driver
linktitle: Unity XT
description: Tests to validate Unity XT CSI Driver installation
---

## Test deploying a simple Pod and PVC with Unity XT storage
In the repository, a simple test manifest exists that creates three different PersistentVolumeClaims using default NFS and iSCSI and FC storage classes and automatically mounts them to the pod.

**Steps**

1. To run this test, run the kubectl command from the root directory of the repository:
   ```bash
   kubectl create -f ./test/sample.yaml
   ```
You can find all the created resources in `unity` namespace.

2. Check if the pod is created and Ready and Running by running:
   ```bash
   kubectl get all -n unity
   ```
   If it is in CrashLoopback state then the driver installation was not successful. Check the logs of the node and the controller.

3. Go into the created container and verify that everything is mounted correctly.

4. After verifying, you can uninstall the testing PVCs and StatefulSet.
   ```bash
   kubectl delete -f ./test/sample.yaml
   ```

## Support for SLES 15

The CSI Driver for Dell Unity XT requires these of packages installed on all worker nodes that run on SLES 15.

- open-iscsi **open-iscsi is required in order to make use of iSCSI protocol for provisioning**
- nfs-utils **nfs-utils is required in order to make use of NFS protocol for provisioning**
- multipath-tools **multipath-tools is required in order to make use of FC and iSCSI protocols for provisioning**

After installing open-iscsi, ensure "iscsi" and "iscsid" services have been started and /etc/isci/initiatorname.iscsi is created and has the host initiator id. The pre-requisites are mandatory for provisioning with the iSCSI protocol to work.
