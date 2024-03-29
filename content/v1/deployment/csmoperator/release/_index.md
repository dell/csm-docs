---
title: "Release notes"
linkTitle: "Release notes"
weight: 5
Description: >
  Release notes for Dell Container Storage Modules Operator
---

## Release Notes - Container Storage Modules Operator v1.4.4

### New Features/Changes

- [#947 - [FEATURE]: Support for Kubernetes 1.28](https://github.com/dell/csm/issues/947)
- [#1066 - [FEATURE]: Support for Openshift 4.14](https://github.com/dell/csm/issues/1066)
- [#996 - [FEATURE]: Dell CSI to Dell CSM Operator Migration Process](https://github.com/dell/csm/issues/996)
- [#1062 - [FEATURE]: CSM PowerMax: Support PowerMax v10.1 ](https://github.com/dell/csm/issues/1062)
- [#1158 - [FEATURE]: Automatically create certificates with CSM Operator Observability deployment ](https://github.com/dell/csm/issues/1158)

### Fixed Issues

- [#975 - [BUG]: Not able to take volumesnapshots  ](https://github.com/dell/csm/issues/975)
- [#982 - [BUG]: Update resources limits for controller-manager to fix OOMKilled error](https://github.com/dell/csm/issues/982)
- [#988 - [BUG]: CSM Operator fails to install CSM Replication on the remote cluster](https://github.com/dell/csm/issues/988)
- [#989 - [BUG]: Allow volume prefix to be set via CSM operator](https://github.com/dell/csm/issues/989)
- [#990 - [BUG]: X_CSI_AUTH_TYPE cannot be set in CSM Operator](https://github.com/dell/csm/issues/990)
- [#1110 - [BUG]: Multi Controller defect - sidecars timeout](https://github.com/dell/csm/issues/1110)
- [#1117 - [BUG]: Operator crashes when deployed from OpenShift with OLM](https://github.com/dell/csm/issues/1117)
- [#1120 - [BUG]: Skip Certificate Validation is not propagated to Authorization module in CSM Operator](https://github.com/dell/csm/issues/1120)
- [#1122 - [BUG]: CSM Operator does not calculate status correctly when module is deployed with driver](https://github.com/dell/csm/issues/1122)
- [#1103 - [BUG]: CSM Operator doesn't apply fSGroupPolicy value to CSIDriver Object](https://github.com/dell/csm/issues/1103)
- [#1133 - [BUG]: CSM Operator does not calculate status correctly when application-mobility is deployed by itself](https://github.com/dell/csm/issues/1133))
- [#1137 - [BUG]: CSM Operator intermittently does not calculate status correctly when deploying a driver](https://github.com/dell/csm/issues/1137))
- [#1143 - [BUG]: CSM Operator does not calculate status correctly when deploying the authorization proxy server](https://github.com/dell/csm/issues/1143))
- [#1146 - [BUG]: CSM Operator does not calculate status correctly when deploying observability with csi-powerscale](https://github.com/dell/csm/issues/1146))
- [#1147 - [BUG]: CSM Operator labels csm objects with CSMVersion 1.8.0, an old version](https://github.com/dell/csm/issues/1147))
- [#1156 - [BUG]: CSM object in success state when all CSI Powerflex pods are failing due to bad secret credentials](https://github.com/dell/csm/issues/1156))
- [#1157 - [BUG]: If Authorization Proxy Server is installed in an alternate namespace by CSM Operator, the deployment fails](https://github.com/dell/csm/issues/1157))
- [#1159 - [BUG]: CSM status is not always accurate when Observability installed with only one or two components](https://github.com/dell/csm/issues/1159))
- [#1152 - [BUG]: CSI driver changes to facilitate SDC brownfield deployments](https://github.com/dell/csm/issues/1152))
- [#1171 - [BUG]: CSM object occasionally stays in failed state when app-mobility is successfully deployed with csm-operator](https://github.com/dell/csm/issues/1171))
- [#1189 - [BUG]: Change the Apex Connectivity Client access to the kube-proxy port to only connections within the client pod](https://github.com/dell/csm/issues/1189))
- [#1190 - [BUG]: Change Apex Connectivity Client access to secrets to only the secrets it needs to manage](https://github.com/dell/csm/issues/1190))

### Known Issues
| Issue | Workaround |
|-------|------------|
| The status field of a csm object as deployed by CSM Operator may, in limited cases, display an incorrect status for a deployment. | As a workaround, the health of the deployment can be determined by checking the health of the pods. |
| When CSM Operator creates a deployment that includes secrets (e.g., application-mobility, observability, cert-manager, velero), these secrets are not deleted on uninstall and will be left behind. For example, the `karavi-topology-tls`, `otel-collector-tls`, and `cert-manager-webhook-ca` secrets will not be deleted. | This should not cause any issues on the system, but all secrets present on the cluster can be found with `kubectl get secrets -A`, and any unwanted secrets can be deleted with `kubectl delete secret -n <secret-namespace> <secret-name>`|
| CSM Operator does not support dynamic namespaces for Authorization. Despite successful installation in a namespace other than "authorization", errors may arise during volume creation. | Use the default namespace "authorization" for installing Authorization using CSM Operator|
| The images of sideCars are currently missing in the sample YAMLs in the offline bundle. As a consequence, the csm-operator is pulling them from registry.k8s.io. | We recommend manually updating the images of sideCars in the sample YAML file, for example, `storage_csm_powerflex_v291.yaml`, before proceeding with the driver installation. Here is an example snippet for the sideCars section in the YAML file:

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
