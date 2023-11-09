---
title: CSI to CSM Operator Migration
description: >
  Migrating from CSI Operator to CSM Operator
---

## CR Sample Files

{{<table "table table-striped table-bordered table-sm">}}
|            |    CSI Operator     |    CSM Operator     |
|------------|:----------:|:----------:|
| PowerScale |    [isilon_v270_k8s_127.yaml](https://github.com/dell/dell-csi-operator/blob/main/samples/isilon_v270_k8s_127.yaml)    |     [storage_csm_powerscale_v280.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerscale_v280.yaml)       |
| PowerMax   |    [powermax_v270_k8s_127.yaml](https://github.com/dell/dell-csi-operator/blob/main/samples/powermax_v270_k8s_127.yaml)    |     [storage_csm_powermax_v280.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powermax_v280.yaml)       |
| PowerStore |    [powerstore_v270_k8s_127.yaml](https://github.com/dell/dell-csi-operator/blob/main/samples/powerstore_v270_k8s_127.yaml)    |     [storage_csm_powerstore_v290.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerstore_v290.yaml)       |
| Unity XT      |    [unity_v270_k8s_127.yaml](https://github.com/dell/dell-csi-operator/blob/main/samples/unity_v270_k8s_127.yaml)    |     [storage_csm_unity_v280.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_unity_v280.yaml)       |
| PowerFlex  |     [vxflex_v270_k8s_127.yaml](https://github.com/dell/dell-csi-operator/blob/main/samples/vxflex_v270_k8s_127.yaml)       |      [storage_csm_powerflex_v290.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerflex_v290.yaml)      |
{{</table>}}

## OpenShift Web Console Migration Steps

1. Save the CR yaml file of the current CSI driver to preserve the settings (for use in step 6). Use the following commands in your cluster to get the CR:
  ```
      kubectl -n <namespace> get <CRD_kind>
      kubectl -n <namespace> get <CRD_kind>/<CR_name> -o yaml
  ```
  Example for CSI Unity:
  ```bash
      kubectl -n openshift-operators get CSIUnity
      kubectl -n openshift-operators get CSIUnity/test-unity -o yaml
  ```
2. Keep the secret and namespace for the driver, as well as the Storage Classes and Volume Snapshot Classes, intact on the cluster
3. Delete the CSI driver through the CSI Operator in the OpenShift Web Console
    - Find the CSI operator under "Operators" -> "Installed Operators"
    - Select the "Dell CSI Operator" and find your installed CSI driver under "All instances"
4. Uninstall the CSI Operator in the OpenShift Web Console
5. Install the CSM Operator in the OpenShift Web Console
    - Search for "Dell" in the OperatorHub
    - Select "Dell Container Storage Modules" and install
6. Install the CSI driver through the CSM Operator in the OpenShift Web Console
    - Select "Create instance" under the provided Container Storage Module API
    - Use the CR backup from step 1 to manually map desired settings to the new CSI driver
    - As the yaml content may differ, ensure the values held in the step 1 CR backup are present in the new CR before installing the new driver