---
title: Resiliency
linkTitle: "Resiliency"

---

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

    **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_{{Var}}_{{< version-docs key="sample_sc_pmax" >}}.yaml) for detailed settings.


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

      Use this command to enable **resilincey protection** on a pod 

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

    Use this command to disable **resilincey** 


    ```bash
    oc edit csm vxflexos -n vxflexos
    ``` 

    Example: 
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
