---
title: Test PowerMax CSI Driver
linktitle: PowerMax
description: Tests to validate PowerMax CSI Driver installation
---

This section provides multiple methods to test driver functionality in your environment. The tests are validated using bash as the default shell.

**Note**: To run the test for CSI Driver for Dell EMC PowerMax, install Helm 3.

The _csi-powermax_ repository includes examples of how you can use the CSI Driver for Dell EMC PowerMax. These examples automate the creation of Pods using the default storage classes that were created during installation. The shell scripts are used to automate the installation and uninstallation of helm charts for the creation of Pods with different number of volumes. To test the installation of the CSI driver, perform these tests:
- Volume clone test
- Volume test
- Snapshot test

#### Volume test

Procedure to perform a volume test.

1. Create a namespace with the name _test_.
2. Run the `cd csi-powermax/test/helm` command to go to the `csi-powermax/test/helm` directory, which contains the `starttest.sh` and the _2vols_ directories.
3. Run the starttest.sh script and provide it a test name. The following is a sample command that can be used to run the _2vols_ test: `./starttest.sh -t 2vols -n test`

    This script installs a helm chart that creates a Pod with a container, creates two PVCs, and mounts them into the created container. You can now log in to the newly created container and check the mounts.
4. Run the `./stoptest.sh -t 2vols -n test` script to stop the test. This script deletes the Pods and the PVCs created during the test and uninstalls the helm chart.

>*NOTE*: Helm tests have been designed assuming users are using the default storageclass names (powermax and powermax-xfs). If your storageclass names differ from the default values, such as when deploying with the Operator, update the templates in _2vols_ accordingly (located in `test/helm/2vols/templates/` directory). You can use `kubectl get sc` to check for the storageclass names.

#### Volume clone test

Procedure to perform volume clone test.

1. Create a namespace with the name _test_.
2. Run the `cd csi-powermax/test/helm` command to go to the `csi-powermax/test/helm` directory, which contains the `volumeclonetest.sh` script.
3. Run the `volumeclonetest.sh` script using the following command: `bash volumeclonetest.sh`

This script does the following:
- Installs a helm chart that creates a Pod with a container, creates two PVCs, and mounts them into the created container.
- Then it creates a file on one of the PVCs and calculates its checksum.
- After that, it uses that PVC as the data source to create a new PVC and mounts it on the same container. It checks if the file that existed in the source PVC also exists in the new PVC, calculates its checksum and compares it to the checksum previously calculated.
- Finally, it cleans up all the resources that are created as part of the test.


#### Snapshot test

Procedure to perform snapshot test.

1. Create a namespace with the name _test_.
2. Run the `cd csi-powermax/test/helm` command to go to the `csi-powermax/test/helm` directory, which contains the `snaprestoretest.sh`.
3. Run the `snaprestoretest.sh` script by running the command : `bash snaprestoretest.sh`
  
  This script does the following:
  - Installs a helm chart that creates a Pod with a container, creates two PVCs, and mounts them into the created container.
  - Writes some data to one of the PVCs.
  - After that, it creates a snapshot on that PVC and uses it as a data source to create a new PVC. It mounts the newly created PVC to the container created earlier and then lists the contents of the source and the target PVCs.
  - Cleans up all the resources that were created as part of the test.

>*NOTE*: This test has been designed assuming users are using the snapshot class name `powermax-snapclass` which is created by the Helm-based installer. If you have an operator-based deployment, the name of the snapshot class will differ. You must update the snapshot class name in the file `betaSnap1.yaml` present in the `test/helm` folder based on your method of deployment. To get a list of volume snapshot classes, run the command - `kubectl get volumesnapshotclass`

#### Volume Expansion test

Procedure to perform volume expansion test

1. Create a namespace with the name _test_
2. Run the `cd csi-powermax/test/helm` command to go to the `csi-powermax/test/helm` directory, which contains the `volumeexpansiontest.sh`.
3. Run the `volumeexpansiontest.sh` script by running the command : `bash volumeexpansiontest.sh`

  This script does the following:
  - Installs a helm chart that creates a pod with a container, creates one PVC and mounts it into the created container
  - Writes some data to the PVC
  - After that, it calculates the checksum of the written data, expands the PVC and then recalculates the checksum
  - Cleans up all the resources that were created as part of the test