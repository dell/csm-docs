---
title: "Kubernetes"
linkTitle: "Kubernetes"
no_list: true
description: Kubernetes Installation
weight: 1
---
Kubernetes provides a powerful platform for managing containerized applications, and it extends its capabilities to storage management through the use of Container Storage Interface (CSI) drivers. Dell Technologies offers a range of CSI drivers that integrate seamlessly with Kubernetes, enabling efficient and scalable storage solutions for various Dell storage platforms.

The Dell CSI drivers allow Kubernetes to manage storage resources dynamically, providing features such as persistent volume provisioning, snapshotting, and cloning. These drivers are designed to work with Dell’s storage systems, including PowerScale, PowerFlex, and XtremIO, among others.

Using Kubernetes to install and manage Dell CSI drivers involves deploying the Dell Container Storage Modules (CSM) Operator. This operator simplifies the installation and management of CSI drivers by leveraging Kubernetes Custom Resource Definitions (CRDs) and controllers. The CSM Operator ensures that the CSI drivers are correctly configured and maintained, providing a robust and reliable storage solution for your Kubernetes clusters12.

<div class="container mt-5">
    <div class="row">
      <div class="col-md-6 mb-4">
    {{< customcard  path="content/docs/setup/installation/kubernetes/powermax" link="./powermax" icon="fas fa-star" title="PowerMax" >}}
      </div>
      <div class="col-md-6 mb-4">
       {{< customcard path="content/docs/setup/installation/powerscale" link="./powerscale" icon="fas fa-search" title="PowerScale" >}}
       </div>
    </div>
       <div class="row">
      <div class="col-md-6 mb-4">
      {{< customcard path="content/docs/setup/installation/kubernetes/powerstore" link="./powerstore" icon="fas fa-cloud" title="PowerStore">}}
      </div>
      <div class="col-md-6 mb-4">
        {{< customcard path="content/docs/setup/installation/kubernetes/powerstore" link="./powerflex" icon="fas fa-pencil" title="PowerFlex">}} 
        </div>
    </div> 
    <div class="row">
      <div class="col-md-6 mb-4">
          {{< customcard path="content/docs/setup/installation/kubernetes/powerstore" link="./unityxt" icon="fas fa-lock" title="Unity XT">}}
        </div>  
      </div>
</div>
