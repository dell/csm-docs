---
title: Troubleshooting
linktitle: Troubleshooting
weight: 4
description: >
   Dell Container Storage Modules (CSM) for Resiliency - Troubleshooting
---

Some tools have been provided in the [tools](https://github.com/dell/karavi-resiliency/blob/main/tools) directory that will help you understand the system's state and facilitate troubleshooting.
If you experience a problem with CSM for Resiliency it is important you provide us with as much information as possible so that we can diagnose the issue and improve CSM for Resiliency. Some tools have been provided in the [tools](https://github.com/dell/karavi-resiliency/blob/main/tools) directory that will help you understand the system's state and facilitate sending us the logs and other information needed to diagnose a problem.

## Monitoring Protected Pods and Node Status

There are two tools for monitoring the status of protected pods and nodes.

The [mon.sh](https://github.com/dell/karavi-resiliency/blob/main/tools/mon.sh) script displays the following information every 5 seconds:

* The date and time.
* A list of the nodes and their status.
* A list of the taints applied to each node.
* A list of the leases in the CSI driver's namespace. (Edit the script to change the CSI driver namespace if necessary. It defaults to vxflexos as the driver namespace.)
* A list of the CSI driver pods and their status (defaults to vxflexos namespace.) 
* A list of the protected pods and their status. (Edit the script if you do not use the default podmon label key.)

For systems with many protected pods, the [monx.sh](https://github.com/dell/karavi-resiliency/blob/main/tools/monx.sh) may provide a more usable output format. It displays the following fields every 5 seconds:

* The date and time.
* A list of the nodes and their status.
* A list of the taints applied to each node.
* A summary for each node hosting protected pods of the number of pods in various states such as the Running, Creating, and Error states. (Edit the script if you do not use the default podmon label key.)
* A list of the protected pods not in the Running state.

## Collecting Logs

If you have a problem with CSM for Resiliency it's best to collect the logs to help with diagnosis.  This tool can also be used to collect logs to submit as part of an [issue](https://github.com/dell/csm/issues) to help us diagnose. Please use the [collect_logs.sh](https://github.com/dell/karavi-resiliency/blob/main/tools/collect_logs.sh). Type "collect_logs.sh --help" for help on the arguments.

The script collects the following information:
* A list of the driver pods.
* A list of the protected pods.
* The podmon container logs for each of the driver pods.
* The driver container logs for each of the driver pods.
* For each namespace containing protected pods, the recent events logged in that namespace.

After successful execution of the script, it will deposit a file similar to driver.logs.20210319_1407.tgz in the current directory. Please submit that file with any [issues](https://github.com/dell/csm/issues).