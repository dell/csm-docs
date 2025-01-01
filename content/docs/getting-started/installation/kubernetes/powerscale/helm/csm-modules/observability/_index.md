---
title: Observability
linktitle: Observability 
no_list: true 
weight: 3
description: >
  Container Storage Modules (CSM) for Observability Helm deployment
--- 
<!--
<br>
{{<include "content/docs/getting-started/installation/helm/modules/observability/_index.md">}}
--> 
{{< accordion id="One" title="Helm" markdown="true" >}} 
{{<includee file="content/docs/getting-started/installation/helm/modules/observability/deployment/installation.md" suffix="1">}} 

{{<includee file="content/docs/getting-started/installation/helm/modules/observability/deployment/driver/powerscale.md" suffix="2">}} 

{{<includee file="content/docs/getting-started/installation/helm/modules/observability/deployment/configuration/configuration.md" suffix="3">}} 
{{< /accordion >}}
<br> 
{{< accordion id="Two" title="Installer" markdown="true" >}} 
{{<includee file="content/docs/getting-started/installation/helm/modules/observability/installer.md" suffix="4">}}
{{< /accordion >}} 

{{< accordion id="Three" title="Offline" markdown="true" >}} 
{{<includee file="content/docs/getting-started/installation/offline/observability.md" hideIds="1,2,4" suffix="5" Var="powerscale">}}
{{< /accordion >}}


{{< cardcontainer >}}

      {{< customcard  link="./postinstallation"   title="Post Installation">}} 

{{< /cardcontainer >}}
