---
title: CSI to CSM Operator Migration
description: >
  Migrating from CSI Operator to CSM Operator
---

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
2. Map and update the settings from the CR in step 1 to the relevant CSM Operator CR (found in [csm-operator repository](https://github.com/dell/csm-operator/blob/main/samples)).
    - As the yaml content may differ, ensure the values held in the step 1 CR backup are present in the new CR before installing the new driver. CR Samples for [CSI Operator](https://github.com/dell/dell-csi-operator/tree/main/samples) and [CSM Operator](https://github.com/dell/csm-operator/tree/main/samples) can be used to compare and map the differences in attributes.
        - Ex: spec.driver.fsGroupPolicy in [CSI Operator](https://github.com/dell/dell-csi-operator/blob/main/samples/) maps to spec.driver.csiDriverSpec.fSGroupPolicy in [CSM Operator](https://github.com/dell/csm-operator/blob/main/samples/)
3. Retain (or do not delete) the secret, namespace, storage classes, and volume snapshot classes from the original deployment as they will be reused in the CSM operator deployment
4. Uninstall the CR from the CSI Operator
  ```
      kubectl delete <driver_type>/<driver_name> -n <driver_namespace>
  ```
5. Uninstall the CSI Operator itself
    - Instructions can be found [here](../../../deployment/csmoperator/#uninstall)
6. Install the CSM Operator
    - Instructions can be found [here](../../../deployment/csmoperator/#installation)
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
2. Retain (or do not delete) the secret, namespace, storage classes, and volume snapshot classes from the original deployment as they will be reused in the CSM operator deployment
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
    - As the yaml content may differ, ensure the values held in the step 1 CR backup are present in the new CR before installing the new driver. CR Samples for [CSI Operator](https://github.com/dell/dell-csi-operator/tree/main/samples) and [CSM Operator](https://github.com/dell/csm-operator/tree/main/samples) can be used to compare and map the differences in attributes.
        - Ex: spec.driver.fsGroupPolicy in [CSI Operator](https://github.com/dell/dell-csi-operator/blob/main/samples/) maps to spec.driver.csiDriverSpec.fSGroupPolicy in [CSM Operator](https://github.com/dell/csm-operator/blob/main/samples/)
>NOTE: Uninstallation of the driver and the Operator is non-disruptive for mounted volumes. Nonetheless you can not create new volume, snapshot or move a Pod.

## Testing

To test that the new installation is working, please follow the steps outlined [here](../../../csidriver/test) for your specific driver.
