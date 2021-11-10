---
title: "Troubleshooting"
linkTitle: "Troubleshooting"
weight: 5
Description: >
  Troubleshooting guide
---

- [Running `karavictl inject` leaves the vxflexos-controller in a `Pending` state](#running-karavictl-inject-leaves-the-vxflexos-controller-in-a-pending-state)
- [Running `karavictl inject` leaves the powermax-controller in a `Pending` state](#running-karavictl-inject-leaves-the-powermax-controller-in-a-pending-state)
- [Running `karavictl inject` leaves the isilon-controller in a `Pending` state](#running-karavictl-inject-leaves-the-isilon-controller-in-a-pending-state)

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

### Running "karavictl inject" leaves the vxflexos-controller in a "Pending" state
This situation may occur when the number of vxflexos-controller pods that are deployed is equal to the number of schedulable nodes.
```
$ kubectl get pods -n vxflexos                                                                  

NAME                                   READY   STATUS    RESTARTS   AGE
vxflexos-controller-696cc5945f-4t94d   0/6     Pending   0          3m2s
vxflexos-controller-75cdcbc5db-k25zx   5/5     Running   0          3m41s
vxflexos-controller-75cdcbc5db-nkxqh   5/5     Running   0          3m42s
vxflexos-node-mjc74                    3/3     Running   0          2m44s
vxflexos-node-zgswp                    3/3     Running   0          2m44s
```

__Resolution__

To resolve this issue, we need to temporarily reduce the number of replicas that the driver deployment is using.

1. Edit the deployment
    ```
    $ kubectl edit -n vxflexos deploy/vxflexos-controller
    ```

2. Find `replicas` under the `spec` section of the deployment manifest.
3. Reduce the number of `replicas` by 1
4. Save the file
5. Confirm that the updated controller pods have been deployed
    ```
    $ kubectl get pods -n vxflexos                                                                  

    NAME                                   READY   STATUS    RESTARTS   AGE
    vxflexos-controller-696cc5945f-4t94d   6/6     Running   0          4m41s
    vxflexos-node-mjc74                    3/3     Running   0          3m44s
    vxflexos-node-zgswp                    3/3     Running   0          3m44s
    ```

6. Edit the deployment again
7. Find `replicas` under the `spec` section of the deployment manifest.
8. Increase the number of `replicas` by 1
9. Save the file
10. Confirm that the updated controller pods have been deployed
    ```
    $ kubectl get pods -n vxflexos                                                                  

    NAME                                   READY   STATUS    RESTARTS   AGE
    vxflexos-controller-696cc5945f-4t94d   6/6     Running   0          5m41s
    vxflexos-controller-696cc5945f-6xxhb   6/6     Running   0          5m41s
    vxflexos-node-mjc74                    3/3     Running   0          4m44s
    vxflexos-node-zgswp                    3/3     Running   0          4m44s
    ```

### Running "karavictl inject" leaves the powermax-controller in a "Pending" state
This situation may occur when the number of powermax-controller pods that are deployed is equal to the number of schedulable nodes.
```
$ kubectl get pods -n powermax                                                                

NAME                                   READY   STATUS    RESTARTS   AGE
powermax-controller-58d8779f5d-v7t56   0/6     Pending   0          25s
powermax-controller-78f749847-jqphx    5/5     Running   0          10m
powermax-controller-78f749847-w6vp5    5/5     Running   0          10m
powermax-node-gx5pk                    3/3     Running   0          21s
powermax-node-k5gwc                    3/3     Running   0          17s
```

__Resolution__

To resolve this issue, we need to temporarily reduce the number of replicas that the driver deployment is using.

1. Edit the deployment
    ```
    $ kubectl edit -n powermax deploy/powermax-controller
    ```

2. Find `replicas` under the `spec` section of the deployment manifest.
3. Reduce the number of `replicas` by 1
4. Save the file
5. Confirm that the updated controller pods have been deployed
    ```
    $ kubectl get pods -n powermax
    NAME                                   READY   STATUS    RESTARTS   AGE     
    powermax-controller-58d8779f5d-cqx8d   6/6     Running   0          22s 
    powermax-node-gx5pk                    3/3     Running   3          8m3s    
    powermax-node-k5gwc                    3/3     Running   3          7m59s
    ```

6. Edit the deployment again
7. Find `replicas` under the `spec` section of the deployment manifest.
8. Increase the number of `replicas` by 1
9. Save the file
10. Confirm that the updated controller pods have been deployed
    ```
    $ kubectl get pods -n powermax
    NAME                                   READY   STATUS    RESTARTS   AGE
    powermax-controller-58d8779f5d-cqx8d   6/6     Running   0          22s
    powermax-controller-58d8779f5d-v7t56   6/6     Running   22         8m7s
    powermax-node-gx5pk                    3/3     Running   3          8m3s
    powermax-node-k5gwc                    3/3     Running   3          7m59s
    ```

### Running "karavictl inject" leaves the isilon-controller in a "Pending" state
This situation may occur when the number of Isilon controller pods that are deployed is equal to the number of schedulable nodes.
```
$ kubectl get pods -n isilon                                                                 

NAME                                 READY   STATUS    RESTARTS   AGE
isilon-controller-58d8779f5d-v7t56   0/6     Pending   0          25s
isilon-controller-78f749847-jqphx    5/5     Running   0          10m
isilon-controller-78f749847-w6vp5    5/5     Running   0          10m
isilon-node-gx5pk                    3/3     Running   0          21s
isilon-node-k5gwc                    3/3     Running   0          17s
```

__Resolution__

To resolve this issue, we need to temporarily reduce the number of replicas that the driver deployment is using.

1. Edit the deployment
    ```
    $ kubectl edit -n <namespace> deploy/isilon-controller
    ```

2. Find `replicas` under the `spec` section of the deployment manifest.
3. Reduce the number of `replicas` by 1
4. Save the file
5. Confirm that the updated controller pods have been deployed
    ```
    $ kubectl get pods -n isilon                                                                  

    NAME                                   READY   STATUS    RESTARTS   AGE
    isilon-controller-696cc5945f-4t94d   6/6     Running   0          4m41s
    isilon-node-mjc74                    3/3     Running   0          3m44s
    isilon-node-zgswp                    3/3     Running   0          3m44s
    ```

6. Edit the deployment again
7. Find `replicas` under the `spec` section of the deployment manifest.
8. Increase the number of `replicas` by 1
9. Save the file
10. Confirm that the updated controller pods have been deployed
    ```
    $ kubectl get pods -n isilon
    NAME                                   READY   STATUS    RESTARTS   AGE
    isilon-controller-58d8779f5d-cqx8d   6/6     Running   0          22s
    isilon-controller-58d8779f5d-v7t56   6/6     Running   22         8m7s
    isilon-node-gx5pk                    3/3     Running   3          8m3s
    isilon-node-k5gwc                    3/3     Running   3          7m59s
    ```