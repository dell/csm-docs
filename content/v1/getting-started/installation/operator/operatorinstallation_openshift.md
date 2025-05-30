---
title: "Operator"
linktitle: "Operator"
description: Container Storage Modules Operator
toc_hide: true 
weight: 2
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}
The Dell Container Storage Modules Operator is a Kubernetes Operator, which can be used to install and manage the CSI Drivers and CSM Modules provided by Dell for various storage platforms. This operator is available as a community operator for upstream Kubernetes and can be deployed using OperatorHub.io. The operator can be installed using OLM (Operator Lifecycle Manager) or manually.

## Supported CSM Components

These CR will be used for new deployment or upgrade. In most case, it is recommended to use the latest available version.

The full compatibility matrix of CSI/CSM versions for the CSM Operator is available [here](../../../supportmatrix/#operator-compatibility-matrix)

## Installation

Before installing the driver, you need to install the operator. You can find the installation instructions here.


### OpenShift Installation via Operator Hub
<!--
>NOTE: You can update the resource requests and limits when you are deploying operator using Operator Hub

`dell-csm-operator` can be installed via Operator Hub on upstream Kubernetes clusters & Red Hat OpenShift Clusters.

The installation process involves the creation of a `Subscription` object either via the _OperatorHub_ UI or using `kubectl/oc`. While creating the `Subscription` you can set the Approval strategy for the `InstallPlan` for the operator to:

* _Automatic_ - If you want the operator to be automatically installed or upgraded (once an upgrade is available).
* _Manual_ - If you want a cluster administrator to manually review and approve the `InstallPlan` for installation/upgrades.

![OpenShit Operator Hub CSM install](./../../../../../images/deployment/operator_hub_install.gif) 
--> 
>NOTE: You can update the resource requests and limits when you are deploying operator using Operator Hub

1. From your OpenShift UI, select **OperatorHub** in the left pane. 

2. On the **OperatorHub** page, search for “Container Storage Modules” and select the **Container Storage Modules** card: 

   <img src="/csm-docs/images/deployment/operator/operatorhub_page.png" > 

3. Select the **appropriate** operator version and click on **install**.

   <img src="/csm-docs/images/deployment/operator/operator_version.png" style="border:1px solid black">  

   **Contained storage module** Operator begins to install and takes you to the **Install Operator** page.  

   On this page: 
    * Select the **A specific namespace on the cluster** option for **Installation mode**. 
    * Choose the **Create Project** option from the **Installed Namespace** dropdown. 

4. In the **Create Project window**, provide the name dell-csm-operator and click **Create** to create a namespace called **“dell-csm-operator”**. 

   <img src="/csm-docs/images/deployment/operator/create_project.png"> 

   * To install an operator, you need to create a Subscription object. You can do this using either the OperatorHub UI or kubectl/oc commands. During this process, you can set the Approval strategy for the InstallPlan 

   * **Automatic** - If you want the operator to be automatically installed or upgraded (once an upgrade is available). 

   * **Manual** - If you want a cluster administrator to manually review and approve the InstallPlan for installation/upgrades.  

   <img src="/csm-docs/images/deployment/operator/install_operator.png" style="border:1px solid black">  

5. Click **Install** to deploy Container Storage Modules Operator in the dell-csm-operator namespace.  

   <img src="/csm-docs/images/deployment/operator/installing_operator.png" >

   <img src="/csm-docs/images/deployment/operator/installing_operator1.png" style="border:1px solid black">   

6. Once the operator is installed it will be displayed under the **“Installed Operators”**. 
   
   <img src="/csm-docs/images/deployment/operator/installed_operator.png" style="border: 1px solid black">

>Note

- If your environment has more than 1000 Pods, the Container Storage Modules Operator may need more resources. You can adjust the default CPU and memory settings in deploy/operator.yaml and config/manager/manager.yaml. For more details on setting resource requests and limits, refer to the [documentation](https://sdk.operatorframework.io/docs/best-practices/managing-resources/). The current default values are listed below

    ```yaml
        resources:
          limits:
            cpu: 200m
            memory: 512Mi
          requests:
            cpu: 100m
            memory: 192Mi
    ```
- If using **CSM Replication** with two clusters and no DNS, edit `deploy/operator.yaml` to add `hostAliases` with `<FQDN>:<IP>` mappings under `spec.template.spec` to resolve remote API endpoints. More details on host aliases are available in the [documentation](https://kubernetes.io/docs/tasks/network/customize-hosts-file-for-pods/).
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: dell-csm-operator-controller-manager
    spec:
      template:
        spec:
          hostAliases:
          - hostnames:
            - "remote.FQDN"
            ip: "255.255.255.1"
   ```

### Certified vs Community

Dell CSM Operator is distributed as both `Certified` & `Community` editions.

Both editions have the same codebase and are supported by Dell Technologies, the only differences are:

* The `Certified` version is officially supported by Redhat by partnering with software vendors.
* The `Certified` version is often released couple of days/weeks after the `Community` version.
* The `Certified` version is specific to Openshift and can only be installed on specific Openshift versions where it is certified.
* The `Community` can be installed on any Kubernetes distributions.
