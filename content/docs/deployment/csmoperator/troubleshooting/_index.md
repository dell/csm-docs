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


### Why does some of the Custom Resource fields show up as invalid or unsupported in the OperatorHub GUI?
The Dell CSM Operator is not fully compliant with the OperatorHub React UI elements.Due to this, some of the Custom Resource fields may show up as invalid or unsupported in the OperatorHub GUI. To get around this problem, use `kubectl/oc` commands to get details about the Custom Resource(CR). This issue will be fixed in the upcoming releases of the Dell CSM Operator.

### How can I view detailed logs for the CSM Operator?
Detailed logs of the CSM Operator can be displayed using the following command:
```
kubectl logs <csm-operator-controller-podname> -n <namespace>
```

### My Dell CSI Driver install failed. How do I fix it?
TODO