---
title: "Component and Image Details"
linkTitle: "Component and Image Details"
weight: 1
---

### Container Storage Modules Component Version

{{<table "table table-striped table-bordered table-sm">}}
| Component | Image Version |
| - | - |
|<div style="text-align:left"> PowerFlex | {{< version-v1 key="csi-vxflexos" >}} |
|<div style="text-align:left"> PowerStore | {{< version-v1 key="csi-powerstore" >}} |
|<div style="text-align:left"> PowerMax | {{< version-v1 key="csi-powermax" >}} |
|<div style="text-align:left"> PowerScale | {{< version-v1 key="csi-powerscale" >}} |
|<div style="text-align:left"> Unity XT | {{< version-v1 key="csi-powerscale" >}} |
|<div style="text-align:left"> Authorization v2.x |{{< version-v1 key="csm-authorization-v2" >}} |
|<div style="text-align:left"> Observability | {{< version-v1 key="csm-observability" >}} |
|<div style="text-align:left"> Replication |{{< version-v1 key="csm-replication" >}} |
|<div style="text-align:left"> Resiliency | {{< version-v1 key="karavi-resiliency" >}} |
{{</table>}}

### Container Storage Modules Certified Operator 1.10.1 Images

<ul>
{{< collapse id="1" title="PowerStore" show="true">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.10.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:9b8e6de276d39f7a596a6ec68f39fc18ad73fd8f2f86af31d14ac689a98e2ef9 |
| 2.15.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powerstore@sha256:0b4e3f64ec340bb16bda3719fb447c17ee09529cbcf1bb08354470aac10e93cc |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metrics-powerstore@sha256:4d288473ab69dff348842d0a04c9c57aa7b76cc18c394e98906d09bfd08e0b60 |
| 5.3.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:bb057f866177d5f4139a1527e594499cbe0feeb67b63aaca8679dfdf0a6016f9 |
| 4.9.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:5aaefc24f315b182233c8b6146077f8c32e274d864cb03c632206e78bd0302da |
| 2.14.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:5244abbe87e01b35adeb8bb13882a74785df0c0619f8325c9e950395c3f72a97 |
| 1.14.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:5e7cbb63fd497fa913caa21fee1a69f727c220c6fa83c5f8bb0995e2ad73a474 |
| 8.3.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:bc7be893ecc3ad524194aa6573b2f5c06cd469bdf21a500ab6c99c2ba1c4d64d |
| 1.12.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:6de94d91a17a401b5f2e5cdf7bb50cd053521deaf1e189340d21c4249e8c4bf1 |
| 0.15.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:ce054c6fade575e9d4dbd4c3d65b9c5d1b05160aacfb9cf8d8cac51d73f3ccea |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-sidecar@sha256:fadcba26fe3464925b7b8857d470204ba43a72e75edd32ffa83675c1db6530da |
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-podmon@sha256:68780493ea9718faa399babd40cf09e1ace43e6a63a878d37612fec377067ebe |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replicator@sha256:b427913a72121a261161cf2f81bb991dfd383fa1703d20f1f1ff4fb5743eba16 |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replication-controller-manager@sha256:8cad45a81bd05be95170944850dd1b8b5fb7c8c5ee0397420d04cd2155ba52fa |
| 0.135.0|<div style="text-align:left"> ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector@sha256:6d260efde7406a1f7d731a5d9663cb6ce25fa634f3ef3ef4a69266aaae1680fd |
| 1.27   |<div style="text-align:left"> quay.io/nginx/nginx-unprivileged@sha256:f9dfa9c20b2b0b7c5cc830374f22f23dee3f750b6c5291ca7e0330b5c88e6403 |
{{</table>}}
</div>
</br>

<b> Authorization Proxy Server </b>

<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.10.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:9b8e6de276d39f7a596a6ec68f39fc18ad73fd8f2f86af31d14ac689a98e2ef9 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-proxy@sha256:a265ec058b102d1cf175deb2b80718d28f6728c094ee3b5367a07473a0dc2682 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-tenant@sha256:687faaa76ac70ab5f9f452c8a70d5ac45b1968ea2adc60198f2fd3e09b41e358 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-role@sha256:d09ffef1866f24bffab2a0d38af11fbbc528b1eae04db1246617b5f366ae545c |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-storage@sha256:ecaafb211be66f090b468bce366fe870877cb921a14f53fc63ffb1a3f26405d5 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-controller@sha256:6de38a3c833ce514dd8bf496a23157ff9f11aeca6359095c5ac41a38ba3ec231 |
| 0.70.0 |<div style="text-align:left"> docker.io/openpolicyagent/opa@sha256:2b1c4b231f6dfa6a2baea4af4109203b10cd4b65e836d72f03bfe5d8dfce7095 |
| 8.5.11  |<div style="text-align:left"> docker.io/openpolicyagent/kube-mgmt@sha256:f5bf223771237756a56168729defb608ec2941c9b701d1f1af96f9ae82966517 |
| 8.2.0-alpine|<div style="text-align:left"> docker.io/library/redis@sha256:7521abdff715d396aa482183942f3fe643344287c29ccb66eee16ac08a92190f |
| 19cd0c49f418 |<div style="text-align:left"> docker.io/rediscommander/redis-commander@sha256:19cd0c49f418779fa2822a0496c5e6516d0c792effc39ed20089e6268477e40a |
{{</table>}}
</div>
{{< /collapse >}}

{{< collapse id="2" title="PowerScale">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.10.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:9b8e6de276d39f7a596a6ec68f39fc18ad73fd8f2f86af31d14ac689a98e2ef9 |
| 2.15.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powerscale@sha256:83827890fccaa3aa0006fdb7af5f41522890adcc499d4d7f40d439a97a95ecfb |
| 1.10.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metrics-powerscale@sha256:a1b24f964308efc7d21e0496dbbe602819ac9ef1115899646a058665f3fb83a0 |
| 5.3.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:bb057f866177d5f4139a1527e594499cbe0feeb67b63aaca8679dfdf0a6016f9 |
| 4.9.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:5aaefc24f315b182233c8b6146077f8c32e274d864cb03c632206e78bd0302da |
| 2.14.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:5244abbe87e01b35adeb8bb13882a74785df0c0619f8325c9e950395c3f72a97 |
| 1.14.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:5e7cbb63fd497fa913caa21fee1a69f727c220c6fa83c5f8bb0995e2ad73a474 |
| 8.3.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:bc7be893ecc3ad524194aa6573b2f5c06cd469bdf21a500ab6c99c2ba1c4d64d |
| 1.12.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:6de94d91a17a401b5f2e5cdf7bb50cd053521deaf1e189340d21c4249e8c4bf1 |
| 0.15.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:ce054c6fade575e9d4dbd4c3d65b9c5d1b05160aacfb9cf8d8cac51d73f3ccea |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-sidecar@sha256:fadcba26fe3464925b7b8857d470204ba43a72e75edd32ffa83675c1db6530da |
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-podmon@sha256:68780493ea9718faa399babd40cf09e1ace43e6a63a878d37612fec377067ebe |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replicator@sha256:b427913a72121a261161cf2f81bb991dfd383fa1703d20f1f1ff4fb5743eba16 |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replication-controller-manager@sha256:8cad45a81bd05be95170944850dd1b8b5fb7c8c5ee0397420d04cd2155ba52fa |
| 0.135.0|<div style="text-align:left"> ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector@sha256:6d260efde7406a1f7d731a5d9663cb6ce25fa634f3ef3ef4a69266aaae1680fd |
| 1.27   |<div style="text-align:left"> quay.io/nginx/nginx-unprivileged@sha256:f9dfa9c20b2b0b7c5cc830374f22f23dee3f750b6c5291ca7e0330b5c88e6403 |
{{</table>}}
</div>
</br>

<b> Authorization Proxy Server </b>

<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.10.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:9b8e6de276d39f7a596a6ec68f39fc18ad73fd8f2f86af31d14ac689a98e2ef9 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-proxy@sha256:a265ec058b102d1cf175deb2b80718d28f6728c094ee3b5367a07473a0dc2682 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-tenant@sha256:687faaa76ac70ab5f9f452c8a70d5ac45b1968ea2adc60198f2fd3e09b41e358 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-role@sha256:d09ffef1866f24bffab2a0d38af11fbbc528b1eae04db1246617b5f366ae545c |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-storage@sha256:ecaafb211be66f090b468bce366fe870877cb921a14f53fc63ffb1a3f26405d5 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-controller@sha256:6de38a3c833ce514dd8bf496a23157ff9f11aeca6359095c5ac41a38ba3ec231 |
| 0.70.0 |<div style="text-align:left"> docker.io/openpolicyagent/opa@sha256:2b1c4b231f6dfa6a2baea4af4109203b10cd4b65e836d72f03bfe5d8dfce7095 |
| 8.5.11  |<div style="text-align:left"> docker.io/openpolicyagent/kube-mgmt@sha256:f5bf223771237756a56168729defb608ec2941c9b701d1f1af96f9ae82966517 |
| 8.2.0-alpine|<div style="text-align:left"> docker.io/library/redis@sha256:7521abdff715d396aa482183942f3fe643344287c29ccb66eee16ac08a92190f |
| 19cd0c49f418 |<div style="text-align:left"> docker.io/rediscommander/redis-commander@sha256:19cd0c49f418779fa2822a0496c5e6516d0c792effc39ed20089e6268477e40a |
{{</table>}}
</div>
{{< /collapse >}}

{{< collapse id="3" title="PowerFlex">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.10.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:9b8e6de276d39f7a596a6ec68f39fc18ad73fd8f2f86af31d14ac689a98e2ef9 |
| 2.15.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powerflex@sha256:7bfcc0bef795b36405f2c5a2193b659f46f38b661a07eee179bb48692dca9449 |
| 1.13.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metrics-powerflex@sha256:61390c6019a1b9505e405f7ca42c55971710671623991a4d1f431e414ec4679e |
| 4.5.4000.111 |<div style="text-align:left"> quay.io/dell/storage/powerflex/sdc@sha256:4aca94f895636efcc7308aeb8b083cb2f15133e255185b8db0805b9649ca8540 |
| 5.3.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:bb057f866177d5f4139a1527e594499cbe0feeb67b63aaca8679dfdf0a6016f9 |
| 4.9.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:5aaefc24f315b182233c8b6146077f8c32e274d864cb03c632206e78bd0302da |
| 2.14.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:5244abbe87e01b35adeb8bb13882a74785df0c0619f8325c9e950395c3f72a97 |
| 1.14.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:5e7cbb63fd497fa913caa21fee1a69f727c220c6fa83c5f8bb0995e2ad73a474 |
| 8.3.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:bc7be893ecc3ad524194aa6573b2f5c06cd469bdf21a500ab6c99c2ba1c4d64d |
| 1.12.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:6de94d91a17a401b5f2e5cdf7bb50cd053521deaf1e189340d21c4249e8c4bf1 |
| 0.15.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:ce054c6fade575e9d4dbd4c3d65b9c5d1b05160aacfb9cf8d8cac51d73f3ccea |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-sidecar@sha256:fadcba26fe3464925b7b8857d470204ba43a72e75edd32ffa83675c1db6530da |
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-podmon@sha256:68780493ea9718faa399babd40cf09e1ace43e6a63a878d37612fec377067ebe |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replicator@sha256:b427913a72121a261161cf2f81bb991dfd383fa1703d20f1f1ff4fb5743eba16 |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replication-controller-manager@sha256:8cad45a81bd05be95170944850dd1b8b5fb7c8c5ee0397420d04cd2155ba52fa |
| 0.135.0|<div style="text-align:left"> ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector@sha256:6d260efde7406a1f7d731a5d9663cb6ce25fa634f3ef3ef4a69266aaae1680fd |
| 1.27   |<div style="text-align:left"> quay.io/nginx/nginx-unprivileged@sha256:f9dfa9c20b2b0b7c5cc830374f22f23dee3f750b6c5291ca7e0330b5c88e6403 |
{{</table>}}
</div>
</br>

<b> Authorization Proxy Server </b>

<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.10.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:9b8e6de276d39f7a596a6ec68f39fc18ad73fd8f2f86af31d14ac689a98e2ef9 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-proxy@sha256:a265ec058b102d1cf175deb2b80718d28f6728c094ee3b5367a07473a0dc2682 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-tenant@sha256:687faaa76ac70ab5f9f452c8a70d5ac45b1968ea2adc60198f2fd3e09b41e358 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-role@sha256:d09ffef1866f24bffab2a0d38af11fbbc528b1eae04db1246617b5f366ae545c |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-storage@sha256:ecaafb211be66f090b468bce366fe870877cb921a14f53fc63ffb1a3f26405d5 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-controller@sha256:6de38a3c833ce514dd8bf496a23157ff9f11aeca6359095c5ac41a38ba3ec231 |
| 0.70.0 |<div style="text-align:left"> docker.io/openpolicyagent/opa@sha256:2b1c4b231f6dfa6a2baea4af4109203b10cd4b65e836d72f03bfe5d8dfce7095 |
| 8.5.11  |<div style="text-align:left"> docker.io/openpolicyagent/kube-mgmt@sha256:f5bf223771237756a56168729defb608ec2941c9b701d1f1af96f9ae82966517 |
| 8.2.0-alpine|<div style="text-align:left"> docker.io/library/redis@sha256:7521abdff715d396aa482183942f3fe643344287c29ccb66eee16ac08a92190f |
| 19cd0c49f418 |<div style="text-align:left"> docker.io/rediscommander/redis-commander@sha256:19cd0c49f418779fa2822a0496c5e6516d0c792effc39ed20089e6268477e40a |
{{</table>}}
</div>
{{< /collapse >}}

{{< collapse id="4" title="PowerMax">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.10.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:9b8e6de276d39f7a596a6ec68f39fc18ad73fd8f2f86af31d14ac689a98e2ef9 |
| 2.15.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powermax@sha256:9f879b571cf4f8935a2bc02d17c627327ab115aae989addf6a1f960ac8611cb6 |
| 2.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-powermax-reverseproxy@sha256:eeb95f0f5413314d14e7a5ef2279cef93182e229815577779574ba4d781e2c3e |
| 1.18.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metrics-powermax@sha256:baab9e0c17eb30a1a33832b8384d82bfff03ad378d432897231eab83dc679414 |
| 5.3.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:bb057f866177d5f4139a1527e594499cbe0feeb67b63aaca8679dfdf0a6016f9 |
| 4.9.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:5aaefc24f315b182233c8b6146077f8c32e274d864cb03c632206e78bd0302da |
| 2.14.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:5244abbe87e01b35adeb8bb13882a74785df0c0619f8325c9e950395c3f72a97 |
| 1.14.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:5e7cbb63fd497fa913caa21fee1a69f727c220c6fa83c5f8bb0995e2ad73a474 |
| 8.3.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:bc7be893ecc3ad524194aa6573b2f5c06cd469bdf21a500ab6c99c2ba1c4d64d |
| 1.12.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:6de94d91a17a401b5f2e5cdf7bb50cd053521deaf1e189340d21c4249e8c4bf1 |
| 0.15.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:ce054c6fade575e9d4dbd4c3d65b9c5d1b05160aacfb9cf8d8cac51d73f3ccea |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-sidecar@sha256:fadcba26fe3464925b7b8857d470204ba43a72e75edd32ffa83675c1db6530da |
| 1.14.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-podmon@sha256:68780493ea9718faa399babd40cf09e1ace43e6a63a878d37612fec377067ebe |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replicator@sha256:b427913a72121a261161cf2f81bb991dfd383fa1703d20f1f1ff4fb5743eba16 |
| 1.13.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-replication-controller-manager@sha256:8cad45a81bd05be95170944850dd1b8b5fb7c8c5ee0397420d04cd2155ba52fa |
| 0.135.0|<div style="text-align:left"> ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector@sha256:6d260efde7406a1f7d731a5d9663cb6ce25fa634f3ef3ef4a69266aaae1680fd |
| 1.27   |<div style="text-align:left"> quay.io/nginx/nginx-unprivileged@sha256:f9dfa9c20b2b0b7c5cc830374f22f23dee3f750b6c5291ca7e0330b5c88e6403 |
{{</table>}}
</div>
</br>

<b> Authorization Proxy Server </b>

<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.10.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:9b8e6de276d39f7a596a6ec68f39fc18ad73fd8f2f86af31d14ac689a98e2ef9 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-proxy@sha256:a265ec058b102d1cf175deb2b80718d28f6728c094ee3b5367a07473a0dc2682 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-tenant@sha256:687faaa76ac70ab5f9f452c8a70d5ac45b1968ea2adc60198f2fd3e09b41e358 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-role@sha256:d09ffef1866f24bffab2a0d38af11fbbc528b1eae04db1246617b5f366ae545c |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-storage@sha256:ecaafb211be66f090b468bce366fe870877cb921a14f53fc63ffb1a3f26405d5 |
| 2.3.0  |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-authorization-controller@sha256:6de38a3c833ce514dd8bf496a23157ff9f11aeca6359095c5ac41a38ba3ec231 |
| 0.70.0 |<div style="text-align:left"> docker.io/openpolicyagent/opa@sha256:2b1c4b231f6dfa6a2baea4af4109203b10cd4b65e836d72f03bfe5d8dfce7095 |
| 8.5.11  |<div style="text-align:left"> docker.io/openpolicyagent/kube-mgmt@sha256:f5bf223771237756a56168729defb608ec2941c9b701d1f1af96f9ae82966517 |
| 8.2.0-alpine|<div style="text-align:left"> docker.io/library/redis@sha256:7521abdff715d396aa482183942f3fe643344287c29ccb66eee16ac08a92190f |
| 19cd0c49f418 |<div style="text-align:left"> docker.io/rediscommander/redis-commander@sha256:19cd0c49f418779fa2822a0496c5e6516d0c792effc39ed20089e6268477e40a |

{{</table>}}
</div>
{{< /collapse >}}

{{< collapse id="5" title="Unity">}}
<div style="overflow-x: auto;">
{{<table "table table-striped table-bordered table-sm">}}
| Version/Digest | Image |
| - | - |
| 1.10.1 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-container-storage-modules-operator@sha256:9b8e6de276d39f7a596a6ec68f39fc18ad73fd8f2f86af31d14ac689a98e2ef9 |
| 2.15.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-unity@sha256:2eeac19ad6633fba486f807791103dbd5a74ebcd109c3b4a8d12c238346ac5a3 |
| 5.3.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-provisioner@sha256:bb057f866177d5f4139a1527e594499cbe0feeb67b63aaca8679dfdf0a6016f9 |
| 4.9.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-attacher@sha256:5aaefc24f315b182233c8b6146077f8c32e274d864cb03c632206e78bd0302da |
| 2.14.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-node-driver-registrar@sha256:5244abbe87e01b35adeb8bb13882a74785df0c0619f8325c9e950395c3f72a97 |
| 1.14.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-resizer@sha256:5e7cbb63fd497fa913caa21fee1a69f727c220c6fa83c5f8bb0995e2ad73a474 |
| 8.3.0  |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-snapshotter@sha256:bc7be893ecc3ad524194aa6573b2f5c06cd469bdf21a500ab6c99c2ba1c4d64d |
| 1.12.0 |<div style="text-align:left"> registry.connect.redhat.com/dell-emc/dell-csm-metadata-retriever@sha256:6de94d91a17a401b5f2e5cdf7bb50cd053521deaf1e189340d21c4249e8c4bf1 |
| 0.15.0 |<div style="text-align:left"> registry.k8s.io/sig-storage/csi-external-health-monitor-controller@sha256:ce054c6fade575e9d4dbd4c3d65b9c5d1b05160aacfb9cf8d8cac51d73f3ccea |
{{</table>}}
</div>
{{< /collapse >}}
</ul>
