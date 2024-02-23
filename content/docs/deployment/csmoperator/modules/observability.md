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
- Enable Observability module and components in [sample manifests](https://github.com/dell/csm-operator/tree/main/samples). If cert-manager has already been installed, don't enable it.
- Observability will deploy with self-signed certificates by default. If you want to have custom certificates created instead, please generate certificates and private keys, encode them in base64, and insert them into the sample file as shown below for whichever components you are enabling:
```
      components:
        - name: topology
   ...
          # certificate: base64-encoded certificate for cert/private-key pair -- add cert here to use custom certificates
          #  for self-signed certs, leave empty string
          # Allowed values: string
          certificate: "<INSERT BASE64-ENCODED TOPOLOGY CERTIFICATE HERE>"
          # privateKey: base64-encoded private key for cert/private-key pair -- add private key here to use custom certificates
          #  for self-signed certs, leave empty string
          # Allowed values: string
          privateKey: "<INSERT BASE64-ENCODED TOPOLOGY PRIVATE KEY HERE>"
...
        - name: otel-collector
...
          # certificate: base64-encoded certificate for cert/private-key pair -- add cert here to use custom certificates
          #  for self-signed certs, leave empty string
          # Allowed values: string
          certificate: "<INSERT BASE64-ENCODED OTEL-COLLECTOR CERTIFICATE HERE>"
          # privateKey: base64-encoded private key for cert/private-key pair -- add private key here to use custom certificates
          #  for self-signed certs, leave empty string
          # Allowed values: string
          privateKey: "<INSERT BASE64-ENCODED OTEL-COLLECTOR PRIVATE KEY HERE>"
...
```
  - Scenario 1: Deploy one supported CSI Driver and enable Observability module
    - If you enable `metrics-powerscale` or `metrics-powerflex`, must enable `otel-collector` as well.
    
  - Scenario 2: Deploy multiple supported CSI Drivers and enable Observability module
    - When deploying the first driver, enable all components of Observability module in the CR. 
    - For the following drivers, only enable the metrics service, and remove `topology` and `otel-collector` sections from the CR.
    - The CR created first must be deleted last.

