--- 
title: Powerflex 
linktitle: Powerflex
---

4. Copy only the deployed CSI driver entities to the Observability namespace

    ### PowerFlex

    1. Copy the config Secret from the CSI PowerFlex namespace into the CSM for Observability namespace:

       ```bash

       kubectl get secret vxflexos-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

       If the CSI driver secret name is not the default `vxflexos-config`, please use the following command to copy secret:

       ```bash

       kubectl get secret [VXFLEXOS-CONFIG] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [VXFLEXOS-CONFIG]/name: vxflexos-config/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

    If [CSM for Authorization is enabled](../../authorization-v2.0/#configuring-a-dell-csi-driver-with-csm-for-authorization) for CSI PowerFlex, perform the following steps:

    2. Copy the driver configuration parameters ConfigMap from the CSI PowerFlex namespace into the CSM for Observability namespace:

       ```bash

       kubectl get configmap vxflexos-config-params -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

       If the CSI driver configmap name is not the default `vxflexos-config-params`, please use the following command to copy configmap:

       ```bash

       kubectl get configmap [VXFLEXOS-CONFIG-PARAMS] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [VXFLEXOS-CONFIG-PARAMS]/name: vxflexos-config-params/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

    3. Copy the `karavi-authorization-config`, `proxy-server-root-certificate`, `proxy-authz-tokens` Secret from the CSI PowerFlex namespace into the CSM for Observability namespace:

        ```bash

        kubectl get secret karavi-authorization-config proxy-server-root-certificate proxy-authz-tokens -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
        ```