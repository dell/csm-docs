--- 
 
--- 


4. Copy only the deployed CSI driver entities to the Observability namespace
    ### PowerMax

    1. Copy the configmap `powermax-reverseproxy-config` from the CSI Driver for PowerMax namespace to the CSM namespace.

       ```bash
       kubectl get configmap powermax-reverseproxy-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

       If the CSI driver configmap name is not the default `powermax-reverseproxy-config`, please use the following command to copy configmap:

       ```bash
       kubectl get configmap [POWERMAX-REVERSEPROXY-CONFIG] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [POWERMAX-REVERSEPROXY-CONFIG]/name: powermax-reverseproxy-config/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

    2. Copy the secrets in `powermax-reverseproxy-config` from the CSI Driver for PowerMax namespace to the CSM namespace.
       ```console
       for secret in $(kubectl get configmap powermax-reverseproxy-config -n [CSI_DRIVER_NAMESPACE] -o jsonpath="{.data.config\.yaml}" | grep arrayCredentialSecret | awk 'BEGIN{FS=":"}{print $2}' | uniq)
       do
          kubectl get secret $secret -n [CSI_DRIVER_NAMESPACE] -o yaml | sed "s/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/" | kubectl create -f -
       done
       ```

       If the CSI driver configmap name is not the default `powermax-reverseproxy-config`, please use the following command to copy secrets:
       ```console
       for secret in $(kubectl get configmap [POWERMAX-REVERSEPROXY-CONFIG] -n [CSI_DRIVER_NAMESPACE] -o jsonpath="{.data.config\.yaml}" | grep arrayCredentialSecret | awk 'BEGIN{FS=":"}{print $2}' | uniq)
       do
          kubectl get secret $secret -n [CSI_DRIVER_NAMESPACE] -o yaml | sed "s/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/" | kubectl create -f -
       done
       ```

       If [Container Storage Modules for Authorization is enabled](v1/getting-started/installation/helm/modules/authorizationv2-0#configuring-a-dell-csi-driver-with-container-storage-module-for-authorization) for CSI PowerMax, perform these steps:

    3. Copy the driver configuration parameters ConfigMap from the CSI PowerMax namespace into the Container Storage Modules Observability namespace:

       ```bash
       kubectl get configmap powermax-config-params -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

       If the CSI driver configmap name is not the default `powermax-config-params`, please use the following command to copy configmap:

       ```bash
       kubectl get configmap [POWERMAX-CONFIG-PARAMS] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [POWERMAX-CONFIG-PARAMS]/name: powermax-config-params/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

    4. Copy the `karavi-authorization-config`, `proxy-server-root-certificate`, `proxy-authz-tokens` Secret from the CSI PowerMax namespace into the Container Storage Modules Observability namespace:

       ```bash
       kubectl get secret karavi-authorization-config proxy-server-root-certificate proxy-authz-tokens -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | sed 's/name: karavi-authorization-config/name: powermax-karavi-authorization-config/' | sed 's/name: proxy-server-root-certificate/name: powermax-proxy-server-root-certificate/' | sed 's/name: proxy-authz-tokens/name: powermax-proxy-authz-tokens/' | kubectl create -f -
       ```
