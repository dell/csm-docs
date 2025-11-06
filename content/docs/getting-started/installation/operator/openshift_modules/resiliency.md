---
title: Resiliency
linkTitle: "Resiliency"

---

1. #### Enable Resiliency Module

    <br>

    Use this command to create the **ContainerStorageModule Custom Resource** with Resiliency:

    ```bash
    oc create -f csm-{{labels}}.yaml
    ```

    Example:

    <div style="margin-bottom:-1.8rem">

    ```yaml
    cat << EOF > csm-{{labels}}.yaml
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
      name: {{labels}}
      namespace: {{labels}}
    spec:
      driver:
        csiDriverType: "{{Var}}"
        configVersion: {{< version-docs key="PFlex-latestVersion" >}}
      modules:
      - name: resiliency
        enabled: true
    EOF
    ```
    </div>

    **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/release/{{< version-docs key="csm-operator_latest_version">}}/samples/storage_csm_{{Var}}_{{< version-docs key="sample_sc_pmax" >}}.yaml) for detailed settings.


    <br>

    Check if Resiliency module successfully installed:

    ```terminal
    oc get pod -n {{Var}}

    NAME                                     READY   STATUS    RESTARTS   AGE
    {{Var}}-controller-5bcb5ff8cb-fjdmf   6/6     Running   0          55s
    {{Var}}-controller-5bcb5ff8cb-n7j79   6/6     Running   0          55s
    {{Var}}-node-j4jsz                    3/3     Running   0          55s
    {{Var}}-node-xmrf8                    3/3     Running   0          34s
    ```

    <br>

    Verify the Resiliency Sidecar are displayed  in controller pod:

    ```terminal
    oc get pod {{Var}}-controller-5bcb5ff8cb-fjdmf -o jsonpath='{.spec.containers[*].name}'

    podmon attacher provisioner snapshotter resizer driver
    ```
    <br>

    Verify the Resiliency Sidecar are displayed  in node pod:

    ```terminal
    oc get pod {{Var}}-node-j4jsz -o jsonpath='{.spec.containers[*].name}'

    podmon driver registrar
    ```

<br>

2. #### Protect Pods with Resiliency Module

      <br>

      Use this command to enable **resiliency protection** on a pod 

      ```terminal
      oc label pods pod-{{labels}} podmon.dellemc.com/driver=csi-{{labels}} 

      pod/pod-{{labels}} labeled
      ```
      <br>

      Verify:

      ```terminal
      oc get pods -l podmon.dellemc.com/driver=csi-{{labels}} 

      NAME             READY   STATUS    RESTARTS   AGE
      pod-{{labels}}   1/1     Running   0          5m11s
      ``` 
      <br>

      Disable resiliency protection on a pod:

      ```terminal
      oc label pods pod-{{labels}} podmon.dellemc.com/driver-
      
      pod/pod-{{labels}} unlabeled
      ```
<br>

3. #### Disabling Resiliency Module

    <br>

    Use this command to disable **resiliency**


    ```bash
    oc edit csm {{labels}} -n {{labels}}
    ```

    Example:
    ```bash
    apiVersion: storage.dell.com/v1
    kind: ContainerStorageModule
    metadata:
      name: {{labels}}
      namespace: {{labels}}
    spec:
      driver:
        csiDriverType: "{{Var}}"
        configVersion: {{< version-docs key="PFlex-latestVersion" >}}
      modules:
      - name: resiliency
        enabled: false
    ```
