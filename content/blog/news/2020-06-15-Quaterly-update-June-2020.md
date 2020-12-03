
---
title: "June 2020 Dell storage enablers big update !"
linkTitle: "June 2020 Dell storage enablers big update !"
date: 2020-06-15
---

Every quarter Dell Technologies ships new versions of his CSI Drivers and Ansible modules.

---
Dell EMC has anounced new set of CSI Drivers for their storage arrays. Some highliths for these June 2020 releases:
* Qualifications for OpenShift 4.3 and Kubernetes 1.16 for all the drivers
* Easy upgrade with the CSI Operator for all the drivers
* Helm 3 support for all the drivers
* Multi-array support for PowerMax and Unity
* NFS support for Unity
* Volume expansion for Isilon
* Volume cloning for PowerMax
* [CHAP for PowerMax](https://www.dellemc.com/resources/en-us/asset/white-papers/products/storage/h14531-dell-emc-powermax-iscsi-implementation.pdf)


---
For the Ansible modules you will have:
* a brand new [Ansible module for Unity](https://github.com/dell/ansible-unity)<i class="fab fa-github"></i> !
* [Ansible for Isilon v1.1](https://github.com/dell/ansible-isilon)<i class="fab fa-github"></i> brings support for `SmartQuotas` and is compatible with next OneFS major version.

---
For more details you can check :
* The product guides and release notes in the repositories for [csi-powermax v1.3](https://github.com/dell/csi-powermax/)<i class="fab fa-github"></i>, [csi-isilon v1.2](https://github.com/dell/csi-isilon)<i class="fab fa-github"></i>, [csi-unity v1.2](https://github.com/dell/csi-unity), [csi-vxflexos v1.1.5](https://github.com/dell/csi-vxflexos)<i class="fab fa-github"></i>, [ansible-unity v1.0](https://github.com/dell/ansible-unity)<i class="fab fa-github"></i> and [ansible-isilon v1.1](https://github.com/dell/ansible-isilon)<i class="fab fa-github"></i>
* The FAQs on on [Dell container community website](https://www.dell.com/community/Containers/)<i class="fas fa-laptop-code"></i>:
  * [FAQ for CSI Driver for PowerMax](https://www.dell.com/community/Containers/FAQ-CSI-Driver-for-PowerMax/m-p/7377675/highlight/true#M38)<i class="fas fa-laptop-code"></i>
  * [FAQ for CSI Driver for Unity](https://www.dell.com/community/Containers/FAQ-CSI-Driver-for-Unity/m-p/7422312/highlight/true#M45)<i class="fas fa-laptop-code"></i>
  * [FAQ for CSI Driver for VxFlexOS](https://www.dell.com/community/Containers/FAQ-CSI-Driver-for-VxFlexOS/m-p/7285716/highlight/true#M5)<i class="fas fa-laptop-code"></i>
  * [FAQ for CSI Driver for Isilon](https://www.dell.com/community/Containers/FAQ-CSI-Driver-for-Isilon-v1-1/m-p/7430920/highlight/true#M50)<i class="fas fa-laptop-code"></i>
  * [FAQ for Ansible Isilon](https://www.dell.com/community/Containers/FAQ-Ansible-Module-for-Dell-EMC-Isilon/m-p/7624604/highlight/true#M170)<i class="fas fa-laptop-code"></i>
