---
title: "VMware Tanzu"
Description: "About VMware Tanzu basic" 
---
 
The CSI Driver for Dell EMC Unity and PowerScale supports VMware Tanzu and deployment of these Tanzu clusters is done using the VMware Tanzu supervisor cluster and supervisor namespace.

Currently, VMware Tanzu with normal configuration(without NAT) supports Kubernetes 1.20. 
The CSI driver can be installed on  this cluster using Helm. Installation of CSI drivers in Tanzu via Operator has not been qualified.

To login to the Tanzu cluster, download kubectl and kubectl vsphere binaries to any of the system
 
Refer: https://docs.vmware.com/en/VMware-vSphere/7.0/vmware-vsphere-with-tanzu/GUID-0F6E45C4-3CB1-4562-9370-686668519FCA.html 

Connect to the VCenter using kubectl vSphere commands as shown below.

    kubectl vsphere login --insecure-skip-tls-verify --vsphere-username vSphere username --server=https://<tanzu-server-ip>/ -v 5

Once login is done to the Tanzu cluster, the installation of CSI driver is done using kubectl binary similar to how we do for other systems.

## Tanzu example

![](../tanzu1.JPG)

![](../tanzu2.JPG)

![](../tanzu3.JPG)

![](../tanzu4.JPG)
