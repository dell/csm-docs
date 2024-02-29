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
- Observability will deploy with self-signed certificates by default. If you want to have custom certificates created instead, please generate certificates and private keys, encode them in base64, and insert them into the sample file as shown below for whichever components you are enabling. If none of the pods deploy, check the operator logs to see if there is an error with the certificates. If the pods deploy but the karavi pods never complete, check the cert-manager controller logs to see if there are issues with certificate creation.
```
    # observability: allows to configure observability
    - name: observability
...
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
- Notes:
    - If you enable `metrics-powerscale` or `metrics-powerflex`, you must enable `otel-collector` as well.
    - otel-collector cannot be enabled without a metrics component also enabled.
    - If you are deploying multiple drivers, only enable topology, otel-collector, and cert-manager in the first driver. For subsequent drivers, only enable the metrics component. When deleting the deployment, the driver that was created first must be deleted last.

## Install Observability

- Once you have prepared the sample file(s) (one per driver being installed), deploy by running `kubectl apply -f <SAMPLE FILE>` on the sample file.
