---
title: "Troubleshooting"
linkTitle: "Troubleshooting"
weight: 5
Description: >
  Troubleshooting guide
---

- [Running `karavictl tenant` commands result in an HTTP 504 error](#running-karavictl-tenant-commands-result-in-an-http-504-error)
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