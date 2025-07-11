---
title: "Troubleshooting"
linkTitle: "Troubleshooting"
weight: 5
toc_hide: false
Description: >
  Troubleshooting guide
---

## Helm Deployment
- [The CSI Driver for Dell PowerFlex is in an Error or CrashLoopBackoff state due to "request denied for path" errors](#the-csi-driver-for-dell-powerflex-is-in-an-error-or-crashloopbackoff-state-due-to-request-denied-for-path-errors)
- [Intermittent 401 issues with generated token](#intermittent-401-issues-with-generated-token)

---

### The CSI Driver for Dell PowerFlex is in an Error or CrashLoopBackoff state due to "request denied for path" errors
The vxflexos-controller pods will have logs similar to:
```terminal
time="2022-06-30T17:35:03Z" level=error msg="failed to list vols for array 2d6fb7c6370a990f : rpc error: code = Internal desc = Unable to list volumes: request denied for path " error="rpc error: code = Internal desc = Unable to list volumes: request denied for path"
time="2022-06-30T17:35:03Z" level=error msg="array 2d6fb7c6370a990f probe failed: failed to list vols for array 2d6fb7c6370a990f : rpc error: code = Internal desc = Unable to list volumes: request denied for path "
...
time="2022-06-30T17:35:03Z" level=fatal msg="grpc failed" error="rpc error: code = FailedPrecondition desc = All arrays are not working. Could not proceed further: map[2d6fb7c6370a990f:failed to list vols for array 2d6fb7c6370a990f : rpc error: code = Internal desc = Unable to list volumes: request denied for path ]"
```

The vxflexos-node pods will have logs similar to:
```terminal
time="2022-06-30T17:38:32Z" level=error msg="failed to list vols for array 2d6fb7c6370a990f : rpc error: code = Internal desc = Unable to list volumes: request denied for path " error="rpc error: code = Internal desc = Unable to list volumes: request denied for path"
time="2022-06-30T17:38:32Z" level=error msg="array 2d6fb7c6370a990f probe failed: failed to list vols for array 2d6fb7c6370a990f : rpc error: code = Internal desc = Unable to list volumes: request denied for path "
...
time="2022-06-30T17:38:32Z" level=fatal msg="grpc failed" error="rpc error: code = FailedPrecondition desc = All arrays are not working. Could not proceed further: map[2d6fb7c6370a990f:failed to list vols for array 2d6fb7c6370a990f : rpc error: code = Internal desc = Unable to list volumes: request denied for path ]"
```

This occurs when the Container Storage Modules Authorization proxy-server does not allow all driver HTTPS request paths.

__Resolution__

1. Edit the `powerflex-urls` configMap in the namespace where Container Storage Modules Authorization is deployed to allow all request paths by default.

```bash
kubectl -n <namespace> edit configMap powerflex-urls
```

In the `data` field, navigate towards the bottom of this field where you see `default allow = false`. This is highlighted in **bold** in the example below. Replace `false` with `true` and save the edit.

```yaml
data:
  url.rego: "# Copyright © 2022 Dell Inc., or its subsidiaries. All Rights Reserved.\n#\n#
    Licensed under the Apache License, Version 2.0 (the \"License\");\n# you may not
    use this file except in compliance with the License.\n# You may obtain a copy
    of the License at\n#\n#     http:#www.apache.org/licenses/LICENSE-2.0\n#\n# Unless
    required by applicable law or agreed to in writing, software\n# distributed under
    the License is distributed on an \"AS IS\" BASIS,\n# WITHOUT WARRANTIES OR CONDITIONS
    OF ANY KIND, either express or implied.\n# See the License for the specific language
    governing permissions and\n# limitations under the License.\n\npackage karavi.authz.url\n\nallowlist
    = [\n    \"GET /api/login/\",\n\t\t\"POST /proxy/refresh-token/\",\n\t\t\"GET
    /api/version/\",\n\t\t\"GET /api/types/System/instances/\",\n\t\t\"GET /api/types/StoragePool/instances/\",\n\t\t\"POST
    /api/types/Volume/instances/\",\n\t\t\"GET /api/instances/Volume::[a-f0-9]+/$\",\n\t\t\"POST
    /api/types/Volume/instances/action/queryIdByKey/\",\n\t\t\"GET /api/instances/System::[a-f0-9]+/relationships/Sdc/\",\n\t\t\"GET
    /api/instances/Sdc::[a-f0-9]+/relationships/Statistics/\",\n\t\t\"GET /api/instances/Sdc::[a-f0-9]+/relationships/Volume/\",\n\t\t\"GET
    /api/instances/Volume::[a-f0-9]+/relationships/Statistics/\",\n\t\t\"GET /api/instances/StoragePool::[a-f0-9]+/relationships/Statistics/\",\n\t\t\"POST
    /api/instances/Volume::[a-f0-9]+/action/addMappedSdc/\",\n\t\t\"POST /api/instances/Volume::[a-f0-9]+/action/removeMappedSdc/\",\n\t\t\"POST
    /api/instances/Volume::[a-f0-9]+/action/removeVolume/\"\n]\n\n<b>default allow =
    false</b>\nallow {\n\tregex.match(allowlist[_], sprintf(\"%s %s\", [input.method,
    input.url]))\n}\n"
```
Edited data:

```yaml
data:
  url.rego: "# Copyright © 2022 Dell Inc., or its subsidiaries. All Rights Reserved.\n#\n#
    Licensed under the Apache License, Version 2.0 (the \"License\");\n# you may not
    use this file except in compliance with the License.\n# You may obtain a copy
    of the License at\n#\n#     http:#www.apache.org/licenses/LICENSE-2.0\n#\n# Unless
    required by applicable law or agreed to in writing, software\n# distributed under
    the License is distributed on an \"AS IS\" BASIS,\n# WITHOUT WARRANTIES OR CONDITIONS
    OF ANY KIND, either express or implied.\n# See the License for the specific language
    governing permissions and\n# limitations under the License.\n\npackage karavi.authz.url\n\nallowlist
    = [\n    \"GET /api/login/\",\n\t\t\"POST /proxy/refresh-token/\",\n\t\t\"GET
    /api/version/\",\n\t\t\"GET /api/types/System/instances/\",\n\t\t\"GET /api/types/StoragePool/instances/\",\n\t\t\"POST
    /api/types/Volume/instances/\",\n\t\t\"GET /api/instances/Volume::[a-f0-9]+/$\",\n\t\t\"POST
    /api/types/Volume/instances/action/queryIdByKey/\",\n\t\t\"GET /api/instances/System::[a-f0-9]+/relationships/Sdc/\",\n\t\t\"GET
    /api/instances/Sdc::[a-f0-9]+/relationships/Statistics/\",\n\t\t\"GET /api/instances/Sdc::[a-f0-9]+/relationships/Volume/\",\n\t\t\"GET
    /api/instances/Volume::[a-f0-9]+/relationships/Statistics/\",\n\t\t\"GET /api/instances/StoragePool::[a-f0-9]+/relationships/Statistics/\",\n\t\t\"POST
    /api/instances/Volume::[a-f0-9]+/action/addMappedSdc/\",\n\t\t\"POST /api/instances/Volume::[a-f0-9]+/action/removeMappedSdc/\",\n\t\t\"POST
    /api/instances/Volume::[a-f0-9]+/action/removeVolume/\"\n]\n\n<b>default allow =
    true</b>\nallow {\n\tregex.match(allowlist[_], sprintf(\"%s %s\", [input.method,
    input.url]))\n}\n"
```

2. Rollout restart the Container Storage Modules Authorization proxy-server so the policy change gets applied.

```bash
kubectl -n <namespace> rollout restart deploy/proxy-server
```

3. Optionally, rollout restart the CSI Driver for Dell PowerFlex to restart the driver pods. Alternatively, wait for the Kubernetes CrashLoopBackoff behavior to restart the driver.

```bash
kubectl -n <driver-namespace> rollout restart deploy/vxflexos-controller
kubectl -n <driver-namespace> rollout restart daemonSet/vxflexos-node
```

### Intermittent 401 issues with generated token
This issue occurs when a new access token is generated in an existing driver installation.

__Resolution__

If you are applying a new token in an existing driver installation, restart the driver pods for the new token to take effect. The token is read once when the driver pods are started and is not dynamically updated. 
```bash
kubectl -n <driver-namespace> rollout restart deploy/<driver>-controller
kubectl -n <driver-namespace> rollout restart ds/<driver>-node
```
