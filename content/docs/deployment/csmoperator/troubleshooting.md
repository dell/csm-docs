---
title: "Troubleshooting"
linkTitle: "Troubleshooting"
weight: 3
Description: >
  Troubleshooting guide
---

## Frequently Asked Questions

  - [Can CSM Operator manage existing drivers installed using Helm charts or the Dell CSI Operator?](#can-csm-operator-manage-existing-drivers-installed-using-helm-charts-or-the-dell-csi-operator)
  - [Why does some of the Custom Resource fields show up as invalid or unsupported in the OperatorHub GUI?](#why-does-some-of-the-custom-resource-fields-show-up-as-invalid-or-unsupported-in-the-operatorhub-gui)
  - [How can I view detailed logs for the CSM Operator?](#how-can-i-view-detailed-logs-for-the-csm-operator)

### Can CSM Operator manage existing drivers installed using Helm charts or the Dell CSI Operator?
The Dell CSM Operator can't manage any existing driver installed using Helm charts or the Dell CSI Operator. If you already have installed one of the Dell CSI driver in your cluster and  want to use the CSM operator based deployment, uninstall the driver and then redeploy the driver via Dell CSM Operator


### Why does some of the Custom Resource fields show up as invalid or unsupported in the OperatorHub GUI?
The Dell CSM Operator is not fully compliant with the OperatorHub React UI elements.Due to this, some of the Custom Resource fields may show up as invalid or unsupported in the OperatorHub GUI. To get around this problem, use `kubectl/oc` commands to get details about the Custom Resource(CR). This issue will be fixed in the upcoming releases of the Dell CSM Operator.

### How can I view detailed logs for the CSM Operator?
Detailed logs of the CSM Operator can be displayed using the following command:
```
kubectl logs <csm-opertaor-controller-podname> -n <namespace>
```

