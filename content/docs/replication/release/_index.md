---
title: "Release notes"
linkTitle: "Release notes"
weight: 9
Description: >
  Dell Container Storage Modules (CSM) release notes for replication
---

## Release Notes - CSM Replication 1.6.0








### New Features/Changes

- [#947 - [FEATURE]: Support for Kubernetes 1.28](https://github.com/dell/csm/issues/947)
- [#1066 - [FEATURE]: Support for Openshift 4.14](https://github.com/dell/csm/issues/1066)
- [#996 - [FEATURE]: Dell CSI to Dell CSM Operator Migration Process](https://github.com/dell/csm/issues/996)
- [#1031 - [FEATURE]: Update to the latest UBI Micro image for CSM](https://github.com/dell/csm/issues/1031)
- [#1062 - [FEATURE]: CSM PowerMax: Support PowerMax v10.1 ](https://github.com/dell/csm/issues/1062)

### Fixed Issues

- [#988 - [BUG]: CSM Operator fails to install CSM Replication on the remote cluster](https://github.com/dell/csm/issues/988)
- [#1002 - [BUG]: CSM Replication - secret file requirement for both sites not documented ](https://github.com/dell/csm/issues/1002)

### Known Issues

| Github ID                                     | Description                                                        |
| --------------------------------------------- | ------------------------------------------------------------------ |
| [753](https://github.com/dell/csm/issues/753) | **PowerScale:** When Persistent Volumes (PVs) are created with quota enabled on CSM versions 1.6.0 and before, an incorrect quota gets set for the target side read-only PVs/directories based on the consumed non-zero source size instead of the assigned quota of the source. This can create issues when the user performs failover and wants to write data to the failed over site. If lower quota limit is set, no new writes can be performed on the target side post failover. <br /> **Workaround** using PowerScale cluster CLI or UI: <br /> For each Persistent Volume on the source kubernetes cluster, <br /> 1. Get the quota assigned for the directory on the source PowerScale cluster. The path to the directory information can be obtained from the specification field of the Persistent Volume object. <br /> 2. Verify the quota of the target directory on the target PowerScale cluster. If incorrect quota is set, update the quota on the target directory with the same information as on the source. If no quota is set, create a quota for the target directory. |