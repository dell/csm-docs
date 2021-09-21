---
title: Test PowerMax CSI Driver
linktitle: PowerMax
description: Tests to validate PowerMax CSI Driver installation
---

This section provides multiple methods to test driver functionality in your environment. The tests are validated using bash as the default shell.

**Note**: To run the test for CSI Driver for Dell EMC PowerMax, install Helm 3.

The _csi-powermax_ repository includes examples of how you can use CSI Driver for Dell EMC PowerMax. The shell scripts are used to automate the installation and uninstallation of helm charts for the creation of Pods with a different number of volumes in a given namespace using the storageclass provided. To test the installation of the CSI driver, perform these tests:
- Volume clone test
- Volume test
- Snapshot test

#### Volume test

Use this procedure to perform a volume test.

1. Create a namespace with the name _test_.
2. Run the `cd csi-powermax/test/helm` command to go to the `csi-powermax/test/helm` directory, which contains the `starttest.sh` script and the _2vols_ directories.
3. Run the starttest.sh script and provide it with a test name. The following sample command can be used to run the _2vols_ test: `./starttest.sh -t 2vols -n <test_namespace> -s <storageclass-name>`

    This script installs a helm chart that creates a Pod with a container, creates two PVCs, and mounts them into the created container. You can now log in to the newly created container and check the mounts.
4. Run the `/stoptest.sh -t 2vols -n <test_namespace>` script to stop the test. This script deletes the Pods and the PVCs created during the test and uninstalls the helm chart.

>*NOTE*: Helm tests have been designed assuming that users have created storageclass names like `storageclass-name` and `storageclass-name-xfs`. You can use `kubectl get sc` to check for the storageclass names.

#### Volume clone test

Use this procedure to perform a volume clone test.

1. Create a namespace with the name _test_.
2. Run the `cd csi-powermax/test/helm` command to go to the `csi-powermax/test/helm` directory, which contains the `volumeclonetest.sh` script.
3. Run the `volumeclonetest.sh` script using the following command: `bash volumeclonetest.sh -n <test_namespace> -s <storageclass-name>`

This script does the following:
- Installs a helm chart that creates a Pod with a container, creates two PVCs, and mounts them into the created container.
- Then it creates a file on one of the PVCs and calculates its checksum.
- After that, it uses that PVC as the data source to create a new PVC and mounts it on the same container. It checks if the file that existed in the source PVC also exists in the new PVC, calculates its checksum, and compares it to the checksum previously calculated.
- Finally, it cleans up all the resources that are created as part of the test.


#### Snapshot test

Use this procedure to perform a snapshot test.

1. Create a namespace with the name _test_.
2. Run the `cd csi-powermax/test/helm` command to go to the `csi-powermax/test/helm` directory, which contains the `snaprestoretest.sh`script.
3. Run the `snaprestoretest.sh` script by running the command : `bash snaprestoretest.sh -n <test_namespace> -s <storageclass-name>`
  
  This script does the following:
  - Installs a helm chart that creates a Pod with a container, creates two PVCs, and mounts them into the created container.
  - Writes some data to one of the PVCs.
  - After that, it creates a snapshot of that PVC and uses it as a data source to create a new PVC. It mounts the newly created PVC to the container created earlier and then lists the contents of the source and the target PVCs.
  - Cleans up all the resources that were created as part of the test.

>*NOTE*: This test has been designed assuming that users are using the snapshot class name `powermax-snapclass`. You must update the snapshot class name in the file `snap1.yaml` present in the test/helm folder based on your method of deployment. To get a list of volume snapshot classes, run the command - `kubectl get volumesnapshotclass`

#### Volume Expansion test

Use this procedure to perform a volume expansion test.

1. Create a namespace with the name _test_
2. Run the `cd csi-powermax/test/helm` command to go to the `csi-powermax/test/helm` directory, which contains the `volumeexpansiontest.sh`script.
3. Run the `volumeexpansiontest.sh` script by running the command : `bash volumeexpansiontest.sh -n <test_namespace> -s <storageclass-name>`

  This script does the following:
  - Installs a helm chart that creates a Pod with a container, creates one PVC, and mounts it into the created container
  - Writes some data to the PVC
  - After that, it calculates the checksum of the written data, expands the PVC, and then recalculates the checksum
  - Cleans up all the resources that were created as part of the test
