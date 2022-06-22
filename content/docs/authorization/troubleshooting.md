---
title: "Troubleshooting"
linkTitle: "Troubleshooting"
weight: 5
Description: >
  Troubleshooting guide
---

- [Running `karavictl tenant` commands result in an HTTP 504 error](#running-karavictl-tenant-commands-result-in-an-http-504-error)
- [Installation fails to install policies](#installation-fails-to-install-policies)
- [After installation, the create-pvc Pod is in an Error state](#after-installation-the-create-pvc-pod-is-in-an-error-state)

---

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

View the contents /tmp/policy-install-for-karavi* file listed in the error message. If there is a Permission denied error while running the policy-install.sh script, manually run the script to install policies.

```
$ cat /tmp/policy-install-for-karavi3163047435

# find the location of the policy-install.sh script located in the file and manually run the script

$ /tmp/karavi-installer-2908017483/policy-install.sh
```

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

