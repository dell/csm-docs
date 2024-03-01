---
title: "Troubleshooting"
linkTitle: "Troubleshooting"
weight: 5
Description: >
  Troubleshooting
---

## Logs and Events

The first and in most cases sufficient step in troubleshooting issues with a CSI driver that has Encryption enabled 
is exploring logs of the Encryption driver and related Kubernetes components. These are some useful log sources:

### CSI Driver Containers Logs

The driver creates several *controller* and *node* pods. They can be listed with `kubectl -n <driver namespace> get pods`. 
The output will look similar to:

```
NAME                              READY   STATUS    RESTARTS   AGE
isi-controller-84f697c874-2j6d4   10/10   Running   0          16h
isi-node-4gtwf                    4/4     Running   0          16h
isi-node-lnzws                    4/4     Running   0          16h
```

List containers in pod `isi-node-4gtwf` with `kubectl -n <driver namespace> logs isi-node-4gtwf`. 
Each pod has containers called `driver` which is the storage driver container and `driver-sec` which is the Encryption driver container. 
These container's logs tend to provide the most important information, but other containers may give a hint too.
View the logs of `driver-sec` in `isi-node-4gtwf` with `kubectl -n <driver namespace> logs isi-node-4gtwf driver-sec`.
The log level of this container can be changed by setting value [encryption.logLevel](../deployment#helm-chart-values) and restarting the driver.

Often it is necessary to see the logs produced on a specific Kubernetes worker host. 
To find which *node* pod is running on which worker host, use `kubectl -n <driver namespace> get pods -o wide`.

### PersistentVolume, PersistentVolumeClaim and Application Pod Events

Some errors may be logged to the related resource events that can be viewed with `kubectl describe` command for that resource.

### Vault Server Logs

Some errors related to communication with the Vault server and key requests may be logged on the Vault server side.
If you run a [test instance of the server in a Docker container](../../../deployment/helm/modules/encryption/vault#vault-server-installation) you can view the logs with `docker logs vault-server`.

## Typical Failure Reasons

### Incorrect Vault related configuration

- check [logs](#logs-and-events)
- check [vault-auth secret](../../../deployment/helm/modules/encryption#secret-vault-auth)
- check [vault-cert secret](../../../deployment/helm/modules/encryption#secret-vault-cert)
- check [vault-client-conf config map](../../../deployment/helm/modules/encryption/#configmap-vault-client-conf)

### Incorrect Vault server-side configuration

- check [logs](#logs-and-events)
- check [Vault server configuration](../../../deployment/helm/modules/encryption/vault#minimum-server-configuration)

### Expired AppRole secret ID

- [reset the role secret ID](../../../deployment/helm/modules/encryption/vault#set-role-id-and-secret-id-to-the-role) 

### Incorrect CSI driver configuration

- check the related CSI driver [troubleshooting steps](../../../csidriver/troubleshooting)

### SSH server is stopped/restarted on the worker host {#ssh-stopped}

This may manifest in:
- failure to start the CSI driver
- failure to create a new encrypted volume
- failure to access an encrypted volume (IO errors)

Resolution:
- check SSH server is running on all worker host
- stop all workloads that use encrypted volumes on the node, then restart them

### No license provided, or license expired

This may manifest in:
- failure to start the CSI driver
- failure to create a new encrypted volume

Resolution:
- obtain a [new valid license](../../../license)
- check the license is for the cluster on which the encrypted volumes are created
- check [encryption-license secret](../../../deployment/helm/modules/encryption#secret-encryption-license)

## Typical Rekey Failure reasons
If all rekeys in the cluster are failing 
- check the Rekey controller helm chart values.yaml `provisioner` name against the Dell CSI driver chart `encryption.pluginName`, and ensure they match.
- check the Rekey controller helm chart values.yaml `port` number against the Dell CSI driver chart `encryption.apiPort`, and ensure they match.

If Rekeys fail for a particular PV
  - check that the volume is provisioned by the Encryption provisioner
  - check that volume attachments exist for the said PV
  - check that at least one node on which the PV is mounted is available and reachable
  - check the Encryption provisioner logs for details that may indicate the failure reason
  - check the Rekey controller log for the reason for failure 

If a Rekey results in a `Status.Phase` of `unknown`
  - this implies the connection failed during the rekey process which may mean the volume was rekeyed
  - an additional rekey attempt should work assuming a reliable connection to the Encryption provisioner. This may result in the volume being rekeyed twice.