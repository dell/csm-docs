---
---

4. Copy only the deployed CSI driver entities to the Observability namespace
    ### PowerStore

    1. Copy the config Secret from the CSI PowerStore namespace into the Container Storage Modules Observability namespace:

       ```bash
       kubectl get secret powerstore-config -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```

       If the CSI driver secret name is not the default `powerstore-config`, please use the following command to copy secret:

       ```bash
       kubectl get secret [POWERSTORE-CONFIG] -n [CSI_DRIVER_NAMESPACE] -o yaml | sed 's/name: [POWERSTORE-CONFIG]/name: powerstore-config/' | sed 's/namespace: [CSI_DRIVER_NAMESPACE]/namespace: [CSM_NAMESPACE]/' | kubectl create -f -
       ```
