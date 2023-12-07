---
title: CSI to CSM Operator Migration
description: >
  Migrating from CSI Operator to CSM Operator
---

## CR Sample Files

{{<table "table table-striped table-bordered table-sm">}}
|            |    CSI Operator     |    CSM Operator     |
|------------|:----------:|:----------:|
| PowerScale |    [isilon_v270_k8s_127.yaml](https://github.com/dell/dell-csi-operator/blob/main/samples/isilon_v270_k8s_127.yaml)    |     [storage_csm_powerscale_v290.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerscale_v290.yaml)       |
| PowerMax   |    [powermax_v270_k8s_127.yaml](https://github.com/dell/dell-csi-operator/blob/main/samples/powermax_v270_k8s_127.yaml)    |     [storage_csm_powermax_v290.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powermax_v290.yaml)       |
| PowerStore |    [powerstore_v270_k8s_127.yaml](https://github.com/dell/dell-csi-operator/blob/main/samples/powerstore_v270_k8s_127.yaml)    |     [storage_csm_powerstore_v290.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerstore_v290.yaml)       |
| Unity XT      |    [unity_v270_k8s_127.yaml](https://github.com/dell/dell-csi-operator/blob/main/samples/unity_v270_k8s_127.yaml)    |     [storage_csm_unity_v290.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_unity_v290.yaml)       |
| PowerFlex  |     [vxflex_v270_k8s_127.yaml](https://github.com/dell/dell-csi-operator/blob/main/samples/vxflex_v270_k8s_127.yaml)       |      [storage_csm_powerflex_v290.yaml](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powerflex_v290.yaml)      |
{{</table>}}
>NOTE: Sample files refer to the latest version for each platform. If you do not want to upgrade, please find your preferred version in the [csm-operator repository](https://github.com/dell/csm-operator/blob/main/samples).

## Migration Steps

1. Save the CR yaml file of the current CSI driver to preserve the settings. Use the following commands in your cluster to get the CR:
  ```
      kubectl -n <namespace> get <CRD_kind>
      kubectl -n <namespace> get <CRD_kind>/<CR_name> -o yaml
  ```
  Example for CSI Unity:
  ```
      kubectl -n openshift-operators get CSIUnity
      kubectl -n openshift-operators get CSIUnity/test-unity -o yaml
  ```
2. Map and update the settings from the CR in step 1 to the relevant CSM Operator CR
    - As the yaml content may differ, ensure the values held in the step 1 CR backup are present in the new CR before installing the new driver. CR Samples table provided above can be used to compare and map the differences in attributes between Dell CSI Operator and CSM Operator CRs
        - Ex: spec.driver.fsGroupPolicy in [CSI Operator](https://github.com/dell/dell-csi-operator/blob/main/samples/) maps to spec.driver.csiDriverSpec.fSGroupPolicy in [CSM Operator](https://github.com/dell/csm-operator/blob/main/samples/)
3. Retain (or do not delete) the secret, namespace, storage classes, and volume snapshot classes from the original deployment as they will be re-used in the CSM operator deployment
4. Uninstall the CR from the CSI Operator
  ```
      kubectl delete <driver_type>/<driver_name> -n <driver_namespace>
  ```
5. Uninstall the CSI Operator itself
    - Instructions can be found [here](../../../../deployment/csmoperator/#uninstall)
6. Install the CSM Operator
    - Instructions can be found [here](../../../../deployment/csmoperator/#installation)
7. Install the CR updated in step 2
    - Instructions can be found [here](../#installing-csi-driver-via-operator)
>NOTE: Uninstallation of the driver and the Operator is non-disruptive for mounted volumes. Nonetheless you can not create new volume, snapshot or move a Pod.

## OpenShift Web Console Migration Steps

1. Save the CR yaml file of the current CSI driver to preserve the settings (for use in step 6). Use the following commands in your cluster to get the CR:
  ```
      kubectl -n <namespace> get <CRD_kind>
      kubectl -n <namespace> get <CRD_kind>/<CR_name> -o yaml
  ```
  Example for CSI Unity:
  ```
      kubectl -n openshift-operators get CSIUnity
      kubectl -n openshift-operators get CSIUnity/test-unity -o yaml
  ```
2. Retain (or do not delete) the secret, namespace, storage classes, and volume snapshot classes from the original deployment as they will be re-used in the CSM operator deployment
3. Delete the CSI driver through the CSI Operator in the OpenShift Web Console
    - Find the CSI operator under *Operators* -> *Installed Operators*
    - Select the *Dell CSI Operator* and find your installed CSI driver under *All instances*
4. Uninstall the CSI Operator in the OpenShift Web Console
5. Install the CSM Operator in the OpenShift Web Console
    - Search for *Dell* in the OperatorHub
    - Select *Dell Container Storage Modules* and install
6. Install the CSI driver through the CSM Operator in the OpenShift Web Console
    - Select *Create instance* under the provided Container Storage Module API
    - Use the CR backup from step 1 to manually map desired settings to the new CSI driver
    - As the yaml content may differ, ensure the values held in the step 1 CR backup are present in the new CR before installing the new driver
        - Ex: spec.driver.fsGroupPolicy in [PowerMax 2.7 for CSI Operator](https://github.com/dell/dell-csi-operator/blob/main/samples/powermax_v270_k8s_127.yaml#L17C5-L17C18) maps to spec.driver.csiDriverSpec.fSGroupPolicy in [PowerMax 2.7 for CSM Operator](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_powermax_v270.yaml#L28C7-L28C20)
>NOTE: Uninstallation of the driver and the Operator is non-disruptive for mounted volumes. Nonetheless you can not create new volume, snapshot or move a Pod.

## Testing

To test that the new installation is working, please follow the steps outlined [here](../../test) for your specific driver.
