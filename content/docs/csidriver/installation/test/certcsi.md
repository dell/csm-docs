---
title: Cert-CSI
linktitle: Cert-CSI
description: Tool to validate Dell CSI Drivers
---

Cert-CSI is a tool to validate Dell CSI Drivers. It contains various test suites to validate the drivers. 

## Installation
To install this tool you can download one of binary files located in [RELEASES](https://github.com/dell/cert-csi/releases)

You can build the tool by cloning the repository and running this command:
```bash
make build 
```

You can also build a docker container image by running this command:
```bash
make docker
```

If you want to collect csi-driver resource usage metrics, then please provide the namespace where it can be found and install the metric-server using this command (kubectl is required):

```bash
make install-ms
```
[FOR UNIX] If you want to build and install the tool to your $PATH and enable the **auto-completion** feature, then run this command:

```bash
make install-nix
```
> Alternatively, you can install the metric-server by following the instructions at https://github.com/kubernetes-incubator/metrics-server

## Running Cert-CSI

> Log files are located in the `logs` directory in the working directory of cert-csi.\
> Report files are located in `$HOME/.cert-csi/reports` directory.\
> Database (SQLite) file for functional test suites is `cert-csi-functional.db` in the working directory of cert-csi.

To get information on how to use the program, you can use built-in help. If you're using a UNIX-like system and enabled _auto-completion feature_ while installing the tool, then you can use shell's built-in auto-completion to navigate through program's subcommands and flags interactively by just pressing TAB.

To run cert-csi, you have to point your environment to a kube cluster. This allows you to receive dynamically formatted suggestions from your cluster.
For example if you press TAB while passing --storageclass (or --sc) argument, the tool will parse all existing Storage Classes from your cluster and suggest them as an input for you. 

> To run a docker container your command should look something like this
> ```bash
>
>   docker run --rm -it -v ~/.kube/config:/root/.kube/config -v $(pwd):/app/cert-csi cert-csi <usual program arguments>
>   ```

## Driver Certification 

You can use cert-csi to launch a certification test run against multiple storage classes to check if the driver adheres to advertised capabilities. 

### Preparing Config

To run the certification test you need to provide `.yaml` config with storage classes and their capabilities. You can use `example-certify-config.yaml` as an example. 

Example:
```yaml
storageClasses:
  - name: # storage-class-name (ex. powerstore)
    minSize: # minimal size for your sc (ex. 1Gi)
    rawBlock: # is Raw Block supported (true or false)
    expansion: # is volume expansion supported (true or false)
    clone: # is volume cloning supported (true or false)
    snapshot: # is volume snapshotting supported (true or false)
    RWX: # is ReadWriteMany volume access mode supported for non RawBlock volumes (true or false)
    volumeHealth: false # set this to enable the execution of the VolumeHealthMetricsSuite.
    # Make sure to enable healthMonitor for the driver's controller and node pods before running this suite. It is recommended to use a smaller interval time for this sidecar and pass the required arguments.
    VGS: false # set this to enable the execution of the VolumeGroupSnapSuite.
    # Additionally, make sure to provide the necessary required arguments such as volumeSnapshotClass, vgs-volume-label, and any others as needed.
    RWOP: false # set this to enable the execution of the MultiAttachSuite with the AccessMode set to ReadWriteOncePod.
    ephemeral: # if exists, then run EphemeralVolumeSuite
      driver: # driver name for EphemeralVolumeSuite
      fstype: # fstype for EphemeralVolumeSuite
      volumeAttributes: # volume attrs for EphemeralVolumeSuite. 
        attr1: # volume attr for EphemeralVolumeSuite
        attr2: # volume attr for EphemeralVolumeSuite
```

### Launching Certification Test Run

After preparing a certification configuration file, you can launch certification by running 
```
cert-csi certify --cert-config <path-to-config>
Optional Params:
   --vsc: volume snapshot class, required if you specified snapshot capability
   --timeout: set the timeout value for certification suites
   --no-metrics: disables metrics aggregation (set if you encounter k8s performance issues)
   --path: path to folder where reports will be created (if not specified ~/.cert-csi/ will be used)
```

#### Storage Capacity Tracking Suite
1. Creates namespace `functional-test` where resources will be created.
2. Creates a duplicate of the provided storge class using prefix `capacity-tracking`.
3. Waits for the associated CSIStorageCapacity object to be created.
4. Deletes the duplicate storge class.
5. Waits for the associated CSIStorageCapacity to be deleted.
6. Sets the capacity of the CSIStorageCapacity of the provided storage class to zero.
7. Creates Pod with a volume using the provided storage class.
8. Verifies that the Pod is in the Pending state.
9. Waits for storage capacity to be polled by the driver.
10. Waits for Pod to be Running.

> Storage class must use volume binding mode `WaitForFirstConsumer`.\
> This suite does not delete resources on success.

To run storage capacity tracking test suite, run the command:
```bash
cert-csi functional-test capacity-tracking --sc <storage-class> --drns <driver-namespace>
```

### Other Options

#### Generating tabular report from DB

To generate tabular report from the database, run the command:
```bash
cert-csi -db ./cert-csi-functional.db functional-report -tabular
```

The report will be in the `$HOME/.cert-csi/reports` directory.

#### Generating XML report from DB

To generate XML report from the database, run the command:
```bash
cert-csi -db ./cert-csi-functional.db functional-report -xml
```

The report will be in the `$HOME/.cert-csi/reports` directory.

### Screenshots

Tabular Report example

![img9](../img/tabularReport.png)

## Kubernetes End-To-End Tests
All Kubernetes end to end tests require that you provide the driver config based on the storage class you want to test and the version of the kubernetes you want to test against. These are the mandatory parameters that you can provide in command like..
```bash
 --driver-config <path of driver config file> and --version "v1.25.0" 
 ```

### Running kubernetes end-to-end tests
todo
To run kubernetes end-to-end tests, run the command:
```bash

cert-csi k8s-e2e --config <kube config> --driver-config <path to driver config>  --focus <regx pattern to focus Ex: "External.Storage.*" >  --timeout <timeout Ex: "2h"> --version < version of k8s Ex: "v1.25.0"> --skip-tests <skip these steps mentioned in file> --skip <regx pattern to skip tests Ex:"Generic Ephemeral-volume|(block volmode)">
```

### Kubernetes end-to-end reporting

- All the reports generated by kubernetes end-to-end tests will be under `$HOME/reports` directory by default if user doesn't mention the report path.
- Kubernetes end to end tests Execution log file will be placed under `$HOME/reports/execution_[storage class name].log`
- Cert-CSI logs will be present in the execution directory `info.log` , `error.log`

### Test config files format
- #### [driver-config](https://github.com/dell/cert-csi/blob/main/pkg/utils/testdata/config-nfs.yaml)
- #### [ignore-tests](https://github.com/dell/cert-csi/blob/main/pkg/utils/ignore.yaml)

### Example Commands
-  ```bash

   cert-csi k8s-e2e --config "/root/.kube/config" --driver-config "/root/e2e_config/config-nfs.yaml"  --focus "External.Storage.*"  --timeout "2h" --version "v1.25.0" --skip-tests "/root/e2e_config/ignore.yaml"
   ```
-  ```bash

   ./cert-csi k8s-e2e --config "/root/.kube/config" --driver-config "/root/e2e_config/config-iscsi.yaml" --focus "External.Storage.*"  --timeout "2h" --version "v1.25.0" --focus-file "capacity.go"
   ```

#### Volume Creation test suite
1. Creates the namespace `vcs-test-*` where resources will be created.
2. Creates Persistent Volume Claims.
3. If the specified storage class binding mode is not `WaitForFirstConsumer`, waits for Persistent Volume Claims to be bound to Persistent Volumes.

To run volume creation test suite, run the command:
```bash
cert-csi test volume-creation --sc <storage class> -n 25
```

Run `cert-csi test volume-creation -h` for more options.

#### Running Provisioning test suite
1. Creates the namespace `prov-test-*` where resources will be created.
2. Creates Persistent Volume Claims.
3. Creates Pods to consume the Persistent Volume Claims.
4. Waits for Pods to be in the Ready state.

To run volume provisioning test suite, run the command:
```bash
cert-csi test provisioning --sc <storage class> --podNum 1 --volNum 10
```

Run `cert-csi test provisioning -h` for more options.

#### Running Scalability test suite
1. Creates the namespace `scale-test-*` where resources will be created.
2. Creates a StatefulSet.
3. Scales up the StatefulSet to the number of replicas.
4. Scales down the StatefulSet to zero.

To run scalability test suite, run the command:
```bash
cert-csi test scaling --sc <storage class> --replicas 5
```

Run `cert-csi test scaling -h` for more options.

#### Running VolumeIO test suite
1. Creates the namespace `volumeio-test-*` where resources will be created.
2. Creates n Persistent Volume Claims specified by `chainNumber`.
3. If the specified storage class binding mode is not `WaitForFirstConsumer`, waits for Persistent Volume Claims to be bound to Persistent Volumes.
4. For each Persistent Volume Claim, executes the following workflow concurrently specified by `chainLength`:
   1. Creates a Pod to consume the Persistent Volume Claim.
   2. Writes data to the volume and verifies the checksum of the data.
   3. Deletes the Pod.
   4. Waits for the associated Volume Attachment to be deleted.

To run volumeIO test suite, run the command:
```bash
cert-csi test vio --sc <storage class> --chainNumber 5 --chainLength 20
```

Run `cert-csi test vio -h` for more options.

#### Running Snap test suite
1. Creates the namespace `snap-test-*` where resources will be created.
2. Creates Persistent Volume Claim.
3. If the specified storage class binding mode is not `WaitForFirstConsumer`, waits for Persistent Volume Claim to be bound to Persistent Volumes.
4. Create Pod to consume the Persistent Volume Claim.
5. Writes data to the volume.
6. Deletes the Pod.
7. Creates a Volume Snapshot from the Persistent Volume Claim.
8. Waits for the Volume Snapshot to be Ready.
9. Creates a new Persistent Volume Claim from the Volume Snapshot.
10. Creates a new Pod to consume the new Persistent Volume Claim.
11. Verifies the checksum of the data.


To run volume snapshot test suite, run the command:
```bash
cert-csi test snap --sc <storage class> --vsc <volume snapshot class> 
```

Run `cert-csi test snap -h` for more options.

#### Running Multi-attach volume suite
1. Creates the namespace `mas-test-*` where resources will be created.
2. Creates Persistent Volume Claim.
3. Creates Pod to consume the Persistent Volume Claim.
4. Waits for Pod to be in the Ready state.
5. Creates additional Pods to consume the same Persistent Volume Claim.
6. Watis for Pods to be in the Ready state.
7. Writes data to the volumes on the Pods and verifies checksum of the data.

To run multi-attach volume test suite, run the command: 
```bash
cert-csi test multi-attach-vol --sc <storage class> --podNum 3
```

> The storage class must be an NFS storage class. Otherwise, raw block volumes must be used.

To run multi-attach volume test suite with raw block volumes, run the command:

```bash
cert-csi test multi-attach-vol --sc <storage class> --podNum 3 --block
```

Run `cert-csi test multi-attach-vol -h` for more options.

#### Running Replication test suite
1. Creates the namespace `replication-suite-*` where resources will be created.
2. Creates Persistent Volume Claims.
3. Create Pods to consume the Persistent Volume Claims.
4. Waits for Pods to be in the Ready state.
5. Creates a Volume Snapshot from each Persistent Volume Claim.
6. Waits for the Volume Snapshots to be Ready.
7. Creates Persistent Volume Claims from the Volume Snapshots.
8. Creates Pods to consume the Persistent Volume Claims.
9. Waits for Pods to be in the Ready state.
10. Verifies the replication group name on ersistent Volume Claims.

To run replication test suite, run the command:
```bash

cert-csi test replication --sc <storage class> --pn 1 --vn 5 --vsc <snapshot class> 
```

Run `cert-csi test replication -h` for more options.

#### Running Volume Cloning test suite
1. Creates the namespace `clonevolume-suite-*` where resources will be created.
2. Creates Persistent Volume Claims.
3. Create Pods to consume the Persistent Volume Claims.
4. Waits for Pods to be in the Ready state.
5. Creates Persistent Volume Claims with the source volume being from the volumes in step 2.
6. Create Pods to consume the Persistent Volume Claims.
7. Waits for Pods to be in the Ready state.

To run volume cloning test suite, run the command:
```bash
cert-csi test clone-volume --sc <storage class> --pn 1 --vn 5
```

Run `cert-csi test clone-volume -h` for more options.

#### Running Volume Expansion test suite
1. Creates the namespace `volume-expansion-suite-*` where resources will be created.
2. Creates Persistent Volume Claims.
3. Create Pods to consume the Persistent Volume Claims.
4. Waits for Pods to be in the Ready state.
5. Expands the size in the Persistent Volume Claims.
6. Verifies that the volumes mounted to the Pods were expanded.

> Raw block volumes cannot be verified since there is no filesystem.

To run volume expansion test, run the command:
```bash
cert-csi test expansion --sc <storage class> --pn 1 --vn 5
```

Run `cert-csi test expansion -h` for more options.

#### Running Blocksnap suite
1. Creates the namespace `block-snap-test-*` where resources will be created.
2. Creates Persistent Volume Claim.
3. If the specified storage class binding mode is not `WaitForFirstConsumer`, waits for Persistent Volume Claim to be bound to Persistent Volumes.
4. Creates Pod to consume the Persistent Volume Claim.
5. Writes data to the volume. 
5. Creates a Volume Snapshot from the Persistent Volume Claim.
6. Waits for the Volume Snapshot to be Ready.
7. Create a Persistent Volume Claim with raw block volume mode from the Volume Snapshot.
8. Creates Pod to consume the Persistent Volume Claim.
9. Mounts the raw block volume and verifes the checksum of the data.

To run block snapshot test suite, run the command:
```bash
cert-csi test blocksnap --sc <storageClass> --vsc <snapshotclass>
```

Run `cert-csi test blocksnap -h` for more options.

#### Volume Health Metric Suite
1. Creates the namespace `volume-health-metrics-*` where resources will be created.
2. Creates Persistent Volume Claim.
3. Creates Pod to consume the Persistent Volume Claim.
4. Waits for Pod to be in the Ready state.
4. Veries that ControllerGetVolume and NodeGetVolumeStats are being executed in the controller and node pods, respectively.

To run the volume health metric test suite, run the command:
```bash
cert-csi test volumehealthmetrics --sc <storage-class> --driver-ns <driver-namespace>
```

Run `cert-csi test volumehealthmetrics -h` for more options.

> Note: Make sure to enable healthMonitor for the driver's controller and node pods before running this suite. It is recommended to use a smaller interval time for this sidecar.

#### Ephemeral volumes suite
1. Creates namespace `functional-test` where resources will be created.
2. Creates Pods with one ephemeral inline volume each.
3. Waits for Pods to be in the Ready state.
4. Writes data to the volume on each Pod.
5. Verifies the checksum of the data.

To run the ephemeral volume test suite, run the command:
```bash
cert-csi test ephemeral-volume --driver <driver-name> --attr ephemeral-config.properties
```

Run `cert-csi test ephemeral-volume -h` for more options.

> `--driver` is the name of a CSI Driver from the output of `kubectl get csidriver` (e.g, csi-vxflexos.dellemc.com).
> This suite does not delete resources on success.

Sample ephemeral-config.properties (key/value pair)
   {{< tabs name="volume-attributes-examples" >}}
   {{% tab name="CSI PowerFlex" %}}

   ```bash
   volumeName: "my-ephemeral-vol"
   size: "10Gi"
   storagepool: "sample"
   systemID: "sample"
   ```

   {{% /tab %}}
   {{% tab name="CSI PowerScale" %}}

   ```bash
   size: "10Gi"
   ClusterName: "sample"
   AccessZone: "sample"
   IsiPath: "/ifs/data/sample"
   IsiVolumePathPermissions: "0777"
   AzServiceIP: "192.168.2.1"
   ```

   {{% /tab %}}
   {{% tab name="CSI PowerStore" %}}

   ```bash
   size: "10Gi"
   arrayID: "sample"
   nasName: "sample"
   nfsAcls: "0777"
   ```

   {{% /tab %}}
   {{% tab name="CSI Unity" %}}

   ```bash
   size: "10Gi"
   arrayID: "sample"
   protocol: iSCSI
   thinProvisioned: "true"
   isDataReductionEnabled: "false"
   tieringPolicy: "1"
   storagePool: pool_2
   nasName: "sample"
   ```

   {{% /tab %}}
   {{< /tabs >}}

#### Storage Capacity Tracking Suite
1. Creates namespace `functional-test` where resources will be created.
2. Creates a duplicate of the provided storge class using prefix `capacity-tracking`.
3. Waits for the associated CSIStorageCapacity object to be created.
4. Deletes the duplicate storge class.
5. Waits for the associated CSIStorageCapacity to be deleted.
6. Sets the capacity of the CSIStorageCapacity of the provided storage class to zero.
7. Creates Pod with a volume using the provided storage class.
8. Verifies that the Pod is in the Pending state.
9. Waits for storage capacity to be polled by the driver.
10. Waits for Pod to be Running.

> Storage class must use volume binding mode `WaitForFirstConsumer`.\
> This suite does not delete resources on success.

To run storage capacity tracking test suite, run the command:
```bash
cert-csi functional-test capacity-tracking --sc <storage-class> --drns <driver-namespace>
```

Run `cert-csi test capacity-tracking -h` for more options.

### Running Longevity mode

To run longevity test suite, run the command:
```bash
cert-csi test <any of previous tests> --sc <storage class> --longevity <number of iterations>
```

### Interacting with DB 

#### Generating report from runs without running tests

To generate test report from the database, run the command:
```bash
cert-csi --db <path/to/.db> report --testrun <test-run-name> --html --txt
Report types:
--html: performance html report
--txt: performance txt report
--xml: junit compatible xml report, contains basic run infomation
--tabular: tidy html report with basic run information
```

#### Customizing report folder

To specify test report folder path, use --path option as follows:
```bash

cert-csi --db <path/to/.db> report --testrun <test-run-name> --path <path-to-folder>
Options:
--path: path to folder where reports will be created (if not specified ~/.cert-csi/ will be used)
```

#### Generating report from multiple databases and test runs

To generate report from multiple databases, run the command:
```bash
cert-csi report --tr <db-path>:<test-run-name> --tr ... --tabular --xml
Supported report types: 
--xml
--tabular
```

#### Listing all known test runs

To list all test runs, run the command:
```bash
cert-csi --db <path/to/.db> list test-runs
```

### Other options

#### Customizing report folder

To specify test report folder path, use --path option as follows:
```bash
cert-csi <command> --path <path-to-folder>
Commands:
    test <any-subcommand>
    certify
    report
```

#### Running with enabled driver resource usage metrics

To run tests with driver resource usage metrics enabled, run the command:
```bash
cert-csi test <test suite> --sc <storage class> <...> --ns <driver namespace> 
```

#### Running custom hooks from program

To run tests with custom hooks, run the command:
```bash

cert-csi test <test suite> --sc <storage class> <...> --sh ./hooks/start.sh --rh ./hooks/ready.sh --fh ./hooks/finish.sh
```

## Screenshots

### Running provisioning test

![img1](../img/unifiedTest.png)

You can interrupt the application by sending an interruption signal (for example pressing Ctrl + C).
It will stop polling and try to cleanup resources.

![img2](../img/interruptTest.png)

### Running scaling test

![img3](../img/scaling.PNG)

### Listing available test runs

![img4](../img/listRuns.png)

### Running longevity mode

![img5](../img/longevity.png)

### Multi DB Tabular report example

![img6](../img/multiDBTabularReport.png)

Text report example

![img7](../img/textReport.png)

### HTML report example

![img8](../img/HTMLReport.png)

### Resource usage example chart

![img9](../img/resourceUsage.png)