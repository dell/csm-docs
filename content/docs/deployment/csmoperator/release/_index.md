---
title: "Release notes"
linkTitle: "Release notes"
weight: 5
Description: >
  Release notes for Dell Container Storage Modules Operator
---

## Release Notes - Container Storage Modules Operator v1.4.1








### New Features/Changes

- [#947 - [FEATURE]: Support for Kubernetes 1.28](https://github.com/dell/csm/issues/947)
- [#1066 - [FEATURE]: Support for Openshift 4.14](https://github.com/dell/csm/issues/1066)
- [#996 - [FEATURE]: Dell CSI to Dell CSM Operator Migration Process](https://github.com/dell/csm/issues/996)
- [#1062 - [FEATURE]: CSM PowerMax: Support PowerMax v10.1 ](https://github.com/dell/csm/issues/1062)

### Fixed Issues

- [#975 - [BUG]: Not able to take volumesnapshots  ](https://github.com/dell/csm/issues/975)
- [#982 - [BUG]: Update resources limits for controller-manager to fix OOMKilled error](https://github.com/dell/csm/issues/982)
- [#988 - [BUG]: CSM Operator fails to install CSM Replication on the remote cluster](https://github.com/dell/csm/issues/988)
- [#989 - [BUG]: Allow volume prefix to be set via CSM operator](https://github.com/dell/csm/issues/989)
- [#990 - [BUG]: X_CSI_AUTH_TYPE cannot be set in CSM Operator](https://github.com/dell/csm/issues/990)

### Known Issues

| Issue | Workaround |
|-------|------------|
| It appears that the images of sideCars are currently missing in the sample YAMLs in the offline bundle. As a consequence, the csm-operator is pulling them from registry.k8s.io. | We recommend manually updating the images of sideCars in the sample YAML file, for example, `storage_csm_powerflex_v290.yaml`, before proceeding with the driver installation. Here is an example snippet for the sideCars section in the YAML file:

  ```yaml
  sideCars:
    # 'k8s' represents a string prepended to each volume created by the CSI driver
    - name: provisioner
      image: <localregistry>/csi-provisioner:v3.6.2
      args: ["--volume-name-prefix=k8s"]
    - name: attacher
      image: <localregistry>/csi-attacher:v4.4.2
    - name: registrar
      image: <localregistry>/csi-node-driver-registrar:v2.9.1
    - name: resizer
      image: <localregistry>/csi-resizer:v1.9.2
    - name: snapshotter
      image: <localregistry>/csi-snapshotter:v6.3.2

    # sdc-monitor is disabled by default, due to high CPU usage
    - name: sdc-monitor
      enabled: false
      image: <localregistry>/sdc:4.5
      envs:
        - name: HOST_PID
          value: "1"
        - name: MDM
          value: "10.xx.xx.xx,10.xx.xx.xx" # Do not add mdm value here if it is present in secret

    # health monitor is disabled by default, refer to driver documentation before enabling it
    # Also set the env variable controller.envs.X_CSI_HEALTH_MONITOR_ENABLED to "true".
    - name: csi-external-health-monitor-controller
      enabled: false
      image: <localregistry>/csi-external-health-monitor-controller:v0.10.0
      args: ["--monitor-interval=60s"]