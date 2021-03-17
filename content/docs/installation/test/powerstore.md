---
title: Test PowerStore CSI Driver
linktitle: PowerStore
description: Tests to validate PowerStore CSI Driver installation
---

In the repository, a simple test manifest exists that creates three different PersistentVolumeClaims using default ext4, xfs and nfs
storage classes and automatically mounts them to the pod.
>It assumes that you've created the same basic three storage classes from `helm/samples/storageclass` folder without changing their names. If you've created different storage classes please edit `tests/simple/simple.yaml` and change `PersistentVolumeClaim` definitions to point to correct storage classes.

**Steps**

1. To run this test, run the kubectl command from the root directory of the repository:
   ```bash
   kubectl create -f ./tests/simple/
   ```
You can find all the created resources in `testpowerstore` namespace.

2. Check if the pod is created and Ready and Running by running:
   ```bash
   kubectl get all -n testpowerstore
   ```
   If it's in CrashLoopback state then the driver installation wasn't successful. Check the logs of the node and the controller.

3. Go into the created container and verify that everything is mounted correctly.

4. After verifying, you can uninstall the testing PVCs and StatefulSet.
   ```bash
   kubectl delete -f ./tests/simple/
   ```
