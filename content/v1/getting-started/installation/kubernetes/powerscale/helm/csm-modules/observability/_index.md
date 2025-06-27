---
title: Observability
linktitle: Observability 
no_list: true 
weight: 3
description: >
  Container Storage Modules (CSM) for Observability Helm deployment
--- 

{{< accordion id="One" title="Helm" markdown="true" >}} 
{{<include file="content/v1/getting-started/installation/helm/modules/observability/deployment/installation.md" suffix="1">}} 

{{<include file="content/v1/getting-started/installation/helm/modules/observability/deployment/driver/powerscale.md" suffix="2">}} 

{{<include file="content/v1/getting-started/installation/helm/modules/observability/deployment/configuration/configuration.md" suffix="3" hideIds="1,3,4,5,7">}} 
{{< /accordion >}}
<br> 
{{< accordion id="Two" title="Installer" markdown="true" >}} 
{{<include file="content/v1/getting-started/installation/helm/modules/observability/installer.md" suffix="4" hideIds="1,3">}}
{{< /accordion >}} 

{{< accordion id="Three" title="Offline" markdown="true" >}} 
{{<include file="content/v1/getting-started/installation/offline/observability.md" hideIds="1,2,4,5,7" suffix="5" Var="powerscale">}}
{{< /accordion >}}


{{< cardcontainer >}}

      {{< customcard  link="./postinstallation"   title="Post Installation">}} 

{{< /cardcontainer >}}
