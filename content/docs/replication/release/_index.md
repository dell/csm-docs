---
title: "Release notes"
linkTitle: "Release notes"
weight: 9
Description: >
  Dell Container Storage Modules (CSM) release notes for replication
---

## Release Notes - CSM Replication 1.6.0



### New Features/Changes

- [#724 - [FEATURE]: CSM support for Openshift 4.13](https://github.com/dell/csm/issues/724)
- [#877 - [FEATURE]: Make standalone helm chart available from helm repository : https://dell.github.io/dell/helm-charts](https://github.com/dell/csm/issues/877)
- [#926 - [FEATURE]: Set up golangci-lint for all CSM repositories](https://github.com/dell/csm/issues/926)
- [#947 - [FEATURE]: K8S 1.28 support in CSM 1.8](https://github.com/dell/csm/issues/947)
- [#790 - [FEATURE]: Use ubi-micro as base image](https://github.com/dell/csm/issues/790)

### Fixed Issues

- [#928 - [BUG]: PowerStore Replication - Delete RG request hangs](https://github.com/dell/csm/issues/928)
- [#916 - [BUG]: Remove refs to deprecated io/ioutil](https://github.com/dell/csm/issues/916)

### Known Issues

| Github ID                                     | Description                                                        |
| --------------------------------------------- | ------------------------------------------------------------------ |
| [753](https://github.com/dell/csm/issues/753) | **PowerScale:** When Persistent Volumes (PVs) are created with quota enabled on CSM versions 1.6.0 and before, an incorrect quota gets set for the target side read-only PVs/directories based on the consumed non-zero source size instead of the assigned quota of the source. This can create issues when the user performs failover and wants to write data to the failed over site. If lower quota limit is set, no new writes can be performed on the target side post failover. <br /> **Workaround** using PowerScale cluster CLI or UI: <br /> For each Persistent Volume on the source kubernetes cluster, <br /> 1. Get the quota assigned for the directory on the source PowerScale cluster. The path to the directory information can be obtained from the specification field of the Persistent Volume object. <br /> 2. Verify the quota of the target directory on the target PowerScale cluster. If incorrect quota is set, update the quota on the target directory with the same information as on the source. If no quota is set, create a quota for the target directory. |