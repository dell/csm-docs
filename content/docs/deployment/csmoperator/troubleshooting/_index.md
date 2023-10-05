---
title: "Troubleshooting"
linkTitle: "Troubleshooting"
Description: >
  Troubleshooting guide  for Dell CSM Operator
weight: 3
---

  - [Can CSM Operator manage existing drivers installed using Helm charts or the Dell CSI Operator?](#can-csm-operator-manage-existing-drivers-installed-using-helm-charts-or-the-dell-csi-operator)
  - [Why does some of the Custom Resource fields show up as invalid or unsupported in the OperatorHub GUI?](#why-does-some-of-the-custom-resource-fields-show-up-as-invalid-or-unsupported-in-the-operatorhub-gui)
  - [How can I view detailed logs for the CSM Operator?](#how-can-i-view-detailed-logs-for-the-csm-operator)
  - [My Dell CSI Driver install failed. How do I fix it?](#my-dell-csi-driver-install-failed-how-do-i-fix-it)

### Can CSM Operator manage existing drivers installed using Helm charts or the Dell CSI Operator?
The Dell CSM Operator is unable to manage any existing driver installed using Helm charts or the Dell CSI Operator. If you already have installed one of the Dell CSI driver in your cluster and  want to use the CSM operator based deployment, uninstall the driver and then redeploy the driver via Dell CSM Operator


### Why do some of the Custom Resource fields show up as invalid or unsupported in the OperatorHub GUI?
The Dell CSM Operator is not fully compliant with the OperatorHub React UI elements. Due to this, some of the Custom Resource fields may show up as invalid or unsupported in the OperatorHub GUI. To get around this problem, use `kubectl/oc` commands to get details about the Custom Resource(CR). This issue will be fixed in the upcoming releases of the Dell CSM Operator.

### How can I view detailed logs for the CSM Operator?
Detailed logs of the CSM Operator can be displayed using the following command:
```
kubectl logs <csm-operator-controller-podname> -n <namespace>
```

### My Dell CSI Driver install failed. How do I fix it?
Describe the current state by issuing: 
`kubectl describe csm <custom-resource-name> -n <namespace>`

In the output refer to the status and events section. If status shows pods that are in the failed state, refer to the CSI Driver Troubleshooting guide.

Example:
```
Status:
	Controller Status:
	Available: 0
	Desired: 2
	Failed: 2
	Node Status:
	Available: 0
	Desired: 2
	Failed: 2
	State: Failed

Events
	Warning Updated 67s (x15 over 2m4s) csm (combined from similar events): at 1646848059520359167 Pod error details ControllerError: ErrImagePull= pull access denied for dellem/csi-isilon, repository does not exist or may require 'docker login': denied: requested access to the resource is denied, Daemonseterror: ErrImagePull= pull access denied for dellem/csi-isilon, repository does not exist or may require 'docker login': denied: requested access to the resource is denied
```

The above event shows dellem/csi-isilon does not exist, to resolve this user can kubectl edit the csm and update to correct image.


To get details of driver installation: `kubectl logs <dell-csm-operator-controller-manager-pod> -n dell-csm-operator`.

Typical reasons for errors:
* Incorrect driver version 
* Incorrect driver type
* Incorrect driver Spec env, args for containers
* Incorrect RBAC permissions
	
