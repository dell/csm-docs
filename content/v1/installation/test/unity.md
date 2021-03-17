---
title: Test Unity CSI Driver
linktitle: Unity
description: Tests to validate Unity CSI Driver installation
---

In the repository, a simple test manifest exists that creates three different PersistentVolumeClaims using default NFS and iSCSI and FC storage classes, and automatically mounts them to the pod.

**Steps**

1. To run this test, run the kubectl command from the root directory of the repository:
   ```bash
   kubectl create -f ./tests/sample.yaml
   ```
You can find all the created resources in `test-unity` namespace.

2. Check if the pod is created and Ready and Running by running:
   ```bash
   kubectl get all -n test-unity
   ```
   If it's in CrashLoopback state then the driver installation wasn't successful. Check the logs of the node and the controller.

3. Go into the created container and verify that everything is mounted correctly.

4. After verifying, you can uninstall the testing PVCs and StatefulSet.
   ```bash
   kubectl delete -f ./tests/sample.yaml
   ```
