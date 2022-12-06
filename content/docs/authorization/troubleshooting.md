---
title: "Troubleshooting"
linkTitle: "Troubleshooting"
weight: 5
Description: >
  Troubleshooting guide
---

## RPM Deployment
- [The Failure of Building an Authorization RPM](#The-Failure-of-Building-an-Authorization-RPM)
- [Running `karavictl tenant` commands result in an HTTP 504 error](#running-karavictl-tenant-commands-result-in-an-http-504-error)
- [Installation fails to install policies](#installation-fails-to-install-policies)
- [After installation, the create-pvc Pod is in an Error state](#after-installation-the-create-pvc-pod-is-in-an-error-state)

## Helm Deployment
- [The CSI Driver for Dell PowerFlex v2.3.0 is in an Error or CrashLoopBackoff state due to "request denied for path" errors](#the-csi-driver-for-dell-powerflex-v230-is-in-an-error-or-crashloopbackoff-state-due-to-request-denied-for-path-errors)

---

### The Failure of Building an Authorization RPM
  This response occurs when running 'make rpm' without the proper permissions or correct pathing of the Authorization repository.

```
Error response from daemon: failed to create shim task: OCI runtime create failed: runc create failed: unable to start container process: error during container init: error mounting "/root/karavi-authorization/bin/deploy" to rootfs at "/home/builder/rpm/deploy": mount /root/karavi-authorization/bin/deploy:/home/builder/rpm/deploy (via /proc/self/fd/6), flags: 0x5000: not a directory: unknown: Are you trying to mount a directory onto a file (or vice-versa)? Check if the specified host path exists and is the expected type.ERRO[0001] error waiting for container: context canceled 
```

__Resolution__

1. Ensure the cloned repository is in a folder independent of the root or home directory.

```
/root/myrepos/karavi-authorization
```

2. Enable appropriate permissions to the RPM folder (this is where the Authorization RPM is located after being built).

```
chmod o+rwx deploy/rpm
```

### Retrieve CSM Authorization Server Logs

To retrieve logs from services on the CSM Authorization Server, run the following command (e.g proxy-server logs):

```
$ k3s kubectl logs deploy/proxy-server -n karavi -c proxy-server
```

For OPA related logs, run:

```
$ k3s kubectl logs deploy/proxy-server -n karavi -c opa
```

### Running "karavictl tenant" commands result in an HTTP 504 error
This situation may occur if there are Iptables or other firewall rules preventing communication with the provided `<grpc-address>`:
```
$ karavictl tenant list --addr <grpc-address>
{
  "ErrorMsg": "rpc error: code = Unavailable desc = Gateway Timeout: HTTP status code 504; 
  transport: received the unexpected content-type \"text/plain; charset=utf-8\""
}
```
__Resolution__

Consult with your system administrator or Iptables/firewall documentation. If there are rules in place to 
prevent communication with the `<grpc-address>`, either new rules must be created or existing rules must be updated.

### Installation fails to install policies
If SELinux is enabled, the policies may fail to install:

```
error: failed to install policies (see /tmp/policy-install-for-karavi3163047435): exit status 1
```

__Resolution__

This issue should only occur with older versions of CSM Authorization. If your system is encountering this issue, upgrade to version 1.5.0 or above.

### After installation, the create-pvc Pod is in an Error state
If SELinux is enabled, the create-pvc Pod may be in an Error state:

```
kube-system    create-pvc-44a763c7-e70f-4e32-a114-e94615041042   0/1     Error       0          102s
```

__Resolution__

Run the following commands to allow the PVC to be created:
```
$ semanage fcontext -a -t container_file_t  "/var/lib/rancher/k3s/storage(/.*)?"
$ restorecon -R  /var/lib/rancher/k3s/storage/
```

### The CSI Driver for Dell PowerFlex v2.3.0 is in an Error or CrashLoopBackoff state due to "request denied for path" errors
The vxflexos-controller pods will have logs similar to:
```
time="2022-06-30T17:35:03Z" level=error msg="failed to list vols for array 2d6fb7c6370a990f : rpc error: code = Internal desc = Unable to list volumes: request denied for path " error="rpc error: code = Internal desc = Unable to list volumes: request denied for path"
time="2022-06-30T17:35:03Z" level=error msg="array 2d6fb7c6370a990f probe failed: failed to list vols for array 2d6fb7c6370a990f : rpc error: code = Internal desc = Unable to list volumes: request denied for path "
...
time="2022-06-30T17:35:03Z" level=fatal msg="grpc failed" error="rpc error: code = FailedPrecondition desc = All arrays are not working. Could not proceed further: map[2d6fb7c6370a990f:failed to list vols for array 2d6fb7c6370a990f : rpc error: code = Internal desc = Unable to list volumes: request denied for path ]"
```

The vxflexos-node pods will have logs similar to:
```
time="2022-06-30T17:38:32Z" level=error msg="failed to list vols for array 2d6fb7c6370a990f : rpc error: code = Internal desc = Unable to list volumes: request denied for path " error="rpc error: code = Internal desc = Unable to list volumes: request denied for path"
time="2022-06-30T17:38:32Z" level=error msg="array 2d6fb7c6370a990f probe failed: failed to list vols for array 2d6fb7c6370a990f : rpc error: code = Internal desc = Unable to list volumes: request denied for path "
...
time="2022-06-30T17:38:32Z" level=fatal msg="grpc failed" error="rpc error: code = FailedPrecondition desc = All arrays are not working. Could not proceed further: map[2d6fb7c6370a990f:failed to list vols for array 2d6fb7c6370a990f : rpc error: code = Internal desc = Unable to list volumes: request denied for path ]"
```

This occurs when the CSM Authorization proxy-server does not allow all driver HTTPS request paths.

__Resolution__

1. Edit the `powerflex-urls` configMap in the namespace where CSM Authorization is deployed to allow all request paths by default.

```
kubectl -n <namespace> edit configMap powerflex-urls
```

In the `data` field, navigate towards the bottom of this field where you see `default allow = false`. This is highlighted in **bold** in the example below. Replace `false` with `true` and save the edit.

<pre><code>
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
</code></pre>

Edited data:

<pre><code>
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
</code></pre>

2. Rollout restart the CSM Authorization proxy-server so the policy change gets applied.

```
kubectl -n <namespace> rollout restart deploy/proxy-server
```

3. Optionally, rollout restart the CSI Driver for Dell PowerFlex to restart the driver pods. Alternatively, wait for the Kubernetes CrashLoopBackoff behavior to restart the driver.

```
kubectl -n <driver-namespace> rollout restart deploy/vxflexos-controller
kubectl -n <driver-namespace> rollout restart daemonSet/vxflexos-node
```