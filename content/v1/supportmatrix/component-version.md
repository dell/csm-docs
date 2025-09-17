---
title: "Component and Image Details"
linkTitle: "Component and Image Details"
weight: 1 
--- 

### Container Storage Modules Component Version
<ul style="margin-left:8px">
{{<table "table table-striped table-bordered table-sm">}}
| Component | Version |
| - | - |
|<div style="text-align:left"> PowerFlex | {{< version-v1 key="csi-vxflexos" >}} |
|<div style="text-align:left"> PowerStore | {{< version-v1 key="csi-powerstore" >}} |
|<div style="text-align:left"> PowerMax | {{< version-v1 key="csi-powermax" >}} |
|<div style="text-align:left"> PowerScale | {{< version-v1 key="csi-powerscale" >}} |
|<div style="text-align:left"> Unity XT | {{< version-v1 key="csi-powerscale" >}} |
|<div style="text-align:left"> Authorization v1.x | {{< version-v1 key="csm-authorization-v1" >}} |
|<div style="text-align:left"> Authorization v2.x |{{< version-v1 key="csm-authorization-v2" >}} |
|<div style="text-align:left"> Observability | {{< version-v1 key="csm-observability" >}} |
|<div style="text-align:left"> Replication |{{< version-v1 key="csm-replication" >}} |
|<div style="text-align:left"> Resiliency | {{< version-v1 key="karavi-resiliency" >}} |
| Application Mobility |{{< version-v1 key="csm-applicationmobility" >}} |
{{</table>}}
</ul>
<br>

### Container Storage Modules Certified Operator 1.9.1 Images

