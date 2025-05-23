---
---

4. Copy only the deployed CSI driver entities to the Observability namespace
    ### PowerScale

    1. Copy the config Secret from the CSI PowerScale namespace into the Container Storage Modules Observability namespace:

       ```bash
       kubectl get secret isilon-creds -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

       If the CSI driver secret name is not the default `isilon-creds`, please use the following command to copy secret:

       ```bash
       kubectl get secret [ISILON-CREDS] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [ISILON-CREDS]/name: isilon-creds/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

    If [Container Storage Modules for Authorization is enabled](v1/getting-started/installation/helm/modules/authorizationv2-0#configuring-a-dell-csi-driver-with-container-storage-module-for-authorization) for CSI PowerScale, perform these steps:

    2. Copy the driver configuration parameters ConfigMap from the CSI PowerScale namespace into the Container Storage Modules Observability namespace:

       ```bash
       kubectl get configmap isilon-config-params -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

       If the CSI driver configmap name is not the default `isilon-config-params`, please use the following command to copy configmap:

       ```bash
       kubectl get configmap [ISILON-CONFIG-PARAMS] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [ISILON-CONFIG-PARAMS]/name: isilon-config-params/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

    3. Copy the `karavi-authorization-config`, `proxy-server-root-certificate`, `proxy-authz-tokens` Secret from the CSI PowerScale namespace into the CSM for Observability namespace:

       ```bash
       kubectl get secret karavi-authorization-config proxy-server-root-certificate proxy-authz-tokens -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | sed 's/name: karavi-authorization-config/name: isilon-karavi-authorization-config/' | sed 's/name: proxy-server-root-certificate/name: isilon-proxy-server-root-certificate/' | sed 's/name: proxy-authz-tokens/name: isilon-proxy-authz-tokens/' | kubectl create -f -
       ```