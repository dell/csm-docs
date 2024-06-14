---
title: "License"
linkTitle: "License"
weight: 6
Description: >
  Obtain trial License for Tech-preview of Dell Container Storage Modules (CSM)
---

{{% pageinfo color="primary" %}}
Application Mobility is available with [APEX Navigator for Kubernetes](https://www.dell.com/en-ca/dt/apex/storage/public-cloud/navigator.htm#kubernetes) for US-based customers. Trial licenses for Application Mobility will not be issued for US-based customers.
{{% /pageinfo %}}

The tech-preview releases of [Container Storage Modules](https://github.com/dell/csm) for Application Mobility and Encryption require a license. This section details how to request a license.

## Requesting a License
1. Request a license using the [Container Storage Modules License Request](https://app.smartsheet.com/b/form/5e46fad643874d56b1f9cf4c9f3071fb) by providing these details:
- **Full Name**: Full name of the person requesting the license
- **Email Address**: The license will be emailed to this email address
- **Company / Organization**: Company or organization where the license will be used
- **License Type**: Select either *Application Mobility* or *Encryption*, depending on the CSM module that will be used with the license
- **List of kube-system namespace UIDs**: The license will only function on the provided list of Kubernetes clusters. Find the UID of the kube-system namespace using `kubectl get ns kube-system -o yaml` or similar `oc` command. Provide as a comma separated list of UIDs.
- (Optional) **Send me a copy of my responses**: A copy of the license request will be sent to the provided email address
2. After submitting the form, a response will be provided within several business days with an attachment containing the license.
3. Refer to the specific CSM module documentation for adding the license to the Kubernetes cluster.