<ul>
{{< collapse id="1" title="PowerStore" show="true">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
|1.9.1|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:7f66f9a663aba48449f6ae385f951a32d4bb8f1a38b320c6eda32b3d2c438292 |
|2.14.1|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powerstore@sha256:c27df3c3161897235d33e978fbd3a563c39bdf21c0df6c21a75653b785932353 |
|5.1.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:672e45d6a55678abc1d102de665b5cbd63848e75dc7896f238c8eaaf3c7d322f |
|4.8.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:a399393ff5bd156277c56bae0c08389b1a1b95b7fd6ea44a316ce55e0dd559d7 |
|2.13.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:d7138bcc3aa5f267403d45ad4292c95397e421ea17a0035888850f424c7de25d |
|1.13.1|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:2a0b297cc7c4cd376ac7413df339ff2fdaa1ec9d099aed92b5ea1f031ef7f639 |
|8.2.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:dd788d79cf4c1b8edee6d9b80b8a1ebfc51a38a365c5be656986b129be9ac784 | 
|1.10.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:a8412f649ffca3aa72f5c9f5f2c3eb5dac5d742dfa5d3f4e0ef4bd81d72f2956 |
|0.14.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:65d118e955cfa0827d0f727fe161a7469e0e1c6829c347a484130aeb6e45f377 |
|1.13.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-podmon@sha256:5c3f5e473b9f3ce5797a61b2466d16d8b9c488e69ee35ac336c424bef8979abc  | 
{{</table>}}
</div>
</br>
{{< /collapse >}}

{{< collapse id="2" title="PowerScale">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
|1.9.1|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:7f66f9a663aba48449f6ae385f951a32d4bb8f1a38b320c6eda32b3d2c438292 |
|2.14.1|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powerscale@sha256:10fd23e10bbd48f202e3a5db2e94568f01772687b0459384320fb60030743fc7 |
|5.1.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:672e45d6a55678abc1d102de665b5cbd63848e75dc7896f238c8eaaf3c7d322f |
|4.8.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:a399393ff5bd156277c56bae0c08389b1a1b95b7fd6ea44a316ce55e0dd559d7 |
|2.13.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:d7138bcc3aa5f267403d45ad4292c95397e421ea17a0035888850f424c7de25d |
|1.13.1|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:2a0b297cc7c4cd376ac7413df339ff2fdaa1ec9d099aed92b5ea1f031ef7f639 |
|8.2.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:dd788d79cf4c1b8edee6d9b80b8a1ebfc51a38a365c5be656986b129be9ac784 | 
|1.10.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:a8412f649ffca3aa72f5c9f5f2c3eb5dac5d742dfa5d3f4e0ef4bd81d72f2956 |
|0.14.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:65d118e955cfa0827d0f727fe161a7469e0e1c6829c347a484130aeb6e45f377 |
|1.12.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-topology@sha256:8c99287c7da6fd122d29cc7b2ae0dec147fd0c666b94a8a99a9b2003ffe68586 |
|0.124.0|<div style="text-align:left"> ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector@sha256:9b8b6ef5f387429f5cb27267dfd3ca038b861a23cce40164a6c327efcceb7665 |
|1.9.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metrics-powerscale@sha256:78e1ed4b65c378d35e9cae76d7fb67fe0dfde6c2d111b5f3216fe376095148b6 |
|1.12.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replicator@sha256:3647b734da48dd44f4b8af9cd56eaba613d59201927420e877ed9eeefe573b32 |
|1.12.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replication-controller-manager@sha256:45ff6eb59f4ac87cd68d4405c07f20e7e34f5a2d33775f33d89b8a3437a06fab  | 
|1.13.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-podmon@sha256:5c3f5e473b9f3ce5797a61b2466d16d8b9c488e69ee35ac336c424bef8979abc  | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-sidecar@sha256:dd8aac3380d1d0664f7bbeb63da36443a57da12f9a26e435f33b8a33bdea4cb9 | 
|1.27.5|<div style="text-align:left"> docker.io/nginxinc/nginx-unprivileged@sha256:f9dfa9c20b2b0b7c5cc830374f22f23dee3f750b6c5291ca7e0330b5c88e6403   | 

{{</table>}}
</div>

</br>

<b> Authorization Proxy Server </b>

<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
|1.9.1|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:7f66f9a663aba48449f6ae385f951a32d4bb8f1a38b320c6eda32b3d2c438292    | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-proxy@sha256:1a3e53c1758850d26881923ee744b3cfff120daaaff33565c438fcc39d65f2ab  | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-tenant@sha256:030f1b20442b5df62ee8cce281d40226781478d351ea8fa67477cbb318fcc401  |
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-role@sha256:c874c7c23b55e88e98615172678e63ceb0e534ab11cdaf8949eef16881af64b7  | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-storage@sha256:bdc27c5bacbdaa601272055e8a8a6a482ae20192df50cce004d9b4a0fd131289 |
|0.70.0|<div style="text-align:left"> docker.io/openpolicyagent/opa@sha256:2b1c4b231f6dfa6a2baea4af4109203b10cd4b65e836d72f03bfe5d8dfce7095  | 
|8.5.11|<div style="text-align:left"> docker.io/openpolicyagent/kube-mgmt@sha256:8b9db2e7af5a237a8cea8f090484f29ddc34c88e30a58a6f5617b45ab5420d22  | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-controller@sha256:45af064da686118a8e5c2711dc00f1969c581bb169c26f5fb7f6f6a6186142fa  | 
|7.4.1|<div style="text-align:left"> docker.io/redis@sha256:c1e88455c85225310bbea54816e9c3f4b5295815e6dbf80c34d40afc6df28275  | 
|19cd0c49f418|<div style="text-align:left"> docker.io/rediscommander/redis-commander@sha256:19cd0c49f418779fa2822a0496c5e6516d0c792effc39ed20089e6268477e40a   |

{{</table>}}
</div>
{{< /collapse >}}

{{< collapse id="3" title="PowerFlex">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
|1.9.1|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:7f66f9a663aba48449f6ae385f951a32d4bb8f1a38b320c6eda32b3d2c438292 |
|2.14.1|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powerflex@sha256:94d6528f7beb2a3c59957373873964267c4fa871692d636c7849d55ef515180a |
|5.1.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:672e45d6a55678abc1d102de665b5cbd63848e75dc7896f238c8eaaf3c7d322f |
|4.8.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:a399393ff5bd156277c56bae0c08389b1a1b95b7fd6ea44a316ce55e0dd559d7 |
|2.13.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:d7138bcc3aa5f267403d45ad4292c95397e421ea17a0035888850f424c7de25d |
|1.13.1|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:2a0b297cc7c4cd376ac7413df339ff2fdaa1ec9d099aed92b5ea1f031ef7f639 |
|8.2.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:dd788d79cf4c1b8edee6d9b80b8a1ebfc51a38a365c5be656986b129be9ac784 | 
|1.10.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:a8412f649ffca3aa72f5c9f5f2c3eb5dac5d742dfa5d3f4e0ef4bd81d72f2956 |
|0.14.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:65d118e955cfa0827d0f727fe161a7469e0e1c6829c347a484130aeb6e45f377 |
|4.5.4000.111|<div style="text-align:left"> quay.io/dell/storage/powerflex/sdc@sha256:4aca94f895636efcc7308aeb8b083cb2f15133e255185b8db0805b9649ca8540 |
|1.12.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-topology@sha256:8c99287c7da6fd122d29cc7b2ae0dec147fd0c666b94a8a99a9b2003ffe68586 |
|0.124.0|<div style="text-align:left"> ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector@sha256:9b8b6ef5f387429f5cb27267dfd3ca038b861a23cce40164a6c327efcceb7665 |
|1.12.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metrics-powerflex@sha256:55595df2821dc1d45b6326830511435d0c5d88fe5602ca66547ea3548c970477 |
|1.12.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replicator@sha256:3647b734da48dd44f4b8af9cd56eaba613d59201927420e877ed9eeefe573b32 |
|1.12.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replication-controller-manager@sha256:45ff6eb59f4ac87cd68d4405c07f20e7e34f5a2d33775f33d89b8a3437a06fab  | 
|1.13.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-podmon@sha256:5c3f5e473b9f3ce5797a61b2466d16d8b9c488e69ee35ac336c424bef8979abc  | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-sidecar@sha256:dd8aac3380d1d0664f7bbeb63da36443a57da12f9a26e435f33b8a33bdea4cb9 | 
|1.27.5|<div style="text-align:left"> docker.io/nginxinc/nginx-unprivileged@sha256:f9dfa9c20b2b0b7c5cc830374f22f23dee3f750b6c5291ca7e0330b5c88e6403   | 

{{</table>}}
</div>

</br>

<b> Authorization Proxy Server </b>

<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
|1.9.1|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:7f66f9a663aba48449f6ae385f951a32d4bb8f1a38b320c6eda32b3d2c438292    | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-proxy@sha256:1a3e53c1758850d26881923ee744b3cfff120daaaff33565c438fcc39d65f2ab  | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-tenant@sha256:030f1b20442b5df62ee8cce281d40226781478d351ea8fa67477cbb318fcc401  |
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-role@sha256:c874c7c23b55e88e98615172678e63ceb0e534ab11cdaf8949eef16881af64b7  | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-storage@sha256:bdc27c5bacbdaa601272055e8a8a6a482ae20192df50cce004d9b4a0fd131289 |
|0.70.0|<div style="text-align:left"> docker.io/openpolicyagent/opa@sha256:2b1c4b231f6dfa6a2baea4af4109203b10cd4b65e836d72f03bfe5d8dfce7095  | 
|8.5.11|<div style="text-align:left"> docker.io/openpolicyagent/kube-mgmt@sha256:8b9db2e7af5a237a8cea8f090484f29ddc34c88e30a58a6f5617b45ab5420d22  | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-controller@sha256:45af064da686118a8e5c2711dc00f1969c581bb169c26f5fb7f6f6a6186142fa  | 
|7.4.1|<div style="text-align:left"> docker.io/redis@sha256:c1e88455c85225310bbea54816e9c3f4b5295815e6dbf80c34d40afc6df28275  | 
|19cd0c49f418|<div style="text-align:left"> docker.io/rediscommander/redis-commander@sha256:19cd0c49f418779fa2822a0496c5e6516d0c792effc39ed20089e6268477e40a   |

{{</table>}}
</div>
{{< /collapse >}}

{{< collapse id="4" title="PowerMax">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
|1.9.1|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:7f66f9a663aba48449f6ae385f951a32d4bb8f1a38b320c6eda32b3d2c438292 |
|2.14.1|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powermax@sha256:f199897b08319dda1c87d743c4e99a8b47ee5d1e20f06324312b4f4d3b3993e8 |
|2.13.1|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powermax-reverseproxy@sha256:7ef2a69b66d117f4f0d60277f1d564d30829a2a389eb8d0a74db0b544a46926e |
|5.1.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:672e45d6a55678abc1d102de665b5cbd63848e75dc7896f238c8eaaf3c7d322f |
|4.8.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:a399393ff5bd156277c56bae0c08389b1a1b95b7fd6ea44a316ce55e0dd559d7 |
|2.13.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:d7138bcc3aa5f267403d45ad4292c95397e421ea17a0035888850f424c7de25d |
|1.13.1|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:2a0b297cc7c4cd376ac7413df339ff2fdaa1ec9d099aed92b5ea1f031ef7f639 |
|8.2.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:dd788d79cf4c1b8edee6d9b80b8a1ebfc51a38a365c5be656986b129be9ac784 | 
|1.10.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:a8412f649ffca3aa72f5c9f5f2c3eb5dac5d742dfa5d3f4e0ef4bd81d72f2956 |
|0.14.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:65d118e955cfa0827d0f727fe161a7469e0e1c6829c347a484130aeb6e45f377 |
|1.12.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-topology@sha256:8c99287c7da6fd122d29cc7b2ae0dec147fd0c666b94a8a99a9b2003ffe68586 |
|0.124.0|<div style="text-align:left"> ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector@sha256:9b8b6ef5f387429f5cb27267dfd3ca038b861a23cce40164a6c327efcceb7665 |
|1.7.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metrics-powermax@sha256:8c9d9cec3f7457654f2d8c1e3c10d82b481647cd489b54d1759215763e3d0a9c |
|1.12.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replicator@sha256:3647b734da48dd44f4b8af9cd56eaba613d59201927420e877ed9eeefe573b32 |
|1.12.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replication-controller-manager@sha256:45ff6eb59f4ac87cd68d4405c07f20e7e34f5a2d33775f33d89b8a3437a06fab  | 
|1.13.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-podmon@sha256:5c3f5e473b9f3ce5797a61b2466d16d8b9c488e69ee35ac336c424bef8979abc  | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-sidecar@sha256:dd8aac3380d1d0664f7bbeb63da36443a57da12f9a26e435f33b8a33bdea4cb9 | 
|1.27.5|<div style="text-align:left"> docker.io/nginxinc/nginx-unprivileged@sha256:f9dfa9c20b2b0b7c5cc830374f22f23dee3f750b6c5291ca7e0330b5c88e6403   | 

{{</table>}}
</div>

</br>

<b> Authorization Proxy Server </b>

<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
|1.9.1|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:7f66f9a663aba48449f6ae385f951a32d4bb8f1a38b320c6eda32b3d2c438292    | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-proxy@sha256:1a3e53c1758850d26881923ee744b3cfff120daaaff33565c438fcc39d65f2ab  | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-tenant@sha256:030f1b20442b5df62ee8cce281d40226781478d351ea8fa67477cbb318fcc401  |
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-role@sha256:c874c7c23b55e88e98615172678e63ceb0e534ab11cdaf8949eef16881af64b7  | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-storage@sha256:bdc27c5bacbdaa601272055e8a8a6a482ae20192df50cce004d9b4a0fd131289 |
|0.70.0|<div style="text-align:left"> docker.io/openpolicyagent/opa@sha256:2b1c4b231f6dfa6a2baea4af4109203b10cd4b65e836d72f03bfe5d8dfce7095  | 
|8.5.11|<div style="text-align:left"> docker.io/openpolicyagent/kube-mgmt@sha256:8b9db2e7af5a237a8cea8f090484f29ddc34c88e30a58a6f5617b45ab5420d22  | 
|2.2.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-controller@sha256:45af064da686118a8e5c2711dc00f1969c581bb169c26f5fb7f6f6a6186142fa  | 
|7.4.1|<div style="text-align:left"> docker.io/redis@sha256:c1e88455c85225310bbea54816e9c3f4b5295815e6dbf80c34d40afc6df28275  | 
|19cd0c49f418|<div style="text-align:left"> docker.io/rediscommander/redis-commander@sha256:19cd0c49f418779fa2822a0496c5e6516d0c792effc39ed20089e6268477e40a   |

{{</table>}}
</div>
{{< /collapse >}}

{{< collapse id="5" title="Unity">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
|1.9.1|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:7f66f9a663aba48449f6ae385f951a32d4bb8f1a38b320c6eda32b3d2c438292 |
|2.14.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-unity@sha256:c1b93c49f535f247c884904c00f8b9be9aacc6fc1133bf0044efee0938407f31 |
|5.1.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:672e45d6a55678abc1d102de665b5cbd63848e75dc7896f238c8eaaf3c7d322f |
|4.8.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:a399393ff5bd156277c56bae0c08389b1a1b95b7fd6ea44a316ce55e0dd559d7 |
|2.13.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:d7138bcc3aa5f267403d45ad4292c95397e421ea17a0035888850f424c7de25d |
|1.13.1|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:2a0b297cc7c4cd376ac7413df339ff2fdaa1ec9d099aed92b5ea1f031ef7f639 |
|8.2.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:dd788d79cf4c1b8edee6d9b80b8a1ebfc51a38a365c5be656986b129be9ac784 | 
|1.10.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:a8412f649ffca3aa72f5c9f5f2c3eb5dac5d742dfa5d3f4e0ef4bd81d72f2956 |
|0.14.0|<div style="text-align:left"> registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:65d118e955cfa0827d0f727fe161a7469e0e1c6829c347a484130aeb6e45f377 |
|1.13.0|<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-podmon@sha256:5c3f5e473b9f3ce5797a61b2466d16d8b9c488e69ee35ac336c424bef8979abc  | 
{{</table>}}
</div>
{{< /collapse >}}
</ul>