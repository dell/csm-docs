---
title: Observability
linktitle: Observability
description: >
  Installing Observability via Dell CSM Operator
---

The CSM Observability module for supported Dell CSI Drivers can be installed via the Dell CSM Operator. Dell CSM Operator will deploy CSM Observability, including topology service, Otel collector, and metrics services.

## Prerequisites

- Create a namespace `karavi`
  ```bash
  kubectl create namespace karavi
  ```
- Enable Observability module and components in [sample manifests](https://github.com/dell/csm-operator/tree/main/samples)
  - Scenario 1: Deploy one supported CSI Driver and enable Observability module
    - If you enable `metrics-powerscale` or `metrics-powerflex`, must enable `otel-collector` as well.
    
  - Scenario 2: Deploy multiple supported CSI Drivers and enable Observability module
    - When deploying the first driver, enable all components of Observability module in the CR. 
    - For the following drivers, only enable the metrics service, and remove `topology` and `otel-collector` sections from the CR.
    - The CR created at first must be deleted at last.
    - 
Note: pods in the `karavi` namespace will be in the ContainerCreating state until certificates are successfully created as described in the next step.

- Create certificates

  Note: you may need to wait for the cert-manager pods to be 60-90 seconds old to successfully create certificates without an x509 error.
  
    - Option 1: Self-signed certificates
		1. A Sample certificates manifest can be found at `samples/observability/selfsigned-cert.yaml`.
		2. Create certificates
      ```bash
      kubectl create -f selfsigned-cert.yaml
      ```

    - Option 2: Custom certificates
		1. Replace `tls.crt` and `tls.key` with actual base64-encoded certificate and private key in `samples/observability/custom-cert.yaml`.
		2. Create certificates
      ```bash
      kubectl create -f custom-cert.yaml
      ```
