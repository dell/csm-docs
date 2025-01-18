---
title: Resiliency
linkTitle: "Resiliency"

---

<!--
The Container Storage Module Operator installs the Resiliency module for supported Dell CSI Drivers, deploying the Resiliency sidecar.

## Prerequisite

The Resiliency module only acts on pods with a specific label. At startup, it logs the label key and value. Apply this label to the StatefulSet you want monitored

 ```yaml
 labelSelector: {map[podmon.dellemc.com/driver:csi-{{labels}}]}
 ```

 The above message indicates the key is: `podmon.dellemc.com/driver` and the label value is `{{labels}}`. To search for the pods that would be monitored, try this:

 ```bash
 kubectl get pods -A -l podmon.dellemc.com/driver=csi-{{labels}}
 ```

 User must follow all the prerequisites of the respective drivers before enabling this module.

## How to enable this module

<!--To enable this module, user should choose the sample file for the respective driver for specific version. By default, the module is disabled but this can be enabled by setting the enabled flag to `true` in the sample file.
--> 
 <!--
Resiliency can be enabled by following sample file 
```yaml
  - name: resiliency
      enabled: true
```

**Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_{{Var}}_v2130.yaml) for detailed settings.

### Storage Array Upgrades

- Disable the Resiliency module during storage array upgrades, even if advertised as non-disruptive.
- This prevents application pods from getting stuck in a Pending state.
- If nodes lose connectivity with the array, Resiliency deletes pods on affected nodes and tries to move them to healthy nodes.
- If all nodes are affected, pods will remain in a Pending state.

--> 


1. #### Enable Resiliency Module   
    
    <br> 

    Use this command to create the **ContainerStorageModule Custom Resource** with Resiliency: 

    ```bash 
    oc create -f csm-vxflexos.yaml
    ```

    Example: 

    <div style="margin-bottom:-1.8rem">

    ```yaml  
    cat << EOF > csm-vxflexos.yaml
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
      name: vxflexos
      namespace: vxflexos
    spec:
      driver:
        csiDriverType: "powerflex"
        configVersion: v2.12.0
      modules:
      - name: resiliency
        enabled: true  
    EOF
    ``` 
    </div>  

    **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_{{Var}}_v2130.yaml) for detailed settings.


    <br>
    
    Check if Resiliency module successfully installed:

    ```terminal
    oc get pod -n powerflex

    NAME                                    READY   STATUS    RESTARTS   AGE
    powerflex-controller-5bcb5ff8cb-fjdmf   6/6     Running   0          55s
    powerflex-controller-5bcb5ff8cb-n7j79   6/6     Running   0          55s
    powerflex-node-j4jsz                    3/3     Running   0          55s
    powerflex-node-xmrf8                    3/3     Running   0          34s
    ```

    <br>

    Verify the Resiliency Sidecar are displayed  in controller pod: 

    ```terminal 
    oc get pod powerflex-controller-5bcb5ff8cb-fjdmf -o jsonpath='{.spec.containers[*].name}'

    podmon attacher provisioner snapshotter resizer driver
    ``` 
    <br>

    Verify the Resiliency Sidecar are displayed  in node pod:

    ```terminal   
    oc get pod powerflex-node-j4jsz -o jsonpath='{.spec.containers[*].name}'

    podmon driver registrar
    ``` 

<br>

2. #### Protect Pods with Resiliency Module  
     
      <br>

      Use this comand to enable **resilincey protection** on a pod 

      ```terminal
      oc label pods pod-vxflexos podmon.dellemc.com/driver=csi-vxflexos 

      pod/pod-vxflexos labeled
      ``` 
      <br>

      Verify: 

      ```terminal
      oc get pods -l podmon.dellemc.com/driver=csi-vxflexos 

      NAME           READY   STATUS    RESTARTS   AGE                                                                                                          
      pod-vxflexos   1/1     Running   0          5m11s
      ``` 
      <br>
       
      Disable resiliency protection on a pod: 

      ```terminal
      oc label pods pod-vxflexos podmon.dellemc.com/driver-
      
      pod/pod-vxflexos unlabeled
      ```
<br>

3. #### Disabling Resiliency Module 

    <br> 

    Use this comand to disable **resilincey** 


    ```bash
    oc edit csm vxflexos -n vxflexos
    ``` 

    Exmple: 
    ```bash
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
      name: vxflexos
      namespace: vxflexos
    spec:
      driver:
        csiDriverType: "powerflex"
        configVersion: v2.12.0
      modules:
      - name: resiliency
        enabled: false
    ```
