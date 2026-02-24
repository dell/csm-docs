---
title: "Component and Image Details"
linkTitle: "Component and Image Details"
weight: 1
---

### Container Storage Modules Component Version

{{<table "table table-striped table-bordered table-sm">}}
| Component | Image Version |
| - | - |
|<div style="text-align:left"> PowerFlex | {{< version-docs key="csi-vxflexos" >}} |
|<div style="text-align:left"> PowerStore | {{< version-docs key="csi-powerstore" >}} |
|<div style="text-align:left"> PowerMax | {{< version-docs key="csi-powermax" >}} |
|<div style="text-align:left"> PowerScale | {{< version-docs key="csi-powerscale" >}} |
|<div style="text-align:left"> Unity XT | {{< version-docs key="csi-powerscale" >}} |
|<div style="text-align:left"> Authorization v2.x |{{< version-docs key="csm-authorization-v2" >}} |
|<div style="text-align:left"> Observability | {{< version-docs key="csm-observability" >}} |
|<div style="text-align:left"> Replication |{{< version-docs key="csm-replication" >}} |
|<div style="text-align:left"> Resiliency | {{< version-docs key="karavi-resiliency" >}} |
|<div style="text-align:left"> COSI | {{< version-docs key="cosi" >}} |
{{</table>}}

### Container Storage Modules Certified Operator 1.11.2 Images

