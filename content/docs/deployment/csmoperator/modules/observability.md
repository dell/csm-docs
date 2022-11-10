---
title: Observability
linktitle: Observability
description: >
  Pre-requisite for Installing Observability via Dell CSM Operator
---

The CSM Observability module for supported Dell CSI Drivers can be installed via the Dell CSM Operator. Dell CSM Operator will deploy CSM Observability, including topology service, Otel collector, and metrics services.

## Prerequisites

- Create a namespace `karavi`
  ```
  kubectl create namespace karavi
  ```
- [Install cert-manager with Helm](https://cert-manager.io/docs/installation/helm/)
    1. Add the Helm repository
        ```
        helm repo add jetstack https://charts.jetstack.io
        ```
    2. Update your local Helm chart repository cache
        ```
        helm repo update
        ```
    3. Install cert-manager in the namespace `karavi`
        ```
        helm install \
          cert-manager jetstack/cert-manager \
          --namespace karavi \
          --version v1.10.0 \
          --set installCRDs=true
        ```
    4. Verify installation
        ```
        $ kubectl get pod -n karavi
        NAME                                      READY   STATUS    RESTARTS        AGE
        cert-manager-7b45d477c8-z28sq             1/1     Running   0               2m2s
        cert-manager-cainjector-86f7f4749-mdz7c   1/1     Running   0               2m2s
        cert-manager-webhook-66c85f8577-c7hxx     1/1     Running   0               2m2s
        ```
- Create certificates
    - Option 1: Self-signed certificates
		1. A Sample certificates manifest can be found at `samples/observability/selfsigned-cert.yaml`.
		2. Create certificates
      ```
      kubectl create -f selfsigned-cert.yaml
      ```

    - Option 2: Custom certificates
		1. Replace `tls.crt` and `tls.key` with actual base64-encoded certificate and private key in `samples/observability/custom-cert.yaml`.
		2. Create certificates
      ```
      kubectl create -f custom-cert.yaml
      ```
- Enable Observability module and components in [sample manifests](https://github.com/dell/csm-operator/tree/main/samples)
    
>Note: If you enable `metrics-powerscale` or `metrics-powerflex`, must enable `otel-collector` as well.
