---
title: Dell CSI Operator
description: Troubleshooting Dell CSI Operator
---

---
* Before installing the drivers, Dell CSI Operator tries to validate the Custom Resource being created. If some mandatory environment variables are missing or there is a type mismatch, then the Operator will report an error during the reconciliation attempts.  

  Because of this, the status of the Custom Resource will change to "Failed" and the error captured in the "ErrorMessage" field in the status.  

  For example - If the PowerMax driver was installed in the namespace test-powermax and has the name powermax, then run the command `kubectl get csipowermax/powermax -n test-powermax -o yaml` to get the Custom Resource details.  

  If there was an error while installing the driver, then you would see a status like this:
  
  ```yaml
  status:
    status:
      errorMessage: mandatory Env - X_CSI_K8S_CLUSTER_PREFIX not specified in user spec
      state: Failed
  ```

  The state of the Custom Resource can also change to `Failed` because of any other prohibited updates or any failure while installing the driver. In order to recover from this failure, fix the error in the manifest and update/patch the Custom Resource

* After an update to the driver, the controller pod may not have the latest desired specification.

  This happens when the controller pod was in a failed state before applying the update. Even though the Dell CSI Operator updates the pod template specification for the StatefulSet, the StatefulSet controller does not apply the update to the pod. This happens because of the unique nature of StatefulSets where the controller tries to retain the last known working state. 

  To get around this problem, the Dell CSI Operator forces an update of the pod specification by deleting the older pod. In case the Dell CSI Operator fails to do so, delete the controller pod to force an update of the controller pod specification

* The Status of the CSI Driver Custom Resource shows the state of the driver pods after installation. This state will not be updated automatically if there are any changes to the driver pods outside any Operator operations.

  At times because of inconsistencies in fetching data from the Kubernetes cache, the state of some driver pods may not be updated correctly in the status. To force an update of the state, you can update the Custom Resource forcefully by setting forceUpdate to true. If all the driver pods are in the `Available` State, then the state of the Custom Resource will be updated as `Running`