<ul>
{{< collapse id="1" title="PowerStore" show="true">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.11.2 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:0a9a1134690465ffe3963f243ebd912325aa2b34c502585dafce68aeb2543a46 |
| 2.16.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powerstore@sha256:4be94a81d2bfdabacb686d3061ef9b71861f21efd6678b23c418c484dd10d2f9 |
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metrics-powerstore@sha256:e02dbcb245797cbf6c6ad22803ff3c38f5be5690b18502d00af134a9c15531c9 |
| 6.1.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:6b5a502366ecd4ed81bcdc768699fe431ab70437324f5a7883e9f49a5d640863 |
| 4.10.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:8a46d7ecbb798f19d7ccd7e510a2efec00ae7ba50fd82cc2f5ac45cedbab0bc1 |
| 2.15.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:11f199f6bec47403b03cb49c79a41f445884b213b382582a60710b8c6fdc316a |
| 2.0.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:25b17c4f84b0ab061da6397caf407c7251a571df5c4071e4917942684c61689a |
| 8.4.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:c7e0a3718832b6197ce8b29fefb3fed3d84f4fbcdf08f4606140dbec2566501d |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:d54cefd22172c3ece3136ffab83bf988baa7669728bd3d4affae99232bfea8c3 |
| 0.15.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:38082bf43b98f921de25924c4b9b9a0a3d1d27d8c912b9a8cbda8c316798e54b |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-sidecar@sha256:6ae8703e8e1bb3d1728ab58b2306d7f0adab4d1f3b1f1f0a7467c275590e4e13 |
| 1.15.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-podmon@sha256:4f910318b4591ced142ee83ae49706f477f29598bd98010bf09905a3b4edfa40 |
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replicator@sha256:901004afd7968ecb58d9be9c40756b67e51dd3c0a60f041215872b0448839b5d |
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replication-controller-manager@sha256:7d7d9a19b46d0e06fa57af609be29a441d2be63a20cfddb764904c75c187fe5b |
| 0.143.1 |<div style="text-align:left"> ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector@sha256:7a838b2f7a221459a6593b42483c43e7c2a3f86640136c33a436c071c0a410f4 |
| 1.27 |<div style="text-align:left"> quay.io/nginx/nginx-unprivileged@sha256:620c21188bee45c4145dbf1716117994eda3b9426d3d214de37a9468377a15d1 |
{{</table>}}
</div>
</br>

<b> Authorization Proxy Server </b>

<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.11.2 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:0a9a1134690465ffe3963f243ebd912325aa2b34c502585dafce68aeb2543a46 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-proxy@sha256:38d2ad1b4bc75f1d6bb638d0cf22a71dfb9cbfed6e7f93fbc0d026bc2c95d2d7 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-tenant@sha256:16f2540cf1dc278fc285ffe9d063c84e7998f76b99dd8276f1304ecaf2dd99b0 |
| 2.4.0  |<div style="text-align:left">  registry.connect.redhat.com/dell-emc/dell-csm-authorization-role@sha256:c869424c422aa2f1cba1c7ea87cf1304503c00b9b263afb5a018afbbbad629e2 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-storage@sha256:de12e0a30d0cad6d01bfff60634dd50f767368b0727a0afd7faae37a84f02330 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-controller@sha256:c72297f70609bc1ff151acb1216dfca903d73fe9a79c623311ba933cc2f240ec |
| 0.70.0 |<div style="text-align:left"> docker.io/openpolicyagent/opa@sha256:2b1c4b231f6dfa6a2baea4af4109203b10cd4b65e836d72f03bfe5d8dfce7095 |
| 9.2.1  |<div style="text-align:left"> docker.io/openpolicyagent/kube-mgmt@sha256:2c233c59becd9ec59a3f507220a8e837d06226172876adc41ebe1252a57f9fb4 |
| 8.4.0-alpine |<div style="text-align:left"> docker.io/library/redis@sha256:0804c395e634e624243387d3c3a9c45fcaca876d313c2c8b52c3fdf9a912dded |
| 19cd0c49f418 |<div style="text-align:left"> docker.io/rediscommander/redis-commander@sha256:19cd0c49f418779fa2822a0496c5e6516d0c792effc39ed20089e6268477e40a |
{{</table>}}
</div>
{{< /collapse >}}

{{< collapse id="2" title="PowerScale">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.11.2 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:0a9a1134690465ffe3963f243ebd912325aa2b34c502585dafce68aeb2543a46 |
| 2.16.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powerscale@sha256:ecee95824ca006e5824f092ad410af360814b88dc242237c1f2ed792feb83c54 |
| 1.11.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metrics-powerscale@sha256:a1b24f964308efc7d21e0496dbbe602819ac9ef1115899646a058665f3fb83a0 |
| 6.1.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:6b5a502366ecd4ed81bcdc768699fe431ab70437324f5a7883e9f49a5d640863 |
| 4.10.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:8a46d7ecbb798f19d7ccd7e510a2efec00ae7ba50fd82cc2f5ac45cedbab0bc1 |
| 2.15.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:11f199f6bec47403b03cb49c79a41f445884b213b382582a60710b8c6fdc316a |
| 2.0.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:25b17c4f84b0ab061da6397caf407c7251a571df5c4071e4917942684c61689a |
| 8.4.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:c7e0a3718832b6197ce8b29fefb3fed3d84f4fbcdf08f4606140dbec2566501d |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:d54cefd22172c3ece3136ffab83bf988baa7669728bd3d4affae99232bfea8c3 |
| 0.16.0 |<div style="text-align:left">  registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:38082bf43b98f921de25924c4b9b9a0a3d1d27d8c912b9a8cbda8c316798e54b |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-sidecar@sha256:6ae8703e8e1bb3d1728ab58b2306d7f0adab4d1f3b1f1f0a7467c275590e4e13 |
| 1.15.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-podmon@sha256:4f910318b4591ced142ee83ae49706f477f29598bd98010bf09905a3b4edfa40 |
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replicator@sha256:901004afd7968ecb58d9be9c40756b67e51dd3c0a60f041215872b0448839b5d:|
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replication-controller-manager@sha256:7d7d9a19b46d0e06fa57af609be29a441d2be63a20cfddb764904c75c187fe5b |
| 0.143.1 |<div style="text-align:left"> ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector@sha256:7a838b2f7a221459a6593b42483c43e7c2a3f86640136c33a436c071c0a410f4 |
| 1.27 |<div style="text-align:left"> quay.io/nginx/nginx-unprivileged@sha256:620c21188bee45c4145dbf1716117994eda3b9426d3d214de37a9468377a15d1 |
{{</table>}}
</div>
</br>

<b> Authorization Proxy Server </b>

<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.11.2 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:0a9a1134690465ffe3963f243ebd912325aa2b34c502585dafce68aeb2543a46 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-proxy@sha256:38d2ad1b4bc75f1d6bb638d0cf22a71dfb9cbfed6e7f93fbc0d026bc2c95d2d7 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-tenant@sha256:16f2540cf1dc278fc285ffe9d063c84e7998f76b99dd8276f1304ecaf2dd99b0 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-role@sha256:c869424c422aa2f1cba1c7ea87cf1304503c00b9b263afb5a018afbbbad629e2 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-storage@sha256:de12e0a30d0cad6d01bfff60634dd50f767368b0727a0afd7faae37a84f02330 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-controller@sha256:c72297f70609bc1ff151acb1216dfca903d73fe9a79c623311ba933cc2f240ec |
| 0.70.0 |<div style="text-align:left"> docker.io/openpolicyagent/opa@sha256:2b1c4b231f6dfa6a2baea4af4109203b10cd4b65e836d72f03bfe5d8dfce7095 |
| 9.2.1  |<div style="text-align:left"> docker.io/openpolicyagent/kube-mgmt@sha256:2c233c59becd9ec59a3f507220a8e837d06226172876adc41ebe1252a57f9fb4 |
| 8.4.0-alpine |<div style="text-align:left"> docker.io/library/redis@sha256:0804c395e634e624243387d3c3a9c45fcaca876d313c2c8b52c3fdf9a912dded |
| 19cd0c49f418 |<div style="text-align:left"> docker.io/rediscommander/redis-commander@sha256:19cd0c49f418779fa2822a0496c5e6516d0c792effc39ed20089e6268477e40a |
{{</table>}}
</div>
{{< /collapse >}}

{{< collapse id="3" title="PowerFlex">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.11.2 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:0a9a1134690465ffe3963f243ebd912325aa2b34c502585dafce68aeb2543a46 |
| 2.16.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powerflex@sha256:96e270ec08263da917e4ad4c9aab897e5d519c1b5003fdf245e25ecfef7d1cb5 |
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metrics-powerflex@sha256:439656d2a594ee43fe95b1dee29daa6efcebc6a71b7f779c4bd88dd37315aac1 |
| 5.0 |<div style="text-align:left"> quay.io/dell/storage/powerflex/sdc@sha256:1436844390ea95507bf0a24c68a300a355f010a90ed654a42a1f091482b6a0fc |
| 6.1.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:6b5a502366ecd4ed81bcdc768699fe431ab70437324f5a7883e9f49a5d640863 |
| 4.10.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:8a46d7ecbb798f19d7ccd7e510a2efec00ae7ba50fd82cc2f5ac45cedbab0bc1 |
| 2.15.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:11f199f6bec47403b03cb49c79a41f445884b213b382582a60710b8c6fdc316a |
| 2.0.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:25b17c4f84b0ab061da6397caf407c7251a571df5c4071e4917942684c61689a |
| 8.4.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:c7e0a3718832b6197ce8b29fefb3fed3d84f4fbcdf08f4606140dbec2566501d |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:d54cefd22172c3ece3136ffab83bf988baa7669728bd3d4affae99232bfea8c3 |
| 0.16.0 |<div style="text-align:left">  registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:38082bf43b98f921de25924c4b9b9a0a3d1d27d8c912b9a8cbda8c316798e54b |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-sidecar@sha256:6ae8703e8e1bb3d1728ab58b2306d7f0adab4d1f3b1f1f0a7467c275590e4e13 |
| 1.15.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-podmon@sha256:4f910318b4591ced142ee83ae49706f477f29598bd98010bf09905a3b4edfa40 |
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replicator@sha256:901004afd7968ecb58d9be9c40756b67e51dd3c0a60f041215872b0448839b5d:|
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replication-controller-manager@sha256:7d7d9a19b46d0e06fa57af609be29a441d2be63a20cfddb764904c75c187fe5b |
| 0.143.1 |<div style="text-align:left"> ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector@sha256:7a838b2f7a221459a6593b42483c43e7c2a3f86640136c33a436c071c0a410f4 |
| 1.27 |<div style="text-align:left"> quay.io/nginx/nginx-unprivileged@sha256:620c21188bee45c4145dbf1716117994eda3b9426d3d214de37a9468377a15d1 |
{{</table>}}
</div>
</br>

<b> Authorization Proxy Server </b>

<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.11.2 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:0a9a1134690465ffe3963f243ebd912325aa2b34c502585dafce68aeb2543a46 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-proxy@sha256:38d2ad1b4bc75f1d6bb638d0cf22a71dfb9cbfed6e7f93fbc0d026bc2c95d2d7 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-tenant@sha256:16f2540cf1dc278fc285ffe9d063c84e7998f76b99dd8276f1304ecaf2dd99b0 |
| 2.4.0  |<div style="text-align:left">  registry.connect.redhat.com/dell-emc/dell-csm-authorization-role@sha256:c869424c422aa2f1cba1c7ea87cf1304503c00b9b263afb5a018afbbbad629e2 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-storage@sha256:de12e0a30d0cad6d01bfff60634dd50f767368b0727a0afd7faae37a84f02330 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-controller@sha256:c72297f70609bc1ff151acb1216dfca903d73fe9a79c623311ba933cc2f240ec |
| 0.70.0 |<div style="text-align:left"> docker.io/openpolicyagent/opa@sha256:2b1c4b231f6dfa6a2baea4af4109203b10cd4b65e836d72f03bfe5d8dfce7095 |
| 9.2.1  |<div style="text-align:left"> docker.io/openpolicyagent/kube-mgmt@sha256:2c233c59becd9ec59a3f507220a8e837d06226172876adc41ebe1252a57f9fb4 |
| 8.4.0-alpine |<div style="text-align:left"> docker.io/library/redis@sha256:0804c395e634e624243387d3c3a9c45fcaca876d313c2c8b52c3fdf9a912dded |
| 19cd0c49f418 |<div style="text-align:left"> docker.io/rediscommander/redis-commander@sha256:19cd0c49f418779fa2822a0496c5e6516d0c792effc39ed20089e6268477e40a |
{{</table>}}
</div>
{{< /collapse >}}

{{< collapse id="4" title="PowerMax">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.11.2 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:0a9a1134690465ffe3963f243ebd912325aa2b34c502585dafce68aeb2543a46 |
| 2.16.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powermax@sha256:ae69cdc9b0afca8ff91bc8b763ac3a864afc221e5044a123674a79fbbb24d087 |
| 2.15.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powermax-reverseproxy@sha256:fab25a4fcad61509ba774bda2675c7a94547f544a90f6462ac2c5e8e6ebd02b8 |
| 1.9.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metrics-powermax@sha256:4db12d3d888b537012394dc69b440568ee96a5495e508fc25bef92acb2393edd |
| 6.1.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:6b5a502366ecd4ed81bcdc768699fe431ab70437324f5a7883e9f49a5d640863 |
| 4.10.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:8a46d7ecbb798f19d7ccd7e510a2efec00ae7ba50fd82cc2f5ac45cedbab0bc1 |
| 2.15.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:11f199f6bec47403b03cb49c79a41f445884b213b382582a60710b8c6fdc316a |
| 2.0.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:25b17c4f84b0ab061da6397caf407c7251a571df5c4071e4917942684c61689a |
| 8.4.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:c7e0a3718832b6197ce8b29fefb3fed3d84f4fbcdf08f4606140dbec2566501d |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:d54cefd22172c3ece3136ffab83bf988baa7669728bd3d4affae99232bfea8c3 |
| 0.15.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:38082bf43b98f921de25924c4b9b9a0a3d1d27d8c912b9a8cbda8c316798e54b |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-sidecar@sha256:6ae8703e8e1bb3d1728ab58b2306d7f0adab4d1f3b1f1f0a7467c275590e4e13 |
| 1.15.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-podmon@sha256:4f910318b4591ced142ee83ae49706f477f29598bd98010bf09905a3b4edfa40 |
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replicator@sha256:901004afd7968ecb58d9be9c40756b67e51dd3c0a60f041215872b0448839b5d:|
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replication-controller-manager@sha256:7d7d9a19b46d0e06fa57af609be29a441d2be63a20cfddb764904c75c187fe5b |
| 0.143.1 |<div style="text-align:left"> ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector@sha256:7a838b2f7a221459a6593b42483c43e7c2a3f86640136c33a436c071c0a410f4 |
| 1.27 |<div style="text-align:left"> quay.io/nginx/nginx-unprivileged@sha256:620c21188bee45c4145dbf1716117994eda3b9426d3d214de37a9468377a15d1 |
{{</table>}}
</div>
</br>

<b> Authorization Proxy Server </b>

<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.11.2 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:0a9a1134690465ffe3963f243ebd912325aa2b34c502585dafce68aeb2543a46 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-proxy@sha256:38d2ad1b4bc75f1d6bb638d0cf22a71dfb9cbfed6e7f93fbc0d026bc2c95d2d7 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-tenant@sha256:16f2540cf1dc278fc285ffe9d063c84e7998f76b99dd8276f1304ecaf2dd99b0 |
| 2.4.0  |<div style="text-align:left">  registry.connect.redhat.com/dell-emc/dell-csm-authorization-role@sha256:c869424c422aa2f1cba1c7ea87cf1304503c00b9b263afb5a018afbbbad629e2 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-storage@sha256:de12e0a30d0cad6d01bfff60634dd50f767368b0727a0afd7faae37a84f02330 |
| 2.4.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-controller@sha256:c72297f70609bc1ff151acb1216dfca903d73fe9a79c623311ba933cc2f240ec |
| 0.70.0 |<div style="text-align:left"> docker.io/openpolicyagent/opa@sha256:2b1c4b231f6dfa6a2baea4af4109203b10cd4b65e836d72f03bfe5d8dfce7095 |
| 9.2.1  |<div style="text-align:left"> docker.io/openpolicyagent/kube-mgmt@sha256:2c233c59becd9ec59a3f507220a8e837d06226172876adc41ebe1252a57f9fb4 |
| 8.4.0-alpine |<div style="text-align:left"> docker.io/library/redis@sha256:0804c395e634e624243387d3c3a9c45fcaca876d313c2c8b52c3fdf9a912dded |
| 19cd0c49f418 |<div style="text-align:left"> docker.io/rediscommander/redis-commander@sha256:19cd0c49f418779fa2822a0496c5e6516d0c792effc39ed20089e6268477e40a |

{{</table>}}
</div>
{{< /collapse >}}

{{< collapse id="5" title="Cosi">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.11.2 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:0a9a1134690465ffe3963f243ebd912325aa2b34c502585dafce68aeb2543a46 |
| 1.0.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-cosi@sha256:e3d33cb6d804431a713e0ddf0f8881460c421c97f27d4842bb966237b41d0a9f |
| 6.1.0 |<div style="text-align:left"> gcr.io/k8s-staging-sig-storage/objectstorage-sidecar@sha256:1a357bc1c0ad47e1b223ed605a281b75188ca605ae35cb1e6fb8010ab5bae189 |
{{</table>}}
</div>
{{< /collapse >}}

{{< collapse id="5" title="Unity">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.11.2 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:0a9a1134690465ffe3963f243ebd912325aa2b34c502585dafce68aeb2543a46 |
| 2.15.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-unity@sha256:92e0286ce4cc6d16e98683629ded9c36e3725ad268018915e4ab36057d0f0f4a |
| 6.1.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:6b5a502366ecd4ed81bcdc768699fe431ab70437324f5a7883e9f49a5d640863 |
| 4.10.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:8a46d7ecbb798f19d7ccd7e510a2efec00ae7ba50fd82cc2f5ac45cedbab0bc1 |
| 2.15.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:11f199f6bec47403b03cb49c79a41f445884b213b382582a60710b8c6fdc316a |
| 2.0.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:25b17c4f84b0ab061da6397caf407c7251a571df5c4071e4917942684c61689a |
| 8.4.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:c7e0a3718832b6197ce8b29fefb3fed3d84f4fbcdf08f4606140dbec2566501d |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:d54cefd22172c3ece3136ffab83bf988baa7669728bd3d4affae99232bfea8c3 |
| 0.16.0 |<div style="text-align:left">  registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:38082bf43b98f921de25924c4b9b9a0a3d1d27d8c912b9a8cbda8c316798e54b |
{{</table>}}
</div>
{{< /collapse >}}
</ul>
